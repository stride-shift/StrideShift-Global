#!/usr/bin/env node
/**
 * Bake the StrideShift-branded email shell into the six Supabase auth
 * templates. Reads `supabase/email-templates/_shell.html`, substitutes the
 * placeholders for each template variant, and writes the result alongside.
 *
 * Run: `node scripts/build-email-templates.mjs`
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'supabase', 'email-templates');
const shell = readFileSync(join(DIR, '_shell.html'), 'utf8');

// Each Supabase auth template injects the magic `{{ .ConfirmationURL }}`
// (and sometimes `{{ .Email }}`, `{{ .Token }}`, etc). We keep those Go
// template tokens intact so Supabase substitutes them at send time.
const TEMPLATES = {
  // type: { filename, title, headline, body, cta, note, preheader }
  recovery: {
    file: 'recovery.html',
    title: 'Password reset',
    headline: 'Set a new password',
    body:
      "We received a request to reset the password on your StrideShift account. " +
      "Click the button below to choose a new one. If you didn't ask for this, " +
      'you can safely ignore this email — your password stays the same.',
    cta: 'Reset password',
    note:
      'For your security, this link expires in 60 minutes. ' +
      'If it stops working, just request another reset from the sign-in page.',
    preheader: 'Reset your StrideShift password.',
  },
  confirmation: {
    file: 'confirmation.html',
    title: 'Confirm your account',
    headline: 'Welcome to StrideShift',
    body:
      "You're almost in. Click the button below to confirm your email and " +
      "activate your StrideShift account. Once you're verified, you can sign " +
      'in and pick up where you left off.',
    cta: 'Confirm email',
    note:
      "Didn't sign up? You can ignore this email — no account will be created " +
      'until the link is clicked.',
    preheader: 'Confirm your email to activate your StrideShift account.',
  },
  invite: {
    file: 'invite.html',
    title: "You're invited",
    headline: 'Join your team on StrideShift',
    body:
      "Someone from your team has invited you to collaborate on StrideShift. " +
      'Click below to set your password and get started.',
    cta: 'Accept invitation',
    note:
      "This invitation expires in 7 days. If it lapses, ask whoever invited you " +
      'to send a fresh one.',
    preheader: "You've been invited to StrideShift.",
  },
  magic_link: {
    file: 'magic_link.html',
    title: 'Sign-in link',
    headline: 'Your StrideShift sign-in link',
    body:
      'Tap the button below to sign in to StrideShift on this device. No ' +
      "password needed — we'll get you straight in.",
    cta: 'Sign me in',
    note:
      "For your security, this link works once and expires after 60 minutes. " +
      "If you didn't request it, you can safely ignore this email.",
    preheader: 'One-tap sign-in for StrideShift.',
  },
  email_change: {
    file: 'email_change.html',
    title: 'Email change',
    headline: 'Confirm your new email',
    body:
      "You asked to change the email on your StrideShift account. Click below " +
      "to confirm the new address. Once confirmed, you'll sign in with it from " +
      'now on.',
    cta: 'Confirm new email',
    note:
      "Didn't request this change? Reply to this email or sign into your " +
      'account immediately to revert it.',
    preheader: 'Confirm your new StrideShift email.',
  },
  reauthentication: {
    file: 'reauthentication.html',
    title: 'Identity check',
    headline: 'Confirm it’s you',
    body:
      "We need to verify it's really you before making this change. Click the " +
      'button below to confirm and continue.',
    cta: 'Confirm identity',
    note:
      "If you didn't try to make a sensitive change just now, secure your " +
      'account by resetting your password.',
    preheader: 'Quick identity check for your StrideShift account.',
  },
};

const sub = (tmpl, vars) =>
  tmpl
    .replaceAll('{{TITLE}}', vars.title)
    .replaceAll('{{HEADLINE}}', vars.headline)
    .replaceAll('{{BODY}}', vars.body)
    .replaceAll('{{CTA_URL}}', '{{ .ConfirmationURL }}')
    .replaceAll('{{CTA_LABEL}}', vars.cta)
    .replaceAll('{{NOTE}}', vars.note)
    .replaceAll('{{PREHEADER}}', vars.preheader);

for (const [, t] of Object.entries(TEMPLATES)) {
  const out = sub(shell, t);
  writeFileSync(join(DIR, t.file), out, 'utf8');
  console.log(`✓ ${t.file}  (${(out.length / 1024).toFixed(1)} KB)`);
}

console.log('\nDone. Templates ready in supabase/email-templates/');
