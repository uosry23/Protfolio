-- The public site reads these tables with Supabase's anon key.
-- RLS policies alone are not enough; anon also needs table-level SELECT.
grant usage on schema public to anon, authenticated;
grant select on public.projects, public.services, public.testimonials,
  public.site_stats, public.site_settings to anon, authenticated;
