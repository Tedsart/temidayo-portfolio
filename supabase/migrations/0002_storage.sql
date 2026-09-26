-- =============================================================================
-- 0002_storage.sql · the `content` bucket and its storage policies
--
-- Media is served publicly through the bucket's public URL (so next/image and
-- the CDN can cache it). WRITES are restricted to administrators, so nothing
-- can be uploaded, replaced or deleted anonymously — even though the files
-- themselves are readable.
--
-- Path convention (enforced by the upload helper in src/lib/supabase/media.ts):
--   projects/<project-id>/<date>-<rand>-<file>
--   site/<date>-<rand>-<file>
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit)
values ('content', 'content', true, 26214400)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit;

-- Public read of every object in the bucket.
drop policy if exists "content_public_read" on storage.objects;
create policy "content_public_read"
  on storage.objects for select
  using (bucket_id = 'content');

-- Admins may upload anywhere in the bucket.
drop policy if exists "content_admin_insert" on storage.objects;
create policy "content_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'content' and public.is_admin());

-- Admins may overwrite (the storage API upserts with the same key).
drop policy if exists "content_admin_update" on storage.objects;
create policy "content_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'content' and public.is_admin())
  with check (bucket_id = 'content' and public.is_admin());

-- Admins may delete their own uploads.
drop policy if exists "content_admin_delete" on storage.objects;
create policy "content_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'content' and public.is_admin());
