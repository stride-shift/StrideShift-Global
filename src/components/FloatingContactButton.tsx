import { MessageSquare } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Floating "Let's talk" button — always visible from the moment a page
 * loads (no scroll threshold). Navigates to /contact so the CTA lands
 * somewhere intentional (not a footer scroll).
 */
const FloatingContactButton = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // No point overlaying the floating CTA on the page it links to.
  if (location.pathname === '/contact') return null;

  const goToContact = () => {
    navigate('/contact');
    window.scrollTo(0, 0);
  };

  return (
    <button
      onClick={goToContact}
      className="group fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 bg-stride-ink hover:bg-stride-ink-deep text-stride-cream rounded-full pl-4 pr-5 py-3 shadow-2xl hover:shadow-[0_24px_60px_-20px_hsl(var(--stride-sky)/0.6)] transition-all hover:-translate-y-0.5"
      aria-label="Let's talk — go to contact page"
    >
      <span className="relative flex items-center justify-center w-7 h-7 rounded-full bg-stride-cream/15 group-hover:bg-stride-cream/25 transition-colors">
        <MessageSquare className="h-3.5 w-3.5" />
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-stride-gold animate-soft-pulse" />
      </span>
      <span className="text-sm font-semibold tracking-tight">Let's talk</span>
    </button>
  );
};

export default FloatingContactButton;
