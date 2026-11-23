export type Project = {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  url: string | null;
  accent: string;
  image_path: string | null;
  image_source: 'local' | 'supabase';
  tech: string[];
  sort_order: number;
};

export type Service = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  sort_order: number;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string | null;
  message: string;
  sort_order: number;
};

export type Stat = {
  id: string;
  label: string;
  value: number;
  suffix: string;
  sort_order: number;
};

export type SiteSettings = {
  siteName: string;
  ownerName: string;
  role: string;
  heroEyebrow: string;
  heroHeadlineTop: string;
  heroHeadlineBottom: string;
  heroIntro: string;
  aboutStatement: string;
  aboutBio: string[];
  aboutPhoto: string | null;
  aboutCaption: string;
  tech: string[];
  whatsappNumber: string;
  email: string | null;
  consultationPrice: number;
  consultationDuration: string;
  socials: { label: string; href: string }[];
  navLinks: { label: string; href: string }[];
  countries: { code: string; dial: string; label: string }[];
  projectTypes: string[];
  budgets: string[];
  udemyUrl: string | null;
};

/**
 * Every piece of copy rendered by the UI.
 *
 * Lives in its own key of the `site_settings` table (`key = 'copy'`) so the
 * whole site can be re-worded from the backend without touching the code.
 */
export type SiteCopy = {
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogTitle: string;
    ogDescription: string;
    knowsAbout: string[];
    areaServed: string[];
    availableLanguage: string[];
    priceRange: string;
  };
  hero: {
    ctaPrimary: string;
    ctaSecondary: string;
  };
  work: {
    title: string;
    subtitle: string;
    scrollHint: string;
  };
  about: {
    eyebrow: string;
  };
  course: {
    eyebrow: string;
    title: string;
    subtitle: string;
    ctaLabel: string;
    source: string;
  };
  services: {
    title: string;
    subtitle: string;
  };
  consultation: {
    eyebrow: string;
    title: string;
    body: string;
    bullets: string[];
  };
  contact: {
    eyebrow: string;
    title: string;
    intro: string;
    details: { label: string; value: string }[];
  };
  footer: {
    description: string;
    note: string;
  };
  system: {
    skipToContent: string;
    errorTitle: string;
    errorBody: string;
    errorRetry: string;
    notFoundTitle: string;
    notFoundBody: string;
    notFoundBackHome: string;
  };
  form: {
    nameLabel: string;
    namePlaceholder: string;
    whatsappLabel: string;
    whatsappPlaceholder: string;
    countryLabel: string;
    projectTypeLabel: string;
    projectTypePlaceholder: string;
    budgetLabel: string;
    messageLabel: string;
    messagePlaceholder: string;
    submitLabel: string;
    sendingLabel: string;
    successTitle: string;
    sendAnotherLabel: string;
    errorName: string;
    errorNameLong: string;
    errorWhatsapp: string;
    errorWhatsappLong: string;
    errorCountryCode: string;
    errorGeneric: string;
    successMessage: string;
    errorMessage: string;
  };
};

export type SiteContent = {
  projects: Project[];
  services: Service[];
  testimonials: Testimonial[];
  stats: Stat[];
  settings: SiteSettings;
  copy: SiteCopy;
};
