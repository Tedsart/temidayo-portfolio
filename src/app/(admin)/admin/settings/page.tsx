import { AdminShell } from "@/components/admin/AdminShell";
import { SetupNotice } from "@/components/admin/SetupNotice";
import { SiteSettingsForm } from "@/components/admin/SiteSettingsForm";
import {
  getSiteSettingsForAdmin,
  listAllAssets,
} from "@/lib/data/projects";
import { guardAdmin } from "@/lib/supabase/guard";

export const dynamic = "force-dynamic";

export const metadata = { title: "Site settings · CMS" };

export default async function AdminSettingsPage() {
  const { email, configured } = await guardAdmin();

  if (!configured) {
    return (
      <AdminShell active="settings" email={null}>
        <SetupNotice />
      </AdminShell>
    );
  }

  const [settings, assets] = await Promise.all([
    getSiteSettingsForAdmin(),
    listAllAssets(),
  ]);

  const cv =
    (assets.data ?? []).find((a) => a.asset_type === "cv") ?? null;

  return (
    <AdminShell active="settings" email={email}>
      <div className="mb-8">
        <p className="section-index">SITE SETTINGS</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          About, contact &amp; CV
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          Everything the public About and Contact sections show — your intro,
          statistics background, experience, interests, CV download and social
          links. Empty fields are hidden on the site; nothing placeholder-ish
          is ever shown to visitors.
        </p>
      </div>

      <SiteSettingsForm
        initial={settings.data ?? null}
        initialCv={cv}
      />
    </AdminShell>
  );
}
