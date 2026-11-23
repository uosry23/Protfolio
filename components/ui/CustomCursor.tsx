'use client';

import { useEffect, useRef } from 'react';

import { isFinePointer } from '@/lib/utils';

/**
 * Custom cursor: a fast dot that tracks the pointer precisely plus a ring
 * that lags behind it. Elements can opt in with `data-cursor` (ring grows)
 * or `data-cursor-label="Text"` (ring shows a label inside).
 *
 * Only enabled on fine pointers — never on touch devices.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!isFinePointer()) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    void (async () => {
      const { ensureGsap } = await import('@/lib/gsap/setup');
      if (disposed) return;
      const { gsap } = ensureGsap();

      document.documentElement.classList.add('custom-cursor');

      const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' });
      const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' });
      const ringX = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' });
      const ringY = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' });

      const move = (event: PointerEvent) => {
        dotX(event.clientX);
        dotY(event.clientY);
        ringX(event.clientX);
        ringY(event.clientY);
      };

      const over = (event: PointerEvent) => {
        const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(
          '[data-cursor],[data-cursor-label]',
        );
        if (!target) {
          gsap.to(ring, { scale: 1, backgroundColor: 'rgba(53,228,163,0)', borderColor: '#35e4a3' });
          gsap.to(dot, { scale: 1, opacity: 1 });
          label.textContent = '';
          return;
        }

        const cursorLabel = target.dataset.cursorLabel;
        if (cursorLabel) {
          label.textContent = cursorLabel;
          gsap.to(ring, {
            scale: 3.2,
            backgroundColor: '#f2efe6',
            borderColor: '#f2efe6',
            duration: 0.35,
            ease: 'power3',
          });
          gsap.to(label, { opacity: 1, duration: 0.25 });
          gsap.to(dot, { scale: 0, opacity: 0 });
        } else {
          gsap.to(ring, {
            scale: 1.8,
            backgroundColor: 'rgba(53,228,163,0.12)',
            borderColor: '#35e4a3',
            duration: 0.35,
            ease: 'power3',
          });
          gsap.to(dot, { scale: 0, opacity: 0 });
        }
      };

      const leave = () => {
        gsap.to([dot, ring], { opacity: 0, duration: 0.2 });
      };
      const enter = () => {
        gsap.to([dot, ring], { opacity: 1, duration: 0.2 });
      };

      window.addEventListener('pointermove', move, { passive: true });
      document.addEventListener('pointerover', over, { passive: true });
      document.addEventListener('pointerleave', leave);
      document.addEventListener('pointerenter', enter);

      cleanup = () => {
        window.removeEventListener('pointermove', move);
        document.removeEventListener('pointerover', over);
        document.removeEventListener('pointerleave', leave);
        document.removeEventListener('pointerenter', enter);
        document.documentElement.classList.remove('custom-cursor');
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[200] hidden md:block">
      <div
        ref={dotRef}
        className="absolute left-0 top-0 -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-accent-1"
      />
      <div
        ref={ringRef}
        className="absolute left-0 top-0 -ml-[18px] -mt-[18px] flex h-9 w-9 items-center justify-center rounded-full border border-accent-1"
      >
        <span
          ref={labelRef}
          className="select-none text-[10px] font-semibold uppercase tracking-widest text-bg-deep opacity-0"
        />
      </div>
    </div>
  );
}
