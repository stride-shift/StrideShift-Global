import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import SEO from '@/components/SEO';
import { RevealOnScrollRoot } from '@/hooks/useScrollReveal';
import { useSiteContent } from '@/hooks/useSiteContent';
import PageHeroBackground from '@/components/PageHeroBackground';
import SectionEyebrow from '@/components/SectionEyebrow';
import PageSections from '@/components/editor/PageSections';
import CtaPanel from '@/components/CtaPanel';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};
const item = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6 } },
};

const EXTRA_SIZE: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'text-sm',
  md: 'text-base sm:text-lg',
  lg: 'text-lg sm:text-xl',
};
const EXTRA_ALIGN: Record<'left' | 'center' | 'right', string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const About = () => {
  const { content } = useSiteContent();
  const about = content.about;
  const style = about.style;
  const extras = about.extras ?? [];
  return (
    <PageLayout>
      <SEO
        title="About StrideShift — Strategic thinking partners for leaders"
        description="StrideShift's strategic thinking partners help leaders navigate complexity — where deep expertise meets AI-powered reasoning."
      />
      <RevealOnScrollRoot />

      <PageSections
        page="about"
        sections={{
          hero: (
      <section className="relative pt-28 md:pt-36 pb-16 md:pb-24 text-white overflow-hidden">
        <PageHeroBackground />
        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial="hidden" animate="visible" variants={container}>
            <motion.div variants={item} className="mb-4">
              <SectionEyebrow>{about.eyebrow}</SectionEyebrow>
            </motion.div>
            <motion.h1
              variants={item}
              className="font-display text-4xl sm:text-5xl lg:text-6xl text-white mb-6 tracking-tight"
              style={style.titleColor ? { color: style.titleColor } : undefined}
            >
              {about.title}
            </motion.h1>
            <motion.p
              variants={item}
              className="text-base sm:text-lg text-white/85 max-w-3xl mx-auto leading-relaxed"
            >
              {about.tagline}
            </motion.p>

            {extras.length > 0 && (
              <motion.div variants={item} className="mt-6 space-y-3 max-w-3xl mx-auto">
                {extras.map((b) => (
                  <p
                    key={b.id}
                    className={`leading-relaxed ${EXTRA_SIZE[b.size]} ${EXTRA_ALIGN[b.align]}`}
                    style={{ color: b.color || 'rgba(255,255,255,0.85)' }}
                  >
                    {b.text}
                  </p>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

          ),
          story: (
      <section className="py-16 md:py-24 bg-stride-bg-elev">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-stride-text-strong mb-4 tracking-tight">
              {about.storyTitle}
            </h2>
            <p className="text-stride-text-muted max-w-3xl mx-auto leading-relaxed">
              {about.storySub}
            </p>
          </div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={container}
          >
            {about.storyCards.map((card, idx) => (
              <motion.div
                key={idx}
                variants={item}
                className="bg-stride-bg border border-stride-border rounded-2xl p-6 md:p-8 hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <span
                  className="block font-mono text-sm tracking-wider mb-2"
                  style={{ color: style.accentColor || 'hsl(var(--stride-accent))' }}
                >
                  {card.n}
                </span>
                <span className="block text-xs uppercase tracking-[0.22em] text-stride-text-muted font-semibold mb-3">
                  {card.label}
                </span>
                <h3 className="font-display text-xl md:text-2xl text-stride-text-strong mb-3 tracking-tight">
                  {card.title}
                </h3>
                <p className="text-stride-text-muted text-sm leading-relaxed">{card.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

          ),
          comparison: (
      <section className="py-16 md:py-24 bg-stride-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block mb-3 px-3 py-1 bg-stride-accent/15 text-stride-accent rounded-full text-xs font-semibold uppercase tracking-wider">
              The difference
            </div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-stride-text-strong tracking-tight">
              {about.comparisonTitle}
            </h2>
          </div>
          <div className="bg-stride-bg-elev rounded-2xl shadow-lg border border-stride-border overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-6 md:p-8 bg-stride-bg/60">
                <h3 className="font-display text-xl text-stride-text-strong mb-5">Traditional consulting</h3>
                <ul className="space-y-4">
                  {about.comparison.map((row, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-stride-text-muted">
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>{row.traditional}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6 md:p-8 bg-stride-navy text-white">
                <h3 className="font-display text-xl text-white mb-5">StrideShift</h3>
                <ul className="space-y-4">
                  {about.comparison.map((row, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-white/90">
                      <CheckCircle2 className="w-5 h-5 text-stride-accent-soft flex-shrink-0 mt-0.5" />
                      <span>{row.strideshift}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

          ),
          credentials: (
      <section className="py-16 md:py-24 bg-stride-bg-elev">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block mb-3 px-3 py-1 bg-stride-accent/15 text-stride-accent rounded-full text-xs font-semibold uppercase tracking-wider">
              What we bring
            </div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-stride-text-strong tracking-tight">
              {about.credentialsTitle}
            </h2>
          </div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={container}
          >
            {about.credentials.map((c, idx) => (
              <motion.div
                key={idx}
                variants={item}
                className="bg-stride-bg rounded-2xl p-6 border border-stride-border hover:bg-stride-bg-elev hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <span className="block text-stride-accent font-mono text-sm tracking-wider mb-3">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display text-lg md:text-xl text-stride-text-strong mb-3 tracking-tight leading-snug">
                  {c.title}
                </h3>
                <p className="text-stride-text-muted text-sm leading-relaxed">{c.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

          ),
          cta: <CtaPanel title={about.ctaTitle} sub={about.ctaSub} />,
        }}
      />
    </PageLayout>
  );
};

export default About;
