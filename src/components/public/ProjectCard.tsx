import Link from "next/link";
import { AssetImage } from "@/components/public/AssetImage";
import { Reveal } from "@/components/motion/Reveal";
import { MetaLabel } from "@/components/ui/primitives";
import { formatProjectDate } from "@/lib/utils";
import type { ProjectSummary } from "@/lib/types";

/**
 * Large editorial project presentation — deliberately not a card grid.
 * Each project gets a full-width row with room for the work itself.
 */

export function ProjectCard({
  project,
  index,
  variant = "standard",
  usingFallback = false,
}: {
  project: ProjectSummary;
  index: number;
  variant?: "standard" | "reversed" | "lead";
  usingFallback?: boolean;
}) {
  const number = String(index).padStart(2, "0");
  const tools = project.tools.slice(0, 4);

  return (
    <Reveal as="article" className="border-t border-ink py-10 md:py-14">
      <div
        className={`grid items-center gap-8 lg:gap-14 ${
          variant === "lead"
            ? "lg:grid-cols-[1.25fr_1fr]"
            : "lg:grid-cols-[1fr_1.25fr]"
        }`}
      >
        <Link
          href={`/work/${project.slug}`}
          className={`group/media relative block overflow-hidden bg-paper-2 ${
            variant === "reversed" ? "lg:order-2" : ""
          }`}
          aria-label={`Open case study: ${project.title}`}
          tabIndex={-1}
        >
          <AssetImage
            src={project.thumbnail?.public_url}
            alt={project.thumbnail?.alt_text || `${project.title} — project thumbnail`}
            aspect={variant === "lead" ? "16/10" : "4/3"}
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="transition-transform duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover/media:scale-[1.03]"
            badge={usingFallback ? "Sample media" : undefined}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 border border-ink/10 transition-colors duration-300 group-hover/media:border-ink/30"
          />
        </Link>

        <div className={variant === "reversed" ? "lg:order-1" : ""}>
          <div className="flex items-baseline gap-4">
            <span className="section-index">{number}</span>
            <span className="h-px flex-1 bg-line" aria-hidden="true" />
            {project.featured ? (
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                Featured
              </span>
            ) : null}
          </div>

          <h3 className="mt-5 text-[clamp(1.6rem,3.4vw,2.5rem)] font-semibold leading-[1.05] tracking-[-0.035em]">
            <Link
              href={`/work/${project.slug}`}
              className="transition-colors hover:text-accent"
            >
              {project.title}
            </Link>
          </h3>

          {project.subtitle ? (
            <p className="mt-3 text-lg text-ink-2">{project.subtitle}</p>
          ) : null}

          {project.short_description ? (
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
              {project.short_description}
            </p>
          ) : null}

          <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-5 sm:grid-cols-3">
            <div>
              <dt className="label-meta">Category</dt>
              <dd className="mt-1.5 text-sm text-ink-2">{project.category || "—"}</dd>
            </div>
            <div>
              <dt className="label-meta">Date</dt>
              <dd className="mt-1.5 text-sm text-ink-2">
                {formatProjectDate(project.project_date)}
              </dd>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <dt className="label-meta">Tools</dt>
              <dd className="mt-1.5 text-sm text-ink-2">{tools.length ? tools.join(" · ") : "—"}</dd>
            </div>
          </dl>

          <Link
            href={`/work/${project.slug}`}
            className="group/link mt-7 inline-flex items-center gap-3 text-sm font-medium"
          >
            <span className="relative">
              View case study
              <span
                aria-hidden="true"
                className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-100 bg-ink transition-transform duration-300 group-hover/link:scale-x-0"
              />
            </span>
            <span
              aria-hidden="true"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-ink/25 transition-all duration-300 group-hover/link:border-accent group-hover/link:bg-accent group-hover/link:text-paper"
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </Reveal>
  );
}

export function ProjectList({
  projects,
  usingFallback = false,
  lead = true,
}: {
  projects: ProjectSummary[];
  usingFallback?: boolean;
  lead?: boolean;
}) {
  return (
    <div>
      {projects.map((project, i) => (
        <ProjectCard
          key={project.id}
          project={project}
          index={i + 1}
          variant={lead && i === 0 ? "lead" : i % 2 === 0 ? "standard" : "reversed"}
          usingFallback={usingFallback}
        />
      ))}
    </div>
  );
}

export function ProjectListItem({
  project,
  index,
  usingFallback = false,
}: {
  project: ProjectSummary;
  index: number;
  usingFallback?: boolean;
}) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group grid gap-5 border-t border-line py-8 transition-colors hover:bg-paper-2/60 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-8 sm:px-2"
    >
      <span className="section-index">{String(index).padStart(2, "0")}</span>
      <span className="flex items-center gap-5">
        <AssetImage
          src={project.thumbnail?.public_url}
          alt=""
          aspect="1/1"
          sizes="72px"
          className="hidden h-16 w-16 shrink-0 sm:block"
          badge={undefined}
          fallbackLabel="No image"
        />
        <span>
          <span className="block text-xl font-semibold tracking-tight transition-colors group-hover:text-accent">
            {project.title}
          </span>
          {project.short_description ? (
            <MetaLabel className="mt-2 block max-w-xl normal-case tracking-normal text-muted">
              {project.short_description.slice(0, 110)}
              {project.short_description.length > 110 ? "…" : ""}
            </MetaLabel>
          ) : null}
        </span>
      </span>
      <span className="flex items-center gap-4 sm:justify-end">
        <MetaLabel>{project.category || "—"}</MetaLabel>
        <span
          aria-hidden="true"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-paper"
        >
          →
        </span>
      </span>
      {usingFallback ? <span className="sr-only">Sample content</span> : null}
    </Link>
  );
}
