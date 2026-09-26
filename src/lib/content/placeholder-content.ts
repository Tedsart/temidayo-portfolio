import type {
  Project,
  ProjectAsset,
  ProjectFinding,
  ProjectLink,
  ProjectWithRelations,
  SiteProfile,
} from "../types";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * PLACEHOLDER CONTENT — NOT REAL PORTFOLIO FACTS
 * ─────────────────────────────────────────────────────────────────────────────
 * This module exists only so the site is runnable and reviewable before
 * Supabase credentials are configured. Every string here is a stub:
 *
 *   • Nothing is published from this file once Supabase is configured.
 *   • Nothing here may be read as a real client, employer, dataset or result.
 *   • Any bracketed text — [ … ] — marks a value Temidayo must supply.
 *
 * Replace all of it through the CMS: /admin → Create new project.
 */

const PLACEHOLDER_NOTE =
  "[Placeholder copy — replace this in the CMS. No real findings, clients or results are stored here.]";

const ISO = "2025-01-01T00:00:00.000Z";

type SeedProject = Omit<Project, "id" | "created_at" | "updated_at"> & {
  id: string;
  created_at?: string;
  updated_at?: string;
  findings?: Omit<ProjectFinding, "id" | "project_id">[];
  assets?: Omit<ProjectAsset, "id" | "project_id" | "created_at" | "public_url">[];
  links?: Omit<ProjectLink, "id" | "project_id">[];
};

const base: Omit<Project, "id" | "title" | "slug"> = {
  subtitle: null,
  short_description: null,
  category: null,
  project_date: null,
  status: "published",
  featured: false,
  tools: [],
  skills: [],
  question: null,
  objective: null,
  context: null,
  dataset: null,
  data_sources: null,
  methodology: null,
  analysis_process: null,
  challenges: null,
  recommendations: null,
  conclusion: null,
  seo_title: null,
  seo_description: null,
  social_image: null,
  created_at: ISO,
  updated_at: ISO,
  published_at: ISO,
};

