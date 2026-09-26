"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
 * The signature hero panel: a living "analyst's deck" that cycles through four
 * animated figures — scatter & fit, distribution bars, momentum area and a
 * composition ring. Auto-advances, pauses on hover/focus, is fully keyboard
 * operable via the figure dots, and collapses to a static frame for
 * prefers-reduced-motion visitors.
 */

const W = 720;
const H = 520;
const PAD = { top: 48, right: 48, bottom: 64, left: 64 };
const IW = W - PAD.left - PAD.right;
const IH = H - PAD.top - PAD.bottom;

const EASE = [0.22, 0.61, 0.36, 1] as const;

/* Deterministic data so server and client render identical markup. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

const rand = seeded(20260926);
const SCATTER = Array.from({ length: 30 }, (_, i) => {
  const t = i / 29;
  return {
    x: PAD.left + t * IW,
    y: H - PAD.bottom - t * IH * 0.62 + (rand() - 0.5) * 110,
  };
});
const BARS = [42, 58, 51, 66, 74, 69, 88, 96, 90, 108, 121, 134];
const AREA = [10, 14, 12, 20, 26, 24, 34, 41, 39, 52, 61, 58, 72, 84];
const DONUT = [
  { value: 0.42, label: "Cleaning" },
  { value: 0.27, label: "Analysis" },
  { value: 0.19, label: "Visuals" },
  { value: 0.12, label: "Writing" },
];

const FIGS = [
  { id: "scatter", label: "FIG. 01 — SCATTER & FIT", note: "30 observations · 1 fitted line" },
  { id: "bars", label: "FIG. 02 — DISTRIBUTION", note: "12 periods · indexed" },
  { id: "area", label: "FIG. 03 — MOMENTUM", note: "cumulative change · 14 waves" },
  { id: "donut", label: "FIG. 04 — COMPOSITION", note: "where the hours actually go" },
] as const;

function Frame({ children }: { children: React.ReactNode }) {
  const gridX = [0, 0.25, 0.5, 0.75, 1].map((t) => PAD.left + t * IW);
  const gridY = [0, 0.25, 0.5, 0.75, 1].map((t) => PAD.top + t * IH);
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Animated data figures: a scatter with fitted line, a bar distribution, a momentum area and a composition ring."
      className="h-auto w-full"
    >
      <g stroke="#f6f3ec" strokeOpacity="0.07" strokeWidth="1">
        {gridX.map((x) => (
          <line key={`x${x}`} x1={x} y1={PAD.top - 8} x2={x} y2={H - PAD.bottom} />
        ))}
        {gridY.map((y) => (
          <line key={`y${y}`} x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} />
        ))}
      </g>
      <g stroke="#f6f3ec" strokeOpacity="0.26" strokeWidth="1">
        <line x1={PAD.left} y1={H - PAD.bottom} x2={W - PAD.right} y2={H - PAD.bottom} />
        <line x1={PAD.left} y1={PAD.top - 8} x2={PAD.left} y2={H - PAD.bottom} />
      </g>
      {children}
    </svg>
  );
}

function ScatterFig({ reduced }: { reduced: boolean }) {
  return (
    <Frame>
      {SCATTER.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={3}
          fill="#f6f3ec"
          fillOpacity={0.5}
          initial={reduced ? false : { opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduced ? 0 : 0.45, delay: reduced ? 0 : i * 0.02, ease: EASE }}
        />
      ))}
      <motion.path
        d={`M ${PAD.left} ${H - PAD.bottom - 10} L ${W - PAD.right} ${PAD.top + 40}`}
        stroke="var(--color-marker)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        initial={reduced ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: reduced ? 0 : 1.3, delay: reduced ? 0 : 0.7, ease: EASE }}
      />
    </Frame>
  );
}

function BarsFig({ reduced }: { reduced: boolean }) {
  const max = 140;
  const bw = IW / BARS.length;
  return (
    <Frame>
      {BARS.map((v, i) => {
        const h = (v / max) * IH;
        const peak = v === Math.max(...BARS);
        return (
          <motion.rect
            key={i}
            x={PAD.left + i * bw + bw * 0.18}
            width={bw * 0.64}
            y={H - PAD.bottom - h}
            fill={peak ? "var(--color-marker)" : "#f6f3ec"}
            fillOpacity={peak ? 1 : 0.34}
            initial={reduced ? false : { height: 0, y: H - PAD.bottom }}
            animate={{ height: h, y: H - PAD.bottom - h }}
            transition={{
              duration: reduced ? 0 : 0.8,
              delay: reduced ? 0 : i * 0.05,
              ease: EASE,
            }}
          />
        );
      })}
    </Frame>
  );
}

function AreaFig({ reduced }: { reduced: boolean }) {
  const max = 90;
  const pts = AREA.map((v, i) => ({
    x: PAD.left + (i / (AREA.length - 1)) * IW,
    y: H - PAD.bottom - (v / max) * IH,
  }));
  const line = pts.map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`).join(" ");
  const area = `${line} L ${W - PAD.right} ${H - PAD.bottom} L ${PAD.left} ${H - PAD.bottom} Z`;
  return (
    <Frame>
      <motion.path
        d={area}
        fill="var(--color-marker)"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 0.14 }}
        transition={{ duration: reduced ? 0 : 1.2, delay: reduced ? 0 : 0.9 }}
      />
      <motion.path
        d={line}
        stroke="var(--color-marker)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        initial={reduced ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: reduced ? 0 : 1.6, ease: EASE }}
      />
      {pts.map((p, i) =>
        i === pts.length - 1 ? (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={5}
            fill="var(--color-marker)"
            initial={reduced ? false : { opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reduced ? 0 : 0.4, delay: reduced ? 0 : 1.5 }}
          />
        ) : null,
      )}
    </Frame>
  );
}

function DonutFig({ reduced }: { reduced: boolean }) {
  const cx = W / 2;
  const cy = H / 2 - 8;
  const r = 150;
  const C = 2 * Math.PI * r;
  const starts = DONUT.map(
    (_, i) => DONUT.slice(0, i).reduce((sum, seg) => sum + seg.value, 0),
  );
  return (
    <Frame>
      <g transform={`rotate(-90 ${cx} ${cy})`}>
        {DONUT.map((seg, i) => {
          const start = starts[i];
          return (
            <motion.circle
              key={seg.label}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={i === 0 ? "var(--color-marker)" : "#f6f3ec"}
              strokeOpacity={i === 0 ? 1 : 0.55 - i * 0.12}
              strokeWidth={i === 0 ? 26 : 18}
              strokeDasharray={`${seg.value * C - 6} ${C - seg.value * C + 6}`}
              strokeDashoffset={-start * C}
              initial={reduced ? false : { opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reduced ? 0 : 0.7, delay: reduced ? 0 : i * 0.16, ease: EASE }}
            />
          );
        })}
      </g>
      {DONUT.map((seg, i) => (
        <motion.text
          key={seg.label}
          x={W - PAD.right}
          y={PAD.top + 8 + i * 26}
          textAnchor="end"
          fontSize="12"
          letterSpacing="0.12em"
          fill="#f6f3ec"
          fillOpacity={i === 0 ? 0.9 : 0.5}
          fontFamily="var(--font-geist-mono), monospace"
          initial={reduced ? false : { opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : 0.4 + i * 0.12 }}
        >
          {`${seg.label.toUpperCase()} ${Math.round(seg.value * 100)}%`}
        </motion.text>
      ))}
    </Frame>
  );
}

export function InsightDeck() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduced || paused) return;
    const timer = setInterval(() => setActive((a) => (a + 1) % FIGS.length), 6000);
    return () => clearInterval(timer);
  }, [reduced, paused]);

  const fig = FIGS[active];

  return (
    <div
      className="relative w-full bg-paper-inverse text-paper"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="flex items-center justify-between px-5 pt-4">
        <p className="label-meta text-paper/45">THE WORK, ANIMATED</p>
        <p className="label-meta text-paper/45" aria-live="off">
          {String(active + 1).padStart(2, "0")} / {String(FIGS.length).padStart(2, "0")}
        </p>
      </div>

      <div key={fig.id}>
        {fig.id === "scatter" ? <ScatterFig reduced={Boolean(reduced)} /> : null}
        {fig.id === "bars" ? <BarsFig reduced={Boolean(reduced)} /> : null}
        {fig.id === "area" ? <AreaFig reduced={Boolean(reduced)} /> : null}
        {fig.id === "donut" ? <DonutFig reduced={Boolean(reduced)} /> : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-paper/10 px-5 py-4">
        <div>
          <p className="label-meta text-paper/70">{fig.label}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-paper/35">
            {fig.note}
          </p>
        </div>
        <div className="flex items-center gap-2" role="group" aria-label="Choose figure">
          {FIGS.map((f, i) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={i === active}
              aria-label={f.label}
              onClick={() => setActive(i)}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === active
                  ? "w-8 bg-marker"
                  : "w-2 bg-paper/25 hover:bg-paper/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Light companion piece for the About page: a single sparkline that draws
 * itself into view, peak marked in the brand highlighter.
 */
