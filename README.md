# Yousry Ahmed — Portfolio

A production-ready full-stack developer portfolio: custom web design, React/Next.js
front-ends, Firebase & Supabase backends, and CRM / internal business systems.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 ·
GSAP 3 + ScrollTrigger + SplitText · Lenis · Supabase · Zod · Vercel-ready

**Branding:** the palette is derived from the YA emblem — deep navy base (`#050a1f`),
electric blue and bright cyan accents (`#10bdf5` / `#7ad9ff`).

---

## 1. Quick start

```bash
npm install
cp .env.example .env.local     # optional — the site runs without Supabase
npm run dev                    # http://localhost:3000
```

No Supabase project yet? Run the bundled mock and point the app at it:

```bash
node scripts/mock-supabase.mjs 54321     # in one terminal
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 \
NEXT_PUBLIC_SUPABASE_ANON_KEY=mock-anon-key \
SUPABASE_SERVICE_ROLE_KEY=mock-service-key \
npm run dev                               # in another
```

Then open `http://localhost:3000/dashboard` and sign in with
`admin@example.com` / `password123`.

Production build:

```bash
npm run build
npm start
```

Other scripts:

| Command | What it does |
|---|---|
| `npm run seed` | Pushes `content/site.json` into Supabase (needs the service-role key) |
| `node scripts/mock-supabase.mjs` | Serves the content locally so you can run the site — and the dashboard — without a Supabase project |
| `npm run gen:images` | Regenerates the placeholder cover images in `public/projects` |
| `node scripts/prepare-logo.mjs <png>` | Rebuilds `public/brand/ya-logo.png` + `app/icon.png` from a source logo |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (next/core-web-vitals) |

---

## 2. Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor** → paste and run [`supabase/schema.sql`](supabase/schema.sql).
   It creates `projects`, `services`, `testimonials`, `site_stats`, `site_settings`
   and `inquiries`, and enables RLS with public read policies for published rows.
3. **Project Settings → API** → copy the project URL, the `anon` key and the
   `service_role` key into `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=sb_secret_...   # server-only secret, never exposed to the browser
   ```
4. Seed the database:

   ```bash
   npm run seed
   ```

### The dashboard — `/dashboard`

Everything on the site can be edited from the browser, without touching the code:

| Page | What it controls |
|---|---|
| **Overview** | How many projects, services, testimonials, stats and inquiries exist; the latest inquiries. |
| **Projects** | Add, edit, publish, unpublish and delete the case studies. Upload a cover image to Supabase Storage. |
| **Services** | The “What I build” cards. |
| **Testimonials** | The quotes in the “Straight from my clients” section. |
| **Stats** | The animated counters. |
| **Settings** | Your name, the WhatsApp number, **every social link**, the navigation, the countries, the budgets, the tech list, the Udemy link, the consultation price. |
| **Content & copy** | Every word the site renders — headings, paragraphs, button labels, form labels, validation messages and the SEO metadata. |
| **Inquiries** | Every message sent through the contact form. |

**How the access control works**

- Sign in with a Supabase account (email + password) at `/dashboard/login`.
- `ADMIN_EMAILS` lists the emails allowed in. **Set it in production** — otherwise every
  account that manages to sign up on your Supabase project can edit the site.
- Every write goes through a server action behind the guard in `lib/auth.ts`, and the
  database is touched with the service-role key, so the public API stays read-only.
- The dashboard reads unpublished rows too, so you can prepare a project as a draft and
  publish it when it is ready.

**How fast is an edit live?** The dashboard drops the server-side content cache after
every save, so the change is on the site with the next request — no redeploy, no waiting
for the 60-second window.

### Where the data lives

`content/site.json` is the **single source of truth**. It is used three ways:

- the seed script uploads it to Supabase,
- the app falls back to it when Supabase is unreachable or not configured
  (so the site never hard-fails on a backend hiccup),
- it documents every field in one readable place.

It has two halves:

| Block | Supabase table | What it holds |
|---|---|---|
| `settings` | `site_settings` → `key = 'site'` | Name, role, WhatsApp number, **social links**, nav links, countries, project types, budgets, tech list, photos |
| `copy` | `site_settings` → `key = 'copy'` | **Every word the UI renders** — headings, paragraphs, CTA labels, form labels and validation messages, SEO metadata |
| `projects` / `services` / `testimonials` / `stats` | their own tables | The portfolio content |

