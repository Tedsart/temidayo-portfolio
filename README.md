# Temidayo Kukoyi — Portfolio + Private CMS

A production portfolio platform for **Temidayo Kukoyi** (Data Analyst · Data
Visualization · Data Storytelling), built with:

- **Next.js 16** (App Router, React 19, TypeScript)
- **Tailwind CSS 4**
- **Motion** (purposeful, reduced-motion aware)
- **Supabase** — PostgreSQL, Auth and Storage
- Deployment-ready for **Vercel**, source-ready for **GitHub**

Two experiences, one codebase:

| Public site | Private CMS (`/admin`) |
|---|---|
| Homepage, work index, case studies | Login, dashboard |
| Dashboard galleries, visual reports | Project editor (draft → preview → publish) |
| Documents & datasets, external links | Media uploads & reordering |
| About, contact | SEO per project |

Security does **not** rely on hidden routes: Row Level Security only exposes
`published` projects to the public, and only administrators can write.

---

## 1. Installation

```bash
npm install
cp .env.example .env.local      # then fill in the values below
npm run dev                     # http://localhost:3000
```

Without Supabase credentials the site runs in **placeholder mode** — a clearly
marked banner explains that bundled sample copy (not real portfolio facts) is
being shown. The CMS renders a setup checklist instead of the editor.

## 2. Environment variables

| Variable | Where from | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same page | Browser-safe key (RLS-protected) |
| `SUPABASE_SERVICE_ROLE_KEY` | same page | **Server only** — seeding script |
| `NEXT_PUBLIC_SITE_URL` | your domain | Canonical/OG URLs (set on Vercel) |
| `SUPABASE_STORAGE_BUCKET` | — | defaults to `content` |
| `ADMIN_EMAILS` | you | Comma-separated CMS administrators |
| `CONTACT_EMAIL` | you | Contact form mailto target |
| `NEXT_PUBLIC_LINKEDIN_URL`, `NEXT_PUBLIC_GITHUB_URL` | you | Footer/contact channels |

Never commit `.env.local`. The service-role key must never appear in client
code — it is only read by `scripts/seed-admin.mjs` and optional server tooling.

## 3. Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run, in order:
   - `supabase/migrations/0001_init.sql` — tables, enums, triggers, RLS.
   - `supabase/migrations/0002_storage.sql` — the public `content` bucket and
     its storage policies (public read, admin-only write).
   (Or with the Supabase CLI: `supabase link … && supabase db push`.)

What the schema gives you:

- `projects`, `project_findings`, `project_assets`, `project_links`,
  `admin_users`
- `status` lifecycle `draft → published → archived` with `published_at`
  stamped/cleared by a trigger
- RLS: anonymous & non-admin readers see **published only**; admins see and
  write everything; draft children (findings/assets/links) inherit the parent's
  visibility
- Storage: anyone can **read** portfolio media, only `is_admin()` can
  upload/replace/delete

## 4. Authentication

1. Seed your admin account (creates the Auth user + RLS membership):

   ```bash
   ADMIN_EMAILS=you@example.com ADMIN_PASSWORD='a-strong-password' \
     node scripts/seed-admin.mjs
   ```

2. Visit `/admin/login` and sign in.
3. The session is a Supabase Auth session in an httpOnly cookie. Middleware
   redirects anonymous visitors away from `/admin`, and every server action
   re-verifies the session — but the real boundary is RLS.

## 5. Local development

```bash
npm run dev        # dev server
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
bash scripts/validate-sql.sh   # re-validate migrations + RLS on local Postgres
```

`scripts/validate-sql.sh` runs the migrations against a throwaway PostgreSQL
(with tiny `auth.*` stand-ins) and executes nine RLS assertions — useful after
any schema change.

## 6. Production build & Vercel

1. Push the repo to GitHub.
2. Import it in Vercel (framework preset: **Next.js**).
3. Add every variable from `.env.example` in Vercel → Settings → Environment
   Variables (`NEXT_PUBLIC_SITE_URL` = `https://your-domain.com`).
4. Deploy. Published content is server-rendered and cached; `revalidateTag`
   calls in the server actions refresh it immediately after saves.

## 7. Content workflow (for Temidayo)

1. **Projects → Create new project** — title, story, findings.
2. **Save draft** — nothing is public.
3. Add media in the same editor: thumbnail, hero, dashboard screenshots,
   report pages, documents — drag or use the ↑/↓ buttons to reorder; the saved
   order is exactly what readers see.
4. **Preview** — the real public design, invisible to visitors.
5. **Publish** — deliberate, one click, instantly live; **Feature** to lead the
   homepage.
6. **Media** — upload the profile photo and browse/delete every upload.

Placeholders (`[like this]`) shipped with the repo are structural scaffolding,
not facts — replace everything through the CMS before going live.

## 8. Project structure

```
src/
  app/            routes (public + /admin)
  actions/        server actions (auth, projects, assets, preview)
  components/
    public/       editorial UI (hero, case study, carousel…)
    admin/        CMS UI (editor, uploaders, sortable lists)
    ui/           primitives (buttons, badges, headings)
    motion/       reveal system
  lib/
    config.ts     brand + env-derived settings
    data/         read layer (Supabase ⇄ placeholder fallback)
    supabase/     clients, media helpers, cookie store, guard
    types.ts      domain types
supabase/migrations/  schema + storage SQL
scripts/              seed-admin.mjs, validate-sql.sh
```

## 9. Security notes

- No secrets in client code; the anon key is safe by design because RLS denies
  everything unpublished.
- Uploads go browser → Supabase Storage with the admin session token; the
  storage policy allows writes only for `is_admin()`.
- Draft preview requires a signed-in admin; anonymous visitors cannot read
  drafts with or without the preview cookie.
