import "server-only";

import { unstable_cache } from "next/cache";
import { isSupabaseConfigured } from "../config";
import {
  placeholderProfile,
  placeholderProjects,
} from "../content/placeholder-content";
import type { Database } from "../database.types";
import {
  createSupabasePublicClient,
  createSupabaseServerClient,
  type AppSupabaseClient,
} from "../supabase/client";
import { withPublicUrl, withPublicUrls } from "../supabase/media";
import type {
  AdminStats,
  DataResult,
  Project,
  ProjectAsset,
  ProjectFinding,
  ProjectLink,
  ProjectStatus,
  ProjectSummary,
  ProjectWithRelations,
  SiteProfile,
} from "../types";

/**
 * Read layer.
 *
 * Public queries are cached by tag and revalidated when content changes in the
 * CMS (`revalidateProjectCache`). Admin queries deliberately bypass the cache so
 * the editor always shows the latest saved row.
 *
 * When Supabase credentials are absent the placeholder content from
 * `content/placeholder-content.ts` is served so the site stays runnable. The
 * moment credentials exist, the database is the only source.
 */

const SUMMARY_FIELDS = [
  "id",
  "title",
  "slug",
  "subtitle",
  "short_description",
  "category",
  "project_date",
  "status",
  "featured",
  "tools",
  "updated_at",
  "published_at",
] as const;

const SUMMARY_COLUMNS = SUMMARY_FIELDS.join(", ");

function ok<T>(data: T): DataResult<T> {
  return { data, error: null, usingFallback: false };
}

function fallback<T>(data: T): DataResult<T> {
  return { data, error: null, usingFallback: true };
}

function fail<T>(message: string): DataResult<T> {
  return { data: null, error: message, usingFallback: false };
}

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type SummaryRow = Pick<ProjectRow, (typeof SUMMARY_FIELDS)[number]>;
type AssetRow = Database["public"]["Tables"]["project_assets"]["Row"];

const byOrderThenCreated = (a: { sort_order: number; created_at: string }, b: { sort_order: number; created_at: string }) =>
  a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at);

const sortAssets = (assets: ProjectAsset[]) => [...assets].sort(byOrderThenCreated);

function toSummary(row: SummaryRow, thumbnail: AssetRow | null): ProjectSummary {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    subtitle: row.subtitle,
    short_description: row.short_description,
    category: row.category,
    project_date: row.project_date,
    status: row.status,
    featured: row.featured,
    tools: row.tools ?? [],
    updated_at: row.updated_at,
    published_at: row.published_at,
    thumbnail: thumbnail ? withPublicUrl(thumbnail) : null,
  };
}

function summarisePlaceholder(project: ProjectWithRelations): ProjectSummary {
  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    subtitle: project.subtitle,
    short_description: project.short_description,
    category: project.category,
    project_date: project.project_date,
    status: project.status,
    featured: project.featured,
    tools: project.tools,
    updated_at: project.updated_at,
    published_at: project.published_at,
    thumbnail: project.assets.find((a) => a.asset_type === "thumbnail") ?? null,
  };
}

const orderPublicSummaries = (rows: ProjectSummary[]) =>
  [...rows].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    const aDate = a.published_at ?? a.updated_at;
    const bDate = b.published_at ?? b.updated_at;
    return bDate.localeCompare(aDate);
  });

async function queryPublicSummaries(): Promise<DataResult<ProjectSummary[]>> {
  const supabase = createSupabasePublicClient();
  if (!supabase) return fail("Supabase is not configured on the server.");

  const { data: rows, error } = await supabase
    .from("projects")
    .select(SUMMARY_COLUMNS)
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false });

  if (error) return fail(error.message);

  const summaries = await attachThumbnails(
    (rows ?? []) as unknown as SummaryRow[],
    supabase,
  );
  return ok(orderPublicSummaries(summaries));
}

async function attachThumbnails(
  rows: SummaryRow[],
  supabase: AppSupabaseClient | null,
): Promise<ProjectSummary[]> {
  const ids = rows.map((r) => r.id);
  const thumbs = new Map<string, AssetRow>();

  if (supabase && ids.length) {
    const { data: assets } = await supabase
      .from("project_assets")
      .select("*")
      .eq("asset_type", "thumbnail")
      .in("project_id", ids);
    for (const asset of assets ?? []) {
      if (asset.project_id) thumbs.set(asset.project_id, asset);
    }
  }

  return rows.map((row) => toSummary(row, thumbs.get(row.id) ?? null));
}

const cachedPublicSummaries = unstable_cache(queryPublicSummaries, ["public-projects"], {
  tags: ["projects", "projects:public"],
  revalidate: 3600,
});

async function queryProjectBySlug(slug: string): Promise<DataResult<ProjectWithRelations | null>> {
  const supabase = createSupabasePublicClient();
  if (!supabase) return fail("Supabase is not configured on the server.");

  const { data: row, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) return fail(error.message);
  if (!row) return ok(null);

  return ok(await assembleProject(row, supabase));
}

/** Public list — published projects only, featured first. */
export async function listPublishedProjects(): Promise<DataResult<ProjectSummary[]>> {
  if (!isSupabaseConfigured) {
    return fallback(
      orderPublicSummaries(
        placeholderProjects.filter((p) => p.status === "published").map(summarisePlaceholder),
      ),
    );
  }
  return cachedPublicSummaries();
}

export async function listFeaturedProjects(limit = 3): Promise<DataResult<ProjectSummary[]>> {
  const result = await listPublishedProjects();
  if (result.error || !result.data) return result;

  const featured = result.data.filter((p) => p.featured);
  const pool = featured.length ? featured : result.data;
  return { ...result, data: pool.slice(0, limit) };
}

