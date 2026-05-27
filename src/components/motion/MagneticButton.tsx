import { forwardRef, useRef, useCallback, type CSSProperties, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  /** Magnetic pull strength, 0–1. 0.3 is subtle, 0.6 is dramatic. */
  strength?: number;
  /** Render as anchor instead of button. */
  href?: string;
  /** Target attribute for anchor. */
  target?: string;
  rel?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  ariaLabel?: string;
  /** Inline style — merged with magnetic transforms set imperatively. */
  style?: CSSProperties;
}

/**
 * Magnetic CTA — content drifts subtly toward the cursor as it approaches.
 * Composes with normal button styling: pass everything through className.
 */
const MagneticButton = forwardRef<HTMLElement, MagneticButtonProps>(
  ({ children, className, strength = 0.35, href, target, rel, onClick, type = 'button', ariaLabel, style }, _ref) => {
    const elRef = useRef<HTMLElement>(null);
    const innerRef = useRef<HTMLSpanElement>(null);

    const onMove = useCallback(
      (e: React.MouseEvent<HTMLElement>) => {
        const el = elRef.current;
        const inner = innerRef.current;
        if (!el || !inner) return;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0)`;
        inner.style.transform = `translate3d(${x * strength * 0.4}px, ${y * strength * 0.4}px, 0)`;
      },
      [strength],
    );

    const onLeave = useCallback(() => {
      const el = elRef.current;
      const inner = innerRef.current;
      if (!el || !inner) return;
      el.style.transform = '';
      inner.style.transform = '';
    }, []);

    const baseClass = cn(
      'inline-flex items-center justify-center transition-transform duration-300 ease-out will-change-transform',
      className,
    );

    const content = (
      <span ref={innerRef} className="inline-flex items-center justify-center gap-2 transition-transform duration-300 ease-out">
        {children}
      </span>
    );

    if (href) {
      return (
        <a
          ref={elRef as React.RefObject<HTMLAnchorElement>}
          href={href}
          target={target}
          rel={rel}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          onClick={onClick}
          className={baseClass}
          aria-label={ariaLabel}
          style={style}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={elRef as React.RefObject<HTMLButtonElement>}
        type={type}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        onClick={onClick}
        className={baseClass}
        aria-label={ariaLabel}
        style={style}
      >
        {content}
      </button>
    );
  },
);

MagneticButton.displayName = 'MagneticButton';

export default MagneticButton;
