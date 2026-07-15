import { useRef } from 'react';
import { ArrowRight, MessageSquare } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { hero } from '@/data/stride';
import { useSiteSettings } from '@/hooks/useSiteSettings';

// Sized for a paragraph-style statement (the heroSubhead now drives the hero).
const HEADLINE_SIZE: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
  sm: 'text-lg sm:text-xl lg:text-2xl',
  md: 'text-xl sm:text-2xl lg:text-3xl',
  lg: 'text-2xl sm:text-3xl lg:text-4xl',
  xl: 'text-3xl sm:text-4xl lg:text-5xl',
};

/**
 * Classic hero template — a true hero banner: a large full-bleed background
 * image, a navy gradient overlay for legibility, and the value proposition
 * (headline + supporting text + CTAs) overlaid on top.
 */
const HeroClassic = () => {
  const { settings } = useSiteSettings();
  const sectionRef = useRef<HTMLDivElement>(null);

  // Subtle parallax — the background image drifts slower than the page.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.16]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.14, delayChildren: 0.2, duration: 0.8 },
    },
  };
  const itemVariants = {
    hidden: { y: 26, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.7, ease: [0.2, 0.8, 0.2, 1] } },
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-[92svh] flex items-center overflow-hidden bg-stride-navy"
    >
      {/* Full-bleed background image */}
      <div className="absolute inset-0 overflow-hidden">
        {settings.heroImageUrl && (
          <motion.img
            src={settings.heroImageUrl}
            alt=""
            aria-hidden="true"
            style={{ y: bgY, scale: bgScale }}
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            decoding="async"
          />
        )}
        {/* Legibility overlays — opacity is editable */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-stride-navy via-stride-navy to-stride-navy"
          style={{ opacity: settings.heroOverlayOpacity }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stride-navy via-transparent to-stride-navy/55" />
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '74px 74px',
            maskImage: 'radial-gradient(ellipse at 30% 40%, #000 25%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 30% 40%, #000 25%, transparent 75%)',
          }}
        />
        <div className="absolute -top-24 -left-24 w-[40rem] h-[40rem] rounded-full bg-stride-accent/20 blur-3xl animate-blob" />
      </div>

      {/* Overlaid content */}
      <motion.div
        className={`relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 md:py-32 ${
          settings.heroAlign === 'center' ? 'text-center' : ''
        }`}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className={`max-w-2xl ${settings.heroAlign === 'center' ? 'mx-auto' : ''}`}>
          {/* Single statement — uses heroSubhead so the same admin-editable
              field drives every template. Headline field kept in settings for
              when a template wants both, but Classic only renders one block. */}
          <motion.h1
            variants={itemVariants}
            className={`font-display leading-snug tracking-tight ${HEADLINE_SIZE[settings.heroHeadlineSize]}`}
            style={{ color: settings.heroHeadlineColor || settings.heroSubheadColor || undefined }}
          >
            {settings.heroSubhead || settings.heroHeadline}
          </motion.h1>

          <motion.div
            variants={itemVariants}
            className="mt-9 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center"
          >
            <Link
              to="/contact"
              className="group min-h-[52px] px-8 py-4 bg-white text-stride-navy rounded-lg hover:bg-stride-accent-soft transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 flex items-center justify-center text-sm sm:text-base font-semibold"
            >
              {hero.ctaLabel}
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#capabilities"
              className="group min-h-[52px] px-8 py-4 bg-white/5 border border-white/25 text-white rounded-lg hover:bg-white/15 transition-all backdrop-blur-sm flex items-center justify-center text-sm sm:text-base font-medium"
            >
              {hero.secondaryLabel}
              <MessageSquare className="ml-2 w-4 h-4 group-hover:scale-110 transition-transform" />
            </a>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-2 text-white/55 text-xs"
          >
            {['30+ clients', '16 countries, 3 continents', '23 AI products shipped'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-stride-accent-soft" />
                {t}
              </span>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        className="absolute bottom-7 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <span className="flex flex-col items-center gap-2 text-white/40 text-[10px] uppercase tracking-[0.25em]">
          Scroll
          <span className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent" />
        </span>
      </motion.div>
    </section>
  );
};

export default HeroClassic;
