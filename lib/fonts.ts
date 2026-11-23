import localFont from 'next/font/local';

/**
 * Self-hosted fonts (SIL Open Font License).
 * We host the woff2 files ourselves instead of hitting Google CDN —
 * no third-party request, no layout shift, no privacy concern.
 *
 * `adjustFontFallback` reproduces the metric overrides of the reference
 * site so the layout does not jump while the webfont loads.
 */

export const anton = localFont({
  src: [
    { path: '../public/fonts/anton-latin.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/anton-latin-ext.woff2', weight: '400', style: 'normal' },
  ],
  variable: '--font-anton',
  display: 'swap',
  preload: true,
  fallback: ['Anton Fallback', 'Impact', 'Arial Narrow', 'sans-serif'],
  adjustFontFallback: false,
});

export const interTight = localFont({
  src: [
    { path: '../public/fonts/inter-tight-latin.woff2', weight: '100 900', style: 'normal' },
    { path: '../public/fonts/inter-tight-latin-ext.woff2', weight: '100 900', style: 'normal' },
  ],
  variable: '--font-inter-tight',
  display: 'swap',
  preload: true,
  fallback: ['Inter Tight Fallback', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  adjustFontFallback: false,
});

export const fontVariables = `${anton.variable} ${interTight.variable}`;
