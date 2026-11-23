'use client';

import { useActionState } from 'react';

import { deleteRecord } from '@/app/dashboard/actions';

export function DeleteButton({
  table,
  id,
  label = 'Delete',
  entity,
}: {
  table: string;
  id: string;
  label?: string;
  entity?: string;
}) {
  const [state, formAction, pending] = useActionState(deleteRecord, {});

  const names: Record<string, string> = {
    projects: 'project',
    services: 'service',
    testimonials: 'testimonial',
    site_stats: 'stat',
    inquiries: 'inquiry',
  };

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!confirm(`Delete this ${entity ?? names[table] ?? 'record'}?`)) {
          event.preventDefault();
        }
      }}
      className="inline"
    >
      <input type="hidden" name="table" value={table} />
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        title={state.error ?? 'Delete'}
        className="rounded-full border border-red-400/40 px-3 py-1.5 text-xs uppercase tracking-[0.15em] text-red-300 transition hover:bg-red-400/15 disabled:opacity-50"
      >
        {pending ? '…' : label}
      </button>
    </form>
  );
}
