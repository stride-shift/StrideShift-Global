import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getConsent, setConsent } from '@/lib/consent';

/**
 * Simple cookie-consent banner: visitors accept or decline non-essential
 * cookies (first-party analytics). Essential cookies are unaffected. The
 * choice persists in localStorage; the banner never reappears once answered.
 */
const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Small delay so the banner doesn't compete with the hero animation.
    const t = window.setTimeout(() => setVisible(getConsent() === null), 1200);
    return () => window.clearTimeout(t);
  }, []);

  const choose = (choice: 'accepted' | 'declined') => {
    setConsent(choice);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 96, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 96, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[70]"
          role="dialog"
          aria-label="Cookie consent"
        >
          <div className="rounded-2xl border border-stride-border bg-stride-bg-elev shadow-2xl p-5">
            <p className="text-sm text-stride-text-strong font-semibold mb-1.5">Cookies on this site</p>
            <p className="text-xs text-stride-text-muted leading-relaxed mb-4">
              We use essential cookies to make this site work, and optional analytics cookies to
              understand how visitors use it. You can accept or decline the optional ones — see our{' '}
              <Link to="/privacy-policy" className="underline text-stride-accent hover:opacity-80">
                Privacy Policy
              </Link>{' '}
              for details.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => choose('accepted')}
                className="flex-1 px-4 py-2 rounded-lg bg-stride-navy text-white dark:bg-stride-gold dark:text-stride-ink-deep text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Accept
              </button>
              <button
                onClick={() => choose('declined')}
                className="flex-1 px-4 py-2 rounded-lg border border-stride-border text-stride-text-strong text-sm font-medium hover:bg-stride-bg transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;
