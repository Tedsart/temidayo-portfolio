import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseStudy } from "@/components/public/CaseStudy";
import { getNextPublishedProject, getProjectById } from "@/lib/data/projects";
import { guardAdmin } from "@/lib/supabase/guard";

export const dynamic = "force-dynamic";

/**
 * Draft preview: the exact public design, behind the admin session.
 * Unpublished content never leaves this route for anonymous visitors.
 */
export default async function PreviewProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await guardAdmin();
  const { id } = await params;

  const result = await getProjectById(id);
  const project = result.data;
  if (!project) notFound();

  const next = await getNextPublishedProject(project.slug);

  return (
    <div className="min-h-screen bg-paper">
      <div className="sticky top-0 z-50 border-b border-line bg-paper-inverse text-paper">
        <div className="mx-auto flex w-full max-w-[1360px] flex-wrap items-center justify-between gap-3 px-5 py-2.5 sm:px-8 lg:px-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-paper/70">
            Preview · {project.status} · visitors cannot see this page
          </p>
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/projects/${project.id}/edit`}
              className="text-xs text-paper/80 underline underline-offset-4 hover:text-paper"
            >
              Back to editor
            </Link>
            <Link href="/admin/projects" className="text-xs text-paper/80 underline underline-offset-4 hover:text-paper">
              All projects
            </Link>
          </div>
        </div>
      </div>

      <CaseStudy project={project} usingFallback={result.usingFallback} nextProject={next.data} />
    </div>
  );
}
