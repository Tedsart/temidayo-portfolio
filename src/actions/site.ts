"use server";

import { updateTag } from "next/cache";
import { isSupabaseConfigured } from "@/lib/config";
import { createSupabaseServerClient, requireAdmin } from "@/lib/supabase/client";
import type { ExperienceEntry } from "@/lib/types";
import type { ActionResult } from "./assets";

export interface SiteSettingsInput {
  intro: string | null;
  statistics_background: string | null;
  experience: ExperienceEntry[];
  interests: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  contact_email: string | null;
}

const blank = (v: string | null): string | null =>
  v && v.trim().length > 0 ? v.trim() : null;

/** Saves the single-row site profile. Admin only; RLS enforces it server-side. */
export async function saveSiteSettings(
  input: SiteSettingsInput,
): Promise<ActionResult> {
  if (!isSupabaseConfigured) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const admin = await requireAdmin().catch(() => null);
  if (!admin) return { ok: false, error: "You need to sign in first." };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const experience = input.experience
    .filter((e) => e.title.trim().length > 0)
    .map((e) => ({
      title: e.title.trim(),
      organization: blank(e.organization),
      period: blank(e.period),
      note: blank(e.note),
    }));

  const { error } = await supabase
    .from("site_settings")
    .upsert(
      {
        id: 1,
        intro: blank(input.intro),
        statistics_background: blank(input.statistics_background),
        experience,
        interests: blank(input.interests),
        linkedin_url: blank(input.linkedin_url),
        github_url: blank(input.github_url),
        contact_email: blank(input.contact_email),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

  if (error) return { ok: false, error: `Could not save settings: ${error.message}` };

  updateTag("site-settings");
  return { ok: true };
}
