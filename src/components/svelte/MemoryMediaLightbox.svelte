<script lang="ts">
  import { onMount } from 'svelte';
  import { publicStorageUrl } from '@/lib/shared/paths';

  let {
    mediaPath,
    mediaType = 'image',
    title,
    onClose,
  }: {
    mediaPath: string;
    mediaType?: 'image' | 'video';
    title: string;
    onClose: () => void;
  } = $props();

  const url = publicStorageUrl('memories', mediaPath);

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      onClose();
    }
  }

  onMount(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  });
</script>

<svelte:window onkeydown={handleKeydown} />

<div
  class="lightbox-backdrop"
  role="dialog"
  aria-modal="true"
  aria-label={`Pratinjau media: ${title}`}
  onclick={onClose}
>
  <div class="lightbox-container" onclick={(e) => e.stopPropagation()}>
    <!-- Close button -->
    <button type="button" class="lightbox-close-btn" onclick={onClose} aria-label="Tutup pratinjau">
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>

    <!-- Media Content -->
    <div class="lightbox-media-wrapper">
      {#if mediaType === 'video'}
        <video
          src={url}
          controls
          playsinline
          webkit-playsinline
          preload="metadata"
          class="lightbox-video"
        >
          <source src={url} type="video/mp4" />
          <source src={url} type="video/webm" />
          <track kind="captions" />
          Browser Anda tidak mendukung tag video.
        </video>
      {:else}
        <img src={url} alt={title} class="lightbox-image" loading="eager" />
      {/if}
    </div>

    <div class="lightbox-caption">
      <h3>{title}</h3>
    </div>
  </div>
</div>

<style>
  .lightbox-backdrop {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(10, 12, 11, 0.92);
    backdrop-filter: blur(12px);
    padding: 1.5rem;
    animation: fadeIn 200ms ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .lightbox-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 95vw;
    max-height: 92vh;
    animation: zoomIn 220ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes zoomIn {
    from {
      transform: scale(0.95);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  .lightbox-close-btn {
    position: absolute;
    top: -2.75rem;
    right: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.15);
    color: #ffffff;
    border: none;
    cursor: pointer;
    transition:
      background-color 150ms ease,
      transform 150ms ease;
  }

  .lightbox-close-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }

  .lightbox-media-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    max-height: calc(85vh - 3rem);
    border-radius: 0.75rem;
    overflow: hidden;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
  }

  .lightbox-image {
    max-width: 100%;
    max-height: calc(85vh - 3rem);
    object-fit: contain;
    border-radius: 0.75rem;
  }

  .lightbox-video {
    max-width: 100%;
    max-height: calc(85vh - 3rem);
    border-radius: 0.75rem;
    background: #000;
  }

  .lightbox-caption {
    margin-top: 0.75rem;
    text-align: center;
  }

  .lightbox-caption h3 {
    margin: 0;
    color: #ffffff;
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: -0.01em;
  }
</style>
