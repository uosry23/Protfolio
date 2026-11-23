import { createBrowserClient } from '@supabase/ssr';

import type { Database } from './types';

let cached: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Browser-side Supabase client (anon key only — never the service role key).
 * Cached so the client is reused across renders.
 */
export function createClient() {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.local.',
    );
  }

  cached = createBrowserClient<Database>(url, key);
  return cached;
}
