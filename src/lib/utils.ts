/** Small shared helpers. Pure functions, safe to import from client code. */

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** `[Placeholder]` and `[ … ]` strings are stubs, never real content. */
export function isPlaceholder(value?: string | null): boolean {
  return Boolean(value && value.trim().startsWith("["));
}

/**
 * Whether a story field renders its section. Placeholder text — `[ … ]` —
 * counts as content on purpose: in fallback mode the site should show the
 * full case-study anatomy with clearly-marked stubs, and in live mode an
 * editor who saves bracketed text clearly wants it visible.
 * Truly empty fields hide their section.
 */
export function hasContent(value?: string | null): boolean {
  return Boolean(value && value.trim().length > 0);
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Formats a project date. CMS dates are free text ("2024", "Q2 2025",
 * "Jan 2024"), so ISO-like values are prettified and anything else is passed
 * through untouched.
 */
export function formatProjectDate(value?: string | null): string {
  if (!value) return "—";
  const trimmed = value.trim();
  if (isPlaceholder(trimmed)) return "—";

  const iso = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(trimmed);
  if (iso) {
    const [, year, month] = iso;
    if (!month) return year;
    const monthName = MONTHS[Number(month) - 1];
    return monthName ? `${monthName} ${year}` : year;
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return `${MONTHS[parsed.getMonth()]} ${parsed.getFullYear()}`;
  }

  return trimmed;
}

/** Relative "Updated 3 days ago" for the admin list. */
export function formatRelativeDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;

  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatFullDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/** `01 / 05` */
export function padIndex(index: number): string {
  return String(index).padStart(2, "0");
}

export function splitList(value: string): string[] {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function joinList(value: string[] | null | undefined): string {
  return (value ?? []).join(", ");
}

/** Moves an item within an array without mutating it. */
export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return items;
  }
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function absoluteUrl(path: string, origin: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${origin.replace(/\/$/, "")}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function extensionOf(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? (parts.pop() as string).toLowerCase() : "";
}

export function isImageMime(mime: string | null | undefined): boolean {
  return Boolean(mime?.startsWith("image/"));
}

/** Human readable file size, e.g. `1.4 MB`. */
export function formatBytes(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

/** Collision-safe id for unsaved editor rows. */
export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export const UPLOAD_LIMIT_BYTES = 25 * 1024 * 1024;

export function friendlyUploadError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("the object exceeded the maximum size"))
    return "That file is larger than the 25 MB limit. Export a smaller version and try again.";
  if (lower.includes("bucket not found"))
    return "The storage bucket is missing. Run the setup SQL from supabase/migrations, then retry.";
  if (lower.includes("new row violates row-level security") || lower.includes("row-level security"))
    return "Upload blocked by storage policies. Confirm you are signed in as an administrator.";
  if (lower.includes("failed to fetch") || lower.includes("networkerror"))
    return "Network problem reaching Supabase Storage. Check your connection and retry.";
  return `Upload failed: ${message}`;
}
