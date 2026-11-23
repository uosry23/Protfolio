'use client';

import { useState } from 'react';

import { DeleteButton } from './DeleteButton';
import { RecordEditor } from './RecordEditor';

import type { FieldDef } from './fields';

type Props = {
  table: string;
  records: Record<string, unknown>[];
  fields: FieldDef[];
  /** Field used as the row title. */
  primary: string;
  /** Extra fields rendered inside the editor (e.g. the image picker). */
  extra?: (record: Record<string, unknown>) => React.ReactNode;
};

export function RecordList({ table, records, fields, primary, extra }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setCreating((value) => !value);
            setEditingId(null);
          }}
          className="rounded-full bg-accent-1 px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.18em] text-bg-deep transition hover:bg-accent-2"
        >
          {creating ? 'Close' : '+ Add'}
        </button>
        <span className="text-xs uppercase tracking-[0.2em] text-muted">
          {records.length} {records.length === 1 ? 'record' : 'records'}
        </span>
      </div>

      {creating ? (
        <div className="rounded-2xl border border-accent-1/40 bg-white/[0.03] p-6">
          <h2 className="mb-5 font-display text-2xl uppercase text-ink">New record</h2>
          <RecordEditor
            table={table}
            mode="create"
            fields={fields}
            onDone={() => setCreating(false)}
          />
        </div>
      ) : null}

      {records.length === 0 && !creating ? (
        <p className="rounded-2xl border border-dashed border-line px-6 py-10 text-center text-sm text-muted">
          Nothing here yet. Use “Add” to create the first one.
        </p>
      ) : null}

      <ul className="space-y-3">
        {records.map((record) => {
          const id = String(record.id);
          const isEditing = editingId === id;

          return (
            <li
              key={id}
              className="rounded-2xl border border-line bg-white/[0.03] p-5 transition hover:border-accent-1/40"
            >
              {isEditing ? (
                <div className="space-y-4">
                  <h2 className="font-display text-2xl uppercase text-ink">
                    Edit {String(record[primary])}
                  </h2>
                  <RecordEditor
                    table={table}
                    mode="edit"
                    record={record}
                    fields={fields}
                    extra={extra?.(record)}
                    onDone={() => setEditingId(null)}
                  />
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">
                      {String(record[primary] ?? id)}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted">
                      {id}
                      {record.tagline ? ` · ${record.tagline}` : ''}
                      {record.role ? ` · ${record.role}` : ''}
                      {record.label && record.value !== undefined
                        ? ` · ${record.value}${record.suffix ?? ''}`
                        : ''}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-[0.15em] ${
                      record.published === false
                        ? 'bg-white/10 text-muted'
                        : 'bg-accent-2/15 text-accent-2'
                    }`}
                  >
                    {record.published === false ? 'Draft' : 'Live'}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(id);
                      setCreating(false);
                    }}
                    className="rounded-full border border-line px-3 py-1.5 text-xs uppercase tracking-[0.15em] text-muted transition hover:border-accent-1 hover:text-accent-1"
                  >
                    Edit
                  </button>

                  <DeleteButton table={table} id={id} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
