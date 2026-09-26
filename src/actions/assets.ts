"use server";

import { updateTag } from "next/cache";
import { isSupabaseConfigured, supabaseConfig } from "@/lib/config";
import { createSupabaseServerClient, requireAdmin } from "@/lib/supabase/client";
import type { AssetType } from "@/lib/types";
import { ASSET_TYPES } from "@/lib/types";
import { buildStoragePath } from "@/lib/supabase/media";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T; error?: undefined }
  | { ok: false; error: string; data?: undefined };

const notConfigured: ActionResult<never> = {
  ok: false,
  error: "Supabase is not configured. Add credentials to .env.local, run the migrations, then retry.",
};

async function guard() {
  if (!isSupabaseConfigured) return { error: notConfigured.error as string, supabase: null };
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return { error: "You need to sign in first.", supabase: null };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: notConfigured.error as string, supabase: null };
  return { error: null, supabase };
}

function invalidate() {
  updateTag("projects");
  updateTag("projects:public");
}

/**
 * Step 1 of an upload: the client asks for a canonical storage path. The actual
 * bytes travel straight from the browser to Supabase Storage using the admin's
 * session token (storage policies enforce `is_admin()`), so no file ever
 * touches the app server.
 */
export async function planUpload(
  fileName: string,
  scope: string,
): Promise<ActionResult<{ storagePath: string }>> {
  const { error, supabase } = await guard();
  if (error || !supabase) return { ok: false, error: error ?? "Unexpected error." };

  if (!fileName || fileName.length > 160) {
    return { ok: false, error: "That file name is unusable." };
  }

  return { ok: true, data: { storagePath: buildStoragePath(fileName, scope) } };
}

export interface RecordAssetInput {
  project_id: string | null;
  asset_type: AssetType;
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes?: number | null;
  alt_text?: string | null;
  caption?: string | null;
  sort_order?: number;
}

/** Step 2 of an upload: persist the asset row once storage has the bytes. */
export async function recordAsset(input: RecordAssetInput): Promise<ActionResult<{ id: string }>> {
  const { error, supabase } = await guard();
  if (error || !supabase) return { ok: false, error: error ?? "Unexpected error." };

  if (!ASSET_TYPES.includes(input.asset_type)) {
    return { ok: false, error: "Unknown asset type." };
  }
  if (!input.storage_path.startsWith("projects/") && !input.storage_path.startsWith("site/")) {
    return { ok: false, error: "Storage path outside the allowed scopes." };
  }

  // Single-slot types (thumbnail / hero / profile): replace the existing row.
  const singleSlot = ["thumbnail", "hero", "profile"].includes(input.asset_type);
  if (singleSlot) {
    const query = supabase
      .from("project_assets")
      .select("id, storage_path")
      .eq("asset_type", input.asset_type);

    const { data: rows } = input.project_id
      ? await query.eq("project_id", input.project_id)
      : await query.is("project_id", null);

    for (const row of rows ?? []) {
      await supabase.from("project_assets").delete().eq("id", row.id);
      if (row.storage_path !== input.storage_path) {
        await supabase.storage.from(supabaseConfig.bucket).remove([row.storage_path]);
      }
    }
  }

  const { data, error: insertError } = await supabase
    .from("project_assets")
    .insert({
      project_id: input.project_id,
      asset_type: input.asset_type,
      storage_path: input.storage_path,
      file_name: input.file_name,
      mime_type: input.mime_type,
      alt_text: input.alt_text ?? null,
      caption: input.caption ?? null,
      sort_order: input.sort_order ?? 0,
    })
    .select("id")
    .single();

  if (insertError) return { ok: false, error: `Could not record the upload: ${insertError.message}` };

  invalidate();
  return { ok: true, data: { id: data.id } };
}

export async function updateAssetMeta(
  assetId: string,
  meta: { alt_text?: string | null; caption?: string | null },
): Promise<ActionResult> {
  const { error, supabase } = await guard();
  if (error || !supabase) return { ok: false, error: error ?? "Unexpected error." };

  const { error: updateError } = await supabase
    .from("project_assets")
    .update({
      ...(meta.alt_text !== undefined ? { alt_text: meta.alt_text } : {}),
      ...(meta.caption !== undefined ? { caption: meta.caption } : {}),
    })
    .eq("id", assetId);

  if (updateError) return { ok: false, error: updateError.message };
  invalidate();
  return { ok: true };
}

/** Persist the ordering chosen in the editor — order lives in the database. */
export async function reorderAssets(orderedIds: string[]): Promise<ActionResult> {
  const { error, supabase } = await guard();
  if (error || !supabase) return { ok: false, error: error ?? "Unexpected error." };

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("project_assets").update({ sort_order: index }).eq("id", id),
    ),
  );

  invalidate();
  return { ok: true };
}

export async function deleteAsset(assetId: string): Promise<ActionResult> {
  const { error, supabase } = await guard();
  if (error || !supabase) return { ok: false, error: error ?? "Unexpected error." };

  const { data: row } = await supabase
    .from("project_assets")
    .select("storage_path")
    .eq("id", assetId)
    .maybeSingle();

  const { error: deleteError } = await supabase.from("project_assets").delete().eq("id", assetId);
  if (deleteError) return { ok: false, error: deleteError.message };

  if (row?.storage_path) {
    await supabase.storage.from(supabaseConfig.bucket).remove([row.storage_path]);
  }

  invalidate();
  return { ok: true };
}
