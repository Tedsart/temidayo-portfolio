import Link from "next/link";
import { InsightDeck, DeckParallax } from "@/components/public/InsightDeck";
import { AmbientField } from "@/components/public/AmbientField";
import {
  MarkerWord,
  Reveal,
  ScrambleText,
  WordReveal,
} from "@/components/motion/Reveal";
import { MetaLabel } from "@/components/ui/primitives";
import { siteConfig } from "@/lib/config";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      {/* layered brand atmosphere: soft emerald + lime radial tints over paper */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(52rem_30rem_at_85%_-10%,rgb(11_107_69/0.10),transparent_60%),radial-gradient(40rem_26rem_at_-10%_85%,rgb(216_246_81/0.16),transparent_60%)]"
      />
      <AmbientField />

      <div className="relative mx-auto grid w-full max-w-[1360px] gap-14 px-5 pb-16 pt-16 sm:px-8 md:pb-24 md:pt-24 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16 lg:px-12">
        <div>
          <MetaLabel className="flex flex-wrap items-center gap-x-3 gap-y-2 text-ink-2">
            <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            <ScrambleText text="Data Analyst · Data Visualization · Data Storytelling" delay={0.2} />
          </MetaLabel>

          <h1 className="mt-7 text-[clamp(2.75rem,8.5vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.02em]">
            <WordReveal text="Data that" delay={0.15} className="block" />
            <span className="block">
              <WordReveal text="makes" delay={0.32} /> <MarkerWord word="sense." />
            </span>
          </h1>

          <Reveal index={1} className="mt-7 max-w-xl">
            <p className="text-lg leading-relaxed text-ink-2 md:text-xl md:leading-relaxed">
              {siteConfig.tagline}
            </p>
          </Reveal>

          <Reveal index={2} className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/work"
              className="inline-flex items-center gap-3 bg-marker px-6 py-3.5 text-sm font-medium text-ink shadow-editorial transition-all hover:-translate-y-0.5 hover:bg-ink hover:text-marker hover:shadow-lift active:translate-y-0"
            >
              Explore my work
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 border border-ink/25 px-6 py-3.5 text-sm text-ink transition-all hover:-translate-y-0.5 hover:border-ink hover:bg-ink/[0.04] hover:shadow-editorial active:translate-y-0"
            >
              Let&apos;s connect
            </Link>
          </Reveal>

          <Reveal index={3} className="mt-12">
            <dl className="grid max-w-lg grid-cols-2 gap-x-8 gap-y-4 border-t border-line pt-6 sm:grid-cols-3">
              <div>
                <dt className="label-meta">Focus</dt>
                <dd className="mt-1.5 text-sm text-ink-2">Dashboards &amp; reports</dd>
              </div>
              <div>
                <dt className="label-meta">Method</dt>
                <dd className="mt-1.5 text-sm text-ink-2">Question first</dd>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <dt className="label-meta">Available</dt>
                <dd className="mt-1.5 text-sm text-ink-2">For analysis work</dd>
              </div>
            </dl>
          </Reveal>
        </div>

        <Reveal index={2} y={24} className="lg:pl-4">
          <DeckParallax>
            <InsightDeck />
          </DeckParallax>
        </Reveal>
      </div>
    </section>
  );
}
