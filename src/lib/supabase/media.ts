import "server-only";

import { isSupabaseConfigured, supabaseConfig } from "../config";
import type { ProjectAsset } from "../types";

/**
 * Turns a storage path into a URL the browser can load.
 *
 * The `content` bucket is created public (see migrations) so that media can be
 * cached by the CDN and optimised by `next/image`. Anything outside the
 * portfolio bucket is passed through untouched, which keeps locally-referenced
 * placeholder images working in fallback mode.
 */
export function publicUrlForPath(storagePath: string | null | undefined): string | null {
  if (!storagePath) return null;
  if (/^https?:\/\//.test(storagePath)) return storagePath;
  if (!isSupabaseConfigured) return null;

  const base = supabaseConfig.url.replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${supabaseConfig.bucket}/${storagePath.replace(/^\/+/, "")}`;
}

const SAFE_NAME = /[^a-z0-9._-]+/g;

/** `Nigeria CPI.csv` → `2024-05-01-nigeria-cpi.csv`, avoiding collisions. */
export function buildStoragePath(fileName: string, scope: string): string {
  const cleaned = fileName
    .toLowerCase()
    .normalize("NFKD")
    .replace(SAFE_NAME, "-")
    .replace(/^-+|-+$/g, "")
    .slice(-80);
  const stamp = new Date().toISOString().slice(0, 10);
  const unique = Math.random().toString(36).slice(2, 8);
  return `${scope}/${stamp}-${unique}-${cleaned || "file"}`;
}

type AssetRow = Omit<ProjectAsset, "public_url">;

/** Attaches a loadable URL to asset rows straight from the database. */
export function withPublicUrl<T extends AssetRow>(asset: T): T & { public_url: string | null } {
  return { ...asset, public_url: publicUrlForPath(asset.storage_path) };
}

export function withPublicUrls<T extends AssetRow>(assets: T[]): (T & { public_url: string | null })[] {
  return assets.map(withPublicUrl);
}
