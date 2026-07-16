import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sanitizeHtml } from '@/lib/sanitize';

/**
 * Shared end-of-page call-to-action: a rounded gradient panel floating on the
 * page background, so it reads well in BOTH light and dark themes and always
 * leaves breathing room before the footer. Used on About, Solutions and the
 * solution detail pages.
 */
const CtaPanel = ({
  title,
  titleHtml,
  sub,
  buttonLabel = 'Start a conversation',
  to = '/contact',
}: {
  title?: string;
  /** Optional HTML title (solution detail titles may carry markup). */
  titleHtml?: string;
  sub?: string;
  buttonLabel?: string;
  to?: string;
}) => (
  <section className="bg-stride-bg py-14 md:py-20">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl text-center px-6 sm:px-10 py-16 md:py-24 shadow-xl border border-stride-sky/25 dark:border-stride-gold/25">
        {/* Day: off-white panel with blue accents. Night: deep ink with gold. */}
        <div className="absolute inset-0 bg-stride-cream-warm dark:bg-stride-ink-deep" aria-hidden="true" />
        {/* Single soft glow rising from the top edge */}
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[44rem] h-72 rounded-full bg-stride-sky/15 dark:bg-stride-gold/20 blur-3xl"
          aria-hidden="true"
        />
        {/* Hairline rule anchoring the top of the panel */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-stride-sky/60 dark:via-stride-gold/70 to-transparent"
          aria-hidden="true"
        />

        <div className="relative max-w-3xl mx-auto">
          <span className="inline-block mb-5 text-[11px] uppercase tracking-[0.28em] font-semibold text-stride-sky dark:text-stride-gold">
            Let&apos;s talk
          </span>
          {titleHtml ? (
            <h2
              className="font-display text-3xl md:text-4xl lg:text-5xl mb-4 tracking-tight text-stride-ink dark:text-white"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(titleHtml) }}
            />
          ) : (
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-4 tracking-tight text-stride-ink dark:text-white">
              {title}
            </h2>
          )}
          {sub && (
            <p className="text-stride-ink/70 dark:text-white/70 mb-9 leading-relaxed max-w-2xl mx-auto">
              {sub}
            </p>
          )}
          <Link
            to={to}
            className="inline-flex items-center px-7 py-3.5 bg-stride-sky text-white dark:bg-stride-gold dark:text-stride-ink-deep rounded-full hover:shadow-[0_10px_40px_-10px_hsl(var(--stride-sky)/0.5)] dark:hover:shadow-[0_10px_40px_-10px_hsl(var(--stride-gold)/0.6)] hover:-translate-y-0.5 transition-all group font-semibold"
          >
            {buttonLabel}
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default CtaPanel;
