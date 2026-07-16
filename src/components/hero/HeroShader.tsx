import { lazy, Suspense } from 'react';
import { ArrowRight, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { hero } from '@/data/stride';
import { useSiteSettings, type HeroTemplate } from '@/hooks/useSiteSettings';
import { CssHeroBackground } from '@/components/hero/HeroBackgrounds';

// Sized for a paragraph-style statement (the heroSubhead now drives the hero).
const HEADLINE_SIZE: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
  sm: 'text-lg sm:text-xl lg:text-2xl',
  md: 'text-xl sm:text-2xl lg:text-3xl',
  lg: 'text-2xl sm:text-3xl lg:text-4xl',
  xl: 'text-3xl sm:text-4xl lg:text-5xl',
};

// WebGL shaders pull in Three.js — load each only when its template is active.
const AuroraShader = lazy(() =>
  import('@/components/ui/aurora-shader').then((m) => ({ default: m.AuroraShader }))
);
const LinesShader = lazy(() =>
  import('@/components/ui/lines-shader').then((m) => ({ default: m.LinesShader }))
);
const SpectrumShader = lazy(() =>
  import('@/components/ui/spectrum-shader').then((m) => ({ default: m.SpectrumShader }))
);

const SHADER_TEMPLATES: HeroTemplate[] = ['aurora', 'lines', 'spectrum'];

/**
 * Shader / animated hero template — full-bleed animated background with centred
 * StrideShift content. Used by every template except 'classic'.
 */
const HeroShader = ({ template }: { template: Exclude<HeroTemplate, 'classic'> }) => {
  const { settings } = useSiteSettings();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.14, delayChildren: 0.25, duration: 0.8 },
    },
  };
  const itemVariants = {
    hidden: { y: 26, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.7, ease: [0.2, 0.8, 0.2, 1] } },
  };

  const isShader = SHADER_TEMPLATES.includes(template);

  return (
    <section className="relative w-full min-h-[100svh] flex flex-col items-center justify-center overflow-hidden bg-stride-navy">
      {/* Background */}
      {isShader ? (
        <Suspense fallback={<div className="absolute inset-0 bg-stride-navy" />}>
          {template === 'aurora' && <AuroraShader />}
          {template === 'lines' && <LinesShader />}
          {template === 'spectrum' && <SpectrumShader />}
        </Suspense>
      ) : (
        <CssHeroBackground template={template} />
      )}

      {/* Legibility overlays */}
      <div
        className="absolute inset-0 bg-stride-navy pointer-events-none"
        style={{ opacity: settings.heroOverlayOpacity * 0.6 }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 45%, rgba(0,0,0,0.55) 0%, transparent 70%)',
        }}
      />

      <motion.div
        className={`relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 ${
          settings.heroAlign === 'left' ? 'text-left' : 'text-center'
        }`}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Single statement — same heroSubhead drives every template. */}
        <motion.h1
          variants={itemVariants}
          className={`font-display leading-snug tracking-tight ${HEADLINE_SIZE[settings.heroHeadlineSize]}`}
          style={{ color: settings.heroHeadlineColor || settings.heroSubheadColor || undefined }}
        >
          {settings.heroSubhead || settings.heroHeadline}
        </motion.h1>

        <motion.div
          variants={itemVariants}
          className={`mt-9 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center ${
            settings.heroAlign === 'center' ? 'justify-center' : 'sm:items-start'
          }`}
        >
          <Link
            to="/contact"
            className="group min-h-[48px] px-8 py-3.5 bg-white text-stride-navy rounded-lg hover:bg-stride-accent-soft transition-all shadow-xl hover:-translate-y-0.5 flex items-center justify-center text-sm sm:text-base font-semibold"
          >
            {hero.ctaLabel}
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#capabilities"
            className="group min-h-[48px] px-8 py-3.5 bg-white/5 border border-white/25 text-white rounded-lg hover:bg-white/15 transition-all backdrop-blur-sm flex items-center justify-center text-sm sm:text-base font-medium"
          >
            {hero.secondaryLabel}
            <MessageSquare className="ml-2 w-4 h-4 group-hover:scale-110 transition-transform" />
          </a>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-12 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-white/55 text-xs"
        >
          {['60+ clients', '16 countries', '3 continents', '23 AI products shipped'].map(
            (t) => (
              <span key={t} className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-stride-accent-soft" />
                {t}
              </span>
            )
          )}
        </motion.div>
      </motion.div>

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

export default HeroShader;
