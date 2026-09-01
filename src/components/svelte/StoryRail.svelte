<script lang="ts">
  import { prefersReducedMotion } from '@/lib/browser/motion-preferences';

  import type { Snippet } from 'svelte';

  let { count, children }: { count: number; children: Snippet } = $props();

  let railElement: HTMLDivElement | undefined = $state();

  function scrollByCard(direction: 1 | -1) {
    if (!railElement) {
      return;
    }

    const card = railElement.querySelector('li');
    const cardWidth =
      card instanceof HTMLElement ? card.offsetWidth + 16 : railElement.clientWidth * 0.8;

    railElement.scrollBy({
      left: direction * cardWidth,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      scrollByCard(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      scrollByCard(-1);
    }
  }
</script>

<div class="story-rail">
  <div
    bind:this={railElement}
    class="story-rail__track"
    role="group"
    aria-label="Kisah lain dari Soonies, gulir untuk melihat lebih banyak"
    tabindex="0"
    onkeydown={handleKeydown}
  >
    {@render children()}
  </div>
  {#if count > 1}
    <div class="story-rail__controls">
      <button type="button" aria-label="Sebelumnya" onclick={() => scrollByCard(-1)}>‹</button>
      <button type="button" aria-label="Berikutnya" onclick={() => scrollByCard(1)}>›</button>
    </div>
  {/if}
</div>

<style>
  .story-rail {
    position: relative;
  }

  .story-rail__track {
    display: flex;
    gap: 1rem;
    padding-bottom: 0.5rem;
    overflow-x: auto;
    scroll-snap-type: x proximity;
    scrollbar-width: thin;
  }

  .story-rail__track:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }

  .story-rail__controls {
    display: none;
  }

  @media (min-width: 641px) {
    .story-rail__controls {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .story-rail__controls button {
      display: inline-flex;
      min-width: 44px;
      min-height: 44px;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--ink);
      background: var(--paper);
      font-size: 1.25rem;
      font-weight: 700;
    }

    .story-rail__controls button:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
    }
  }
</style>
