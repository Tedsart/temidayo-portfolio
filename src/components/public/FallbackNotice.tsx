import { Container } from "@/components/ui/primitives";

/**
 * Shown only when Supabase credentials are missing, so nobody mistakes the
 * bundled placeholder copy for real portfolio facts. Disappears the moment
 * `.env.local` is configured.
 */
export function FallbackNotice() {
  return (
    <div className="border-b border-warning/25 bg-warning/[0.07]">
      <Container className="py-3">
        <p className="font-mono text-[11px] leading-relaxed tracking-[0.06em] text-warning">
          Placeholder mode — Supabase is not connected, so the content below is
          bundled sample copy, not real portfolio facts. Add
          NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local to
          load live content from the CMS.
        </p>
      </Container>
    </div>
  );
}
