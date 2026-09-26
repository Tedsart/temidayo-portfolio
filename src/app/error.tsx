"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, Button } from "@/components/ui/primitives";

/**
 * Runtime error boundary. Shows a human-readable message — never a stack trace.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Replace with a real error reporter when one is wired up.
    console.error(error);
  }, [error]);

  return (
    <Container className="py-28">
      <p className="section-index">ERROR</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">
        Something went wrong on this page.
      </h1>
      <p className="mt-4 max-w-lg text-base leading-relaxed text-muted">
        The details have been logged. Try again — if it keeps happening, the data
        source may be temporarily unreachable.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" onClick={() => router.push("/")}>
          Back to home
        </Button>
      </div>
    </Container>
  );
}
