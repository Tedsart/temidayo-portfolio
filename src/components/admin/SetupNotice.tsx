export function SetupNotice() {
  return (
    <div className="border border-warning/30 bg-warning/[0.07] px-6 py-5">
      <h1 className="text-lg font-semibold text-warning">Supabase is not configured</h1>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink-2">
        <li>
          Create a project at supabase.com and copy{" "}
          <code className="font-mono text-xs">.env.example</code> to{" "}
          <code className="font-mono text-xs">.env.local</code> with your URL and keys.
        </li>
        <li>
          Run the SQL in <code className="font-mono text-xs">supabase/migrations</code>{" "}
          (tables, RLS policies and the storage bucket).
        </li>
        <li>
          Seed your admin account with{" "}
          <code className="font-mono text-xs">node scripts/seed-admin.mjs</code>.
        </li>
        <li>Sign in — everything on this screen becomes live.</li>
      </ol>
    </div>
  );
}
