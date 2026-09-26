import type { Metadata } from "next";
import { FallbackNotice } from "@/components/public/FallbackNotice";
import { ProjectList } from "@/components/public/ProjectCard";
import { Container, EmptyState, SectionHeading } from "@/components/ui/primitives";
import { siteConfig } from "@/lib/config";
import { listPublishedProjects } from "@/lib/data/projects";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Case studies, dashboards and visual reports by Temidayo Kukoyi — every project is a data story with the question, the evidence and the outcome.",
  alternates: { canonical: "/work" },
};

export const dynamic = "force-dynamic";

export default async function WorkIndexPage() {
  const result = await listPublishedProjects();
  const projects = result.data ?? [];

  return (
    <>
      {result.usingFallback ? <FallbackNotice /> : null}
      <Container className="py-16 md:py-24">
        <SectionHeading
          index="INDEX — ALL WORK"
        title="Every published project, in full."
        description={`${siteConfig.name} — case studies, dashboards and visual reports. Each one follows the same discipline: a real question, honest data, and a story people can act on.`}
      />

      <div className="mt-14">
        {projects.length ? (
          <ProjectList
            projects={projects}
            usingFallback={result.usingFallback}
            lead
          />
        ) : (
          <EmptyState
            title="No projects published yet."
            description="The first case study will appear here the moment it is published from the CMS."
          />
        )}
      </div>
      </Container>
    </>
  );
}
