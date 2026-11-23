'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

import { OCTAGON_CLIP } from '@/components/ui/OctagonFrame';
import type { Stat } from '@/lib/types';

export function About({
  statement,
  name,
  role,
  bio,
  photo,
  caption,
  tech,
  stats,
  eyebrow,
}: {
  statement: string;
  name: string;
  role: string;
  bio: string[];
  photo: string | null;
  caption: string;
  tech: string[];
  stats: Stat[];
  eyebrow: string;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

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
        /* Statement fades in word by word, scrubbed by the scroll. */
        const statementSplit = new SplitText('[data-about-statement]', {
          type: 'words',
          wordsClass: 'about-word',
        });
        gsap.fromTo(
          statementSplit.words,
          { opacity: 0.12 },
          {
            opacity: 1,
            stagger: 0.1,
            ease: 'none',
            scrollTrigger: {
              trigger: '[data-about-statement]',
              start: 'top 80%',
              end: 'bottom 45%',
              scrub: true,
            },
          },
        );

        /* Bio paragraphs rise line by line. */
        const bioSplit = new SplitText('[data-about-bio]', {
          type: 'lines',
          mask: 'lines',
          linesClass: 'hero-line',
        });
        gsap.fromTo(
          bioSplit.lines,
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: 1.1,
            stagger: 0.05,
            ease: 'expo.out',
            scrollTrigger: { trigger: '[data-about-bio]', start: 'top 80%' },
          },
        );

        /* Image curtain reveal + parallax. */
        gsap.fromTo(
          '[data-about-image-wrap]',
          { clipPath: 'inset(100% 0% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.6,
            ease: 'expo.inOut',
            scrollTrigger: { trigger: '[data-about-image-wrap]', start: 'top 85%' },
          },
        );
        gsap.fromTo(
          '[data-about-image]',
          { scale: 1.35, yPercent: -6 },
          {
            scale: 1.08,
            yPercent: 6,
            ease: 'none',
            scrollTrigger: {
              trigger: '[data-about-image-wrap]',
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        );

        /* Counters. */
        gsap.utils.toArray<HTMLElement>('[data-counter]').forEach((element) => {
          const target = Number(element.dataset.counter ?? '0');
          const suffix = element.dataset.suffix ?? '';
          const state = { value: 0 };
          gsap.to(state, {
            value: target,
            duration: 2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 90%',
              once: true,
              onEnter: () => {
                if (window.scrollY > 0 && element.getBoundingClientRect().top < window.innerHeight * 0.9) {
                  gsap.to(state, {
                    value: target,
                    duration: 2,
                    ease: 'power3.out',
                    onUpdate: () => {
                      element.textContent = `${Math.round(state.value)}${suffix}`;
                    },
                  });
                }
              },
            },
            onUpdate: () => {
              element.textContent = `${Math.round(state.value)}${suffix}`;
            },
          });
        });

        /* Stat separators grow. */
        gsap.fromTo(
          '[data-stat-line]',
          { scaleX: 0 },
          {
            scaleX: 1,
            transformOrigin: 'left center',
            duration: 1.2,
            stagger: 0.12,
            ease: 'expo.out',
            scrollTrigger: { trigger: '[data-about-stats]', start: 'top 85%' },
          },
        );

        ScrollTrigger.refresh();
      }, root);

      cleanup = () => ctx.revert();
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  /* ── Tech marquee — a self-running carousel ─────────────────────── */
  useEffect(() => {
    const track = marqueeRef.current;
    if (!track) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    void (async () => {
      const { ensureGsap } = await import('@/lib/gsap/setup');
      if (disposed) return;
      const { gsap } = ensureGsap();

      /* The track holds two identical copies, so shifting it by exactly
         -50% of its width (= one full copy) loops without a visible seam. */
      const ctx = gsap.context(() => {
        gsap.to(track, {
          xPercent: -50,
          duration: 16,
          ease: 'none',
          repeat: -1,
        });
      }, track);

      cleanup = () => ctx.revert();
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [tech.length]);

  const marqueeItems = Array.from({ length: 2 }).flatMap((_, copy) =>
    tech.map((item, index) => ({
      item,
      key: `${copy}-${index}`,
      /* Global order keeps the stroke / solid alternation continuous
         across the seam between the two copies. */
      order: copy * tech.length + index,
    })),
  );

  return (
    <section
      id="about"
      aria-labelledby="about-title"
      ref={rootRef}
      className="relative px-4 pt-28 md:px-6 md:pt-44"
    >
      <p className="mb-6 text-xs uppercase tracking-[0.3em] text-accent-1">{eyebrow}</p>

      <h2
        id="about-title"
        data-about-statement
        className="max-w-[16ch] font-display text-[17vw] uppercase leading-[0.85] text-ink md:max-w-[20ch] md:text-[9vw]"
      >
        {statement}
      </h2>

      <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-2 md:gap-16">
        <figure className="relative">
          <div
            data-about-image-wrap
            className="about-reveal relative aspect-[4/5] w-full overflow-hidden bg-bg-deep"
            style={{ clipPath: OCTAGON_CLIP }}
          >
            {photo ? (
              <Image
                data-about-image
                src={photo}
                alt={`${name} at work`}
                fill
                sizes="(min-width: 768px) 45vw, 100vw"
                className="object-cover object-top"
                loading="lazy"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-bg/70 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-accent-1/10 mix-blend-color" />
          </div>
          <figcaption className="about-caption mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 whitespace-nowrap text-[11px] uppercase tracking-[0.25em] text-muted">
            <span>{caption}</span>
            <span>{role}</span>
          </figcaption>
        </figure>

        <div className="flex flex-col justify-center">
          <p className="font-display text-2xl uppercase text-accent-1 md:text-3xl">{name}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-muted">{role}</p>

          <div
            data-about-bio
            className="mt-8 space-y-6 text-base leading-relaxed text-ink/80 md:text-lg"
          >
            {bio.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <dl data-about-stats className="mt-12 grid grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div key={stat.id}>
                <dt className="text-[11px] uppercase tracking-[0.2em] text-muted">{stat.label}</dt>
                <dd className="mt-2 font-display text-4xl text-ink md:text-5xl">
                  <span data-counter={stat.value} data-suffix={stat.suffix}>
                    0{stat.suffix}
                  </span>
                </dd>
                <div data-stat-line className="mt-3 h-px w-full origin-left bg-line" />
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Tech marquee */}
      <div className="mt-20 overflow-hidden py-6 md:mt-28" aria-label={`Tech stack: ${tech.join(', ')}`}>
        <div ref={marqueeRef} className="flex w-max items-center">
          {marqueeItems.map(({ item, key, order }) => (
            <span key={key} className="flex shrink-0 items-center">
              <span
                className={`px-[2.5vw] font-display text-[13vw] uppercase leading-none md:text-[7vw] ${
                  order % 2 === 0
                    ? 'text-transparent [-webkit-text-stroke:1px_var(--color-ink)]'
                    : 'text-ink'
                }`}
              >
                {item}
              </span>
              <span className="size-[1.4vw] min-h-2 min-w-2 rotate-45 bg-accent-1" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
