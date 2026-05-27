#!/usr/bin/env node
/**
 * One-shot: point Supabase Auth at Resend SMTP and install the StrideShift
 * branded email templates via the Supabase Management API.
 *
 * Required env vars:
 *   SUPABASE_ACCESS_TOKEN  — Personal access token (supabase.com → account → access tokens)
 *   SUPABASE_PROJECT_REF   — project ref (default: read from .env's VITE_SUPABASE_URL)
 *   RESEND_API_KEY         — Resend API key (read from .env if present)
 *   SUPABASE_SMTP_SENDER   — verified sender, e.g. hello@strideshift.ai (default: noreply@<resend-default>)
 *   SUPABASE_SMTP_NAME     — sender display name (default: 'StrideShift')
 *
 * Run: `node scripts/configure-supabase-emails.mjs`
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TEMPLATES_DIR = join(ROOT, 'supabase', 'email-templates');

// Pull .env so RESEND_API_KEY / VITE_SUPABASE_URL show up.
try {
  const envText = readFileSync(join(ROOT, '.env'), 'utf8');
  for (const line of envText.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
} catch {
  /* .env not present — that's fine */
}

const PAT = process.env.SUPABASE_ACCESS_TOKEN;
const RESEND_KEY = process.env.RESEND_API_KEY;
const SENDER = process.env.SUPABASE_SMTP_SENDER || 'onboarding@resend.dev';
const SENDER_NAME = process.env.SUPABASE_SMTP_NAME || 'StrideShift';
const URL_BASE = process.env.VITE_SUPABASE_URL;

let PROJECT_REF = process.env.SUPABASE_PROJECT_REF;
if (!PROJECT_REF && URL_BASE) {
  // https://<ref>.supabase.co
  PROJECT_REF = new URL(URL_BASE).hostname.split('.')[0];
}

if (!PAT) {
  console.error('✗ Missing SUPABASE_ACCESS_TOKEN.');
  console.error('  Create one at https://supabase.com/dashboard/account/tokens');
  console.error('  Then run:  SUPABASE_ACCESS_TOKEN=sbp_... node scripts/configure-supabase-emails.mjs');
  process.exit(1);
}
if (!RESEND_KEY) {
  console.error('✗ Missing RESEND_API_KEY in .env');
  process.exit(1);
}
if (!PROJECT_REF) {
  console.error('✗ Could not determine SUPABASE_PROJECT_REF from VITE_SUPABASE_URL.');
  process.exit(1);
}

console.log(`Configuring Supabase project: ${PROJECT_REF}`);
console.log(`Sender: ${SENDER_NAME} <${SENDER}>\n`);

const headers = {
  Authorization: `Bearer ${PAT}`,
  'Content-Type': 'application/json',
};

// Read the 6 baked HTML templates.
const read = (name) => readFileSync(join(TEMPLATES_DIR, name), 'utf8');
const tmpls = {
  recovery: read('recovery.html'),
  confirmation: read('confirmation.html'),
  invite: read('invite.html'),
  magic_link: read('magic_link.html'),
  email_change: read('email_change.html'),
  reauthentication: read('reauthentication.html'),
};

// PATCH the Auth config: SMTP + templates + subjects.
// Field names per https://supabase.com/docs/reference/api/v1-update-a-config
const body = {
  smtp_admin_email: SENDER,
  smtp_host: 'smtp.resend.com',
  smtp_port: '465',
  smtp_user: 'resend',
  smtp_pass: RESEND_KEY,
  smtp_sender_name: SENDER_NAME,
  smtp_max_frequency: 1,

  mailer_subjects_recovery: 'Reset your StrideShift password',
  mailer_subjects_confirmation: 'Confirm your StrideShift account',
  mailer_subjects_invite: 'You’re invited to StrideShift',
  mailer_subjects_magic_link: 'Your StrideShift sign-in link',
  mailer_subjects_email_change: 'Confirm your new StrideShift email',
  mailer_subjects_reauthentication: 'Confirm it’s really you',

  mailer_templates_recovery_content: tmpls.recovery,
  mailer_templates_confirmation_content: tmpls.confirmation,
  mailer_templates_invite_content: tmpls.invite,
  mailer_templates_magic_link_content: tmpls.magic_link,
  mailer_templates_email_change_content: tmpls.email_change,
  mailer_templates_reauthentication_content: tmpls.reauthentication,
};

const endpoint = `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`;
const res = await fetch(endpoint, {
  method: 'PATCH',
  headers,
  body: JSON.stringify(body),
});

if (!res.ok) {
  const text = await res.text();
  console.error(`✗ Update failed (${res.status} ${res.statusText})`);
  console.error(text);
  process.exit(1);
}

console.log('✓ Auth SMTP + templates pushed to Supabase.\n');
console.log('Next:');
console.log("  1. In Resend → Domains, verify the domain of your sender email");
console.log(`     (currently ${SENDER}). If it isn't verified, Resend will refuse.`);
console.log('  2. Trigger a "Forgot password" from the sign-in page to test.');
console.log('  3. Adjust subjects / copy in supabase/email-templates/_shell.html');
console.log('     and re-run scripts/build-email-templates.mjs then this script.');
