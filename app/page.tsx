import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { About } from '@/components/sections/About';
import { Consultation } from '@/components/sections/Consultation';
import { Contact } from '@/components/sections/Contact';
import { Course } from '@/components/sections/Course';
import { Hero } from '@/components/sections/Hero';
import { Services } from '@/components/sections/Services';
import { Work } from '@/components/sections/Work';
import { getSiteContent } from '@/lib/data/content';

/**
 * The page is rendered per request, so every word, link and image comes from
 * Supabase. How often the site re-reads the backend is controlled by
 * `CONTENT_REVALIDATE` (default 60s) in `lib/data/content.ts` — edit a row in
 * the dashboard and it is live within that window, no redeploy needed.
 */
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { projects, services, testimonials, stats, settings, copy } = await getSiteContent();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yousryahmed.dev';

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: settings.ownerName,
    url: siteUrl,
    jobTitle: settings.role,
    description: settings.heroIntro,
    knowsAbout: copy.seo.knowsAbout,
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: `${settings.ownerName} — Web Development`,
    url: siteUrl,
    image: `${siteUrl}/icon.png`,
    logo: `${siteUrl}/icon.png`,
    founder: { '@type': 'Person', name: settings.ownerName },
    areaServed: copy.seo.areaServed,
    availableLanguage: copy.seo.availableLanguage,
    priceRange: copy.seo.priceRange,
    description: settings.heroIntro,
    serviceType: services.map((service) => service.title),
  };

  const projectListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: projects.map((project, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: project.title,
      url: project.url ?? siteUrl,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectListSchema) }}
      />

      <Header
        name={settings.ownerName}
        links={settings.navLinks}
        whatsappNumber={settings.whatsappNumber}
      />

      <Hero
        giant={settings.heroEyebrow}
        eyebrow={settings.heroHeadlineTop}
        headline={settings.heroHeadlineBottom}
        intro={settings.heroIntro}
        name={settings.ownerName}
        whatsappNumber={settings.whatsappNumber}
        ctaPrimary={copy.hero.ctaPrimary}
        ctaSecondary={copy.hero.ctaSecondary}
      />

      <Work
        projects={projects}
        title={copy.work.title}
        subtitle={copy.work.subtitle}
        scrollHint={copy.work.scrollHint}
      />

      <About
        statement={settings.aboutStatement}
        name={settings.ownerName}
        role={settings.role}
        bio={settings.aboutBio}
        photo={settings.aboutPhoto}
        caption={settings.aboutCaption}
        tech={settings.tech}
        stats={stats}
        eyebrow={copy.about.eyebrow}
      />

      <Course
        testimonials={testimonials}
        udemyUrl={settings.udemyUrl}
        eyebrow={copy.course.eyebrow}
        title={copy.course.title}
        subtitle={copy.course.subtitle}
        ctaLabel={copy.course.ctaLabel}
        source={copy.course.source}
      />

      <Services
        services={services}
        title={copy.services.title}
        subtitle={copy.services.subtitle}
      />

      <Consultation
        price={settings.consultationPrice}
        duration={settings.consultationDuration}
        whatsappNumber={settings.whatsappNumber}
        bullets={copy.consultation.bullets}
        eyebrow={copy.consultation.eyebrow}
        title={copy.consultation.title}
        body={copy.consultation.body}
      />

      <Contact
        countries={settings.countries}
        projectTypes={settings.projectTypes}
        budgets={settings.budgets}
        whatsappNumber={settings.whatsappNumber}
        email={settings.email}
        copy={{ ...copy.contact, ...copy.form }}
      />

      <Footer
        name={settings.ownerName}
        description={copy.footer.description}
        links={settings.navLinks}
        socials={settings.socials}
        whatsappNumber={settings.whatsappNumber}
        year={new Date().getFullYear()}
        note={copy.footer.note}
      />
    </>
  );
}