Runtime reads go through [`lib/data/content.ts`](lib/data/content.ts), which merges
the Supabase rows over the bundled fallback. To change anything:

- **edit it in the Supabase dashboard** — the site picks it up within
  `CONTENT_REVALIDATE` seconds (60 by default), no redeploy;
- or edit `content/site.json` and re-run `npm run seed`.

**Nothing user-facing is hardcoded in the components.** Section headings, the
hero CTA labels, the form labels, the validation messages, the footer text,
the SEO title/description/keywords and the JSON-LD fields all come from the
backend, so the whole site can be re-worded from the dashboard.

> The one exception: `app/error.tsx` and `app/not-found.tsx` read the same copy
> through a React context (`lib/content-context.tsx`) that the root layout
> fills from the backend.

---

## 3. Content you must replace

`content/site.json` ships with **sample data**. Before going live, update:

| Field | Where | Note |
|---|---|---|
| `settings.whatsappNumber` | `content/site.json` | Digits only, no `+` — used for every WhatsApp CTA |
| `settings.email` | `content/site.json` | Shown in the contact section |
| `settings.socials[].href` | `content/site.json` | Real profile URLs (GitHub, LinkedIn, X…) |
| `settings.heroIntro`, `aboutBio` | `content/site.json` | Your own copy |
| `settings.role` | `content/site.json` | Shown under your name in the About section |
| `stats[]` | `content/site.json` | `value` + `suffix` drive the counters in About (10+, 3+, 100%) |
| `settings.tech` | `content/site.json` | The stack marquee |
| `services[]` | `content/site.json` | What you offer — currently design, React/Next.js, Firebase & Supabase, CRM & systems, e-commerce |
| `projects[]` | `content/site.json` | Real projects, links, tech and accent colours |
| `settings.aboutPhoto` | `content/site.json` | Point at `/images/about.webp` or a Supabase path |
| `projects[].image_path` | `content/site.json` | `/projects/<slug>.webp` (local) or a Supabase storage path |
| `settings.udemyUrl` | `content/site.json` | Leave `null` — the Udemy button is hidden until a real course URL is set |

Images live in `public/projects/` and `public/images/`. The bundled files are
generated placeholders (`npm run gen:images`); swap them for real screenshots.

> **Project covers are portrait (0.72 ratio — 1200×1667).** The showcase card,
> the thumbnail strip and the mobile list all crop to that ratio, so a 16:9
> screenshot would be cut. Export covers at 1200×1667 (or re-crop) to match.

Brand assets: `public/brand/ya-logo.png` (the emblem) and `app/icon.png`
(favicon). To change the logo, drop the new file in and run:

```bash
node scripts/prepare-logo.mjs "path/to/new-logo.png"
```

That trims the transparent margins, writes the optimised emblem and regenerates
the favicon on a dark plate.

---

## 4. Project structure

```
app/
  layout.tsx            fonts, metadata (from the backend), preloader, cursor, smooth scroll
  page.tsx              server component — loads content, renders sections, JSON-LD
  actions.ts            contact server action (zod validation + honeypot)
  dashboard/            the control panel
    login/              sign-in page
    (app)/              the guarded area: overview + one page per collection
    actions.ts          every write (create / update / delete / upload)
  sitemap.ts robots.ts  metadata routes
components/
  layout/               Header, Footer
  sections/             Hero, Work, About, Course, Services, Consultation, Contact
  ui/                   Preloader, CustomCursor, OctagonFrame
  providers/            SmoothScroll (Lenis ↔ ScrollTrigger bridge)
lib/
  fonts.ts              self-hosted Anton + Inter Tight (next/font/local)
  data/content.ts       Supabase loader with bundled fallback + data cache
  content-context.tsx   publishes the backend content to client components
  dashboard-data.ts     dashboard-only reads (sees drafts and inquiries)
  auth.ts               session + admin guard
  gsap/                 plugin registration, "app ready" signal
  supabase/             public (cached read) / browser / server / admin clients + typed schema
components/dashboard/   the dashboard UI (list, editor, JSON editor, uploader)
content/site.json       the single source of truth for all content
supabase/schema.sql     tables, indexes and RLS policies
scripts/                seed, placeholder-image and logo generators, local Supabase mock
```

### Caching model

