import Image from "next/image";
import type { ProjectAsset } from "@/lib/types";

/**
 * Editorial portrait treatment: sharp corners, a hairline frame and a
 * monospace caption. When no photo has been uploaded through the CMS this
 * renders an obvious, designed placeholder — never an invented face.
 */
export function ProfilePhoto({
  photo,
  sizes,
  priority = false,
  className = "",
}: {
  photo: ProjectAsset | null;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden border border-line bg-paper-2 ${className}`}>
      <div className="relative aspect-[4/5] w-full">
        {photo?.public_url ? (
          <Image
            src={photo.public_url}
            alt={photo.alt_text || "Portrait of Temidayo Kukoyi"}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover object-top"
          />
        ) : (
          <div className="grid-paper flex h-full w-full flex-col items-center justify-center gap-4 bg-paper-2">
            <span
              aria-hidden="true"
              className="font-mono text-5xl font-medium tracking-[0.08em] text-line-strong"
            >
              TK
            </span>
            <span className="label-meta px-6 text-center text-faint">
              Profile photo not uploaded
              <br />
              Admin → Media
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
