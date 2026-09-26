"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

/**
 * Scroll reveal used across the public site.
 *
 * One component, one easing curve, one distance — so motion reads as a single
 * system rather than a pile of effects. Everything collapses to a fade when the
 * visitor prefers reduced motion.
 */

export function usePrefersReducedMotion(): boolean {
  return useReducedMotion() ?? false;
}

interface RevealProps {
  children: ReactNode;
  /** Stagger index, used to offset the delay slightly. */
  index?: number;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "header" | "span";
}

export function Reveal({
  children,
  index = 0,
  delay = 0,
  y = 16,
  className,
  as = "div",
}: RevealProps) {
  const reduced = usePrefersReducedMotion();
  const MotionTag = motion[as];

  const hidden: Variants["hidden"] = { opacity: 0, y: reduced ? 0 : y };
  const shown: Variants["visible"] = {
    opacity: 1,
    y: 0,
    transition: {
      duration: reduced ? 0.01 : 0.6,
      delay: reduced ? 0 : delay + index * 0.06,
      ease: [0.22, 0.61, 0.36, 1],
    },
  };

  return (
    <MotionTag
      className={className}
      initial={hidden}
      whileInView={shown}
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </MotionTag>
  );
}

/** Line-mask reveal for large display type. */
export function DisplayReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = usePrefersReducedMotion();

  return (
    <span className={`block overflow-hidden ${className ?? ""}`}>
      <motion.span
        className="block will-change-transform"
        initial={{ y: reduced ? 0 : "105%" }}
        animate={{ y: 0 }}
        transition={{
          duration: reduced ? 0.01 : 0.9,
          delay: reduced ? 0 : delay,
          ease: [0.22, 0.61, 0.36, 1],
        }}
      >
        {children}
      </motion.span>
    </span>
  );
}
