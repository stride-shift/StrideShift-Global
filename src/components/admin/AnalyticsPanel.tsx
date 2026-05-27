import { useEffect, useState } from 'react';
import { Loader2, RefreshCw, TrendingUp } from 'lucide-react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { isCtaLabel } from '@/lib/analytics';

interface EventRow {
  session_id: string | null;
  path: string | null;
  event: string | null;
  target: string | null;
  created_at: string;
}

interface Stats {
  pageviews: number;
  sessions: number;
  perSession: string;
  ctaClicks: number;
  ctr: string;
  subscribers: number;
  topPages: { path: string; views: number }[];
  topClicks: { label: string; clicks: number }[];
}

const EMPTY: Stats = {
  pageviews: 0,
  sessions: 0,
  perSession: '0',
  ctaClicks: 0,
  ctr: '0.0%',
  subscribers: 0,
  topPages: [],
  topClicks: [],
};

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
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error: err } = await supa
        .from('analytics_events')
        .select('session_id,path,event,target,created_at')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(10000);
      if (err) throw err;

      const rows = (data ?? []) as EventRow[];
      const views = rows.filter((r) => r.event === 'view');
      const clicks = rows.filter((r) => r.event === 'click');
      const sessions = new Set(rows.map((r) => r.session_id).filter(Boolean)).size;
      const ctaClicks = clicks.filter((r) => isCtaLabel(r.target)).length;

      const pageCount: Record<string, number> = {};
      views.forEach((r) => {
        const p = r.path || '/';
        pageCount[p] = (pageCount[p] || 0) + 1;
      });
      const topPages = Object.entries(pageCount)
        .map(([path, v]) => ({ path, views: v }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 8);

      const clickCount: Record<string, number> = {};
      clicks.forEach((r) => {
        const l = r.target || '(unlabelled)';
        clickCount[l] = (clickCount[l] || 0) + 1;
      });
      const topClicks = Object.entries(clickCount)
        .map(([label, c]) => ({ label, clicks: c }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 8);

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
        pageviews: views.length,
        sessions,
        perSession: sessions ? (views.length / sessions).toFixed(1) : '0',
        ctaClicks,
        ctr: views.length ? `${((ctaClicks / views.length) * 100).toFixed(1)}%` : '0.0%',
        subscribers,
        topPages,
        topClicks,
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

  const cards = [
    { label: 'Pageviews (30d)', value: stats.pageviews },
    { label: 'Unique sessions (30d)', value: stats.sessions },
    { label: 'Pages / session', value: stats.perSession },
    { label: 'CTA clicks (30d)', value: stats.ctaClicks },
    { label: 'CTR', value: stats.ctr },
    { label: 'Subscribers', value: stats.subscribers },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-stride-text-muted">
          First-party analytics — last 30 days. Updates as visitors browse the site.
        </p>
        <button
          onClick={load}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-stride-text-strong hover:bg-stride-bg transition-colors border border-stride-border"
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

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="bg-stride-bg-elev border border-stride-border rounded-2xl p-5"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-stride-text-muted font-semibold mb-2">
              {c.label}
            </p>
            <p className="font-display text-4xl text-stride-text-strong tabular-nums">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Top pages + Top clicks */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-stride-bg-elev border border-stride-border rounded-2xl overflow-hidden">
          <header className="px-5 py-4 border-b border-stride-border">
            <h3 className="font-display text-lg text-stride-text-strong tracking-tight">
              Top pages (30d)
            </h3>
          </header>
          {stats.topPages.length === 0 ? (
            <p className="px-5 py-6 text-sm text-stride-text-muted">No pageview data yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-stride-text-muted">
                <tr>
                  <th className="text-left px-5 py-2 font-medium uppercase text-xs tracking-wider">
                    Path
                  </th>
                  <th className="text-right px-5 py-2 font-medium uppercase text-xs tracking-wider">
                    Views
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.topPages.map((p) => (
                  <tr key={p.path} className="border-t border-stride-border/60">
                    <td className="px-5 py-3 text-stride-text-strong font-mono text-xs truncate max-w-[280px]">
                      {p.path}
                    </td>
                    <td className="px-5 py-3 text-right text-stride-text-strong tabular-nums">
                      {p.views}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-stride-bg-elev border border-stride-border rounded-2xl overflow-hidden">
          <header className="px-5 py-4 border-b border-stride-border">
            <h3 className="font-display text-lg text-stride-text-strong tracking-tight">
              Top clicks (30d)
            </h3>
          </header>
          {stats.topClicks.length === 0 ? (
            <p className="px-5 py-6 text-sm text-stride-text-muted">No click data yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-stride-text-muted">
                <tr>
                  <th className="text-left px-5 py-2 font-medium uppercase text-xs tracking-wider">
                    Label
                  </th>
                  <th className="text-right px-5 py-2 font-medium uppercase text-xs tracking-wider">
                    Clicks
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.topClicks.map((c) => (
                  <tr key={c.label} className="border-t border-stride-border/60">
                    <td className="px-5 py-3 text-stride-text-strong truncate max-w-[280px]">
                      {c.label}
                    </td>
                    <td className="px-5 py-3 text-right text-stride-text-strong tabular-nums">
                      {c.clicks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
