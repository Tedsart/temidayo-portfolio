import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseConfig } from "../config";
import { getCookieStore } from "./cookie-store";
import type { Database } from "../database.types";
import type { AppSupabaseClient } from "./browser";

export type { AppSupabaseClient };
/**
 * Server client — reads and writes the request cookies so the admin session
 * survives across server-rendered pages and server actions.
 */
export async function createSupabaseServerClient(): Promise<AppSupabaseClient | null> {
  if (!isSupabaseConfigured) return null;

  const cookieStore = await getCookieStore();

  return createServerClient<Database>(supabaseConfig.url, supabaseConfig.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component: Next.js will refresh the route via
          // the middleware, so a read-only cookie jar is acceptable here.
        }
      },
    },
  });
}

/**
 * Service-role client — bypasses RLS. Server only, used for administrative
 * storage operations and seeding. Never import this from a client component.
 */
export function createSupabaseAdminClient(): AppSupabaseClient | null {
  if (!isSupabaseConfigured || !supabaseConfig.serviceRoleKey) return null;

  return createClient<Database>(supabaseConfig.url, supabaseConfig.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Returns the signed-in admin user, or null. `requireAdmin` throws instead so
 * protected server components can fail closed.
 */
export async function getAdminUser(): Promise<{
  id: string;
  email: string;
} | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;
  return { id: user.id, email: user.email ?? "admin" };
}

export class UnauthorizedError extends Error {
  constructor(message = "You need to sign in to view this page.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export async function requireAdmin(): Promise<{ id: string; email: string }> {
  const user = await getAdminUser();
  if (!user) throw new UnauthorizedError();
  return user;
}
