import { JsonForm } from '@/components/dashboard/JsonForm';
import { saveCopy } from '@/app/dashboard/actions';
import { getDashboardData } from '@/lib/dashboard-data';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Content & copy' };

export default async function ContentPage() {
  const { copy } = await getDashboardData();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl uppercase text-ink">Content &amp; copy</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Every word the site renders: headings, paragraphs, button labels, the form labels, the
          validation messages and the SEO metadata. Change them here and they are live within a
          minute.
        </p>
      </header>

      <div className="rounded-2xl border border-line bg-white/[0.03] p-6">
        <JsonForm
          initial={copy as unknown as Record<string, unknown>}
          action={saveCopy}
          submitLabel="Save content"
        />
      </div>
    </div>
  );
}
