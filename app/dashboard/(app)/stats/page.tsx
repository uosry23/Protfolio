import { RecordList } from '@/components/dashboard/RecordList';
import { RECORD_FIELDS, TABLE_TITLES } from '@/components/dashboard/fields';
import { getDashboardData } from '@/lib/dashboard-data';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Stats' };

export default async function StatsPage() {
  const { stats } = await getDashboardData();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl uppercase text-ink">{TABLE_TITLES.site_stats.plural}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">The animated counters in the About section.</p>
      </header>

      <RecordList
        table="site_stats"
        records={stats as unknown as Record<string, unknown>[]}
        fields={RECORD_FIELDS.site_stats}
        primary="label"
      />
    </div>
  );
}
