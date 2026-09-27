"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { padIndex } from "@/lib/utils";
import type { ProjectAsset } from "@/lib/types";

/**
 * Visual report — an actual publication you page through.
 *
 * Keyboard: arrow keys on the focused region. Touch: horizontal swipe. Mouse:
 * previous/next controls. The counter always shows position (01 / 05).
 */
export function ReportCarousel({ pages }: { pages: ProjectAsset[] }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const reduced = useReducedMotion();
  const count = pages.length;

  const go = useCallback(
    (next: number, dir: number) => {
      setDirection(dir);
      setIndex(Math.min(count - 1, Math.max(0, next)));
    },
    [count],
  );

  // Derived, not synced in an effect: if pages shrink, clamp on render.
  const safeIndex = Math.min(index, Math.max(0, count - 1));

  const prev = useCallback(() => go(safeIndex - 1, -1), [go, safeIndex]);
  const next = useCallback(() => go(safeIndex + 1, 1), [go, safeIndex]);

  const page = pages[safeIndex];

  if (!page) return null;

  return (
    <div>
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Visual report pages"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            prev();
          } else if (event.key === "ArrowRight") {
            event.preventDefault();
            next();
          } else if (event.key === "Home") {
            event.preventDefault();
            go(0, -1);
          } else if (event.key === "End") {
            event.preventDefault();
            go(count - 1, 1);
          }
        }}
        onTouchStart={(event) => {
          const t = event.touches[0];
          touch.current = { x: t.clientX, y: t.clientY };
        }}
        onTouchEnd={(event) => {
          const start = touch.current;
          touch.current = null;
          if (!start) return;
          const t = event.changedTouches[0];
          const dx = t.clientX - start.x;
          const dy = t.clientY - start.y;
          if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) {
            if (dx < 0) next();
            else prev();
          }
        }}
        className="group relative overflow-hidden border border-line bg-paper-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        <div className="relative h-[380px] w-full sm:h-[460px] lg:h-[540px]">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={page.id}
              className="absolute inset-0"
              initial={reduced ? false : { opacity: 0, x: direction * 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? undefined : { opacity: 0, x: direction * -6 }}
              transition={{ duration: reduced ? 0 : 0.35, ease: [0.22, 0.61, 0.36, 1] }}
            >
              {page.public_url ? (
                <Image
                  src={page.public_url}
                  alt={page.alt_text || `Visual report page ${padIndex(safeIndex + 1)}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 1100px"
                  className="object-contain"
                />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-paper-2 via-paper-2/80 to-transparent p-4 sm:p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-2">
            {page.caption || page.alt_text || `Page ${padIndex(index + 1)}`}
          </p>
          <p
            className="font-mono text-[11px] tracking-[0.2em] text-ink-2"
            aria-live="polite"
            aria-atomic="true"
          >
            {padIndex(safeIndex + 1)} / {padIndex(count)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 border-t border-line pt-4">
        <button
          type="button"
          onClick={prev}
          disabled={safeIndex === 0}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/25 text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-ink"
          aria-label="Previous report page"
        >
          ←
        </button>

        <div className="flex items-center gap-2" aria-hidden="true">
          {pages.map((p, i) => (
            <span
              key={p.id}
              className={`h-1 transition-all duration-300 ${
                i === safeIndex ? "w-8 bg-accent" : "w-3 bg-line-strong"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={next}
          disabled={safeIndex === count - 1}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/25 text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-ink"
          aria-label="Next report page"
        >
          →
        </button>
      </div>
    </div>
  );
}
