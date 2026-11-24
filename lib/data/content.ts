import 'server-only';

import fallback from '@/content/site.json';

import { createPublicClient } from '@/lib/supabase/public';
import type {
  Project,
  Service,
  SiteContent,
  SiteCopy,
  SiteSettings,
  Stat,
  Testimonial,
} from '@/lib/types';

export const fallbackContent: SiteContent = {
  projects: fallback.projects.map((p, index) => ({
    id: p.slug,
    slug: p.slug,
    title: p.title,
    tagline: p.tagline,
    url: p.url,
    code_url: p.code_url ?? null,
    accent: p.accent,
    image_path: p.image_path,
    image_source: (p.image_source as Project['image_source']) ?? 'local',
    tech: p.tech,
    sort_order: p.sort_order ?? index + 1,
  })),
  services: fallback.services.map((s, index) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    tags: s.tags,
    sort_order: s.sort_order ?? index + 1,
  })),
  testimonials: fallback.testimonials.map((t, index) => ({
    id: t.id,
    name: t.name,
    role: t.role,
    message: t.message,
    sort_order: t.sort_order ?? index + 1,
  })),
  stats: fallback.stats.map((s, index) => ({
    id: s.id,
    label: s.label,
    value: s.value,
    suffix: s.suffix,
    sort_order: s.sort_order ?? index + 1,
  })),
  settings: fallback.settings as SiteSettings,
  copy: fallback.copy as SiteCopy,
};

/** Merges one copy group with its backend version, group by group. */
function mergeCopy(base: SiteCopy, patch: Partial<SiteCopy> | undefined): SiteCopy {
  if (!patch) return base;
  return {
    seo: { ...base.seo, ...(patch.seo ?? {}) },
    hero: { ...base.hero, ...(patch.hero ?? {}) },
    work: { ...base.work, ...(patch.work ?? {}) },
    about: { ...base.about, ...(patch.about ?? {}) },
    course: { ...base.course, ...(patch.course ?? {}) },
    services: { ...base.services, ...(patch.services ?? {}) },
    consultation: { ...base.consultation, ...(patch.consultation ?? {}) },
    contact: { ...base.contact, ...(patch.contact ?? {}) },
    system: { ...base.system, ...(patch.system ?? {}) },
    footer: { ...base.footer, ...(patch.footer ?? {}) },
    form: { ...base.form, ...(patch.form ?? {}) },
  };
}

function isConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Reads the whole site content from Supabase.
 *
 * Falls back to the bundled JSON (`content/site.json`) whenever Supabase is
 * not configured or the request fails — the site must never hard-crash
 * because of a backend hiccup.
 */
async function loadSiteContent(): Promise<SiteContent> {
  if (!isConfigured()) return fallbackContent;

  try {
    const supabase = createPublicClient();

    const [projects, services, testimonials, stats, settings] = await Promise.all([
      supabase
        .from('projects')
        .select('*')
        .eq('published', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('services')
        .select('*')
        .eq('published', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('testimonials')
        .select('*')
        .eq('published', true)
        .order('sort_order', { ascending: true }),
      supabase.from('site_stats').select('*').eq('published', true).order('sort_order'),
      supabase.from('site_settings').select('*'),
    ]);

    const firstError = [projects, services, testimonials, stats, settings].find((r) => r.error)?.error;
    if (firstError) throw firstError;

    /* `site_settings` is a key/value table: `site` holds the settings blob,
       `copy` holds every piece of text rendered by the UI. */
    const settingsRows = (settings.data ?? []) as unknown as { key: string; value: unknown }[];
    const settingsRow = settingsRows.find((row) => row.key === 'site')?.value as
      | Partial<SiteSettings>
      | undefined;
    const copyRow = settingsRows.find((row) => row.key === 'copy')?.value as
      | Partial<SiteCopy>
      | undefined;

    return {
      projects: (projects.data ?? []) as unknown as Project[],
      services: (services.data ?? []) as unknown as Service[],
      testimonials: (testimonials.data ?? []) as unknown as Testimonial[],
      stats: (stats.data ?? []) as unknown as Stat[],
      settings: { ...fallbackContent.settings, ...(settingsRow ?? {}) },
      copy: mergeCopy(fallbackContent.copy, copyRow),
    };
  } catch (error) {
    console.error('[content] Supabase unavailable, using bundled fallback:', error);
    return fallbackContent;
  }
}

/**
 * How often the site re-reads the backend, in seconds.
 * `CONTENT_REVALIDATE=0` reads fresh on every request.
 */
const revalidateMs = Number(process.env.CONTENT_REVALIDATE ?? 60) * 1000;

/**
 * In-memory copy of the site payload.
 *
 * Deliberately not `unstable_cache()`: that one is written to disk during
 * `next build`, which would bake the build-time content into the deployment
 * and keep serving it long after the database changed. This one only ever
 * lives in the running process.
 */
let cache: { value: SiteContent; expiresAt: number } | null = null;

/**
 * The single entry point every server component uses.
 *
 * The layout, the metadata and the page all share it, so the site asks
 * Supabase once per `CONTENT_REVALIDATE` window instead of once per visitor.
 * Edit a row in the Supabase dashboard and it is live within that window —
 * no redeploy.
 */
export async function getSiteContent(): Promise<SiteContent> {
  const now = Date.now();

  if (cache && cache.expiresAt > now) return cache.value;

  const value = await loadSiteContent();

  cache = { value, expiresAt: now + revalidateMs };

  return value;
}

/**
 * Drops the cached payload so the next request reads the backend again.
 *
 * Called by the dashboard after every edit — without it the site would keep
 * serving the old content for up to `CONTENT_REVALIDATE` seconds.
 */
export function invalidateSiteContent() {
  cache = null;
}
