import 'server-only';

import { createClient } from '@supabase/supabase-js';

import type { Database } from './types';

/**
 * Public (anon-key) client used for the read path.
 *
 * Two deliberate choices:
 *
 * 1. It does NOT bind the request cookies — every row the site reads is
 *    public and RLS-protected, so the response can be cached and shared
 *    between requests instead of being re-fetched on every page view.
 *
 * 2. Every fetch opts out of Next's fetch cache (`cache: 'no-store'`).
 *    Without this, Next would serve the REST responses it captured during
 *    the build and the site would keep showing stale content forever.
 *    Freshness is controlled by the data cache in `lib/data/content.ts`.
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.local.',
    );
  }

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
    },
  });
}
