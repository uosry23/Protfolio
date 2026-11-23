'use client';

export const APP_READY_EVENT = 'app:ready';

declare global {
  interface Window {
    __APP_READY__?: boolean;
  }
}

/** Flags the app as "content is visible" and notifies every listener. */
export function markAppReady() {
  if (typeof window === 'undefined') return;
  window.__APP_READY__ = true;
  window.dispatchEvent(new Event(APP_READY_EVENT));
}

export function isAppReady() {
  return typeof window !== 'undefined' && window.__APP_READY__ === true;
}

/**
 * Runs `callback` as soon as the app is ready.
 * If the app is already ready (preloader skipped), the callback runs immediately.
 */
export function onAppReady(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  if (isAppReady()) {
    callback();
    return () => {};
  }
  window.addEventListener(APP_READY_EVENT, callback, { once: true });
  return () => window.removeEventListener(APP_READY_EVENT, callback);
}
