import { AdminShell } from "@/components/admin/AdminShell";
import { ProjectEditor } from "@/components/admin/ProjectEditor";
import { SetupNotice } from "@/components/admin/SetupNotice";
import { guardAdmin } from "@/lib/supabase/guard";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const { email, configured } = await guardAdmin();

  return (
    <AdminShell active="projects" email={email}>
      <p className="section-index">NEW PROJECT</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Create a case study</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        Start with the question and the story; media can follow. The project is
        created as a <strong className="font-medium text-ink">draft</strong> — nothing
        is public until you press Publish.
      </p>

      <div className="mt-8">
        {configured ? (
          <ProjectEditor initial={null} />
        ) : (
          <SetupNotice />
        )}
      </div>
    </AdminShell>
  );
}
