/**
 * Runtime configuration. Everything here is derived from environment variables.
 *
 * The portfolio must still run — in a clearly-marked placeholder mode — before
 * Supabase credentials exist, so `isSupabaseConfigured` gates every call into
 * the database layer.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

export const supabaseConfig = {
  url,
  anonKey,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "",
  bucket: process.env.SUPABASE_STORAGE_BUCKET?.trim() || "content",
};

/** Both public credentials are present and the URL looks like a project URL. */
export const isSupabaseConfigured =
  Boolean(url && anonKey) && /^https?:\/\//.test(url);

/** True when a service-role key is available on the server. */
export const hasServiceRole = Boolean(supabaseConfig.serviceRoleKey);

export const siteConfig = {
  name: "Temidayo Kukoyi",
  role: "Data Analyst · Data Visualization · Data Storytelling",
  tagline: "I turn data into insights, visualizations and stories people can understand.",
  headline: "Data that makes sense.",
  /** Fallback origin when NEXT_PUBLIC_SITE_URL is unset (local development). */
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000",
  email: process.env.CONTACT_EMAIL?.trim() || null,
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL?.trim() || null,
  github: process.env.NEXT_PUBLIC_GITHUB_URL?.trim() || null,
  description:
    "Portfolio of Temidayo Kukoyi — a data analyst building dashboards, visualizations and data stories people can understand.",
  defaultOgImage: "/og-default.svg",
};

export const nav = [
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const processStages = [
  {
    id: "understand",
    index: "01",
    title: "Understand",
    body: "Start with the question, not the data. Who is asking, what decision hangs on the answer, and what would actually change behaviour.",
  },
  {
    id: "explore",
    index: "02",
    title: "Explore",
    body: "Profile the dataset. Check quality, distributions, gaps and outliers before any number is trusted or shared.",
  },
  {
    id: "analyze",
    index: "03",
    title: "Analyze",
    body: "Test the relationships that matter. Keep the method simple enough to defend and precise enough to be useful.",
  },
  {
    id: "visualize",
    index: "04",
    title: "Visualize",
    body: "Design charts that reveal a pattern at a glance, with the hierarchy and labelling that make them readable on any screen.",
  },
  {
    id: "communicate",
    index: "05",
    title: "Communicate",
    body: "Close with the finding, the evidence and the recommendation — in a form the audience can act on the same day.",
  },
] as const;

export const capabilities = [
  {
    id: "analyze",
    index: "01",
    title: "Analyze",
    body: "Turn raw data into useful evidence through statistical thinking, exploration and analysis.",
    points: ["Exploratory analysis", "Data quality & cleaning", "Statistical testing"],
  },
  {
    id: "visualize",
    index: "02",
    title: "Visualize",
    body: "Build dashboards and visualizations that reveal patterns instead of simply displaying numbers.",
    points: ["Dashboard design", "Visual hierarchy", "Interaction & filters"],
  },
  {
    id: "communicate",
    index: "03",
    title: "Communicate",
    body: "Turn findings into clear stories, reports and presentations people can understand.",
    points: ["Narrative structure", "Executive reporting", "Presentation design"],
  },
] as const;

export const approachPipeline = [
  "Source",
  "Clean",
  "Analyze",
  "Visualize",
  "Communicate",
] as const;
