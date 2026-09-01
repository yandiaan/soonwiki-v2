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
      <button type="button" onclick={() => scrollByCard(-1)}>Sebelumnya</button>
      <button type="button" onclick={() => scrollByCard(1)}>Berikutnya</button>
    </div>
  {/if}
</div>

<style>
  .story-rail {
    position: relative;
    min-width: 0;
  }

  .story-rail__track {
    display: flex;
    max-width: 100%;
    gap: 1rem;
    padding-bottom: 0.5rem;
    overflow-x: auto;
    scroll-snap-type: x proximity;
    scrollbar-width: none;
  }

  .story-rail__track::-webkit-scrollbar {
    display: none;
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
      justify-content: space-between;
      gap: 1rem;
      margin-top: 1rem;
    }

    .story-rail__controls button {
      display: inline-flex;
      min-height: 44px;
      align-items: center;
      justify-content: center;
      padding: 0;
      border: 0;
      border-bottom: 1px solid currentColor;
      background: transparent;
      color: var(--ink);
      font-size: 0.9rem;
      font-weight: 700;
      cursor: pointer;
    }

    .story-rail__controls button:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
    }
  }
</style>
