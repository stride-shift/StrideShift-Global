import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CursorSpotlightProps {
  children: ReactNode;
  className?: string;
  /** Color of the spotlight — defaults to brand sky. Provide an `hsl(...)` value. */
  color?: string;
  /** Radius of the spotlight in px. */
  radius?: number;
}

/**
 * Wraps a section in a div whose ::before paints a radial light that follows
 * the cursor. Driven by CSS custom properties (--mx, --my), updated via JS
 * for max perf. Pairs with `.cursor-spotlight` in index.css.
 */
const CursorSpotlight = ({ children, className, color, radius = 600 }: CursorSpotlightProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--mx', `${x}px`);
        el.style.setProperty('--my', `${y}px`);
      });
    };
    el.addEventListener('mousemove', onMove);
    return () => {
      el.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const style: React.CSSProperties = {};
  if (color || radius) {
    // Override the gradient inline if a custom color is given
    if (color) {
      (style as Record<string, string>)[
        '--spotlight-color'
      ] = color;
    }
    (style as Record<string, string>)['--spotlight-radius'] = `${radius}px`;
  }

  return (
    <div
      ref={ref}
      className={cn('cursor-spotlight', className)}
      style={style}
    >
      <div className="relative z-[1]">{children}</div>
    </div>
  );
};

export default CursorSpotlight;
