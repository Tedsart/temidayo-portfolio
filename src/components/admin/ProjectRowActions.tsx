"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteProject, setProjectStatus, toggleFeatured } from "@/actions/projects";
import type { ProjectStatus } from "@/lib/types";

interface RowProject {
  id: string;
  slug: string;
  status: ProjectStatus;
  featured: boolean;
  title: string;
}

/** Quick actions on the project list — publishing stays a deliberate click. */
export function ProjectRowActions({ project }: { project: RowProject }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const run = (task: () => Promise<unknown>) =>
    startTransition(async () => {
      await task();
      router.refresh();
    });

  const linkClass =
    "border border-line bg-paper px-3 py-1.5 text-xs hover:border-ink/40 hover:bg-paper-2 disabled:opacity-50";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/admin/projects/${project.id}/edit`}
        className={`${linkClass} font-medium`}
      >
        Edit
      </Link>
      <Link href={`/admin/projects/${project.id}/preview`} className={linkClass}>
        Preview
      </Link>

      {project.status === "published" ? (
        <button
          type="button"
          disabled={pending}
          className={linkClass}
          onClick={() => run(() => setProjectStatus(project.id, "draft"))}
        >
          Unpublish
        </button>
      ) : (
        <button
          type="button"
          disabled={pending}
          className="border border-positive/40 bg-positive/[0.08] px-3 py-1.5 text-xs text-positive hover:bg-positive hover:text-paper disabled:opacity-50"
          onClick={() => run(() => setProjectStatus(project.id, "published"))}
        >
          Publish
        </button>
      )}

      {project.status !== "archived" ? (
        <button
          type="button"
          disabled={pending}
          className={linkClass}
          onClick={() => run(() => setProjectStatus(project.id, "archived"))}
        >
          Archive
        </button>
      ) : null}

      <button
        type="button"
        disabled={pending}
        className={linkClass}
        aria-pressed={project.featured}
        onClick={() => run(() => toggleFeatured(project.id, !project.featured))}
      >
        {project.featured ? "Unfeature" : "Feature"}
      </button>

      <button
        type="button"
        disabled={pending}
        className="border border-danger/30 px-3 py-1.5 text-xs text-danger hover:bg-danger hover:text-paper disabled:opacity-50"
        onClick={() => {
          if (
            window.confirm(
              `Delete “${project.title}” permanently? Its uploads, findings and links are removed too.`,
            )
          ) {
            run(() => deleteProject(project.id));
          }
        }}
      >
        Delete
      </button>
    </div>
  );
}
