"use server";

import { revalidatePath, updateTag } from "next/cache";
import { isSupabaseConfigured } from "@/lib/config";
import { createSupabaseServerClient } from "@/lib/supabase/client";
import { requireAdmin } from "@/lib/supabase/client";
import type { Database } from "@/lib/database.types";
import {
  PROJECT_STATUSES,
  type ProjectFinding,
  type ProjectLink,
  type ProjectStatus,
} from "@/lib/types";
import { slugify } from "@/lib/utils";

type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];

export type ActionResult<T = undefined> =
  | { ok: true; data?: T; error?: undefined }
  | { ok: false; error: string; data?: undefined };

const notConfigured: ActionResult<never> = {
  ok: false,
  error: "Supabase is not configured. Add credentials to .env.local, run the migrations, then retry.",
};

function invalidateContent() {
  updateTag("projects");
  updateTag("projects:public");
  revalidatePath("/");
  revalidatePath("/work");
}

function invalidateProject(slug?: string | null) {
  invalidateContent();
  if (slug) updateTag(`project:${slug}`);
}

export interface ProjectFormPayload {
  id: string | null;
  title: string;
  slug: string;
  subtitle: string | null;
  short_description: string | null;
  category: string | null;
  project_date: string | null;
  featured: boolean;
  tools: string[];
  skills: string[];
  question: string | null;
  objective: string | null;
  context: string | null;
  dataset: string | null;
  data_sources: string | null;
  methodology: string | null;
  analysis_process: string | null;
  challenges: string | null;
  recommendations: string | null;
  conclusion: string | null;
  seo_title: string | null;
  seo_description: string | null;
  social_image: string | null;
}

export async function saveProject(
  payload: ProjectFormPayload,
): Promise<ActionResult<{ id: string; slug: string }>> {
  if (!isSupabaseConfigured) return notConfigured;
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return { ok: false, error: "You need to sign in first." };

  const title = payload.title?.trim();
  if (!title) return { ok: false, error: "A project needs a title before it can be saved." };

  const slug = (payload.slug || slugify(title)).trim();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return { ok: false, error: "The slug may only contain lowercase letters, numbers and hyphens." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return notConfigured;

  // Slug must stay unique across the whole portfolio.
  const { data: clash } = await supabase
    .from("projects")
    .select("id")
    .eq("slug", slug)
    .neq("id", payload.id ?? "00000000-0000-0000-0000-000000000000")
    .maybeSingle();

  if (clash) {
    return { ok: false, error: `Another project already uses the slug “${slug}”.` };
  }

  const fields: Omit<ProjectInsert, "title" | "slug"> = {
    subtitle: payload.subtitle,
    short_description: payload.short_description,
    category: payload.category,
    project_date: payload.project_date,
    featured: payload.featured,
    tools: payload.tools,
    skills: payload.skills,
    question: payload.question,
    objective: payload.objective,
    context: payload.context,
    dataset: payload.dataset,
    data_sources: payload.data_sources,
    methodology: payload.methodology,
    analysis_process: payload.analysis_process,
    challenges: payload.challenges,
    recommendations: payload.recommendations,
    conclusion: payload.conclusion,
    seo_title: payload.seo_title,
    seo_description: payload.seo_description,
    social_image: payload.social_image,
  };

  if (payload.id) {
    const { error } = await supabase
      .from("projects")
      .update({ ...fields, title, slug } satisfies ProjectUpdate)
      .eq("id", payload.id);
    if (error) return { ok: false, error: friendlyDbError(error.message) };
    invalidateProject(slug);
    return { ok: true, data: { id: payload.id, slug } };
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({ ...fields, title, slug, status: "draft" } satisfies ProjectInsert)
    .select("id")
    .single();

  if (error) return { ok: false, error: friendlyDbError(error.message) };
  invalidateContent();
  return { ok: true, data: { id: data.id, slug } };
}

export async function setProjectStatus(
  projectId: string,
  status: ProjectStatus,
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return notConfigured;
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return { ok: false, error: "You need to sign in first." };
  if (!PROJECT_STATUSES.includes(status)) {
    return { ok: false, error: "Unknown status." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return notConfigured;

  const { error } = await supabase
    .from("projects")
    .update({ status })
    .eq("id", projectId);

  if (error) return { ok: false, error: friendlyDbError(error.message) };
  invalidateContent();
  return { ok: true };
}

export async function toggleFeatured(
  projectId: string,
  featured: boolean,
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return notConfigured;
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return { ok: false, error: "You need to sign in first." };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return notConfigured;

  const { error } = await supabase
    .from("projects")
    .update({ featured })
    .eq("id", projectId);

  if (error) return { ok: false, error: friendlyDbError(error.message) };
  invalidateContent();
  return { ok: true };
}

export async function deleteProject(projectId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return notConfigured;
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return { ok: false, error: "You need to sign in first." };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return notConfigured;

  // Children cascade; storage objects are removed too so no orphans remain.
  const { data: assets } = await supabase
    .from("project_assets")
    .select("storage_path")
    .eq("project_id", projectId);

  const { error } = await supabase.from("projects").delete().eq("id", projectId);
  if (error) return { ok: false, error: friendlyDbError(error.message) };

  const paths = (assets ?? []).map((a) => a.storage_path).filter(Boolean);
  if (paths.length) {
    await supabase.storage.from("content").remove(paths);
  }

  invalidateContent();
  return { ok: true };
}

/* -------------------------------------------------------------------------- */
/* Findings & links — saved as an ordered set from the editor.                 */
/* -------------------------------------------------------------------------- */

export type FindingInput = Omit<ProjectFinding, "id" | "project_id" | "created_at" | "updated_at">;

export async function saveFindings(
  projectId: string,
  findings: FindingInput[],
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return notConfigured;
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return { ok: false, error: "You need to sign in first." };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return notConfigured;

  const { error: clearError } = await supabase
    .from("project_findings")
    .delete()
    .eq("project_id", projectId);
  if (clearError) return { ok: false, error: friendlyDbError(clearError.message) };

  if (findings.length) {
    const { error } = await supabase.from("project_findings").insert(
      findings.map((f, i) => ({
        project_id: projectId,
        headline: f.headline,
        title: f.title,
        explanation: f.explanation,
        supporting_text: f.supporting_text,
        sort_order: i,
      })),
    );
    if (error) return { ok: false, error: friendlyDbError(error.message) };
  }

  invalidateContent();
  return { ok: true };
}

export type LinkInput = Omit<ProjectLink, "id" | "project_id" | "created_at">;

export async function saveLinks(
  projectId: string,
  links: LinkInput[],
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return notConfigured;
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return { ok: false, error: "You need to sign in first." };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return notConfigured;

  const { error: clearError } = await supabase
    .from("project_links")
    .delete()
    .eq("project_id", projectId);
  if (clearError) return { ok: false, error: friendlyDbError(clearError.message) };

  if (links.length) {
    const { error } = await supabase.from("project_links").insert(
      links.map((l, i) => ({
        project_id: projectId,
        link_type: l.link_type,
        label: l.label,
        url: l.url,
        sort_order: i,
      })),
    );
    if (error) return { ok: false, error: friendlyDbError(error.message) };
  }

  invalidateContent();
  return { ok: true };
}

function friendlyDbError(message: string): string {
  if (message.includes("duplicate key") && message.includes("projects_slug_key")) {
    return "Another project already uses that slug.";
  }
  if (message.includes("row-level security")) {
    return "The database refused this change — check that you are signed in as an administrator.";
  }
  return `The database returned an error: ${message}`;
}
