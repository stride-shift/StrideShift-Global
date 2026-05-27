import { useTheme } from '@/hooks/useTheme';

/**
 * The site-wide section eyebrow — small uppercase tracked label flanked by
 * two thin colour bars. Yellow (gold) in dark mode, blue (sky) in light mode,
 * per the brand spec. Use above every section H2 for a consistent rhythm.
 *
 *   <SectionEyebrow>Voices</SectionEyebrow>
 */
interface SectionEyebrowProps {
  children: React.ReactNode;
  /** Adjust horizontal alignment. */
  align?: 'left' | 'center';
  className?: string;
}

const SectionEyebrow = ({ children, align = 'center', className = '' }: SectionEyebrowProps) => {
  const { theme } = useTheme();
  const colour = theme === 'dark' ? 'text-stride-gold' : 'text-stride-sky';
  const barBg = theme === 'dark' ? 'bg-stride-gold/60' : 'bg-stride-sky/60';
  const wrap = align === 'center' ? 'justify-center' : 'justify-start';
  return (
    <div className={`inline-flex items-center gap-3 ${wrap} ${className}`}>
      <span className={`h-px w-8 md:w-12 ${barBg}`} aria-hidden="true" />
      <span
        className={`text-[11px] uppercase tracking-[0.28em] font-semibold ${colour}`}
      >
        {children}
      </span>
      <span className={`h-px w-8 md:w-12 ${barBg}`} aria-hidden="true" />
    </div>
  );
};

export default SectionEyebrow;
