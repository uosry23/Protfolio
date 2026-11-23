'use client';

import { useEffect } from 'react';

import { useSiteContext } from '@/lib/content-context';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const site = useSiteContext();
  const copy = site?.copy.system;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70svh] flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-[22vw] leading-none text-ink/10 md:text-[12rem]">500</p>
      <h1 className="-mt-6 font-display text-2xl uppercase text-ink md:text-3xl">
        {copy?.errorTitle ?? 'Something broke'}
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
        {copy?.errorBody}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent-1 px-6 py-3 text-sm uppercase tracking-[0.18em] text-bg-deep"
      >
        {copy?.errorRetry ?? 'Try again'}
      </button>
    </div>
  );
}
