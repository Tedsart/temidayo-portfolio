import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProjectEditor } from "@/components/admin/ProjectEditor";
import { SetupNotice } from "@/components/admin/SetupNotice";
import { getProjectById } from "@/lib/data/projects";
import { guardAdmin } from "@/lib/supabase/guard";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { email, configured } = await guardAdmin();
  const { id } = await params;

  if (!configured) {
    return (
      <AdminShell active="projects" email={null}>
        <SetupNotice />
      </AdminShell>
    );
  }

  const result = await getProjectById(id);
  if (!result.data) notFound();

  return (
    <AdminShell active="projects" email={email}>
      <p className="section-index">EDIT PROJECT</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{result.data.title}</h1>

      <div className="mt-8">
        <ProjectEditor initial={result.data} />
      </div>
    </AdminShell>
  );
}
