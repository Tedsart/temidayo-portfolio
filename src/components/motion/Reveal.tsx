"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";

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

/** Word-by-word masked rise for display headlines — text that moves. */
export function WordReveal({
  text,
  delay = 0,
  className = "",
}: {
  text: string;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const words = text.split(" ");

  return (
    <span className={className} aria-label={text} role="text">
      {words.map((word, i) => (
        <span key={i} aria-hidden="true">
          <span className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom">
            <motion.span
              className="inline-block will-change-transform"
              initial={reduced ? false : { y: "110%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: reduced ? 0 : 0.7,
                delay: reduced ? 0 : delay + i * 0.07,
                ease: [0.22, 0.61, 0.36, 1],
              }}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}

const GLYPHS = "▚▞▟□◧◨01·+×";

/** Decode/scramble-in for monospace metadata lines. */
export function ScrambleText({
  text,
  delay = 0,
  className = "",
}: {
  text: string;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [output, setOutput] = useState(reduced ? text : "");

  useEffect(() => {
    if (reduced) return;
    let frame = 0;
    const startAt = performance.now() + delay * 1000;
    const tick = (now: number) => {
      if (now < startAt) {
        frame = requestAnimationFrame(tick);
        return;
      }
      const progress = Math.min(1, (now - startAt) / 900);
      const solved = Math.floor(progress * text.length);
      let next = text.slice(0, solved);
      for (let i = solved; i < text.length; i++) {
        const ch = text[i];
        next += ch === " " ? " " : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setOutput(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [text, delay, reduced]);

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden="true">{output || "\u00A0"}</span>
    </span>
  );
}

/** A word that rises late while a highlighter sweeps in beneath it. */
export function MarkerWord({
  word,
  delay = 0.42,
}: {
  word: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <span className="relative inline-block">
      <span className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom">
        <motion.span
          className="relative z-10 inline-block will-change-transform"
          initial={reduced ? false : { y: "110%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: reduced ? 0 : 0.7,
            delay: reduced ? 0 : delay,
            ease: [0.22, 0.61, 0.36, 1],
          }}
        >
          {word}
        </motion.span>
      </span>
      <motion.span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-[0.12em] z-0 h-[0.14em] origin-left bg-marker/80"
        initial={reduced ? false : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{
          duration: reduced ? 0 : 0.6,
          delay: reduced ? 0 : delay + 0.4,
          ease: [0.22, 0.61, 0.36, 1],
        }}
      />
    </span>
  );
}
