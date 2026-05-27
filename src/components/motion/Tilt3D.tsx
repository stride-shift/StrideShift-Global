import { useRef, useCallback, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Tilt3DProps {
  children: ReactNode;
  className?: string;
  /** Max rotation in degrees on each axis. */
  max?: number;
  /** How far the inner layer is pushed forward (px). */
  depth?: number;
  /** Apply a soft glare overlay that follows the cursor. */
  glare?: boolean;
}

/**
 * Lightweight pointer-tracking 3D tilt. The element rotates around its
 * center in response to the cursor; an optional .tilt-inner child stays
 * pushed forward, creating parallax depth.
 *
 * No external deps — runs at native 60fps with rAF batching.
 */
const Tilt3D = ({ children, className, max = 9, depth = 30, glare = true }: Tilt3DProps) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rx = (0.5 - y) * max * 2;
      const ry = (x - 0.5) * max * 2;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
        const inner = el.querySelector<HTMLElement>('.tilt-inner');
        if (inner) inner.style.transform = `translateZ(${depth}px)`;
        if (glareRef.current) {
          glareRef.current.style.background = `radial-gradient(400px circle at ${x * 100}% ${y * 100}%, hsl(var(--stride-cream) / 0.18), transparent 50%)`;
          glareRef.current.style.opacity = '1';
        }
      });
    },
    [max, depth],
  );

  const onLeave = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    el.style.transform = 'perspective(900px) rotateX(0) rotateY(0)';
    const inner = el.querySelector<HTMLElement>('.tilt-inner');
    if (inner) inner.style.transform = 'translateZ(0)';
    if (glareRef.current) glareRef.current.style.opacity = '0';
  }, []);

  return (
    <div
      ref={wrapRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn('tilt-card relative will-change-transform', className)}
    >
      {children}
      {glare && (
        <div
          ref={glareRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 mix-blend-screen"
        />
      )}
    </div>
  );
};

export default Tilt3D;
