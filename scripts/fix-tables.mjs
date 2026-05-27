#!/usr/bin/env node
/**
 * One-shot fixer:
 *  1. Lists all admin profiles so we know who can read RLS-protected tables.
 *  2. Creates the contact_messages table + RLS policies via pg-meta endpoint.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const PROJECT_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const envText = readFileSync(join(PROJECT_ROOT, '.env'), 'utf8');
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
}

const URL_BASE = process.env.VITE_SUPABASE_URL;
const SR_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supa = createClient(URL_BASE, SR_KEY, { auth: { persistSession: false } });

// 1) Show all admins
console.log('— profiles with is_admin = true —');
const { data: admins, error: aErr } = await supa
  .from('profiles')
  .select('id, email, is_admin, created_at')
  .eq('is_admin', true);
if (aErr) console.error('  ERROR:', aErr.message);
else {
  if (admins.length === 0) console.log('  (none — that is why admin panel reads return empty)');
  admins.forEach((a) => console.log(`  • ${a.email}  ${a.id}`));
}

console.log('\n— all profiles (top 5) —');
const { data: all } = await supa
  .from('profiles')
  .select('id, email, is_admin')
  .limit(5);
all?.forEach((a) => console.log(`  • ${a.email}  is_admin=${a.is_admin}  ${a.id}`));

// 2) Create contact_messages via pg-meta query endpoint
const sql = `
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
`;

console.log('\n— attempting to create contact_messages via pg-meta —');
const ref = new URL(URL_BASE).hostname.split('.')[0];
const endpoints = [
  `${URL_BASE}/pg-meta/default/query`,
  `https://api.supabase.com/v1/projects/${ref}/database/query`,
];

let created = false;
for (const ep of endpoints) {
  try {
    const res = await fetch(ep, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SR_KEY,
        Authorization: `Bearer ${SR_KEY}`,
      },
      body: JSON.stringify({ query: sql }),
    });
    if (res.ok) {
      console.log(`  ✓ ran via ${ep}`);
      created = true;
      break;
    } else {
      console.log(`  ✗ ${ep} → ${res.status} ${res.statusText}`);
    }
  } catch (e) {
    console.log(`  ✗ ${ep} → ${e.message}`);
  }
}

if (!created) {
  console.log('\nNo DDL endpoint accepted the service-role key. Paste this in Supabase Studio:\n');
  console.log(sql);
}
