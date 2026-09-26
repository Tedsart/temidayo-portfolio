import Link from "next/link";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { isSupabaseConfigured } from "@/lib/config";

/**
 * CMS chrome. Deliberately quieter than the public site — the editor is a
 * tool, not a portfolio piece.
 */
export function AdminShell({
  active,
  email,
  children,
}: {
  active: "dashboard" | "projects" | "media" | "settings";
  email: string | null;
  children: React.ReactNode;
}) {
  const items = [
    { id: "dashboard" as const, label: "Dashboard", href: "/admin" },
    { id: "projects" as const, label: "Projects", href: "/admin/projects" },
    { id: "media" as const, label: "Media", href: "/admin/media" },
    { id: "settings" as const, label: "Site settings", href: "/admin/settings" },
  ];

  return (
    <div className="min-h-screen bg-paper-2/50">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="font-mono text-xs uppercase tracking-[0.16em]">
              TEMIDAYO KUKOYI <span className="text-accent">/ CMS</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {email ? (
              <span className="hidden font-mono text-[11px] text-muted sm:block">{email}</span>
            ) : null}
            <Link
              href="/"
              className="text-xs text-muted underline underline-offset-4 hover:text-ink"
            >
              View site
            </Link>
            {isSupabaseConfigured ? <LogoutButton /> : null}
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1440px] gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[200px_1fr]">
        <nav aria-label="CMS" className="flex gap-2 lg:flex-col">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              aria-current={active === item.id ? "page" : undefined}
              className={`px-4 py-2.5 text-sm transition-colors ${
                active === item.id
                  ? "bg-ink font-medium text-paper"
                  : "border border-line bg-paper text-ink-2 hover:border-ink/40"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
