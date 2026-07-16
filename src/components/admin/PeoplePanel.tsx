import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  Users,
  ShieldCheck,
  Shield,
  UserPlus,
  ScrollText,
  Check,
  X,
  RefreshCcw,
  Trash2,
  KeyRound,
  Copy,
  Eye,
  EyeOff,
  Sparkles,
  Search,
  ChevronDown,
  Pencil,
  FileText,
  Settings2,
  Clock,
  Activity,
} from 'lucide-react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { logAdminActivity } from '@/lib/adminActivity';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  display_name: string | null;
  is_admin: boolean;
  created_at: string;
  last_seen_at: string | null;
}

interface PendingInvitation {
  id: string;
  email: string;
  is_admin: boolean;
  display_name: string | null;
  invited_by: string | null;
  created_at: string;
  consumed_at: string | null;
}

interface ActivityEntry {
  id: number;
  admin_id: string | null;
  action: string;
  resource: string | null;
  metadata: any;
  created_at: string;
}

/** Per-person lazily fetched activity, keyed by profile id. */
interface PersonActivityState {
  status: 'loading' | 'ready' | 'error';
  entries: ActivityEntry[];
  error?: string;
}

const fmt = (iso: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

/** Compact relative time, e.g. "3h ago". */
const timeAgo = (iso: string | null) => {
  if (!iso) return 'never';
  const t = new Date(iso).getTime();
  if (isNaN(t)) return '—';
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 45) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
};

/** Friendly labels for every action string the app actually logs. */
const ACTION_LABELS: Record<string, string> = {
  'content.save': 'Saved page content',
  'settings.save': 'Saved landing settings',
  'profile.rename': 'Renamed a profile',
  'role.grant_admin': 'Granted admin access',
  'role.revoke_admin': 'Revoked admin access',
  'invite.sent_with_email': 'Created a user (credentials emailed)',
  'invite.sent_with_password': 'Created a user (password shared manually)',
  'invite.revoke': 'Revoked an invitation',
  'user.delete': 'Deleted a user',
};

const actionLabel = (action: string) =>
  ACTION_LABELS[action] ?? action.replace(/[._]/g, ' ');

const actionIcon = (action: string) => {
  if (action.startsWith('content.')) return FileText;
  if (action.startsWith('settings.')) return Settings2;
  if (action.startsWith('role.')) return ShieldCheck;
  if (action.startsWith('invite.')) return UserPlus;
  if (action.startsWith('user.')) return Trash2;
  if (action.startsWith('profile.')) return Pencil;
  return Activity;
};

/** "page:home" → "page home", "profile:x@y.com" → "x@y.com", etc. */
const resourceLabel = (resource: string | null) => {
  if (!resource) return null;
  const idx = resource.indexOf(':');
  if (idx === -1) return resource;
  const kind = resource.slice(0, idx);
  const value = resource.slice(idx + 1);
  if (kind === 'profile' || kind === 'email') return value;
  return `${kind} "${value}"`;
};

