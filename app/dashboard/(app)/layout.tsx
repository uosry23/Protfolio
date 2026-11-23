import Link from 'next/link';

import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { requireAdmin } from '@/lib/auth';
import { signOut } from '@/app/dashboard/actions';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  /*
   * The dashboard writes with the service-role key. Without it the admin
   * client cannot be created, so say it plainly instead of crashing.
   */
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || serviceKey.startsWith('sb_publishable_')) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <div className="max-w-lg rounded-2xl border border-red-400/40 bg-red-400/10 p-8">
          <h1 className="font-display text-3xl uppercase text-red-300">Not configured</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink/80">
            The dashboard needs a server-side Supabase secret key to read and save site content.{' '}
            <code className="text-accent-2">SUPABASE_SERVICE_ROLE_KEY</code> currently contains a
            publishable key or is missing. In Supabase, create or copy a secret key from Project
            Settings → API Keys, put it in <code className="text-accent-2">.env.local</code>, and
            restart the server. Never share the secret key in chat or commit it.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block text-xs uppercase tracking-[0.2em] text-muted transition hover:text-accent-1"
          >
            ← Back to the site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="font-display text-xl uppercase tracking-wide text-ink"
            >
              YA <span className="text-accent-1">Control</span>
            </Link>
            <span className="hidden text-xs uppercase tracking-[0.2em] text-muted sm:inline">
              dashboard
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-full border border-line px-4 py-2 text-xs uppercase tracking-[0.18em] text-muted transition hover:border-accent-1 hover:text-accent-1"
            >
              View site
            </Link>
            <span className="hidden text-xs text-muted sm:inline">{user.email}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-full bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.18em] text-ink transition hover:bg-white/10"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] gap-6 px-4 py-6 lg:grid-cols-[220px_1fr] lg:px-8">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <DashboardNav />
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
