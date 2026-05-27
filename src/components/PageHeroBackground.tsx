import { Suspense } from 'react';
import { GLSLHills } from '@/components/ui/glsl-hills';
import { useTheme } from '@/hooks/useTheme';

interface PageHeroBackgroundProps {
  /** Optional override for animation speed. */
  speed?: number;
}

/**
 * The site-wide page-hero background: a GLSL hills shader with a soft top
 * and bottom fade for legibility, and a theme-aware ridge colour. Drop this
 * inside any `position: relative` hero section. The section's text content
 * should sit above it via `relative z-10` (or similar).
 */
export function PageHeroBackground({ speed = 0.45 }: PageHeroBackgroundProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Bright sky-blue in light mode, lifted steel-blue in dark mode.
  const hillColor: [number, number, number] = isDark
    ? [0.32, 0.48, 0.66]
    : [0.49, 0.83, 0.99];
  const heroBg = isDark ? '#172333' : '#0a1a30';

  return (
    <>
      {/* Base colour, behind everything */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundColor: heroBg }}
        aria-hidden="true"
      />

      {/* The shader */}
      <Suspense
        fallback={
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundColor: heroBg }}
            aria-hidden="true"
          />
        }
      >
        <GLSLHills color={hillColor} speed={speed} />
      </Suspense>

      {/* Soft top fade — keeps the navbar legible */}
      <div
        className="absolute inset-x-0 top-0 h-48 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, ${heroBg} 0%, ${heroBg}cc 40%, transparent 100%)`,
        }}
        aria-hidden="true"
      />
      {/* Soft bottom fade — separates hero from the page body below */}
      <div
        className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
        style={{
          background: `linear-gradient(to top, ${heroBg}b3 0%, transparent 100%)`,
        }}
        aria-hidden="true"
      />
    </>
  );
}

export default PageHeroBackground;
