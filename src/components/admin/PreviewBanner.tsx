import { isPreviewMode } from "@/lib/preview";
import { PreviewModeBar } from "@/components/admin/PreviewModeBar";

/**
 * Renders the draft-preview bar only for a signed-in administrator who has
 * explicitly switched preview mode on. Reads the cookie, so it never leaks.
 */
export async function PreviewBanner() {
  const preview = await isPreviewMode();
  if (!preview) return null;
  return <PreviewModeBar />;
}
