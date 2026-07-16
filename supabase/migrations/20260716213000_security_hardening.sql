-- ============================================================
-- Security hardening (2026-07-16 audit)
--
-- H1  Privilege escalation: profiles_update_own had no column guard, so any
--     signed-in user could set their own is_admin = true and then read every
--     PII table (contact messages, subscriber emails, analytics). A trigger
--     now blocks is_admin changes unless the caller is already an admin —
--     with one exception: the very first admin claim while ZERO admins exist
--     (mirrors the dashboard's "claim first admin" flow, but enforced
--     server-side instead of client-side).
--
-- M4  Storage: the public `media` bucket accepted uploads from ANY
--     authenticated user. Writes are now admin-only.
--
-- Idempotent — safe to re-run in Supabase Studio → SQL Editor.
-- ============================================================

-- ---------- H1: block is_admin self-promotion ----------
create or replace function public.prevent_admin_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_admin is distinct from old.is_admin then
    -- Trusted paths bypass: service-role calls (edge functions) and direct
    -- SQL (Studio, psql) carry no 'authenticated' JWT.
    if coalesce(auth.jwt() ->> 'role', '') = 'authenticated' then
      -- Existing admins may grant/revoke. Anyone may claim admin ONLY while
      -- no admin exists yet (bootstrap of a fresh install).
      if not public.is_admin()
         and exists (select 1 from public.profiles where is_admin) then
        raise exception 'not authorised to change admin status';
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_admin_escalation on public.profiles;
create trigger trg_prevent_admin_escalation
  before update on public.profiles
  for each row execute function public.prevent_admin_escalation();

-- Belt & braces: the UPDATE policy also gets a WITH CHECK so a user can only
-- ever produce a row that still belongs to them.
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- ---------- M4: media bucket writes → admin only ----------
drop policy if exists "media_auth_insert" on storage.objects;
drop policy if exists "media_admin_insert" on storage.objects;
create policy "media_admin_insert" on storage.objects
  for insert with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_auth_update" on storage.objects;
drop policy if exists "media_admin_update" on storage.objects;
create policy "media_admin_update" on storage.objects
  for update using (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_admin_delete" on storage.objects;
create policy "media_admin_delete" on storage.objects
  for delete using (bucket_id = 'media' and public.is_admin());
