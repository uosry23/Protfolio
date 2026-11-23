import Link from 'next/link';

import { getDashboardData } from '@/lib/dashboard-data';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Overview' };

function formatDate(value: string) {
  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function DashboardOverviewPage() {
  const { projects, services, testimonials, stats, inquiries } = await getDashboardData();

  const cards = [
    { label: 'Projects', value: projects.length, href: '/dashboard/projects' },
    { label: 'Services', value: services.length, href: '/dashboard/services' },
    { label: 'Testimonials', value: testimonials.length, href: '/dashboard/testimonials' },
    { label: 'Stats', value: stats.length, href: '/dashboard/stats' },
    { label: 'Inquiries', value: inquiries.length, href: '/dashboard/inquiries' },
  ];

  const published = projects.filter((p) => p.published).length;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-4xl uppercase text-ink">Overview</h1>
        <p className="mt-2 text-sm text-muted">
          Everything on the site lives in Supabase. Edit anything here and it goes live within a
          minute.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-2xl border border-line bg-white/[0.03] p-5 transition hover:border-accent-1"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-muted">{card.label}</p>
            <p className="mt-2 font-display text-4xl text-ink">{card.value}</p>
          </Link>
        ))}
      </section>

      <section className="rounded-2xl border border-line bg-white/[0.03] p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-2xl uppercase text-ink">Latest inquiries</h2>
          <Link
            href="/dashboard/inquiries"
            className="text-xs uppercase tracking-[0.18em] text-accent-1 hover:text-accent-2"
          >
            See all →
          </Link>
        </div>

        {inquiries.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No inquiries yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {inquiries.slice(0, 5).map((inquiry) => (
              <li key={inquiry.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3">
                <span className="font-semibold text-ink">{inquiry.name}</span>
                <span className="text-sm text-muted">
                  {inquiry.country_code} {inquiry.whatsapp}
                </span>
                <span className="text-xs uppercase tracking-[0.15em] text-muted">
                  {inquiry.project_type ?? '—'}
                </span>
                <span className="ml-auto text-xs text-muted">{formatDate(inquiry.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-white/[0.03] p-6">
        <h2 className="font-display text-2xl uppercase text-ink">Status</h2>
        <p className="mt-3 text-sm text-muted">
          {published} of {projects.length} projects are published. Drafts stay hidden from visitors
          until you publish them.
        </p>
      </section>
    </div>
  );
}
