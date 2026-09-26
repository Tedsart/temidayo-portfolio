"use client";

import Image from "next/image";
import { useState } from "react";
import { deleteAsset, reorderAssets, updateAssetMeta } from "@/actions/assets";
import { MoveButtons } from "@/components/admin/FindingsEditor";
import { DocKindBadge } from "@/components/public/CaseStudyBlocks";
import type { ProjectAsset } from "@/lib/types";
import { formatBytes, isImageMime, moveItem, padIndex } from "@/lib/utils";

/**
 * Ordered media rows with two reorder mechanisms on purpose:
 * drag-and-drop for pointer users, and explicit move buttons + keyboard
 * focus for everyone else. The saved order lives in the database.
 */
export function SortableMediaList({
  assets,
  onChange,
  showMeta = true,
}: {
  assets: ProjectAsset[];
  onChange: (next: ProjectAsset[]) => void;
  showMeta?: boolean;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const commit = async (next: ProjectAsset[]) => {
    onChange(next);
    setPending(true);
    await reorderAssets(next.map((a) => a.id));
    setPending(false);
  };

  const move = (from: number, to: number) => commit(moveItem(assets, from, to));

  const drop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const from = assets.findIndex((a) => a.id === dragId);
    const to = assets.findIndex((a) => a.id === targetId);
    if (from < 0 || to < 0) return;
    commit(moveItem(assets, from, to));
  };

  const updateMeta = async (asset: ProjectAsset, patch: { alt_text?: string | null; caption?: string | null }) => {
    const next = assets.map((a) => (a.id === asset.id ? { ...a, ...patch } : a));
    onChange(next);
    await updateAssetMeta(asset.id, patch);
  };

  const remove = async (asset: ProjectAsset) => {
    if (!window.confirm(`Remove “${asset.file_name}” from the project and delete the file?`)) {
      return;
    }
    onChange(assets.filter((a) => a.id !== asset.id));
    await deleteAsset(asset.id);
  };

  if (!assets.length) {
    return (
      <p className="border border-dashed border-line-strong px-5 py-6 text-sm text-muted">
        Nothing uploaded for this slot yet.
      </p>
    );
  }

  return (
    <ul className="space-y-3" aria-label="Media in saved order">
      {assets.map((asset, i) => (
        <li
          key={asset.id}
          draggable
          onDragStart={() => setDragId(asset.id)}
          onDragEnd={() => setDragId(null)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            drop(asset.id);
          }}
          className={`border border-line bg-paper p-4 transition-opacity ${
            dragId === asset.id ? "opacity-50" : ""
          } ${pending ? "opacity-70" : ""}`}
        >
          <div className="flex items-start gap-4">
            <span
              className="mt-1 cursor-grab select-none text-faint active:cursor-grabbing"
              aria-hidden="true"
              title="Drag to reorder"
            >
              ⠿
            </span>

            {isImageMime(asset.mime_type) && asset.public_url ? (
              <div className="relative h-16 w-24 shrink-0 overflow-hidden border border-line bg-paper-2">
                <Image src={asset.public_url} alt="" fill sizes="96px" className="object-cover" />
              </div>
            ) : (
              <DocKindBadge fileName={asset.file_name} />
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="truncate text-sm font-medium">
                  <span className="mr-2 font-mono text-[10px] text-faint">{padIndex(i + 1)}</span>
                  {asset.file_name}
                </p>
                <div className="flex items-center gap-1.5">
                  <MoveButtons index={i} count={assets.length} onMove={move} />
                  <button
                    type="button"
                    className="px-2 py-1 text-xs text-danger underline underline-offset-4"
                    onClick={() => void remove(asset)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="mt-0.5 text-xs text-faint">{formatBytes(asset.size_bytes)}</p>

              {showMeta ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label-meta block" htmlFor={`alt-${asset.id}`}>
                      Alt text
                    </label>
                    <input
                      id={`alt-${asset.id}`}
                      type="text"
                      defaultValue={asset.alt_text ?? ""}
                      onBlur={(e) => void updateMeta(asset, { alt_text: e.target.value || null })}
                      placeholder="Describe the visual for screen readers"
                      className="mt-1 w-full border border-line bg-paper px-3 py-1.5 text-xs outline-none focus:border-ink"
                    />
                  </div>
                  <div>
                    <label className="label-meta block" htmlFor={`cap-${asset.id}`}>
                      Caption (optional)
                    </label>
                    <input
                      id={`cap-${asset.id}`}
                      type="text"
                      defaultValue={asset.caption ?? ""}
                      onBlur={(e) => void updateMeta(asset, { caption: e.target.value || null })}
                      placeholder="Shown under the image"
                      className="mt-1 w-full border border-line bg-paper px-3 py-1.5 text-xs outline-none focus:border-ink"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
