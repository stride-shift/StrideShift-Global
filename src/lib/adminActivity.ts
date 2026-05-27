import { getSupabase } from '@/lib/supabase';

/**
 * Append a row to public.admin_activity. Use after meaningful admin actions
 * (content save, settings save, role change, etc.) so the People → Activity
 * tab can show who-did-what-when.
 *
 * Fire-and-forget: errors are logged to console but not thrown so a logging
 * failure never breaks the actual admin action.
 */
export async function logAdminActivity(entry: {
  action: string;
  resource?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const supa = getSupabase();
  if (!supa) return;
  try {
    const {
      data: { user },
    } = await supa.auth.getUser();
    if (!user) return;
    const { error } = await supa.from('admin_activity').insert({
      admin_id: user.id,
      action: entry.action,
      resource: entry.resource ?? null,
      metadata: entry.metadata ?? null,
    });
    if (error) {
      // RLS will block non-admins — that's expected. Don't spam console for
      // those. Log other errors so we can debug.
      if (!/row-level security/i.test(error.message)) {
        console.warn('logAdminActivity:', error.message);
      }
    }
  } catch (e) {
    console.warn('logAdminActivity:', e);
  }
}