/** Full case study for the public site. Drafts and archived work are never returned. */
export async function getPublishedProjectBySlug(
  slug: string,
): Promise<DataResult<ProjectWithRelations | null>> {
  if (!isSupabaseConfigured) {
    const match = placeholderProjects.find(
      (p) => p.slug === slug && p.status === "published",
    );
    return fallback(match ?? null);
  }

  const cached = unstable_cache(queryProjectBySlug, ["project", slug], {
    tags: ["projects", "projects:public", `project:${slug}`],
    revalidate: 3600,
  });
  return cached(slug);
}

/* -------------------------------------------------------------------------- */
/* Admin reads — always uncached so the editor reflects the latest save.       */
/* -------------------------------------------------------------------------- */

export async function listAllProjectsForAdmin(): Promise<DataResult<ProjectSummary[]>> {
  if (!isSupabaseConfigured) {
    const all = [...placeholderProjects]
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      .map(summarisePlaceholder);
    return fallback(all);
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured on the server.");

  const { data: rows, error } = await supabase
    .from("projects")
    .select(SUMMARY_COLUMNS)
    .order("updated_at", { ascending: false });

  if (error) return fail(error.message);
  return ok(
    await attachThumbnails((rows ?? []) as unknown as SummaryRow[], supabase),
  );
}

export async function getProjectBySlugAnyStatus(
  slug: string,
): Promise<DataResult<ProjectWithRelations | null>> {
  if (!isSupabaseConfigured) {
    return fallback(placeholderProjects.find((p) => p.slug === slug) ?? null);
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured on the server.");

  const { data: row, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) return fail(error.message);
  if (!row) return ok(null);

  return ok(await assembleProject(row, supabase));
}

export async function getProjectById(id: string): Promise<DataResult<ProjectWithRelations | null>> {
  if (!isSupabaseConfigured) {
    return fallback(placeholderProjects.find((p) => p.id === id) ?? null);
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured on the server.");

  const { data: row, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return fail(error.message);
  if (!row) return ok(null);

  return ok(await assembleProject(row, supabase));
}

export async function getAdminStats(): Promise<DataResult<AdminStats>> {
  const list = await listAllProjectsForAdmin();
  const rows = list.data ?? [];
  return {
    data: {
      total: rows.length,
      published: rows.filter((p) => p.status === "published").length,
      drafts: rows.filter((p) => p.status === "draft").length,
      featured: rows.filter((p) => p.featured).length,
    },
    error: list.error,
    usingFallback: list.usingFallback,
  };
}

/** Next published project for the case study footer. */
export async function getNextPublishedProject(
  currentSlug: string,
): Promise<DataResult<ProjectSummary | null>> {
  const result = await listPublishedProjects();
  if (result.error || !result.data) {
    return { data: null, error: result.error, usingFallback: result.usingFallback };
  }
  const others = result.data.filter((p) => p.slug !== currentSlug);
  return { data: others[0] ?? null, error: null, usingFallback: result.usingFallback };
}

export async function getAllPublishedSlugs(): Promise<string[]> {
  if (!isSupabaseConfigured) {
    return placeholderProjects.filter((p) => p.status === "published").map((p) => p.slug);
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase.from("projects").select("slug").eq("status", "published");
  return (data ?? []).map((r) => r.slug);
}

export async function getSiteProfile(): Promise<DataResult<SiteProfile>> {
  if (!isSupabaseConfigured) return fallback(placeholderProfile);

  const supabase = await createSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured on the server.");

  const { data, error } = await supabase
    .from("project_assets")
    .select("*")
    .eq("asset_type", "profile")
    .is("project_id", null)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) return fail(error.message);

  return ok({ ...placeholderProfile, photo: data ? withPublicUrl(data) : null });
}

/** Every uploaded asset, newest first — powers /admin/media. */
export async function listAllAssets(): Promise<DataResult<ProjectAsset[]>> {
  if (!isSupabaseConfigured) {
    return fallback(placeholderProjects.flatMap((p) => p.assets));
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured on the server.");

  const { data, error } = await supabase
    .from("project_assets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) return fail(error.message);
  return ok(withPublicUrls(data ?? []));
}

export async function listAssetsForProject(
  projectId: string,
): Promise<DataResult<ProjectAsset[]>> {
  if (!isSupabaseConfigured) {
    const project = placeholderProjects.find((p) => p.id === projectId);
    return fallback(sortAssets(project?.assets ?? []));
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured on the server.");

  const { data, error } = await supabase
    .from("project_assets")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) return fail(error.message);
  return ok(sortAssets(withPublicUrls(data ?? [])));
}

async function assembleProject(
  row: ProjectRow,
  supabase: AppSupabaseClient | null,
): Promise<ProjectWithRelations> {
  if (!supabase) {
    return { ...(row as Project), findings: [], assets: [], links: [] };
  }

  const [findings, assets, links] = await Promise.all([
    supabase
      .from("project_findings")
      .select("*")
      .eq("project_id", row.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("project_assets")
      .select("*")
      .eq("project_id", row.id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("project_links")
      .select("*")
      .eq("project_id", row.id)
      .order("sort_order", { ascending: true }),
  ]);

  return {
    ...(row as Project),
    tools: row.tools ?? [],
    skills: row.skills ?? [],
    findings: (findings.data ?? []) as ProjectFinding[],
    assets: sortAssets(withPublicUrls((assets.data ?? []) as AssetRow[])),
    links: (links.data ?? []) as ProjectLink[],
  };
}

export type { ProjectStatus };
