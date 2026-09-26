#!/usr/bin/env bash
# One-shot connection of the portfolio to a real Supabase project.
# Reads values from environment (pasted securely into the session):
#   SUPA_URL, SUPA_ANON, SUPA_SERVICE, DB_URI, ADMIN_EMAIL, ADMIN_PASSWORD
set -euo pipefail
cd "$(dirname "$0")/.."

echo "── writing .env.local ──"
cat > .env.local <<ENV
NEXT_PUBLIC_SUPABASE_URL=${SUPA_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPA_ANON}
SUPABASE_SERVICE_ROLE_KEY=${SUPA_SERVICE}
NEXT_PUBLIC_SITE_URL=${SITE_URL:-http://localhost:3000}
CONTACT_EMAIL=${CONTACT_EMAIL:-}
ENV

echo "── applying 0001_init.sql ──"
psql "${DB_URI}" -v ON_ERROR_STOP=1 -f supabase/migrations/0001_init.sql

echo "── applying 0002_storage.sql ──"
psql "${DB_URI}" -v ON_ERROR_STOP=1 -f supabase/migrations/0002_storage.sql

echo "── seeding admin account ──"
ADMIN_EMAILS="${ADMIN_EMAIL}" ADMIN_PASSWORD="${ADMIN_PASSWORD}" \
  node scripts/seed-admin.mjs

echo "── done: restart the app server to pick up .env.local ──"
