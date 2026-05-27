import { useEffect, useRef } from 'react';

/**
 * Adds 'is-visible' class to elements when they intersect the viewport.
 * Pair with the `.reveal-on-scroll` utility class in index.css.
 *
 * Usage:
 *   const ref = useScrollReveal();
 *   <div ref={ref} className="reveal-on-scroll">...</div>
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = { threshold: 0.15, rootMargin: '-40px' }
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.classList.add('is-visible');
        observer.unobserve(el);
      }
    }, options);
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}

/**
 * Auto-reveals all `.reveal-on-scroll` elements on a page.
 * Drop <RevealOnScrollRoot/> once in a page to auto-wire all children.
 */
export function RevealOnScrollRoot() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '-30px' }
    );
    const els = document.querySelectorAll('.reveal-on-scroll:not(.is-visible)');
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return null;
}
