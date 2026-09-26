import Link from "next/link";
import { setPreviewMode } from "@/actions/preview";
import { Button } from "@/components/ui/primitives";

/** Shown only while an administrator has draft preview switched on. */
export function PreviewModeBar() {
  return (
    <div className="sticky top-0 z-[60] w-full border-b border-accent/30 bg-accent-soft">
      <div className="mx-auto flex w-full max-w-[1360px] flex-wrap items-center justify-between gap-3 px-5 py-2.5 sm:px-8 lg:px-12">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
          Preview mode — drafts are visible to you only
        </p>
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-xs text-accent underline underline-offset-4 hover:no-underline">
            Back to CMS
          </Link>
          <form action={setPreviewMode.bind(null, false)}>
            <Button type="submit" variant="quiet" className="px-3 py-1.5 text-xs">
              Turn off
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
