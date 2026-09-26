"use client";

import { useState } from "react";
import { DocKindBadge } from "@/components/public/CaseStudyBlocks";
import { formatBytes } from "@/lib/utils";
import type { ProjectAsset } from "@/lib/types";

/**
 * Documents & datasets with View + Download actions.
 *
 * Download fetches the file as a blob (Supabase Storage sends permissive CORS
 * headers) so the browser saves it under its real name; if the fetch fails the
 * action degrades to opening the file in a new tab.
 */
export function DocumentList({ documents }: { documents: ProjectAsset[] }) {
  const [busy, setBusy] = useState<string | null>(null);

  if (!documents.length) return null;

  async function download(asset: ProjectAsset) {
    if (!asset.public_url) return;
    setBusy(asset.id);
    try {
      const response = await fetch(asset.public_url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = asset.file_name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.open(asset.public_url, "_blank", "noopener");
    } finally {
      setBusy(null);
    }
  }

  return (
    <ul className="divide-y divide-line border border-line">
      {documents.map((doc) => (
        <li
          key={doc.id}
          className="flex flex-wrap items-center gap-4 bg-paper px-5 py-4 sm:flex-nowrap"
        >
          <DocKindBadge fileName={doc.file_name} />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{doc.file_name}</p>
            <p className="mt-0.5 truncate text-xs text-muted">
              {doc.caption || doc.alt_text || formatBytes(doc.size_bytes)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {doc.public_url ? (
              <>
                <a
                  href={doc.public_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center border border-ink/25 px-4 py-2 text-xs font-medium transition-colors hover:border-ink hover:bg-ink hover:text-paper"
                >
                  View
                </a>
                <button
                  type="button"
                  onClick={() => void download(doc)}
                  disabled={busy === doc.id}
                  className="inline-flex items-center border border-accent/40 bg-accent-soft px-4 py-2 text-xs font-medium text-accent transition-colors hover:bg-accent hover:text-paper disabled:opacity-60"
                >
                  {busy === doc.id ? "Preparing…" : "Download"}
                </button>
              </>
            ) : (
              <span className="text-xs text-faint">Not uploaded yet</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
