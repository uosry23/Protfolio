export type ClassValue = string | false | null | undefined;

export function cn(...classes: ClassValue[]) {
  return classes.filter(Boolean).join(' ');
}

/** True when the user asked the OS to reduce motion. Client-side only. */
export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** True on devices with a precise pointer (mouse/trackpad). */
export function isFinePointer() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

/** Builds a wa.me link with an optional pre-filled message. */
export function whatsappLink(number: string, message?: string) {
  const clean = number.replace(/[^\d]/g, '');
  const base = `https://wa.me/${clean}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Normalises a phone number to international digits (no +, no spaces). */
export function normalisePhone(input: string) {
  return input.replace(/[^\d]/g, '');
}

/** Formats a number with thin separators for display. */
export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}
