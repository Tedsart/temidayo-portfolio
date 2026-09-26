import Link from "next/link";
import { AboutPreview } from "@/components/public/AboutPreview";
import { Capabilities } from "@/components/public/Capabilities";
import { ContactCTA } from "@/components/public/ContactCTA";
import { FallbackNotice } from "@/components/public/FallbackNotice";
import { Hero } from "@/components/public/Hero";
import { ProcessTimeline } from "@/components/public/ProcessTimeline";
import { Ticker } from "@/components/public/Ticker";
import { ProjectList } from "@/components/public/ProjectCard";
import { Reveal } from "@/components/motion/Reveal";
import { Container, EmptyState, SectionHeading } from "@/components/ui/primitives";
import {
  getSiteProfile,
  listFeaturedProjects,
} from "@/lib/data/projects";

export default async function HomePage() {
  const [featured, profile] = await Promise.all([
    listFeaturedProjects(3),
    getSiteProfile(),
  ]);

  const projects = featured.data ?? [];
  const usingFallback = featured.usingFallback || profile.usingFallback;
  const siteProfile = profile.data;

  return (
    <>
      {usingFallback ? <FallbackNotice /> : null}

      <Hero />

      <Ticker />

      {/* 01 — Selected work */}
      <Container as="section" className="py-20 md:py-28" >
        <SectionHeading
          index="01 — SELECTED WORK"
          title="Work that turned data into a decision."
          description="Each case study walks through the question, the data, the analysis and what it changed. Featured work first."
        />

        <div className="mt-14">
          {projects.length ? (
            <ProjectList projects={projects} usingFallback={usingFallback} />
          ) : (
            <EmptyState
              title="No projects published yet."
              description="Publish a case study from the CMS and it will appear here automatically."
            />
          )}
        </div>

        <Reveal className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-line pt-8">
          <p className="max-w-md text-sm leading-relaxed text-muted">
            Every project here is stored in the database — nothing on this page is
            hard-coded into the site.
          </p>
          <Link
            href="/work"
            className="group inline-flex items-center gap-3 text-sm font-medium"
          >
            All work
            <span
              aria-hidden="true"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/25 transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-paper"
            >
              →
            </span>
          </Link>
        </Reveal>
      </Container>

      {/* 02 — What I do */}
      <Container as="section" className="py-20 md:py-28">
        <SectionHeading
          index="02 — WHAT I DO"
          title="Three things, done properly."
          description="Analysis that holds up, visuals that read at a glance, and communication that survives contact with a real audience."
        />
        <div className="mt-14">
          <Capabilities />
        </div>
      </Container>

      {/* 03 — How I think */}
      <section className="border-y border-line bg-paper-2/60">
        <Container className="py-20 md:py-28">
          <SectionHeading
            index="03 — HOW I THINK"
            title="Understand → Explore → Analyze → Visualize → Communicate"
            description="The same sequence on every project, whether it is a one-page answer or a full dashboard."
          />
          <div className="mt-14">
            <ProcessTimeline />
          </div>
        </Container>
      </section>

      {/* 04 — About */}
      <Container as="section" className="py-20 md:py-28">
        <SectionHeading index="04 — ABOUT" title="The analyst behind the work." />
        <div className="mt-14">
          {siteProfile ? (
            <AboutPreview profile={siteProfile} />
          ) : (
            <EmptyState title="Profile unavailable" description="Could not load the site profile." />
          )}
        </div>
      </Container>

      {/* 05 — Contact */}
      {siteProfile ? <ContactCTA profile={siteProfile} /> : null}
    </>
  );
}
