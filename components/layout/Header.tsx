'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { onAppReady } from '@/lib/gsap/ready';
import { cn, whatsappLink } from '@/lib/utils';

type NavLink = { label: string; href: string };

export function Header({
  name,
  links,
  whatsappNumber,
  labels,
}: {
  name: string;
  links: NavLink[];
  whatsappNumber: string;
  labels: {
    navLabel: string;
    cursorNavLabel: string;
    whatsappLabel: string;
    mobileNavLabel: string;
    openMenuLabel: string;
    closeMenuLabel: string;
  };
}) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  /* Hide the header while scrolling down, bring it back on the way up. */
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 24);
        setHidden(y > 120 && y > lastY && !menuOpen);
        lastY = y;
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [menuOpen]);

  /* Lock the body while the mobile menu is open. */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  /* Entrance animation for the nav links. */
  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;

    const off = onAppReady(() => {
      void (async () => {
        const { ensureGsap } = await import('@/lib/gsap/setup');
        if (disposed) return;
        const { gsap } = ensureGsap();
        const header = headerRef.current;
        if (!header) return;

        const ctx = gsap.context(() => {
          gsap.fromTo(
            '[data-nav-line]',
            { scaleX: 0 },
            {
              scaleX: 1,
              transformOrigin: 'left center',
              duration: 1.4,
              stagger: 0.08,
              ease: 'expo.out',
            },
          );
          gsap.fromTo(
            '[data-nav-icon]',
            { yPercent: 120 },
            {
              yPercent: 0,
              duration: 1,
              stagger: 0.06,
              delay: 0.5,
              ease: 'expo.out',
            },
          );
        }, header);

        cleanup = () => ctx.revert();
      })();
    });

    return () => {
      disposed = true;
      off();
      cleanup?.();
    };
  }, []);

  /* Mobile menu reveal (circular clip-path). */
  useEffect(() => {
    if (!menuOpen) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;

    void (async () => {
      const { ensureGsap } = await import('@/lib/gsap/setup');
      if (disposed) return;
      const { gsap } = ensureGsap();
      const menu = menuRef.current;
      if (!menu) return;

      const ctx = gsap.context(() => {
        gsap.set(menu, { clipPath: 'circle(0% at calc(100% - 2.5rem) 2rem)' });
        gsap.to(menu, {
          clipPath: 'circle(150% at calc(100% - 2.5rem) 2rem)',
          duration: 1,
          ease: 'expo.inOut',
        });
        gsap.fromTo(
          '[data-menu-link]',
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: 1,
            stagger: 0.06,
            delay: 0.45,
            ease: 'expo.out',
          },
        );
      }, menu);

      cleanup = () => ctx.revert();
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [menuOpen]);

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          'fixed inset-x-0 top-0 z-[60] px-4 pb-1.5 pt-4 transition-[background-color,backdrop-filter,transform] duration-500 md:px-6',
          scrolled && 'bg-bg/75 backdrop-blur-md',
          hidden && '-translate-y-[110%]',
        )}
      >
        <div className="flex items-end justify-between gap-6">
          <Link
            href="#top"
            className="flex items-center gap-3 border-b border-line pb-3"
            data-cursor
          >
            <Image
              src="/brand/ya-logo.png"
              alt=""
              width={34}
              height={34}
              className="h-8 w-8 object-contain"
              priority
              unoptimized
            />
            <span className="font-display text-base uppercase tracking-[0.12em] text-ink md:text-lg">
              {name}
            </span>
          </Link>

          <nav aria-label={labels.navLabel} className="hidden items-end gap-8 md:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="group flex items-center gap-2 border-b border-line pb-3 text-sm uppercase tracking-[0.18em] text-ink/80 transition-colors hover:text-accent-1"
                data-cursor-label={labels.cursorNavLabel}
              >
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full border border-current opacity-60 transition-opacity group-hover:opacity-100"
                />
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-end gap-6">
            <a
              href={whatsappLink(whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden border-b border-line pb-3 text-sm uppercase tracking-[0.18em] text-accent-1 transition-colors hover:text-ink md:inline-block"
              data-cursor
            >
              <span data-nav-icon className="block">
                {labels.whatsappLabel} <span aria-hidden="true">↗</span>
              </span>
            </a>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink md:hidden"
            >
              <span className="sr-only">
                {menuOpen ? labels.closeMenuLabel : labels.openMenuLabel}
              </span>
              <span aria-hidden="true" className="flex flex-col items-center gap-[5px]">
                <span
                  className={cn(
                    'block h-px w-4 bg-current transition-transform duration-300',
                    menuOpen && 'translate-y-[3px] rotate-45',
                  )}
                />
                <span
                  className={cn(
                    'block h-px w-4 bg-current transition-transform duration-300',
                    menuOpen && '-translate-y-[3px] -rotate-45',
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-menu"
        ref={menuRef}
        hidden={!menuOpen}
        className="fixed inset-0 z-[55] bg-bg-deep px-6 pt-28 md:hidden"
        style={{ clipPath: 'circle(0% at calc(100% - 2.5rem) 2rem)' }}
      >
        <nav aria-label={labels.mobileNavLabel} className="flex flex-col gap-2">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="overflow-hidden py-2 font-display text-4xl uppercase leading-tight text-ink"
            >
              <span data-menu-link className="block">
                {link.label}
              </span>
            </a>
          ))}
        </nav>
        <a
          href={whatsappLink(whatsappNumber)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-accent-1 px-6 py-3 text-sm uppercase tracking-[0.18em] text-bg-deep"
        >
          WhatsApp <span aria-hidden="true">↗</span>
        </a>
      </div>
    </>
  );
}
