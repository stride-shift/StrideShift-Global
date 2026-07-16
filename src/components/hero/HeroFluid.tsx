import { useEffect, useState } from 'react';
import { ArrowRight, MessageSquare } from 'lucide-react';

// Billboard sizes — the headline is a short statement with a rotating word.
const HEADLINE_SIZE: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
  sm: 'text-3xl sm:text-4xl lg:text-5xl',
  md: 'text-4xl sm:text-5xl lg:text-6xl',
  lg: 'text-4xl sm:text-5xl lg:text-6xl xl:text-7xl',
  xl: 'text-5xl sm:text-6xl lg:text-7xl xl:text-8xl',
};
import { Link } from 'react-router-dom';
import { hero, marqueeStats } from '@/data/stride';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useTheme } from '@/hooks/useTheme';
import FluidShader from '@/components/ui/fluid-shader';
import TextReveal from '@/components/motion/TextReveal';
import MagneticButton from '@/components/motion/MagneticButton';
import CountUp from '@/components/motion/CountUp';
import RotatingWord from '@/components/motion/RotatingWord';

/**
 * "Fluid" hero — the new flagship.
 *
 *   - WebGL2 fluid/aurora shader background, cursor-reactive
 *   - Word-by-word mask reveal on the headline
 *   - Magnetic CTA buttons
 *   - Live-counting stat strip on cream surface beneath the dark hero
 */
