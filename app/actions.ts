'use server';

import { z } from 'zod';

import { getSiteContent } from '@/lib/data/content';
import type { SiteCopy } from '@/lib/types';

export type InquiryState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  errors?: Record<string, string[]>;
};

export const initialInquiryState: InquiryState = { status: 'idle' };

/** Builds the schema with the validation messages coming from the backend. */
function buildInquirySchema(messages: SiteCopy['form']) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(2, messages.errorName)
      .max(80, messages.errorNameLong),
    whatsapp: z
      .string()
      .trim()
      .min(6, messages.errorWhatsapp)
      .max(20, messages.errorWhatsappLong)
      .regex(/^[+\d\s()-]+$/, messages.errorWhatsapp),
    countryCode: z.string().trim().min(2, messages.errorCountryCode).max(4),
    country: z.string().trim().max(60).optional(),
    projectType: z.string().trim().max(60).optional(),
    budget: z.string().trim().max(40).optional(),
    message: z.string().trim().max(2000, messages.errorMessage).optional(),
  });
}

export async function submitInquiry(
  _prev: InquiryState,
  formData: FormData,
): Promise<InquiryState> {
  const { copy } = await getSiteContent();
  const messages = copy.form;

  /* Honeypot — bots fill the hidden field, humans never see it. */
  if (formData.get('company')) {
    return { status: 'success', message: messages.successMessage };
  }

  const parsed = buildInquirySchema(messages).safeParse({
    name: formData.get('name') ?? '',
    whatsapp: formData.get('whatsapp') ?? '',
    countryCode: formData.get('countryCode') ?? '',
    country: formData.get('country') ?? '',
    projectType: formData.get('projectType') ?? '',
    budget: formData.get('budget') ?? '',
    message: formData.get('message') ?? '',
  });

  if (!parsed.success) {
    return {
      status: 'error',
      message: messages.errorGeneric,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const payload = parsed.data;

  try {
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabase = await createAdminClient();

    const { error } = await supabase.from('inquiries').insert({
      name: payload.name,
      whatsapp: payload.whatsapp,
      country_code: payload.countryCode,
      country: payload.country || null,
      project_type: payload.projectType || null,
      budget: payload.budget || null,
      message: payload.message || null,
    });

    if (error) throw error;

    return {
      status: 'success',
      message: messages.successMessage,
    };
  } catch (error) {
    console.error('[contact] failed to store inquiry:', error);
    return {
      status: 'error',
      message: messages.errorMessage,
    };
  }
}
