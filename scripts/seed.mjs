/**
 * Seeds Supabase with the content defined in `content/site.json`.
 *
 *   cp .env.example .env.local      # fill in the keys
 *   npm run seed
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY — the anon key cannot write.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

/** Minimal .env.local loader (no dependency). */
async function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    try {
      const raw = await fs.readFile(path.join(root, file), 'utf8');
      for (const line of raw.split('\n')) {
        const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (!match) continue;
        const [, key, rawValue] = match;
        if (process.env[key]) continue;
        process.env[key] = rawValue.replace(/^["']|["']$/g, '');
      }
    } catch {
      /* file not present — ignore */
    }
  }
}

await loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    '\n✖ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n' +
      '  Copy .env.example → .env.local and fill in the values.\n',
  );
  process.exit(1);
}

if (serviceKey.startsWith('sb_publishable_')) {
  console.error(
    '\n✖ SUPABASE_SERVICE_ROLE_KEY contains a publishable key. Use a server-side secret key from Supabase Project Settings → API Keys.\n',
  );
  process.exit(1);
}

const content = JSON.parse(await fs.readFile(path.join(root, 'content/site.json'), 'utf8'));
const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function upsert(table, rows, conflict) {
  const { error } = await supabase.from(table).upsert(rows, { onConflict: conflict });
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`✓ ${table} — ${rows.length} row(s)`);
}

try {
  await upsert(
    'projects',
    content.projects.map((project, index) => ({
      slug: project.slug,
      title: project.title,
      tagline: project.tagline,
      url: project.url,
      code_url: project.code_url ?? null,
      accent: project.accent,
      image_path: project.image_path,
      image_source: project.image_source,
      tech: project.tech,
      sort_order: project.sort_order ?? index + 1,
      published: true,
    })),
    'slug',
  );

  await upsert(
    'services',
    content.services.map((service, index) => ({
      id: service.id,
      title: service.title,
      description: service.description,
      tags: service.tags,
      sort_order: service.sort_order ?? index + 1,
      published: true,
    })),
    'id',
  );

  await upsert(
    'testimonials',
    content.testimonials.map((testimonial, index) => ({
      id: testimonial.id,
      name: testimonial.name,
      role: testimonial.role,
      message: testimonial.message,
      sort_order: testimonial.sort_order ?? index + 1,
      published: true,
    })),
    'id',
  );

  await upsert(
    'site_stats',
    content.stats.map((stat, index) => ({
      id: stat.id,
      label: stat.label,
      value: stat.value,
      suffix: stat.suffix,
      sort_order: stat.sort_order ?? index + 1,
      published: true,
    })),
    'id',
  );

  /* `site_settings` is a key/value table:
     - `site`  → the settings blob (name, whatsapp, socials, nav links…)
     - `copy`  → every piece of text rendered by the UI
     Both live in the backend, so the whole site can be edited from Supabase. */
  await upsert('site_settings', [{ key: 'site', value: content.settings }], 'key');
  await upsert('site_settings', [{ key: 'copy', value: content.copy }], 'key');

  console.log('\n✔ Seed complete.\n');
} catch (error) {
  console.error('\n✖ Seed failed:', error.message, '\n');
  process.exit(1);
}
