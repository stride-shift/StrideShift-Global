import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  /** 'light' for dark backgrounds (white), 'dark' for light backgrounds (navy) */
  tone?: 'light' | 'dark';
  /** Show the "GLOBAL" sub-word. Off = compact "STRIDESHIFT" only. */
  full?: boolean;
  /** Height of the ring mark in px */
  size?: number;
}

/**
 * StrideShift brand mark — faithful recreation of the official logo:
 * a thick ring mark + the "STRIDESHIFT GLOBAL" uppercase wordmark.
 * SVG-based so it stays crisp and adapts to light / dark surfaces.
 */
const Logo = ({ className, tone = 'dark', full = true, size = 30 }: LogoProps) => {
  const isLight = tone === 'light';
  const markColor = isLight ? 'hsl(var(--stride-cream))' : 'hsl(var(--stride-ink))';
  const wordColor = isLight ? 'text-stride-cream' : 'text-stride-text-strong';
  const subColor = isLight ? 'text-stride-cream/65' : 'text-stride-text-muted';

  return (
    <span className={cn('inline-flex items-center gap-2.5 select-none group/logo', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        aria-hidden="true"
        className="flex-shrink-0 transition-transform duration-500 group-hover/logo:rotate-[18deg]"
      >
        {/* Outer ring mark */}
        <circle cx="32" cy="32" r="20" fill="none" stroke={markColor} strokeWidth="11" />
        {/* Inner accent dot — sage brand pop (matches the Angle palette) */}
        <circle cx="32" cy="32" r="5.5" fill="hsl(var(--stride-sage))" />
      </svg>
      <span className="flex items-baseline gap-1.5 leading-none">
        <span
          className={cn(
            'font-bold uppercase tracking-[0.04em] text-[1.05rem]',
            wordColor
          )}
          style={{ fontFamily: "'Wix Madefor Text', sans-serif" }}
        >
          Strideshift
        </span>
        {full && (
          <span
            className={cn('font-medium uppercase tracking-[0.18em] text-[0.7rem]', subColor)}
            style={{ fontFamily: "'Wix Madefor Text', sans-serif" }}
          >
            Global
          </span>
        )}
      </span>
    </span>
  );
};

export default Logo;
