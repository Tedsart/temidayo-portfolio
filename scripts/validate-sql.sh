#!/usr/bin/env bash
# Validates supabase/migrations/0001_init.sql against a real PostgreSQL with
# minimal `auth` schema stubs (Supabase provides the real one in production).
# Usage: bash scripts/validate-sql.sh
set -euo pipefail

DB=portfolio_validate

sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DROP DATABASE IF EXISTS ${DB};
CREATE DATABASE ${DB};
SQL

sudo -u postgres psql -v ON_ERROR_STOP=1 -d ${DB} <<'SQL'
-- Minimal stand-ins for the pieces Supabase normally provides.
create schema if not exists auth;

create or replace function auth.role() returns text
language sql stable as
$$ select coalesce(nullif(current_setting('request.role', true), ''), 'anon') $$;

create or replace function auth.jwt() returns jsonb
language sql stable as
$$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;

do $$ begin create role anon nologin; exception when duplicate_object then null; end $$;
do $$ begin create role authenticated nologin; exception when duplicate_object then null; end $$;
do $$ begin create role service_role nologin; exception when duplicate_object then null; end $$;

grant usage on schema public to anon, authenticated, service_role;
SQL

sudo -u postgres psql -v ON_ERROR_STOP=1 -d ${DB} -f supabase/migrations/0001_init.sql

echo "── migration applied; granting table privileges (Supabase does this by default) ──"
sudo -u postgres psql -v ON_ERROR_STOP=1 -d ${DB} <<'SQL'
grant select on public.projects, public.project_findings, public.project_assets, public.project_links to anon;
grant select, insert, update, delete on public.projects, public.project_findings, public.project_assets, public.project_links to authenticated;
grant select on public.admin_users to authenticated;
SQL

echo "── migration applied; running RLS smoke tests ──"

sudo -u postgres psql -v ON_ERROR_STOP=1 -d ${DB} <<'SQL'
-- Seed an admin and two projects.
insert into public.admin_users (email) values ('owner@example.com');

insert into public.projects (title, slug, status)
values
  ('Live project', 'live-project', 'published'),
  ('Secret draft', 'secret-draft', 'draft');

-- 1. Anonymous visitor: sees only published, cannot write.
set role anon;
set request.role = 'anon';
set request.jwt.claims = '{}';

select case when count(*) = 1 then 'PASS anon sees only published'
            else 'FAIL anon sees ' || count(*) end as t1
from public.projects;

do $$ begin
  insert into public.projects (title, slug) values ('hack', 'hack');
  raise exception 'FAIL anon insert succeeded';
exception when insufficient_privilege then
  -- expected: RLS denies
  null;
end $$;
select 'PASS anon insert denied' as t2;

-- 2. Authenticated non-admin: same as anon.
set role authenticated;
set request.role = 'authenticated';
set request.jwt.claims = '{"email":"intruder@example.com"}';

select case when count(*) = 1 then 'PASS non-admin sees only published'
            else 'FAIL non-admin sees ' || count(*) end as t3
from public.projects;

-- 3. Admin: sees everything, can write.
set request.jwt.claims = '{"email":"owner@example.com"}';

select case when count(*) = 2 then 'PASS admin sees drafts too'
            else 'FAIL admin sees ' || count(*) end as t4
from public.projects;

insert into public.projects (title, slug, status)
values ('Admin draft', 'admin-draft', 'draft');
select 'PASS admin insert' as t5;

update public.projects set title = 'Live project (edited)' where slug = 'live-project';
select 'PASS admin update' as t6;

-- 4. Draft children stay hidden from anon.
insert into public.project_findings (project_id, headline, title)
select id, '99%', 'draft finding' from public.projects where slug = 'secret-draft';
insert into public.project_findings (project_id, headline, title)
select id, '12%', 'published finding' from public.projects where slug = 'live-project';

set role anon;
set request.role = 'anon';
set request.jwt.claims = '{}';
select case when count(*) = 1 then 'PASS anon sees only findings of published parent'
            else 'FAIL anon findings ' || count(*) end as t7
from public.project_findings;

-- 5. Publishing stamps published_at.
set role authenticated;
set request.role = 'authenticated';
set request.jwt.claims = '{"email":"owner@example.com"}';
update public.projects set status = 'published' where slug = 'admin-draft';
select case when published_at is not null then 'PASS published_at stamped on publish'
            else 'FAIL published_at null' end as t8
from public.projects where slug = 'admin-draft';

update public.projects set status = 'archived' where slug = 'admin-draft';
select case when published_at is null then 'PASS published_at cleared on unpublish'
            else 'FAIL published_at kept' end as t9
from public.projects where slug = 'admin-draft';
SQL

echo "── all SQL validation checks executed ──"
