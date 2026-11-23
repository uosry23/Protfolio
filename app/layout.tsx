import type { Metadata, Viewport } from 'next';

import { CustomCursor } from '@/components/ui/CustomCursor';
import { Preloader } from '@/components/ui/Preloader';
import { SmoothScroll } from '@/components/providers/SmoothScroll';
import { ContentProvider } from '@/lib/content-context';
import { getSiteContent } from '@/lib/data/content';
import { fontVariables } from '@/lib/fonts';

import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yousryahmed.dev';

/**
 * Every metadata field comes from the backend (`site_settings` → `copy.seo`),
 * so the title, description and keywords can be edited without a redeploy.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { settings, copy } = await getSiteContent();
  const seo = copy.seo;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: seo.title,
      template: `%s · ${settings.ownerName}`,
    },
    description: seo.description,
    keywords: seo.keywords,
    authors: [{ name: settings.ownerName }],
    creator: settings.ownerName,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: siteUrl,
      siteName: settings.ownerName,
      title: seo.ogTitle,
      description: seo.ogDescription,
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.ogTitle,
      description: seo.ogDescription,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
    category: 'technology',
  };
}

/**
 * Every route reads its content from the backend at request time, so nothing is
 * prerendered at build time. This also keeps the 404 page dynamic — it renders
 * the copy that lives in the database.
 */
export const dynamic = 'force-dynamic';

export const viewport: Viewport = {
  themeColor: '#050a1f',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { settings, copy } = await getSiteContent();

  return (
    <html lang="en" className={`${fontVariables} antialiased`}>
      <body className="min-h-dvh bg-bg font-sans text-ink">
        <ContentProvider value={{ settings, copy }}>
          <a
            href="#main"
            className="sr-only-focusable fixed left-4 top-4 z-[300] rounded-full bg-accent-1 px-5 py-2 text-sm uppercase tracking-[0.18em] text-bg-deep"
          >
            {copy.system.skipToContent}
          </a>

          <noscript>
            <style>{`#preloader{display:none!important}`}</style>
          </noscript>

          <Preloader siteName={settings.ownerName} />
          <CustomCursor />
          <SmoothScroll />

          <div className="grain relative min-h-dvh">
            <main id="main">{children}</main>
          </div>
        </ContentProvider>
      </body>
    </html>
  );
}
