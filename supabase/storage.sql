-- ============================================================
-- StrideShift — STEP 2 of 2 : image-upload storage bucket
-- Run this in Supabase Studio → SQL Editor → New query → Run,
-- AFTER migration.sql has succeeded.
--
-- If this errors with "must be owner of table objects", skip it and
-- instead create the bucket from the dashboard:
--   Storage → New bucket → name: media → Public bucket: ON → Save
-- (everything except image upload still works without this file).
-- ============================================================

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "media_auth_insert" on storage.objects;
create policy "media_auth_insert" on storage.objects
  for insert with check (bucket_id = 'media' and auth.role() = 'authenticated');

drop policy if exists "media_auth_update" on storage.objects;
create policy "media_auth_update" on storage.objects
  for update using (bucket_id = 'media' and auth.role() = 'authenticated');

-- ============================================================
-- STEP 2 DONE. Image uploads in the admin dashboard now work.
-- ============================================================
