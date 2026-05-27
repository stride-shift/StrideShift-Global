import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  configured: boolean;
  signOut: () => Promise<void>;
  refreshAdminStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const configured = isSupabaseConfigured();

  const checkAdmin = async (uid: string | undefined) => {
    const supa = getSupabase();
    if (!supa || !uid) {
      setIsAdmin(false);
      return;
    }
    try {
      const { data } = await supa
        .from('profiles')
        .select('is_admin')
        .eq('id', uid)
        .maybeSingle();
      setIsAdmin(Boolean(data?.is_admin));
    } catch {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    const supa = getSupabase();
    if (!supa) {
      setLoading(false);
      return;
    }

    supa.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      checkAdmin(data.session?.user?.id).finally(() => setLoading(false));
    });

    const { data: sub } = supa.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      checkAdmin(newSession?.user?.id);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const supa = getSupabase();
    if (!supa) return;
    await supa.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  const refreshAdminStatus = async () => {
    await checkAdmin(user?.id);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, isAdmin, loading, configured, signOut, refreshAdminStatus }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
