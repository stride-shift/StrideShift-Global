import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, X, Play, Images } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { findSolution, showcase } from '@/data/stride';
import { RevealOnScrollRoot } from '@/hooks/useScrollReveal';
import { ScrollTiltedGrid } from '@/components/ui/scroll-tilted-grid';
import SectionEyebrow from '@/components/SectionEyebrow';
import { useSiteContent } from '@/hooks/useSiteContent';
import CtaPanel from '@/components/CtaPanel';
import { sanitizeHtml } from '@/lib/sanitize';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};
const item = {
  hidden: { y: 18, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.55 } },
};

const SolutionDetail = () => {
  const { slug } = useParams();
  const solution = slug ? findSolution(slug) : undefined;
  const { content } = useSiteContent();
  const galleryImages = slug ? content.solutionGalleries?.[slug] ?? [] : [];
  const [galleryOpen, setGalleryOpen] = useState(false);

  // Lock body scroll while the gallery overlay is open so only the modal
  // scrolls. Restore on close / unmount.
  useEffect(() => {
    if (!galleryOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setGalleryOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [galleryOpen]);

  if (!solution) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="font-display text-4xl text-stride-text-strong mb-4">Solution not found</h1>
          <p className="text-stride-text-muted mb-8">That solution doesn't exist yet.</p>
          <Link to="/solutions">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Solutions
            </Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  const relatedSolutions = showcase.items.filter((s) => s.slug !== solution.slug).slice(0, 3);

  return (
    <PageLayout>
      <SEO
        title={`${solution.name} · StrideShift`}
        description={solution.hero.lede || solution.intro?.body}
        imageUrl={solution.hero.image}
      />
      {/* key={slug} forces the scroll-reveal observer to re-initialise when the
          user clicks between solutions — without it the observer keeps watching
          the previous page's DOM and the new page never fades in. */}
      <RevealOnScrollRoot key={slug} />

      {/* Hero — two-column: copy + CTAs on left, video card on right */}
      <section className="relative pt-28 md:pt-32 pb-20 md:pb-24 bg-stride-ink text-white overflow-hidden">
        {/* Subtle ambient glow only — no shader template here */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[34rem] h-[34rem] rounded-full bg-stride-sky/12 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-[26rem] h-[26rem] rounded-full bg-stride-sage/10 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/solutions"
            className="inline-flex items-center text-stride-cream/70 text-sm mb-8 hover:text-white transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            All solutions
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-center">
            {/* Left — copy + CTAs */}
            <motion.div initial="hidden" animate="visible" variants={container}>
              <motion.div variants={item} className="mb-5">
                <SectionEyebrow align="left">
                  {solution.hero.eyebrow || solution.category}
                </SectionEyebrow>
              </motion.div>

              <motion.h1
                variants={item}
                className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-[4.25rem] text-white mb-6 tracking-tight leading-[1.04]"
              >
                {solution.hero.title}
              </motion.h1>

              {solution.hero.lede && (
                <motion.p
                  variants={item}
                  className="text-base sm:text-lg text-stride-cream/85 leading-relaxed mb-8 max-w-xl"
                >
                  {solution.hero.lede}
                </motion.p>
              )}

              <motion.div variants={item} className="flex flex-col sm:flex-row flex-wrap gap-3">
                <Link
                  to="/contact"
                  className="group inline-flex items-center justify-center px-6 py-3.5 rounded-lg bg-stride-sky text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  Start a conversation
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-lg bg-white/[0.06] border border-white/15 backdrop-blur-md text-white font-medium hover:bg-white/[0.10] transition-colors"
                >
                  See how it works
                </a>
              </motion.div>
            </motion.div>

            {/* Right — inline video card */}
            <InlineVideoCard
              videoUrl={solution.videoUrl}
              tagline={solution.videoTagline || solution.intro?.title?.replace(/<[^>]*>/g, '')}
              productName={solution.name}
              posterImage={solution.hero.image}
            />
          </div>
        </div>
      </section>

      {/* Intro */}
      {solution.intro && (
        <section className="py-16 md:py-20 bg-stride-bg-elev">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center reveal-on-scroll">
            {solution.intro.title && (
              <h2
                className="font-display text-3xl md:text-4xl lg:text-5xl text-stride-text-strong mb-5 tracking-tight"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(solution.intro.title) }}
              />
            )}
            {solution.intro.body && (
              <p className="text-base md:text-lg text-stride-text-muted leading-relaxed">
                {solution.intro.body}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Who this is for */}
      {solution.who && (
        <section className="py-16 md:py-20 bg-stride-bg">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="reveal-on-scroll from-left">
                <h2 className="font-display text-3xl md:text-4xl text-stride-text-strong mb-4 tracking-tight">
                  {solution.who.title}
                </h2>
                {solution.who.intro && (
                  <p className="text-stride-text-muted mb-6">{solution.who.intro}</p>
                )}
                <ul className="space-y-3">
                  {solution.who.items.map((it, i) => (
                    <li
                      key={i}
                      className={`reveal-on-scroll delay-${Math.min(i + 1, 5)} flex items-start gap-3 text-stride-text-strong`}
                    >
                      <CheckCircle2 className="w-5 h-5 text-stride-accent flex-shrink-0 mt-0.5" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {solution.who.image && (
                <div className="reveal-on-scroll from-right rounded-2xl overflow-hidden shadow-xl border border-stride-border bg-stride-bg-elev">
                  <img
                    src={solution.who.image}
                    alt={solution.who.title}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Problem */}
      {solution.problem && (
        <section className="py-16 md:py-20 bg-stride-bg-elev">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              {solution.problem.image && (
                <div className="reveal-on-scroll from-left rounded-2xl overflow-hidden shadow-xl border border-stride-border bg-stride-navy/5 order-2 md:order-1">
                  <img
                    src={solution.problem.image}
                    alt={solution.problem.title || 'Problem'}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
              <div className="order-1 md:order-2 reveal-on-scroll from-right">
                <h2 className="font-display text-3xl md:text-4xl text-stride-text-strong mb-5 tracking-tight">
                  {solution.problem.title}
                </h2>
                {solution.problem.body.map((para, i) => (
                  <p key={i} className="text-stride-text-muted mb-4 leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Process steps */}
      {solution.process && (
        <section id="how-it-works" className="py-16 md:py-20 bg-stride-bg">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="reveal-on-scroll font-display text-3xl md:text-4xl text-stride-text-strong mb-10 tracking-tight text-center">
              How it works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {solution.process.map((step, i) => (
                <div
                  key={step.n}
                  className={`reveal-on-scroll scale-up delay-${Math.min(i + 1, 5)} bg-stride-bg-elev rounded-xl p-6 border border-stride-border hover:shadow-xl hover:-translate-y-1 transition-all`}
                >
                  <span className="block font-mono text-sm text-stride-accent tracking-wider mb-2">
                    {step.n}
                  </span>
                  <h3 className="font-display text-lg text-stride-text-strong mb-2 tracking-tight leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-sm text-stride-text-muted leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* "How it works" prose block */}
      {solution.how && (
        <section id="how-it-works" className="py-16 md:py-20 bg-stride-navy text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {solution.how.title && (
              <h2 className="reveal-on-scroll font-display text-3xl md:text-4xl mb-3 tracking-tight">
                {solution.how.title}
              </h2>
            )}
            {solution.how.tagline && (
              <p className="reveal-on-scroll text-stride-gold uppercase tracking-[0.28em] text-xs font-semibold mb-5">
                {solution.how.tagline}
              </p>
            )}
            {solution.how.lead && (
              <p className="reveal-on-scroll text-white/85 max-w-3xl mx-auto mb-8 leading-relaxed">
                {solution.how.lead}
              </p>
            )}
            {solution.how.h4 && (
              <h3 className="reveal-on-scroll font-display text-xl md:text-2xl mb-8 tracking-tight">
                {solution.how.h4}
              </h3>
            )}
            {solution.how.items && (
              <div
                className="grid gap-3 text-left mx-auto"
                style={{
                  gridTemplateColumns: `repeat(auto-fit, minmax(${
                    solution.how.items.length > 5 ? '150px' : '200px'
                  }, 1fr))`,
                }}
              >
                {solution.how.items.map((it, i) => (
                  <div
                    key={i}
                    className={`reveal-on-scroll scale-up delay-${Math.min((i % 5) + 1, 5)} bg-white/[0.06] backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/[0.10] transition-colors`}
                  >
                    <span className="block text-stride-gold text-xs font-mono mb-1.5">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-white text-sm leading-snug">{it}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Changes (before/after) */}
      {solution.changes && (
        <section className="py-16 md:py-20 bg-stride-bg-elev">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="reveal-on-scroll from-left bg-stride-bg rounded-2xl p-7 border border-stride-border">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <X className="w-5 h-5 text-red-500" />
              </div>
              <span className="stride-eyebrow mb-3 block">Before</span>
              <p className="text-stride-text-muted italic">{solution.changes.before}</p>
            </div>
            <div className="reveal-on-scroll from-right bg-stride-navy text-white rounded-2xl p-7">
              <div className="w-10 h-10 rounded-full bg-emerald-400 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5 text-stride-navy" />
              </div>
              <span className="text-xs uppercase tracking-[0.22em] text-stride-accent-soft font-semibold mb-3 block">
                After
              </span>
              <p className="text-white italic">{solution.changes.after}</p>
            </div>
          </div>
        </section>
      )}

      {/* What it does */}
      {solution.does && (
        <section className="py-16 md:py-20 bg-stride-bg">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {solution.does.title && (
              <h2 className="reveal-on-scroll font-display text-3xl md:text-4xl text-stride-text-strong mb-3 tracking-tight text-center">
                {solution.does.title}
              </h2>
            )}
            {solution.does.lead && (
              <p className="reveal-on-scroll text-stride-text-muted text-center max-w-3xl mx-auto mb-10">
                {solution.does.lead}
              </p>
            )}
            {solution.does.features && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {solution.does.features.map((f, i) => (
                  <div
                    key={f.title}
                    className={`reveal-on-scroll scale-up delay-${Math.min((i % 5) + 1, 5)} bg-stride-bg-elev rounded-xl p-6 border border-stride-border hover:shadow-xl hover:-translate-y-1 transition-all`}
                  >
                    <h3 className="font-display text-lg text-stride-text-strong mb-2 tracking-tight">
                      {f.title}
                    </h3>
                    <p className="text-sm text-stride-text-muted leading-relaxed">{f.body}</p>
                  </div>
                ))}
              </div>
            )}
            {solution.does.closing && (
              <p className="reveal-on-scroll text-stride-text-muted text-center max-w-3xl mx-auto mt-8 italic">
                {solution.does.closing}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Outcome cards */}
      {solution.outcome && (
        <section className="py-16 md:py-20 bg-stride-bg-elev">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {solution.outcome.title && (
              <h2 className="reveal-on-scroll font-display text-3xl md:text-4xl text-stride-text-strong mb-10 tracking-tight text-center">
                {solution.outcome.title}
              </h2>
            )}
            {solution.outcome.cards && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {solution.outcome.cards.map((c, i) => (
                  <div
                    key={c.title}
                    className={`reveal-on-scroll scale-up delay-${Math.min((i % 5) + 1, 5)} bg-stride-bg rounded-xl p-6 border border-stride-border hover:shadow-xl hover:-translate-y-1 transition-all`}
                  >
                    <h3 className="font-display text-lg text-stride-text-strong mb-2 tracking-tight">
                      {c.title}
                    </h3>
                    <p className="text-sm text-stride-text-muted leading-relaxed">{c.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Replaces / Get */}
      {solution.replacesGet && (
        <section className="py-16 md:py-20 bg-stride-bg">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 reveal-on-scroll">
            <div className="bg-stride-bg-elev rounded-2xl shadow-lg border border-stride-border overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-6 md:p-8 bg-stride-bg/40">
                  <h3 className="font-display text-xl text-stride-text-strong mb-5">
                    {solution.replacesGet.replacesTitle || 'What it replaces'}
                  </h3>
                  <ul className="space-y-3">
                    {solution.replacesGet.replaces.map((r, i) => (
                      <li key={i} className="flex items-start gap-3 text-stride-text-muted">
                        <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-1" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-6 md:p-8 bg-stride-navy text-white">
                  <h3 className="font-display text-xl text-white mb-5">
                    {solution.replacesGet.getTitle || 'What you get'}
                  </h3>
                  <ul className="space-y-3">
                    {solution.replacesGet.get.map((g, i) => (
                      <li key={i} className="flex items-start gap-3 text-white/90">
                        <CheckCircle2 className="w-4 h-4 text-stride-accent-soft flex-shrink-0 mt-1" />
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* How it works prose */}
      {solution.howBody && (
        <section className="py-16 md:py-20 bg-stride-bg-elev">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 reveal-on-scroll">
            {solution.howBody.title && (
              <h2 className="font-display text-3xl md:text-4xl text-stride-text-strong mb-5 tracking-tight">
                {solution.howBody.title}
              </h2>
            )}
            <p className="text-stride-text-muted text-lg leading-relaxed">
              {solution.howBody.body}
            </p>
          </div>
        </section>
      )}

      {/* Metrics */}
      {solution.metrics && (
        <section className="py-16 md:py-20 bg-stride-bg">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {solution.metrics.title && (
              <h2 className="reveal-on-scroll font-display text-3xl md:text-4xl text-stride-text-strong mb-10 tracking-tight text-center">
                {solution.metrics.title}
              </h2>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {solution.metrics.items.map((m, i) => (
                <div
                  key={i}
                  className={`reveal-on-scroll scale-up delay-${Math.min((i % 5) + 1, 5)} bg-stride-bg-elev rounded-xl p-5 border border-stride-border text-center hover:shadow-xl transition-all`}
                >
                  <span className="block font-mono text-sm text-stride-accent mb-2">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-sm font-medium text-stride-text-strong">{m}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Deliverables */}
      {solution.deliverables && (
        <section className="py-16 md:py-20 bg-stride-bg-elev">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 reveal-on-scroll">
            <h2 className="font-display text-3xl md:text-4xl text-stride-text-strong mb-8 tracking-tight">
              What you get
            </h2>
            <ul className="space-y-4">
              {solution.deliverables.map((d, i) => (
                <li key={i} className="flex items-start gap-3 text-stride-text-strong">
                  <CheckCircle2 className="w-5 h-5 text-stride-accent flex-shrink-0 mt-0.5" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Why */}
      {solution.why && (
        <section className="py-16 md:py-20 bg-stride-bg">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center reveal-on-scroll">
            {solution.why.title && (
              <h2
                className="font-display text-3xl md:text-4xl text-stride-text-strong mb-5 tracking-tight"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(solution.why.title) }}
              />
            )}
            {solution.why.body && (
              <p className="text-stride-text-muted text-lg leading-relaxed">{solution.why.body}</p>
            )}
          </div>
        </section>
      )}

      {/* Packaging */}
      {solution.packaging && (
        <section className="py-16 md:py-20 bg-stride-bg-elev">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 reveal-on-scroll">
            <div className="bg-stride-bg border border-stride-border rounded-2xl p-8 md:p-12">
              {solution.packaging.title && (
                <h2 className="font-display text-3xl text-stride-text-strong mb-5 tracking-tight">
                  {solution.packaging.title}
                </h2>
              )}
              <p className="text-stride-text-muted mb-6 leading-relaxed">
                {solution.packaging.body}
              </p>
              {solution.packaging.cta && (
                <Link
                  to="/contact"
                  className="inline-flex items-center px-6 py-3 bg-stride-navy text-white rounded-lg hover:bg-stride-navy-dark transition-all group font-medium"
                >
                  {solution.packaging.cta}
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Final closing block */}
      {solution.final && (
        <section className="py-16 md:py-20 bg-stride-bg">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center reveal-on-scroll">
            {solution.final.title && (
              <h2 className="font-display text-3xl md:text-4xl text-stride-text-strong mb-4 tracking-tight">
                {solution.final.title}
              </h2>
            )}
            {solution.final.body && (
              <p
                className="text-stride-text-muted text-lg leading-relaxed"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(solution.final.body) }}
              />
            )}
          </div>
        </section>
      )}

      {/* Related solutions */}
      <section className="py-16 md:py-20 bg-stride-bg-elev">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="reveal-on-scroll font-display text-2xl md:text-3xl text-stride-text-strong mb-8 tracking-tight">
            Explore other solutions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {relatedSolutions.map((rel, i) => (
              <Link
                key={rel.slug}
                to={`/solutions/${rel.slug}`}
                onClick={() => window.scrollTo(0, 0)}
                className={`reveal-on-scroll scale-up delay-${i + 1} group bg-stride-bg border border-stride-border rounded-xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all`}
              >
                <span className="font-mono text-xs text-stride-accent">{rel.n}</span>
                <h3 className="font-display text-xl text-stride-text-strong mt-1 mb-2 tracking-tight">
                  {rel.name}
                </h3>
                <p className="text-sm text-stride-text-muted line-clamp-2 mb-3">{rel.solution}</p>
                <span className="text-stride-accent dark:text-stride-sky text-sm font-semibold inline-flex items-center group-hover:translate-x-0.5 transition-transform">
                  See how it works
                  <ArrowRight className="ml-1.5 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — shared floating gradient panel (same treatment as About and
          the Solutions listing), with breathing room before the footer */}
      {solution.cta && <CtaPanel titleHtml={solution.cta.title} sub={solution.cta.sub} />}

      {/* Floating Gallery button — sits next to the global Let's-talk bubble */}
      <button
        type="button"
        onClick={() => setGalleryOpen(true)}
        className="group fixed bottom-6 right-[176px] z-50 inline-flex items-center gap-2 bg-stride-gold text-stride-ink rounded-full pl-4 pr-5 py-3 shadow-2xl hover:shadow-[0_24px_60px_-20px_hsl(var(--stride-gold)/0.6)] transition-all hover:-translate-y-0.5"
        aria-label="Open product gallery"
      >
        <span className="relative flex items-center justify-center w-7 h-7 rounded-full bg-stride-ink/15 group-hover:bg-stride-ink/25 transition-colors">
          <Images className="h-3.5 w-3.5" />
        </span>
        <span className="text-sm font-semibold tracking-tight">Gallery</span>
      </button>

      {/* Gallery overlay — full-screen ScrollTiltedGrid of brand posters.
          The tilted tiles transform out horizontally on entry/exit so the
          outer container MUST clip x-overflow, otherwise you get a body-wide
          horizontal scrollbar. The X button sits above the scrollable inner
          via z-60 / position fixed. */}
      {galleryOpen && (
        <div
          className="fixed inset-0 z-50 bg-stride-ink/95 backdrop-blur-md overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Gallery"
        >
          {/* Close button — fixed to viewport, never scrolls away */}
          <button
            type="button"
            onClick={() => setGalleryOpen(false)}
            className="fixed top-6 right-6 z-[60] w-11 h-11 rounded-full bg-white/15 border border-white/25 backdrop-blur-md text-white hover:bg-white/25 transition-colors flex items-center justify-center shadow-xl"
            aria-label="Close gallery"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Gallery title — also fixed so it stays visible while scrolling */}
          <div className="fixed top-6 left-6 z-[60] pointer-events-none">
            <span className="inline-block text-[11px] uppercase tracking-[0.28em] text-stride-gold font-semibold">
              {solution.name} · Gallery
            </span>
          </div>

          {/* Inner scroller — owns the y-scroll, clips x */}
          <div className="absolute inset-0 overflow-y-auto overflow-x-hidden">
            {galleryImages.length > 0 ? (
              <ScrollTiltedGrid loop maxWidth="2xl" gap={12} images={galleryImages} />
            ) : (
              <div className="min-h-full flex items-center justify-center px-6">
                <div className="text-center max-w-md text-stride-cream/70">
                  <Images className="w-10 h-10 mx-auto mb-3 opacity-60" />
                  <p className="font-display text-2xl text-white mb-2 tracking-tight">
                    Gallery coming soon
                  </p>
                  <p className="text-sm leading-relaxed">
                    No images have been added for {solution.name} yet. Admins can upload them
                    in the dashboard under <em>Content → Solutions → Gallery</em>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </PageLayout>
  );
};

/** Inline video card used inside the hero — a compact version of SolutionVideo
 *  that sits in a column instead of overlapping the section below. */
const InlineVideoCard = ({
  videoUrl,
  tagline,
  productName,
  posterImage,
}: {
  videoUrl?: string;
  tagline?: string;
  productName: string;
  posterImage?: string;
}) => {
  const [playing, setPlaying] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1], delay: 0.2 }}
      className="relative rounded-2xl overflow-hidden shadow-2xl bg-stride-ink-deep aspect-video border border-white/10"
    >
      {videoUrl && playing ? (
        <iframe
          src={`${videoUrl}${videoUrl.includes('?') ? '&' : '?'}autoplay=1&rel=0&modestbranding=1`}
          title={`${productName} explainer`}
          className="absolute inset-0 w-full h-full"
          frameBorder={0}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <>
          {posterImage ? (
            <img
              src={posterImage}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover opacity-70"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-stride-ink via-stride-sky/40 to-stride-sage/30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-stride-ink/75 via-stride-ink/35 to-stride-ink/70" />

          <div className="relative h-full flex flex-col items-center justify-center text-center text-white p-6">
            <span className="inline-block text-[10px] uppercase tracking-[0.28em] text-stride-gold font-semibold mb-3">
              Watch the explainer · 90 seconds
            </span>
            <h3 className="font-display text-2xl sm:text-3xl tracking-tight mb-2">
              {productName}
            </h3>
            {tagline && (
              <p className="text-white/80 text-sm max-w-sm leading-relaxed mb-5">{tagline}</p>
            )}
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => videoUrl && setPlaying(true)}
              disabled={!videoUrl}
              className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center bg-white text-stride-ink shadow-2xl ${
                videoUrl ? 'cursor-pointer' : 'cursor-not-allowed opacity-90'
              }`}
              aria-label="Play explainer video"
              type="button"
            >
              <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-stride-ink ml-1" />
            </motion.button>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default SolutionDetail;
