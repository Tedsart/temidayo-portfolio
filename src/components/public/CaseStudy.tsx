import Link from "next/link";
import {
  ApproachPipeline,
  DashboardGallery,
  ExternalLinks,
  FindingGrid,
} from "@/components/public/CaseStudyBlocks";
import { DocumentList } from "@/components/public/DocumentList";
import { AssetImage } from "@/components/public/AssetImage";
import { ReportCarousel } from "@/components/public/ReportCarousel";
import { Reveal } from "@/components/motion/Reveal";
import { Container, MetaLabel, StatusBadge, Tag } from "@/components/ui/primitives";
import type { ProjectSummary, ProjectWithRelations } from "@/lib/types";
import { formatProjectDate, hasContent, padIndex } from "@/lib/utils";

/**
 * The full editorial case-study body. Shared by the public `/work/[slug]`
 * route and the admin draft preview, so previews always use the real design.
 */
export function CaseStudy({
  project,
  usingFallback = false,
  nextProject = null,
}: {
  project: ProjectWithRelations;
  usingFallback?: boolean;
  nextProject?: ProjectSummary | null;
}) {
  const hero = project.assets.find((a) => a.asset_type === "hero") ?? null;
  const dashboards = project.assets.filter((a) => a.asset_type === "dashboard");
  const reportPages = project.assets.filter((a) => a.asset_type === "report_page");
  const documents = project.assets.filter(
    (a) => a.asset_type === "document" || a.asset_type === "dataset" || a.asset_type === "other",
  );

  const interactiveLinks = project.links.filter((l) =>
    ["powerbi", "looker", "demo"].includes(l.link_type),
  );
  const otherLinks = project.links.filter(
    (l) => !["powerbi", "looker", "demo"].includes(l.link_type),
  );

  const hasStory =
    hasContent(project.question) || hasContent(project.context) || hasContent(project.objective);
  const hasData = hasContent(project.dataset) || hasContent(project.data_sources);
  const hasApproach =
    hasContent(project.methodology) ||
    hasContent(project.analysis_process) ||
    hasContent(project.challenges);

  return (
    <article>
      {project.status !== "published" ? (
        <div className="border-b border-warning/25 bg-warning/[0.07]">
          <Container className="py-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-warning">
              Draft preview — this project is {project.status} and invisible to visitors.
            </p>
          </Container>
        </div>
      ) : null}

      {/* Project header */}
      <header className="border-b border-line">
        <Container className="py-16 md:py-24">
          <Reveal>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <MetaLabel>{formatProjectDate(project.project_date)}</MetaLabel>
              {project.category ? <Tag>{project.category}</Tag> : null}
              {project.featured ? <Tag tone="accent">Featured</Tag> : null}
              {project.status !== "published" ? (
                <StatusBadge status={project.status} />
              ) : null}
            </div>
          </Reveal>

          <Reveal index={1}>
            <h1 className="mt-7 max-w-4xl text-[clamp(2.25rem,6.5vw,4.5rem)] font-semibold leading-[1.0] tracking-[-0.02em]">
              {project.title}
            </h1>
          </Reveal>

          {project.subtitle ? (
            <Reveal index={2}>
              <p className="mt-5 max-w-2xl text-xl leading-relaxed text-ink-2 md:text-2xl">
                {project.subtitle}
              </p>
            </Reveal>
          ) : null}

          {project.short_description ? (
            <Reveal index={3}>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted">
                {project.short_description}
              </p>
            </Reveal>
          ) : null}

          {project.tools.length ? (
            <Reveal index={4} className="mt-9 border-t border-line pt-5">
              <dl className="flex flex-wrap gap-x-12 gap-y-4">
                <div>
                  <dt className="label-meta">Tools</dt>
                  <dd className="mt-1.5 text-sm text-ink-2">{project.tools.join(" · ")}</dd>
                </div>
                {project.skills.length ? (
                  <div>
                    <dt className="label-meta">Skills</dt>
                    <dd className="mt-1.5 text-sm text-ink-2">{project.skills.join(" · ")}</dd>
                  </div>
                ) : null}
              </dl>
            </Reveal>
          ) : null}
        </Container>
      </header>

      {/* Hero image */}
      <Container className="py-12 md:py-16">
        <Reveal>
          <div className="relative overflow-hidden border border-line">
            <AssetImage
              src={hero?.public_url}
              alt={hero?.alt_text || `${project.title} — hero visual`}
              aspect="16/9"
              sizes="(max-width: 1360px) 100vw, 1320px"
              priority
              fallbackLabel="Hero image not uploaded yet"
              badge={usingFallback ? "Sample media" : undefined}
            />
          </div>
          {hero?.caption ? <p className="mt-3 text-sm text-muted">{hero.caption}</p> : null}
        </Reveal>
      </Container>

      {hasStory ? (
        <StorySection index="01" label="The Question">
          {hasContent(project.question) ? (
            <p className="text-[clamp(1.25rem,2.6vw,1.75rem)] font-medium leading-snug tracking-[-0.015em] text-ink">
              {project.question}
            </p>
          ) : null}
          {hasContent(project.context) ? (
            <div className="prose-editorial mt-6">
              <p>{project.context}</p>
            </div>
          ) : null}
          {hasContent(project.objective) ? (
            <div className="mt-8 border-l-2 border-accent bg-accent-soft/50 px-6 py-5">
              <MetaLabel className="text-accent">Objective</MetaLabel>
              <p className="mt-2 text-base leading-relaxed text-ink-2">{project.objective}</p>
            </div>
          ) : null}
        </StorySection>
      ) : null}

      {hasData ? (
        <StorySection index="02" label="The Data">
          <dl className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
            {hasContent(project.dataset) ? (
              <div>
                <dt className="label-meta">Dataset</dt>
                <dd className="prose-editorial mt-2 text-base">
                  <p>{project.dataset}</p>
                </dd>
              </div>
            ) : null}
            {hasContent(project.data_sources) ? (
              <div>
                <dt className="label-meta">Data sources</dt>
                <dd className="prose-editorial mt-2 text-base">
                  <p>{project.data_sources}</p>
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="label-meta">Period</dt>
              <dd className="mt-2 text-base text-ink-2">
                {formatProjectDate(project.project_date)}
              </dd>
            </div>
          </dl>
        </StorySection>
      ) : null}

      {hasApproach ? (
        <StorySection index="03" label="The Approach">
          <ApproachPipeline />
          <div className="prose-editorial mt-8 grid gap-8 lg:grid-cols-2">
            {hasContent(project.methodology) ? (
              <div>
                <MetaLabel>Methodology</MetaLabel>
                <p className="mt-3">{project.methodology}</p>
              </div>
            ) : null}
            {hasContent(project.analysis_process) ? (
              <div>
                <MetaLabel>Analysis process</MetaLabel>
                <p className="mt-3">{project.analysis_process}</p>
              </div>
            ) : null}
          </div>
          {hasContent(project.challenges) ? (
            <div className="mt-8 border border-line bg-paper-2/70 px-6 py-5">
              <MetaLabel>Challenges</MetaLabel>
              <p className="mt-2 text-base leading-relaxed text-ink-2">{project.challenges}</p>
            </div>
          ) : null}
        </StorySection>
      ) : null}

      {project.findings.length ? (
        <StorySection index="04" label="Key Findings">
          <FindingGrid findings={project.findings} />
        </StorySection>
      ) : null}

      {dashboards.length ? (
        <StorySection index="05" label="Dashboard Gallery">
          <DashboardGallery shots={dashboards} />
        </StorySection>
      ) : null}

      {interactiveLinks.length ? (
        <StorySection index="06" label="Interactive Dashboard">
          <p className="mb-6 max-w-xl text-base leading-relaxed text-muted">
            The interactive dashboard is hosted externally and opens in a new tab —
            best viewed on a large screen.
          </p>
          <ExternalLinks links={interactiveLinks} />
        </StorySection>
      ) : null}

      {reportPages.length ? (
        <StorySection index="07" label="Visual Report">
          <ReportCarousel pages={reportPages} />
        </StorySection>
      ) : null}

      {documents.length ? (
        <StorySection index="08" label="Documents & Datasets">
          <DocumentList documents={documents} />
        </StorySection>
      ) : null}

      {hasContent(project.recommendations) ? (
        <StorySection index="09" label="Recommendations">
          <div className="prose-editorial">
            <p>{project.recommendations}</p>
          </div>
        </StorySection>
      ) : null}

      {hasContent(project.conclusion) ? (
        <StorySection index="10" label="Outcome">
          <div className="prose-editorial">
            <p>{project.conclusion}</p>
          </div>
        </StorySection>
      ) : null}

      {otherLinks.length ? (
        <StorySection index="11" label="More Links">
          <ExternalLinks links={otherLinks} variant="block" />
        </StorySection>
      ) : null}

      {nextProject ? (
        <section className="border-t border-ink">
          <Link
            href={`/work/${nextProject.slug}`}
            className="group block transition-colors hover:bg-paper-2/70"
          >
            <Container className="grid items-center gap-8 py-14 md:grid-cols-[auto_1fr_auto] md:gap-12 md:py-20">
              <MetaLabel>Next project</MetaLabel>
              <h2 className="text-[clamp(1.75rem,4.5vw,3rem)] font-semibold leading-tight tracking-[-0.03em] transition-colors group-hover:text-accent">
                {nextProject.title}
              </h2>
              <span
                aria-hidden="true"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-ink/25 text-lg transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-paper"
              >
                →
              </span>
            </Container>
          </Link>
        </section>
      ) : null}
    </article>
  );
}

function StorySection({
  index,
  label,
  children,
}: {
  index: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line">
      <Container className="grid gap-8 py-14 md:grid-cols-[220px_1fr] md:gap-14 md:py-20">
        <div className="md:sticky md:top-24 md:self-start">
          <p className="section-index">{padIndex(Number(index))}</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">{label}</h2>
        </div>
        <Reveal className="min-w-0">{children}</Reveal>
      </Container>
    </section>
  );
}
