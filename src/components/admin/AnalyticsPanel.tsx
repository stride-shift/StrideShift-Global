import { useEffect, useMemo, useState } from 'react';
import {
  Loader2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Users,
  MousePointerClick,
  Mail,
  Globe,
  Monitor,
  Smartphone,
} from 'lucide-react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { isCtaLabel } from '@/lib/analytics';

/**
 * First-party analytics dashboard. Everything is computed from the
 * analytics_events table (views + clicks with session ids and referrers).
 * Numbers cover the last 30 days and are compared against the 30 days
 * before that. Only visitors who accepted analytics cookies are counted.
 */

interface EventRow {
  session_id: string | null;
  path: string | null;
  event: string | null;
  target: string | null;
  referrer: string | null;
  user_agent: string | null;
  created_at: string;
}

interface RankedRow {
  label: string;
  sub?: string;
  count: number;
  share: number; // 0..1 of the max in the list (bar length)
  isCta?: boolean;
}

interface DayPoint {
  date: Date;
  views: number;
}

interface Stats {
  pageviews: number;
  sessions: number;
  perSession: string;
  ctaClicks: number;
  ctr: string;
  subscribers: number;
  deltas: { pageviews: number | null; sessions: number | null; ctaClicks: number | null };
  topPages: RankedRow[];
  topClicks: RankedRow[];
  sources: RankedRow[];
  devices: { desktop: number; mobile: number };
  daily: DayPoint[];
}

const EMPTY: Stats = {
  pageviews: 0,
  sessions: 0,
  perSession: '0',
  ctaClicks: 0,
  ctr: '0.0%',
  subscribers: 0,
  deltas: { pageviews: null, sessions: null, ctaClicks: null },
  topPages: [],
  topClicks: [],
  sources: [],
  devices: { desktop: 0, mobile: 0 },
  daily: [],
};

/* ---------- friendly naming ---------- */

const PAGE_NAMES: Record<string, string> = {
  '/': 'Home',
  '/about': 'About',
  '/team': 'Team',
  '/contact': 'Contact',
  '/blog': 'Ideas (blog index)',
  '/solutions': 'Solutions (overview)',
  '/privacy-policy': 'Privacy Policy',
  '/sign-in': 'Sign in',
  '/forgot-password': 'Forgot password',
  '/reset-password': 'Reset password',
};

const titleCase = (slug: string) =>
  slug
    .split('-')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');

function friendlyPage(path: string): { label: string; sub?: string } {
  const clean = path.split('?')[0].replace(/\/+$/, '') || '/';
  if (PAGE_NAMES[clean]) return { label: PAGE_NAMES[clean], sub: clean === '/' ? undefined : clean };
  if (clean.startsWith('/solutions/'))
    return { label: `Solution — ${titleCase(clean.slice('/solutions/'.length))}`, sub: clean };
  if (clean.startsWith('/blog/'))
    return { label: `Idea — ${titleCase(clean.slice('/blog/'.length))}`, sub: clean };
  if (clean.startsWith('/admin')) return { label: 'Admin dashboard', sub: clean };
  return { label: clean, sub: undefined };
}

function friendlySource(referrer: string | null): string {
  if (!referrer) return 'Direct / typed in';
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, '');
    if (/strideshift|stride-shift|localhost/.test(host)) return '__internal__';
    if (host.includes('google.')) return 'Google search';
    if (host.includes('bing.')) return 'Bing search';
    if (host.includes('duckduckgo')) return 'DuckDuckGo';
    if (host.includes('linkedin')) return 'LinkedIn';
    if (host === 't.co' || host.includes('twitter') || host === 'x.com') return 'X (Twitter)';
    if (host.includes('facebook') || host === 'fb.me') return 'Facebook';
    if (host.includes('instagram')) return 'Instagram';
    return host;
  } catch {
    return 'Direct / typed in';
  }
}

const rank = (counts: Record<string, number>, top: number): RankedRow[] => {
  const rows = Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, top);
  const max = rows[0]?.count || 1;
  return rows.map((r) => ({ ...r, share: r.count / max }));
};

