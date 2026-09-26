import { cookies } from "next/headers";

/**
 * Minimal cookie-store surface used by this app.
 *
 * `next/headers` re-exports its cookie types from an internal path whose
 * declaration file is not shipped in this Next.js build, so the inferred type
 * degrades. Declaring the two operations we actually use keeps the call sites
 * accurate and type-checked without depending on that path.
 */
export interface CookieOptions {
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none" | boolean;
  maxAge?: number;
  expires?: Date;
}

export interface AppCookieStore {
  get(name: string): { name: string; value: string } | undefined;
  getAll(): { name: string; value: string }[];
  set(name: string, value: string, options?: CookieOptions): void;
  set(options: { name: string; value: string } & CookieOptions): void;
  delete(name: string, options?: CookieOptions): void;
  delete(options: { name: string } & CookieOptions): void;
}

export async function getCookieStore(): Promise<AppCookieStore> {
  const store = (await cookies()) as unknown as AppCookieStore;
  return store;
}
