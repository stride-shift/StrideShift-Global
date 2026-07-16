/**
 * Cookie-consent state for non-essential cookies/analytics.
 *
 * The visitor's choice is stored in localStorage and broadcast via a custom
 * event so the banner and the analytics layer stay in sync without a
 * provider. Essential functionality never depends on this; only analytics
 * (and any future non-essential trackers) check it.
 */

const CONSENT_KEY = 'stride-cookie-consent';
const CONSENT_EVENT = 'stride-consent-change';

export type ConsentChoice = 'accepted' | 'declined';

export function getConsent(): ConsentChoice | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === 'accepted' || v === 'declined' ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(choice: ConsentChoice) {
  try {
    window.localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    /* private mode — the banner will just reappear next visit */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: choice }));
}

export function onConsentChange(cb: (choice: ConsentChoice) => void): () => void {
  const handler = (e: Event) => cb((e as CustomEvent<ConsentChoice>).detail);
  window.addEventListener(CONSENT_EVENT, handler);
  return () => window.removeEventListener(CONSENT_EVENT, handler);
}

/** True only when the visitor has explicitly accepted non-essential cookies. */
export function hasAnalyticsConsent(): boolean {
  return getConsent() === 'accepted';
}
