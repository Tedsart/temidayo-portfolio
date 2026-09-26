import { Reveal } from "@/components/motion/Reveal";
import { capabilities } from "@/lib/config";

/** What I Do — Analyze / Visualize / Communicate. Three columns, no cards. */
export function Capabilities() {
  return (
    <div className="grid gap-10 md:grid-cols-3 md:gap-12">
      {capabilities.map((capability, i) => (
        <Reveal key={capability.id} index={i} className="border-t border-ink pt-6">
          <div className="flex items-baseline justify-between">
            <span className="section-index">{capability.index}</span>
            <span aria-hidden="true" className="h-px w-10 bg-accent" />
          </div>

          <h3 className="mt-5 text-2xl font-semibold uppercase tracking-[0.02em]">
            {capability.title}
          </h3>

          <p className="mt-4 text-base leading-relaxed text-muted">{capability.body}</p>

          <ul className="mt-6 space-y-2">
            {capability.points.map((point) => (
              <li key={point} className="flex items-baseline gap-3 text-sm text-ink-2">
                <span aria-hidden="true" className="h-px w-4 shrink-0 bg-line-strong" />
                {point}
              </li>
            ))}
          </ul>
        </Reveal>
      ))}
    </div>
  );
}
