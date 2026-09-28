"use server";

import { updateTag } from "next/cache";
import { isSupabaseConfigured } from "@/lib/config";
import { slugify } from "@/lib/utils";
import { createSupabaseServerClient, requireAdmin } from "@/lib/supabase/client";
import type { ProductInput } from "@/lib/types";
import type { ActionResult } from "./assets";

/**
 * Product write layer. Admin only — and RLS enforces that server-side too, so
 * an unauthenticated caller cannot reach these rows even if it tried.
 */

const blank = (value: string | null): string | null =>
  value && value.trim().length > 0 ? value.trim() : null;

/** Keeps only http(s) links so a pasted value can never become javascript:. */
function safeUrl(value: string | null): string | null {
  const trimmed = blank(value);
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export type SaveProductResult = ActionResult & { id?: string };

export async function saveProduct(
  input: ProductInput,
): Promise<SaveProductResult> {
  if (!isSupabaseConfigured) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const admin = await requireAdmin().catch(() => null);
  if (!admin) return { ok: false, error: "You need to sign in first." };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const title = input.title.trim();
  if (!title) return { ok: false, error: "Give the product a title." };

  const slug = slugify(input.slug || title);
  if (!slug) return { ok: false, error: "That title cannot become a URL slug." };

  const outcomes = input.outcomes.map((line) => line.trim()).filter(Boolean);

  const payload = {
    type: input.type,
    title,
    slug,
    subtitle: blank(input.subtitle),
    short_description: blank(input.short_description),
    long_description: blank(input.long_description),
    cover_asset_id: input.cover_asset_id,
    price_amount: input.price_amount,
    currency: (input.currency || "NGN").toUpperCase().slice(0, 3),
    price_display: blank(input.price_display),
    badge: blank(input.badge),
    product_url: safeUrl(input.product_url),
    checkout_url: safeUrl(input.checkout_url),
    button_text: blank(input.button_text) ?? "Get the book",
    secondary_button_text: blank(input.secondary_button_text),
    secondary_url: safeUrl(input.secondary_url),
    author: blank(input.author),
    page_count: input.page_count,
    format: blank(input.format),
    audience: blank(input.audience),
    outcomes,
    preview_note: blank(input.preview_note),
    featured: input.featured,
    sort_order: input.sort_order,
    enabled: input.enabled,
    published: input.published,
    seo_title: blank(input.seo_title),
    seo_description: blank(input.seo_description),
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", input.id)
      .select("id")
      .maybeSingle();

    if (error) return { ok: false, error: `Could not save the product: ${error.message}` };
    updateTag("products");
    return { ok: true, id: data?.id ?? input.id };
  }

  const { data, error } = await supabase
    .from("products")
    .insert(payload)
    .select("id")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Another product already uses that slug." };
    }
    return { ok: false, error: `Could not create the product: ${error.message}` };
  }

  updateTag("products");
  return { ok: true, id: data?.id };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const admin = await requireAdmin().catch(() => null);
  if (!admin) return { ok: false, error: "You need to sign in first." };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { ok: false, error: `Could not delete the product: ${error.message}` };

  updateTag("products");
  return { ok: true };
}

/** Quick publish / unpublish from the products list. */
export async function setProductPublished(
  id: string,
  published: boolean,
): Promise<ActionResult> {
  if (!isSupabaseConfigured) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const admin = await requireAdmin().catch(() => null);
  if (!admin) return { ok: false, error: "You need to sign in first." };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const { error } = await supabase
    .from("products")
    .update({ published, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { ok: false, error: `Could not update the product: ${error.message}` };

  updateTag("products");
  return { ok: true };
}