const initialsOf = (p: Profile) => {
  const src = p.display_name || p.full_name || p.email || '?';
  const words = src
    .replace(/@.*$/, '')
    .split(/[\s._-]+/)
    .filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

const nameOf = (p: Profile) =>
  p.display_name || p.full_name || p.email || p.id.slice(0, 8);

const PeoplePanel = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<'users' | 'invites' | 'activity'>('users');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // People accordion
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [personActivity, setPersonActivity] = useState<
    Record<string, PersonActivityState>
  >({});

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [inviteAdmin, setInviteAdmin] = useState(false);
  const [emailUser, setEmailUser] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [created, setCreated] = useState<{
    email: string;
    password: string;
    emailed: boolean;
    emailWarning: string | null;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Generate a strong, memorable-ish password: 3 random words from a small
  // wordlist + a 3-digit number + a symbol. Easy to dictate, hard to guess.
  const generatePassword = () => {
    const words = [
      'orbit', 'forge', 'pulse', 'spark', 'tide', 'glade', 'cliff', 'horizon',
      'cobalt', 'lumen', 'quiver', 'thatch', 'cipher', 'echo', 'falcon', 'glow',
      'haven', 'iris', 'jett', 'kilo', 'lyric', 'matrix', 'nova', 'oak',
    ];
    const pick = () => words[Math.floor(Math.random() * words.length)];
    const sym = '!@#$%&*'[Math.floor(Math.random() * 7)];
    const num = String(100 + Math.floor(Math.random() * 900));
    return `${pick()}-${pick()}-${pick()}-${num}${sym}`;
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    const supa = getSupabase();
    if (!supa) {
      setLoading(false);
      return;
    }
    try {
      const [p, i, a] = await Promise.all([
        supa.from('profiles').select('*').order('created_at', { ascending: false }),
        supa.from('pending_invitations').select('*').order('created_at', { ascending: false }),
        supa.from('admin_activity').select('*').order('created_at', { ascending: false }).limit(200),
      ]);
      if (p.error) throw new Error(`Profiles: ${p.error.message}`);
      if (i.error) throw new Error(`Invitations: ${i.error.message}`);
      if (a.error) throw new Error(`Activity: ${a.error.message}`);
      setProfiles((p.data ?? []) as Profile[]);
      setInvitations((i.data ?? []) as PendingInvitation[]);
      setActivity((a.data ?? []) as ActivityEntry[]);
      // Cached per-person activity may now be stale — refetch on next expand.
      setPersonActivity({});
    } catch (e: any) {
      setError(e?.message || 'Could not load people data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  /** Lazily fetch one person's activity the first time their row is expanded. */
  const fetchPersonActivity = async (profileId: string) => {
    const supa = getSupabase();
    if (!supa) return;
    setPersonActivity((m) => ({
      ...m,
      [profileId]: { status: 'loading', entries: [] },
    }));
    const { data, error: err } = await supa
      .from('admin_activity')
      .select('*')
      .eq('admin_id', profileId)
      .order('created_at', { ascending: false })
      .limit(200);
    if (err) {
      setPersonActivity((m) => ({
        ...m,
        [profileId]: { status: 'error', entries: [], error: err.message },
      }));
      return;
    }
    setPersonActivity((m) => ({
      ...m,
      [profileId]: { status: 'ready', entries: (data ?? []) as ActivityEntry[] },
    }));
  };

  const toggleRow = (profileId: string) => {
    const next = openId === profileId ? null : profileId;
    setOpenId(next);
    if (next && !personActivity[next]) {
      void fetchPersonActivity(next);
    }
  };

  const toggleAdmin = async (target: Profile) => {
    const supa = getSupabase();
    if (!supa || !user) return;
    const wasAdmin = target.is_admin;
    const next = !wasAdmin;
    // Optimistic update
    setProfiles((rows) =>
      rows.map((r) => (r.id === target.id ? { ...r, is_admin: next } : r))
    );
    const { error: err } = await supa
      .from('profiles')
      .update({ is_admin: next })
      .eq('id', target.id);
    if (err) {
      // Roll back
      setProfiles((rows) =>
        rows.map((r) => (r.id === target.id ? { ...r, is_admin: wasAdmin } : r))
      );
      setError(err.message);
      return;
    }
    await logAdminActivity({
      action: next ? 'role.grant_admin' : 'role.revoke_admin',
      resource: `profile:${target.email}`,
      metadata: { target_user_id: target.id, target_email: target.email },
    });
    void load();
  };

  const setDisplayName = async (target: Profile, displayName: string) => {
    const supa = getSupabase();
    if (!supa) return;
    setProfiles((rows) =>
      rows.map((r) => (r.id === target.id ? { ...r, display_name: displayName } : r))
    );
    await supa
      .from('profiles')
      .update({ display_name: displayName })
      .eq('id', target.id);
    await logAdminActivity({
      action: 'profile.rename',
      resource: `profile:${target.email}`,
      metadata: { target_user_id: target.id, display_name: displayName },
    });
  };

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || invitePassword.length < 8) return;
    const supa = getSupabase();
    if (!supa) return;
    setInviting(true);
    setError(null);
    try {
      const {
        data: { session },
      } = await supa.auth.getSession();
      if (!session) throw new Error('Not signed in.');
      const fnUrl =
        (import.meta.env.VITE_SUPABASE_URL as string).replace(/\/$/, '') +
        '/functions/v1/send-invitation';
      const res = await fetch(fnUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteEmail.trim().toLowerCase(),
          password: invitePassword,
          display_name: inviteName.trim() || null,
          is_admin: inviteAdmin,
          email_user: emailUser,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          (data as { error?: string }).error ||
            `Edge function ${res.status}: ${res.statusText}`
        );
      }
      setCreated({
        email: inviteEmail.trim().toLowerCase(),
        password: invitePassword,
        emailed: Boolean((data as { emailed?: boolean }).emailed),
        emailWarning: (data as { email_warning?: string | null }).email_warning ?? null,
      });
      setInviteEmail('');
      setInviteName('');
      setInvitePassword('');
      setInviteAdmin(false);
      await load();
    } catch (err: any) {
      setError(err?.message || 'Could not create user.');
    } finally {
      setInviting(false);
    }
  };

  const copyCreds = async () => {
    if (!created) return;
    const text = `Email: ${created.email}\nPassword: ${created.password}\nSign in: ${window.location.origin}/sign-in`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable — admin can copy by hand.
    }
  };

  const deleteUser = async (target: Profile) => {
    if (target.id === user?.id) return;
    const label = target.display_name || target.email || target.id;
    const ok = window.confirm(
      `Delete ${label}?\n\nThis removes their account, profile, and any pending invitation. They can be re-invited later. This cannot be undone.`
    );
    if (!ok) return;
    const supa = getSupabase();
    if (!supa) return;
    try {
      const {
        data: { session },
      } = await supa.auth.getSession();
      if (!session) throw new Error('Not signed in.');
      const fnUrl =
        (import.meta.env.VITE_SUPABASE_URL as string).replace(/\/$/, '') +
        '/functions/v1/delete-user';
      const res = await fetch(fnUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: target.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          (data as { error?: string }).error ||
            `Edge function ${res.status}: ${res.statusText}`
        );
      }
      // Drop from local state immediately so the row disappears without a refetch.
      setProfiles((rows) => rows.filter((r) => r.id !== target.id));
      void load();
    } catch (err: any) {
      setError(err?.message || 'Could not delete user.');
    }
  };

  const revokeInvite = async (inv: PendingInvitation) => {
    const supa = getSupabase();
    if (!supa) return;
    const { error: err } = await supa
      .from('pending_invitations')
      .delete()
      .eq('id', inv.id);
    if (err) {
      setError(err.message);
      return;
    }
    await logAdminActivity({
      action: 'invite.revoke',
      resource: `email:${inv.email}`,
      metadata: { is_admin: inv.is_admin },
    });
    void load();
  };

  const filteredProfiles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter((p) =>
      [p.display_name, p.full_name, p.email]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(q))
    );
  }, [profiles, query]);

  if (!isSupabaseConfigured()) {
    return (
      <div className="bg-stride-bg-elev border border-stride-border rounded-2xl p-8 text-center">
        <Users className="w-10 h-10 text-stride-accent mx-auto mb-3" />
        <h3 className="font-display text-xl text-stride-text-strong mb-2 tracking-tight">
          Supabase isn't configured
        </h3>
        <p className="text-sm text-stride-text-muted max-w-md mx-auto leading-relaxed">
          People management needs Supabase. Set the credentials in{' '}
          <code className="font-mono text-xs">.env</code> and run the migration.
        </p>
      </div>
    );
  }

  const adminProfiles = profiles.filter((p) => p.is_admin);
  const memberProfiles = profiles.filter((p) => !p.is_admin);
  const pendingInvites = invitations.filter((i) => !i.consumed_at);

  return (
    <div className="space-y-5">
      {/* Tabs + refresh */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex bg-stride-bg-elev border border-stride-border rounded-full p-1 shadow-sm">
          {(
            [
              { id: 'users', label: 'People', count: profiles.length, icon: Users },
              { id: 'invites', label: 'Invitations', count: pendingInvites.length, icon: UserPlus },
              { id: 'activity', label: 'Activity', count: activity.length, icon: ScrollText },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all inline-flex items-center gap-2 ${
                  tab === t.id
                    ? 'bg-stride-navy text-white shadow-md'
                    : 'text-stride-text-muted hover:text-stride-text-strong'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                    tab === t.id ? 'bg-white/15' : 'bg-stride-bg'
                  }`}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex-grow" />
        <button
          onClick={load}
          disabled={loading}
          className="px-3.5 py-2 rounded-full bg-stride-bg-elev border border-stride-border text-sm text-stride-text-strong hover:bg-stride-bg transition-colors inline-flex items-center gap-1.5 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCcw className="w-3.5 h-3.5" />
          )}
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-stride-bg-elev border border-stride-border rounded-xl p-4">
          <p className="text-[11px] uppercase tracking-wider text-stride-text-muted font-semibold">
            Admins
          </p>
          <p className="font-display text-2xl text-stride-text-strong mt-1 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-stride-accent" />
            {adminProfiles.length}
          </p>
        </div>
        <div className="bg-stride-bg-elev border border-stride-border rounded-xl p-4">
          <p className="text-[11px] uppercase tracking-wider text-stride-text-muted font-semibold">
            Members
          </p>
          <p className="font-display text-2xl text-stride-text-strong mt-1">
            {memberProfiles.length}
          </p>
        </div>
        <div className="bg-stride-bg-elev border border-stride-border rounded-xl p-4">
          <p className="text-[11px] uppercase tracking-wider text-stride-text-muted font-semibold">
            Pending invites
          </p>
          <p className="font-display text-2xl text-stride-text-strong mt-1">
            {pendingInvites.length}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* PEOPLE */}
      {tab === 'users' && (
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stride-text-muted pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people by name or email…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-stride-border bg-stride-bg-elev text-stride-text-strong placeholder:text-stride-text-muted focus:outline-none focus:ring-2 focus:ring-stride-accent text-sm"
            />
          </div>

          {loading && profiles.length === 0 && (
            <div className="bg-stride-bg-elev border border-stride-border rounded-2xl p-10 text-center text-stride-text-muted">
              <Loader2 className="w-6 h-6 animate-spin text-stride-accent mx-auto" />
            </div>
          )}
          {!loading && profiles.length === 0 && (
            <div className="bg-stride-bg-elev border border-stride-border rounded-2xl p-10 text-center text-stride-text-muted">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-60" />
              No profiles yet — invite someone from the Invitations tab.
            </div>
          )}
          {profiles.length > 0 && filteredProfiles.length === 0 && (
            <div className="bg-stride-bg-elev border border-stride-border rounded-2xl p-8 text-center text-stride-text-muted text-sm">
              No one matches "{query.trim()}".
            </div>
          )}

          {filteredProfiles.map((p) => (
            <PersonRow
              key={p.id}
              profile={p}
              isSelf={p.id === user?.id}
              open={openId === p.id}
              activityState={personActivity[p.id]}
              onToggle={() => toggleRow(p.id)}
              onRetryActivity={() => fetchPersonActivity(p.id)}
              onToggleAdmin={() => toggleAdmin(p)}
              onRename={(name) => setDisplayName(p, name)}
              onDelete={() => deleteUser(p)}
            />
          ))}
        </div>
      )}

      {/* INVITATIONS */}
      {tab === 'invites' && (
        <div className="space-y-4">
          {/* Success: just-created creds */}
          {created && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg text-stride-text-strong tracking-tight flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    User created
                    {created.emailed && (
                      <span className="text-[10px] uppercase tracking-wider bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                        emailed
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-stride-text-muted mt-1">
                    {created.emailed
                      ? "We've emailed them their credentials with a recommendation to change the password via Forgot password. They can sign in immediately."
                      : 'Share these credentials with them out-of-band (Slack, SMS, in person). They can sign in immediately.'}
                  </p>
                  {created.emailWarning && (
                    <p className="text-xs text-amber-600 dark:text-amber-300 mt-1">
                      Email skipped: {created.emailWarning}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setCreated(null)}
                  className="text-stride-text-muted hover:text-stride-text-strong"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-stride-bg-elev border border-stride-border rounded-lg p-3 font-mono text-xs space-y-1">
                <div>
                  <span className="text-stride-text-muted">Email:&nbsp;&nbsp;&nbsp;</span>
                  <span className="text-stride-text-strong">{created.email}</span>
                </div>
                <div>
                  <span className="text-stride-text-muted">Password: </span>
                  <span className="text-stride-text-strong">{created.password}</span>
                </div>
              </div>
              <button
                onClick={copyCreds}
                className="px-4 py-1.5 rounded-full bg-stride-navy text-white text-xs font-medium inline-flex items-center gap-1.5 hover:shadow-md"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy email + password
                  </>
                )}
              </button>
            </div>
          )}

          {/* Create form */}
          <form
            onSubmit={invite}
            className="bg-stride-bg-elev border border-stride-border rounded-2xl p-5 space-y-3"
          >
            <h3 className="font-display text-lg text-stride-text-strong tracking-tight flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-stride-accent" />
              Create a new user
            </h3>
            <p className="text-xs text-stride-text-muted">
              Set their email and password — they can sign in right away at{' '}
              <code className="font-mono">/sign-in</code>. The account is
              confirmed automatically; no email link required.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_auto] gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@company.com"
                required
                className="px-3 py-2 rounded-md border border-stride-border bg-stride-bg-elev text-stride-text-strong focus:outline-none focus:ring-2 focus:ring-stride-accent text-sm"
              />
              <input
                type="text"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="Display name (e.g. kiya-admin)"
                className="px-3 py-2 rounded-md border border-stride-border bg-stride-bg-elev text-stride-text-strong focus:outline-none focus:ring-2 focus:ring-stride-accent text-sm"
              />
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-stride-border bg-stride-bg text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={inviteAdmin}
                  onChange={(e) => setInviteAdmin(e.target.checked)}
                  className="accent-stride-accent"
                />
                <ShieldCheck className="w-3.5 h-3.5 text-stride-accent" />
                Admin
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stride-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={invitePassword}
                  onChange={(e) => setInvitePassword(e.target.value)}
                  placeholder="Password (min. 8 characters)"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full pl-9 pr-10 py-2 rounded-md border border-stride-border bg-stride-bg-elev text-stride-text-strong focus:outline-none focus:ring-2 focus:ring-stride-accent text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-stride-text-muted hover:text-stride-text-strong"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setInvitePassword(generatePassword());
                  setShowPassword(true);
                }}
                className="px-3 py-2 rounded-md border border-stride-border bg-stride-bg text-sm text-stride-text-strong hover:bg-stride-bg-elev inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-stride-accent" />
                Generate
              </button>
            </div>
            <label className="flex items-center gap-2 text-sm text-stride-text-strong cursor-pointer select-none">
              <input
                type="checkbox"
                checked={emailUser}
                onChange={(e) => setEmailUser(e.target.checked)}
                className="accent-stride-accent"
              />
              Email these credentials to the user
              <span className="text-xs text-stride-text-muted">
                — they'll see a "you can change this anytime via Forgot password" note.
              </span>
            </label>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={inviting || !inviteEmail.trim() || invitePassword.length < 8}
                className="px-5 py-2 rounded-full bg-stride-navy text-white font-medium hover:shadow-lg disabled:opacity-60 inline-flex items-center gap-2 text-sm"
              >
                {inviting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                Create user
              </button>
              <p className="text-xs text-stride-text-muted">
                Creates the account immediately and (optionally) emails them the credentials.
              </p>
            </div>
          </form>

          {/* Existing invitations */}
          <div className="bg-stride-bg-elev border border-stride-border rounded-2xl overflow-hidden">
            {pendingInvites.length === 0 && invitations.length === 0 && (
              <div className="p-10 text-center text-stride-text-muted">
                <UserPlus className="w-10 h-10 mx-auto mb-2 opacity-60" />
                No invitations yet.
              </div>
            )}
            {invitations.length > 0 && (
              <table className="w-full text-sm">
                <thead className="bg-stride-bg border-b border-stride-border">
                  <tr className="text-left text-[11px] uppercase tracking-wider text-stride-text-muted font-semibold">
                    <th className="px-4 py-2.5">Email</th>
                    <th className="px-4 py-2.5">Display name</th>
                    <th className="px-4 py-2.5">Role</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Created</th>
                    <th className="px-4 py-2.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map((inv) => (
                    <tr key={inv.id} className="border-b border-stride-border/60 last:border-b-0">
                      <td className="px-4 py-3 text-stride-text-strong">{inv.email}</td>
                      <td className="px-4 py-3 text-stride-text-muted">{inv.display_name ?? '—'}</td>
                      <td className="px-4 py-3">
                        {inv.is_admin ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stride-accent/15 text-stride-accent text-[10px] uppercase tracking-wider font-semibold">
                            <ShieldCheck className="w-3 h-3" />
                            Admin
                          </span>
                        ) : (
                          <span className="text-stride-text-muted text-xs">Member</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {inv.consumed_at ? (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] uppercase tracking-wider font-semibold">
                            Accepted
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] uppercase tracking-wider font-semibold">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-stride-text-muted font-mono text-xs">
                        {fmt(inv.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!inv.consumed_at && (
                          <button
                            onClick={() => revokeInvite(inv)}
                            className="text-stride-text-muted hover:text-red-500 transition-colors"
                            aria-label="Revoke invitation"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ACTIVITY */}
      {tab === 'activity' && (
        <div className="bg-stride-bg-elev border border-stride-border rounded-2xl overflow-hidden">
          {loading && activity.length === 0 && (
            <div className="p-10 text-center text-stride-text-muted">
              <Loader2 className="w-6 h-6 animate-spin text-stride-accent mx-auto" />
            </div>
          )}
          {!loading && activity.length === 0 && (
            <div className="p-10 text-center text-stride-text-muted">
              <ScrollText className="w-10 h-10 mx-auto mb-2 opacity-60" />
              No admin activity logged yet.
            </div>
          )}
          {activity.length > 0 && (
            <ul className="divide-y divide-stride-border/60">
              {activity.map((row) => {
                const who = profiles.find((p) => p.id === row.admin_id);
                const whoLabel =
                  who?.display_name ||
                  who?.full_name ||
                  who?.email ||
                  (row.admin_id ? row.admin_id.slice(0, 8) : '—');
                return (
                  <li key={row.id} className="px-4 py-3 flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-stride-accent/15 text-stride-accent text-[10px] flex items-center justify-center font-mono font-semibold">
                      {(whoLabel.match(/[a-z0-9]/i)?.[0] ?? '?').toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-grow">
                      <p className="text-sm text-stride-text-strong">
                        <span className="font-semibold">{whoLabel}</span>
                        <span className="mx-1.5 text-stride-text-muted">·</span>
                        <span className="text-stride-text-muted">{actionLabel(row.action)}</span>
                      </p>
                      {row.resource && (
                        <p className="text-xs text-stride-text-muted mt-0.5">
                          {resourceLabel(row.resource)}
                        </p>
                      )}
                    </div>
                    <span className="flex-shrink-0 text-xs text-stride-text-muted font-mono tabular-nums">
                      {fmt(row.created_at)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

/** One person = one compact accordion row. Expanding reveals per-person
 *  stats, an activity timeline (lazily fetched), and management actions. */
const PersonRow = ({
  profile,
  isSelf,
  open,
  activityState,
  onToggle,
  onRetryActivity,
  onToggleAdmin,
  onRename,
  onDelete,
}: {
  profile: Profile;
  isSelf: boolean;
  open: boolean;
  activityState: PersonActivityState | undefined;
  onToggle: () => void;
  onRetryActivity: () => void;
  onToggleAdmin: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(profile.display_name ?? '');

  const save = () => {
    setEditing(false);
    if (draftName.trim() !== (profile.display_name ?? '')) {
      onRename(draftName.trim());
    }
  };

  const entries = activityState?.entries ?? [];
  const stats = useMemo(() => {
    if (entries.length === 0) return null;
    const counts = new Map<string, number>();
    for (const e of entries) {
      counts.set(e.action, (counts.get(e.action) ?? 0) + 1);
    }
    const top = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    return {
      total: entries.length,
      atLimit: entries.length >= 200,
      top,
      lastActive: entries[0].created_at,
    };
  }, [entries]);

  const name = nameOf(profile);

  return (
    <div className="bg-stride-bg-elev border border-stride-border rounded-2xl overflow-hidden">
      {/* Collapsed header row */}
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-stride-bg/60 transition-colors"
      >
        <span className="flex-shrink-0 w-9 h-9 rounded-full bg-stride-accent/15 text-stride-accent text-xs flex items-center justify-center font-semibold">
          {initialsOf(profile)}
        </span>
        <span className="min-w-0 flex-grow">
          <span className="flex items-center gap-2 min-w-0">
            <span className="font-medium text-stride-text-strong truncate">{name}</span>
            {profile.is_admin && (
              <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stride-accent/15 text-stride-accent text-[10px] uppercase tracking-wider font-semibold">
                <ShieldCheck className="w-3 h-3" />
                Admin
              </span>
            )}
            {isSelf && (
              <span className="flex-shrink-0 text-[10px] uppercase tracking-wider text-stride-text-muted">
                You
              </span>
            )}
          </span>
          <span className="block text-xs text-stride-text-muted truncate">
            {profile.email ?? '—'}
          </span>
        </span>
        <span className="flex-shrink-0 hidden sm:inline-flex items-center gap-1.5 text-xs text-stride-text-muted tabular-nums">
          <Clock className="w-3 h-3" />
          {profile.last_seen_at ? `Seen ${timeAgo(profile.last_seen_at)}` : 'Never seen'}
        </span>
        <ChevronDown
          className={`flex-shrink-0 w-4 h-4 text-stride-text-muted transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Expanded detail */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-stride-border/60 px-4 py-4 space-y-4">
              {/* Activity: loading / error / stats + timeline */}
              {(!activityState || activityState.status === 'loading') && (
                <div className="py-6 text-center">
                  <Loader2 className="w-5 h-5 animate-spin text-stride-accent mx-auto" />
                </div>
              )}

              {activityState?.status === 'error' && (
                <div className="bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 rounded-xl px-4 py-3 text-sm flex items-center justify-between gap-3">
                  <span>Couldn't load activity: {activityState.error}</span>
                  <button
                    onClick={onRetryActivity}
                    className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-medium hover:underline"
                  >
                    <RefreshCcw className="w-3 h-3" />
                    Retry
                  </button>
                </div>
              )}

              {activityState?.status === 'ready' && (
                <>
                  {/* Stats chips */}
                  {stats ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stride-bg border border-stride-border text-xs text-stride-text-strong">
                        <Activity className="w-3 h-3 text-stride-accent" />
                        <span className="font-semibold tabular-nums">
                          {stats.atLimit ? '200+' : stats.total}
                        </span>
                        {stats.total === 1 && !stats.atLimit ? 'action' : 'actions'}
                      </span>
                      {stats.top.map(([action, count]) => (
                        <span
                          key={action}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stride-bg border border-stride-border text-xs text-stride-text-muted"
                        >
                          {actionLabel(action)}
                          <span className="font-semibold text-stride-text-strong tabular-nums">
                            ×{count}
                          </span>
                        </span>
                      ))}
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stride-bg border border-stride-border text-xs text-stride-text-muted">
                        <Clock className="w-3 h-3 text-stride-sky" />
                        Last active {timeAgo(stats.lastActive)}
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-stride-text-muted py-1">
                      No recorded activity yet.
                    </p>
                  )}

                  {/* Timeline: most recent 15 */}
                  {entries.length > 0 && (
                    <ul className="space-y-0.5">
                      {entries.slice(0, 15).map((row) => {
                        const Icon = actionIcon(row.action);
                        const res = resourceLabel(row.resource);
                        return (
                          <li key={row.id} className="flex items-start gap-2.5 py-1.5">
                            <span className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full bg-stride-bg border border-stride-border flex items-center justify-center">
                              <Icon className="w-3 h-3 text-stride-accent" />
                            </span>
                            <span className="min-w-0 flex-grow text-sm">
                              <span className="text-stride-text-strong">
                                {actionLabel(row.action)}
                              </span>
                              {res && (
                                <span className="text-stride-text-muted"> — {res}</span>
                              )}
                            </span>
                            <span
                              className="flex-shrink-0 text-xs text-stride-text-muted tabular-nums"
                              title={fmt(row.created_at)}
                            >
                              {timeAgo(row.created_at)}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </>
              )}

              {/* Management actions */}
              <div className="border-t border-stride-border/60 pt-3 flex flex-wrap items-center gap-2">
                {editing ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') save();
                        if (e.key === 'Escape') {
                          setEditing(false);
                          setDraftName(profile.display_name ?? '');
                        }
                      }}
                      placeholder="e.g. kiya-admin"
                      className="px-2 py-1 rounded-md border border-stride-border bg-stride-bg-elev text-stride-text-strong text-sm w-44 focus:outline-none focus:ring-2 focus:ring-stride-accent"
                    />
                    <button
                      onClick={save}
                      className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded"
                      aria-label="Save display name"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setDraftName(profile.display_name ?? '');
                      }}
                      className="p-1 text-stride-text-muted hover:bg-stride-bg rounded"
                      aria-label="Cancel rename"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setDraftName(profile.display_name ?? '');
                      setEditing(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stride-bg border border-stride-border text-xs text-stride-text-strong hover:bg-stride-bg-elev transition-colors"
                  >
                    <Pencil className="w-3 h-3" />
                    {profile.display_name ? 'Rename' : 'Set display name'}
                  </button>
                )}

                <button
                  onClick={onToggleAdmin}
                  disabled={isSelf}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    profile.is_admin
                      ? 'bg-stride-accent/15 text-stride-accent hover:bg-stride-accent/25'
                      : 'bg-stride-bg border border-stride-border text-stride-text-muted hover:text-stride-text-strong'
                  } ${isSelf ? 'cursor-not-allowed opacity-60' : ''}`}
                  title={isSelf ? "You can't change your own role" : 'Toggle admin role'}
                >
                  {profile.is_admin ? (
                    <>
                      <ShieldCheck className="w-3 h-3" />
                      Remove admin
                    </>
                  ) : (
                    <>
                      <Shield className="w-3 h-3" />
                      Make admin
                    </>
                  )}
                </button>

                {!isSelf && (
                  <button
                    onClick={onDelete}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stride-bg border border-stride-border text-xs text-stride-text-muted hover:text-red-500 hover:border-red-500/40 hover:bg-red-500/10 transition-colors"
                    aria-label={`Delete ${profile.display_name || profile.email || 'user'}`}
                    title="Delete user"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete user
                  </button>
                )}

                <span className="ml-auto text-[11px] text-stride-text-muted font-mono">
                  Joined {fmt(profile.created_at)}
                </span>
              </div>

              {profile.full_name && profile.full_name !== profile.display_name && (
                <p className="text-[11px] text-stride-text-muted -mt-2">
                  Full name: {profile.full_name}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PeoplePanel;
