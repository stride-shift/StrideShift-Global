-- Fix infinite recursion: the previous profiles_admin_read_all policy
-- referenced public.profiles in its USING clause, which itself triggered the
-- policy, blowing up with 500s on every profiles SELECT.
--
-- Replace the inline EXISTS check with a SECURITY DEFINER function that
-- queries profiles WITHOUT re-entering RLS. All admin policies across the
-- schema now call this function instead.

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- ---------- profiles ----------
drop policy if exists "profiles_admin_read_all" on public.profiles;
create policy "profiles_admin_read_all" on public.profiles
  for select using (public.is_admin());
drop policy if exists "profiles_admin_update_all" on public.profiles;
create policy "profiles_admin_update_all" on public.profiles
  for update using (public.is_admin());

-- ---------- analytics_events ----------
drop policy if exists "analytics_admin_read" on public.analytics_events;
create policy "analytics_admin_read" on public.analytics_events
  for select using (public.is_admin());

-- ---------- newsletter_subscribers ----------
drop policy if exists "newsletter_admin_read" on public.newsletter_subscribers;
create policy "newsletter_admin_read" on public.newsletter_subscribers
  for select using (public.is_admin());

-- ---------- contact_messages ----------
drop policy if exists "contact_messages_admin_read" on public.contact_messages;
create policy "contact_messages_admin_read" on public.contact_messages
  for select using (public.is_admin());
drop policy if exists "contact_messages_admin_update" on public.contact_messages;
create policy "contact_messages_admin_update" on public.contact_messages
  for update using (public.is_admin());

-- ---------- site_settings ----------
drop policy if exists "site_settings_admin_write" on public.site_settings;
create policy "site_settings_admin_write" on public.site_settings
  for all using (public.is_admin());

-- ---------- site_content ----------
drop policy if exists "site_content_admin_write" on public.site_content;
create policy "site_content_admin_write" on public.site_content
  for all using (public.is_admin());

-- ---------- pending_invitations ----------
drop policy if exists "invitations_admin_all" on public.pending_invitations;
create policy "invitations_admin_all" on public.pending_invitations
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- admin_activity ----------
drop policy if exists "admin_activity_admin_read" on public.admin_activity;
create policy "admin_activity_admin_read" on public.admin_activity
  for select using (public.is_admin());
drop policy if exists "admin_activity_admin_insert" on public.admin_activity;
create policy "admin_activity_admin_insert" on public.admin_activity
  for insert with check (admin_id = auth.uid() and public.is_admin());

notify pgrst, 'reload schema';
