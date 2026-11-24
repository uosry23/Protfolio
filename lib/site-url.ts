import 'server-only';

/**
 * The canonical public URL of the site.
 *
 * `NEXT_PUBLIC_SITE_URL` is the source of truth, but it is often left over
 * from a domain that is not attached to the deployment any more (or that no
 * longer resolves). Serving a sitemap and canonical tags that point to a dead
 * domain costs rankings, so those values are ignored and the real deployment
 * URL is used instead.
 *
 * Vercel exposes the production URL of the project automatically, so this
 * works with no configuration at all.
 */
const LEGACY_URLS = new Set(['https://yousryahmed.dev', 'http://yousryahmed.dev']);

function normalise(value: string) {
  return value.trim().replace(/\/+$/, '');
}

export function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (explicit && !LEGACY_URLS.has(normalise(explicit))) {
    return normalise(explicit);
  }

  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || process.env.VERCEL_URL?.trim();

  if (vercel) {
    const host = normalise(vercel);
    return host.startsWith('http') ? host : `https://${host}`;
  }

  return 'https://protfolio-blond-five.vercel.app';
}
