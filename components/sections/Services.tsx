'use client';

import { useEffect, useRef } from 'react';

import type { Service } from '@/lib/types';

export function Services({
  services,
  title,
  subtitle,
}: {
  services: Service[];
  title: string;
  subtitle: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    void (async () => {
      const { ensureGsap } = await import('@/lib/gsap/setup');
      if (disposed) return;
      const { gsap, ScrollTrigger } = ensureGsap();

      const ctx = gsap.context(() => {
        const mm = gsap.matchMedia();

        mm.add('(min-width: 768px)', () => {
          const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 64);

          const horizontal = gsap.to(track, {
            x: () => -distance(),
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: () => `+=${distance()}`,
              scrub: 1,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                if (barRef.current) {
                  gsap.set(barRef.current, { scaleX: self.progress });
                }
              },
            },
          });

          gsap.utils.toArray<HTMLElement>('[data-svc-card]').forEach((card) => {
            gsap.fromTo(
              card,
              { x: 80, autoAlpha: 0 },
              {
                x: 0,
                autoAlpha: 1,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: card,
                  containerAnimation: horizontal,
                  start: 'left 85%',
                },
              },
            );
          });

          return () => {
            horizontal.scrollTrigger?.kill();
            horizontal.kill();
          };
        });

        mm.add('(max-width: 767px)', () => {
          gsap.fromTo(
            '[data-svc-card]',
            { y: 80, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 1,
              stagger: 0.08,
              ease: 'power3.out',
              scrollTrigger: { trigger: track, start: 'top 80%' },
            },
          );
        });

        ScrollTrigger.refresh();
      }, section);

      cleanup = () => ctx.revert();
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [services.length]);

  return (
    <section
      id="services"
      aria-labelledby="svc-title"
      ref={sectionRef}
      className="svc-pin relative px-4 pt-28 md:flex md:h-[100svh] md:flex-col md:justify-center md:overflow-hidden md:px-6 md:pt-0"
    >
      <div className="grid items-end gap-8 md:grid-cols-[1.4fr_1fr]">
        <h2
          id="svc-title"
          className="font-display text-[17vw] uppercase leading-[0.85] text-ink md:text-[9vw]"
        >
          {title}
        </h2>
        <p className="max-w-md text-sm uppercase leading-relaxed tracking-wide text-ink/75 md:ml-auto md:pb-3">
          {subtitle}
        </p>
      </div>

      <div className="mt-10 md:mt-14">
        <div
          ref={trackRef}
          className="flex gap-5 overflow-x-auto px-4 pb-6 [scrollbar-width:none] md:w-max md:overflow-visible md:px-6 [&::-webkit-scrollbar]:hidden"
        >
          {services.map((service, index) => (
            <article
              key={service.id}
              data-svc-card
              className={`flex h-[min(68vh,560px)] w-[min(84vw,640px)] shrink-0 flex-col justify-between rounded-2xl p-8 md:w-[640px] md:p-12 ${
                index % 2 === 0 ? 'bg-ink text-bg-deep' : 'border border-line bg-bg-deep/70 text-ink'
              }`}
            >
              <div>
                <span className="font-display text-3xl opacity-60 md:text-4xl">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-6 font-display text-4xl leading-[0.95] md:text-6xl">
                  {service.title}
                </h3>
                <p className="mt-6 max-w-lg text-sm leading-relaxed opacity-80 md:text-base">
                  {service.description}
                </p>
              </div>

              <ul className="mt-8 flex flex-wrap gap-2">
                {service.tags.map((tag) => (
                  <li
                    key={tag}
                    className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.15em] ${
                      index % 2 === 0 ? 'border-bg-deep/25' : 'border-line'
                    }`}
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-2 max-w-[1400px] px-4 md:px-6">
          <div className="relative h-1 w-full overflow-hidden bg-line">
            <div
              ref={barRef}
              className="svc-bar absolute inset-0 origin-left scale-x-0 bg-accent-1"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
