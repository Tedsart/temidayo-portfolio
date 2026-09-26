"use server";

import { isSupabaseConfigured } from "@/lib/config";
import { createSupabaseServerClient } from "@/lib/supabase/client";

export type AuthActionResult =
  | { ok: true; error?: undefined }
  | { ok: false; error: string };

export async function loginAction(
  _prev: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  if (!isSupabaseConfigured) {
    return { ok: false, error: "Supabase is not configured. Add credentials to .env.local first." };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, error: "Enter your email and password." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, error: "Could not reach the auth service." };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false, error: "That email and password combination was not recognised." };
  }

  return { ok: true };
}

export async function logoutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;
  await supabase.auth.signOut();
}
