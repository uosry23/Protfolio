import { JsonForm } from '@/components/dashboard/JsonForm';
import { saveSettings } from '@/app/dashboard/actions';
import { getDashboardData } from '@/lib/dashboard-data';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const { settings } = await getDashboardData();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl uppercase text-ink">Settings</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Your name, the WhatsApp number, every social link, the navigation, the countries, the
          budgets and the tech list. The lists accept one entry per line; the link lists let you add
          and remove rows.
        </p>
      </header>

      <div className="rounded-2xl border border-line bg-white/[0.03] p-6">
        <JsonForm
          initial={settings as unknown as Record<string, unknown>}
          action={saveSettings}
          submitLabel="Save settings"
        />
      </div>
    </div>
  );
}
