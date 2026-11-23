/**
 * A local mock of the Supabase REST + Auth + Storage APIs.
 *
 * Run it to see the whole site — including the dashboard — working before you
 * have a Supabase project:
 *
 *   node scripts/mock-supabase.mjs 54321
 *
 *   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=mock-anon-key
 *   SUPABASE_SERVICE_ROLE_KEY=mock-service-key
 *   npm run dev
 *
 * Then open http://localhost:3000/dashboard and sign in with
 * `admin@example.com` / `password123`.
 *
 * It serves the content of `content/site.json`, so you can prove the whole
 * site renders from the backend before pointing it at the real thing.
 *
 * ── Editing the content ────────────────────────────────────────────────
 * Drop a `scripts/mock-overrides.json` next to this file to override any part
 * of the content, e.g.
 *
 *   { "copy": { "hero": { "ctaPrimary": "Hello from the backend" } } }
 *
 * Everything you change in the dashboard is written to
 * `scripts/mock-data.json`, so it survives a restart. Delete that file to go
 * back to `content/site.json`.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const port = Number(process.argv[2] || 54321);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const contentFile = path.join(root, 'content/site.json');
const overrideFile = path.join(root, 'scripts/mock-overrides.json');
const stateFile = path.join(root, 'scripts/mock-data.json');

const AUTH_USER = {
  id: '11111111-1111-4111-8111-111111111111',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'admin@example.com',
  email_confirmed_at: '2026-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: {},
  created_at: '2026-01-01T00:00:00Z',
};

const ACCESS_TOKEN = 'mock-access-token';
const REFRESH_TOKEN = 'mock-refresh-token';

/* ── State ─────────────────────────────────────────────────────────────── */

function seedTables() {
  const content = JSON.parse(fs.readFileSync(contentFile, 'utf8'));
  const overrides = fs.existsSync(overrideFile)
    ? JSON.parse(fs.readFileSync(overrideFile, 'utf8'))
    : {};

  const settings = { ...content.settings, ...(overrides.settings ?? {}) };
  const copy = { ...content.copy, ...(overrides.copy ?? {}) };

  const rows = (list, extra = {}) =>
    list.map((row, index) => ({
      id: row.id ?? row.slug ?? `row-${index}`,
      sort_order: row.sort_order ?? index + 1,
      published: true,
      created_at: '2026-01-01T00:00:00Z',
      ...extra,
      ...row,
    }));

  return {
    projects: rows(content.projects),
    services: rows(content.services),
    testimonials: rows(content.testimonials),
    site_stats: rows(content.stats),
    site_settings: [
      { key: 'site', value: settings, updated_at: '2026-01-01T00:00:00Z' },
      { key: 'copy', value: copy, updated_at: '2026-01-01T00:00:00Z' },
    ],
    inquiries: [],
  };
}

function loadTables() {
  if (fs.existsSync(stateFile)) {
    try {
      const saved = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      if (saved && saved.projects) return saved;
    } catch {
      /* fall through to the seed */
    }
  }
  return seedTables();
}

const tables = loadTables();

function persist() {
  fs.writeFileSync(stateFile, JSON.stringify(tables, null, 2));
}

/* ── Helpers ───────────────────────────────────────────────────────────── */

const uuid = () => crypto.randomUUID();

function readBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : null);
      } catch {
        resolve(null);
      }
    });
  });
}

/** Reads the raw request body (used for file uploads). */
function readRawBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    'content-type': 'application/json',
    'access-control-allow-origin': '*',
    'access-control-allow-headers': '*',
    'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    ...headers,
  });
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}

/** Parses `?id=eq.<value>` and `?key=eq.<value>` filters. */
function applyFilters(rows, url) {
  let result = rows;
  for (const [key, raw] of url.searchParams.entries()) {
    if (!raw.startsWith('eq.')) continue;
    const value = raw.slice(3);
    result = result.filter((row) => String(row[key]) === value);
  }
  return result;
}

