import { DeleteButton } from '@/components/dashboard/DeleteButton';
import { getDashboardData } from '@/lib/dashboard-data';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Inquiries' };

function formatDate(value: string) {
  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function InquiriesPage() {
  const { inquiries } = await getDashboardData();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl uppercase text-ink">Inquiries</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Every message sent through the contact form on the site.
        </p>
      </header>

      {inquiries.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line px-6 py-10 text-center text-sm text-muted">
          No inquiries yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {inquiries.map((inquiry) => (
            <li
              key={inquiry.id}
              className="rounded-2xl border border-line bg-white/[0.03] p-5"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
                <span className="font-semibold text-ink">{inquiry.name}</span>
                <a
                  href={`https://wa.me/${inquiry.whatsapp.replace(/[^\d]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-accent-1 hover:text-accent-2"
                >
                  {inquiry.country_code} {inquiry.whatsapp} ↗
                </a>
                <span className="text-xs uppercase tracking-[0.15em] text-muted">
                  {inquiry.project_type ?? '—'}
                </span>
                {inquiry.budget ? (
                  <span className="text-xs uppercase tracking-[0.15em] text-muted">
                    {inquiry.budget}
                  </span>
                ) : null}
                <span className="ml-auto text-xs text-muted">
                  {formatDate(inquiry.created_at)}
                </span>
                <DeleteButton table="inquiries" id={inquiry.id} />
              </div>

              {inquiry.message ? (
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/80">
                  {inquiry.message}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
