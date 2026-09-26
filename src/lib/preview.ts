import { getCookieStore } from "./supabase/cookie-store";

/**
 * Draft preview mode.
 *
 * An administrator can turn on `/admin` preview, which sets an httpOnly cookie.
 * While it is set, `/work/[slug]` resolves unpublished projects and the layout
 * renders a banner. Ordinary visitors never receive the cookie, and the RLS
 * policies below it still refuse anonymous reads of drafts — so this is a
 * convenience layer, not the security boundary.
 */

export const PREVIEW_COOKIE = "tk_preview";

export async function isPreviewMode(): Promise<boolean> {
  const store = await getCookieStore();
  return store.get(PREVIEW_COOKIE)?.value === "on";
}
