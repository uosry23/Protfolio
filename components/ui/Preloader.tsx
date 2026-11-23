'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

import { markAppReady } from '@/lib/gsap/ready';
import { prefersReducedMotion } from '@/lib/utils';

const SCRAMBLE_CHARS = '!<>/\\_-=+*#';
const SEEN_KEY = 'ya-preloader-seen';

/**
 * Intro preloader:
 *  • waits for `document.fonts.ready` so the counters never render in the fallback face
 *  • logo pieces fly in, the name scrambles, a 000→100 counter runs, a line fills
 *  • the whole overlay is wiped away with a clip-path reveal
 */
export function Preloader({ siteName }: { siteName: string }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const finish = () => {
      root.remove();
      markAppReady();
    };

    // The dashboard is a tool, not a showpiece — no intro animation there.
    if (window.location.pathname.startsWith('/dashboard')) {
      finish();
      return;
    }

    // Reduced motion → no intro at all.
    if (prefersReducedMotion()) {
      finish();
      return;
    }

    // Already seen in this session → skip the intro for a faster first paint.
    if (sessionStorage.getItem(SEEN_KEY) === '1') {
      finish();
      return;
    }

    sessionStorage.setItem(SEEN_KEY, '1');

    let disposed = false;
    let cleanup: (() => void) | undefined;

    void (async () => {
      const { ensureGsap } = await import('@/lib/gsap/setup');
      if (disposed) return;
      const { gsap } = ensureGsap();

      const pieces = root.querySelectorAll<HTMLElement>('[data-pl-piece]');
      const nameEl = root.querySelector<HTMLElement>('[data-pl-name]');
      const countEl = root.querySelector<HTMLElement>('[data-pl-count]');
      const lineEl = root.querySelector<HTMLElement>('[data-pl-line]');
      const contentEl = root.querySelector<HTMLElement>('[data-pl-content]');

      const fontsReady = document.fonts?.ready ?? Promise.resolve();
      await fontsReady;
      if (disposed) return;

      const ctx = gsap.context(() => {
        const counter = countEl;
        gsap.set(root, { clipPath: 'inset(0% 0% 0% 0%)' });
        gsap.set(pieces, { autoAlpha: 0, scale: 0.4 });
        gsap.set(nameEl, { autoAlpha: 0 });
        gsap.set(counter, { textContent: '000' });
        gsap.set(lineEl, { scaleX: 0 });

        const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });

        tl.to(
          pieces,
          {
            autoAlpha: 1,
            scale: 1,
            x: 0,
            y: 0,
            rotate: 0,
            duration: 1.1,
            stagger: 0.07,
            ease: 'back.out(1.6)',
          },
          0,
        )
          .to(nameEl, { autoAlpha: 1, duration: 0.3 }, 0.35)
          .to(
            countEl,
            {
              duration: 1.6,
              ease: 'power2.inOut',
              onUpdate() {
                const value = Math.round((this.progress() as number) * 100);
                if (counter) counter.textContent = String(value).padStart(3, '0');
              },
            },
            0.2,
          )
          .to(lineEl, { scaleX: 1, duration: 1.6 }, 0.2)
          .to(
            contentEl,
            { yPercent: -40, autoAlpha: 0, duration: 0.6, ease: 'power2.in' },
            '>-0.1',
          )
          .to(root, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.1, ease: 'expo.inOut' }, '>-0.25')
          .add(finish, '>-0.05');

        // Scramble the site name while the counter runs.
        if (nameEl) {
          const finalText = nameEl.textContent ?? '';
          const start = performance.now();
          const duration = 900;
          const tick = (now: number) => {
            if (disposed) return;
            const progress = Math.min(1, (now - start) / duration);
            const revealed = Math.floor(finalText.length * progress);
            let output = '';
            for (let i = 0; i < finalText.length; i += 1) {
              output +=
                i < revealed
                  ? finalText[i]
                  : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
            }
            nameEl.textContent = output;
            if (progress < 1) requestAnimationFrame(tick);
            else nameEl.textContent = finalText;
          };
          requestAnimationFrame(tick);
        }
      }, root);

      cleanup = () => ctx.revert();
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <div
      id="preloader"
      ref={rootRef}
      aria-hidden="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-deep"
      style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
    >
      <div data-pl-content className="flex flex-col items-center gap-6">
        <div className="relative flex h-24 w-24 items-center justify-center md:h-28 md:w-28">
          {[0, 1, 2, 3].map((index) => (
            <span
              key={index}
              data-pl-piece
              className="absolute h-6 w-6"
              style={{
                background: 'linear-gradient(135deg,#10BDF5,#7AD9FF)',
                borderRadius: index % 2 === 0 ? '999px 4px 999px 4px' : '4px 999px 4px 999px',
              }}
            />
          ))}
          <Image
            src="/brand/ya-logo.png"
            alt=""
            width={112}
            height={112}
            className="relative h-full w-auto object-contain drop-shadow-[0_18px_34px_rgba(16,90,255,0.5)]"
            unoptimized
          />
        </div>

        <div className="flex items-baseline gap-4">
          <span
            data-pl-name
            className="font-display text-lg uppercase tracking-[0.35em] text-ink md:text-xl"
          >
            {siteName}
          </span>
          <span
            data-pl-count
            className="font-mono text-sm tabular-nums text-accent-1"
            aria-hidden="true"
          >
            000
          </span>
        </div>

        <div className="h-px w-[min(320px,70vw)] bg-line">
          <div
            data-pl-line
            className="h-px w-full origin-left"
            style={{ background: 'linear-gradient(90deg,#35E4A3,#8DEFC6)' }}
          />
        </div>
      </div>
    </div>
  );
}
