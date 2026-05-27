#!/usr/bin/env node
/**
 * Wipe the Supabase site_settings row so DEFAULT_SETTINGS in code becomes
 * the source of truth. Uses the Management API SQL endpoint with the PAT
 * (set SUPABASE_ACCESS_TOKEN), no service-role key needed.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
try {
  const env = readFileSync(join(ROOT, '.env'), 'utf8');
  for (const line of env.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
} catch {}

const PAT = process.env.SUPABASE_ACCESS_TOKEN;
const URL_BASE = process.env.VITE_SUPABASE_URL;
if (!PAT || !URL_BASE) {
  console.error('Missing SUPABASE_ACCESS_TOKEN or VITE_SUPABASE_URL');
  process.exit(1);
}
const ref = new URL(URL_BASE).hostname.split('.')[0];

const sql = `update public.site_settings set data = '{}'::jsonb, updated_at = now() where id = 1;`;
const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${PAT}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: sql }),
});
if (!res.ok) {
  console.error('✗', res.status, res.statusText, await res.text());
  process.exit(1);
}
console.log('✓ site_settings.data cleared. Refresh the site to pick up new defaults.');