const HeroFluid = () => {
  const { settings } = useSiteSettings();
  const { theme } = useTheme();
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Palette — RGB triplets, kept slightly different per theme so the shader
  // reads beautifully in both. (Same hues, deeper in dark mode.)
  const palette =
    theme === 'dark'
      ? {
          a: [0.42, 0.62, 0.78] as [number, number, number],
          b: [0.55, 0.70, 0.55] as [number, number, number],
          c: [0.90, 0.78, 0.45] as [number, number, number],
          bg: [0.018, 0.030, 0.055] as [number, number, number],
        }
      : {
          a: [0.36, 0.58, 0.74] as [number, number, number],
          b: [0.49, 0.66, 0.49] as [number, number, number],
          c: [0.86, 0.74, 0.43] as [number, number, number],
          bg: [0.04, 0.06, 0.10] as [number, number, number],
        };

  return (
    <section className="relative w-full min-h-[100svh] flex flex-col bg-stride-ink overflow-hidden">
      {/* ---------- WebGL fluid background ---------- */}
      <div className="absolute inset-0 z-0">
        {!reduced && (
          <FluidShader
            colorA={palette.a}
            colorB={palette.b}
            colorC={palette.c}
            bg={palette.bg}
            speed={0.45}
          />
        )}
        {reduced && (
          <div className="absolute inset-0 aurora-wash" aria-hidden="true" />
        )}
        {/* Soft top vignette so the navbar reads cleanly */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-stride-ink-deep/85 to-transparent" />
        {/* Bottom fade into the cream stat strip */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-stride-cream/95 to-transparent" />
        {/* Subtle film grain — keeps the gradient from looking plastic */}
        <div
          className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.65'/></svg>\")",
          }}
          aria-hidden="true"
        />
      </div>

      {/* ---------- Headline content ---------- */}
      <div className="relative z-10 flex-1 flex items-center">
        <div
          className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 md:py-32 ${
            settings.heroAlign === 'center' ? 'text-center' : ''
          }`}
        >
          <div className={`max-w-2xl ${settings.heroAlign === 'center' ? 'mx-auto' : ''}`}>
            {/* Headline + rotating word (admin-editable: Landing tab). When
                heroRotatingWords is empty the headline renders static. */}
            <h1
              className={`font-display leading-[1.08] tracking-tight text-stride-cream ${HEADLINE_SIZE[settings.heroHeadlineSize]}`}
              style={{ color: settings.heroHeadlineColor || undefined }}
            >
              <TextReveal
                as="span"
                text={settings.heroHeadline}
                className="block"
                staggerMs={75}
                initialDelayMs={150}
                immediate
              />
              {settings.heroRotatingWords.trim() && (
                <span className="block mt-1">
                  {settings.heroRotatingPrefix && <>{settings.heroRotatingPrefix} </>}
                  <RotatingWord
                    words={settings.heroRotatingWords.split(',')}
                    className="text-stride-gold"
                  />
                </span>
              )}
            </h1>

            {settings.heroSubhead && (
              <p
                className="mt-7 text-base sm:text-lg text-stride-cream/80 leading-relaxed max-w-xl"
                style={{ color: settings.heroSubheadColor || undefined }}
              >
                {settings.heroSubhead}
              </p>
            )}

            {/* CTAs — primary magnetic, secondary subtle glass */}
            <div
              className={`mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center ${
                settings.heroAlign === 'center' ? 'justify-center' : ''
              }`}
            >
              <MagneticButton
                href="/contact"
                strength={0.4}
                className="btn-sheen min-h-[54px] px-8 py-4 bg-stride-cream text-stride-ink rounded-full shadow-2xl hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] text-sm sm:text-base font-semibold tracking-tight"
                style={{
                  background: settings.heroPrimaryButtonBg || undefined,
                  color: settings.heroPrimaryButtonText || undefined,
                }}
              >
                <span className="relative z-[2] inline-flex items-center gap-2">
                  {settings.heroCtaLabel || hero.ctaLabel}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </MagneticButton>

              <MagneticButton
                href="#capabilities"
                strength={0.3}
                className="min-h-[54px] px-8 py-4 rounded-full text-stride-cream border border-stride-cream/25 bg-stride-cream/5 hover:bg-stride-cream/15 backdrop-blur-md text-sm sm:text-base font-medium"
                style={
                  settings.heroSecondaryButtonBorder
                    ? { borderColor: settings.heroSecondaryButtonBorder }
                    : undefined
                }
              >
                <span className="inline-flex items-center gap-2">
                  {settings.heroSecondaryLabel || hero.secondaryLabel}
                  <MessageSquare className="w-4 h-4" />
                </span>
              </MagneticButton>
            </div>

            {/* Sparks row — small visual proof */}
            <div
              className={`mt-12 flex flex-wrap items-center gap-x-7 gap-y-2 text-stride-cream/55 text-xs ${
                settings.heroAlign === 'center' ? 'justify-center' : ''
              }`}
            >
              {['60+ clients', '16 countries, 3 continents', '23 AI products shipped'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-stride-sage" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Stat strip on cream ---------- */}
      <div className="relative z-10 bg-stride-cream border-y border-stride-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-x-6 gap-y-5">
            {marqueeStats.map((s) => {
              // Extract a numeric end value from strings like "60+", "R200M+", "16"
              const m = s.strong.match(/(\d+(?:[.,]\d+)?)/);
              const numeric = m ? parseFloat(m[1].replace(',', '')) : 0;
              const prefix = m ? s.strong.slice(0, m.index) : '';
              const suffix = m ? s.strong.slice((m.index ?? 0) + m[0].length) : '';
              return (
                <div key={s.label} className="group">
                  <div className="font-display text-2xl sm:text-3xl text-stride-ink tracking-tight leading-none">
                    {numeric > 0 ? (
                      <CountUp
                        to={numeric}
                        duration={1800}
                        prefix={prefix}
                        suffix={suffix}
                      />
                    ) : (
                      s.strong
                    )}
                  </div>
                  <div className="mt-1.5 text-[11px] uppercase tracking-[0.18em] text-stride-text-muted group-hover:text-stride-sky transition-colors">
                    {s.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute z-20 left-1/2 -translate-x-1/2 pointer-events-none" style={{ bottom: 'calc(76px + 1.25rem)' }}>
        <span className="flex flex-col items-center gap-2 text-stride-cream/40 text-[10px] uppercase tracking-[0.28em]">
          Scroll
          <span className="w-px h-8 bg-gradient-to-b from-stride-cream/40 to-transparent" />
        </span>
      </div>
    </section>
  );
};

export default HeroFluid;
