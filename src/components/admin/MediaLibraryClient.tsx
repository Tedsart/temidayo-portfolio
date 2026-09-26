"use client";

import Image from "next/image";
import { useState } from "react";
import { deleteAsset } from "@/actions/assets";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { DocKindBadge } from "@/components/public/CaseStudyBlocks";
import { ASSET_TYPES, type ProjectAsset } from "@/lib/types";
import { formatBytes, isImageMime } from "@/lib/utils";

/**
 * Site-level media: the profile photo used on the homepage/about page, plus a
 * searchable overview of every upload in the portfolio.
 */
export function MediaLibraryClient({ assets }: { assets: ProjectAsset[] }) {
  const [all, setAll] = useState<ProjectAsset[]>(assets);
  const [filter, setFilter] = useState<string>("all");

  const profilePhotos = all
    .filter((a) => a.asset_type === "profile")
    .sort((a, b) => a.created_at.localeCompare(b.created_at));

  const visible = all.filter((a) => (filter === "all" ? true : a.asset_type === filter));

  const remove = async (asset: ProjectAsset) => {
    if (!window.confirm(`Delete “${asset.file_name}” from storage?`)) return;
    setAll((current) => current.filter((a) => a.id !== asset.id));
    await deleteAsset(asset.id);
  };

  return (
    <div className="space-y-10">
      {/* Profile photo */}
      <section>
        <h2 className="text-lg font-semibold">Profile photo</h2>
        <p className="mt-1 text-sm text-muted">
          The portrait shown in the homepage About section. Uploading a new photo
          replaces the old one everywhere.
        </p>
        <div className="mt-4 grid gap-6 lg:grid-cols-[220px_1fr]">
          <div className="relative aspect-[4/5] w-[220px] overflow-hidden border border-line bg-paper-2">
            {profilePhotos[0]?.public_url ? (
              <Image
                src={profilePhotos[0].public_url}
                alt="Current profile photo"
                fill
                sizes="220px"
                className="object-cover object-top"
              />
            ) : (
              <div className="grid h-full place-items-center">
                <span className="font-mono text-3xl text-line-strong">TK</span>
              </div>
            )}
          </div>
          <div className="max-w-md">
            <MediaUploader
              projectId={null}
              assetType="profile"
              accept="image/*"
              label="Upload profile photo"
              onUploaded={(asset) => {
                setAll((current) => [
                  ...current.filter((a) => a.asset_type !== "profile"),
                  asset,
                ]);
              }}
            />
          </div>
        </div>
      </section>

      {/* Library */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">All uploads</h2>
          <label className="flex items-center gap-2 text-xs text-muted">
            Filter
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-line bg-paper px-2 py-1.5 text-xs outline-none focus:border-ink"
            >
              <option value="all">All types</option>
              {ASSET_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
        </div>

        {visible.length ? (
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {visible.map((asset) => (
              <li key={asset.id} className="border border-line bg-paper">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper-2">
                  {isImageMime(asset.mime_type) && asset.public_url ? (
                    <Image
                      src={asset.public_url}
                      alt={asset.alt_text || asset.file_name}
                      fill
                      sizes="240px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center">
                      <DocKindBadge fileName={asset.file_name} />
                    </div>
                  )}
                </div>
                <div className="px-3 py-2.5">
                  <p className="truncate text-xs font-medium" title={asset.file_name}>
                    {asset.file_name}
                  </p>
                  <p className="mt-0.5 flex items-center justify-between text-[10px] text-faint">
                    <span className="font-mono uppercase tracking-[0.1em]">{asset.asset_type}</span>
                    <span>{formatBytes(asset.size_bytes)}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => void remove(asset)}
                    className="mt-2 text-[11px] text-danger underline underline-offset-4"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 border border-dashed border-line-strong px-5 py-8 text-sm text-muted">
            Nothing uploaded{filter === "all" ? " yet" : ` with type “${filter}”`}.
          </p>
        )}
      </section>
    </div>
  );
}
