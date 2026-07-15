import { useEffect } from 'react';
import Lenis from 'lenis';

// Module-level singleton so any component (back-to-top, page layout) can
// drive the same instance. Null on touch devices / reduced motion.
let lenis: Lenis | null = null;

export function getLenis(): Lenis | null {
  return lenis;
}

/** Scroll helper that routes through Lenis when active, falls back to native. */
export function scrollToTop(immediate = false) {
  if (lenis) {
    lenis.scrollTo(0, immediate ? { immediate: true } : { duration: 1.1 });
  } else {
    window.scrollTo({ top: 0, behavior: immediate ? 'auto' : 'smooth' });
  }
}

/**
 * Buttery smooth scrolling via Lenis — fine-pointer (desktop) devices only;
 * touch devices keep native momentum scrolling. Respects reduced motion.
 * Mount once inside the router.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (reduced || !finePointer || lenis) return;

    lenis = new Lenis({
      lerp: 0.115,
      wheelMultiplier: 1,
      smoothWheel: true,
      syncTouch: false,
      // Hand the wheel back to nested scrollables (admin panels, dialogs,
      // command menus) — otherwise Lenis scrolls the page underneath them.
      prevent: (node) =>
        !!(node as HTMLElement).closest?.(
          '[data-lenis-prevent], [role="dialog"], [data-radix-scroll-area-viewport], .overflow-y-auto, .overflow-auto',
        ),
    });

    let rafId = 0;
    const loop = (time: number) => {
      lenis?.raf(time);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  return null;
}
