'use client';

import { useRef, useState } from 'react';

import { uploadProjectImage } from '@/app/dashboard/actions';

/**
 * Uploads a cover image to the Supabase Storage bucket `project-images`
 * and hands the public URL back to the form.
 *
 * The server action is called directly instead of through a `<form>`: this
 * component lives inside the record form, and a nested form is invalid HTML
 * (React logs a hydration error for it).
 */
export function ImageUploader({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  async function upload() {
    const file = inputRef.current?.files?.[0];
    if (!file) return;

    setPending(true);
    setError(null);
    setUploadedUrl(null);

    const formData = new FormData();
    formData.set('file', file);

    try {
      const result = await uploadProjectImage({}, formData);
      if (result.error) setError(result.error);
      else setUploadedUrl(result.url ?? null);
    } catch {
      setError('The upload failed. Check the bucket and try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-xl border border-line bg-bg-deep/60 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-muted">Cover image</p>

      {value ? (
        <div className="mt-3 flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className="h-24 w-20 rounded-lg border border-line object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted">{value}</p>
            <button
              type="button"
              onClick={() => onChange('')}
              className="mt-2 rounded-full border border-line px-3 py-1.5 text-xs uppercase tracking-[0.15em] text-muted transition hover:border-red-400 hover:text-red-300"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-xs text-muted">
          No image yet — the placeholder is used until you upload one.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          name="file"
          accept="image/*"
          className="block w-full max-w-xs text-xs text-muted file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-[0.15em] file:text-ink"
          onChange={(event) => setFileName(event.target.files?.[0]?.name ?? '')}
        />
        <button
          type="button"
          onClick={upload}
          disabled={pending || !fileName}
          className="rounded-full border border-accent-1 px-4 py-2 text-xs uppercase tracking-[0.15em] text-accent-1 transition hover:bg-accent-1 hover:text-bg-deep disabled:opacity-40"
        >
          {pending ? 'Uploading…' : 'Upload'}
        </button>
      </div>

      {error ? <p className="mt-3 text-xs text-red-300">{error}</p> : null}

      {uploadedUrl ? (
        <button
          type="button"
          onClick={() => {
            onChange(uploadedUrl);
            setUploadedUrl(null);
          }}
          className="mt-3 w-full rounded-full bg-accent-2/15 px-4 py-2 text-xs uppercase tracking-[0.15em] text-accent-2 transition hover:bg-accent-2 hover:text-bg-deep"
        >
          Use this image
        </button>
      ) : null}
    </div>
  );
}
