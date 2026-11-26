'use client';

import { useEffect, useRef } from 'react';

import { whatsappLink } from '@/lib/utils';

export function Consultation({
  price,
  duration,
  whatsappNumber,
  bullets,
  eyebrow,
  title,
  body,
}: {
  price: number;
  duration: string;
  whatsappNumber: string;
  bullets: string[];
  eyebrow: string;
  title: string;
  body: string;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const priceRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    void (async () => {
      const { ensureGsap } = await import('@/lib/gsap/setup');
      if (disposed) return;
      const { gsap, SplitText } = ensureGsap();

      const ctx = gsap.context(() => {
        gsap.fromTo(
          '[data-cs-card]',
          { clipPath: 'inset(12% 8% 12% 8% round 24px)', scale: 0.96 },
          {
            clipPath: 'inset(0% 0% 0% 0% round 24px)',
            scale: 1,
            duration: 1.4,
            ease: 'expo.inOut',
            scrollTrigger: { trigger: '[data-cs-card]', start: 'top 85%' },
          },
        );

        const title = new SplitText('[data-cs-title]', {
          type: 'lines',
          mask: 'lines',
          linesClass: 'hero-line',
        });
        gsap.fromTo(
          title.lines,
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: 1,
            stagger: 0.08,
            ease: 'expo.out',
            scrollTrigger: { trigger: '[data-cs-title]', start: 'top 88%' },
          },
        );

        gsap.fromTo(
          '[data-cs-item]',
          { x: -30, autoAlpha: 0 },
          {
            x: 0,
            autoAlpha: 1,
            duration: 0.8,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: { trigger: '[data-cs-list]', start: 'top 85%' },
          },
        );

        gsap.fromTo(
          '[data-cs-price]',
          { yPercent: 40, autoAlpha: 0 },
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: 1,
            ease: 'expo.out',
            scrollTrigger: { trigger: '[data-cs-price]', start: 'top 90%' },
          },
        );

        const state = { value: 0 };
        gsap.to(state, {
          value: price,
          duration: 1.4,
          ease: 'power3.out',
          onUpdate: () => {
            if (priceRef.current) priceRef.current.textContent = String(Math.round(state.value));
          },
        });
      }, root);

      cleanup = () => ctx.revert();
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [price]);

  return (
    <section
      id="consultation"
      aria-labelledby="cs-title"
      ref={rootRef}
      className="px-4 pb-10 pt-16 md:px-6 md:pt-24"
    >
      <div className="mx-auto max-w-[1400px]">
        {/* p-px + gradient = 1px gradient border without extra markup */}
        <div className="cs-card relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent-1/45 via-accent-1/10 to-transparent p-px">
          <div className="relative overflow-hidden rounded-[calc(1.5rem-1px)] bg-bg-deep/85 px-6 py-10 md:px-14 md:py-14">
            <div className="grid gap-10 md:grid-cols-[1.6fr_1fr] md:gap-16">
              <div>
                <p className="mb-6 text-xs uppercase tracking-[0.3em] text-accent-1">
                  {eyebrow}
                </p>
                <h2
                  id="cs-title"
                  data-cs-title
                  className="cs-title max-w-[16ch] font-display text-[11vw] uppercase leading-[0.9] text-ink md:text-[4.6vw]"
                >
                  {title}
                </h2>
                <p className="mt-6 max-w-lg text-sm leading-relaxed text-ink/80 md:text-base">
                  {body}
                </p>

                <ul data-cs-list className="mt-8 space-y-3">
                  {bullets.map((bullet) => (
                    <li
                      key={bullet}
                      data-cs-item
                      className="cs-item flex items-center gap-3 text-sm uppercase tracking-wide text-ink/85"
                    >
                      <span
                        aria-hidden="true"
                        className="size-2 rotate-45 bg-accent-1"
                      />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>

              <div data-cs-price className="cs-price md:text-right">
                <p className="cs-amount font-display text-[28vw] leading-[0.85] text-ink md:text-[11vw]">
                  <span className="text-accent-1">$</span>
                  <span ref={priceRef}>0</span>
                </p>
                <p className="mt-3 text-[11px] uppercase tracking-[0.3em] text-muted">{duration}</p>
                <a
                  href={whatsappLink(
                    whatsappNumber,
                    `Hi Yousry, I'd like to book the ${price}$ strategy call.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cs-cta mt-8 inline-block rounded-full bg-accent-1 px-8 py-4 text-sm uppercase tracking-[0.18em] text-bg-deep transition-transform duration-300 hover:-translate-y-0.5"
                  data-cursor
                >
                  Book on WhatsApp <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>

            <span
              aria-hidden="true"
              className="cs-sheen animate-shimmer absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%)',
                backgroundSize: '200% 100%',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
