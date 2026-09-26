import { DataHeroVisual } from "@/components/public/DataHeroVisual";
import { ProfilePhoto } from "@/components/public/ProfilePhoto";
import { Reveal } from "@/components/motion/Reveal";
import { MetaLabel, SectionHeading, Tag } from "@/components/ui/primitives";
import type { SiteProfile } from "@/lib/types";

/**
 * Full About page.
 *
 * Structure is fixed; the facts are not. Owner-supplied content comes from
 * Admin → Site settings and Admin → Media (photo, CV). Anything not yet
 * supplied is hidden on the live site — placeholders appear only in the
 * pre-configuration fallback mode.
 */
export function AboutSections({
  profile,
  usingFallback,
}: {
  profile: SiteProfile;
  usingFallback: boolean;
}) {
  const showIntro = Boolean(profile.intro) || usingFallback;
  const showStats = Boolean(profile.statistics_background) || usingFallback;
  const showInterests = Boolean(profile.interests) || usingFallback;
  const showExperience = profile.experience.length > 0 || usingFallback;
  const cvUrl = profile.cv?.public_url ?? null;
  const showCv = Boolean(cvUrl) || usingFallback;

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
            {showIntro ? <p>{profile.intro}</p> : null}
            <p>
              I work with data the way an editor works with a story — every
              number has to earn its place, and the reader always comes first.
            </p>
            <p>
              Day to day that means cleaning messy datasets, checking
              assumptions, building dashboards that people actually open, and
              writing the summary that turns a chart into a decision.
            </p>
          </div>

          {showExperience ? (
            <div className="mt-10 border-t border-line pt-8">
              <h2 className="label-meta">Experience</h2>
              {profile.experience.length > 0 ? (
                <ul className="mt-4 space-y-5">
                  {profile.experience.map((entry, i) => (
                    <li key={i} className="grid gap-1 sm:grid-cols-[1fr_auto] sm:items-baseline">
                      <p className="text-sm font-medium text-ink">
                        {entry.title}
                        {entry.organization ? (
                          <span className="text-muted"> · {entry.organization}</span>
                        ) : null}
                      </p>
                      {entry.period ? (
                        <p className="font-mono text-xs text-faint">{entry.period}</p>
                      ) : null}
                      {entry.note ? (
                        <p className="text-sm leading-relaxed text-muted sm:col-span-2">
                          {entry.note}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm leading-relaxed text-ink-2">
                  [Roles, internships or projects — replace with real entries only.]
                </p>
              )}
            </div>
          ) : null}

          <dl className="mt-10 grid gap-x-10 gap-y-6 border-t border-line pt-8 sm:grid-cols-2">
            {showStats ? (
              <div>
                <dt className="label-meta">Statistics background</dt>
                <dd className="mt-2 text-sm leading-relaxed text-ink-2">
                  {profile.statistics_background ??
                    "[Your statistics education or training.]"}
                </dd>
              </div>
            ) : null}
            {showInterests ? (
              <div>
                <dt className="label-meta">Interests</dt>
                <dd className="mt-2 text-sm leading-relaxed text-ink-2">
                  {profile.interests ?? "[What you read, follow and build outside work.]"}
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="label-meta">AI-assisted analytics</dt>
              <dd className="mt-2 text-sm leading-relaxed text-ink-2">
                I use AI tools to speed up cleaning and exploration — the
                analysis and the judgement stay human, and every number is
                still verified.
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
            The tool follows the question. A spreadsheet can be the right
            answer; a dashboard can be the wrong one. I pick whichever makes
            the insight easiest to trust and easiest to use.
          </p>
        </Reveal>

        <Reveal index={1}>
          <DataHeroVisual />
        </Reveal>
      </div>

      {showCv ? (
        <Reveal className="mt-20 border-t border-line pt-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <MetaLabel>Curriculum vitae</MetaLabel>
              {cvUrl ? (
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  download
                  className="group mt-3 inline-flex items-center gap-2 border border-ink bg-ink px-5 py-3 text-sm text-paper transition-colors hover:bg-accent hover:border-accent"
                >
                  Download CV (PDF)
                  <span aria-hidden="true" className="transition-transform group-hover:translate-y-0.5">
                    ↓
                  </span>
                </a>
              ) : (
                <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                  [Upload the CV as a document in Admin → Media to enable this
                  download. Until then this slot stays intentionally empty.]
                </p>
              )}
            </div>
            {usingFallback ? (
              <span className="label-meta text-warning">Placeholder mode</span>
            ) : null}
          </div>
        </Reveal>
      ) : null}
    </>
  );
}
