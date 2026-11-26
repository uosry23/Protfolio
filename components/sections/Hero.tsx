'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

import { onAppReady } from '@/lib/gsap/ready';
import { cn, whatsappLink } from '@/lib/utils';

type Props = {
  giant: string;
  eyebrow: string;
  headline: string;
  intro: string;
  name: string;
  whatsappNumber: string;
  ctaPrimary: string;
  ctaSecondary: string;
  ctaResume: string;
  cursorGreeting: string;
  resumeUrl: string | null;
};

export function Hero({
  giant,
  eyebrow,
  headline,
  intro,
  name,
  whatsappNumber,
  ctaPrimary,
  ctaSecondary,
  ctaResume,
  cursorGreeting,
  resumeUrl,
}: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);

  /* ── Entrance timeline + parallax ────────────────────────────────── */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    const off = onAppReady(() => {
      void (async () => {
        const { ensureGsap } = await import('@/lib/gsap/setup');
        if (disposed) return;
        const { gsap, SplitText, ScrollTrigger } = ensureGsap();

        const ctx = gsap.context(() => {
          const headlineSplit = new SplitText('[data-hero-headline]', {
            type: 'lines',
            mask: 'lines',
            linesClass: 'hero-line',
          });
          const introSplit = new SplitText('[data-hero-intro]', {
            type: 'lines',
            mask: 'lines',
            linesClass: 'hero-line',
          });

          /* The giant word fills the viewport width, computed in JS. */
          const fitName = () => {
            const el = nameRef.current;
            if (!el) return;
            el.style.fontSize = '15.2vw';
            const available = el.parentElement?.clientWidth ?? 0;
            const width = el.scrollWidth;
            if (available > 0 && width > 0) {
              el.style.fontSize = `${15.2 * (available / width)}vw`;
            }
          };
          fitName();
          window.addEventListener('resize', fitName);

          const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

          tl.fromTo(
            '[data-hero-name]',
            { yPercent: 110, autoAlpha: 0 },
            { yPercent: 0, autoAlpha: 1, duration: 1.6, ease: 'power4.out' },
            0,
          )
            .fromTo(
              '[data-hero-logo]',
              { scale: 0.4, rotate: -40, autoAlpha: 0 },
              { scale: 1, rotate: 0, autoAlpha: 1, duration: 2, ease: 'power3.out' },
              0.15,
            )
            .fromTo(
              '[data-hero-eyebrow]',
              { yPercent: 120 },
              { yPercent: 0, duration: 1 },
              0.45,
            )
            .fromTo(
              headlineSplit.lines,
              { yPercent: 110 },
              { yPercent: 0, duration: 1.3, stagger: 0.1 },
              0.5,
            )
            .fromTo(
              introSplit.lines,
              { yPercent: 110 },
              { yPercent: 0, duration: 1.1, stagger: 0.05 },
              0.7,
            )
            .fromTo(
              '[data-hero-cta]',
              { y: 30, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 1, stagger: 0.1 },
              0.9,
            )
            .fromTo(
              '[data-hero-bottom]',
              { y: 30, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 1 },
              1,
            );

          /*
           * Parallax on scroll.
           *
           * These tweens target WRAPPER elements, never the elements the
           * entrance timeline animates. A scrub tween records whatever value
           * the element has at creation time, so sharing an element with the
           * entrance animation makes the two fight: the scrub ends up
           * animating from the entrance's "from" values (hidden / pushed
           * off-screen) and the hero falls apart while scrolling.
           *
           * Nothing fades out here on purpose — the hero scrolls away with the
           * page instead of vanishing and leaving an empty screen behind.
           */
          gsap.to('[data-hero-name-wrap]', {
            yPercent: 22,
            ease: 'none',
            scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true },
          });

          gsap.to('[data-hero-logo-wrap]', {
            yPercent: -40,
            rotate: 25,
            scale: 0.75,
            ease: 'none',
            scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true },
          });

          gsap.to('[data-hero-bottom-wrap]', {
            yPercent: -14,
            ease: 'none',
            scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true },
          });

          ScrollTrigger.refresh();

          cleanup = () => {
            window.removeEventListener('resize', fitName);
            ctx.revert();
          };
        }, root);
      })();
    });

    return () => {
      disposed = true;
      off();
      cleanup?.();
    };
  }, []);

  /* ── 3D mouse tilt ───────────────────────────────────────────────── */
  useEffect(() => {
    const wrap = document.querySelector<HTMLElement>('[data-hero-logo-wrap]');
    const tilt = document.querySelector<HTMLElement>('[data-hero-logo-tilt]');
    if (!wrap || !tilt) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    void (async () => {
      const { ensureGsap } = await import('@/lib/gsap/setup');
      if (disposed) return;
      const { gsap } = ensureGsap();

      const rotateX = gsap.quickTo(tilt, 'rotationX', { duration: 0.9, ease: 'power3' });
      const rotateY = gsap.quickTo(tilt, 'rotationY', { duration: 0.9, ease: 'power3' });

      const onMove = (event: PointerEvent) => {
        const rect = wrap.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        rotateY(px * 80);
        rotateX(-py * 60);
      };
      const onLeave = () => {
        rotateX(0);
        rotateY(0);
      };

      wrap.addEventListener('pointermove', onMove);
      wrap.addEventListener('pointerleave', onLeave);

      cleanup = () => {
        wrap.removeEventListener('pointermove', onMove);
        wrap.removeEventListener('pointerleave', onLeave);
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <section
      id="top"
      ref={rootRef}
      className="relative flex min-h-[100svh] flex-col overflow-hidden px-4 pb-6 pt-20 md:px-6 md:pb-8 md:pt-24"
    >
      {/*
        The scroll parallax animates the WRAPPER, the entrance animation the
        inner heading. Both used to target the same element, so the scrub tween
        captured the entrance's "from" values as its own end values and the
        hero blew up (the name was pushed off-screen, the bottom block faded
        out) as soon as you scrolled.
      */}
      <div data-hero-name-wrap className="overflow-hidden">
        <h1
          data-hero-name
          ref={nameRef}
          className="select-none whitespace-nowrap text-center font-display text-[15.2vw] uppercase leading-[0.82] text-ink"
        >
          {giant}
        </h1>
      </div>

      <div
        data-hero-logo-wrap
        className="hero-logo-wrap mt-6 flex justify-center [perspective:900px]"
        data-cursor-label={cursorGreeting}
      >
        <div
          data-hero-logo-tilt
          className="hero-logo relative aspect-square w-[46vw] max-w-[280px] [transform-style:preserve-3d] md:w-[min(18vw,30vh)]"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 translate-z-[-60px] rounded-full bg-accent-1/30 blur-3xl"
          />
          {[10, 22, 34].map((depth) => (
            <Image
              key={depth}
              src="/brand/ya-logo.png"
              alt=""
              fill
              sizes="(min-width: 768px) 18vw, 46vw"
              className="object-contain"
              style={{ transform: `translateZ(-${depth}px)`, opacity: 0.4 }}
              unoptimized
            />
          ))}

          <Image
            src="/brand/ya-logo.png"
            alt={`${name} logo`}
            fill
            sizes="(min-width: 768px) 18vw, 46vw"
            priority
            unoptimized
            className="relative object-contain drop-shadow-[0_24px_40px_rgba(16,90,255,0.45)]"
            data-hero-logo
          />
        </div>
      </div>

      <div data-hero-bottom-wrap className="mt-auto">
        <div
          data-hero-bottom
          className="hero-bottom grid items-end gap-8 md:grid-cols-[1.7fr_1fr] md:gap-12"
        >
          <div>
            <span
              data-hero-eyebrow
              className="hero-eyebrow block font-sans text-xs uppercase tracking-[0.25em] text-accent-1 md:text-sm"
            >
              {eyebrow}
            </span>
            <p
              data-hero-headline
              className="hero-headline mt-3 block font-display text-[13vw] uppercase leading-[0.86] text-ink md:whitespace-nowrap md:text-[min(5.8vw,13vh)]"
            >
              {headline}
            </p>
          </div>

          <div>
            <p
              data-hero-intro
              className="hero-intro max-w-[46ch] text-[15px] leading-[1.75] tracking-normal text-ink/75 md:ml-auto md:text-[17px]"
            >
              {intro}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3 md:justify-end">
              <a
                href="#contact"
                data-hero-cta
                className={cn(
                  'hero-cta inline-block rounded-full bg-ink px-7 py-3 text-sm uppercase tracking-[0.18em] text-bg-deep',
                  'transition-transform duration-300 hover:-translate-y-0.5',
                )}
                data-cursor
              >
                {ctaPrimary}
              </a>
              <a
                href={whatsappLink(whatsappNumber)}
                target="_blank"
                rel="noopener noreferrer"
                data-hero-cta
                className="hero-cta inline-block rounded-full border border-ink/30 px-7 py-3 text-sm uppercase tracking-[0.18em] text-ink transition-colors hover:border-accent-1 hover:text-accent-1"
                data-cursor
              >
                {ctaSecondary} <span aria-hidden="true">↗</span>
              </a>
              {resumeUrl ? (
                <a
                  href={resumeUrl}
                  download
                  data-hero-cta
                  className="hero-cta inline-block rounded-full border border-ink/30 px-7 py-3 text-sm uppercase tracking-[0.18em] text-ink transition-colors hover:border-accent-1 hover:text-accent-1"
                  data-cursor
                >
                  {ctaResume} <span aria-hidden="true">↓</span>
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
