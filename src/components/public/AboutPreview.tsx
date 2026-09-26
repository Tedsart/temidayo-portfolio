import Link from "next/link";
import { MetaLabel } from "@/components/ui/primitives";
import type { SiteProfile } from "@/lib/types";
import { ProfilePhoto } from "@/components/public/ProfilePhoto";

/** Homepage About preview — the photo lives here, not in the hero. */
export function AboutPreview({ profile }: { profile: SiteProfile }) {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
      <div className="relative">
        <ProfilePhoto photo={profile.photo} sizes="(max-width: 1024px) 88vw, 34vw" priority={false} />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-4 -right-4 -z-10 hidden h-full w-full border border-line lg:block"
        />
        <div className="mt-4 flex items-baseline justify-between border-t border-line pt-3">
          <MetaLabel>{profile.name}</MetaLabel>
          <MetaLabel className="text-faint">Lagos, NG</MetaLabel>
        </div>
      </div>

      <div>
        <h3 className="text-[clamp(1.5rem,3vw,2.25rem)] font-semibold leading-[1.15] tracking-[-0.03em]">
          I work with data the way an editor works with a story.
        </h3>

        <div className="prose-editorial mt-6 max-w-xl">
          <p>{profile.intro}</p>
          <p>
            Most of my work sits between the spreadsheet and the decision. I take a
            dataset that is messy, wide or simply unreadable, work out what it is
            actually saying, and build the dashboard, report or visual that makes the
            answer obvious.
          </p>
        </div>

        <Link
          href="/about"
          className="group/link mt-8 inline-flex items-center gap-3 text-sm font-medium"
        >
          <span className="relative">
            Read the full story
            <span
              aria-hidden="true"
              className="absolute -bottom-1 left-0 h-px w-full origin-left bg-ink transition-transform duration-300 group-hover/link:scale-x-0"
            />
          </span>
          <span
            aria-hidden="true"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-ink/25 transition-all duration-300 group-hover/link:border-accent group-hover/link:bg-accent group-hover/link:text-paper"
          >
            →
          </span>
        </Link>
      </div>
    </div>
  );
}
