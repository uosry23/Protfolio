import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient } from '@supabase/supabase-js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

for (const file of ['.env.local', '.env']) {
  try {
    const raw = await fs.readFile(path.join(root, file), 'utf8');
    for (const line of raw.split('\n')) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const value = match[2].replace(/^(["'])(.*)\1\s*$/, '$2');
      if (!process.env[match[1]]) process.env[match[1]] = value;
    }
  } catch {
    // Try the next environment file.
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Supabase URL and service-role key are required.');

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const defaults = {
  hero: { cursorGreeting: 'Hi' },
  header: {
    navLabel: 'Primary',
    cursorNavLabel: 'Go',
    whatsappLabel: 'WhatsApp',
    mobileNavLabel: 'Mobile',
    openMenuLabel: 'Open menu',
    closeMenuLabel: 'Close menu',
  },
  work: {
    projectLabel: 'Project',
    liveLinkLabel: 'View live',
    codeLinkLabel: 'Code',
    openProjectLabel: 'Open',
    projectAltLabel: 'project',
  },
  contact: { whatsappCta: 'Chat on WhatsApp', honeypotLabel: 'Company' },
  footer: {
    navLabel: 'Footer',
    whatsappLabel: 'WhatsApp',
    backToTopLabel: 'Back to top',
  },
};

const { data, error: readError } = await supabase
  .from('site_settings')
  .select('value')
  .eq('key', 'copy')
  .single();
if (readError) throw readError;

const current = data.value && typeof data.value === 'object' ? data.value : {};
const updated = { ...current };
for (const [section, fields] of Object.entries(defaults)) {
  const existing = current[section] && typeof current[section] === 'object' ? current[section] : {};
  updated[section] = { ...fields, ...existing };
}

const { error: updateError } = await supabase
  .from('site_settings')
  .update({ value: updated })
  .eq('key', 'copy');
if (updateError) throw updateError;

console.log('Database copy labels updated. Existing copy values were preserved.');
