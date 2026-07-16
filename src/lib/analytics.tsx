import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getSupabase } from '@/lib/supabase';
import { hasAnalyticsConsent } from '@/lib/consent';

/**
 * Lightweight first-party analytics. Logs pageviews + clicks to the Supabase
 * `analytics_events` table (columns: event 'view'|'click', path, target,
 * session_id). No-ops gracefully when Supabase isn't configured, and only
 * runs after the visitor accepts non-essential cookies (POPIA consent).
 */

const SESSION_KEY = 'stride-analytics-session';

export function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr';
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export type EventKind = 'view' | 'click';

export async function track(event: EventKind, path: string, target?: string) {
  if (!hasAnalyticsConsent()) return;
  const supa = getSupabase();
  if (!supa) return;
  try {
    await supa.from('analytics_events').insert({
      event,
      path,
      target: target ?? null,
      session_id: getSessionId(),
      referrer: typeof document !== 'undefined' ? document.referrer || null : null,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    });
  } catch {
    /* analytics must never break the app */
  }
}

/** CTA-ish labels — used to compute the "CTA clicks" metric. */
const CTA_TERMS = ['conversation', 'contact', 'get started', 'started', 'talk', 'subscribe', 'demo'];

export function isCtaLabel(label: string | null | undefined): boolean {
  if (!label) return false;
  const l = label.toLowerCase();
  return CTA_TERMS.some((t) => l.includes(t));
}

/**
 * Drop <AnalyticsTracker /> once inside the Router. Tracks pageviews on route
 * change and clicks on links/buttons site-wide.
 */
export function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    track('view', location.pathname + location.search);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const el = target?.closest('a, button');
      if (!el) return;
      const label = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80);
      if (!label) return;
      track('click', window.location.pathname, label);
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true } as any);
  }, []);

  return null;
}