export function SparkSignature() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const pts = [22, 26, 24, 31, 29, 38, 36, 47, 44, 58, 55, 71, 66, 84];
  const max = 90;
  const W2 = 720;
  const H2 = 220;
  const coords = pts.map((v, i) => ({
    x: 20 + (i / (pts.length - 1)) * (W2 - 40),
    y: H2 - 24 - (v / max) * (H2 - 60),
  }));
  const line = coords.map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`).join(" ");
  const peak = coords[coords.length - 1];

  return (
    <div ref={ref} className="w-full border border-line bg-paper p-5">
      <svg viewBox={`0 0 ${W2} ${H2}`} className="h-auto w-full" aria-label="A rising sparkline marking the trajectory of the work.">
        <g stroke="var(--color-line)" strokeWidth="1">
          {[0.25, 0.5, 0.75].map((t) => (
            <line key={t} x1="20" x2={W2 - 20} y1={24 + t * (H2 - 60)} y2={24 + t * (H2 - 60)} />
          ))}
        </g>
        <motion.path
          d={line}
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={reduced ? false : { pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : undefined}
          transition={{ duration: reduced ? 0 : 1.6, ease: EASE }}
        />
        <motion.circle
          cx={peak.x}
          cy={peak.y}
          r={6}
          fill="var(--color-marker)"
          stroke="var(--color-ink)"
          strokeWidth="1.5"
          initial={reduced ? false : { opacity: 0, scale: 0 }}
          animate={inView ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: reduced ? 0 : 0.4, delay: reduced ? 0 : 1.5 }}
        />
      </svg>
      <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
        <p className="label-meta">Fig. 05 — Trajectory</p>
        <p className="label-meta text-faint">every project, same discipline</p>
      </div>
    </div>
  );
}
