import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { hero } from '@/data/stride';
import { useSiteContent } from '@/hooks/useSiteContent';
import MagneticButton from '@/components/motion/MagneticButton';

/**
 * The "From messy problem… / Sound familiar?" section — a two-column band that
 * follows the hero: headline + supporting copy on the left, the recognisable
 * pain-points on the right.
 */
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

const SoundFamiliar = () => {
  const { content } = useSiteContent();
  const home = content.home;
  const problems = home.problems;
  const extras = home.extras ?? [];

  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
  };
  const item = {
    hidden: { opacity: 0, x: -16 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: [0.2, 0.8, 0.2, 1] } },
  };

  return (
    <section className="relative bg-stride-bg-elev py-16 md:py-24 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background:
            'radial-gradient(closest-side at 92% 8%, hsl(var(--stride-accent) / 0.10), transparent 70%)',
        }}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* LEFT — headline + supporting copy */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={container}
          >
            <motion.h2
              variants={item}
              className="font-display text-4xl sm:text-5xl lg:text-6xl text-stride-text-strong tracking-tight leading-[1.05]"
              style={home.soundFamiliarTitleColor ? { color: home.soundFamiliarTitleColor } : undefined}
            >
              {home.soundFamiliarTitle}
            </motion.h2>

            <motion.p
              variants={item}
              className="mt-7 text-lg sm:text-xl text-stride-text-strong font-medium border-l-[3px] pl-5 max-w-xl"
              style={{
                color: home.soundFamiliarHighlightColor || undefined,
                borderLeftColor:
                  home.soundFamiliarAccentColor || 'hsl(var(--stride-accent))',
              }}
            >
              {home.soundFamiliarHighlight}
            </motion.p>

            {extras.length > 0 && (
              <div className="mt-6 space-y-3 max-w-xl">
                {extras.map((b) => (
                  <p
                    key={b.id}
                    className={`leading-relaxed ${EXTRA_SIZE[b.size]} ${EXTRA_ALIGN[b.align]}`}
                    style={{ color: b.color || undefined }}
                  >
                    {b.text}
                  </p>
                ))}
              </div>
            )}

            <motion.p
              variants={item}
              className="mt-6 text-base text-stride-text-muted leading-relaxed max-w-xl"
            >
              {hero.description}
            </motion.p>
            <motion.p
              variants={item}
              className="mt-4 text-base text-stride-text-muted leading-relaxed max-w-xl"
            >
              {hero.description2}
            </motion.p>

            <motion.div variants={item} className="mt-8">
              <MagneticButton
                href="/contact"
                strength={0.35}
                className="btn-sheen inline-flex items-center px-7 py-3.5 bg-stride-ink text-stride-cream rounded-full hover:shadow-2xl transition-all font-semibold shadow-lg"
              >
                <span className="relative z-[2] inline-flex items-center gap-2">
                  {hero.ctaLabel}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </MagneticButton>
            </motion.div>
          </motion.div>

          {/* RIGHT — Sound familiar? card */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative card-tint-sage glow-card rounded-2xl shadow-2xl p-7 sm:p-9 lg:p-10"
          >
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none opacity-70"
              style={{
                background:
                  'radial-gradient(circle at 100% 0%, hsl(var(--stride-sage) / 0.18) 0%, transparent 60%)',
              }}
            />
            <div className="absolute top-5 right-5 w-12 h-12 rounded-full gold-spark opacity-80" />
            <div className="relative">
              <span className="stride-eyebrow mb-3 block">{hero.cardLabel}</span>
              <h3 className="font-display text-3xl sm:text-4xl text-stride-text-strong tracking-tight mb-3">
                {hero.cardTitle}
              </h3>
              <p className="text-stride-text-muted mb-6">{hero.cardIntro}</p>

              <motion.ul
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={container}
                className="divide-y divide-stride-border"
              >
                {problems.map((p) => (
                  <motion.li
                    key={p}
                    variants={item}
                    className="group flex items-start gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <ArrowRight
                      className="w-4 h-4 mt-1 flex-shrink-0 group-hover:translate-x-1 transition-transform"
                      style={{
                        color:
                          home.soundFamiliarAccentColor || 'hsl(var(--stride-accent))',
                      }}
                    />
                    <span className="text-stride-text-strong text-base sm:text-lg leading-snug">
                      {p}
                    </span>
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SoundFamiliar;
