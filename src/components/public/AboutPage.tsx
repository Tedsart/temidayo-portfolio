import { DataHeroVisual } from "@/components/public/DataHeroVisual";
import { ProfilePhoto } from "@/components/public/ProfilePhoto";
import { Reveal } from "@/components/motion/Reveal";
import { MetaLabel, SectionHeading, Tag } from "@/components/ui/primitives";
import type { SiteProfile } from "@/lib/types";

/**
 * Full About page.
 *
 * Structure is fixed; the facts are not. Anything not yet supplied by
 * Temidayo renders as an obvious placeholder slot, never as invented
 * credentials.
 */
export function AboutSections({
  profile,
  usingFallback,
}: {
  profile: SiteProfile;
  usingFallback: boolean;
}) {
  return (
    <>
      <SectionHeading
        index="ABOUT"
        title="Data, treated like an editorial craft."
        description={profile.role}
      />

      <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <Reveal>
          <ProfilePhoto photo={profile.photo} sizes="(max-width: 1024px) 88vw, 30vw" />
          <div className="mt-4 flex items-baseline justify-between border-t border-line pt-3">
            <MetaLabel>{profile.name}</MetaLabel>
            <MetaLabel className="text-faint">Lagos, NG</MetaLabel>
          </div>
        </Reveal>

        <Reveal index={1}>
          <div className="prose-editorial">
            <p>{profile.intro}</p>
            <p>
              My background is in statistics, which shapes how I work: I care
              about what a number can and cannot support, and I would rather give
              a precise small answer than an impressive wrong one.
            </p>
            <p>
              Day to day that means cleaning messy datasets, checking assumptions,
              building dashboards that people actually open, and writing the
              summary that turns a chart into a decision.
            </p>
          </div>

          <dl className="mt-10 grid gap-x-10 gap-y-6 border-t border-line pt-8 sm:grid-cols-2">
            <div>
              <dt className="label-meta">Statistics background</dt>
              <dd className="mt-2 text-sm leading-relaxed text-ink-2">
                [Your statistics education or training — replace in the CMS intro copy.]
              </dd>
            </div>
            <div>
              <dt className="label-meta">Experience</dt>
              <dd className="mt-2 text-sm leading-relaxed text-ink-2">
                [Roles, internships or projects — replace with real entries only.]
              </dd>
            </div>
            <div>
              <dt className="label-meta">Interests</dt>
              <dd className="mt-2 text-sm leading-relaxed text-ink-2">
                [What you read, follow and build outside work.]
              </dd>
            </div>
            <div>
              <dt className="label-meta">AI-assisted analytics</dt>
              <dd className="mt-2 text-sm leading-relaxed text-ink-2">
                I use AI tools to speed up cleaning and exploration — the analysis
                and the judgement stay human, and every number is still verified.
              </dd>
            </div>
          </dl>
        </Reveal>
      </div>

      <div className="mt-20 grid gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight">Tools I reach for</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {[
              "Power BI",
              "SQL",
              "Excel",
              "Python",
              "Looker Studio",
              "Data cleaning",
              "Statistical analysis",
              "Report design",
            ].map((tool) => (
              <Tag key={tool}>{tool}</Tag>
            ))}
          </div>
          <p className="mt-6 text-sm leading-relaxed text-muted">
            The tool follows the question. A spreadsheet can be the right answer;
            a dashboard can be the wrong one. I pick whichever makes the insight
            easiest to trust and easiest to use.
          </p>
        </Reveal>

        <Reveal index={1}>
          <DataHeroVisual />
        </Reveal>
      </div>

      <Reveal className="mt-20 border-t border-line pt-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <MetaLabel>Curriculum vitae</MetaLabel>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
              [Upload the CV as a document in Admin → Media to enable this
              download. Until then this slot stays intentionally empty.]
            </p>
          </div>
          {usingFallback ? (
            <span className="label-meta text-warning">Placeholder mode</span>
          ) : null}
        </div>
      </Reveal>
    </>
  );
}
