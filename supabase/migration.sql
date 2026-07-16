-- ============================================================
-- StrideShift — STEP 1 of 2 : database tables
-- Run this WHOLE file in Supabase Studio → SQL Editor → New query → Run.
-- Idempotent (safe to re-run). This file alone cannot fail on storage
-- permissions — storage lives in step 2 (storage.sql).
-- ============================================================

-- ---------- profiles ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);
-- NOTE: is_admin changes are additionally guarded by the
-- trg_prevent_admin_escalation trigger — see
-- migrations/20260716213000_security_hardening.sql (run it after this file).

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- analytics_events ----------
create table if not exists public.analytics_events (
  id          bigserial primary key,
  created_at  timestamptz not null default now(),
  path        text not null,
  event       text not null,
  target      text,
  referrer    text,
  session_id  text,
  user_agent  text,
  country     text
);
create index if not exists analytics_created_idx on public.analytics_events (created_at desc);
alter table public.analytics_events enable row level security;

drop policy if exists "analytics_public_insert" on public.analytics_events;
create policy "analytics_public_insert" on public.analytics_events
  for insert with check (true);
drop policy if exists "analytics_admin_read" on public.analytics_events;
create policy "analytics_admin_read" on public.analytics_events
  for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- ---------- contact_messages ----------
create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  first_name  text not null,
  last_name   text not null,
  email       text not null,
  company     text,
  message     text not null,
  source      text,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists contact_messages_created_idx on public.contact_messages (created_at desc);
alter table public.contact_messages enable row level security;

drop policy if exists "contact_messages_public_insert" on public.contact_messages;
create policy "contact_messages_public_insert" on public.contact_messages
  for insert with check (true);
drop policy if exists "contact_messages_admin_read" on public.contact_messages;
create policy "contact_messages_admin_read" on public.contact_messages
  for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
drop policy if exists "contact_messages_admin_update" on public.contact_messages;
create policy "contact_messages_admin_update" on public.contact_messages
  for update using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- ---------- newsletter_subscribers ----------
create table if not exists public.newsletter_subscribers (
  id              uuid primary key default gen_random_uuid(),
  email           text not null unique,
  consent_at      timestamptz,
  source          text,
  unsubscribed_at timestamptz,
  created_at      timestamptz not null default now()
);
alter table public.newsletter_subscribers enable row level security;

drop policy if exists "newsletter_public_insert" on public.newsletter_subscribers;
create policy "newsletter_public_insert" on public.newsletter_subscribers
  for insert with check (true);
drop policy if exists "newsletter_admin_read" on public.newsletter_subscribers;
create policy "newsletter_admin_read" on public.newsletter_subscribers
  for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- ---------- site_settings (landing template, hero image, copy) ----------
create table if not exists public.site_settings (
  id          int primary key default 1,
  updated_at  timestamptz not null default now()
);
-- The React app stores everything in a JSON blob column:
alter table public.site_settings add column if not exists data jsonb not null default '{}'::jsonb;
insert into public.site_settings (id, data) values (1, '{}'::jsonb)
  on conflict (id) do nothing;
alter table public.site_settings enable row level security;

drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read" on public.site_settings
  for select using (true);
drop policy if exists "site_settings_admin_write" on public.site_settings;
create policy "site_settings_admin_write" on public.site_settings
  for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- ---------- site_content (testimonials, team, editable page copy) ----------
create table if not exists public.site_content (
  id          text primary key,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);
alter table public.site_content enable row level security;

drop policy if exists "site_content_public_read" on public.site_content;
create policy "site_content_public_read" on public.site_content
  for select using (true);
drop policy if exists "site_content_admin_write" on public.site_content;
create policy "site_content_admin_write" on public.site_content
  for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- ---------- site_layout (visual editor: section order, visibility, styles) ----------
create table if not exists public.site_layout (
  id          text primary key,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);
alter table public.site_layout enable row level security;

drop policy if exists "site_layout_public_read" on public.site_layout;
create policy "site_layout_public_read" on public.site_layout
  for select using (true);
drop policy if exists "site_layout_admin_write" on public.site_layout;
create policy "site_layout_admin_write" on public.site_layout
  for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- Tell PostgREST to reload its schema cache immediately.
notify pgrst, 'reload schema';

-- ============================================================
-- STEP 1 DONE.  Now run storage.sql (STEP 2) for image uploads.
-- ============================================================