| Layer | What it does |
|---|---|
| In-memory TTL cache in `lib/data/content.ts` | Holds the whole site payload for `CONTENT_REVALIDATE` seconds (60). One database round-trip per minute instead of per visitor. It is deliberately **not** `unstable_cache()`, which would be written to disk during `next build` and bake the build-time content into the deployment. |
| `cache: 'no-store'` on the Supabase fetches | The moment the cache expires, the site reads **fresh** rows — Next's build-time fetch cache can never serve stale content. |
| Next's request-level fetch dedupe | The layout, the metadata and the page all read the same rows in one round-trip. |

`export const dynamic = 'force-dynamic'` on the home page keeps the HTML from
being frozen at build time, so an edit in Supabase is genuinely live.

---

## 5. Animation system

Everything decorative runs through GSAP; the CSS only ships the tokens, the
grain texture and two keyframes. Plugins are imported **dynamically inside
`useEffect`**, so GSAP never touches the server bundle and there is no
hydration mismatch.

- **Preloader** — waits for `document.fonts.ready`, scrambles the name, counts
  `000 → 100`, then wipes away with a `clip-path` reveal. Skipped on repeat
  visits (`sessionStorage`) so the second paint is instant.
- **Custom cursor** — a fast dot plus a lagging ring; `data-cursor` grows the
  ring, `data-cursor-label="Text"` shows a label inside it. Fine pointers only.
- **Hero** — masked line reveals, a 3D logo that tilts with the pointer and
  floats on a loop, plus scroll parallax.
- **Work** — a pinned, snapped showcase: 3D card flip, chromatic-aberration
  glitch, per-project accent colour, drifting smoke, rising particles.
- **About** — word-by-word statement scrub, curtain reveal on the photo,
  counters and an infinite tech marquee.
- **Course** — pinned section with message cards flying in from the edges.
- **Services** — pinned horizontal slider driven by the vertical scroll.
- **Consultation** — the card opens from the inside, the price counts up.

All of it respects `prefers-reduced-motion`: the preloader is skipped, Lenis is
not started and the CSS animations are neutralised.

> **Entrance animations use `fromTo()`, never `from()`.** With a `stagger`,
> `gsap.from()` captures the *from* value as the end value of the first
> target, so that element silently never moves (it stays offset or invisible).
> `fromTo()` states both ends explicitly and cannot get this wrong.

---

## 6. Best practices baked in

- **Type safety** — strict TypeScript, `noUncheckedIndexedAccess`, typed
  Supabase schema in `lib/supabase/types.ts`. `services`, `testimonials` and
  `site_stats` use the **text ids** from `content/site.json` so the seed can
  upsert on them; `projects` upserts on `slug` and `inquiries` keeps a uuid.
- **Performance** — self-hosted subsetted fonts with metric-matched fallbacks
  (no layout shift, no third-party requests), `next/image` with AVIF/WebP,
  GSAP loaded on demand, `First Load JS ≈ 166 kB`.
- **SEO** — metadata API, canonical, Open Graph, Twitter card, `sitemap.xml`,
  `robots.txt` and JSON-LD for `Person`, `ProfessionalService` and `ItemList`.
- **Accessibility** — skip link, semantic landmarks, labelled fields, visible
  focus rings, `aria-*` on interactive blocks, full reduced-motion support.
- **Security** — the service-role key is server-only (`server-only` guard),
  RLS is enabled on every table, the contact form has a honeypot and zod
  validation, and no secret is ever shipped to the browser.
- **Resilience** — Supabase failures degrade to bundled content instead of a
  500; `error.tsx` and `not-found.tsx` are styled, not default.

---

## 7. Deploying

The project is a standard Next.js app — push it to GitHub and import it in
Vercel, or run `npm run build && npm start` anywhere Node 20+ is available.
Set the environment variables from `.env.example` in the host's dashboard:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`NEXT_PUBLIC_SITE_URL`, `ADMIN_EMAILS` and `CONTENT_REVALIDATE`.

---

## 8. Notes

- The portfolio deliberately mirrors the reference site's layout and motion, with
  the YA emblem, the navy/cyan palette and full-stack copy of its own. Replace
  the projects, imagery and contact details with your own before publishing.
- `site.json` values are read at request time from Supabase; the JSON fallback
  means a fresh clone is immediately runnable.
