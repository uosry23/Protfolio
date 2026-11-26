import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import type { Project, Service, SiteCopy, SiteSettings, Stat, Testimonial } from '@/lib/types';

export type Inquiry = {
  id: string;
  name: string;
  whatsapp: string;
  country_code: string;
  country: string | null;
  project_type: string | null;
  budget: string | null;
  message: string | null;
  created_at: string;
};

/**
 * Dashboard-only data access.
 *
 * It uses the service-role client, so it sees unpublished rows and the
 * inquiries table — both are invisible to the public read path. Every call
 * happens on the server, behind the admin guard in `lib/auth.ts`.
 */

export async function getDashboardData() {
  const supabase = createAdminClient();

  const [projects, services, testimonials, stats, settings, inquiries] = await Promise.all([
    supabase.from('projects').select('*').order('sort_order', { ascending: true }),
    supabase.from('services').select('*').order('sort_order', { ascending: true }),
    supabase.from('testimonials').select('*').order('sort_order', { ascending: true }),
    supabase.from('site_stats').select('*').order('sort_order', { ascending: true }),
    supabase.from('site_settings').select('*'),
    supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  const settingsRows = (settings.data ?? []) as unknown as { key: string; value: unknown }[];

  const firstError = [projects, services, testimonials, stats, settings, inquiries].find(
    (result) => result.error,
  )?.error;

  if (firstError) {
    console.error('[dashboard] could not read the backend:', firstError);
  }

  return {
    projects: (projects.data ?? []) as unknown as (Project & { published: boolean })[],
    services: (services.data ?? []) as unknown as (Service & { published: boolean })[],
    testimonials: (testimonials.data ?? []) as unknown as (Testimonial & { published: boolean })[],
    stats: (stats.data ?? []) as unknown as (Stat & { published: boolean })[],
    settings: (settingsRows.find((row) => row.key === 'site')?.value ?? {}) as SiteSettings,
    copy: (settingsRows.find((row) => row.key === 'copy')?.value ?? {}) as SiteCopy,
    inquiries: (inquiries.data ?? []) as unknown as Inquiry[],
    error: firstError?.message ?? null,
  };
}
