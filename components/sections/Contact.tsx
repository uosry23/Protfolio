'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useActionState, useEffect, useId, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { initialInquiryState, submitInquiry } from '@/app/actions';
import type { SiteCopy } from '@/lib/types';
import { whatsappLink } from '@/lib/utils';

type Country = { code: string; dial: string; label: string };

function SubmitButton({ copy }: { copy: SiteCopy['form'] }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-full bg-ink px-8 py-4 text-sm uppercase tracking-[0.18em] text-bg-deep transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? copy.sendingLabel : copy.submitLabel}
      <span aria-hidden="true">→</span>
    </button>
  );
}

export function Contact({
  countries,
  projectTypes,
  budgets,
  whatsappNumber,
  email,
  copy,
}: {
  countries: Country[];
  projectTypes: string[];
  budgets: string[];
  whatsappNumber: string;
  email: string | null;
  copy: SiteCopy['contact'] & SiteCopy['form'];
}) {
  const [state, formAction] = useActionState(submitInquiry, initialInquiryState);
  const formRef = useRef<HTMLFormElement>(null);
  const uid = useId();

  /* The country select sends the dial code; the label travels alongside it
     so the inquiry keeps a readable country name, not just "SA". */
  const [dial, setDial] = useState(countries[0]?.dial ?? '+20');
  const selectedCountry = countries.find((country) => country.dial === dial) ?? countries[0];

  /* Reveal animation for the whole section. */
  const rootRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    void (async () => {
      const { ensureGsap } = await import('@/lib/gsap/setup');
      if (disposed) return;
      const { gsap, SplitText } = ensureGsap();

      const ctx = gsap.context(() => {
        const title = new SplitText('[data-ct-title]', {
          type: 'lines',
          mask: 'lines',
          linesClass: 'hero-line',
        });
        gsap.fromTo(
          title.lines,
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: 1.1,
            stagger: 0.1,
            ease: 'expo.out',
            scrollTrigger: { trigger: '[data-ct-title]', start: 'top 85%' },
          },
        );

        gsap.fromTo(
          '[data-ct-field]',
          { y: 40, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.9,
            stagger: 0.07,
            ease: 'power3.out',
            scrollTrigger: { trigger: '[data-ct-form]', start: 'top 82%' },
          },
        );

        gsap.fromTo(
          '[data-ct-side]',
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 1,
            scrollTrigger: { trigger: '[data-ct-side]', start: 'top 85%' },
          },
        );
      }, root);

      cleanup = () => ctx.revert();
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  /* Reset the form after a successful send. */
  useEffect(() => {
    if (state.status === 'success') formRef.current?.reset();
  }, [state.status]);

  const errorFor = (field: string) => state.errors?.[field]?.[0];

  return (
    <section
      id="contact"
      aria-labelledby="ct-title"
      ref={rootRef}
      className="relative px-4 pb-24 pt-28 md:px-6 md:pt-40"
    >
      <div className="mx-auto max-w-[1400px]">
        <p className="mb-5 text-[11px] uppercase tracking-[0.3em] text-muted">{copy.eyebrow}</p>
        <h2
          id="ct-title"
          data-ct-title
          className="ct-title font-display text-[16vw] uppercase leading-[0.86] text-ink md:text-[7.2vw]"
        >
          {copy.title}
        </h2>

        <div className="mt-12 grid gap-12 md:mt-16 md:grid-cols-[0.8fr_1.2fr] md:gap-20">
          <div data-ct-side>
            <p className="text-sm leading-relaxed text-muted md:text-base">{copy.intro}</p>

            <a
              href={whatsappLink(whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-ink/25 px-7 py-3 text-sm uppercase tracking-[0.18em] text-ink transition-colors hover:border-accent-1 hover:text-accent-1"
              data-cursor
            >
              <span className="size-1.5 rounded-full bg-accent-1" aria-hidden="true" />
              {copy.whatsappCta} <span aria-hidden="true">↗</span>
            </a>

            {email ? (
              <a
                href={`mailto:${email}`}
                className="mt-6 block text-sm text-muted transition-colors hover:text-accent-1"
              >
                {email}
              </a>
            ) : null}

            <dl className="mt-10 space-y-4 border-t border-line pt-8 text-sm">
              {copy.details.map((detail) => (
                <div key={detail.label} className="flex justify-between gap-4">
                  <dt className="uppercase tracking-[0.2em] text-muted">{detail.label}</dt>
                  <dd className="text-ink">{detail.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div data-ct-form className="relative">
            <AnimatePresence mode="wait">
              {state.status === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-2xl border border-accent-1/40 bg-accent-1/5 p-10"
                  role="status"
                >
                  <p className="font-display text-2xl uppercase text-accent-1">{copy.successTitle}</p>
                  <p className="mt-3 text-sm leading-relaxed text-ink/80">{state.message}</p>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-6 text-[11px] uppercase tracking-[0.25em] text-muted transition-colors hover:text-accent-1"
                  >
                    {copy.sendAnotherLabel}
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  ref={formRef}
                  action={formAction}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                  noValidate
                >
                  {state.status === 'error' && state.message ? (
                    <p
                      role="alert"
                      className="rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300"
                    >
                      {state.message}
                    </p>
                  ) : null}

                  <div className="grid gap-6 md:grid-cols-2">
                    <div data-ct-field>
                      <label htmlFor={`${uid}-name`} className="block text-[11px] uppercase tracking-[0.25em] text-muted">
                        {copy.nameLabel}
                      </label>
                      <input
                        id={`${uid}-name`}
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        placeholder={copy.namePlaceholder}
                        aria-invalid={Boolean(errorFor('name'))}
                        className="mt-2 w-full border-b border-line bg-transparent py-3 text-sm text-ink placeholder:text-muted/50 focus:border-accent-1 focus:outline-none"
                      />
                      {errorFor('name') ? (
                        <p className="mt-2 text-xs text-red-300">{errorFor('name')}</p>
                      ) : null}
                    </div>

                    <div data-ct-field>
                      <label htmlFor={`${uid}-whatsapp`} className="block text-[11px] uppercase tracking-[0.25em] text-muted">
                        {copy.whatsappLabel}
                      </label>
                      <input
                        id={`${uid}-whatsapp`}
                        name="whatsapp"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        required
                        placeholder={copy.whatsappPlaceholder}
                        aria-invalid={Boolean(errorFor('whatsapp'))}
                        className="mt-2 w-full border-b border-line bg-transparent py-3 text-sm text-ink placeholder:text-muted/50 focus:border-accent-1 focus:outline-none"
                      />
                      {errorFor('whatsapp') ? (
                        <p className="mt-2 text-xs text-red-300">{errorFor('whatsapp')}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div data-ct-field>
                      <label htmlFor={`${uid}-country`} className="block text-[11px] uppercase tracking-[0.25em] text-muted">
                        {copy.countryLabel}
                      </label>
                      <select
                        id={`${uid}-country`}
                        name="countryCode"
                        value={dial}
                        onChange={(event) => setDial(event.target.value)}
                        className="mt-2 w-full appearance-none border-b border-line bg-transparent py-3 text-sm text-ink focus:border-accent-1 focus:outline-none"
                      >
                        {countries.map((country) => (
                          <option key={country.code} value={country.dial} className="bg-bg-deep text-ink">
                            {country.dial} {country.label}
                          </option>
                        ))}
                      </select>
                      <input type="hidden" name="country" value={selectedCountry?.label ?? ''} />
                    </div>

                    <div data-ct-field>
                      <label htmlFor={`${uid}-type`} className="block text-[11px] uppercase tracking-[0.25em] text-muted">
                        {copy.projectTypeLabel}
                      </label>
                      <select
                        id={`${uid}-type`}
                        name="projectType"
                        defaultValue=""
                        className="mt-2 w-full appearance-none border-b border-line bg-transparent py-3 text-sm text-ink focus:border-accent-1 focus:outline-none"
                      >
                        <option value="" className="bg-bg-deep text-ink">
                          {copy.projectTypePlaceholder}
                        </option>
                        {projectTypes.map((type) => (
                          <option key={type} value={type} className="bg-bg-deep text-ink">
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <fieldset data-ct-field>
                    <legend className="text-[11px] uppercase tracking-[0.25em] text-muted">
                      {copy.budgetLabel}
                    </legend>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {budgets.map((budget, index) => (
                        <label
                          key={budget}
                          className="cursor-pointer rounded-full border border-line px-4 py-2 text-xs uppercase tracking-[0.15em] text-muted transition-colors has-[:checked]:border-accent-1 has-[:checked]:bg-accent-1 has-[:checked]:text-bg-deep hover:border-accent-1"
                        >
                          <input
                            type="radio"
                            name="budget"
                            value={budget}
                            defaultChecked={index === 0}
                            className="sr-only"
                          />
                          {budget}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <div data-ct-field>
                    <label htmlFor={`${uid}-message`} className="block text-[11px] uppercase tracking-[0.25em] text-muted">
                      {copy.messageLabel}
                    </label>
                    <textarea
                      id={`${uid}-message`}
                      name="message"
                      rows={4}
                      placeholder={copy.messagePlaceholder}
                      className="mt-2 w-full resize-none border-b border-line bg-transparent py-3 text-sm text-ink placeholder:text-muted/50 focus:border-accent-1 focus:outline-none"
                    />
                  </div>

                  {/* Honeypot — invisible to humans, tempting for bots. */}
                  <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
                    <label htmlFor={`${uid}-company`}>{copy.honeypotLabel}</label>
                    <input id={`${uid}-company`} name="company" type="text" tabIndex={-1} autoComplete="off" />
                  </div>

                  <div data-ct-field className="pt-2">
                    <SubmitButton copy={copy} />
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