/* ---------- small presentational pieces ---------- */

const Delta = ({ value }: { value: number | null }) => {
  if (value === null) return null;
  const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : Minus;
  const tone =
    value > 0
      ? 'text-emerald-600 dark:text-emerald-400'
      : value < 0
      ? 'text-red-500 dark:text-red-400'
      : 'text-stride-text-muted';
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${tone}`}>
      <Icon className="w-3.5 h-3.5" />
      {value > 0 ? '+' : ''}
      {value}% vs previous 30 days
    </span>
  );
};

/** Horizontal magnitude bar behind a ranked row — single hue, thin mark. */
const RankBar = ({ share }: { share: number }) => (
  <div className="h-1.5 rounded-full bg-stride-border/50 overflow-hidden" aria-hidden="true">
    <div
      className="h-full rounded-full"
      style={{ width: `${Math.max(share * 100, 3)}%`, background: 'hsl(var(--stride-sky))' }}
    />
  </div>
);

const RankedList = ({
  rows,
  countLabel,
  empty,
}: {
  rows: RankedRow[];
  countLabel: string;
  empty: string;
}) => {
  if (rows.length === 0) return <p className="px-5 py-6 text-sm text-stride-text-muted">{empty}</p>;
  return (
    <ul className="px-5 py-3 space-y-3">
      {rows.map((r) => (
        <li key={r.label + (r.sub ?? '')}>
          <div className="flex items-baseline justify-between gap-3 mb-1">
            <span className="text-sm text-stride-text-strong truncate">
              {r.label}
              {r.isCta && (
                <span className="ml-2 text-[10px] uppercase tracking-wider font-semibold text-stride-gold">
                  CTA
                </span>
              )}
              {r.sub && (
                <span className="ml-2 font-mono text-[11px] text-stride-text-muted">{r.sub}</span>
              )}
            </span>
            <span className="text-sm text-stride-text-strong tabular-nums flex-shrink-0">
              {r.count}
              <span className="text-stride-text-muted text-xs ml-1">{countLabel}</span>
            </span>
          </div>
          <RankBar share={r.share} />
        </li>
      ))}
    </ul>
  );
};

const Card = ({
  title,
  explain,
  children,
}: {
  title: string;
  explain: string;
  children: React.ReactNode;
}) => (
  <div className="bg-stride-bg-elev border border-stride-border rounded-2xl overflow-hidden">
    <header className="px-5 py-4 border-b border-stride-border">
      <h3 className="font-display text-lg text-stride-text-strong tracking-tight">{title}</h3>
      <p className="text-xs text-stride-text-muted mt-0.5 leading-relaxed">{explain}</p>
    </header>
    {children}
  </div>
);

/** Daily views — thin single-series bars with a hover tooltip. */
const DailyChart = ({ daily }: { daily: DayPoint[] }) => {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...daily.map((d) => d.views), 1);
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  return (
    <div className="px-5 pt-4 pb-3">
      <div className="relative">
        {hover !== null && daily[hover] && (
          <div
            className="absolute -top-1 -translate-y-full pointer-events-none z-10 px-2.5 py-1.5 rounded-md bg-stride-ink-deep text-white text-xs whitespace-nowrap shadow-lg"
            style={{ left: `${((hover + 0.5) / daily.length) * 100}%`, transform: 'translate(-50%, -100%)' }}
          >
            <span className="font-semibold tabular-nums">{daily[hover].views}</span> views ·{' '}
            {fmt(daily[hover].date)}
          </div>
        )}
        <div className="flex items-end gap-[2px] h-32" role="img" aria-label="Daily page views, last 30 days">
          {daily.map((d, i) => (
            <div
              key={d.date.toISOString()}
              className="flex-1 h-full flex items-end cursor-default"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <div
                className="w-full rounded-t-[3px] transition-opacity"
                style={{
                  height: `${(d.views / max) * 100}%`,
                  minHeight: d.views > 0 ? 3 : 1,
                  background:
                    d.views > 0 ? 'hsl(var(--stride-sky))' : 'hsl(var(--stride-border))',
                  opacity: hover === null || hover === i ? 1 : 0.45,
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between mt-2 text-[11px] text-stride-text-muted">
        <span>{daily.length ? fmt(daily[0].date) : ''}</span>
        <span>{daily.length ? fmt(daily[Math.floor(daily.length / 2)].date) : ''}</span>
        <span>{daily.length ? fmt(daily[daily.length - 1].date) : ''}</span>
      </div>
    </div>
  );
};

/* ---------- main panel ---------- */

const AnalyticsPanel = () => {
  const [stats, setStats] = useState<Stats>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const supa = getSupabase();
    if (!supa) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const now = Date.now();
      const since30 = new Date(now - 30 * 24 * 60 * 60 * 1000);
      const since60 = new Date(now - 60 * 24 * 60 * 60 * 1000);
      const { data, error: err } = await supa
        .from('analytics_events')
        .select('session_id,path,event,target,referrer,user_agent,created_at')
        .gte('created_at', since60.toISOString())
        .order('created_at', { ascending: false })
        .limit(20000);
      if (err) throw err;

      const all = (data ?? []) as EventRow[];
      const current = all.filter((r) => new Date(r.created_at) >= since30);
      const previous = all.filter((r) => new Date(r.created_at) < since30);

      const agg = (rows: EventRow[]) => {
        const views = rows.filter((r) => r.event === 'view');
        const clicks = rows.filter((r) => r.event === 'click');
        return {
          views,
          clicks,
          sessions: new Set(rows.map((r) => r.session_id).filter(Boolean)).size,
          ctaClicks: clicks.filter((r) => isCtaLabel(r.target)).length,
        };
      };
      const cur = agg(current);
      const prev = agg(previous);

      const pct = (a: number, b: number): number | null =>
        b === 0 ? null : Math.round(((a - b) / b) * 100);

      // Top pages — friendly names
      const pageCount: Record<string, number> = {};
      cur.views.forEach((r) => {
        const p = r.path || '/';
        pageCount[p] = (pageCount[p] || 0) + 1;
      });
      const topPages: RankedRow[] = rank(pageCount, 8).map((r) => {
        const f = friendlyPage(r.label);
        return { ...r, label: f.label, sub: f.sub };
      });

      // Top clicks
      const clickCount: Record<string, number> = {};
      cur.clicks.forEach((r) => {
        const l = r.target || '(unlabelled)';
        clickCount[l] = (clickCount[l] || 0) + 1;
      });
      const topClicks: RankedRow[] = rank(clickCount, 8).map((r) => ({
        ...r,
        isCta: isCtaLabel(r.label),
      }));

      // Traffic sources (views only, first touch per event; internal nav excluded)
      const srcCount: Record<string, number> = {};
      cur.views.forEach((r) => {
        const s = friendlySource(r.referrer);
        if (s === '__internal__') return;
        srcCount[s] = (srcCount[s] || 0) + 1;
      });
      const sources = rank(srcCount, 6);

      // Devices (unique sessions)
      const deviceBySession = new Map<string, 'mobile' | 'desktop'>();
      current.forEach((r) => {
        if (!r.session_id || deviceBySession.has(r.session_id)) return;
        deviceBySession.set(r.session_id, /Mobi|Android|iPhone/i.test(r.user_agent || '') ? 'mobile' : 'desktop');
      });
      let mobile = 0;
      deviceBySession.forEach((v) => v === 'mobile' && mobile++);
      const devices = { mobile, desktop: deviceBySession.size - mobile };

      // Daily views series — 30 buckets, oldest → newest
      const dayMs = 24 * 60 * 60 * 1000;
      const startOfDay = (t: number) => {
        const d = new Date(t);
        d.setHours(0, 0, 0, 0);
        return d;
      };
      const daily: DayPoint[] = Array.from({ length: 30 }, (_, i) => ({
        date: startOfDay(now - (29 - i) * dayMs),
        views: 0,
      }));
      cur.views.forEach((r) => {
        const t = startOfDay(new Date(r.created_at).getTime()).getTime();
        const idx = daily.findIndex((d) => d.date.getTime() === t);
        if (idx >= 0) daily[idx].views++;
      });

      let subscribers = 0;
      try {
        const { count } = await supa
          .from('newsletter_subscribers')
          .select('id', { count: 'exact', head: true });
        subscribers = count ?? 0;
      } catch {
        /* table may not exist yet */
      }

      setStats({
        pageviews: cur.views.length,
        sessions: cur.sessions,
        perSession: cur.sessions ? (cur.views.length / cur.sessions).toFixed(1) : '0',
        ctaClicks: cur.ctaClicks,
        ctr: cur.views.length
          ? `${((cur.ctaClicks / cur.views.length) * 100).toFixed(1)}%`
          : '0.0%',
        subscribers,
        deltas: {
          pageviews: pct(cur.views.length, prev.views.length),
          sessions: pct(cur.sessions, prev.sessions),
          ctaClicks: pct(cur.ctaClicks, prev.ctaClicks),
        },
        topPages,
        topClicks,
        sources,
        devices,
        daily,
      });
    } catch (e: any) {
      setError(
        e?.message ||
          'Could not load analytics. Make sure the analytics_events table exists (SQL in .env.example).'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summary = useMemo(() => {
    if (!stats.pageviews) return null;
    const dev = stats.devices;
    const total = dev.desktop + dev.mobile || 1;
    return (
      `In the last 30 days, ${stats.sessions} ${stats.sessions === 1 ? 'visitor' : 'visitors'} ` +
      `viewed ${stats.pageviews} pages (about ${stats.perSession} pages each). ` +
      `${stats.ctaClicks} clicks landed on a call-to-action, and ` +
      `${Math.round((dev.mobile / total) * 100)}% of visits came from a phone.`
    );
  }, [stats]);

  if (!isSupabaseConfigured()) {
    return (
      <div className="bg-stride-bg-elev border border-stride-border rounded-2xl p-8 text-center">
        <TrendingUp className="w-10 h-10 text-stride-accent mx-auto mb-3" />
        <p className="text-stride-text-strong font-medium mb-1">Analytics needs Supabase</p>
        <p className="text-sm text-stride-text-muted">
          Configure Supabase and create the <code className="font-mono">analytics_events</code>{' '}
          table (SQL in <code className="font-mono">.env.example</code>) to start collecting data.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-7 h-7 animate-spin text-stride-accent" />
      </div>
    );
  }

  const tiles = [
    {
      icon: Users,
      label: 'Visitors',
      value: stats.sessions,
      delta: stats.deltas.sessions,
      explain: 'Unique browsing sessions — roughly, how many people came.',
    },
    {
      icon: Eye,
      label: 'Page views',
      value: stats.pageviews,
      delta: stats.deltas.pageviews,
      explain: 'Total pages opened. One visitor reading 5 pages counts 5 times.',
    },
    {
      icon: TrendingUp,
      label: 'Pages per visit',
      value: stats.perSession,
      delta: null,
      explain: 'How deep people go. Above 2 means they explore beyond the landing page.',
    },
    {
      icon: MousePointerClick,
      label: 'CTA clicks',
      value: stats.ctaClicks,
      delta: stats.deltas.ctaClicks,
      explain: 'Clicks on action buttons — "Start a conversation", "Contact", "Subscribe"…',
    },
    {
      icon: MousePointerClick,
      label: 'CTA click rate',
      value: stats.ctr,
      delta: null,
      explain: 'CTA clicks as a share of all page views. Higher = more persuasive pages.',
    },
    {
      icon: Mail,
      label: 'Newsletter subscribers',
      value: stats.subscribers,
      delta: null,
      explain: 'Total emails on the newsletter list (all time, not just 30 days).',
    },
  ];

  const totalDevices = stats.devices.desktop + stats.devices.mobile;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-stride-text-muted leading-relaxed max-w-2xl">
          Private, first-party analytics for the last 30 days — no Google, no third parties. Only
          visitors who <strong className="text-stride-text-strong">accept analytics cookies</strong>{' '}
          are counted, so real traffic is a little higher than these numbers.
        </p>
        <button
          onClick={load}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-stride-text-strong hover:bg-stride-bg transition-colors border border-stride-border flex-shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-300/60 bg-amber-50 dark:bg-amber-900/20 p-4 text-sm text-amber-900 dark:text-amber-200">
          {error}
        </div>
      )}

      {summary && (
        <div className="rounded-2xl border border-stride-sky/30 bg-stride-sky/[0.07] px-5 py-4">
          <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-stride-sky mb-1">
            The story in one line
          </p>
          <p className="text-sm text-stride-text-strong leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Stat tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiles.map((t) => (
          <div key={t.label} className="bg-stride-bg-elev border border-stride-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <t.icon className="w-4 h-4 text-stride-sky" />
              <p className="text-xs uppercase tracking-[0.18em] text-stride-text-muted font-semibold">
                {t.label}
              </p>
            </div>
            <p className="font-display text-4xl text-stride-text-strong tabular-nums leading-none mb-2">
              {t.value}
            </p>
            <Delta value={t.delta} />
            <p className="text-xs text-stride-text-muted leading-relaxed mt-2">{t.explain}</p>
          </div>
        ))}
      </div>

      {/* Daily trend */}
      <Card
        title="Page views, day by day"
        explain="Each bar is one day over the last 30. Spikes usually line up with newsletters, posts, or someone sharing a link — hover a bar for the exact count."
      >
        {stats.daily.some((d) => d.views > 0) ? (
          <DailyChart daily={stats.daily} />
        ) : (
          <p className="px-5 py-6 text-sm text-stride-text-muted">No daily data yet.</p>
        )}
      </Card>

      {/* Top pages + Top clicks */}
      <div className="grid lg:grid-cols-2 gap-5">
        <Card
          title="Most-visited pages"
          explain="Where visitors actually spend their attention. The bar shows each page relative to the most-visited one."
        >
          <RankedList rows={stats.topPages} countLabel="views" empty="No pageview data yet." />
        </Card>

        <Card
          title="What visitors click"
          explain="The buttons and links people press most. Gold CTA tags mark the clicks that matter for business — contact, subscribe, start a conversation."
        >
          <RankedList rows={stats.topClicks} countLabel="clicks" empty="No click data yet." />
        </Card>
      </div>

      {/* Sources + devices */}
      <div className="grid lg:grid-cols-2 gap-5">
        <Card
          title="Where visitors come from"
          explain="The site that referred each visit. 'Direct' means someone typed the address, used a bookmark, or came from an app that hides the source (email, WhatsApp…)."
        >
          <RankedList rows={stats.sources} countLabel="views" empty="No referrer data yet." />
        </Card>

        <Card
          title="Desktop vs mobile"
          explain="Which device each visitor used, counted once per visit. If mobile is high, that's the experience to test first."
        >
          {totalDevices === 0 ? (
            <p className="px-5 py-6 text-sm text-stride-text-muted">No device data yet.</p>
          ) : (
            <div className="px-5 py-5 space-y-4">
              {(
                [
                  { icon: Monitor, label: 'Desktop', n: stats.devices.desktop },
                  { icon: Smartphone, label: 'Mobile', n: stats.devices.mobile },
                ] as const
              ).map((d) => (
                <div key={d.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="inline-flex items-center gap-2 text-sm text-stride-text-strong">
                      <d.icon className="w-4 h-4 text-stride-sky" />
                      {d.label}
                    </span>
                    <span className="text-sm text-stride-text-strong tabular-nums">
                      {d.n}
                      <span className="text-stride-text-muted text-xs ml-1.5">
                        ({Math.round((d.n / totalDevices) * 100)}%)
                      </span>
                    </span>
                  </div>
                  <RankBar share={d.n / totalDevices} />
                </div>
              ))}
              <p className="text-xs text-stride-text-muted flex items-center gap-1.5 pt-1">
                <Globe className="w-3.5 h-3.5" />
                Counted per unique visitor session, last 30 days.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
