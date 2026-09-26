-- =============================================================================
-- Temidayo Kukoyi — Portfolio + CMS
-- 0001_init.sql · schema, Row Level Security, storage policies, admin seeding
--
-- Run with the Supabase CLI:      supabase db push
-- or paste into:  Dashboard → SQL Editor → New query → Run
-- =============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.project_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.asset_type as enum (
    'thumbnail', 'hero', 'dashboard', 'report_page', 'profile',
    'document', 'dataset', 'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.link_type as enum (
    'powerbi', 'looker', 'github', 'dataset', 'demo', 'other'
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Administrators
--
-- Membership is by email, mirrored from auth.users. RLS calls the stable
-- `public.is_admin()` helper below rather than a subquery on auth.users, which
-- avoids the classic "infinite recursion in row-level security policy" error.
--
-- Order matters here: the table must exist before is_admin() (a SQL-language
-- function is validated at CREATE time), and is_admin() must exist before any
-- policy references it.
-- ---------------------------------------------------------------------------
create table if not exists public.admin_users (
  email       text primary key,
  created_at  timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- ---------------------------------------------------------------------------
-- is_admin()
--
-- SECURITY DEFINER, owned by postgres, stable: it checks the signed-in user's
-- email against public.admin_users. Grant execute to authenticated + anon so
-- policies can call it; it exposes no data itself.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and auth.role() in ('authenticated', 'service_role')
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- Now the admin table can safely be protected by policies that use is_admin().
drop policy if exists "admins_readable_by_admins" on public.admin_users;
create policy "admins_readable_by_admins"
  on public.admin_users for select
  using (auth.role() = 'service_role' or public.is_admin());

drop policy if exists "admins_writable_by_service_role" on public.admin_users;
create policy "admins_writable_by_service_role"
  on public.admin_users for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  slug              text not null unique,
  subtitle          text,
  short_description text,
  category          text,
  project_date      text,
  status            public.project_status not null default 'draft',
  featured          boolean not null default false,
  tools             text[] not null default '{}',
  skills            text[] not null default '{}',

  -- Story content. Every field is optional: the public page hides empty ones.
  question          text,
  objective         text,
  context           text,
  dataset           text,
  data_sources      text,
  methodology       text,
  analysis_process  text,
  challenges        text,
  recommendations   text,
  conclusion        text,

  -- SEO
  seo_title         text,
  seo_description   text,
  social_image      text,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  published_at      timestamptz
);

comment on table public.projects is
  'Portfolio case studies. status=draft is never readable anonymously.';

create index if not exists projects_status_idx on public.projects (status);
create index if not exists projects_featured_idx on public.projects (featured);
create index if not exists projects_published_at_idx on public.projects (published_at desc);

-- Keep updated_at honest without relying on the application.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_touch_updated_at on public.projects;
create trigger projects_touch_updated_at
  before update on public.projects
  for each row execute function public.touch_updated_at();

-- Publishing is deliberate: stamp published_at the first time a row goes live.
create or replace function public.stamp_published_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'published' and (old.status is distinct from 'published' or old.status is null) then
    new.published_at = coalesce(new.published_at, now());
  end if;
  if new.status <> 'published' then
    new.published_at = null;
  end if;
  return new;
end;
$$;

drop trigger if exists projects_stamp_published_at on public.projects;
create trigger projects_stamp_published_at
  before insert or update of status on public.projects
  for each row execute function public.stamp_published_at();

alter table public.projects enable row level security;

-- Public (anon and signed-in) readers get published rows; admins get all.
drop policy if exists "projects_public_read_published" on public.projects;
create policy "projects_public_read_published"
  on public.projects for select
  to anon, authenticated
  using (status = 'published' or public.is_admin());

drop policy if exists "projects_admin_insert" on public.projects;
create policy "projects_admin_insert"
  on public.projects for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "projects_admin_update" on public.projects;
create policy "projects_admin_update"
  on public.projects for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "projects_admin_delete" on public.projects;
create policy "projects_admin_delete"
  on public.projects for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- project_findings
-- ---------------------------------------------------------------------------
create table if not exists public.project_findings (
  id               uuid primary key default gen_random_uuid(),
  project_id       uuid not null references public.projects (id) on delete cascade,
  headline         text not null,
  title            text not null,
  explanation      text,
  supporting_text  text,
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists project_findings_project_idx
  on public.project_findings (project_id, sort_order);

drop trigger if exists project_findings_touch_updated_at on public.project_findings;
create trigger project_findings_touch_updated_at
  before update on public.project_findings
  for each row execute function public.touch_updated_at();

alter table public.project_findings enable row level security;

-- Children inherit the parent's visibility: findings of a draft stay private.
drop policy if exists "findings_public_read_published_parent" on public.project_findings;
create policy "findings_public_read_published_parent"
  on public.project_findings for select
  to anon, authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.projects p
      where p.id = project_id and p.status = 'published'
    )
  );

drop policy if exists "findings_admin_insert" on public.project_findings;
create policy "findings_admin_insert"
  on public.project_findings for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "findings_admin_update" on public.project_findings;
create policy "findings_admin_update"
  on public.project_findings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "findings_admin_delete" on public.project_findings;
create policy "findings_admin_delete"
  on public.project_findings for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- project_assets
--
-- project_id is nullable so site-level media (the profile photo) has a home.
-- ---------------------------------------------------------------------------
create table if not exists public.project_assets (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid references public.projects (id) on delete cascade,
  asset_type    public.asset_type not null default 'other',
  storage_path  text not null,
  file_name     text not null,
  mime_type     text,
  alt_text      text,
  caption       text,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists project_assets_project_idx
  on public.project_assets (project_id, asset_type, sort_order);
create index if not exists project_assets_type_idx
  on public.project_assets (asset_type);

alter table public.project_assets enable row level security;

drop policy if exists "assets_public_read_published_parent" on public.project_assets;
create policy "assets_public_read_published_parent"
  on public.project_assets for select
  to anon, authenticated
  using (
    public.is_admin()
    or project_id is null
    or exists (
      select 1 from public.projects p
      where p.id = project_id and p.status = 'published'
    )
  );

drop policy if exists "assets_admin_insert" on public.project_assets;
create policy "assets_admin_insert"
  on public.project_assets for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "assets_admin_update" on public.project_assets;
create policy "assets_admin_update"
  on public.project_assets for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "assets_admin_delete" on public.project_assets;
create policy "assets_admin_delete"
  on public.project_assets for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- project_links
-- ---------------------------------------------------------------------------
create table if not exists public.project_links (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects (id) on delete cascade,
  link_type   public.link_type not null default 'other',
  label       text not null,
  url         text not null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists project_links_project_idx
  on public.project_links (project_id, sort_order);

alter table public.project_links enable row level security;

drop policy if exists "links_public_read_published_parent" on public.project_links;
create policy "links_public_read_published_parent"
  on public.project_links for select
  to anon, authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.projects p
      where p.id = project_id and p.status = 'published'
    )
  );

drop policy if exists "links_admin_insert" on public.project_links;
create policy "links_admin_insert"
  on public.project_links for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "links_admin_update" on public.project_links;
create policy "links_admin_update"
  on public.project_links for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "links_admin_delete" on public.project_links;
create policy "links_admin_delete"
  on public.project_links for delete
  to authenticated
  using (public.is_admin());
