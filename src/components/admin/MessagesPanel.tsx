import { useEffect, useMemo, useState } from 'react';
import {
  Loader2,
  Mail,
  Building2,
  Inbox,
  Users,
  Check,
  CheckCheck,
  CircleDot,
  RefreshCcw,
  ExternalLink,
  Search,
  Archive,
  ArchiveRestore,
  Globe,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

/* ─────────────────────────────────────────────────────── types */

type MessageStatus = 'new' | 'in_progress' | 'done';
type MessageFilter = MessageStatus | 'archived';

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
  // Added by 20260716230000_messages_status.sql — optional so rows fetched
  // before the migration ran (or cached types) don't break the panel.
  status?: MessageStatus | null;
  archived_at?: string | null;
  referrer?: string | null;
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

const DAY_MS = 86_400_000;

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

const relativeTime = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const mins = Math.floor((Date.now() - d.getTime()) / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} wk${weeks > 1 ? 's' : ''} ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/** Coalesce rows created before the status migration to 'new'. */
const statusOf = (m: ContactMessage): MessageStatus =>
  m.status === 'in_progress' || m.status === 'done' ? m.status : 'new';

const KNOWN_SOURCES: [string, string][] = [
  ['linkedin.com', 'LinkedIn'],
  ['lnkd.in', 'LinkedIn'],
  ['facebook.com', 'Facebook'],
  ['fb.com', 'Facebook'],
  ['fb.me', 'Facebook'],
  ['instagram.com', 'Instagram'],
  ['twitter.com', 'X (Twitter)'],
  ['x.com', 'X (Twitter)'],
  ['t.co', 'X (Twitter)'],
  ['youtube.com', 'YouTube'],
  ['youtu.be', 'YouTube'],
  ['bing.com', 'Bing'],
  ['duckduckgo.com', 'DuckDuckGo'],
];

const prettyReferrer = (raw: string): string => {
  try {
    const host = new URL(raw).hostname.replace(/^www\./i, '').toLowerCase();
    if (/(^|\.)google\./.test(host)) return 'Google';
    for (const [domain, label] of KNOWN_SOURCES) {
      if (host === domain || host.endsWith(`.${domain}`)) return label;
    }
    return host;
  } catch {
    return raw;
  }
};

/** Human label for where a message came from. */
const sourceLabel = (m: ContactMessage): string => {
  if (m.referrer) return prettyReferrer(m.referrer);
  // `source` is the form identifier ('contact_page'), not an origin — only
  // surface it when it carries something more specific.
  if (m.source && m.source !== 'contact_page') return m.source;
  return 'Direct';
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

/* ─────────────────────────────────── workflow config */

const FILTERS: { id: MessageFilter; label: string; icon: typeof Inbox }[] = [
  { id: 'new', label: 'Inbox', icon: Inbox },
  { id: 'in_progress', label: 'Dealing with', icon: Check },
  { id: 'done', label: 'Done', icon: CheckCheck },
  { id: 'archived', label: 'Archived', icon: Archive },
];

const STATUS_OPTIONS: { value: MessageStatus; label: string; icon: typeof Check }[] = [
  { value: 'new', label: 'New', icon: CircleDot },
  { value: 'in_progress', label: 'Dealing with it', icon: Check },
  { value: 'done', label: 'Done', icon: CheckCheck },
];

const EMPTY_STATES: Record<MessageFilter, { title: string; hint: string }> = {
  new: { title: 'Inbox zero', hint: 'New enquiries from the contact form will land here.' },
  in_progress: {
    title: 'Nothing in progress',
    hint: 'Mark a message "Dealing with it" to track it here while you work on it.',
  },
  done: { title: 'Nothing marked done yet', hint: 'Handled messages you tick off will show here.' },
  archived: {
    title: 'No archived messages',
    hint: 'Archive dealt-with messages to keep the inbox clean.',
  },
};

/* ─────────────────────────────────── main panel export */

const MessagesPanel = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'messages' | 'newsletter'>('messages');
  const [filter, setFilter] = useState<MessageFilter>('new');
  const [search, setSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

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

  /* ───────── optimistic writes */

  const updateMessage = async (id: string, patch: Partial<ContactMessage>) => {
    const prev = messages.find((m) => m.id === id);
    setMessages((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    const supa = getSupabase();
    if (!supa) return;
    const { error: e } = await supa.from('contact_messages').update(patch).eq('id', id);
    if (e) {
      if (prev) setMessages((rows) => rows.map((r) => (r.id === id ? prev : r)));
      setError(`Could not update message: ${e.message}`);
    }
  };

  const setStatus = (m: ContactMessage, status: MessageStatus) => {
    if (statusOf(m) === status) return;
    void updateMessage(m.id, { status });
  };

  const toggleArchive = (m: ContactMessage) => {
    void updateMessage(m.id, {
      archived_at: m.archived_at ? null : new Date().toISOString(),
    });
  };

  const toggleExpand = (m: ContactMessage) => {
    const opening = !expandedIds.has(m.id);
    setExpandedIds((ids) => {
      const next = new Set(ids);
      if (next.has(m.id)) next.delete(m.id);
      else next.add(m.id);
      return next;
    });
    // Opening a message clears its unread state — no extra click needed.
    if (opening && !m.read_at) {
      void updateMessage(m.id, { read_at: new Date().toISOString() });
    }
  };

  /* ───────── derived data */

  const filterCounts = useMemo(() => {
    const c: Record<MessageFilter, number> = { new: 0, in_progress: 0, done: 0, archived: 0 };
    for (const m of messages) {
      if (m.archived_at) c.archived += 1;
      else c[statusOf(m)] += 1;
    }
    return c;
  }, [messages]);

  const stats = useMemo(() => {
    const now = Date.now();
    const ageOf = (m: ContactMessage) => now - new Date(m.created_at).getTime();
    const last30 = messages.filter((m) => ageOf(m) < 30 * DAY_MS).length;
    const prev30 = messages.filter((m) => {
      const age = ageOf(m);
      return age >= 30 * DAY_MS && age < 60 * DAY_MS;
    }).length;
    let avgPerWeek = 0;
    if (messages.length > 0) {
      const oldest = Math.min(...messages.map((m) => new Date(m.created_at).getTime()));
      const weeks = Math.max(1, (now - oldest) / (7 * DAY_MS));
      avgPerWeek = messages.length / weeks;
    }
    const bySource = new Map<string, number>();
    for (const m of messages) {
      const label = sourceLabel(m);
      bySource.set(label, (bySource.get(label) ?? 0) + 1);
    }
    const topSources = [...bySource.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
    return { last30, prev30, delta: last30 - prev30, avgPerWeek, topSources };
  }, [messages]);

  const visibleMessages = useMemo(() => {
    const q = search.trim().toLowerCase();
    return messages.filter((m) => {
      const inTab =
        filter === 'archived' ? !!m.archived_at : !m.archived_at && statusOf(m) === filter;
      if (!inTab) return false;
      if (!q) return true;
      return [m.first_name, m.last_name, m.email, m.company ?? '', m.message]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [messages, filter, search]);

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

  const emptyState = EMPTY_STATES[filter];
  const EmptyIcon = FILTERS.find((f) => f.id === filter)?.icon ?? Inbox;

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
                  source: sourceLabel(m),
                  referrer: m.referrer ?? '',
                  status: statusOf(m),
                  archived_at: m.archived_at ?? '',
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

      {error && (
        <div className="rounded-lg border border-amber-300/60 bg-amber-50 dark:bg-amber-900/20 p-4 text-sm text-amber-900 dark:text-amber-200">
          {error}
        </div>
      )}

      {/* ───────────────────────────── Messages tab */}
      {tab === 'messages' && (
        <>
          {/* Stats strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-stride-bg-elev border border-stride-border rounded-xl p-4">
              <p className="text-[11px] uppercase tracking-wider text-stride-text-muted font-semibold">
                Messages · last 30 days
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="font-display text-2xl text-stride-text-strong">{stats.last30}</p>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium ${
                    stats.delta > 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : stats.delta < 0
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-stride-text-muted'
                  }`}
                >
                  {stats.delta > 0 ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : stats.delta < 0 ? (
                    <TrendingDown className="w-3.5 h-3.5" />
                  ) : (
                    <Minus className="w-3.5 h-3.5" />
                  )}
                  {stats.delta > 0 ? `+${stats.delta}` : stats.delta} vs prev 30d
                </span>
              </div>
            </div>
            <div className="bg-stride-bg-elev border border-stride-border rounded-xl p-4">
              <p className="text-[11px] uppercase tracking-wider text-stride-text-muted font-semibold">
                Average per week
              </p>
              <p className="font-display text-2xl text-stride-text-strong mt-1">
                {stats.avgPerWeek >= 10 ? Math.round(stats.avgPerWeek) : stats.avgPerWeek.toFixed(1)}
              </p>
            </div>
            <div className="bg-stride-bg-elev border border-stride-border rounded-xl p-4">
              <p className="text-[11px] uppercase tracking-wider text-stride-text-muted font-semibold">
                Top sources
              </p>
              {stats.topSources.length === 0 ? (
                <p className="text-sm text-stride-text-muted mt-2">No data yet</p>
              ) : (
                <p className="text-sm text-stride-text-strong mt-2 inline-flex items-center gap-1.5 flex-wrap">
                  <Globe className="w-3.5 h-3.5 text-stride-sky flex-shrink-0" />
                  {stats.topSources.map(([label, n], i) => (
                    <span key={label}>
                      {i > 0 && <span className="text-stride-text-muted mx-1">·</span>}
                      {label} <span className="text-stride-text-muted font-mono text-xs">×{n}</span>
                    </span>
                  ))}
                </p>
              )}
            </div>
          </div>

          {/* Workflow filter tabs + search */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex bg-stride-bg-elev border border-stride-border rounded-full p-1 shadow-sm flex-wrap">
              {FILTERS.map((f) => {
                const Icon = f.icon;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all inline-flex items-center gap-1.5 ${
                      filter === f.id
                        ? 'bg-stride-navy text-white shadow-md'
                        : 'text-stride-text-muted hover:text-stride-text-strong'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {f.label}
                    <span
                      className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                        filter === f.id ? 'bg-white/15' : 'bg-stride-bg'
                      }`}
                    >
                      {filterCounts[f.id]}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="relative flex-grow min-w-[180px] max-w-xs ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stride-text-muted" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, message…"
                className="w-full pl-9 pr-3 py-2 rounded-full bg-stride-bg-elev border border-stride-border text-sm text-stride-text-strong placeholder:text-stride-text-muted focus:outline-none focus:ring-1 focus:ring-stride-accent/50"
              />
            </div>
          </div>

          {/* Message cards */}
          <div className="space-y-3">
            {loading && messages.length === 0 && (
              <div className="text-center py-12 text-stride-text-muted">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </div>
            )}
            {!loading && visibleMessages.length === 0 && (
              <div className="bg-stride-bg-elev border border-stride-border rounded-2xl text-center py-12 px-6 text-stride-text-muted">
                <EmptyIcon className="w-10 h-10 mx-auto mb-3 opacity-60" />
                {search.trim() ? (
                  <p className="text-sm">No messages match "{search.trim()}".</p>
                ) : (
                  <>
                    <p className="text-stride-text-strong font-medium mb-1">{emptyState.title}</p>
                    <p className="text-sm">{emptyState.hint}</p>
                  </>
                )}
              </div>
            )}
            {visibleMessages.map((m) => {
              const expanded = expandedIds.has(m.id);
              const status = statusOf(m);
              return (
                <article
                  key={m.id}
                  className={`bg-stride-bg-elev border rounded-2xl transition-colors ${
                    m.read_at
                      ? 'border-stride-border'
                      : 'border-stride-accent/40 ring-1 ring-stride-accent/20'
                  }`}
                >
                  {/* Clickable body — expands and clears unread */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleExpand(m)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleExpand(m);
                      }
                    }}
                    className="p-5 pb-3 cursor-pointer select-text"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {!m.read_at && (
                            <span
                              className="w-2 h-2 rounded-full bg-stride-accent flex-shrink-0"
                              title="Unread"
                            />
                          )}
                          <h4 className="font-display text-lg text-stride-text-strong tracking-tight">
                            {m.first_name} {m.last_name}
                          </h4>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stride-bg border border-stride-border text-[10px] uppercase tracking-wider font-semibold text-stride-sky">
                            <Globe className="w-2.5 h-2.5" />
                            {sourceLabel(m)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-stride-text-muted flex-wrap">
                          <a
                            href={`mailto:${m.email}`}
                            onClick={(e) => e.stopPropagation()}
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
                        </div>
                      </div>
                      <span
                        className="flex-shrink-0 text-xs text-stride-text-muted font-mono"
                        title={formatDate(m.created_at)}
                      >
                        {relativeTime(m.created_at)}
                      </span>
                    </div>
                    <p
                      className={`text-sm text-stride-text-strong leading-relaxed whitespace-pre-wrap mt-3 pt-3 border-t border-stride-border/60 ${
                        expanded ? '' : 'line-clamp-2'
                      }`}
                    >
                      {m.message}
                    </p>
                    {!expanded && (
                      <span className="text-[11px] text-stride-text-muted mt-1 inline-block">
                        Click to expand
                      </span>
                    )}
                  </div>

                  {/* Workflow actions */}
                  <div className="flex flex-wrap items-center gap-2 px-5 pb-4 pt-1">
                    <div className="inline-flex bg-stride-bg border border-stride-border rounded-full p-0.5">
                      {STATUS_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const active = status === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => setStatus(m, opt.value)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all inline-flex items-center gap-1 ${
                              active
                                ? 'bg-stride-navy text-white shadow-sm'
                                : 'text-stride-text-muted hover:text-stride-text-strong'
                            }`}
                          >
                            <Icon className="w-3 h-3" />
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex-grow" />
                    <button
                      onClick={() => toggleArchive(m)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-stride-border text-stride-text-muted hover:text-stride-text-strong hover:bg-stride-bg transition-colors"
                    >
                      {m.archived_at ? (
                        <>
                          <ArchiveRestore className="w-3 h-3" />
                          Unarchive
                        </>
                      ) : (
                        <>
                          <Archive className="w-3 h-3" />
                          Archive
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}

      {/* ───────────────────────────── Newsletter tab */}
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
