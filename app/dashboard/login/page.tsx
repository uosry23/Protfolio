import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { LoginForm } from '@/components/dashboard/LoginForm';
import { getAdminUser } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Dashboard sign in',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const user = await getAdminUser();
  if (user) redirect('/dashboard');

  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <p className="text-xs uppercase tracking-[0.3em] text-accent-1">Yousry Ahmed</p>
        <h1 className="mt-3 font-display text-5xl uppercase leading-none text-ink">
          Control
          <br />
          panel
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Sign in to edit the projects, services, copy and settings of the site. Everything you
          change is written to Supabase and goes live within a minute.
        </p>

        <div className="mt-8 rounded-2xl border border-line bg-white/[0.03] p-6 backdrop-blur">
          <LoginForm configured={configured} />
        </div>

        <Link
          href="/"
          className="mt-6 inline-block text-xs uppercase tracking-[0.2em] text-muted transition hover:text-accent-1"
        >
          ← Back to the site
        </Link>
      </div>
    </main>
  );
}