export const placeholderProjects: ProjectWithRelations[] = (
  [
    {
      ...base,
      id: "seed-nigeria-inflation",
      title: "Nigeria Inflation Dashboard",
      slug: "nigeria-inflation-dashboard",
      subtitle: "Reading a year of price change, month by month",
      short_description:
        "A dashboard and visual report that turns Nigeria's monthly inflation series into a story about what is actually getting more expensive.",
      category: "Economic analysis",
      project_date: "[Project date]",
      status: "published",
      featured: true,
      tools: ["Power BI", "SQL", "Excel"],
      skills: ["Time-series analysis", "Dashboard design", "Data storytelling"],
      question:
        "[What is the question this project answered? Example: which categories drove headline inflation over the period, and how unevenly did households feel it?]",
      objective:
        "[State the objective. Example: give a non-technical reader a defensible read on the direction and drivers of inflation, in one page.]",
      context: `[Context goes here. ${PLACEHOLDER_NOTE}]`,
      dataset: "[Describe the dataset: grain, coverage, rows, refresh cadence.]",
      data_sources: "[List the sources, e.g. the official statistical release used.]",
      methodology:
        "[Explain the method: how the series was aligned, which deflators or rebasing decisions were made, how missing months were handled.]",
      analysis_process:
        "[Walk through the analysis steps in the order they happened, including what was rejected.]",
      challenges:
        "[Note the hard parts: revisions, category weighting, missing months, conflicting releases.]",
      recommendations:
        "[What should the reader do with this? Keep it short and specific.]",
      conclusion: "[What changed because this analysis existed?]",
      findings: [
        {
          headline: "[00.0%]",
          title: "[Finding one headline]",
          explanation: "[One or two sentences of plain explanation for a non-technical reader.]",
          supporting_text: "[Optional supporting detail or caveat.]",
          sort_order: 0,
        },
        {
          headline: "[0.0×]",
          title: "[Finding two headline]",
          explanation: "[One or two sentences of plain explanation for a non-technical reader.]",
          supporting_text: null,
          sort_order: 1,
        },
        {
          headline: "[00]",
          title: "[Finding three headline]",
          explanation: "[One or two sentences of plain explanation for a non-technical reader.]",
          supporting_text: null,
          sort_order: 2,
        },
      ],
      assets: [
        {
          asset_type: "thumbnail",
          storage_path: "",
          file_name: "placeholder-thumbnail.svg",
          mime_type: "image/svg+xml",
          alt_text: "[Thumbnail for Nigeria Inflation Dashboard]",
          caption: null,
          sort_order: 0,
        },
        {
          asset_type: "hero",
          storage_path: "",
          file_name: "placeholder-hero.svg",
          mime_type: "image/svg+xml",
          alt_text: "[Hero image for Nigeria Inflation Dashboard]",
          caption: null,
          sort_order: 0,
        },
        { asset_type: "dashboard", storage_path: "", file_name: "placeholder-dashboard.svg", mime_type: "image/svg+xml", alt_text: "[Dashboard screenshot 01]", caption: "[Caption for this screen]", sort_order: 0 },
        { asset_type: "dashboard", storage_path: "", file_name: "placeholder-dashboard.svg", mime_type: "image/svg+xml", alt_text: "[Dashboard screenshot 02]", caption: null, sort_order: 1 },
        { asset_type: "report_page", storage_path: "", file_name: "placeholder-report.svg", mime_type: "image/svg+xml", alt_text: "[Visual report page 01]", caption: null, sort_order: 0 },
        { asset_type: "report_page", storage_path: "", file_name: "placeholder-report.svg", mime_type: "image/svg+xml", alt_text: "[Visual report page 02]", caption: null, sort_order: 1 },
        { asset_type: "report_page", storage_path: "", file_name: "placeholder-report.svg", mime_type: "image/svg+xml", alt_text: "[Visual report page 03]", caption: null, sort_order: 2 },
      ],
      links: [
        { link_type: "powerbi", label: "[View interactive dashboard]", url: "https://example.com/placeholder-dashboard", sort_order: 0 },
        { link_type: "dataset", label: "[Dataset source]", url: "https://example.com/placeholder-dataset", sort_order: 1 },
      ],
    },
    {
      ...base,
      id: "seed-second-project",
      title: "[Second project title]",
      slug: "second-project-slug",
      subtitle: "[One-line subtitle]",
      short_description:
        "[Two-sentence summary that appears on the work index. Keep it concrete: what was analysed and what came out of it.]",
      category: "[Category]",
      project_date: "[Project date]",
      status: "published",
      featured: true,
      tools: ["[Tool]"],
      skills: ["[Skill]"],
      question: "[Question]",
      objective: "[Objective]",
      findings: [
        {
          headline: "[00.0%]",
          title: "[Finding headline]",
          explanation: "[Explanation]",
          supporting_text: null,
          sort_order: 0,
        },
      ],
      assets: [
        { asset_type: "thumbnail", storage_path: "", file_name: "placeholder-thumbnail.svg", mime_type: "image/svg+xml", alt_text: "[Thumbnail]", caption: null, sort_order: 0 },
        { asset_type: "hero", storage_path: "", file_name: "placeholder-hero.svg", mime_type: "image/svg+xml", alt_text: "[Hero]", caption: null, sort_order: 0 },
        { asset_type: "report_page", storage_path: "", file_name: "placeholder-report.svg", mime_type: "image/svg+xml", alt_text: "[Report page 01]", caption: null, sort_order: 0 },
      ],
      links: [],
    },
    {
      ...base,
      id: "seed-third-project",
      title: "[Third project title]",
      slug: "third-project-slug",
      subtitle: "[One-line subtitle]",
      short_description: "[Two-sentence summary for the work index.]",
      category: "[Category]",
      project_date: "[Project date]",
      status: "published",
      tools: ["[Tool]"],
      skills: ["[Skill]"],
      question: "[Question]",
      findings: [],
      assets: [
        { asset_type: "thumbnail", storage_path: "", file_name: "placeholder-thumbnail.svg", mime_type: "image/svg+xml", alt_text: "[Thumbnail]", caption: null, sort_order: 0 },
      ],
      links: [],
    },
    {
      ...base,
      id: "seed-draft",
      title: "[Draft project — not visible publicly]",
      slug: "draft-project-slug",
      subtitle: "[One-line subtitle]",
      short_description:
        "[This project is a draft. It proves the draft → preview → publish flow works before anything real is published.]",
      category: "[Category]",
      project_date: "[Project date]",
      status: "draft",
      published_at: null,
      tools: ["[Tool]"],
      skills: ["[Skill]"],
      question: "[Question]",
      findings: [],
      assets: [],
      links: [],
    },
  ] as SeedProject[]
).map((seed) => {
  const { findings = [], assets = [], links = [], ...project } = seed;
  const id = project.id;
  return {
    ...(project as Project),
    created_at: project.created_at ?? ISO,
    updated_at: project.updated_at ?? ISO,
    findings: findings.map((f, i) => ({
      ...f,
      id: `${id}-finding-${i}`,
      project_id: id,
    })),
    assets: assets.map((a, i) => ({
      ...a,
      id: `${id}-asset-${i}`,
      project_id: id,
      created_at: ISO,
      public_url: null,
    })),
    links: links.map((l, i) => ({ ...l, id: `${id}-link-${i}`, project_id: id })),
  };
});

export const placeholderProfile: SiteProfile = {
  name: "Temidayo Kukoyi",
  role: "Data Analyst · Data Visualization · Data Storytelling",
  tagline: "I turn data into insights, visualizations and stories people can understand.",
  intro:
    "[Short introduction goes here — two or three sentences about how Temidayo works and what he cares about in analysis. Upload a real profile photo in Admin → Media.]",
  photo: null,
  email: null,
  linkedin: null,
  github: null,
};

export const isPlaceholderText = (value?: string | null): boolean =>
  Boolean(value && value.trimStart().startsWith("["));
