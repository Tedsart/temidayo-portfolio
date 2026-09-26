import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { isSupabaseConfigured, siteConfig } from "@/lib/config";
import { getAdminUser } from "@/lib/supabase/client";

export const metadata: Metadata = {
  title: "Sign in · CMS",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  // Already signed in? Nothing to do here.
  const user = await getAdminUser();
  if (user) redirect(next?.startsWith("/admin") ? next : "/admin");

  return (
    <main className="grid min-h-screen place-items-center bg-paper px-5">
      <div className="w-full max-w-sm">
        <p className="section-index mb-4">PRIVATE — {siteConfig.name}</p>
        <h1 className="text-3xl font-semibold tracking-tight">Sign in to the CMS</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          This area is for the portfolio owner only. Sessions are handled by
          Supabase Auth; nothing is stored in the browser beyond the session cookie.
        </p>

        {isSupabaseConfigured ? (
          <LoginForm next={next?.startsWith("/admin") ? next : "/admin"} />
        ) : (
          <div className="mt-8 border border-warning/30 bg-warning/[0.07] px-5 py-4">
            <p className="text-sm leading-relaxed text-warning">
              Supabase is not configured yet. Copy{" "}
              <code className="font-mono text-xs">.env.example</code> to{" "}
              <code className="font-mono text-xs">.env.local</code>, add your project
              URL and keys, run the migrations in{" "}
              <code className="font-mono text-xs">supabase/migrations</code>, then seed
              your admin account (see README) and sign in here.
            </p>
          </div>
        )}

        <p className="mt-8 text-xs text-faint">
          <Link href="/" className="underline underline-offset-4 hover:text-ink">
            ← Back to the public site
          </Link>
        </p>
      </div>
    </main>
  );
}
