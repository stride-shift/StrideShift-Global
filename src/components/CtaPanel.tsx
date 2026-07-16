import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

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
      <div className="relative overflow-hidden rounded-3xl text-white text-center px-6 sm:px-10 py-14 md:py-20 shadow-2xl">
        {/* Vivid brand gradient — sky into sage, anchored by ink */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-stride-ink via-stride-sky to-stride-sage"
          aria-hidden="true"
        />
        {/* Soft depth so white text stays readable over the lighter stops */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-stride-ink/50 via-stride-ink/10 to-stride-ink/30"
          aria-hidden="true"
        />
        <div
          className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-stride-gold/30 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-28 -left-20 w-96 h-96 rounded-full bg-stride-sky-soft/25 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative max-w-3xl mx-auto">
          {titleHtml ? (
            <h2
              className="font-display text-3xl md:text-4xl lg:text-5xl mb-4 tracking-tight"
              dangerouslySetInnerHTML={{ __html: titleHtml }}
            />
          ) : (
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-4 tracking-tight">
              {title}
            </h2>
          )}
          {sub && <p className="text-white/90 mb-8 leading-relaxed">{sub}</p>}
          <Link
            to={to}
            className="inline-flex items-center px-7 py-3.5 bg-stride-cream text-stride-ink rounded-full hover:shadow-2xl hover:-translate-y-0.5 transition-all group font-semibold"
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
