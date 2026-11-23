import { RecordList } from '@/components/dashboard/RecordList';
import { RECORD_FIELDS, TABLE_TITLES } from '@/components/dashboard/fields';
import { getDashboardData } from '@/lib/dashboard-data';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Projects' };

export default async function ProjectsPage() {
  const { projects } = await getDashboardData();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl uppercase text-ink">{TABLE_TITLES.projects.plural}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Add, edit or remove the case studies in the “Some of my projects” section. Drafts are
          hidden from visitors.
        </p>
      </header>

      <RecordList
        table="projects"
        records={projects as unknown as Record<string, unknown>[]}
        fields={RECORD_FIELDS.projects}
        primary="title"
      />
    </div>
  );
}
