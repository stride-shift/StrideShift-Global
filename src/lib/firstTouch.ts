// First-touch attribution — remembers where a visitor arrived from
// (document.referrer) for the duration of the browser session, so an
// enquiry submitted several pages later still carries its origin
// (LinkedIn, Facebook, Google, …). Stored only when the visitor
// actively submits the contact form.

const KEY = 'stride-first-touch';

/** Capture document.referrer once per session (external referrers only). */
export const captureFirstTouch = (): void => {
  try {
    if (window.sessionStorage.getItem(KEY)) return;
    const ref = document.referrer;
    if (!ref) return;
    if (new URL(ref).origin === window.location.origin) return;
    window.sessionStorage.setItem(KEY, ref);
  } catch {
    /* sessionStorage unavailable or unparseable referrer — ignore */
  }
};

/** The referrer captured at the start of this session, if any. */
export const getFirstTouch = (): string | null => {
  try {
    return window.sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
};
