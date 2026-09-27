/**
 * Editorial marquee strip — the site's pulse between sections.
 * Pure CSS animation; freezes for prefers-reduced-motion (globals.css).
 * Decorative: hidden from assistive tech.
 */
const ITEMS = [
  "Data → Insight",
  "Question first",
  "Evidence over impression",
  "Source · Clean · Analyze · Visualize · Communicate",
  "Dashboards people actually open",
  "Reports that end in decisions",
];

export function Ticker({
  reverse = false,
  duration = 38,
}: {
  /** Run the strip the other way — used where two strips sit on one page. */
  reverse?: boolean;
  duration?: number;
}) {
  return (
    <div
      className="overflow-hidden border-y border-ink bg-ink py-3 text-paper"
      aria-hidden="true"
    >
      <div
        className="ticker-track flex w-max"
        style={{
          animationDirection: reverse ? "reverse" : undefined,
          animationDuration: `${duration}s`,
        }}
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {ITEMS.map((item) => (
              <span
                key={item}
                className="flex items-center gap-8 px-8 font-mono text-[11px] uppercase tracking-[0.2em] text-paper/80"
              >
                {item}
                <span className="text-marker">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
