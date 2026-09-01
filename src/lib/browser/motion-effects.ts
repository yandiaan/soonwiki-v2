import { animate, inView } from 'motion';

import { prefersReducedMotion } from '@/lib/browser/motion-preferences';

export const editorialEase = [0.16, 1, 0.3, 1] as const;

export function initScrollReveals() {
  if (typeof window === 'undefined' || prefersReducedMotion()) {
    return () => {};
  }

  const cleanups: Array<() => void> = [];

  // 1. Single Element Reveals (data-reveal)
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
            y: [24, 0],
          },
          {
            duration: 0.85,
            ease: editorialEase,
          },
        );
      },
      { margin: '0px 0px -60px 0px' },
    );
    cleanups.push(cleanup);
  });

  // 2. Staggered Group Reveals (data-reveal-group)
  const groupElements = document.querySelectorAll<HTMLElement>(
    '[data-reveal-group]:not([data-group-revealed])',
  );
  groupElements.forEach((group) => {
    group.setAttribute('data-group-revealed', 'ready');
    const children = group.querySelectorAll<HTMLElement>(':scope > *');
    if (children.length === 0) return;

    children.forEach((child) => {
      child.style.opacity = '0';
      child.style.transform = 'translateY(20px)';
    });

    const cleanup = inView(
      group,
      () => {
        children.forEach((child, index) => {
          void animate(
            child as Element,
            {
              opacity: [0, 1],
              y: [20, 0],
            },
            {
              duration: 0.75,
              delay: index * 0.12,
              ease: editorialEase,
            },
          );
        });
      },
      { margin: '0px 0px -40px 0px' },
    );
    cleanups.push(cleanup);
  });

  return () => {
    cleanups.forEach((c) => c());
  };
}
