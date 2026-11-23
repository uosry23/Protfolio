-- ═══════════════════════════════════════════════════════════════════
--  Supabase schema for the Yousry Ahmed portfolio
--  Run this once in the Supabase SQL editor (or `supabase db push`).
-- ═══════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ─── Projects ────────────────────────────────────────────────────────
create table if not exists public.projects (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  tagline      text,
  url          text,
  accent       text not null default '#35e4a3',
  image_path   text,
  image_source text not null default 'local' check (image_source in ('local', 'supabase')),
  tech         text[] not null default '{}',
  sort_order   integer not null default 0,
  published    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ─── Services ────────────────────────────────────────────────────────
-- `id` is a stable text key (the same id used in content/site.json) so the
-- seed script can upsert on it.
create table if not exists public.services (
  id          text primary key,
  title       text not null,
  description text not null,
  tags        text[] not null default '{}',
  sort_order  integer not null default 0,
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ─── Testimonials ────────────────────────────────────────────────────
create table if not exists public.testimonials (
  id         text primary key,
  name       text not null,
  role       text,
  message    text not null,
  sort_order integer not null default 0,
  published  boolean not null default true,
  created_at timestamptz not null default now()
);

-- ─── Stats ───────────────────────────────────────────────────────────
create table if not exists public.site_stats (
  id         text primary key,
  label      text not null,
  value      integer not null default 0,
  suffix     text not null default '',
  sort_order integer not null default 0,
  published  boolean not null default true
);

-- ─── Key/value settings (one row: key = 'site') ─────────────────────
create table if not exists public.site_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

-- ─── Contact form submissions ────────────────────────────────────────
create table if not exists public.inquiries (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  whatsapp     text not null,
  country_code text not null default '',
  country      text,
  project_type text,
  budget       text,
  message      text,
  created_at   timestamptz not null default now()
);

create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);
create index if not exists projects_sort_order_idx on public.projects (sort_order);

-- ═══════════════════════════════════════════════════════════════════
--  Upgrade path for databases created before the ids became text.
--  Safe to re-run: converting text to text is a no-op.
-- ═══════════════════════════════════════════════════════════════════
alter table public.services     alter column id drop default;
alter table public.services     alter column id type text using id::text;
alter table public.testimonials alter column id drop default;
alter table public.testimonials alter column id type text using id::text;
alter table public.site_stats   alter column id drop default;
alter table public.site_stats   alter column id type text using id::text;

-- ═══════════════════════════════════════════════════════════════════
--  Row Level Security
-- ═══════════════════════════════════════════════════════════════════
alter table public.projects       enable row level security;
alter table public.services       enable row level security;
alter table public.testimonials   enable row level security;
alter table public.site_stats     enable row level security;
alter table public.site_settings  enable row level security;
alter table public.inquiries      enable row level security;

-- Public (anon) read access for published content.
drop policy if exists "projects are public" on public.projects;
create policy "projects are public" on public.projects
  for select to anon, authenticated using (published = true);

drop policy if exists "services are public" on public.services;
create policy "services are public" on public.services
  for select to anon, authenticated using (published = true);

drop policy if exists "testimonials are public" on public.testimonials;
create policy "testimonials are public" on public.testimonials
  for select to anon, authenticated using (published = true);

drop policy if exists "stats are public" on public.site_stats;
create policy "stats are public" on public.site_stats
  for select to anon, authenticated using (published = true);

drop policy if exists "settings are public" on public.site_settings;
create policy "settings are public" on public.site_settings
  for select to anon, authenticated using (true);

-- Inquiries and dashboard writes happen on the server with the service-role key.
-- The public API cannot read or write inquiries.
drop policy if exists "inquiries are admin only" on public.inquiries;
create policy "inquiries are admin only" on public.inquiries
  for all to service_role using (true) with check (true);

-- ═══════════════════════════════════════════════════════════════════
--  Dashboard writes use the server-only service-role key after the app's admin guard.
--  Do not add broad authenticated write policies here: any signed-in account could edit content.
-- ═══════════════════════════════════════════════════════════════════
drop policy if exists "admins can edit projects" on public.projects;

drop policy if exists "admins can edit services" on public.services;

drop policy if exists "admins can edit testimonials" on public.testimonials;

drop policy if exists "admins can edit stats" on public.site_stats;

drop policy if exists "admins can edit settings" on public.site_settings;

-- ═══════════════════════════════════════════════════════════════════
--  Storage — the project cover images uploaded from the dashboard.
-- ═══════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "project images are public" on storage.objects;
create policy "project images are public" on storage.objects
  for select using (bucket_id = 'project-images');

drop policy if exists "admins can upload project images" on storage.objects;

drop policy if exists "admins can manage project images" on storage.objects;

drop policy if exists "admins can delete project images" on storage.objects;
