/**
 * Seeds the CMS administrator.
 *
 *   ADMIN_EMAILS=you@example.com ADMIN_PASSWORD=... node scripts/seed-admin.mjs
 *
 * What it does (service-role key required, server only):
 *   1. Ensures each ADMIN_EMAILS entry exists in Supabase Auth with the given
 *      password (email auto-confirmed). Skipped when the user already exists.
 *   2. Mirrors each email into public.admin_users, which is what the RLS
 *      policies actually check.
 *
 * Run it from the project root with .env.local present, or pass env inline.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function env(name) {
  if (process.env[name]) return process.env[name].trim();
  // Fall back to .env.local values when run bare.
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    const match = raw.match(new RegExp(`^${name}=(.*)$`, "m"));
    return match ? match[1].trim().replace(/^["']|["']$/g, "") : "";
  } catch {
    return "";
  }
}

const url = env("NEXT_PUBLIC_SUPABASE_URL");
const serviceKey = env("SUPABASE_SERVICE_ROLE_KEY");
const emails = (env("ADMIN_EMAILS") || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);
const password = env("ADMIN_PASSWORD");

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}
if (!emails.length) {
  console.error("Set ADMIN_EMAILS=you@example.com (comma separated).");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

for (const email of emails) {
  // 1. Auth user
  const { data: listed } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existing = (listed?.users ?? []).find((u) => (u.email ?? "").toLowerCase() === email);

  let userId = existing?.id ?? null;

  if (!userId) {
    if (!password || password.length < 8) {
      console.error(`No auth user for ${email} and ADMIN_PASSWORD missing/short (min 8).`);
      process.exit(1);
    }
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) {
      console.error(`Could not create auth user for ${email}: ${error.message}`);
      process.exit(1);
    }
    userId = data.user?.id ?? null;
    console.log(`✓ auth user created for ${email}`);
  } else {
    console.log(`• auth user already exists for ${email}`);
  }

  // 2. admin_users membership (what RLS checks)
  const { error: upsertError } = await admin
    .from("admin_users")
    .upsert({ email }, { onConflict: "email" });

  if (upsertError) {
    console.error(`Could not grant admin membership to ${email}: ${upsertError.message}`);
    process.exit(1);
  }
  console.log(`✓ ${email} is now a CMS administrator (user ${userId})`);
}

console.log("\nDone. Sign in at /admin/login.");
