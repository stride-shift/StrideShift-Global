# StrideShift transactional emails

Branded HTML for the six Supabase auth emails (recovery, confirmation, invite,
magic link, email change, reauthentication). Designed to match the
StrideShift site — dark ink header, gold accent, cream body, rounded pill CTA.

## Files

- `_shell.html` — base template with `{{TITLE}} {{HEADLINE}} {{BODY}} {{CTA_URL}}
  {{CTA_LABEL}} {{NOTE}} {{PREHEADER}}` placeholders.
- `recovery.html`, `confirmation.html`, `invite.html`, `magic_link.html`,
  `email_change.html`, `reauthentication.html` — baked outputs.

Edit `_shell.html` for design changes; edit the copy table in
`scripts/build-email-templates.mjs` for wording. Then re-run:

```
node scripts/build-email-templates.mjs
```

## Push to Supabase (Resend SMTP + templates)

Two paths — pick one.

### A) Automated (Management API)

1. Make sure Resend has your sending domain verified at
   https://resend.com/domains (e.g. `strideshift.ai`). Until a domain is
   verified, Resend will only let you send from `onboarding@resend.dev`.
2. Get a Supabase Personal Access Token: https://supabase.com/dashboard/account/tokens
3. Run:
   ```
   SUPABASE_ACCESS_TOKEN=sbp_xxx \
   SUPABASE_SMTP_SENDER=hello@strideshift.ai \
   SUPABASE_SMTP_NAME=StrideShift \
   node scripts/configure-supabase-emails.mjs
   ```
   The script reads `RESEND_API_KEY` and `VITE_SUPABASE_URL` from `.env`.

### B) Manual (Supabase Studio)

If you'd rather click than script:

1. Open Supabase Studio → **Authentication → Email Templates**.
2. For each of the six tabs (Confirm signup / Invite / Magic Link / Change
   Email Address / Reset Password / Reauthentication):
   - Paste the matching file's contents into the **Template body** field.
   - Set the subject lines from `scripts/configure-supabase-emails.mjs` (search
     for `mailer_subjects_*`).
3. Then → **Authentication → SMTP Settings**:
   - **Sender email:** `hello@strideshift.ai` (or any verified Resend address)
   - **Sender name:** `StrideShift`
   - **Host:** `smtp.resend.com`
   - **Port:** `465`
   - **Username:** `resend`
   - **Password:** the `RESEND_API_KEY` from `.env`
   - Save → "Send test email".

## Test it

After either path, go to `/sign-in` on the live site → "Forgot password" →
enter your admin email. The reset email should arrive within a minute, branded
in StrideShift's look, sent from your Resend domain (not `mail.app.supabase.io`).

## Security

`.env` already has `RESEND_API_KEY`. Make sure `.gitignore` excludes `.env` —
it does. Don't commit it. Rotate the key in Resend if it leaks.
