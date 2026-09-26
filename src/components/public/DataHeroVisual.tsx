"use client";

import { CountUp } from "@/components/motion/CountUp";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

/**
 * The signature visual: data → insight.
 *
 * A scatter of raw observations sits on a quiet coordinate grid. A fitted line
 * draws itself through them, and one observation becomes the labelled insight.
 * It loops slowly, sits behind no text, and disappears to a static frame when
 * the visitor prefers reduced motion.
 */

interface Observation {
  id: number;
  x: number;
  y: number;
  onTrend: boolean;
}

const W = 720;
const H = 520;
const PAD = { top: 40, right: 48, bottom: 64, left: 64 };

/** Deterministic pseudo-random so server and client render identical markup. */
function makeObservations(): Observation[] {
  let seed = 20260926;
  const random = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };

  const points: Observation[] = [];
  for (let i = 0; i < 34; i += 1) {
    const t = i / 33;
    const x = PAD.left + t * (W - PAD.left - PAD.right);
    const rise = t * (H - PAD.top - PAD.bottom) * 0.62;
    const noise = (random() - 0.5) * 120;
    points.push({
      id: i,
      x,
      y: H - PAD.bottom - rise + noise,
      onTrend: false,
    });
  }
  return points;
}

const OBSERVATIONS = makeObservations();
const TREND = { x1: PAD.left, y1: H - PAD.bottom - 12, x2: W - PAD.right, y2: PAD.top + 46 };

const gridX = [0, 0.25, 0.5, 0.75, 1].map(
  (t) => PAD.left + t * (W - PAD.left - PAD.right),
);
const gridY = [0, 0.25, 0.5, 0.75, 1].map(
  (t) => PAD.top + t * (H - PAD.top - PAD.bottom),
);

const INSIGHT = OBSERVATIONS[24];

export function DataHeroVisual() {
  const reduced = useReducedMotion();
  const [cycle, setCycle] = useState(0);

  // Slow, quiet loop. Paused entirely for reduced-motion visitors.
  useEffect(() => {
    if (reduced) return;
    const timer = setInterval(() => setCycle((c) => c + 1), 9000);
    return () => clearInterval(timer);
  }, [reduced]);

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Abstract chart: scattered observations with a fitted trend line drawn through them."
        className="h-auto w-full"
      >
        <defs>
          <linearGradient id="panelFade" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#151714" />
            <stop offset="100%" stopColor="#0d0e0c" />
          </linearGradient>
          <linearGradient id="areaFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1b45f5" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#1b45f5" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width={W} height={H} fill="url(#panelFade)" rx="2" />

        {/* coordinate grid */}
        <g stroke="#ffffff" strokeOpacity="0.07" strokeWidth="1">
          {gridX.map((x) => (
            <line key={`x-${x}`} x1={x} y1={PAD.top - 8} x2={x} y2={H - PAD.bottom} />
          ))}
          {gridY.map((y) => (
            <line key={`y-${y}`} x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} />
          ))}
        </g>

        {/* axes */}
        <g stroke="#ffffff" strokeOpacity="0.28" strokeWidth="1">
          <line x1={PAD.left} y1={H - PAD.bottom} x2={W - PAD.right} y2={H - PAD.bottom} />
          <line x1={PAD.left} y1={PAD.top - 8} x2={PAD.left} y2={H - PAD.bottom} />
        </g>

        {/* axis ticks */}
        <g fill="#ffffff" fillOpacity="0.32" fontSize="11" fontFamily="var(--font-geist-mono), monospace">
          {[0, 25, 50, 75, 100].map((label, i) => (
            <text key={label} x={gridX[i]} y={H - PAD.bottom + 24} textAnchor="middle">
              {label}
            </text>
          ))}
          {[0, 25, 50, 75, 100].map((label, i) => (
            <text key={`y-${label}`} x={PAD.left - 14} y={gridY[4 - i] + 4} textAnchor="end">
              {label}
            </text>
          ))}
          <text x={W - PAD.right} y={H - 20} textAnchor="end" fillOpacity="0.42">
            OBSERVATION
          </text>
          <text x={PAD.left - 44} y={PAD.top - 20} fillOpacity="0.42">
            VALUE
          </text>
        </g>

        {/* raw observations */}
        <g>
          {OBSERVATIONS.map((point, i) => (
            <motion.circle
              key={`${point.id}-${cycle}`}
              cx={point.x}
              cy={point.y}
              r={point.id === INSIGHT.id ? 4.5 : 3}
              fill={point.id === INSIGHT.id ? "#1b45f5" : "#f6f3ec"}
              fillOpacity={point.id === INSIGHT.id ? 1 : 0.5}
              initial={reduced ? false : { opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: reduced ? 0 : 0.5,
                delay: reduced ? 0 : 0.02 * i,
                ease: [0.22, 0.61, 0.36, 1],
              }}
            />
          ))}
        </g>

        {/* fitted line — a path so the draw-on animation works everywhere */}
        <motion.path
          key={`trend-${cycle}`}
          d={`M ${TREND.x1} ${TREND.y1} L ${TREND.x2} ${TREND.y2}`}
          stroke="#1b45f5"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          initial={reduced ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: reduced ? 0 : 1.4, delay: reduced ? 0 : 0.9, ease: [0.22, 0.61, 0.36, 1] }}
        />

        {/* insight marker */}
        <motion.g
          key={`insight-${cycle}`}
          initial={reduced ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : 2.1 }}
        >
          <line
            x1={INSIGHT.x}
            y1={INSIGHT.y}
            x2={INSIGHT.x}
            y2={INSIGHT.y - 54}
            stroke="#f6f3ec"
            strokeOpacity="0.3"
            strokeWidth="1"
          />
          <circle cx={INSIGHT.x} cy={INSIGHT.y} r="11" fill="none" stroke="#1b45f5" strokeWidth="1" />
          <rect
            x={INSIGHT.x - 62}
            y={INSIGHT.y - 88}
            width="124"
            height="30"
            fill="#f6f3ec"
            rx="2"
          />
          <text
            x={INSIGHT.x}
            y={INSIGHT.y - 68}
            textAnchor="middle"
            fontSize="11"
            letterSpacing="0.14em"
            fill="#10110f"
            fontFamily="var(--font-geist-mono), monospace"
          >
            THE PATTERN
          </text>
        </motion.g>

        {/* sonar pulse on the insight — quiet liveness between cycles */}
        {!reduced ? (
          <motion.circle
            cx={INSIGHT.x}
            cy={INSIGHT.y}
            fill="none"
            stroke="#1b45f5"
            strokeWidth="1.5"
            initial={{ r: 6, opacity: 0.8 }}
            animate={{ r: 26, opacity: 0 }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "easeOut",
              delay: 2.8,
            }}
          />
        ) : null}
      </svg>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
        <p className="label-meta">Fig. 01 — Data → Insight</p>
        <p className="label-meta text-faint">
          <CountUp value="34 observations · 1 fitted line" />
        </p>
      </div>
    </div>
  );
}
