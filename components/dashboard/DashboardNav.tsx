'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/projects', label: 'Projects' },
  { href: '/dashboard/services', label: 'Services' },
  { href: '/dashboard/testimonials', label: 'Testimonials' },
  { href: '/dashboard/stats', label: 'Stats' },
  { href: '/dashboard/settings', label: 'Settings' },
  { href: '/dashboard/content', label: 'Content & copy' },
  { href: '/dashboard/inquiries', label: 'Inquiries' },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
      {links.map((link) => {
        const active =
          link.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm transition ${
              active
                ? 'bg-accent-1 font-semibold text-bg-deep'
                : 'text-muted hover:bg-white/5 hover:text-ink'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
