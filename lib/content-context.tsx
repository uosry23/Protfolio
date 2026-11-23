'use client';

import { createContext, useContext } from 'react';

import type { SiteCopy, SiteSettings } from '@/lib/types';

export type SiteContextValue = {
  settings: SiteSettings;
  copy: SiteCopy;
};

const SiteContext = createContext<SiteContextValue | null>(null);

/**
 * Publishes the backend content to every client component.
 *
 * The root layout is a server component, so it fetches the content from
 * Supabase and hands it down through this provider. Error pages and other
 * client-only boundaries can then read the same copy without another fetch.
 */
export function ContentProvider({
  value,
  children,
}: {
  value: SiteContextValue;
  children: React.ReactNode;
}) {
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

/** Returns the backend content, or `null` outside a provider. */
export function useSiteContext() {
  return useContext(SiteContext);
}
