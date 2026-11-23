'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { requireAdmin } from '@/lib/auth';
import { invalidateSiteContent } from '@/lib/data/content';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Json } from '@/lib/supabase/types';

export type ActionState = {
  ok?: boolean;
  error?: string;
  message?: string;
  /** Public URL returned by the image upload. */
  url?: string;
};

/* ────────────────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────────────────── */

/** Runs an action behind the admin guard and normalises the result. */
async function withAdmin(
  run: () => Promise<{ error: { message: string } | null }>,
  successMessage: string,
): Promise<ActionState> {
  await requireAdmin();

  try {
    const { error } = await run();
    if (error) return { ok: false, error: error.message };

    invalidateSiteContent();
    revalidatePath('/', 'layout');
    revalidatePath('/dashboard');

    return { ok: true, message: successMessage };
  } catch (cause) {
    console.error('[dashboard] action failed:', cause);
    return {
      ok: false,
      error:
        cause instanceof z.ZodError
          ? cause.issues.map((issue) => issue.message).join(' ')
          : cause instanceof Error
            ? cause.message
            : 'Something went wrong.',
    };
  }
}

/** Parses a JSON payload sent by the dashboard forms. */
function parseJson(raw: FormDataEntryValue | null): unknown {
  if (typeof raw !== 'string') throw new Error('Missing payload.');
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('The form data could not be read.');
  }
}

/* ────────────────────────────────────────────────────────────────────────
   Authentication
   ──────────────────────────────────────────────────────────────────────── */

export async function signIn(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { ok: false, error: 'Enter your email and password.' };
  }

  let supabase: Awaited<ReturnType<typeof createServerAuthClient>>;

  try {
    supabase = await createServerAuthClient();
  } catch {
    return {
      ok: false,
      error: 'Supabase is not configured. Add the keys to .env.local first.',
    };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false, error: 'Wrong email or password.' };
  }

  redirect('/dashboard');
}

export async function signOut() {
  const supabase = await createServerAuthClient();
  await supabase.auth.signOut();
  redirect('/dashboard/login');
}

/** The cookie-bound client — imported lazily so `signIn` can use it. */
async function createServerAuthClient() {
  const { createClient } = await import('@/lib/supabase/server');
  return createClient();
}

/* ────────────────────────────────────────────────────────────────────────
   Settings + copy (the two key/value blobs)
   ──────────────────────────────────────────────────────────────────────── */

export async function saveSettings(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const settings = parseJson(formData.get('payload')) as Json;

  return withAdmin(async () => {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'site', value: settings }, { onConflict: 'key' });
    return { error };
  }, 'Settings saved.');
}

export async function saveCopy(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const copy = parseJson(formData.get('payload')) as Json;

  return withAdmin(async () => {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'copy', value: copy }, { onConflict: 'key' });
    return { error };
  }, 'Content saved.');
}

/* ────────────────────────────────────────────────────────────────────────
   Records — projects, services, testimonials, stats
   ──────────────────────────────────────────────────────────────────────── */

const requiredText = (message: string) =>
  z.preprocess((value) => value ?? '', z.string().trim().min(1, message));

const projectSchema = z.object({
  slug: requiredText('The slug is required.'),
  title: requiredText('The title is required.'),
  tagline: z.string().trim().nullish(),
  url: z.string().trim().nullish(),
  accent: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() ? value : '#35e4a3'),
    z.string().trim(),
  ),
  image_path: z.string().trim().nullish(),
  image_source: z.enum(['local', 'supabase']).default('local'),
  tech: z.array(z.string().trim()).default([]),
  sort_order: z.coerce.number().int().default(0),
  published: z.coerce.boolean().default(true),
});

const serviceSchema = z.object({
  id: requiredText('The id is required.'),
  title: requiredText('The title is required.'),
  description: requiredText('The description is required.'),
  tags: z.array(z.string().trim()).default([]),
  sort_order: z.coerce.number().int().default(0),
  published: z.coerce.boolean().default(true),
});

const testimonialSchema = z.object({
  id: requiredText('The id is required.'),
  name: requiredText('The name is required.'),
  role: z.string().trim().nullish(),
  message: requiredText('The message is required.'),
  sort_order: z.coerce.number().int().default(0),
  published: z.coerce.boolean().default(true),
});

const statSchema = z.object({
  id: requiredText('The id is required.'),
  label: requiredText('The label is required.'),
  value: z.coerce.number().int().default(0),
  suffix: z.string().trim().default(''),
  sort_order: z.coerce.number().int().default(0),
  published: z.coerce.boolean().default(true),
});

type Table = 'projects' | 'services' | 'testimonials' | 'site_stats' | 'inquiries';

/** The tables the dashboard is allowed to delete from. */
const deleteable: Table[] = [
  'projects',
  'services',
  'testimonials',
  'site_stats',
  'inquiries',
];

export async function saveRecord(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const table = String(formData.get('table') ?? '');
  const mode = String(formData.get('mode') ?? 'create');
  const id = String(formData.get('id') ?? '');
  const payload = parseJson(formData.get('payload'));

  return withAdmin(async () => {
    const supabase = createAdminClient();

    /* Each table gets its own typed call — the payload shape is validated by
       zod first, so the database never sees a half-filled row. */
    switch (table) {
      case 'projects': {
        const record = projectSchema.parse(payload);
        const query =
          mode === 'edit' && id
            ? supabase.from('projects').update(record).eq('id', id)
            : supabase.from('projects').insert(record);
        const { error } = await query;
        return { error };
      }
      case 'services': {
        const record = serviceSchema.parse(payload);
        const { error } = await supabase.from('services').upsert(record, { onConflict: 'id' });
        return { error };
      }
      case 'testimonials': {
        const record = testimonialSchema.parse(payload);
        const { error } = await supabase
          .from('testimonials')
          .upsert(record, { onConflict: 'id' });
        return { error };
      }
      case 'site_stats': {
        const record = statSchema.parse(payload);
        const { error } = await supabase.from('site_stats').upsert(record, { onConflict: 'id' });
        return { error };
      }
      default:
        return { error: { message: 'Unknown table.' } };
    }
  }, mode === 'edit' ? 'Changes saved.' : 'Created.');
}

export async function deleteRecord(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const table = String(formData.get('table') ?? '') as Table;
  const id = String(formData.get('id') ?? '');

  if (!deleteable.includes(table) || !id) {
    return { ok: false, error: 'Nothing to delete.' };
  }

  return withAdmin(async () => {
    const supabase = createAdminClient();
    const { error } = await supabase.from(table).delete().eq('id', id);
    return { error };
  }, 'Deleted.');
}

/* ────────────────────────────────────────────────────────────────────────
   Project images → Supabase Storage
   ──────────────────────────────────────────────────────────────────────── */

const BUCKET = 'project-images';

export async function uploadProjectImage(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: 'Pick an image first.' };
  }

  if (!file.type.startsWith('image/')) {
    return { ok: false, error: 'That file is not an image.' };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { ok: false, error: 'The image must be smaller than 5 MB.' };
  }

  const supabase = createAdminClient();
  const extension = (file.name.split('.').pop() ?? 'webp').toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension || 'webp'}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '31536000',
    contentType: file.type,
    upsert: true,
  });

  if (error) {
    return {
      ok: false,
      error: `Upload failed: ${error.message}. Did you create the "${BUCKET}" bucket?`,
    };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return { ok: true, message: 'Image uploaded.', url: data.publicUrl };
}
