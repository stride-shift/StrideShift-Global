import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, X } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import SEO from '@/components/SEO';
import SolutionVideo from '@/components/SolutionVideo';
import { Button } from '@/components/ui/button';
import { findSolution, showcase } from '@/data/stride';
import { RevealOnScrollRoot } from '@/hooks/useScrollReveal';

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
      <RevealOnScrollRoot />

      {/* Hero */}
      <section className="relative pt-28 md:pt-36 pb-28 md:pb-40 bg-stride-ink text-white overflow-hidden">
        {solution.hero.image && (
          <img
            src={solution.hero.image}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover opacity-25"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-stride-ink via-stride-ink/80 to-stride-ink-deep" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[36rem] h-[36rem] rounded-full bg-stride-sky/18 blur-3xl animate-blob" />
          <div
            className="absolute bottom-0 left-0 w-[28rem] h-[28rem] rounded-full bg-stride-sage/22 blur-3xl animate-blob"
            style={{ animationDelay: '-8s' }}
          />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[22rem] h-[22rem] rounded-full bg-stride-gold/14 blur-3xl animate-pulse-slow" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/solutions"
            className="inline-flex items-center text-stride-accent-soft text-sm mb-6 hover:text-white transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            All solutions
          </Link>
          <motion.div initial="hidden" animate="visible" variants={container}>
            <motion.span
              variants={item}
              className="inline-block mb-4 text-xs uppercase tracking-[0.22em] text-stride-accent-soft font-semibold"
            >
              {solution.hero.eyebrow || solution.category}
            </motion.span>
            <motion.h1
              variants={item}
              className="font-display text-4xl sm:text-5xl lg:text-6xl text-white mb-6 tracking-tight leading-[1.05]"
            >
              {solution.hero.title}
            </motion.h1>
            {solution.hero.lede && (
              <motion.p
                variants={item}
                className="text-lg sm:text-xl text-white/85 max-w-3xl leading-relaxed"
              >
                {solution.hero.lede}
              </motion.p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Explainer video */}
      <SolutionVideo
        videoUrl={solution.videoUrl}
        tagline={solution.videoTagline || solution.intro?.title?.replace(/<[^>]*>/g, '')}
        productName={solution.name}
        posterImage={solution.hero.image}
      />

      {/* Intro */}
      {solution.intro && (
        <section className="py-16 md:py-20 bg-stride-bg-elev">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center reveal-on-scroll">
            {solution.intro.title && (
              <h2
                className="font-display text-3xl md:text-4xl lg:text-5xl text-stride-text-strong mb-5 tracking-tight"
                dangerouslySetInnerHTML={{ __html: solution.intro.title }}
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
        <section className="py-16 md:py-20 bg-stride-bg">
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
        <section className="py-16 md:py-20 bg-stride-navy text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {solution.how.title && (
              <h2 className="reveal-on-scroll font-display text-3xl md:text-4xl mb-3 tracking-tight">
                {solution.how.title}
              </h2>
            )}
            {solution.how.tagline && (
              <p className="reveal-on-scroll text-stride-accent-soft uppercase tracking-[0.22em] text-xs font-semibold mb-5">
                {solution.how.tagline}
              </p>
            )}
            {solution.how.lead && (
              <p className="reveal-on-scroll text-white/85 max-w-3xl mx-auto mb-8 leading-relaxed">
                {solution.how.lead}
              </p>
            )}
            {solution.how.h4 && (
              <h3 className="reveal-on-scroll font-display text-xl md:text-2xl mb-6 tracking-tight">
                {solution.how.h4}
              </h3>
            )}
            {solution.how.items && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-left max-w-4xl mx-auto">
                {solution.how.items.map((it, i) => (
                  <div
                    key={i}
                    className={`reveal-on-scroll scale-up delay-${Math.min((i % 5) + 1, 5)} bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10`}
                  >
                    <span className="block text-stride-accent-soft text-xs font-mono mb-1">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-white text-sm">{it}</span>
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
                dangerouslySetInnerHTML={{ __html: solution.why.title }}
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
                dangerouslySetInnerHTML={{ __html: solution.final.body }}
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
                <span className="text-stride-accent text-sm font-semibold inline-flex items-center group-hover:translate-x-0.5 transition-transform">
                  See how it works
                  <ArrowRight className="ml-1.5 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {solution.cta && (
        <section className="py-16 md:py-24 bg-stride-navy text-white text-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 reveal-on-scroll">
            {solution.cta.title && (
              <h2
                className="font-display text-3xl md:text-4xl lg:text-5xl mb-4 tracking-tight"
                dangerouslySetInnerHTML={{ __html: solution.cta.title }}
              />
            )}
            {solution.cta.sub && (
              <p className="text-white/85 mb-8 leading-relaxed">{solution.cta.sub}</p>
            )}
            <Link
              to="/contact"
              className="inline-flex items-center px-7 py-3 bg-white text-stride-navy rounded-lg hover:bg-stride-accent-soft transition-all group font-semibold"
            >
              Start a conversation
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      )}
    </PageLayout>
  );
};

export default SolutionDetail;
