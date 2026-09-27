import Link from "next/link";
import { DisplayReveal } from "@/components/motion/Reveal";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { ProjectStatus } from "@/lib/types";

/**
 * UI primitives. Everything visual on both the public site and the CMS is
 * assembled from these, which is what keeps the identity consistent.
 */

export function Container({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "main" | "article" | "footer" | "header";
}) {
  return (
    <Tag className={`mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12 ${className}`}>
      {children}
    </Tag>
  );
}

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50";

const BUTTON_VARIANTS = {
  primary:
    "bg-ink text-paper px-6 py-3 text-sm tracking-tight hover:bg-accent active:scale-[0.99]",
  accent:
    "bg-accent text-white px-6 py-3 text-sm tracking-tight hover:bg-accent-hover active:scale-[0.99]",
  outline:
    "border border-ink/25 text-ink px-6 py-3 text-sm tracking-tight hover:border-ink hover:bg-ink/[0.04]",
  ghost: "text-ink px-3 py-2 text-sm hover:text-accent",
  danger:
    "border border-danger/40 text-danger px-4 py-2 text-sm hover:bg-danger hover:text-paper",
  quiet:
    "border border-line bg-paper text-ink px-4 py-2 text-sm hover:border-ink/40 hover:bg-paper-2",
} as const;

export type ButtonVariant = keyof typeof BUTTON_VARIANTS;

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
};

export function Button({
  variant = "primary",
  fullWidth = false,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    />
  );
}

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: ButtonVariant;
  external?: boolean;
  fullWidth?: boolean;
};

export function ButtonLink({
  variant = "primary",
  external = false,
  fullWidth = false,
  className = "",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      {...(external
        ? { target: "_blank", rel: "noreferrer noopener" }
        : {})}
      className={`${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    />
  );
}

/** Small uppercase metadata label, e.g. "DATA ANALYST · DATA VISUALIZATION". */
export function MetaLabel({
  children,
  className = "",
  as: Tag = "p",
}: {
  children: ReactNode;
  className?: string;
  as?: "p" | "span" | "div";
}) {
  return <Tag className={`label-meta ${className}`}>{children}</Tag>;
}

/** `01 — SELECTED WORK` */
export function SectionHeading({
  index,
  title,
  description,
  align = "left",
  className = "",
}: {
  index?: string;
  title: string;
  description?: string;
  align?: "left" | "between";
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col gap-6 border-t border-ink pt-6 md:flex-row md:items-end md:justify-between ${
        align === "between" ? "md:gap-16" : ""
      } ${className}`}
    >
      <div className="max-w-2xl">
        {index ? <p className="section-index mb-3">{index}</p> : null}
        <h2 className="text-[clamp(2rem,4.5vw,3.25rem)] font-semibold leading-[1.05]">
          <DisplayReveal>{title}</DisplayReveal>
        </h2>
        {description ? (
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted md:text-lg">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function Tag({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "accent" | "inverse" }) {
  const tones = {
    default: "border-line text-muted",
    accent: "border-accent/30 bg-accent-soft text-accent",
    inverse: "border-paper/25 text-paper/80",
  } as const;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

const STATUS_STYLES: Record<ProjectStatus, { label: string; className: string; dot: string }> = {
  published: { label: "Published", className: "border-positive/30 text-positive", dot: "bg-positive" },
  draft: { label: "Draft", className: "border-warning/30 text-warning", dot: "bg-warning" },
  archived: { label: "Archived", className: "border-line-strong text-muted", dot: "bg-faint" },
};

/** Status is never communicated by colour alone: every badge carries text. */
export function StatusBadge({ status }: { status: ProjectStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${style.className}`}
    >
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-paper-3/70 ${className}`} aria-hidden="true" />;
}

export function Spinner({ label = "Working" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2" role="status">
      <svg width="14" height="14" viewBox="0 0 14 14" className="animate-spin" aria-hidden="true">
        <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
        <path d="M13 7a6 6 0 0 0-6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function FieldNote({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 text-xs leading-relaxed text-muted">{children}</p>;
}

export function ErrorMessage({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="mt-2 border-l-2 border-danger bg-danger/[0.06] px-3 py-2 text-sm text-danger"
    >
      {children}
    </p>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid-paper border border-line px-6 py-16 text-center">
      <p className="section-index mb-3">NO DATA</p>
      <h3 className="text-xl font-semibold">{title}</h3>
      {description ? (
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
