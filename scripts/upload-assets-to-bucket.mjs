#!/usr/bin/env node
/**
 * Push everything in /public/clients, /public/features, /public/testimonials,
 * /public/contact.mp4 etc. into the Supabase `media` bucket so the production
 * site can serve them from the CDN instead of the static /public folder.
 *
 * USAGE:
 *   1. Make sure Supabase migration.sql + storage.sql have been run.
 *   2. Run from the project root:
 *        node scripts/upload-assets-to-bucket.mjs
 *
 * The script reads VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY from .env. If
 * the bucket's RLS only allows `authenticated` insert (the default), pass
 * SUPABASE_SERVICE_ROLE_KEY in the environment to bypass RLS:
 *        SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/upload-assets-to-bucket.mjs
 *
 * Walks /public recursively, uploads every image/video with upsert=true, and
 * prints the public URL for each file.
 */
import { readdir, readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { extname, join, posix, relative, sep, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(SCRIPT_DIR, '..');

// Minimal .env loader so the script needs no extra deps.
try {
  const envText = readFileSync(join(PROJECT_ROOT, '.env'), 'utf8');
  for (const line of envText.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
} catch {
  /* .env not found — that's fine, env vars may be set externally. */
}

const PUBLIC_DIR = join(PROJECT_ROOT, 'public');
const BUCKET = 'media';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const USING_SR = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('✗ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

console.log(
  `Using ${USING_SR ? 'service-role' : 'anon'} key. URL: ${SUPABASE_URL}\n`
);

const supa = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

const MIME = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
};

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

let uploaded = 0;
let skipped = 0;
let failed = 0;
const failedFiles = [];

for await (const filePath of walk(PUBLIC_DIR)) {
  const ext = extname(filePath).toLowerCase();
  const mime = MIME[ext];
  if (!mime) {
    skipped++;
    continue;
  }
  const relPath = relative(PUBLIC_DIR, filePath).split(sep).join(posix.sep);
  const buf = await readFile(filePath);
  const size = (buf.length / 1024).toFixed(1);

  const { error } = await supa.storage.from(BUCKET).upload(relPath, buf, {
    contentType: mime,
    upsert: true,
  });

  if (error) {
    console.error(`✗ ${relPath} — ${error.message}`);
    failed++;
    failedFiles.push(relPath);
  } else {
    const { data } = supa.storage.from(BUCKET).getPublicUrl(relPath);
    console.log(`✓ ${relPath}  (${size} KB)  →  ${data.publicUrl}`);
    uploaded++;
  }
}

console.log(
  `\nDone — ${uploaded} uploaded, ${skipped} skipped (non-media), ${failed} failed.`
);
if (failed > 0 && !USING_SR) {
  console.log(
    '\nAll failures likely RLS — anon key cannot insert into the media bucket.\n' +
      'Either:\n' +
      '  • Re-run with SUPABASE_SERVICE_ROLE_KEY=<key> in the env, OR\n' +
      '  • Loosen the policy temporarily in Supabase Studio:\n' +
      '      drop policy if exists "media_public_insert" on storage.objects;\n' +
      '      create policy "media_public_insert" on storage.objects\n' +
      '        for insert with check (bucket_id = \'media\');'
  );
}
process.exit(failed > 0 ? 1 : 0);
