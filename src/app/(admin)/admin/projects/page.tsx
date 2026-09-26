import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProjectRowActions } from "@/components/admin/ProjectRowActions";
import { SetupNotice } from "@/components/admin/SetupNotice";
import { AssetImage } from "@/components/public/AssetImage";
import { ButtonLink, EmptyState, StatusBadge } from "@/components/ui/primitives";
import { listAllProjectsForAdmin } from "@/lib/data/projects";
import { guardAdmin } from "@/lib/supabase/guard";
import { formatRelativeDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const { email, configured } = await guardAdmin();

  if (!configured) {
    return (
      <AdminShell active="projects" email={null}>
        <SetupNotice />
      </AdminShell>
    );
  }

  const result = await listAllProjectsForAdmin();
  const projects = result.data ?? [];

  return (
    <AdminShell active="projects" email={email}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="section-index">PROJECTS</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">All projects</h1>
          <p className="mt-2 text-sm text-muted">
            Drafts stay private until you publish. Archiving hides a project without
            deleting it.
          </p>
        </div>
        <ButtonLink href="/admin/projects/new" variant="accent">
          Create new project
        </ButtonLink>
      </div>

      <div className="mt-8">
        {projects.length ? (
          <ul className="divide-y divide-line border border-line bg-paper">
            {projects.map((project) => (
              <li
                key={project.id}
                className="grid gap-4 px-5 py-4 sm:grid-cols-[64px_1fr_auto] sm:items-center"
              >
                <AssetImage
                  src={project.thumbnail?.public_url}
                  alt=""
                  aspect="1/1"
                  sizes="64px"
                  className="hidden h-16 w-16 sm:block"
                />
                <div className="min-w-0">
                  <Link
                    href={`/admin/projects/${project.id}/edit`}
                    className="block truncate font-medium hover:text-accent"
                  >
                    {project.title}
                  </Link>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted">
                    <StatusBadge status={project.status} />
                    {project.featured ? (
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
                        ★ Featured
                      </span>
                    ) : null}
                    <span>Updated {formatRelativeDate(project.updated_at)}</span>
                    <span className="hidden font-mono text-[10px] text-faint md:inline">
                      /work/{project.slug}
                    </span>
                  </div>
                </div>
                <ProjectRowActions
                  project={{
                    id: project.id,
                    slug: project.slug,
                    status: project.status,
                    featured: project.featured,
                    title: project.title,
                  }}
                />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No projects yet."
            description="Your first case study starts with a title and a question — media can come later."
            action={
              <ButtonLink href="/admin/projects/new" variant="accent">
                Create new project
              </ButtonLink>
            }
          />
        )}
      </div>
    </AdminShell>
  );
}
