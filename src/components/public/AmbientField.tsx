"use client";

import { useReducedMotion } from "motion/react";

/**
 * Quiet constellation of data glyphs drifting behind the hero — the paper is
 * never plain. Deterministic positions (server/client identical), CSS-driven
 * drift, frozen for prefers-reduced-motion.
 */
const GLYPHS = ["+", "·", "×", "▪", "+", "·", "×", "·", "+", "▪", "·", "+"] as const;

const SPOTS = [
  { top: "12%", left: "4%", size: 14, dur: 11, delay: 0 },
  { top: "22%", left: "46%", size: 10, dur: 13, delay: 1.2 },
  { top: "8%", left: "70%", size: 12, dur: 10, delay: 0.6 },
  { top: "38%", left: "88%", size: 9, dur: 12, delay: 2 },
  { top: "56%", left: "10%", size: 11, dur: 14, delay: 0.9 },
  { top: "64%", left: "52%", size: 8, dur: 11, delay: 1.6 },
  { top: "74%", left: "30%", size: 12, dur: 13, delay: 0.3 },
  { top: "82%", left: "78%", size: 10, dur: 12, delay: 2.4 },
  { top: "46%", left: "36%", size: 9, dur: 15, delay: 1.1 },
  { top: "16%", left: "26%", size: 8, dur: 12, delay: 2.8 },
  { top: "68%", left: "92%", size: 11, dur: 14, delay: 0.5 },
  { top: "90%", left: "48%", size: 9, dur: 11, delay: 1.9 },
];

export function AmbientField() {
  const reduced = useReducedMotion();

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {SPOTS.map((spot, i) => (
        <span
          key={i}
          className={reduced ? "absolute font-mono text-accent/25" : "absolute font-mono text-accent/25 glyph-drift"}
          style={{
            top: spot.top,
            left: spot.left,
            fontSize: spot.size,
            animationDuration: `${spot.dur}s`,
            animationDelay: `${spot.delay}s`,
          }}
        >
          {GLYPHS[i % GLYPHS.length]}
        </span>
      ))}
    </div>
  );
}
