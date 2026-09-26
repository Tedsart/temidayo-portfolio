import { AdminShell } from "@/components/admin/AdminShell";
import { MediaLibraryClient } from "@/components/admin/MediaLibraryClient";
import { SetupNotice } from "@/components/admin/SetupNotice";
import { listAllAssets } from "@/lib/data/projects";
import { guardAdmin } from "@/lib/supabase/guard";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const { email, configured } = await guardAdmin();

  if (!configured) {
    return (
      <AdminShell active="media" email={null}>
        <SetupNotice />
      </AdminShell>
    );
  }

  const result = await listAllAssets();

  return (
    <AdminShell active="media" email={email}>
      <p className="section-index">MEDIA</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Media library</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        Everything uploaded to the portfolio in one place. Site-level assets — the
        profile photo and the CV — are uploaded here; project media lives inside
        each project editor.
      </p>

      <div className="mt-8">
        <MediaLibraryClient assets={result.data ?? []} />
      </div>
    </AdminShell>
  );
}
