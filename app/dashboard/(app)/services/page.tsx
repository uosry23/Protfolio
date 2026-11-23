import { RecordList } from '@/components/dashboard/RecordList';
import { RECORD_FIELDS, TABLE_TITLES } from '@/components/dashboard/fields';
import { getDashboardData } from '@/lib/dashboard-data';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Services' };

export default async function ServicesPage() {
  const { services } = await getDashboardData();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl uppercase text-ink">{TABLE_TITLES.services.plural}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">The cards in the “What I build” section. Each service has a title, a description and a few tags.</p>
      </header>

      <RecordList
        table="services"
        records={services as unknown as Record<string, unknown>[]}
        fields={RECORD_FIELDS.services}
        primary="title"
      />
    </div>
  );
}
