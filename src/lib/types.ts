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
  | "other"
  | "cv"
  | "cover";

export const ASSET_TYPES: AssetType[] = [
  "thumbnail",
  "hero",
  "dashboard",
  "report_page",
  "profile",
  "document",
  "dataset",
  "other",
  "cv",
  "cover",
];

export const IMAGE_ASSET_TYPES: AssetType[] = [
  "thumbnail",
  "hero",
  "dashboard",
  "report_page",
  "profile",
  "cover",
];

export const FILE_ASSET_TYPES: AssetType[] = [
  "document",
  "dataset",
  "other",
  "cv",
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

/** One experience entry edited in Admin → Site settings. */
export interface ExperienceEntry {
  title: string;
  organization: string | null;
  period: string | null;
  note: string | null;
}

/** CMS-editable site profile (site_settings table). */
export interface SiteSettings {
  intro: string | null;
  statistics_background: string | null;
  experience: ExperienceEntry[];
  interests: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  contact_email: string | null;
  updated_at: string;
}

export interface SiteProfile {
  name: string;
  role: string;
  tagline: string;
  intro: string | null;
  photo: ProjectAsset | null;
  cv: ProjectAsset | null;
  email: string | null;
  linkedin: string | null;
  github: string | null;
  statistics_background: string | null;
  experience: ExperienceEntry[];
  interests: string | null;
}


/* ---------------------------------------------------------------------------
 * Digital products (Writing & Products)
 *
 * Deliberately small: the site displays the product and links out to Selar,
 * which owns checkout, payment and delivery. Nothing here stores or touches
 * payment data.
 * ------------------------------------------------------------------------- */

export type ProductType =
  | "ebook"
  | "template"
  | "guide"
  | "resource"
  | "course"
  | "other";

export const PRODUCT_TYPES: ProductType[] = [
  "ebook",
  "template",
  "guide",
  "resource",
  "course",
  "other",
];

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  ebook: "Ebook",
  template: "Template",
  guide: "Guide",
  resource: "Resource",
  course: "Course",
  other: "Other",
};

export interface Product {
  id: string;
  type: ProductType;
  title: string;
  slug: string;
  subtitle: string | null;
  short_description: string | null;
  long_description: string | null;
  cover: ProjectAsset | null;
  price_amount: number | null;
  currency: string;
  price_display: string | null;
  badge: string | null;
  product_url: string | null;
  checkout_url: string | null;
  button_text: string;
  secondary_button_text: string | null;
  secondary_url: string | null;
  author: string | null;
  page_count: number | null;
  format: string | null;
  audience: string | null;
  outcomes: string[];
  preview_note: string | null;
  featured: boolean;
  sort_order: number;
  enabled: boolean;
  published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

/** The shape the CMS editor saves. */
export interface ProductInput {
  id?: string;
  type: ProductType;
  title: string;
  slug: string;
  subtitle: string | null;
  short_description: string | null;
  long_description: string | null;
  cover_asset_id: string | null;
  price_amount: number | null;
  currency: string;
  price_display: string | null;
  badge: string | null;
  product_url: string | null;
  checkout_url: string | null;
  button_text: string;
  secondary_button_text: string | null;
  secondary_url: string | null;
  author: string | null;
  page_count: number | null;
  format: string | null;
  audience: string | null;
  outcomes: string[];
  preview_note: string | null;
  featured: boolean;
  sort_order: number;
  enabled: boolean;
  published: boolean;
  seo_title: string | null;
  seo_description: string | null;
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
