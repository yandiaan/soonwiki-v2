<script lang="ts">
  import { onMount } from 'svelte';
  import { prefersReducedMotion } from '@/lib/browser/motion-preferences';

  import type { Snippet } from 'svelte';

  let { count, children }: { count: number; children: Snippet } = $props();

  let railElement: HTMLDivElement | undefined = $state();
  let canScrollLeft = $state(false);
  let canScrollRight = $state(true);

  function updateScrollState() {
    if (!railElement) return;
    const { scrollLeft, scrollWidth, clientWidth } = railElement;
    canScrollLeft = scrollLeft > 8;
    canScrollRight = scrollLeft < scrollWidth - clientWidth - 8;
  }

  onMount(() => {
    updateScrollState();
    if (railElement) {
      railElement.addEventListener('scroll', updateScrollState, { passive: true });
    }
    return () => {
      if (railElement) {
        railElement.removeEventListener('scroll', updateScrollState);
      }
    };
  });

  function scrollByCard(direction: 1 | -1) {
    if (!railElement) {
      return;
    }

    const card = railElement.querySelector('li');
    const cardWidth =
      card instanceof HTMLElement ? card.offsetWidth + 20 : railElement.clientWidth * 0.75;

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
    aria-label="Kisah lain dari SoonMates, gulir untuk melihat lebih banyak"
    tabindex="0"
    onkeydown={handleKeydown}
    data-lenis-prevent
  >
    {@render children()}
  </div>
  {#if count > 1}
    <div class="story-rail__controls" aria-label="Navigasi kisah">
      <button
        type="button"
        class="story-rail__btn"
        disabled={!canScrollLeft}
        aria-label="Kisah sebelumnya"
        onclick={() => scrollByCard(-1)}
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        type="button"
        class="story-rail__btn"
        disabled={!canScrollRight}
        aria-label="Kisah berikutnya"
        onclick={() => scrollByCard(1)}
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
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
    gap: 1.25rem;
    padding-bottom: 0.75rem;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    touch-action: pan-x;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-x: contain;
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
      justify-content: flex-end;
      align-items: center;
      gap: 0.75rem;
      margin-top: 1.5rem;
    }

    .story-rail__btn {
      display: inline-flex;
      width: 44px;
      height: 44px;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      border: 1px solid var(--line-soft);
      background: var(--surface);
      color: var(--ink);
      cursor: pointer;
      transition:
        background-color 180ms var(--ease-out),
        transform 180ms var(--ease-out),
        border-color 180ms var(--ease-out),
        opacity 180ms var(--ease-out);
    }

    .story-rail__btn:hover:not(:disabled) {
      background: var(--ink);
      color: var(--surface);
      border-color: var(--ink);
      transform: scale(1.06);
    }

    .story-rail__btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
      border-color: var(--line-soft);
    }

    .story-rail__btn:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
    }
  }
</style>
