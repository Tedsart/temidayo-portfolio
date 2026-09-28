import "server-only";

import { unstable_cache } from "next/cache";
import { isSupabaseConfigured } from "../config";
import type { Database } from "../database.types";
import {
  createSupabasePublicClient,
  createSupabaseServerClient,
  type AppSupabaseClient,
} from "../supabase/client";
import { withPublicUrl } from "../supabase/media";
import type { DataResult, Product, ProductType } from "../types";

/**
 * Read layer for digital products.
 *
 * Mirrors `data/projects.ts`: public reads are cached under the "products" tag
 * and revalidated by the CMS action; admin reads bypass the cache so the
 * editor always shows what is actually saved.
 *
 * When Supabase is not configured there is simply no product — the public
 * sections render nothing rather than a placeholder.
 */

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type AssetRow = Database["public"]["Tables"]["project_assets"]["Row"];

function ok<T>(data: T): DataResult<T> {
  return { data, error: null, usingFallback: false };
}

function fail<T>(message: string): DataResult<T> {
  return { data: null, error: message, usingFallback: false };
}

function parseOutcomes(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      if (typeof entry === "string") return entry.trim();
      if (entry && typeof entry === "object" && "title" in entry) {
        const title = (entry as { title?: unknown }).title;
        return typeof title === "string" ? title.trim() : "";
      }
      return "";
    })
    .filter((line) => line.length > 0);
}

const PRODUCT_TYPES: ProductType[] = [
  "ebook",
  "template",
  "guide",
  "resource",
  "course",
  "other",
];

function toProduct(row: ProductRow, cover: AssetRow | null): Product {
  const type = PRODUCT_TYPES.includes(row.type as ProductType)
    ? (row.type as ProductType)
    : "other";

  return {
    id: row.id,
    type,
    title: row.title,
    slug: row.slug,
    subtitle: row.subtitle,
    short_description: row.short_description,
    long_description: row.long_description,
    cover: cover ? withPublicUrl(cover) : null,
    price_amount: row.price_amount === null ? null : Number(row.price_amount),
    currency: row.currency,
    price_display: row.price_display,
    badge: row.badge,
    product_url: row.product_url,
    checkout_url: row.checkout_url,
    button_text: row.button_text,
    secondary_button_text: row.secondary_button_text,
    secondary_url: row.secondary_url,
    author: row.author,
    page_count: row.page_count,
    format: row.format,
    audience: row.audience,
    outcomes: parseOutcomes(row.outcomes),
    preview_note: row.preview_note,
    featured: row.featured,
    sort_order: row.sort_order,
    enabled: row.enabled,
    published: row.published,
    seo_title: row.seo_title,
    seo_description: row.seo_description,
    created_at: row.created_at,
    updated_at: row.updated_at,
    published_at: row.published_at,
  };
}

/**
 * Covers live in the existing media table, so they are fetched in a second
 * query and joined here — one round trip for products, one for their art.
 */
async function attachCovers(
  supabase: AppSupabaseClient,
  rows: ProductRow[],
): Promise<Product[]> {
  const ids = rows
    .map((row) => row.cover_asset_id)
    .filter((id): id is string => Boolean(id));

  const covers = new Map<string, AssetRow>();

  if (ids.length > 0) {
    const { data, error } = await supabase
      .from("project_assets")
      .select("*")
      .in("id", ids);

    if (error) return rows.map((row) => toProduct(row, null));
    for (const asset of (data ?? []) as AssetRow[]) covers.set(asset.id, asset);
  }

  return rows.map((row) =>
    toProduct(row, row.cover_asset_id ? (covers.get(row.cover_asset_id) ?? null) : null),
  );
}

const byPlacement = (a: Product, b: Product) =>
  a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at);

async function queryLiveProducts(): Promise<DataResult<Product[]>> {
  const supabase = createSupabasePublicClient();
  if (!supabase) return fail("Supabase is not configured on the server.");

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("enabled", true)
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) return fail(error.message);

  const rows = (data ?? []) as ProductRow[];
  const products = await attachCovers(supabase, rows);

  // Belt and braces: the database policy already filters, this keeps a row
  // without any Selar link from ever reaching the page.
  return ok(products.filter((p) => Boolean(p.checkout_url || p.product_url)));
}

const cachedLiveProducts = unstable_cache(queryLiveProducts, ["live-products"], {
  tags: ["products"],
  revalidate: 3600,
});

/** Every live product, in the owner's chosen order. */
export async function listLiveProducts(): Promise<DataResult<Product[]>> {
  if (!isSupabaseConfigured) return ok([]);
  return cachedLiveProducts();
}

/** The product shown on the homepage: featured first, then by placement. */
export async function getFeaturedProduct(): Promise<DataResult<Product | null>> {
  const result = await listLiveProducts();
  if (!result.data) return fail(result.error ?? "Could not load products.");
  const live = [...result.data].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return byPlacement(a, b);
  });
  return ok(live[0] ?? null);
}

export async function getLiveProductBySlug(
  slug: string,
): Promise<DataResult<Product | null>> {
  const result = await listLiveProducts();
  if (!result.data) return fail(result.error ?? "Could not load products.");
  return ok(result.data.find((product) => product.slug === slug) ?? null);
}

/** Slugs for the sitemap — live products only. */
export async function getAllLiveProductSlugs(): Promise<string[]> {
  if (!isSupabaseConfigured) return [];
  const result = await listLiveProducts();
  return (result.data ?? []).map((product) => product.slug);
}

/** Everything for the CMS list, drafts included. */
export async function listProductsForAdmin(): Promise<DataResult<Product[]>> {
  if (!isSupabaseConfigured) return fail("Supabase is not configured on the server.");

  const supabase = await createSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured on the server.");

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) return fail(error.message);
  return ok(await attachCovers(supabase, (data ?? []) as ProductRow[]));
}

export async function getProductById(
  id: string,
): Promise<DataResult<Product | null>> {
  if (!isSupabaseConfigured) return fail("Supabase is not configured on the server.");

  const supabase = await createSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured on the server.");

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return fail(error.message);
  if (!data) return ok(null);

  const row = data as ProductRow;
  const products = await attachCovers(supabase, [row]);
  return ok(products[0] ?? null);
}
