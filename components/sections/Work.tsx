'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger';

import { OCTAGON_CLIP, OctagonFrame } from '@/components/ui/OctagonFrame';
import type { Project } from '@/lib/types';

/** Deterministic pseudo-random so server and client markup match exactly. */
function seeded(index: number, salt = 1) {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function Work({
  projects,
  title,
  subtitle,
  scrollHint,
  projectLabel,
  liveLinkLabel,
  openProjectLabel,
  projectAltLabel,
}: {
  projects: Project[];
  title: string;
  subtitle: string;
  scrollHint: string;
  projectLabel: string;
  liveLinkLabel: string;
  openProjectLabel: string;
  projectAltLabel: string;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLSpanElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const total = projects.length;

  /* ── Desktop pinned showcase ─────────────────────────────────────── */
  useEffect(() => {
    const stage = stageRef.current;
    const card = cardRef.current;
    const list = listRef.current;
    if (!stage || !card || !list) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    void (async () => {
      const { ensureGsap } = await import('@/lib/gsap/setup');
      if (disposed) return;
      const { gsap, ScrollTrigger } = ensureGsap();

      const shots = gsap.utils.toArray<HTMLElement>('[data-work-shot]', stage);
      const infos = gsap.utils.toArray<HTMLElement>('[data-work-info]', stage);
      const items = gsap.utils.toArray<HTMLElement>('[data-work-item]', stage);
      const counter = counterRef.current;
      const bar = barRef.current;
      const knob = knobRef.current;

      /* Geometry helpers — identical to the reference implementation. */
      const step = () =>
        items[1] && items[0] ? items[1].offsetTop - items[0].offsetTop : 0;
      const half = () => (items[0]?.offsetHeight ?? 0) / 2;
      const offset = () => 0.55 * window.innerHeight;

      const ctx = gsap.context(() => {
        /* The pinned showcase only exists on desktop — the mobile layout is
           a plain scroll list, so the whole thing stays behind a breakpoint
           instead of building triggers on a hidden element. */
        const mm = gsap.matchMedia();

        mm.add('(min-width: 768px)', () => {
          /* Smoke clouds drift endlessly behind the card. */
          gsap.utils.toArray<HTMLElement>('[data-smoke]', stage).forEach((blob, index) => {
            gsap.to(blob, {
              xPercent: gsap.utils.random(-12, 12),
              yPercent: gsap.utils.random(-10, 10),
              scale: gsap.utils.random(0.9, 1.15),
              rotate: index % 2 ? 25 : -25,
              duration: gsap.utils.random(6, 9),
              ease: 'sine.inOut',
              yoyo: true,
              repeat: -1,
            });
          });

          /* Rising particles. */
          gsap.utils.toArray<HTMLElement>('[data-particle]', stage).forEach((particle) => {
            gsap.to(particle, {
              y: gsap.utils.random(-120, -40),
              opacity: 0,
              duration: gsap.utils.random(3, 7),
              delay: gsap.utils.random(0, 4),
              ease: 'none',
              repeat: -1,
            });
          });

          gsap.set(shots.slice(1), { autoAlpha: 0 });
          gsap.set(infos.slice(1), { autoAlpha: 0, y: () => offset(), rotate: 6 });
          gsap.set(items.slice(1), { opacity: 0.3, scale: 0.85, rotate: -14, x: -18 });
          if (items[0]) gsap.set(items[0], { rotate: -6 });
          gsap.set(list, { y: () => -half() });

          let current = -1;
          const timeline = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: stage,
              start: 'top top',
              end: () => `+=${(total - 1) * window.innerHeight * 1.1}`,
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true,
              snap: {
                snapTo: 1 / (total - 1),
                duration: { min: 0.3, max: 0.9 },
                delay: 0.08,
                ease: 'power2.inOut',
              },
              onUpdate: (self) => {
                const index = Math.round(self.progress * (total - 1));
                if (bar) gsap.set(bar, { scaleX: self.progress });
                if (knob) gsap.set(knob, { left: `${self.progress * 100}%` });
                if (counter && index !== current) {
                  current = index;
                  counter.textContent = String(index + 1).padStart(2, '0');
                }
              },
            },
          });

          for (let s = 0; s < total - 1; s += 1) {
            timeline
              .to(card, { rotationY: 90, duration: 0.5, ease: 'power2.in' }, s)
              .to(card, { '--glitch': 1, duration: 0.3 } as gsap.TweenVars, s + 0.2)
              .set(shots[s] as HTMLElement, { autoAlpha: 0 }, s + 0.5)
              .set(shots[s + 1] as HTMLElement, { autoAlpha: 1 }, s + 0.5)
              .fromTo(
                card,
                { rotationY: -90 },
                { rotationY: 0, duration: 0.5, ease: 'power2.out', immediateRender: false },
                s + 0.5,
              )
              .to(card, { '--glitch': 0, duration: 0.3 } as gsap.TweenVars, s + 0.7)
              .to(
                stage,
                { '--accent': projects[s + 1]?.accent ?? '#35e4a3', duration: 1 } as gsap.TweenVars,
                s,
              )
              .to(
                infos[s] as HTMLElement,
                { y: () => -offset(), rotate: -6, autoAlpha: 0, duration: 0.6, ease: 'power2.in' },
                s,
              )
              .to(
                infos[s + 1] as HTMLElement,
                { y: 0, rotate: 0, autoAlpha: 1, duration: 0.6, ease: 'power2.out' },
                s + 0.4,
              )
              .to(
                list,
                { y: () => -(s + 1) * step() - half(), duration: 1, ease: 'power2.inOut' },
                s,
              )
              .to(
                items[s] as HTMLElement,
                { opacity: 0.3, scale: 0.85, rotate: -14, x: -18, duration: 0.5 },
                s,
              )
              .to(
                items[s + 1] as HTMLElement,
                { opacity: 1, scale: 1, rotate: -6, x: 0, duration: 0.5 },
                s + 0.5,
              );
          }

          return () => {
            timeline.scrollTrigger?.kill();
            timeline.kill();
          };
        });
      }, stage);

      ScrollTrigger.refresh();

      cleanup = () => ctx.revert();
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [total, projects]);

  /* ── Mobile image pan ────────────────────────────────────────────── */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    void (async () => {
      const { ensureGsap } = await import('@/lib/gsap/setup');
      if (disposed) return;
      const { gsap } = ensureGsap();

      const ctx = gsap.context(() => {
        const mm = gsap.matchMedia();

        mm.add('(max-width: 767px)', () => {
          const shots = gsap.utils.toArray<HTMLElement>('[data-mobile-shot]', root);
          const triggers: ScrollTriggerType[] = [];

          shots.forEach((shot) => {
            const image = shot.querySelector<HTMLElement>('[data-mobile-image]');
            if (!image) return;

            const tween = gsap.fromTo(
              image,
              { yPercent: -8 },
              {
                yPercent: 8,
                ease: 'none',
                scrollTrigger: {
                  trigger: shot,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: true,
                  onToggle: (self) => (self.isActive ? self.animation?.play() : self.animation?.pause()),
                },
              },
            );

            if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
          });

          /* Kill only the triggers this effect owns — never the whole page. */
          return () => {
            triggers.forEach((trigger) => trigger.kill());
          };
        });
      }, root);

      cleanup = () => ctx.revert();
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <section
      id="work"
      aria-labelledby="work-title"
      ref={rootRef}
      className="relative"
    >
      <div className="work-head grid items-end gap-8 px-4 pb-12 pt-14 md:grid-cols-[1.4fr_1fr] md:px-6 md:pb-6 md:pt-40">
        <h2
          id="work-title"
          className="work-title font-display text-[17vw] uppercase leading-[0.85] text-ink md:text-[9vw]"
        >
          {title}
        </h2>
        <p className="work-sub max-w-md text-sm uppercase leading-relaxed tracking-wide text-ink/75 md:ml-auto md:pb-3">
          {subtitle}
        </p>
      </div>

      {/* ── Desktop ─────────────────────────────────────────────────── */}
      <div
        ref={stageRef}
        className="work-stage relative hidden h-[100svh] overflow-hidden md:block"
        style={{
          ['--accent' as string]: projects[0]?.accent ?? '#35e4a3',
          ['--glitch' as string]: 0,
        }}
      >
        {/* Smoke + particles */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 size-[90vh] -translate-x-1/2 -translate-y-1/2"
        >
          {[
            'left-[-10%] top-[5%] size-[75%]',
            'right-[-15%] bottom-[0%] size-[70%]',
            'left-[15%] top-[20%] size-[60%]',
          ].map((position, index) => (
            <div
              key={position}
              data-smoke
              className={`absolute rounded-full ${position}`}
              style={{
                background: `radial-gradient(closest-side, color-mix(in oklab, var(--accent) ${
                  index === 2 ? 90 : 70
                }%, transparent), transparent)`,
                opacity: index === 2 ? 0.75 : 0.9,
                mixBlendMode: 'screen',
              }}
            />
          ))}

          {Array.from({ length: 26 }).map((_, index) => (
            <span
              key={index}
              data-particle
              className="absolute h-1 w-1 rounded-full bg-accent-1"
              style={{
                /* Fixed precision — an unrounded float renders differently on
                   the server and the client and breaks hydration. */
                left: `${(seeded(index, 1) * 100).toFixed(4)}%`,
                top: `${(seeded(index, 2) * 100).toFixed(4)}%`,
                opacity: 0.6,
              }}
            />
          ))}
        </div>

        {/* Thumbnail stack (left) */}
        <ul
          ref={listRef}
          className="work-list absolute left-[3%] top-1/2 z-10 w-[clamp(96px,9.5vw,140px)] -translate-y-1/2 space-y-8 md:left-[5%]"
        >
          {projects.map((project, index) => (
            <li key={project.slug} className="work-item flex origin-left items-center gap-3">
              <span className="font-mono text-[11px] text-ink/60">
                {String(index + 1).padStart(2, '0')}.
              </span>
              <a
                href={project.url ?? '#work'}
                target={project.url ? '_blank' : undefined}
                rel={project.url ? 'noopener noreferrer' : undefined}
                aria-label={`${openProjectLabel} ${project.title}`}
                className="block w-full overflow-hidden rounded-md border border-line"
                data-cursor
              >
                {/* Same 0.72 ratio as the showcase card, so nothing is cropped. */}
                <Image
                  src={project.image_path ?? '/projects/placeholder.webp'}
                  alt=""
                  width={320}
                  height={444}
                  className="aspect-[0.72] w-full object-cover object-top"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  unoptimized
                />
              </a>
            </li>
          ))}
        </ul>

        {/* Card + info */}
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-[clamp(24px,4vw,72px)] [perspective:1400px]">
          <div
            ref={cardRef}
            className="work-card relative h-[min(72vh,660px)] w-[calc(min(72vh,660px)*0.72)] [transform-style:preserve-3d]"
            style={{
              filter:
                'drop-shadow(calc(var(--glitch) * 14px) 0 0 rgba(255,40,90,0.75)) drop-shadow(calc(var(--glitch) * -14px) 0 0 rgba(40,220,255,0.75))',
            }}
          >
            {projects.map((project, index) => (
              <div
                key={project.slug}
                data-work-shot
                className="work-shot absolute inset-0 overflow-hidden bg-bg-deep"
                style={{ clipPath: OCTAGON_CLIP }}
              >
                <Image
                  src={project.image_path ?? '/projects/placeholder.webp'}
                  alt={`${project.title} — ${project.tagline ?? projectAltLabel}`}
                  fill
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="object-contain object-center"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  unoptimized
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.1)_0_1px,transparent_1px_3px)] opacity-25"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.35)]"
                />
              </div>
            ))}

            <OctagonFrame />
          </div>

          {/* Info cards — one per project, swapped by the scroll timeline */}
          <div className="relative w-[clamp(240px,24vw,380px)]">
            {projects.map((project, index) => (
              <div
                key={project.slug}
                data-work-info
                className="work-info absolute inset-x-0 top-0 -translate-y-1/2 rounded-2xl border border-line bg-bg-deep/55 p-7 backdrop-blur-md"
              >
                <p className="text-[11px] uppercase tracking-[0.3em] text-muted">
                  {projectLabel} {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-4 break-words font-display text-[clamp(2rem,3.4vw,3.4rem)] uppercase leading-[0.9] text-ink">
                  {project.title}
                </h3>
                <div className="my-6 h-px w-full bg-line" />
                <div className="flex flex-wrap items-center gap-3">
                  {project.url ? (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-ink/30 px-6 py-3 text-xs uppercase tracking-[0.2em] text-ink transition-colors hover:border-accent-1 hover:text-accent-1"
                      data-cursor
                    >
                      {liveLinkLabel} <span aria-hidden="true">↗</span>
                    </a>
                  ) : null}
                </div>
                {project.tagline ? (
                  <p className="mt-5 text-sm leading-relaxed text-muted">{project.tagline}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="absolute inset-x-0 bottom-8 z-10 mx-auto flex max-w-[1400px] items-center gap-6 px-6">
          <span className="text-[11px] uppercase tracking-[0.3em] text-muted">{scrollHint}</span>
          <div className="relative h-[3px] flex-1">
            {/* Track */}
            <div className="absolute inset-0 rounded-full bg-line" />
            {/* Filled portion */}
            <div
              ref={barRef}
              className="absolute inset-y-0 left-0 w-full origin-left scale-x-0 rounded-full bg-gradient-to-r from-accent-1 to-accent-2"
              style={{ boxShadow: '0 0 14px rgba(16,189,245,0.55)' }}
            />
            {/* Progress head */}
            <span
              ref={knobRef}
              aria-hidden="true"
              className="absolute top-1/2 left-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink shadow-[0_0_10px_rgba(232,241,255,0.85)]"
            />
          </div>
          <span className="work-counter font-mono text-sm text-ink">
            <span ref={counterRef}>01</span>
            <span className="text-muted"> / </span>
            {String(total).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* ── Mobile ──────────────────────────────────────────────────── */}
      <div className="space-y-10 px-4 pb-10 pt-12 md:hidden">
        {projects.map((project, index) => (
          <article key={project.slug} data-mobile-shot className="relative">
            <div
              className="relative aspect-[0.72] w-full overflow-hidden bg-bg-deep"
              style={{ clipPath: OCTAGON_CLIP }}
            >
              <Image
                data-mobile-image
                src={project.image_path ?? '/projects/placeholder.webp'}
                alt={`${project.title} — ${project.tagline ?? projectAltLabel}`}
                fill
                sizes="100vw"
                className="object-contain object-center"
                loading={index === 0 ? 'eager' : 'lazy'}
                unoptimized
              />
            </div>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-accent-1">
                  {projectLabel} {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-1 font-display text-2xl uppercase text-ink">{project.title}</h3>
                {project.tagline ? <p className="mt-1 text-sm text-muted">{project.tagline}</p> : null}
              </div>
              {project.url ? (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] uppercase tracking-[0.25em] text-ink/70 transition-colors hover:text-accent-1"
                >
                  {liveLinkLabel} ↗
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
