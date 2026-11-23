'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

let registered = false;

/**
 * Registers the GSAP plugins exactly once, client-side only.
 *
 * This module is imported dynamically inside `useEffect` so the GSAP runtime
 * never touches the server bundle — keeps the SSR output free of window
 * references and avoids hydration mismatches.
 */
export function ensureGsap() {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    gsap.config({ nullTargetWarn: false });
    registered = true;
  }
  return { gsap, ScrollTrigger, SplitText };
}

export type GsapBundle = ReturnType<typeof ensureGsap>;
export { gsap, ScrollTrigger, SplitText };
