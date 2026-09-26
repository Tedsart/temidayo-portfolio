import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudy } from "@/components/public/CaseStudy";
import { siteConfig } from "@/lib/config";
import {
  getAllPublishedSlugs,
  getNextPublishedProject,
  getProjectBySlugAnyStatus,
  getPublishedProjectBySlug,
} from "@/lib/data/projects";
import { getAdminUser } from "@/lib/supabase/client";
import { isPreviewMode } from "@/lib/preview";
import { absoluteUrl } from "@/lib/utils";

export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublishedProjectBySlug(slug);
  const project = result.data;

  if (!project) return { title: "Project not found" };

  const title = project.seo_title || `${project.title} · Case Study`;
  const description =
    project.seo_description || project.short_description || siteConfig.tagline;
  const url = absoluteUrl(`/work/${project.slug}`, siteConfig.url);
  const image = project.social_image || absoluteUrl("/og-default.svg", siteConfig.url);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: `${siteConfig.name} — Portfolio`,
      images: [{ url: image, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function ProjectCaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let usingFallback = false;
  let project = null;

  // Draft preview: only honoured for a signed-in administrator.
  if (await isPreviewMode()) {
    const admin = await getAdminUser();
    if (admin) {
      const any = await getProjectBySlugAnyStatus(slug);
      project = any.data;
      usingFallback = any.usingFallback;
    }
  }

  if (!project) {
    const result = await getPublishedProjectBySlug(slug);
    project = result.data;
    usingFallback = result.usingFallback;
  }

  if (!project) notFound();

  const next = await getNextPublishedProject(project.slug);

  return (
    <CaseStudy
      project={project}
      usingFallback={usingFallback}
      nextProject={next.data}
    />
  );
}
