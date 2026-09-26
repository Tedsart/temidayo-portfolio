/**
 * Domain types for the portfolio.
 *
 * These mirror the Supabase schema in `supabase/migrations/0001_init.sql` and
 * are re-exported as generated DB types in `src/lib/database.types.ts`.
 * UI components should depend on these domain types, never on raw row shapes,
 * so the public site is decoupled from the storage layer.
 */

export type ProjectStatus = "draft" | "published" | "archived";

export const PROJECT_STATUSES: ProjectStatus[] = [
  "draft",
  "published",
  "archived",
];

export type AssetType =
  | "thumbnail"
  | "hero"
  | "dashboard"
  | "report_page"
  | "profile"
  | "document"
  | "dataset"
  | "other";

export const ASSET_TYPES: AssetType[] = [
  "thumbnail",
  "hero",
  "dashboard",
  "report_page",
  "profile",
  "document",
  "dataset",
  "other",
];

export const IMAGE_ASSET_TYPES: AssetType[] = [
  "thumbnail",
  "hero",
  "dashboard",
  "report_page",
  "profile",
];

export const FILE_ASSET_TYPES: AssetType[] = [
  "document",
  "dataset",
  "other",
];

export type LinkType =
  | "powerbi"
  | "looker"
  | "github"
  | "dataset"
  | "demo"
  | "other";

export const LINK_TYPES: LinkType[] = [
  "powerbi",
  "looker",
  "github",
  "dataset",
  "demo",
  "other",
];

export const LINK_TYPE_LABELS: Record<LinkType, string> = {
  powerbi: "Power BI",
  looker: "Looker Studio",
  github: "GitHub",
  dataset: "Dataset source",
  demo: "Live demo",
  other: "Other",
};

export type AssetGroup = "images" | "files";

export interface Project {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  short_description: string | null;
  category: string | null;
  project_date: string | null;
  status: ProjectStatus;
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

  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface ProjectFinding {
  id: string;
  project_id: string;
  headline: string;
  title: string;
  explanation: string | null;
  supporting_text: string | null;
  sort_order: number;
}

export interface ProjectAsset {
  id: string;
  project_id: string | null;
  asset_type: AssetType;
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  alt_text: string | null;
  caption: string | null;
  sort_order: number;
  created_at: string;
  /** Public URL resolved at query time (bucket URL or signed URL). Not persisted. */
  public_url: string | null;
  /** Byte size, when known. Not persisted on every provider. */
  size_bytes?: number | null;
}

export interface ProjectLink {
  id: string;
  project_id: string;
  link_type: LinkType;
  label: string;
  url: string;
  sort_order: number;
}

export interface ProjectWithRelations extends Project {
  findings: ProjectFinding[];
  assets: ProjectAsset[];
  links: ProjectLink[];
}

/** Shallow project shape used by listing pages (no relations). */
export type ProjectSummary = Pick<
  Project,
  | "id"
  | "title"
  | "slug"
  | "subtitle"
  | "short_description"
  | "category"
  | "project_date"
  | "status"
  | "featured"
  | "tools"
  | "updated_at"
  | "published_at"
> & {
  thumbnail: ProjectAsset | null;
};

export interface SiteProfile {
  name: string;
  role: string;
  tagline: string;
  intro: string;
  photo: ProjectAsset | null;
  email: string | null;
  linkedin: string | null;
  github: string | null;
}

export interface AdminStats {
  total: number;
  published: number;
  drafts: number;
  featured: number;
}

export type MediaScope = { project_id: string } | { project_id: null };

export interface DataResult<T> {
  data: T | null;
  error: string | null;
  /** True when Supabase is not configured and placeholder content is used. */
  usingFallback: boolean;
}
