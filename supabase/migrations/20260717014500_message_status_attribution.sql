-- ============================================================
-- Message status attribution (2026-07-17)
-- Record WHICH admin moved a message to its current status/archive
-- state and when, so the Messages panel can show "Dealing with —
-- set by Kiya, 2 h ago". Stored as display text (no join needed).
-- Idempotent — safe to re-run.
-- ============================================================

alter table public.contact_messages
  add column if not exists status_by text,
  add column if not exists status_at timestamptz;

notify pgrst, 'reload schema';
