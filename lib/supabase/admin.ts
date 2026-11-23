import 'server-only';

import { createClient } from '@supabase/supabase-js';

import type { Database } from './types';

/**
 * Service-role client — server-side only, never exposed to the browser.
 * Used for writes that must not depend on the anonymous RLS role.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  }

  if (key.startsWith('sb_publishable_')) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is a publishable key. Use a server-side secret key (sb_secret_…) from Supabase API Keys.',
    );
  }

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
