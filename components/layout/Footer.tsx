'use client';

import Image from 'next/image';
import { whatsappLink } from '@/lib/utils';

export function Footer({
  name,
  description,
  links,
  socials,
  whatsappNumber,
  year,
  note,
}: {
  name: string;
  description: string;
  links: { label: string; href: string }[];
  socials: { label: string; href: string }[];
  whatsappNumber: string;
  /** Rendered on the server so the markup never mismatches at midnight. */
  year: number;
  note: string;
}) {
  return (
    <footer className="relative overflow-hidden border-t border-line px-4 pb-6 pt-16 md:px-6 md:pt-20">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr] md:gap-5">
          <div className="flex items-start gap-4">
            <Image
              src="/brand/ya-logo.png"
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
              unoptimized
            />
            <p className="max-w-sm text-sm leading-relaxed text-ink/80">{description}</p>
          </div>

          <nav aria-label="Footer">
            <ul className="flex flex-col gap-3">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm uppercase tracking-[0.18em] text-ink/85 transition-colors hover:text-accent-1"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-3">
            <a
              href={whatsappLink(whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm uppercase tracking-[0.18em] text-accent-1 transition-colors hover:text-ink"
              data-cursor
            >
              WhatsApp <span aria-hidden="true">↗</span>
            </a>
            <a
              href="#top"
              className="text-sm uppercase tracking-[0.18em] text-ink/85 transition-colors hover:text-accent-1"
              aria-label="Back to top"
            >
              Back to top ↑
            </a>
          </div>
        </div>

        <div
          data-footer-name
          className="mt-14 select-none font-display text-[15vw] uppercase leading-[0.8] tracking-[-0.02em] text-ink md:text-[10.5vw]"
          aria-hidden="true"
        >
          {name}
        </div>

        <div className="mt-8 flex justify-center gap-3">
          {socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-[10px] uppercase tracking-widest text-ink/80 transition-all duration-300 hover:-translate-y-1 hover:border-accent-1 hover:bg-accent-1 hover:text-bg-deep"
              aria-label={social.label}
              data-cursor
            >
              {social.label.slice(0, 2)}
            </a>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-line pt-6 text-[11px] uppercase tracking-[0.2em] text-muted md:flex-row md:items-center">
          <p>
            © {year} {name}
          </p>
          <p>{note}</p>
        </div>
      </div>
    </footer>
  );
}
