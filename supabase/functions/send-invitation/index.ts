// @ts-nocheck — runs in Deno, not Node. Local TS server doesn't know.
/**
 * send-invitation — admin-only endpoint that creates a new user with a
 * password the admin chose. Sign-up is invite-only, so:
 *   1. Verifies the caller is an admin in public.profiles.
 *   2. Upserts a row into public.pending_invitations so the on-user-created
 *      trigger (handle_new_user) lets the insert through.
 *   3. Calls supabase.auth.admin.createUser({ email_confirm: true, password })
 *      so the user can log in immediately at /sign-in.
 *   4. Logs invite.sent_with_password to admin_activity.
 *
 * The admin shares the password with the new user out-of-band (Slack, etc).
 * No confirmation email is sent — the account is active on creation.
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

    // 6) Log to admin_activity so it appears in People → Activity.
    await admin.from('admin_activity').insert({
      admin_id: caller.id,
      action: 'invite.sent_with_password',
      resource: `email:${email}`,
      metadata: { is_admin: isAdmin, display_name: displayName },
    });

    return json({
      ok: true,
      email,
      is_admin: isAdmin,
      user_id: created?.user?.id ?? null,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ error: `Unhandled: ${msg}` }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
