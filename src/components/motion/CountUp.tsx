"use client";

import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Animates the first numeric token of a string when it scrolls into view:
 * "23.1%" counts 0 → 23.1, "34 observations" counts 0 → 34. Non-numeric
 * strings render as-is. Reduced-motion visitors see the final value
 * immediately.
 */
export function CountUp({
  value,
  duration = 1.4,
  className,
}: {
  value: string;
  duration?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const parsed = useMemo(() => {
    const match = value.match(/\d+(?:[.,]\d+)?/);
    if (!match) return null;
    const token = match[0];
    const decimals = token.includes(".") ? token.split(".")[1].length : 0;
    return { token, decimals, target: parseFloat(token.replace(",", ".")) };
  }, [value]);

  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!parsed || reduced || !inView) return;

    let frame = 0;
    const start = performance.now();
    const ms = duration * 1000;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = (parsed.target * eased).toFixed(parsed.decimals);
      setDisplay(value.replace(parsed.token, current));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced, value, parsed, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
