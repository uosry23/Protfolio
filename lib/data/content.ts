import 'server-only';

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

/**
 * Reads the whole site from Supabase.
 *
 * Projects, services, testimonials, stats, settings and copy all come from
 * the database. Nothing is filled in from `content/site.json`.
 */
async function loadSiteContent(): Promise<SiteContent> {
  const supabase = createPublicClient();

  const [projects, services, testimonials, stats, settings] = await Promise.all([
    supabase.from('projects').select('*').eq('published', true).order('sort_order', { ascending: true }),
    supabase.from('services').select('*').eq('published', true).order('sort_order', { ascending: true }),
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

  const settingsRows = (settings.data ?? []) as unknown as { key: string; value: unknown }[];
  const settingsRow = settingsRows.find((row) => row.key === 'site')?.value;
  const copyRow = settingsRows.find((row) => row.key === 'copy')?.value;

  if (!settingsRow) throw new Error('Missing site_settings row with key "site".');
  if (!copyRow) throw new Error('Missing site_settings row with key "copy".');

  return {
    projects: (projects.data ?? []) as unknown as Project[],
    services: (services.data ?? []) as unknown as Service[],
    testimonials: (testimonials.data ?? []) as unknown as Testimonial[],
    stats: (stats.data ?? []) as unknown as Stat[],
    settings: settingsRow as SiteSettings,
    copy: copyRow as SiteCopy,
  };
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
