// @ts-nocheck — runs in Deno, not Node. Local TS server doesn't know.
/**
 * send-invitation — admin-only endpoint that:
 *   1. Verifies the caller is an admin in public.profiles.
 *   2. Inserts a row into public.pending_invitations (so the trigger lets the
 *      person sign up later).
 *   3. Calls supabase.auth.admin.inviteUserByEmail(), which sends our
 *      branded "Invite" email (the template configured via the Management
 *      API earlier) through Resend SMTP.
 *
 * Deploy:  supabase functions deploy send-invitation --no-verify-jwt
 *          (we verify the JWT manually so we get the caller's user_id)
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface Payload {
  email: string;
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
    console.log('[send-invitation] env present', {
      url: !!SUPABASE_URL,
      service: !!SERVICE_ROLE_KEY,
      anon: !!ANON_KEY,
    });

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
      console.error('[send-invitation] getUser failed:', userErr?.message);
      return json({ error: `Invalid session: ${userErr?.message ?? 'no user'}` }, 401);
    }
    const caller = userData.user;
    console.log('[send-invitation] caller:', caller.email, caller.id);

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
      console.error('[send-invitation] profile lookup failed:', profileErr.message);
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
    const displayName = body.display_name?.trim() || null;
    const isAdmin = Boolean(body.is_admin);
    console.log('[send-invitation] inviting:', { email, displayName, isAdmin });

    // 4) Upsert pending invitation so the sign-up trigger lets them through.
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
      console.error('[send-invitation] upsert failed:', upsertErr.message);
      return json({ error: `Could not save invitation: ${upsertErr.message}` }, 500);
    }

    // 5) Send the branded invite email. NOTE: redirectTo must be in your
    //    Supabase Auth → URL Configuration allow-list, otherwise Supabase
    //    silently falls back to Site URL. We omit it here to use the Site URL.
    const { data: inviteData, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: displayName,
        invited_by_admin: true,
      },
    });
    if (inviteErr) {
      console.error('[send-invitation] inviteUserByEmail failed:', JSON.stringify(inviteErr));
      // Roll back the invitation insert so admin can retry cleanly.
      await admin.from('pending_invitations').delete().eq('email', email);
      const msg =
        (inviteErr as { message?: string }).message ||
        (inviteErr as { error_description?: string }).error_description ||
        JSON.stringify(inviteErr);
      return json({ error: `Email send failed: ${msg}` }, 502);
    }
    console.log('[send-invitation] invite sent:', inviteData?.user?.id);

    // 6) Log to admin_activity so it appears in People → Activity.
    await admin.from('admin_activity').insert({
      admin_id: caller.id,
      action: 'invite.sent',
      resource: `email:${email}`,
      metadata: { is_admin: isAdmin, display_name: displayName },
    });

    return json({ ok: true, email, is_admin: isAdmin });
  } catch (e) {
    console.error('[send-invitation] unhandled:', e);
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
