import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Single Supabase client for the browser. Reads from Vite env vars.
 *
 * Configuration:
 *  1. Copy `.env.example` to `.env`
 *  2. Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from your project
 *  3. Restart the dev server
 *
 * Without configuration, `getSupabase()` returns `null` and the app falls back to
 * a "Configure Supabase" message in auth screens.
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let _client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey && !url.includes('YOUR-PROJECT-REF'));
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (_client) return _client;
  _client = createClient(url!, anonKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  });
  return _client;
}

export const AUTH_REDIRECT_AFTER_SIGNIN =
  (import.meta.env.VITE_AUTH_REDIRECT_AFTER_SIGNIN as string | undefined) || '/admin';
