import fs from 'node:fs';

const env = {};
for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
  const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (!match) continue;
  env[match[1]] = match[2].replace(/^["']|["']$/g, '');
}

const headers = {
  apikey: env.SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
};

async function probe(path) {
  const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${path}`, { headers });
  const text = await res.text();
  console.log(path, res.status, text.slice(0, 500));
}

await probe('projects?select=slug,title,code_url&limit=2');
await probe('site_settings?select=key');
