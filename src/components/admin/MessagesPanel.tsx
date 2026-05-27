import { useEffect, useState } from 'react';
import {
  Loader2,
  Mail,
  Building2,
  Inbox,
  Users,
  Check,
  RefreshCcw,
  ExternalLink,
} from 'lucide-react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

/* ─────────────────────────────────────────────────────── types */

interface ContactMessage {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string | null;
  message: string;
  source: string | null;
  read_at: string | null;
  created_at: string;
}

interface NewsletterSubscriber {
  id: string;
  email: string;
  source: string | null;
  consent_at: string | null;
  unsubscribed_at: string | null;
  created_at: string;
}

/* ─────────────────────────────────────────────────── helpers */

const formatDate = (iso: string) => {
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

const exportCsv = (rows: Record<string, unknown>[], filename: string) => {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    if (v == null) return '';
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  const csv = [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/* ─────────────────────────────────── main panel export */

const MessagesPanel = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'messages' | 'newsletter'>('messages');

  const load = async () => {
    setLoading(true);
    setError(null);
    const supa = getSupabase();
    if (!supa) {
      setLoading(false);
      return;
    }
    try {
      const [{ data: msgs, error: mErr }, { data: subs, error: sErr }] = await Promise.all([
        supa.from('contact_messages').select('*').order('created_at', { ascending: false }),
        supa
          .from('newsletter_subscribers')
          .select('*')
          .order('created_at', { ascending: false }),
      ]);
      if (mErr) throw new Error(`Messages: ${mErr.message}`);
      if (sErr) throw new Error(`Subscribers: ${sErr.message}`);
      setMessages((msgs ?? []) as ContactMessage[]);
      setSubscribers((subs ?? []) as NewsletterSubscriber[]);
    } catch (e: any) {
      setError(
        e?.message ||
          'Could not load. Make sure migration.sql is run so contact_messages exists.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const markRead = async (id: string) => {
    const supa = getSupabase();
    if (!supa) return;
    const { error: e } = await supa
      .from('contact_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id);
    if (!e) {
      setMessages((rows) =>
        rows.map((r) => (r.id === id ? { ...r, read_at: new Date().toISOString() } : r))
      );
    }
  };

  const unreadCount = messages.filter((m) => !m.read_at).length;

  if (!isSupabaseConfigured()) {
    return (
      <div className="bg-stride-bg-elev border border-stride-border rounded-2xl p-8 text-center">
        <Inbox className="w-10 h-10 text-stride-accent mx-auto mb-3" />
        <h3 className="font-display text-xl text-stride-text-strong mb-2 tracking-tight">
          Supabase isn't configured
        </h3>
        <p className="text-sm text-stride-text-muted max-w-md mx-auto leading-relaxed">
          Messages from the contact form and newsletter signups will appear here once Supabase
          credentials are set in <code className="font-mono text-xs">.env</code> and
          <code className="font-mono text-xs"> migration.sql</code> has been run.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header + actions */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex bg-stride-bg-elev border border-stride-border rounded-full p-1 shadow-sm">
          {(
            [
              { id: 'messages', label: 'Messages', count: messages.length, icon: Inbox },
              { id: 'newsletter', label: 'Newsletter', count: subscribers.length, icon: Users },
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
        {tab === 'newsletter' && subscribers.length > 0 && (
          <button
            onClick={() =>
              exportCsv(
                subscribers.map((s) => ({
                  email: s.email,
                  source: s.source ?? '',
                  consent_at: s.consent_at ?? '',
                  unsubscribed_at: s.unsubscribed_at ?? '',
                  created_at: s.created_at,
                })),
                `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`
              )
            }
            className="px-3.5 py-2 rounded-full bg-stride-navy text-white text-sm hover:bg-stride-navy-dark transition-colors inline-flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Export CSV
          </button>
        )}
        {tab === 'messages' && messages.length > 0 && (
          <button
            onClick={() =>
              exportCsv(
                messages.map((m) => ({
                  created_at: m.created_at,
                  first_name: m.first_name,
                  last_name: m.last_name,
                  email: m.email,
                  company: m.company ?? '',
                  message: m.message,
                  source: m.source ?? '',
                  read_at: m.read_at ?? '',
                })),
                `contact-messages-${new Date().toISOString().slice(0, 10)}.csv`
              )
            }
            className="px-3.5 py-2 rounded-full bg-stride-navy text-white text-sm hover:bg-stride-navy-dark transition-colors inline-flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Export CSV
          </button>
        )}
      </div>

      {/* Header stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-stride-bg-elev border border-stride-border rounded-xl p-4">
          <p className="text-[11px] uppercase tracking-wider text-stride-text-muted font-semibold">
            Total messages
          </p>
          <p className="font-display text-2xl text-stride-text-strong mt-1">{messages.length}</p>
        </div>
        <div className="bg-stride-bg-elev border border-stride-border rounded-xl p-4">
          <p className="text-[11px] uppercase tracking-wider text-stride-text-muted font-semibold">
            Unread
          </p>
          <p className="font-display text-2xl text-stride-text-strong mt-1">
            {unreadCount}
            {unreadCount > 0 && (
              <span className="ml-2 inline-block w-2 h-2 rounded-full bg-amber-500 align-middle" />
            )}
          </p>
        </div>
        <div className="bg-stride-bg-elev border border-stride-border rounded-xl p-4">
          <p className="text-[11px] uppercase tracking-wider text-stride-text-muted font-semibold">
            Subscribers
          </p>
          <p className="font-display text-2xl text-stride-text-strong mt-1">
            {subscribers.length}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Messages list */}
      {tab === 'messages' && (
        <div className="space-y-3">
          {loading && messages.length === 0 && (
            <div className="text-center py-12 text-stride-text-muted">
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            </div>
          )}
          {!loading && messages.length === 0 && (
            <div className="text-center py-12 text-stride-text-muted">
              <Inbox className="w-10 h-10 mx-auto mb-2 opacity-60" />
              No messages yet.
            </div>
          )}
          {messages.map((m) => (
            <article
              key={m.id}
              className={`bg-stride-bg-elev border rounded-xl p-5 transition-colors ${
                m.read_at
                  ? 'border-stride-border'
                  : 'border-stride-accent/40 ring-1 ring-stride-accent/20'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-display text-lg text-stride-text-strong tracking-tight">
                      {m.first_name} {m.last_name}
                    </h4>
                    {!m.read_at && (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] uppercase tracking-wider font-semibold">
                        New
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-stride-text-muted flex-wrap">
                    <a
                      href={`mailto:${m.email}`}
                      className="inline-flex items-center gap-1.5 hover:text-stride-accent"
                    >
                      <Mail className="w-3 h-3" />
                      {m.email}
                    </a>
                    {m.company && (
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 className="w-3 h-3" />
                        {m.company}
                      </span>
                    )}
                    <span className="font-mono">{formatDate(m.created_at)}</span>
                  </div>
                </div>
                {!m.read_at && (
                  <button
                    onClick={() => markRead(m.id)}
                    className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-stride-border text-stride-text-strong hover:bg-stride-bg transition-colors"
                  >
                    <Check className="w-3 h-3" />
                    Mark read
                  </button>
                )}
              </div>
              <p className="text-sm text-stride-text-strong leading-relaxed whitespace-pre-wrap mt-3 pt-3 border-t border-stride-border/60">
                {m.message}
              </p>
            </article>
          ))}
        </div>
      )}

      {/* Newsletter list */}
      {tab === 'newsletter' && (
        <div className="bg-stride-bg-elev border border-stride-border rounded-xl overflow-hidden">
          {loading && subscribers.length === 0 && (
            <div className="text-center py-12 text-stride-text-muted">
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            </div>
          )}
          {!loading && subscribers.length === 0 && (
            <div className="text-center py-12 text-stride-text-muted">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-60" />
              No newsletter subscribers yet.
            </div>
          )}
          {subscribers.length > 0 && (
            <table className="w-full text-sm">
              <thead className="bg-stride-bg border-b border-stride-border">
                <tr className="text-left text-[11px] uppercase tracking-wider text-stride-text-muted font-semibold">
                  <th className="px-4 py-2.5">Email</th>
                  <th className="px-4 py-2.5">Source</th>
                  <th className="px-4 py-2.5">Subscribed</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <tr key={s.id} className="border-b border-stride-border/60 last:border-b-0">
                    <td className="px-4 py-3 text-stride-text-strong">
                      <a href={`mailto:${s.email}`} className="hover:text-stride-accent">
                        {s.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-stride-text-muted">{s.source ?? '—'}</td>
                    <td className="px-4 py-3 text-stride-text-muted font-mono text-xs">
                      {formatDate(s.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      {s.unsubscribed_at ? (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] uppercase tracking-wider font-semibold">
                          Unsubscribed
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] uppercase tracking-wider font-semibold">
                          Active
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default MessagesPanel;
