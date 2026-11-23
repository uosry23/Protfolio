'use client';

import { useState, useTransition } from 'react';

import type { ActionState } from '@/app/dashboard/actions';

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

const inputClass =
  'mt-2 w-full rounded-xl border border-line bg-bg-deep px-4 py-3 text-sm text-ink outline-none transition focus:border-accent-1';

/** `ctaPrimary` → `Cta primary` */
function humanise(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/^./, (char) => char.toUpperCase());
}

/** Immutably replaces the value at a path. */
function setAt(source: Json, path: string[], value: Json): Json {
  if (path.length === 0) return value;

  const [head, ...rest] = path;
  if (head === undefined) return value;

  if (Array.isArray(source)) {
    const copy = [...source];
    const index = Number(head);
    copy[index] = setAt(copy[index] ?? null, rest, value);
    return copy;
  }

  if (source && typeof source === 'object') {
    const copy = { ...source };
    copy[head] = setAt(copy[head] ?? null, rest, value);
    return copy;
  }

  return source;
}

function isPlainObject(value: Json): value is { [key: string]: Json } {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

/* ────────────────────────────────────────────────────────────────────────
   Field renderer
   ──────────────────────────────────────────────────────────────────────── */

function Node({
  label,
  value,
  path,
  onChange,
  depth,
}: {
  label: string;
  value: Json;
  path: string[];
  onChange: (path: string[], value: Json) => void;
  depth: number;
}) {
  const update = (next: Json) => onChange(path, next);

  if (typeof value === 'boolean') {
    return (
      <label className="flex items-center gap-3 text-sm text-ink">
        <input
          type="checkbox"
          checked={value}
          onChange={(event) => update(event.target.checked)}
          className="h-5 w-5 accent-[#10bdf5]"
        />
        {label}
      </label>
    );
  }

  if (typeof value === 'number') {
    return (
      <div>
        <Label text={label} />
        <input
          type="number"
          value={value}
          onChange={(event) => update(Number(event.target.value))}
          className={inputClass}
          suppressHydrationWarning
        />
      </div>
    );
  }

  if (typeof value === 'string') {
    const long = value.length > 60;
    return (
      <div>
        <Label text={label} />
        {long ? (
          <textarea
            rows={3}
            value={value}
            onChange={(event) => update(event.target.value)}
            className={inputClass}
            suppressHydrationWarning
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(event) => update(event.target.value)}
            className={inputClass}
            suppressHydrationWarning
          />
        )}
      </div>
    );
  }

  if (Array.isArray(value)) {
    // A list of objects → a repeater.
    if (value.length > 0 && value.every((item) => isPlainObject(item))) {
      return (
        <fieldset className="rounded-xl border border-line p-4">
          <legend className="px-2 text-xs uppercase tracking-[0.2em] text-muted">
            {label} ({value.length})
          </legend>
          <div className="space-y-3">
            {value.map((item, index) => (
              <div key={index} className="rounded-lg border border-line/70 bg-bg-deep/40 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.15em] text-muted">
                    #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => update(value.filter((_, i) => i !== index))}
                    className="text-xs uppercase tracking-[0.15em] text-red-300 hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>
                <div className="space-y-3">
                  {Object.entries(item).map(([key, child]) => (
                    <Node
                      key={key}
                      label={humanise(key)}
                      value={child}
                      path={[...path, String(index), key]}
                      onChange={onChange}
                      depth={depth + 1}
                    />
                  ))}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const template = Object.fromEntries(
                  Object.entries(value[0] ?? {}).map(([key, child]) => [
                    key,
                    typeof child === 'string' ? '' : child,
                  ]),
                );
                update([...value, template as Json]);
              }}
              className="rounded-full border border-accent-1 px-4 py-2 text-xs uppercase tracking-[0.15em] text-accent-1 transition hover:bg-accent-1 hover:text-bg-deep"
            >
              + Add
            </button>
          </div>
        </fieldset>
      );
    }

    // A list of strings → one entry per line.
    const text = value.join('\n');
    return (
      <div>
        <Label text={label} />
        <textarea
          rows={Math.max(3, value.length + 1)}
          value={text}
          onChange={(event) =>
            update(
              event.target.value
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean),
            )
          }
          className={inputClass}
          suppressHydrationWarning
        />
        <p className="mt-1.5 text-xs text-muted">One entry per line.</p>
      </div>
    );
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value);
    return (
      <fieldset className="rounded-xl border border-line p-4">
        <legend className="px-2 text-xs uppercase tracking-[0.2em] text-accent-1">{label}</legend>
        <div className="space-y-4">
          {entries.map(([key, child]) => (
            <Node
              key={key}
              label={humanise(key)}
              value={child}
              path={[...path, key]}
              onChange={onChange}
              depth={depth + 1}
            />
          ))}
        </div>
      </fieldset>
    );
  }

  return null;
}

function Label({ text }: { text: string }) {
  return (
    <span className="block text-xs uppercase tracking-[0.2em] text-muted">{text}</span>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   The form
   ──────────────────────────────────────────────────────────────────────── */

export function JsonForm({
  initial,
  action,
  submitLabel = 'Save',
}: {
  initial: unknown;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel?: string;
}) {
  const [state, setState] = useState<ActionState>({});
  const [pending, startTransition] = useTransition();
  const [data, setData] = useState<Json>((initial ?? {}) as Json);

  const onChange = (path: string[], value: Json) =>
    setData((prev) => setAt(prev, path, value));

  /*
   * The form is submitted by hand instead of through the `action` prop.
   *
   * React 19 marks every controlled field of a server-rendered form that has
   * an `action` with an empty `style` marker — but only on the server render,
   * so the client render never matches it and the hydration diff complains.
   * Handling `submit` ourselves keeps the markup identical on both sides.
   */
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      setState(await action(state, formData));
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* React 19's server renderer tags controlled fields of a form that
          carries a server action with an empty `style` marker that the client
          render does not reproduce. The attribute is empty and invisible, so
          the mismatch is suppressed instead of patched. */}
      <input
        type="hidden"
        name="payload"
        value={JSON.stringify(data)}
        readOnly
        suppressHydrationWarning
      />

      <div className="space-y-5">
        {isPlainObject(data) ? (
          Object.entries(data).map(([key, value]) => (
            <Node
              key={key}
              label={humanise(key)}
              value={value}
              path={[key]}
              onChange={onChange}
              depth={0}
            />
          ))
        ) : (
          <Node label="Value" value={data} path={[]} onChange={onChange} depth={0} />
        )}
      </div>

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

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-accent-1 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-bg-deep transition hover:bg-accent-2 disabled:opacity-60"
      >
        {pending ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
