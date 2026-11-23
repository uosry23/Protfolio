'use client';

import { useEffect, useRef } from 'react';

import type { Testimonial } from '@/lib/types';

/** Card placement around the centered headline — same grid as the reference. */
const POSITIONS = [
  { x: 18, y: 27, r: -8 },
  { x: 82, y: 25, r: 7 },
  { x: 17, y: 72, r: 6 },
  { x: 83, y: 72, r: -6 },
  { x: 50, y: 13, r: 3 },
];

function MessageCard({
  testimonial,
  rotate = 0,
  source,
}: {
  testimonial: Testimonial;
  rotate?: number;
  source: string;
}) {
  return (
    <div
      className="relative transition-transform duration-500 ease-out hover:scale-[1.06]"
      style={{ rotate: `${rotate}deg` }}
    >
      <span
        aria-hidden="true"
        className="absolute -top-3 left-1/2 z-10 h-6 w-20 -translate-x-1/2 rotate-[-4deg] bg-ink/25 backdrop-blur-sm"
      />
      <div className="overflow-hidden rounded-2xl border border-ink/10 bg-[#f3efe8] p-1.5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)]">
        <div className="rounded-xl bg-[#f3efe8] px-4 py-5">
          <p className="text-[13px] leading-relaxed text-[#1f2a26]">{testimonial.message}</p>
          <p className="mt-3 text-[11px] text-[#6b7a74]">
            {testimonial.name}
            {testimonial.role ? ` · ${testimonial.role}` : ''}
          </p>
        </div>
      </div>
      <figcaption className="mt-2.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted">
        <span className="size-1.5 rounded-full bg-accent-1" aria-hidden="true" />
        {source}
      </figcaption>
    </div>
  );
}

export function Course({
  testimonials,
  udemyUrl,
  eyebrow,
  title,
  subtitle,
  ctaLabel,
  source,
}: {
  testimonials: Testimonial[];
  udemyUrl: string | null;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  source: string;
}) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    void (async () => {
      const { ensureGsap } = await import('@/lib/gsap/setup');
      if (disposed) return;
      const { gsap, SplitText, ScrollTrigger } = ensureGsap();

      const ctx = gsap.context(() => {
        const title = new SplitText('[data-course-title]', {
          type: 'words,chars',
          mask: 'words',
          wordsClass: 'course-word',
          charsClass: 'course-char',
        });
        gsap.fromTo(
          title.chars,
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: 1,
            stagger: 0.02,
            ease: 'expo.out',
            scrollTrigger: { trigger: '[data-course-title]', start: 'top 80%' },
          },
        );

        const mm = gsap.matchMedia();

        mm.add('(min-width: 768px)', () => {
          const cards = gsap.utils.toArray<HTMLElement>('[data-course-card]');
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root,
              start: 'top top',
              end: '+=180%',
              scrub: 1,
              pin: true,
              anticipatePin: 1,
            },
          });

          cards.forEach((card, index) => {
            const direction = index % 2 === 0 ? -1 : 1;
            tl.fromTo(
              card,
              {
                x: `${direction * (10 + (index % 3) * 4)}vw`,
                y: `${0.85 + (index % 2) * 0.3} * 100vh`,
                rotation: direction * (20 + index * 6),
                scale: 0.6,
                autoAlpha: 0,
              },
              {
                x: 0,
                y: 0,
                rotation: 0,
                scale: 1,
                autoAlpha: 1,
                duration: 1,
                ease: 'power3.out',
              },
              index * 0.12,
            );
          });

          cards.forEach((card, index) => {
            gsap.to(card, {
              y: (index % 2 === 0 ? -1 : 1) * 40,
              ease: 'none',
              scrollTrigger: {
                trigger: root,
                start: 'top top',
                end: '+=180%',
                scrub: 1,
              },
            });
          });

          return () => {
            tl.scrollTrigger?.kill();
            tl.kill();
          };
        });

        mm.add('(max-width: 767px)', () => {
          gsap.fromTo(
            '[data-course-card]',
            { y: 80, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 1,
              stagger: 0.08,
              ease: 'power3.out',
              scrollTrigger: { trigger: '[data-course-grid]', start: 'top 80%' },
            },
          );
        });

        ScrollTrigger.refresh();
      }, root);

      cleanup = () => ctx.revert();
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [testimonials.length]);

  /* The Udemy CTA only appears once a real course URL is configured. */
  const udemyButton = udemyUrl ? (
    <a
      href={udemyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-ink/25 px-7 py-3 text-xs uppercase tracking-[0.2em] text-ink transition-colors hover:border-accent-1 hover:text-accent-1"
      data-cursor
    >
      <span className="size-1.5 rounded-full bg-accent-1" aria-hidden="true" />
      {ctaLabel} <span aria-hidden="true">↗</span>
    </a>
  ) : null;

  return (
    <section
      id="course"
      aria-labelledby="sp-title"
      ref={rootRef}
      className="relative mt-24 md:mt-0"
    >
      <div className="sp-stage relative px-4 md:h-[100svh] md:overflow-hidden md:px-6">
        <div className="relative z-0 flex flex-col items-center pb-12 pt-10 text-center md:absolute md:inset-0 md:justify-center md:p-0">
          <p className="sp-sub mb-6 text-xs uppercase tracking-[0.3em] text-accent-1">
            {eyebrow}
          </p>
          <h2
            id="sp-title"
            data-course-title
            className="sp-title max-w-[11ch] font-display text-[15vw] uppercase leading-[0.86] text-ink md:max-w-[15ch] md:text-[6.6vw]"
          >
            {title}
          </h2>
          <p className="sp-sub mt-6 max-w-md text-sm uppercase leading-relaxed tracking-wide text-ink/70">
            {subtitle}
          </p>
        </div>

        <ul className="hidden md:block">
          {testimonials.map((testimonial, index) => {
            const position = POSITIONS[index % POSITIONS.length] ?? POSITIONS[0]!;
            return (
              <li
                key={testimonial.id}
                data-course-card
                className="sp-card absolute z-10 w-[clamp(260px,22vw,380px)] -translate-x-1/2 -translate-y-1/2 hover:z-20"
                style={{ left: `${position.x}%`, top: `${position.y}%` }}
              >
                <MessageCard testimonial={testimonial} rotate={position.r} source={source} />
              </li>
            );
          })}
        </ul>

        <div className="sp-sub absolute bottom-[7%] left-1/2 z-30 hidden -translate-x-1/2 md:block">
          {udemyButton}
        </div>

        <ul data-course-grid className="space-y-12 md:hidden">
          {testimonials.map((testimonial, index) => (
            <li key={testimonial.id} data-course-card className="sp-mcard mx-auto max-w-sm">
              <MessageCard testimonial={testimonial} rotate={index % 2 ? 2 : -2} source={source} />
            </li>
          ))}
        </ul>

        <div className="flex justify-center pb-6 pt-14 md:hidden">{udemyButton}</div>
      </div>
    </section>
  );
}
