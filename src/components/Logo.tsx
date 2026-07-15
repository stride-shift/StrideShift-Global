import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  /** 'light' for dark backgrounds (cream), 'dark' for light backgrounds (navy) */
  tone?: 'light' | 'dark';
  /** Kept for API compatibility — the full wordmark is always shown. */
  full?: boolean;
  /** Height of the logo in px */
  size?: number;
}

/**
 * StrideShift brand mark — the official logo image (ring mark + "STRIDESHIFT
 * GLOBAL" wordmark), trimmed to the artwork with a transparent background.
 * Two variants: navy for light surfaces, cream for dark surfaces.
 */
const Logo = ({ className, tone = 'dark', size = 26 }: LogoProps) => (
  <span className={cn('inline-flex items-center select-none group/logo', className)}>
    <img
      src={tone === 'light' ? '/logo-full-light.png' : '/logo-full.png'}
      alt="StrideShift Global"
      style={{ height: size, width: 'auto' }}
      className="block transition-transform duration-500 group-hover/logo:scale-[1.02]"
      draggable={false}
    />
  </span>
);

export default Logo;
