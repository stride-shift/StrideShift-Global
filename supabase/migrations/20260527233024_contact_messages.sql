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

notify pgrst, 'reload schema';
