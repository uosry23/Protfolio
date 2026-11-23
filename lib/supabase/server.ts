import { createServerClient } from '@supabase/ssr';
import type { CookieMethodsServer } from '@supabase/ssr';
import { cookies } from 'next/headers';

import type { Database } from './types';

/**
 * Server-side Supabase client bound to the request cookies.
 * Uses the anon key by default (respects RLS).
 *
 * Reserved for anything that needs the visitor's session. The content read
 * path uses `lib/supabase/public.ts` instead — it needs no cookies, so its
 * response can be cached and shared between requests.
 */
export async function createClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.local.',
    );
  }

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet) {
      try {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      } catch {
        // Called from a Server Component — cookies are read-only there.
        // Safe to ignore: the site does not rely on auth sessions.
      }
    },
  };

  return createServerClient<Database>(url, key, { cookies: cookieMethods });
}
