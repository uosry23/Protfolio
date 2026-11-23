import 'server-only';

import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

export type AdminUser = {
  id: string;
  email: string;
};

/**
 * The list of emails allowed into the dashboard.
 *
 * `ADMIN_EMAILS` is a comma-separated list. When it is empty every signed-in
 * user is allowed — convenient for a single-owner self-hosted site, but set it
 * in production so nobody else can sign up on the Supabase project and edit
 * the content.
 */
export function adminEmails() {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | undefined | null) {
  if (!email) return false;
  const allowed = adminEmails();
  if (allowed.length === 0) return true;
  return allowed.includes(email.toLowerCase());
}

/**
 * Returns the signed-in admin, or `null`.
 *
 * The session is read from the request cookies with the anon key, so Supabase
 * still applies its own token validation — a forged cookie is rejected.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  let supabase: Awaited<ReturnType<typeof createClient>>;

  try {
    supabase = await createClient();
  } catch {
    // Supabase is not configured — there is no session to check.
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;
  if (!isAdminEmail(user.email)) return null;

  return { id: user.id, email: user.email };
}

/** Same as `getAdminUser`, but redirects to the login page when there is none. */
export async function requireAdmin(): Promise<AdminUser> {
  const user = await getAdminUser();
  if (!user) redirect('/dashboard/login');
  return user;
}
