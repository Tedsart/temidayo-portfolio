import Link from "next/link";
import { Container, MetaLabel } from "@/components/ui/primitives";
import { nav, siteConfig } from "@/lib/config";

export function Footer({
  linkedin,
  github,
  email,
}: {
  linkedin?: string | null;
  github?: string | null;
  email?: string | null;
}) {
  const year = new Date().getFullYear();

  const socials = [
    { label: "LinkedIn", href: linkedin ?? null },
    { label: "GitHub", href: github ?? null },
    { label: "Email", href: email ? `mailto:${email}` : null },
  ].filter((item): item is { label: string; href: string } => Boolean(item.href));

  return (
    <footer className="mt-24 border-t border-ink bg-paper-inverse text-paper on-dark">
      <Container className="py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-mono text-sm uppercase tracking-[0.16em]">TEMIDAYO KUKOYI</p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-paper/60">
              {siteConfig.role}
            </p>
          </div>

          <nav aria-label="Footer">
            <MetaLabel className="text-paper/40">Navigate</MetaLabel>
            <ul className="mt-4 space-y-2">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-paper/80 transition-colors hover:text-paper"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <MetaLabel className="text-paper/40">Elsewhere</MetaLabel>
            <ul className="mt-4 space-y-2">
              {socials.length ? (
                socials.map((item) => {
                  const external = item.href.startsWith("http");
                  const className =
                    "group inline-flex items-center gap-1.5 text-sm text-paper/80 transition-colors hover:text-paper";
                  return (
                    <li key={item.label}>
                      {external ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className={className}
                        >
                          {item.label}
                          <span aria-hidden="true" className="text-paper/40 transition-transform group-hover:translate-x-0.5">
                            ↗
                          </span>
                        </a>
                      ) : (
                        <Link href={item.href} className={className}>
                          {item.label}
                        </Link>
                      )}
                    </li>
                  );
                })
              ) : (
                <li className="text-sm text-paper/50">Links added in .env.local</li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-paper/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-paper/40">
            © {year} Temidayo Kukoyi
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-paper/40">
            Built with Next.js · Supabase
          </p>
        </div>
      </Container>
    </footer>
  );
}
