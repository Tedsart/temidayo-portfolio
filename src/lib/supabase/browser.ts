import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseConfig } from "../config";
import type { Database } from "../database.types";

export type AppSupabaseClient = SupabaseClient<Database>;

/**
 * Browser client — runs in client components. Uses the anon key, so every
 * query it makes is subject to Row Level Security. Kept in its own module so
 * client bundles never touch server-only imports.
 */
export function createSupabaseBrowserClient(): AppSupabaseClient {
  return createBrowserClient<Database>(supabaseConfig.url, supabaseConfig.anonKey);
}
