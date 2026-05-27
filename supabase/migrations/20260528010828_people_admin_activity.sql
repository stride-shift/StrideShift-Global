-- ---------- profiles: add display_name + last_seen_at ----------
alter table public.profiles
  add column if not exists display_name text,
  add column if not exists last_seen_at timestamptz;

-- Admins can see and update OTHER profiles too (not just their own).
drop policy if exists "profiles_admin_read_all" on public.profiles;
create policy "profiles_admin_read_all" on public.profiles
  for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
drop policy if exists "profiles_admin_update_all" on public.profiles;
create policy "profiles_admin_update_all" on public.profiles
  for update using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- ---------- pending_invitations ----------
-- Admin enters an email + role; when that user signs up via /sign-up
-- the matching row is consumed and their profile.is_admin is set.
create table if not exists public.pending_invitations (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  is_admin    boolean not null default false,
  display_name text,
  invited_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  consumed_at timestamptz
);
alter table public.pending_invitations enable row level security;

drop policy if exists "invitations_admin_all" on public.pending_invitations;
create policy "invitations_admin_all" on public.pending_invitations
  for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- Sign-up trigger consumes the matching invitation (if any) when a new
-- auth user lands. Replaces the existing handle_new_user trigger.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  inv record;
begin
  -- Pick up any pending invite by email
  select * into inv from public.pending_invitations where email = new.email and consumed_at is null limit 1;

  insert into public.profiles (id, email, full_name, display_name, is_admin)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    coalesce(inv.display_name, new.raw_user_meta_data->>'full_name'),
    coalesce(inv.is_admin, false)
  )
  on conflict (id) do update set
    display_name = coalesce(excluded.display_name, public.profiles.display_name),
    is_admin = coalesce(excluded.is_admin, public.profiles.is_admin);

  if inv.id is not null then
    update public.pending_invitations set consumed_at = now() where id = inv.id;
  end if;

  return new;
end;
$$;

-- ---------- admin_activity ----------
-- Audit log — every meaningful admin action lands here so you can tell
-- which admin did what.
create table if not exists public.admin_activity (
  id          bigserial primary key,
  admin_id    uuid references public.profiles(id) on delete set null,
  action      text not null,
  resource    text,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists admin_activity_created_idx
  on public.admin_activity (created_at desc);
create index if not exists admin_activity_admin_idx
  on public.admin_activity (admin_id, created_at desc);

alter table public.admin_activity enable row level security;

-- Anyone who is admin can read the log
drop policy if exists "admin_activity_admin_read" on public.admin_activity;
create policy "admin_activity_admin_read" on public.admin_activity
  for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- Admins insert their own rows
drop policy if exists "admin_activity_admin_insert" on public.admin_activity;
create policy "admin_activity_admin_insert" on public.admin_activity
  for insert with check (
    admin_id = auth.uid()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

notify pgrst, 'reload schema';
