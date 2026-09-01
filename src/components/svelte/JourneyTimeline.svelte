<script lang="ts">
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();

  let containerElement: HTMLDivElement | undefined = $state();

  $effect(() => {
    if (!containerElement || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const items = containerElement.querySelectorAll('[data-journey-entry]');
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.toggleAttribute('data-active', entry.isIntersecting);
        }
      },
      { threshold: 0.35 },
    );

    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  });
</script>

<div bind:this={containerElement} class="journey-timeline">
  {@render children()}
</div>

<style>
  .journey-timeline :global([data-journey-entry]) {
    opacity: 0.85;
    transition:
      opacity 280ms cubic-bezier(0.16, 1, 0.3, 1),
      transform 280ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .journey-timeline :global([data-journey-entry][data-active]) {
    opacity: 1;
  }

  .journey-timeline :global([data-journey-entry][data-active] .journey-node__dot) {
    background: var(--accent);
    box-shadow: 0 0 0 6px color-mix(in srgb, var(--accent) 30%, transparent);
    transform: scale(1.15);
  }

  @media (prefers-reduced-motion: reduce) {
    .journey-timeline :global([data-journey-entry]) {
      opacity: 1;
      transition: none;
    }
  }
</style>
