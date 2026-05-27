#!/usr/bin/env node
/** Quick diag — counts rows in messages + subscribers using the SR key. */
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

const supa = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

console.log('Checking tables with service-role key…\n');

const { data: subs, error: e1 } = await supa
  .from('newsletter_subscribers')
  .select('*')
  .order('created_at', { ascending: false });
if (e1) console.error('newsletter_subscribers ERROR:', e1.message);
else {
  console.log(`newsletter_subscribers: ${subs.length} rows`);
  subs.slice(0, 5).forEach((s) =>
    console.log(`  • ${s.email}  (${s.source ?? '—'}, ${s.created_at})`)
  );
  if (subs.length > 5) console.log(`  …and ${subs.length - 5} more`);
}

const { data: msgs, error: e2 } = await supa
  .from('contact_messages')
  .select('*')
  .order('created_at', { ascending: false });
if (e2) console.error('\ncontact_messages ERROR:', e2.message);
else {
  console.log(`\ncontact_messages: ${msgs.length} rows`);
  msgs.slice(0, 5).forEach((m) =>
    console.log(`  • ${m.first_name} ${m.last_name} <${m.email}>: ${m.message.slice(0, 50)}`)
  );
}
