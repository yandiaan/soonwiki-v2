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
      { threshold: 0.5 },
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
    opacity: 0.6;
    transition: opacity 0.2s ease;
  }

  .journey-timeline :global([data-active]) {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .journey-timeline :global([data-journey-entry]) {
      opacity: 1;
      transition: none;
    }
  }
</style>
