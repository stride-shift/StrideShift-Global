// @ts-nocheck — runs in Deno.
/**
 * delete-user — admin-only endpoint that removes a user.
 *   1. Verifies the caller is an admin in public.profiles.
 *   2. Refuses to let the caller delete themselves.
 *   3. Looks up the target's email + admin status (for logging).
 *   4. Calls supabase.auth.admin.deleteUser(target_id). The profiles row
 *      cascades via the FK on profiles.id → auth.users.id.
 *   5. Clears any matching row in public.pending_invitations so the email
 *      can be re-invited cleanly later.
 *   6. Logs user.delete to admin_activity.
 *
 * Deploy:  supabase functions deploy delete-user --no-verify-jwt
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface Payload {
  user_id: string;
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

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
    const { data: callerProfile, error: profileErr } = await admin
      .from('profiles')
      .select('is_admin')
      .eq('id', caller.id)
      .maybeSingle();
    if (profileErr) {
      return json({ error: `Profile lookup: ${profileErr.message}` }, 500);
    }
    if (!callerProfile?.is_admin) {
      return json({ error: 'Forbidden — admins only' }, 403);
    }

    let body: Payload;
    try {
      body = await req.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, 400);
    }
    const targetId = body.user_id?.trim();
    if (!targetId) {
      return json({ error: 'user_id is required' }, 400);
    }
    if (targetId === caller.id) {
      return json({ error: "You can't delete your own account." }, 400);
    }

    // Look up target email for logging + invitation cleanup.
    const { data: targetProfile } = await admin
      .from('profiles')
      .select('email, is_admin, display_name')
      .eq('id', targetId)
      .maybeSingle();

    const { error: deleteErr } = await admin.auth.admin.deleteUser(targetId);
    if (deleteErr) {
      const msg =
        (deleteErr as { message?: string }).message ||
        (deleteErr as { error_description?: string }).error_description ||
        JSON.stringify(deleteErr);
      return json({ error: `Delete failed: ${msg}` }, 502);
    }

    // Best-effort: clear any pending invitation so the email can be re-used.
    if (targetProfile?.email) {
      await admin.from('pending_invitations').delete().eq('email', targetProfile.email);
    }

    await admin.from('admin_activity').insert({
      admin_id: caller.id,
      action: 'user.delete',
      resource: `profile:${targetProfile?.email ?? targetId}`,
      metadata: {
        target_user_id: targetId,
        target_email: targetProfile?.email ?? null,
        was_admin: targetProfile?.is_admin ?? null,
        display_name: targetProfile?.display_name ?? null,
      },
    });

    return json({ ok: true, deleted: targetId });
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
