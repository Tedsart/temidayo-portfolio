import Link from "next/link";
import { Container, ButtonLink } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <Container className="py-28">
      <p className="section-index">404 — NO RECORD FOUND</p>
      <h1 className="mt-4 max-w-2xl text-[clamp(2rem,6vw,4rem)] font-semibold leading-[1.02] tracking-[-0.02em]">
        This page has no data behind it.
      </h1>
      <p className="mt-6 max-w-lg text-base leading-relaxed text-muted">
        The link may be out of date, or the project it pointed to is no longer
        published. The work index is the fastest way back.
      </p>
      <div className="mt-9 flex flex-wrap gap-3">
        <ButtonLink href="/work">Browse all work</ButtonLink>
        <ButtonLink href="/" variant="outline">
          Back to home
        </ButtonLink>
      </div>

      <p className="mt-16 border-t border-line pt-6">
        <Link href="/contact" className="text-sm underline underline-offset-4 hover:text-accent">
          Or tell me what you were looking for
        </Link>
      </p>
    </Container>
  );
}
