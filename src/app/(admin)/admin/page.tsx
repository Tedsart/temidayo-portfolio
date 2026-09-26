import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { SetupNotice } from "@/components/admin/SetupNotice";
import { ButtonLink, StatusBadge } from "@/components/ui/primitives";
import { getAdminStats, listAllProjectsForAdmin } from "@/lib/data/projects";
import { guardAdmin } from "@/lib/supabase/guard";
import { formatRelativeDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { email, configured } = await guardAdmin();

  if (!configured) {
    return (
      <AdminShell active="dashboard" email={null}>
        <SetupNotice />
      </AdminShell>
    );
  }

  const [stats, list] = await Promise.all([getAdminStats(), listAllProjectsForAdmin()]);
  const s = stats.data ?? { total: 0, published: 0, drafts: 0, featured: 0 };
  const projects = (list.data ?? []).slice(0, 6);

  const cards = [
    { label: "Total projects", value: s.total, href: "/admin/projects" },
    { label: "Published", value: s.published, href: "/admin/projects" },
    { label: "Drafts", value: s.drafts, href: "/admin/projects" },
    { label: "Featured", value: s.featured, href: "/admin/projects" },
  ];

  return (
    <AdminShell active="dashboard" email={email}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="section-index">DASHBOARD</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Content overview</h1>
        </div>
        <ButtonLink href="/admin/projects/new" variant="accent">
          Create new project
        </ButtonLink>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group bg-paper p-6 transition-colors hover:bg-paper-2"
          >
            <dt className="label-meta">{card.label}</dt>
            <dd className="mt-3 text-4xl font-semibold tracking-tight group-hover:text-accent">
              {card.value}
            </dd>
          </Link>
        ))}
      </dl>

      <div className="mt-10">
        <div className="flex items-baseline justify-between border-t border-ink pt-4">
          <h2 className="text-lg font-semibold">Recently updated</h2>
          <Link href="/admin/projects" className="text-sm underline underline-offset-4 hover:text-accent">
            All projects
          </Link>
        </div>

        <ul className="mt-4 divide-y divide-line border border-line">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/admin/projects/${project.id}/edit`}
                className="flex flex-wrap items-center justify-between gap-3 bg-paper px-5 py-4 transition-colors hover:bg-paper-2"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{project.title}</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    Updated {formatRelativeDate(project.updated_at)}
                  </span>
                </span>
                <StatusBadge status={project.status} />
              </Link>
            </li>
          ))}
          {projects.length === 0 ? (
            <li className="bg-paper px-5 py-8 text-sm text-muted">
              No projects yet — create the first one and it will appear here.
            </li>
          ) : null}
        </ul>
      </div>
    </AdminShell>
  );
}
