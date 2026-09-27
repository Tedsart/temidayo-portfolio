/**
 * Giant outlined display words drifting across the page — the brand's
 * verbs as architecture. Pure CSS motion; freezes for reduced motion.
 */
const WORDS = ["Analyze", "Visualize", "Communicate", "Question", "Decide"];

export function BigMarquee() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden border-y border-line bg-paper-2/70 py-5 md:py-7"
    >
      <div className="ticker-track flex w-max" style={{ animationDuration: "52s" }}>
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {WORDS.map((word) => (
              <span key={word} className="flex items-center">
                <span className="outline-text px-8 font-display text-[clamp(3rem,7vw,6rem)] font-semibold leading-none">
                  {word}
                </span>
                <span className="text-2xl text-marker" style={{ WebkitTextStroke: 0 }}>
                  ✦
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
