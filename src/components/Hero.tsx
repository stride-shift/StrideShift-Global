import { lazy, Suspense } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import HeroFluid from '@/components/hero/HeroFluid';

// Classic + shader templates are pulled in only when selected — the default
// "fluid" hero ships with the main bundle so the landing feels instant.
const HeroClassic = lazy(() => import('@/components/hero/HeroClassic'));
const HeroShader = lazy(() => import('@/components/hero/HeroShader'));

/**
 * Landing-page hero. Renders one of several templates, chosen by the admin
 * from the dashboard (Landing tab → Template). Default is the flagship
 * Fluid hero (WebGL2 aurora + magnetic CTAs + kinetic text reveal).
 */
const Hero = () => {
  const { settings } = useSiteSettings();

  if (settings.heroTemplate === 'fluid') return <HeroFluid />;

  if (settings.heroTemplate === 'classic') {
    return (
      <Suspense fallback={<div className="min-h-[100svh] bg-stride-ink" />}>
        <HeroClassic />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<div className="min-h-[100svh] bg-stride-ink" />}>
      <HeroShader template={settings.heroTemplate} />
    </Suspense>
  );
};

export default Hero;
