// @ts-nocheck — runs in Deno, not Node. Local TS server doesn't know.
/**
 * send-invitation — admin-only endpoint that creates a new user with a
 * password the admin chose. Sign-up is invite-only, so:
 *   1. Verifies the caller is an admin in public.profiles.
 *   2. Upserts a row into public.pending_invitations so the on-user-created
 *      trigger (handle_new_user) lets the insert through.
 *   3. Calls supabase.auth.admin.createUser({ email_confirm: true, password })
 *      so the user can log in immediately at /sign-in.
 *   4. If email_user is true (default), POSTs a branded welcome email via
 *      Resend HTTP API containing the credentials + a forgot-password CTA.
 *   5. Logs invite.sent_with_password to admin_activity.
 *
 * Required Supabase function secrets:
 *   RESEND_API_KEY  — Resend API key (already used for Supabase SMTP)
 *   FROM_EMAIL      — verified sender, e.g. noreply@strideshift.ai
 *   FROM_NAME       — display name, e.g. "StrideShift"
 *   APP_URL         — origin to put in the email link (defaults to site_url)
 *
 * Deploy:  supabase functions deploy send-invitation --no-verify-jwt
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface Payload {
  email: string;
  password: string;
  display_name?: string | null;
  is_admin?: boolean;
  email_user?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

    // 1) Authenticate the caller via their JWT.
    const auth = req.headers.get('Authorization') ?? '';
    if (!auth.toLowerCase().startsWith('bearer ')) {
      return json({ error: 'Missing bearer token' }, 401);
    }

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: auth } },
      auth: { persistSession: false },
    });

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return json({ error: `Invalid session: ${userErr?.message ?? 'no user'}` }, 401);
    }
    const caller = userData.user;

    // 2) Verify the caller is admin (service-role bypasses RLS).
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
    const { data: profile, error: profileErr } = await admin
      .from('profiles')
      .select('is_admin, email')
      .eq('id', caller.id)
      .maybeSingle();
    if (profileErr) {
      return json({ error: `Profile lookup: ${profileErr.message}` }, 500);
    }
    if (!profile?.is_admin) {
      return json({ error: 'Forbidden — admins only' }, 403);
    }

    // 3) Parse + validate body.
    let body: Payload;
    try {
      body = await req.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, 400);
    }
    const email = body.email?.trim().toLowerCase();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return json({ error: 'A valid email is required' }, 400);
    }
    const password = body.password ?? '';
    if (password.length < 8) {
      return json({ error: 'Password must be at least 8 characters' }, 400);
    }
    const displayName = body.display_name?.trim() || null;
    const isAdmin = Boolean(body.is_admin);

    // 4) Upsert pending invitation so the on-user-created trigger sees it
    //    and stamps the profile with the right role + display name.
    const { error: upsertErr } = await admin
      .from('pending_invitations')
      .upsert(
        {
          email,
          is_admin: isAdmin,
          display_name: displayName,
          invited_by: caller.id,
          consumed_at: null,
        },
        { onConflict: 'email' }
      );
    if (upsertErr) {
      return json({ error: `Could not save invitation: ${upsertErr.message}` }, 500);
    }

    // 5) Create the user directly with the supplied password. email_confirm:
    //    true skips the confirmation email — they can sign in immediately.
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: displayName,
        invited_by_admin: true,
      },
    });
    if (createErr) {
      // Roll back the invitation insert so admin can retry cleanly.
      await admin.from('pending_invitations').delete().eq('email', email);
      const msg =
        (createErr as { message?: string }).message ||
        (createErr as { error_description?: string }).error_description ||
        JSON.stringify(createErr);
      return json({ error: `User creation failed: ${msg}` }, 502);
    }

    // 6) Optionally email the new user their credentials via Resend HTTP API.
    //    If this fails we still return success — the admin already has the
    //    password in the UI and can share it out-of-band.
    const emailUser = body.email_user !== false; // default true
    let emailWarning: string | null = null;
    if (emailUser) {
      const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
      const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? 'noreply@strideshift.ai';
      const FROM_NAME = Deno.env.get('FROM_NAME') ?? 'StrideShift';
      const APP_URL = (Deno.env.get('APP_URL') ?? 'https://stride-shift-global.vercel.app').replace(/\/$/, '');
      if (!RESEND_API_KEY) {
        emailWarning = 'RESEND_API_KEY secret not set — skipped email.';
      } else {
        const html = welcomeEmailHtml({
          appUrl: APP_URL,
          email,
          password,
          displayName,
          isAdmin,
        });
        try {
          const resendRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: `${FROM_NAME} <${FROM_EMAIL}>`,
              to: [email],
              subject: 'Welcome to StrideShift — your account is ready',
              html,
            }),
          });
          if (!resendRes.ok) {
            const t = await resendRes.text().catch(() => '');
            emailWarning = `Resend ${resendRes.status}: ${t.slice(0, 200)}`;
          }
        } catch (err) {
          emailWarning = `Resend network error: ${err instanceof Error ? err.message : String(err)}`;
        }
      }
    }

    // 7) Log to admin_activity so it appears in People → Activity.
    await admin.from('admin_activity').insert({
      admin_id: caller.id,
      action: emailUser ? 'invite.sent_with_email' : 'invite.sent_with_password',
      resource: `email:${email}`,
      metadata: { is_admin: isAdmin, display_name: displayName, email_warning: emailWarning },
    });

    return json({
      ok: true,
      email,
      is_admin: isAdmin,
      user_id: created?.user?.id ?? null,
      emailed: emailUser && !emailWarning,
      email_warning: emailWarning,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ error: `Unhandled: ${msg}` }, 500);
  }
});

function welcomeEmailHtml(opts: {
  appUrl: string;
  email: string;
  password: string;
  displayName: string | null;
  isAdmin: boolean;
}): string {
  const { appUrl, email, password, displayName, isAdmin } = opts;
  const greet = displayName ? `Hi ${escapeHtml(displayName)},` : 'Hi,';
  const role = isAdmin ? 'admin' : 'member';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Welcome to StrideShift</title>
</head>
<body style="margin:0;padding:0;background:#0b1220;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e6ecf6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0b1220;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:#0f172a;border:1px solid #1f2a44;border-radius:16px;overflow:hidden;">
        <tr><td style="padding:32px 32px 8px 32px;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;letter-spacing:-0.01em;color:#ffffff;">StrideShift</div>
          <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#c9a14a;margin-top:6px;">Welcome aboard</div>
        </td></tr>
        <tr><td style="padding:24px 32px 8px 32px;">
          <h1 style="margin:0 0 12px 0;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.2;color:#ffffff;font-weight:600;">Your account is ready</h1>
          <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#b8c2d6;">${greet}</p>
          <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#b8c2d6;">
            An admin just created your StrideShift account as a <strong style="color:#ffffff;">${role}</strong>. You can sign in right away with the credentials below — no confirmation step needed.
          </p>
        </td></tr>
        <tr><td style="padding:8px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0b1220;border:1px solid #1f2a44;border-radius:10px;">
            <tr><td style="padding:16px 18px;font-family:Menlo,Consolas,monospace;font-size:13px;color:#e6ecf6;line-height:1.8;">
              <span style="color:#7a8aa8;">Email:&nbsp;&nbsp;&nbsp;&nbsp;</span>${escapeHtml(email)}<br>
              <span style="color:#7a8aa8;">Password: </span>${escapeHtml(password)}
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:24px 32px 8px 32px;" align="center">
          <a href="${appUrl}/sign-in" style="display:inline-block;padding:13px 28px;background:#c9a14a;color:#0b1220;text-decoration:none;border-radius:999px;font-weight:600;font-size:14px;letter-spacing:0.02em;">Sign in to StrideShift</a>
        </td></tr>
        <tr><td style="padding:20px 32px 8px 32px;">
          <p style="margin:0 0 12px 0;font-size:13px;line-height:1.6;color:#7a8aa8;">
            <strong style="color:#b8c2d6;">Recommended:</strong> change this password to something only you know. From the sign-in page, click <em>Forgot?</em> to set a new one, or sign in and reset it from your account settings.
          </p>
          <p style="margin:0 0 16px 0;font-size:13px;line-height:1.6;color:#7a8aa8;">
            If you weren't expecting this email, please let your admin know.
          </p>
        </td></tr>
        <tr><td style="padding:8px 32px 28px 32px;border-top:1px solid #1f2a44;">
          <p style="margin:16px 0 0 0;font-size:11px;line-height:1.5;color:#5a6680;">
            StrideShift Global · An AI think-tank for leadership teams<br>
            <a href="${appUrl}" style="color:#5a6680;text-decoration:underline;">${appUrl.replace(/^https?:\/\//, '')}</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
