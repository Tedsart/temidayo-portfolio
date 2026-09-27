# How Your Website Works — the whole system in plain English

You asked to understand the *system*, not the code. Here is the mental map.
Think of your website as a **magazine publishing house** with four rooms.

---

## Room 1 — The Printing Press (Next.js + React + TypeScript)

This is the website itself: every page you see (Home, Work, About, Contact,
and each case study) is a "layout" built once by me in code. The layouts are
**empty shells with taste** — they decide where the headline sits, how a chart
is framed, how a carousel moves — but they contain **none of your project
content**. The content is fetched fresh from Room 2 every time a page is
served. That is why you can publish a brand-new case study from the admin
panel and it appears on the site without me touching code.

- **Next.js** = the press. It assembles each page on the server the moment a
  visitor requests it (server-side rendering), which is fast and Google-friendly.
- **React** = the system of interchangeable parts (navbar, chart deck,
  carousel, buttons) the pages are assembled from.
- **TypeScript** = a spellchecker for the parts, so a missing field fails
  loudly at build time instead of silently in front of a visitor.
- **Tailwind CSS** = the design vocabulary (colours, spacing, type scale) so
  every page speaks the same visual language.
- **Motion** = the choreography library for the reveals, marquees and chart
  animations (always switched off for visitors who prefer reduced motion).

## Room 2 — The Archive (Supabase = PostgreSQL + Auth + Storage)

Everything editable lives here, in three shelves:

1. **Database (PostgreSQL)** — structured records:
   - `projects` — one row per case study (title, slug, status, story sections,
     SEO fields…). `status` is the editorial gate: `draft` → invisible to the
     public; `published` → live; `archived` → retired but kept.
   - `project_findings`, `project_links`, `project_assets` — the repeatable
     pieces attached to a project (key numbers, external dashboards,
     screenshots and report pages, in the order you arrange them).
   - `site_settings` — the single row that holds *you*: bio, email, LinkedIn,
     GitHub, CV file, profile photo. The About/Contact/Footer sections read it.
2. **Auth** — the locked door to the admin area. Your email + password live
   here (hashed, never in code). The public site never logs in; it is only
   allowed to read published things.
3. **Storage** — the filing cabinet for files: dashboard screenshots, report
   pages, hero images, your CV, your profile photo. The database stores only
   the address (URL) of each file.

The guard at the door is called **Row-Level Security (RLS)**. It is enforced
*inside the database*, not in the website code: anonymous visitors may SELECT
published projects only; everything else (create, edit, delete, reading
drafts) requires the admin's signed-in identity. So even if someone copied the
public website code, they still could not see your drafts.

## Room 3 — The Editor's Desk (the Admin CMS)

`/admin/login` → your desk. It is a private set of pages (never linked from
the public menu) that talk to Room 2 with your signed-in identity:

- **Projects list / New / Edit** — the full case-study form, section by
  section (basic info, story, findings, visuals, reports, documents, links,
  SEO). Saving writes to the database; the public site sees it immediately
  (a cache tag is bumped so no stale page is served).
- **Preview** — shows a draft using the *real public design* through a
  private preview flag, without ever exposing the draft URL to strangers.
- **Media** — the filing cabinet browser (upload, reorder, alt text).
- **Settings** — the `site_settings` row, including your CV upload.

## Room 4 — The Distribution Network (Vercel + GitHub)

- **Vercel** is where the press actually runs for the world. Every deploy
  uploads the code, builds it, and swaps it live at
  `temidayo-portfolio-gold.vercel.app` with zero downtime. Environment
  variables (the Supabase address and public key) live only in Vercel's
  vault — never in the code.
- **GitHub** is the master copy / safety deposit box of the entire codebase.
  It is your backup and your collaboration history; Vercel can also rebuild
  automatically from it.

## How a visitor's click travels

1. Browser asks Vercel for `/work/nigeria-inflation-dashboard`.
2. Next.js assembles the page on the server: reads the project row + its
   findings/assets/links from Supabase (published only — RLS double-checks).
3. The assembled HTML ships to the browser; Motion adds the choreography;
   images stream from Supabase Storage, optimized by Next.js.
4. Google sees the same HTML (that is why server rendering + the sitemap +
   the structured data matter for search).

## How *your* edit travels

Admin form → Supabase (Auth proves it's you, RLS allows the write) →
database/storage updated → cache tag refreshed → next visitor sees it.
No code, no deploy, no me.

## The SEO shelf (getting found)

- `sitemap.xml` + `robots.txt` are generated from your *published* projects.
- Each page carries meta tags, Open Graph cards and a canonical URL.
- The homepage carries structured data (JSON-LD) describing you as a Person.
- Google Search Console verifies ownership (the little HTML file) and accepts
  the sitemap; indexing then happens on Google's schedule.

---

### One-paragraph summary

A Next.js "magazine layout" (Room 1) asks Supabase (Room 2) for published
content, guarded by database-level security; you edit everything from a
private admin desk (Room 3); Vercel hosts the live press and GitHub keeps the
master copy (Room 4). Content and code are separate: design changes are code,
everything editorial is the CMS.
