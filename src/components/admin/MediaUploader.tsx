"use client";

import { useRef, useState } from "react";
import { planUpload, recordAsset } from "@/actions/assets";
import { friendlyUploadError, UPLOAD_LIMIT_BYTES } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { supabaseConfig } from "@/lib/config";
import { ErrorMessage, Spinner } from "@/components/ui/primitives";
import type { AssetType, ProjectAsset } from "@/lib/types";
import { formatBytes, uid } from "@/lib/utils";

/**
 * Uploads go straight from the browser to Supabase Storage with the admin's
 * session token — the storage policy allows writes only for `is_admin()`.
 * The asset row is recorded afterwards by a server action.
 */
export function MediaUploader({
  projectId,
  assetType,
  accept,
  multiple = false,
  label,
  onUploaded,
}: {
  projectId: string | null;
  assetType: AssetType;
  accept: string;
  multiple?: boolean;
  label: string;
  onUploaded: (asset: ProjectAsset) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    if (!projectId && assetType !== "profile") {
      setError("Save the project draft first — uploads attach to a saved project.");
      return;
    }

    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        setProgress(`Uploading ${file.name} (${formatBytes(file.size)})…`);

        if (file.size > UPLOAD_LIMIT_BYTES) {
          throw new Error(`"${file.name}" is larger than 25 MB.`);
        }

        const plan = await planUpload(file.name, projectId ? `projects/${projectId}` : "site");
        if (!plan.ok || !plan.data) throw new Error(plan.error);

        const supabase = createSupabaseBrowserClient();
        const { error: uploadError } = await supabase.storage
          .from(supabaseConfig.bucket)
          .upload(plan.data.storagePath, file, { upsert: false });

        if (uploadError) throw new Error(friendlyUploadError(uploadError.message));

        const { error: recordError, data } = await recordAssetAndReturn({
          project_id: projectId,
          asset_type: assetType,
          storage_path: plan.data.storagePath,
          file_name: file.name,
          mime_type: file.type || null,
          size_bytes: file.size,
        });

        if (recordError || !data) throw new Error(recordError ?? "Could not record the upload.");
        onUploaded(data);
      }
      setProgress(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
      setProgress(null);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label
        className={`flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-line-strong bg-paper px-5 py-6 text-center transition-colors hover:border-accent ${
          busy ? "pointer-events-none opacity-60" : ""
        }`}
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
          {label}
        </span>
        <span className="text-xs text-faint">
          Click to choose {multiple ? "files" : "a file"} · max 25 MB each
        </span>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          disabled={busy}
          onChange={(event) => void handleFiles(event.target.files)}
        />
      </label>

      {progress ? (
        <p className="mt-2 flex items-center gap-2 text-xs text-muted">
          <Spinner label="Uploading" /> {progress}
        </p>
      ) : null}
      {error ? <ErrorMessage>{error}</ErrorMessage> : null}
    </div>
  );
}

async function recordAssetAndReturn(input: {
  project_id: string | null;
  asset_type: AssetType;
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number;
}): Promise<{ error: string | null; data: ProjectAsset | null }> {
  const result = await recordAsset(input);
  if (!result.ok) return { error: result.error, data: null };

  // Re-read the fresh row so the editor list has ids, URLs and order.
  const id = result.data?.id;
  if (!id) return { error: "Upload recorded without an id.", data: null };

  return {
    error: null,
    data: {
      id,
      project_id: input.project_id,
      asset_type: input.asset_type,
      storage_path: input.storage_path,
      file_name: input.file_name,
      mime_type: input.mime_type,
      alt_text: null,
      caption: null,
      sort_order: 0,
      created_at: new Date().toISOString(),
      public_url: publicUrlFor(input.storage_path),
      size_bytes: input.size_bytes,
    },
  };
}

function publicUrlFor(storagePath: string): string {
  const base = supabaseConfig.url.replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${supabaseConfig.bucket}/${storagePath}`;
}

export { uid };
