"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";
import { processStages } from "@/lib/config";

/**
 * How I Think — Understand → Explore → Analyze → Visualize → Communicate.
 *
 * A single vertical rule fills as the reader scrolls through the stages. It is
 * a reading device, not a corporate process diagram: no boxes, no arrows, no
 * icons. Reduced-motion visitors get the finished rule and no tracking.
 */
export function ProcessTimeline() {
  const ref = useRef<HTMLOListElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 70%", "end 60%"],
  });

  const progress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.001,
  });

  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="absolute left-[13px] top-2 bottom-2 w-px bg-line md:left-[15px]"
      />
      <motion.span
        aria-hidden="true"
        className="absolute left-[13px] top-2 w-px origin-top bg-accent md:left-[15px]"
        style={{
          height: "calc(100% - 1rem)",
          scaleY: reduced ? 1 : progress,
        }}
      />

      <ol ref={ref} className="relative space-y-10 md:space-y-14">
        {processStages.map((stage, i) => (
          <motion.li
            key={stage.id}
            className="grid gap-4 pl-10 md:grid-cols-[140px_1fr] md:gap-10 md:pl-14"
            initial={reduced ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-90px" }}
            transition={{
              duration: reduced ? 0.01 : 0.6,
              delay: reduced ? 0 : i * 0.05,
              ease: [0.22, 0.61, 0.36, 1],
            }}
          >
            <span
              aria-hidden="true"
              className="absolute left-0 mt-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full border border-line bg-paper font-mono text-[10px] tracking-[0.08em] text-muted md:h-8 md:w-8"
            >
              {stage.index}
            </span>

            <h3 className="text-xl font-semibold tracking-tight md:text-2xl">
              {stage.title}
            </h3>
            <p className="max-w-xl text-base leading-relaxed text-muted md:text-lg md:leading-relaxed">
              {stage.body}
            </p>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
