'use client';

import { useActionState, useState } from 'react';

import { saveRecord } from '@/app/dashboard/actions';

import { ImageUploader } from './ImageUploader';

import type { FieldDef } from './fields';

type Props = {
  table: string;
  mode: 'create' | 'edit';
  record?: Record<string, unknown> | null;
  fields: FieldDef[];
  /** Extra fields rendered by the table (e.g. the project image picker). */
  extra?: React.ReactNode;
  onDone?: () => void;
};

const inputClass =
  'mt-2 w-full rounded-xl border border-line bg-bg-deep px-4 py-3 text-sm text-ink outline-none transition focus:border-accent-1';

export function RecordEditor({ table, mode, record, fields, extra, onDone }: Props) {
  const [state, formAction, pending] = useActionState(saveRecord, {});
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    for (const field of fields) {
      const raw = record?.[field.name];
      if (field.type === 'tags') {
        initial[field.name] = Array.isArray(raw) ? raw.join('\n') : '';
      } else if (field.type === 'boolean') {
        // A new record is live by default — the owner can unpublish it.
        initial[field.name] = raw === undefined ? mode === 'create' : Boolean(raw);
      } else {
        initial[field.name] = raw ?? '';
      }
    }
    return initial;
  });

  const set = (name: string, value: unknown) =>
    setValues((prev) => ({ ...prev, [name]: value }));

  /** Serialises the form state into the shape the action expects. */
  const payload = (() => {
    const out: Record<string, unknown> = {};
    for (const field of fields) {
      const value = values[field.name];
      if (field.type === 'tags') {
        out[field.name] = String(value ?? '')
          .split('\n')
          .map((tag) => tag.trim())
          .filter(Boolean);
      } else if (field.type === 'boolean') {
        out[field.name] = Boolean(value);
      } else if (field.type === 'number') {
        out[field.name] = Number(value ?? 0);
      } else {
        const text = String(value ?? '').trim();
        out[field.name] = text === '' ? null : text;

        // An uploaded cover comes from Supabase Storage, not from /public.
        if (field.name === 'image_path') {
          out.image_source = text ? 'supabase' : 'local';
        }
      }
    }
    return out;
  })();

  return (
    <form action={formAction} className="space-y-5">
      {/* `readOnly` + `onChange` keeps the fields controlled: React only tags
          *uncontrolled* fields inside a form with a server action with a
          server-only marker, which the client render does not reproduce. */}
      <input type="hidden" name="table" value={table} readOnly suppressHydrationWarning />
      <input type="hidden" name="mode" value={mode} readOnly suppressHydrationWarning />
      <input
        type="hidden"
        name="id"
        value={String(record?.id ?? '')}
        readOnly
        suppressHydrationWarning
      />
      <input
        type="hidden"
        name="payload"
        value={JSON.stringify(payload)}
        readOnly
        suppressHydrationWarning
      />

      {fields.map((field) => (
        <div key={field.name}>
          {field.type === 'boolean' ? (
            <label className="flex items-center gap-3 text-sm text-ink">
              <input
                type="checkbox"
                checked={Boolean(values[field.name])}
                onChange={(event) => set(field.name, event.target.checked)}
                className="h-5 w-5 accent-[#10bdf5]"
              />
              {field.label}
            </label>
          ) : (
            <>
              <label
                htmlFor={`${table}-${field.name}`}
                className="block text-xs uppercase tracking-[0.2em] text-muted"
              >
                {field.label}
              </label>

              {field.type === 'image' ? (
                <ImageUploader
                  value={String(values[field.name] ?? '')}
                  onChange={(url) => set(field.name, url)}
                />
              ) : field.type === 'textarea' ? (
                <textarea
                  id={`${table}-${field.name}`}
                  rows={field.rows ?? 4}
                  placeholder={field.placeholder}
                  value={String(values[field.name] ?? '')}
                  onChange={(event) => set(field.name, event.target.value)}
                  className={inputClass}
                />
              ) : field.type === 'tags' ? (
                <textarea
                  id={`${table}-${field.name}`}
                  rows={3}
                  placeholder={field.placeholder}
                  value={String(values[field.name] ?? '')}
                  onChange={(event) => set(field.name, event.target.value)}
                  className={inputClass}
                />
              ) : (
                <input
                  id={`${table}-${field.name}`}
                  type={field.type === 'number' ? 'number' : 'text'}
                  placeholder={field.placeholder}
                  value={String(values[field.name] ?? '')}
                  onChange={(event) => set(field.name, event.target.value)}
                  className={inputClass}
                />
              )}
            </>
          )}

          {field.help ? (
            <p className="mt-1.5 text-xs text-muted">{field.help}</p>
          ) : null}
        </div>
      ))}

      {extra}

      {state.error ? (
        <p className="rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {state.error}
        </p>
      ) : null}
      {state.ok && state.message ? (
        <p className="rounded-xl border border-accent-2/40 bg-accent-2/10 px-4 py-3 text-sm text-accent-2">
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent-1 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-bg-deep transition hover:bg-accent-2 disabled:opacity-60"
        >
          {pending ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Create'}
        </button>
        {onDone ? (
          <button
            type="button"
            onClick={onDone}
            className="rounded-full border border-line px-6 py-3 text-sm uppercase tracking-[0.18em] text-muted transition hover:border-accent-1 hover:text-accent-1"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
