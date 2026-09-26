import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "../config";
import { getAdminUser } from "./client";

/**
 * Double-checks the session on every admin page. The middleware already
 * redirects anonymous visitors, but pages must never trust the middleware
 * alone — this keeps server components safe if the middleware matcher is
 * ever narrowed.
 */
export async function guardAdmin(): Promise<{
  email: string | null;
  configured: boolean;
}> {
  if (!isSupabaseConfigured) return { email: null, configured: false };
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return { email: user.email, configured: true };
}
