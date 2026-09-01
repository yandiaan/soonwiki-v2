import Lenis from 'lenis';

import { prefersReducedMotion } from '@/lib/browser/motion-preferences';

let lenisInstance: Lenis | null = null;

export function initSmoothScroll(): () => void {
  if (typeof window === 'undefined' || prefersReducedMotion()) {
    return () => {};
  }

  // Reuse existing instance if present
  if (!lenisInstance) {
    lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    function raf(time: number) {
      lenisInstance?.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Bind anchor links for smooth scrolling to sections (e.g. #tentang)
    document.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (target) {
        const hash = target.getAttribute('href');
        if (hash && hash.length > 1) {
          const el = document.querySelector(hash);
          if (el) {
            e.preventDefault();
            lenisInstance?.scrollTo(el as HTMLElement, { offset: -80 });
          }
        }
      }
    });
  } else {
    // Recalculate dimensions on page navigation
    lenisInstance.resize();
  }

  return () => {
    // No-op for singleton across View Transitions
  };
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}
