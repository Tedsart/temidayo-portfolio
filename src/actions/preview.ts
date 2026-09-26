"use server";

import { getCookieStore } from "@/lib/supabase/cookie-store";
import { getAdminUser } from "@/lib/supabase/client";
import { PREVIEW_COOKIE } from "@/lib/preview";

/**
 * Preview mode is a signed-in-admin convenience: it lets `/work/[slug]` resolve
 * unpublished projects. Security still comes from the RLS policies — an
 * anonymous visitor cannot read a draft with or without this cookie.
 */
export async function setPreviewMode(enabled: boolean): Promise<void> {
  const admin = await getAdminUser();
  if (!admin) return;

  const store = await getCookieStore();
  if (enabled) {
    store.set(PREVIEW_COOKIE, "on", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
  } else {
    store.delete(PREVIEW_COOKIE, { path: "/" });
  }
}
