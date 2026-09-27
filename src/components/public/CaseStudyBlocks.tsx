import Image from "next/image";
import { CaptionedFigure, MediaFallback } from "@/components/public/AssetImage";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import { approachPipeline } from "@/lib/config";
import { LINK_TYPE_LABELS, type ProjectAsset, type ProjectFinding, type ProjectLink } from "@/lib/types";
import { padIndex } from "@/lib/utils";

/** Dashboard screenshots — large, readable, editorial. */
export function DashboardGallery({ shots }: { shots: ProjectAsset[] }) {
  if (!shots.length) return null;

  return (
    <div className="grid gap-10 md:gap-14">
      {shots.map((shot, i) => (
        <Reveal key={shot.id} as="div">
          <CaptionedFigure caption={shot.caption} index={padIndex(i + 1)}>
            <div className="relative overflow-hidden border border-line bg-paper-inverse">
              <div className="relative aspect-[16/10] w-full">
                {shot.public_url ? (
                  <Image
                    src={shot.public_url}
                    alt={shot.alt_text || `Dashboard screenshot ${padIndex(i + 1)}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 1100px"
                    loading="lazy"
                    className="object-contain"
                  />
                ) : (
                  <MediaFallback label="Screenshot not uploaded yet" />
                )}
              </div>
            </div>
          </CaptionedFigure>
        </Reveal>
      ))}
    </div>
  );
}

/** Large visual findings — the numbers get display treatment. */
export function FindingGrid({ findings }: { findings: ProjectFinding[] }) {
  if (!findings.length) return null;

  return (
    <div className="grid gap-px border border-line bg-line md:grid-cols-3">
      {findings.map((finding, i) => (
        <Reveal
          key={finding.id}
          as="div"
          index={i}
          className="bg-paper p-7 md:p-9"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
            Finding {padIndex(i + 1)}
          </p>
          <p className="mt-5 text-[clamp(2.25rem,4.5vw,3.5rem)] font-semibold leading-none tracking-[-0.02em] text-ink">
            <span className="relative inline-block">
              <CountUp value={finding.headline} />
              <span
                aria-hidden="true"
                className="absolute inset-x-0 -bottom-1 h-[0.09em] bg-marker/70"
              />
            </span>
          </p>
          <h3 className="mt-4 text-base font-semibold leading-snug">{finding.title}</h3>
          {finding.explanation ? (
            <p className="mt-3 text-sm leading-relaxed text-muted">{finding.explanation}</p>
          ) : null}
          {finding.supporting_text ? (
            <p className="mt-4 border-t border-line pt-3 text-xs leading-relaxed text-faint">
              {finding.supporting_text}
            </p>
          ) : null}
        </Reveal>
      ))}
    </div>
  );
}

const DOC_KIND_STYLES: Record<string, string> = {
  pdf: "bg-danger/[0.08] text-danger",
  csv: "bg-positive/[0.1] text-positive",
  xlsx: "bg-positive/[0.1] text-positive",
  pptx: "bg-warning/[0.12] text-warning",
};

export function DocKindBadge({ fileName }: { fileName: string }) {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "file";
  const className = DOC_KIND_STYLES[ext] ?? "bg-paper-3 text-ink-2";
  return (
    <span
      className={`inline-flex min-w-12 items-center justify-center border border-transparent px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${className}`}
    >
      {ext}
    </span>
  );
}

/** External links — never hard-coded. */
export function ExternalLinks({
  links,
  variant = "inline",
}: {
  links: ProjectLink[];
  variant?: "inline" | "block";
}) {
  if (!links.length) return null;

  const render = (link: ProjectLink) => (
    <a
      key={link.id}
      href={link.url}
      target="_blank"
      rel="noreferrer noopener"
      className={
        variant === "block"
          ? "group flex items-center justify-between gap-4 border border-line bg-paper px-5 py-4 transition-colors hover:border-accent"
          : "group inline-flex items-center gap-3 border border-ink/25 px-5 py-3 text-sm transition-colors hover:border-accent hover:text-accent"
      }
    >
      <span className="flex items-baseline gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint group-hover:text-accent">
          {LINK_TYPE_LABELS[link.link_type]}
        </span>
        <span className="font-medium">{link.label}</span>
      </span>
      <span aria-hidden="true" className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent">
        ↗
      </span>
    </a>
  );

  return variant === "block" ? (
    <div className="grid gap-3 sm:grid-cols-2">{links.map(render)}</div>
  ) : (
    <div className="flex flex-wrap gap-3">{links.map(render)}</div>
  );
}

/** Source → Clean → Analyze → Visualize → Communicate. */
export function ApproachPipeline() {
  return (
    <ol className="flex flex-wrap items-center gap-y-3" aria-label="Analysis pipeline">
      {approachPipeline.map((stage, i) => (
        <li key={stage} className="flex items-center">
          <span
            className={`flex items-center gap-2 border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] ${
              i === 0
                ? "border-ink bg-ink text-paper"
                : "border-line bg-paper text-ink-2"
            }`}
          >
            {stage}
          </span>
          {i < approachPipeline.length - 1 ? (
            <span aria-hidden="true" className="px-2 text-faint sm:px-3">
              →
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