/* ── Server ────────────────────────────────────────────────────────────── */

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${port}`);
    const path = url.pathname;

    console.log(`[mock] ${req.method} ${path}`);

    if (req.method === 'OPTIONS') {
      send(res, 204, '');
      return;
    }

    /* ── Auth ─────────────────────────────────────────────────────────── */

    if (path.startsWith('/auth/v1/token')) {
      const body = await readBody(req);
      const email = body?.email ?? 'admin@example.com';
      const password = body?.password ?? '';

      if (password !== 'password123' && password !== 'mock-password') {
        send(res, 400, {
          error: 'invalid_grant',
          error_description: 'Invalid login credentials',
        });
        return;
      }

      send(res, 200, {
        access_token: ACCESS_TOKEN,
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        refresh_token: REFRESH_TOKEN,
        user: { ...AUTH_USER, email },
      });
      return;
    }

    if (path === '/auth/v1/user') {
      send(res, 200, AUTH_USER);
      return;
    }

    if (path === '/auth/v1/logout') {
      send(res, 204, '');
      return;
    }

    /* ── Storage ─────────────────────────────────────────────────────── */

    if (path.startsWith('/storage/v1/object/public/')) {
      const [, , , , , bucket, ...rest] = path.split('/');
      const objectPath = rest.join('/');
      const data = tables.storage?.[`${bucket}/${objectPath}`];

      if (!data) {
        send(res, 404, { error: 'not_found' });
        return;
      }

      res.writeHead(200, { 'content-type': 'image/webp' });
      res.end(Buffer.from(data, 'base64'));
      return;
    }

    if (path.startsWith('/storage/v1/object/')) {
      const [, , , , bucket, ...rest] = path.split('/');
      const objectPath = rest.join('/');

      if (req.method === 'POST' || req.method === 'PUT') {
        const raw = await readRawBody(req);
        const storage = tables.storage ?? (tables.storage = {});
        storage[`${bucket}/${objectPath}`] = raw.toString('base64');
        persist();
        send(res, 200, { Key: `${bucket}/${objectPath}`, Path: objectPath });
        return;
      }

      const data = tables.storage?.[`${bucket}/${objectPath}`];
      if (!data) {
        send(res, 404, { error: 'not_found' });
        return;
      }

      res.writeHead(200, { 'content-type': 'image/webp' });
      res.end(Buffer.from(data, 'base64'));
      return;
    }

    /* ── REST ────────────────────────────────────────────────────────── */

    if (path.startsWith('/rest/v1/')) {
      const table = path.replace('/rest/v1/', '').split('?')[0];
      const rows = tables[table];

      if (!rows) {
        send(res, 404, { message: `Unknown table: ${table}` });
        return;
      }

      if (req.method === 'GET') {
        let result = applyFilters(rows, url);

        const order = url.searchParams.get('order');
        if (order) {
          const [column, direction] = order.split('.');
          result = [...result].sort((a, b) => {
            const left = a[column];
            const right = b[column];
            if (left === right) return 0;
            const order = (left ?? 0) > (right ?? 0) ? 1 : -1;
            return direction === 'desc' ? -order : order;
          });
        }

        send(res, 200, result, {
          'content-range': `0-${Math.max(result.length - 1, 0)}/${result.length}`,
        });
        return;
      }

      const body = await readBody(req);

      if (req.method === 'POST') {
        const payload = Array.isArray(body) ? body : [body];
        const inserted = payload.map((row) => ({
          created_at: '2026-01-01T00:00:00Z',
          ...row,
          id: row.id ?? (table === 'projects' || table === 'inquiries' ? uuid() : row.id),
        }));

        if (url.searchParams.get('on_conflict')) {
          // upsert
          for (const row of inserted) {
            const key = url.searchParams.get('on_conflict');
            const index = rows.findIndex((existing) => existing[key] === row[key]);
            if (index >= 0) rows[index] = { ...rows[index], ...row };
            else rows.push(row);
          }
        } else {
          rows.push(...inserted);
        }

        persist();
        send(res, 201, inserted);
        return;
      }

      if (req.method === 'PATCH') {
        const targets = applyFilters(rows, url);
        const patch = Array.isArray(body) ? body[0] : body;
        for (const row of targets) Object.assign(row, patch);
        persist();
        send(res, 200, targets);
        return;
      }

      if (req.method === 'DELETE') {
        const targets = applyFilters(rows, url);
        const ids = new Set(targets.map((row) => row.id));
        tables[table] = rows.filter((row) => !ids.has(row.id));
        persist();
        send(res, 200, targets);
        return;
      }
    }

    send(res, 404, { message: 'Not found' });
  })
  .listen(port, () => {
    console.log(`[mock] Supabase mock on http://127.0.0.1:${port}`);
    console.log('[mock] Sign in at /dashboard with admin@example.com / password123');
  });
