import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

interface LogoProps {
  className?: string;
  /** 'light' = cream logo (for dark surfaces), 'dark' = navy logo (for light
   *  surfaces), 'auto' (default) = follows the site theme so the logo is
   *  white in night mode and navy in light mode. */
  tone?: 'light' | 'dark' | 'auto';
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
const Logo = ({ className, tone = 'auto', size = 26 }: LogoProps) => {
  const { theme } = useTheme();
  const resolved = tone === 'auto' ? (theme === 'dark' ? 'light' : 'dark') : tone;

  return (
    <span className={cn('inline-flex items-center select-none group/logo', className)}>
      <img
        src={resolved === 'light' ? '/logo-full-light.png' : '/logo-full.png'}
        alt="StrideShift Global"
        style={{ height: size, width: 'auto' }}
        className="block transition-transform duration-500 group-hover/logo:scale-[1.02]"
        draggable={false}
      />
    </span>
  );
};

export default Logo;
