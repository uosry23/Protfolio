'use client';

import { useActionState } from 'react';

import { signIn } from '@/app/dashboard/actions';

export function LoginForm({ configured }: { configured: boolean }) {
  const [state, formAction, pending] = useActionState(signIn, {});

  if (!configured) {
    return (
      <div className="rounded-2xl border border-red-400/40 bg-red-400/10 p-5 text-sm text-red-300">
        <p className="font-semibold uppercase tracking-[0.18em]">Supabase is not configured</p>
        <p className="mt-2 leading-relaxed text-ink/80">
          Copy <code className="text-accent-2">.env.example</code> to{' '}
          <code className="text-accent-2">.env.local</code> and add your project URL, the anon key
          and the service-role key. Then create a user in Supabase → Authentication → Users.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-xs uppercase tracking-[0.2em] text-muted"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className="mt-2 w-full rounded-xl border border-line bg-bg-deep px-4 py-3 text-sm text-ink outline-none transition focus:border-accent-1"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-xs uppercase tracking-[0.2em] text-muted"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="mt-2 w-full rounded-xl border border-line bg-bg-deep px-4 py-3 text-sm text-ink outline-none transition focus:border-accent-1"
        />
      </div>

      {state.error ? (
        <p className="rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-accent-1 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-bg-deep transition hover:bg-accent-2 disabled:opacity-60"
      >
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
