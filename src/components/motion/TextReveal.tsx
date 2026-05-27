import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TextRevealProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  className?: string;
  /** Per-word delay in ms — controls the cascade speed. */
  staggerMs?: number;
  /** Initial delay before the first word reveals, in ms. */
  initialDelayMs?: number;
  /** Trigger on mount instead of on scroll. */
  immediate?: boolean;
}

/**
 * Word-by-word mask reveal. Splits `text` into spans, each clipped by its
 * containing line, and slides them up from below when the line enters view.
 *
 * Pair with the `.reveal-line` / `.reveal-word` CSS in index.css.
 */
const TextReveal = ({
  text,
  as: Tag = 'h2',
  className,
  staggerMs = 70,
  initialDelayMs = 0,
  immediate = false,
}: TextRevealProps) => {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const wordEls = el.querySelectorAll<HTMLSpanElement>('.reveal-word');
    const animateIn = () => {
      wordEls.forEach((w, i) => {
        const d = initialDelayMs + i * staggerMs;
        w.style.transitionDelay = `${d}ms`;
        w.classList.add('is-in');
      });
    };

    if (immediate) {
      animateIn();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateIn();
            io.disconnect();
          }
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [text, immediate, staggerMs, initialDelayMs]);

  const words = text.split(/\s+/);

  return (
    <Tag ref={rootRef as never} className={cn('reveal-line', className)}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="inline-block overflow-hidden align-baseline pr-[0.18em]">
          <span className="reveal-word">{w}</span>
        </span>
      ))}
    </Tag>
  );
};

export default TextReveal;
