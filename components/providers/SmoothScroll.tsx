'use client';

import { useEffect } from 'react';

import { prefersReducedMotion } from '@/lib/utils';

/**
 * Smooth scrolling (Lenis) wired into GSAP's ticker so ScrollTrigger stays
 * perfectly in sync with the interpolated scroll position.
 *
 * Disabled automatically for users who prefer reduced motion.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    void (async () => {
      const [{ default: Lenis }, { ensureGsap }] = await Promise.all([
        import('lenis'),
        import('@/lib/gsap/setup'),
      ]);

      if (cancelled) return;

      const { gsap, ScrollTrigger } = ensureGsap();

      const lenis = new Lenis({
        lerp: 0.09,
        autoRaf: false,
        anchors: true,
        smoothWheel: true,
        touchMultiplier: 1.6,
      });

      lenis.on('scroll', ScrollTrigger.update);

      const raf = (time: number) => {
        lenis.raf(time * 1000);
      };

      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      cleanup = () => {
        gsap.ticker.remove(raf);
        lenis.destroy();
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return null;
}
