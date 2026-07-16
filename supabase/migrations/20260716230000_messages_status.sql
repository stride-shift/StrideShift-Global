-- ============================================================
-- Messages workflow columns (2026-07-16)
--
-- Adds triage workflow state to contact_messages so the admin
-- Messages panel can track new / in_progress / done, archive
-- handled messages, and attribute enquiries to their referrer
-- (LinkedIn, Facebook, Google, …) captured at submit time.
--
-- Idempotent — safe to re-run in Supabase Studio → SQL Editor.
-- ============================================================

alter table public.contact_messages
  add column if not exists status text not null default 'new',
  add column if not exists archived_at timestamptz,
  add column if not exists referrer text;

-- Keep status within the known workflow values.
alter table public.contact_messages
  drop constraint if exists contact_messages_status_check;
alter table public.contact_messages
  add constraint contact_messages_status_check
  check (status in ('new', 'in_progress', 'done'));

create index if not exists contact_messages_status_idx
  on public.contact_messages (status);

notify pgrst, 'reload schema';
