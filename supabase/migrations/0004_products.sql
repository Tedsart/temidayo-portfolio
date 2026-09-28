-- =============================================================================
-- Temidayo Kukoyi — Portfolio + CMS
-- 0004_products.sql · optional digital products (Writing & Products)
--
-- One lightweight table for things Temidayo has *made and written* — an ebook
-- today, a template or guide later. It is deliberately not a store: no cart,
-- no prices in multiple currencies, no inventory. The website only ever
-- displays product information and links out to Selar, which handles
-- checkout, payment, delivery and customer data.
--
-- A product reaches the public site only when ALL of these are true, and the
-- CMS shows that checklist to the owner:
--   enabled = true  AND  published = true  AND  a Selar URL exists.
-- =============================================================================

-- Ebook covers reuse the existing asset pipeline (project_id NULL = site scope),
-- exactly like the profile photo and the CV. No second storage system.
do $$ begin
  alter type public.asset_type add value if not exists 'cover';
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.product_type as enum (
    'ebook', 'template', 'guide', 'resource', 'course', 'other'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.products (
  id                      uuid primary key default gen_random_uuid(),

  -- What it is
  type                    public.product_type not null default 'ebook',
  title                   text not null,
  slug                    text not null unique,
  subtitle                text,
  short_description       text,
  long_description        text,

  -- Cover: uploaded through Admin → the product editor (or Media), stored in
  -- the existing bucket. Nullable so a draft can exist before its artwork.
  cover_asset_id          uuid references public.project_assets (id) on delete set null,

  -- Commercials (display only)
  price_amount            numeric(10, 2),
  currency                text not null default 'NGN',
  price_display           text,
  badge                   text,

  -- Selar does checkout/payment/delivery. We only ever link out.
  product_url             text,
  checkout_url            text,
  button_text             text not null default 'Get the book',
  secondary_button_text   text,
  secondary_url           text,

  -- Book metadata
  author                  text,
  page_count              integer,
  format                  text,

  -- Editorial content for the product page
  audience                text,
  outcomes                jsonb not null default '[]'::jsonb,
  preview_note            text,

  -- Placement & visibility
  featured                boolean not null default false,
  sort_order              integer not null default 100,
  enabled                 boolean not null default false,
  published               boolean not null default false,

  -- SEO
  seo_title               text,
  seo_description         text,

  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  published_at            timestamptz
);

comment on table public.products is
  'Digital products (ebook, template, guide…). Checkout happens on Selar; this table only holds display copy and the outbound link.';

create index if not exists products_visible_idx
  on public.products (sort_order, created_at)
  where enabled and published;

create index if not exists products_slug_idx on public.products (slug);

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();

create or replace function public.stamp_product_published_at()
returns trigger
language plpgsql
as $$
begin
  if new.published and (old.published is distinct from true) then
    new.published_at = coalesce(new.published_at, now());
  end if;
  if not new.published then
    new.published_at = null;
  end if;
  return new;
end;
$$;

drop trigger if exists products_stamp_published_at on public.products;
create trigger products_stamp_published_at
  before insert or update of published on public.products
  for each row execute function public.stamp_product_published_at();

alter table public.products enable row level security;

-- Public readers get live products only; admins see everything.
drop policy if exists "products_public_read_live" on public.products;
create policy "products_public_read_live"
  on public.products for select
  to anon, authenticated
  using (
    (
      enabled
      and published
      and coalesce(nullif(trim(checkout_url), ''), nullif(trim(product_url), '')) is not null
    )
    or public.is_admin()
  );

drop policy if exists "products_admin_insert" on public.products;
create policy "products_admin_insert"
  on public.products for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "products_admin_update" on public.products;
create policy "products_admin_update"
  on public.products for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "products_admin_delete" on public.products;
create policy "products_admin_delete"
  on public.products for delete
  to authenticated
  using (public.is_admin());
