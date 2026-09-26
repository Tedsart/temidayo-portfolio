import Link from "next/link";
import { Container } from "@/components/ui/primitives";
import { Reveal } from "@/components/motion/Reveal";
import { siteConfig } from "@/lib/config";
import type { SiteProfile } from "@/lib/types";

export function ContactCTA({ profile }: { profile: SiteProfile }) {
  const email = profile.email ?? siteConfig.email;

  const channels = [
    { label: "Email", value: email, href: email ? `mailto:${email}` : null },
    { label: "LinkedIn", value: profile.linkedin ?? siteConfig.linkedin, href: profile.linkedin ?? siteConfig.linkedin },
    { label: "GitHub", value: profile.github ?? siteConfig.github, href: profile.github ?? siteConfig.github },
  ];

  return (
    <section className="bg-paper-inverse text-paper on-dark" aria-labelledby="contact-cta-heading">
      <Container className="py-20 md:py-28">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <Reveal>
            <p className="section-index text-paper/40">CONTACT</p>
            <h2
              id="contact-cta-heading"
              className="mt-6 max-w-2xl text-[clamp(2rem,5.5vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.04em]"
            >
              Have a question worth answering with data?
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-paper/65">
              {siteConfig.tagline} Send the dataset, the question or the half-formed
              idea — I will tell you honestly what the data can support.
            </p>
            <Link
              href="/contact"
              className="mt-9 inline-flex items-center gap-3 bg-paper px-7 py-4 text-sm font-medium text-ink transition-colors hover:bg-accent hover:text-paper"
            >
              Let&apos;s talk
              <span aria-hidden="true">↗</span>
            </Link>
          </Reveal>

          <Reveal index={1}>
            <dl className="border-t border-paper/15">
              {channels.map((channel) => (
                <div
                  key={channel.label}
                  className="flex items-center justify-between gap-6 border-b border-paper/15 py-5"
                >
                  <dt className="label-meta text-paper/45">{channel.label}</dt>
                  <dd className="text-right text-sm">
                    {channel.href ? (
                      <Link
                        href={channel.href}
                        {...(channel.href.startsWith("http")
                          ? { target: "_blank", rel: "noreferrer noopener" }
                          : {})}
                        className="break-all text-paper/85 transition-colors hover:text-paper"
                      >
                        {channel.value?.replace(/^https?:\/\/(www\.)?/, "") ?? "—"}
                      </Link>
                    ) : (
                      <span className="text-paper/35">Not configured</span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-xs leading-relaxed text-paper/40">
              Contact details are read from environment variables, so nothing here is
              hard-coded into the site.
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
