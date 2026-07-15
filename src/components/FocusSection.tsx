import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { problem } from '@/data/stride';
import SectionEyebrow from '@/components/SectionEyebrow';

/**
 * "What we focus on" — the open-ended-problem explainer. Sits directly under the
 * hero so the value proposition is explained before anything else. Lifted out of
 * Features.tsx so it can stand on its own near the top of the page.
 */
const FocusSection = () => {
  return (
    <section className="bg-stride-bg py-14 md:py-20">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          className="text-center mb-12"
        >
          <SectionEyebrow>What we focus on</SectionEyebrow>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl text-stride-text-strong mb-4 tracking-tight max-w-3xl mx-auto [text-wrap:balance]">
            {problem.headline}
          </h2>
          <p className="font-display text-lg sm:text-xl text-stride-accent tracking-tight">
            We're your disruptive thinking partner.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.65, ease: [0.2, 0.8, 0.2, 1] }}
          className="glow-card bg-stride-bg-elev rounded-2xl shadow-lg border border-stride-border p-8 md:p-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              {problem.body.map((para, i) => (
                <p
                  key={i}
                  className="text-stride-text-muted text-base sm:text-lg leading-relaxed"
                >
                  {para}
                </p>
              ))}
            </div>
            <div className="card-tint-sky rounded-xl p-6 md:p-8">
              <h3 className="font-display text-xl sm:text-2xl text-stride-text-strong mb-4">
                {problem.definitionTitle}
              </h3>
              <ul className="space-y-3">
                {problem.definitionList.map((d) => (
                  <li key={d.strong} className="flex gap-3 text-sm sm:text-base">
                    <ArrowRight className="w-4 h-4 text-stride-sky mt-1 flex-shrink-0" />
                    <span className="text-stride-text-muted">
                      <strong className="text-stride-text-strong">{d.strong}</strong>
                      {d.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FocusSection;
