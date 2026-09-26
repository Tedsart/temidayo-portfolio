"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Media frame + image.
 *
 * The frame owns the aspect ratio and the "nothing uploaded yet" state, so a
 * project with no media still looks deliberate rather than broken. `next/image`
 * handles optimisation, responsive sources and lazy loading for everything the
 * CMS has actually uploaded.
 */

export type Aspect = "3/2" | "16/10" | "4/3" | "1/1" | "16/9" | "2/3";

const ASPECT: Record<Aspect, string> = {
  "3/2": "aspect-[3/2]",
  "16/10": "aspect-[16/10]",
  "4/3": "aspect-[4/3]",
  "1/1": "aspect-square",
  "16/9": "aspect-video",
  "2/3": "aspect-[2/3]",
};

export function MediaFallback({
  label = "Image not uploaded yet",
  compact = false,
}: {
  label?: string;
  compact?: boolean;
}) {
  return (
    <div
      className="grid-paper flex h-full w-full flex-col items-center justify-center gap-3 bg-paper-2 text-center"
      aria-hidden="true"
    >
      <svg
        width={compact ? 28 : 44}
        height={compact ? 20 : 30}
        viewBox="0 0 44 30"
        fill="none"
        className="text-line-strong"
      >
        <path d="M1 29h42" stroke="currentColor" strokeWidth="1" />
        <rect x="5" y="16" width="5" height="13" fill="currentColor" opacity="0.5" />
        <rect x="14" y="10" width="5" height="19" fill="currentColor" opacity="0.65" />
        <rect x="23" y="19" width="5" height="10" fill="currentColor" opacity="0.5" />
        <rect x="32" y="5" width="5" height="24" fill="currentColor" opacity="0.8" />
      </svg>
      {!compact && <p className="label-meta px-4">{label}</p>}
    </div>
  );
}

interface AssetImageProps {
  src?: string | null;
  alt: string;
  aspect?: Aspect;
  sizes: string;
  priority?: boolean;
  className?: string;
  fallbackLabel?: string;
  /** Rendered in the corner when the asset is a placeholder from fallback mode. */
  badge?: string;
}

export function AssetImage({
  src,
  alt,
  aspect = "3/2",
  sizes,
  priority = false,
  className = "",
  fallbackLabel,
  badge,
}: AssetImageProps) {
  const [state, setState] = useState<"loading" | "ready" | "error">(src ? "loading" : "error");

  return (
    <div className={`relative isolate overflow-hidden bg-paper-2 ${ASPECT[aspect]} ${className}`}>
      <div className="absolute inset-0 -z-10">
        <MediaFallback label={fallbackLabel} compact={aspect === "1/1"} />
      </div>

      {src && state !== "error" ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setState("ready")}
          onError={() => setState("error")}
          className="object-cover transition-opacity duration-500"
          style={{ opacity: state === "ready" ? 1 : 0 }}
        />
      ) : null}

      {badge ? (
        <span className="absolute left-3 top-3 z-10 bg-paper px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          {badge}
        </span>
      ) : null}
    </div>
  );
}

/** A figure with caption — used for dashboards and report pages. */
export function CaptionedFigure({
  children,
  caption,
  index,
}: {
  children: React.ReactNode;
  caption?: string | null;
  index?: string;
}) {
  if (!caption) return <>{children}</>;

  return (
    <figure>
      {children}
      <figcaption className="mt-3 flex items-baseline gap-3 border-t border-line pt-2">
        {index ? <span className="section-index">{index}</span> : null}
        <span className="text-sm leading-relaxed text-muted">{caption}</span>
      </figcaption>
    </figure>
  );
}
