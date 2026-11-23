import { RecordList } from '@/components/dashboard/RecordList';
import { RECORD_FIELDS, TABLE_TITLES } from '@/components/dashboard/fields';
import { getDashboardData } from '@/lib/dashboard-data';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Testimonials' };

export default async function TestimonialsPage() {
  const { testimonials } = await getDashboardData();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl uppercase text-ink">{TABLE_TITLES.testimonials.plural}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">The quotes in the “Straight from my clients” section.</p>
      </header>

      <RecordList
        table="testimonials"
        records={testimonials as unknown as Record<string, unknown>[]}
        fields={RECORD_FIELDS.testimonials}
        primary="name"
      />
    </div>
  );
}
