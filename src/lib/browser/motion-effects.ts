import { animate, inView } from 'motion';

import { prefersReducedMotion } from '@/lib/browser/motion-preferences';

// Cinematic luxury editorial ease (slow luxurious settling)
export const editorialEase = [0.19, 1, 0.22, 1] as const;

export function initScrollReveals() {
  if (typeof window === 'undefined' || prefersReducedMotion()) {
    return () => {};
  }

  const cleanups: Array<() => void> = [];

  // 1. Glass Blur Entrance for Hero Sections
  const heroElements = document.querySelectorAll<HTMLElement>(
    '[data-hero-glass]:not([data-hero-revealed])',
  );
  heroElements.forEach((el) => {
    el.setAttribute('data-hero-revealed', 'ready');
    void animate(
      el as Element,
      {
        opacity: [0, 1],
        filter: ['blur(20px)', 'blur(0px)'],
        y: [30, 0],
      },
      {
        duration: 1.5,
        ease: editorialEase,
      },
    );
  });

  // 2. Single Element Reveals with Glass Blur Transition (data-reveal)
  const singleElements = document.querySelectorAll<HTMLElement>(
    '[data-reveal]:not([data-revealed])',
  );
  singleElements.forEach((el) => {
    el.setAttribute('data-revealed', 'ready');
    const cleanup = inView(
      el,
      () => {
        void animate(
          el as Element,
          {
            opacity: [0, 1],
            filter: ['blur(12px)', 'blur(0px)'],
            y: [32, 0],
          },
          {
            duration: 1.25,
            ease: editorialEase,
          },
        );
      },
      { margin: '0px 0px -40px 0px' },
    );
    cleanups.push(cleanup);
  });

  // 3. Staggered Group Reveals with Glass Blur Transition (data-reveal-group)
  const groupElements = document.querySelectorAll<HTMLElement>(
    '[data-reveal-group]:not([data-group-revealed])',
  );
  groupElements.forEach((group) => {
    group.setAttribute('data-group-revealed', 'ready');
    const children = group.querySelectorAll<HTMLElement>(':scope > *');
    if (children.length === 0) return;

    children.forEach((child) => {
      child.style.opacity = '0';
      child.style.filter = 'blur(14px)';
      child.style.transform = 'translateY(28px)';
    });

    const cleanup = inView(
      group,
      () => {
        children.forEach((child, index) => {
          void animate(
            child as Element,
            {
              opacity: [0, 1],
              filter: ['blur(14px)', 'blur(0px)'],
              y: [28, 0],
            },
            {
              duration: 1.15,
              delay: index * 0.18,
              ease: editorialEase,
            },
          );
        });
      },
      { margin: '0px 0px -30px 0px' },
    );
    cleanups.push(cleanup);
  });

  return () => {
    cleanups.forEach((c) => c());
  };
}
