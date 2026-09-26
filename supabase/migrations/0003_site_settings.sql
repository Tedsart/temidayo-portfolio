-- =============================================================================
-- Temidayo Kukoyi — Portfolio + CMS
-- 0003_site_settings.sql · CMS-editable site profile (About / Contact facts)
--
-- The About and Contact sections used to hard-code placeholder slots. This
-- migration moves every owner-editable fact into one single-row table the
-- CMS can write, and adds a 'cv' asset type so the CV can be uploaded in
-- Admin → Media like any other document.
-- =============================================================================

-- CV documents reuse the asset pipeline (project_id NULL, site scope).
do $$ begin
  alter type public.asset_type add value if not exists 'cv';
exception when duplicate_object then null; end $$;

-- Single-row table (id constrained to 1): the site profile.
create table if not exists public.site_settings (
  id                    integer primary key default 1 check (id = 1),
  intro                 text,
  statistics_background text,
  experience            jsonb not null default '[]'::jsonb,
  interests             text,
  linkedin_url          text,
  github_url            text,
  contact_email         text,
  updated_at            timestamptz not null default now()
);

alter table public.site_settings enable row level security;

-- Everyone can read the site profile.
drop policy if exists "settings_public_read" on public.site_settings;
create policy "settings_public_read"
  on public.site_settings for select
  to anon, authenticated
  using (true);

-- Only admins can create/update it. No delete: the row always exists.
drop policy if exists "settings_admin_insert" on public.site_settings;
create policy "settings_admin_insert"
  on public.site_settings for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "settings_admin_update" on public.site_settings;
create policy "settings_admin_update"
  on public.site_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

insert into public.site_settings (id) values (1) on conflict (id) do nothing;
