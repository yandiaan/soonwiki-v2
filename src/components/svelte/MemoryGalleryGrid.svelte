<script lang="ts">
  import MemoryMediaLightbox from '@/components/svelte/MemoryMediaLightbox.svelte';
  import MemoryUploaderModal from '@/components/svelte/MemoryUploaderModal.svelte';
  import { SOON_GENERATIONS, getGenerationName } from '@/lib/shared/generations';
  import { paths, publicStorageUrl } from '@/lib/shared/paths';
  import type { MemoryCard } from '@/lib/shared/memory-models';

  let {
    initialMemories = [],
    isAuthenticated = false,
  }: {
    initialMemories: MemoryCard[];
    isAuthenticated?: boolean;
  } = $props();

  let memories = $state<MemoryCard[]>([...initialMemories]);
  let selectedGen = $state('all');
  let selectedMediaType = $state<'all' | 'image' | 'video'>('all');
  let searchQuery = $state('');

  let isUploadModalOpen = $state(false);
  let activeLightboxMedia = $state<{ path: string; type: 'image' | 'video'; title: string } | null>(
    null,
  );

  // Derived filtered memories
  let filteredMemories = $derived(
    memories.filter((m) => {
      // Filter generation
      if (selectedGen !== 'all' && m.generationKey !== selectedGen) {
        return false;
      }
      // Filter media type
      if (selectedMediaType !== 'all' && m.mediaType !== selectedMediaType) {
        return false;
      }
      // Filter search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = m.title.toLowerCase().includes(query);
        const matchesStory = m.story.toLowerCase().includes(query);
        const matchesLocation = m.locationTag ? m.locationTag.toLowerCase().includes(query) : false;
        const matchesAuthor = m.author.name.toLowerCase().includes(query);
        if (!matchesTitle && !matchesStory && !matchesLocation && !matchesAuthor) {
          return false;
        }
      }
      return true;
    }),
  );

  function handleUploadSuccess() {
    // Reload page to fetch updated list
    window.location.reload();
  }
</script>

<div class="memory-gallery">
  <!-- Controls Bar -->
  <div class="gallery-controls">
    <!-- Top Action Row -->
    <div class="controls-main">
      <!-- Search Input -->
      <div class="search-box">
        <svg
          class="search-icon"
          viewBox="0 0 24 24"
          width="17"
          height="17"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="search"
          bind:value={searchQuery}
          placeholder="Cari momen, cerita, atau tempat..."
          aria-label="Cari kenangan"
        />
        {#if searchQuery}
          <button
            type="button"
            class="clear-search-btn"
            onclick={() => (searchQuery = '')}
            aria-label="Bersihkan pencarian"
          >
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        {/if}
      </div>

      <!-- Media Type Filters -->
      <div class="media-type-pills" role="radiogroup" aria-label="Filter jenis media">
        <button
          type="button"
          class="type-pill"
          class:type-pill--active={selectedMediaType === 'all'}
          onclick={() => (selectedMediaType = 'all')}
        >
          Semua
        </button>
        <button
          type="button"
          class="type-pill"
          class:type-pill--active={selectedMediaType === 'image'}
          onclick={() => (selectedMediaType = 'image')}
        >
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          Foto
        </button>
        <button
          type="button"
          class="type-pill"
          class:type-pill--active={selectedMediaType === 'video'}
          onclick={() => (selectedMediaType = 'video')}
        >
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
          Video
        </button>
      </div>

      <!-- Upload CTA Button -->
      {#if isAuthenticated}
        <button type="button" class="upload-cta-btn" onclick={() => (isUploadModalOpen = true)}>
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Unggah Kenangan</span>
        </button>
      {:else}
        <a href={paths.login()} class="upload-cta-btn">
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
          >
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
          <span>Masuk untuk Berbagi</span>
        </a>
      {/if}
    </div>

    <!-- Generation Pills Row -->
    <div class="gen-pills-scroll" role="radiogroup" aria-label="Filter angkatan">
      <button
        type="button"
        class="gen-pill"
        class:gen-pill--active={selectedGen === 'all'}
        onclick={() => (selectedGen = 'all')}
      >
        Semua Angkatan
      </button>
      {#each SOON_GENERATIONS as gen (gen.key)}
        <button
          type="button"
          class="gen-pill"
          class:gen-pill--active={selectedGen === gen.key}
          onclick={() => (selectedGen = gen.key)}
        >
          {gen.name}
        </button>
      {/each}
    </div>
  </div>

  <!-- Cards Grid -->
  {#if filteredMemories.length === 0}
    <div class="gallery-empty">
      <div class="empty-icon-wrapper">
        <svg
          viewBox="0 0 24 24"
          width="36"
          height="36"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
      <h3>Tidak Ada Kenangan yang Sesuai</h3>
      <p>Coba gunakan kata kunci lain atau pilih angkatan yang berbeda.</p>
      {#if isAuthenticated}
        <button type="button" class="btn-empty-upload" onclick={() => (isUploadModalOpen = true)}>
          Unggah Kenangan Pertama
        </button>
      {/if}
    </div>
  {:else}
    <div class="memories-grid">
      {#each filteredMemories as memory (memory.id)}
        {@const mediaUrl = publicStorageUrl('memories', memory.mediaPath)}
        {@const authorAvatar = memory.author.photoPath
          ? publicStorageUrl('profile-photos', memory.author.photoPath)
          : null}
        {@const initials = memory.author.name
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((p) => p[0]?.toUpperCase())
          .join('')}

        <article class="memory-card">
          <!-- Media Preview (Click to open Lightbox) -->
          <button
            type="button"
            class="card-media-box"
            class:card-media-box--square={memory.mediaAspectRatio === '1/1'}
            class:card-media-box--portrait={memory.mediaAspectRatio === '9/16'}
            onclick={() =>
              (activeLightboxMedia = {
                path: memory.mediaPath,
                type: memory.mediaType,
                title: memory.title,
              })}
            aria-label={`Perbesar media ${memory.title}`}
          >
            {#if memory.mediaType === 'video'}
              <video
                src={mediaUrl}
                class="card-media card-media--video"
                preload="metadata"
                muted
                playsinline
                webkit-playsinline
                loop
                onmouseenter={(e) => {
                  (e.currentTarget as HTMLVideoElement).play().catch(() => {});
                }}
                onmouseleave={(e) => {
                  const v = e.currentTarget as HTMLVideoElement;
                  v.pause();
                  v.currentTime = 0;
                }}
              >
                <source src={mediaUrl} type="video/mp4" />
                <source src={mediaUrl} type="video/webm" />
              </video>
              <div class="video-indicator" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
            {:else}
              <img src={mediaUrl} alt={memory.title} loading="lazy" class="card-media" />
            {/if}

            <!-- Badges on media overlay -->
            <div class="media-overlay-badge">
              <span class="gen-tag">{getGenerationName(memory.generationKey)}</span>
              {#if memory.memoryYear}
                <span class="year-tag">{memory.memoryYear}</span>
              {/if}
            </div>
          </button>

          <!-- Card Content Body -->
          <div class="card-body">
            {#if memory.locationTag}
              <div class="card-location">
                <svg
                  viewBox="0 0 24 24"
                  width="13"
                  height="13"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{memory.locationTag}</span>
              </div>
            {/if}

            <h3 class="card-title">
              <a href={paths.memoryDetail(memory.id)}>{memory.title}</a>
            </h3>

            <p class="card-story">{memory.story}</p>

            <!-- Card Footer -->
            <div class="card-footer">
              <!-- Author snippet -->
              <div class="card-author">
                <div class="author-avatar-small">
                  {#if authorAvatar}
                    <img src={authorAvatar} alt={memory.author.name} />
                  {:else}
                    <span>{initials}</span>
                  {/if}
                </div>
                {#if memory.author.slug}
                  <a href={paths.profile(memory.author.slug)} class="author-name">
                    {memory.author.name}
                  </a>
                {:else}
                  <span class="author-name">{memory.author.name}</span>
                {/if}
              </div>

              <!-- Reactions & Comments Meta Counters -->
              <a href={paths.memoryDetail(memory.id)} class="card-stats" aria-label="Buka diskusi">
                {#if memory.reactionCount > 0}
                  <span class="stat-item" title={`${memory.reactionCount} reaksi apresiasi`}>
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                      <path
                        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                      />
                    </svg>
                    <span>{memory.reactionCount}</span>
                  </span>
                {/if}

                {#if memory.commentCount > 0}
                  <span class="stat-item" title={`${memory.commentCount} komentar`}>
                    <svg
                      viewBox="0 0 24 24"
                      width="13"
                      height="13"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                      />
                    </svg>
                    <span>{memory.commentCount}</span>
                  </span>
                {/if}
              </a>
            </div>
          </div>
        </article>
      {/each}
    </div>
  {/if}

  <!-- Modals -->
  <MemoryUploaderModal bind:isOpen={isUploadModalOpen} onSuccess={handleUploadSuccess} />

  {#if activeLightboxMedia}
    <MemoryMediaLightbox
      mediaPath={activeLightboxMedia.path}
      mediaType={activeLightboxMedia.type}
      title={activeLightboxMedia.title}
      onClose={() => (activeLightboxMedia = null)}
    />
  {/if}
</div>

<style>
  .memory-gallery {
    display: grid;
    gap: 2rem;
  }

  /* Controls */
  .gallery-controls {
    display: grid;
    gap: 1rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--line-soft);
  }

  .controls-main {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
    justify-content: space-between;
  }

  .search-box {
    position: relative;
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 220px;
    max-width: 380px;
  }

  .search-icon {
    position: absolute;
    left: 0.85rem;
    color: var(--ink-soft);
    pointer-events: none;
  }

  .search-box input {
    width: 100%;
    height: 42px;
    padding: 0 2.2rem 0 2.4rem;
    border-radius: 9999px;
    background: var(--surface);
    border: 1px solid var(--line-soft);
    font-family: inherit;
    font-size: 0.88rem;
    color: var(--ink);
    outline: none;
    transition:
      border-color 150ms ease,
      box-shadow 150ms ease;
  }

  .search-box input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent);
  }

  .clear-search-btn {
    position: absolute;
    right: 0.75rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: none;
    background: var(--surface-muted);
    color: var(--ink-soft);
    cursor: pointer;
  }

  .media-type-pills {
    display: inline-flex;
    align-items: center;
    background: var(--surface-muted);
    padding: 3px;
    border-radius: 9999px;
    border: 1px solid var(--line-soft);
  }

  .type-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    height: 34px;
    padding: 0 0.95rem;
    border-radius: 9999px;
    border: none;
    background: transparent;
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--ink-soft);
    cursor: pointer;
    transition:
      background-color 150ms ease,
      color 150ms ease;
  }

  .type-pill--active {
    background: var(--surface);
    color: var(--ink);
    box-shadow: 0 2px 8px rgba(18, 21, 20, 0.06);
  }

  .upload-cta-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    height: 42px;
    padding: 0 1.25rem;
    border-radius: 9999px;
    background: var(--accent);
    color: #ffffff;
    border: none;
    font-size: 0.88rem;
    font-weight: 700;
    text-decoration: none;
    cursor: pointer;
    transition:
      opacity 150ms ease,
      transform 150ms ease;
  }

  .upload-cta-btn:hover {
    opacity: 0.92;
    transform: translateY(-1px);
  }

  /* Generation Pills */
  .gen-pills-scroll {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    overflow-x: auto;
    padding-block: 0.25rem;
    scrollbar-width: none;
  }

  .gen-pills-scroll::-webkit-scrollbar {
    display: none;
  }

  .gen-pill {
    display: inline-flex;
    white-space: nowrap;
    padding: 0.3rem 0.85rem;
    border-radius: 9999px;
    background: var(--surface);
    border: 1px solid var(--line-soft);
    font-size: 0.8rem;
    font-weight: 650;
    color: var(--ink-soft);
    cursor: pointer;
    transition:
      background-color 150ms ease,
      border-color 150ms ease,
      color 150ms ease;
  }

  .gen-pill:hover {
    border-color: var(--ink);
    color: var(--ink);
  }

  .gen-pill--active {
    background: var(--ink);
    color: #ffffff;
    border-color: var(--ink);
  }

  .gen-pill--active:hover {
    background: var(--ink);
    color: #ffffff;
  }

  /* Grid */
  .memories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(18.5rem, 1fr));
    gap: 1.75rem;
  }

  .memory-card {
    display: flex;
    flex-direction: column;
    border-radius: 1.25rem;
    background: var(--surface);
    border: 1px solid var(--line-soft);
    overflow: hidden;
    box-shadow:
      0 8px 24px -8px rgba(18, 21, 20, 0.05),
      0 2px 6px -2px rgba(18, 21, 20, 0.02);
    transition:
      transform 220ms cubic-bezier(0.16, 1, 0.3, 1),
      border-color 220ms ease,
      box-shadow 220ms ease;
  }

  .memory-card:hover {
    transform: translateY(-4px);
    border-color: color-mix(in srgb, var(--accent) 35%, var(--line-soft));
    box-shadow:
      0 18px 36px -10px rgba(18, 21, 20, 0.09),
      0 4px 10px -2px rgba(18, 21, 20, 0.03);
  }

  /* Card Media Box */
  .card-media-box {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 10;
    background: var(--surface-muted);
    overflow: hidden;
    border: none;
    padding: 0;
    cursor: pointer;
  }

  .card-media-box--square {
    aspect-ratio: 1 / 1;
  }

  .card-media-box--portrait {
    aspect-ratio: 4 / 5;
  }

  .card-media {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 380ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .card-media--video {
    pointer-events: none;
  }

  .memory-card:hover .card-media {
    transform: scale(1.04);
  }

  .video-indicator {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.65);
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
  }

  .media-overlay-badge {
    position: absolute;
    top: 0.75rem;
    left: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .gen-tag {
    padding: 0.18rem 0.55rem;
    border-radius: 9999px;
    background: rgba(0, 0, 0, 0.72);
    color: #ffffff;
    font-size: 0.72rem;
    font-weight: 750;
    backdrop-filter: blur(4px);
  }

  .year-tag {
    padding: 0.18rem 0.55rem;
    border-radius: 9999px;
    background: var(--accent);
    color: #ffffff;
    font-size: 0.72rem;
    font-weight: 800;
  }

  /* Card Body */
  .card-body {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1.25rem;
    flex: 1;
  }

  .card-location {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.78rem;
    font-weight: 650;
    color: var(--accent);
  }

  .card-title {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 700;
    line-height: 1.35;
  }

  .card-title a {
    color: var(--ink);
    text-decoration: none;
  }

  .card-title a:hover {
    color: var(--accent);
  }

  .card-story {
    margin: 0;
    color: var(--ink-soft);
    font-size: 0.92rem;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    flex: 1;
  }

  /* Footer */
  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 0.85rem;
    border-top: 1px solid var(--line-soft);
    margin-top: 0.5rem;
  }

  .card-author {
    display: flex;
    align-items: center;
    gap: 0.45rem;
  }

  .author-avatar-small {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    overflow: hidden;
    background: var(--surface-muted);
    font-size: 0.65rem;
    font-weight: 800;
    color: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .author-avatar-small img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .author-name {
    font-size: 0.82rem;
    font-weight: 650;
    color: var(--ink-soft);
    text-decoration: none;
  }

  .author-name:hover {
    color: var(--ink);
  }

  .card-stats {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    text-decoration: none;
    color: var(--ink-soft);
  }

  .stat-item {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.78rem;
    font-weight: 700;
  }

  .stat-item:hover {
    color: var(--accent);
  }

  /* Empty State */
  .gallery-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 4rem 1.5rem;
    text-align: center;
    background: var(--surface-muted);
    border-radius: 1.5rem;
  }

  .empty-icon-wrapper {
    color: var(--accent);
  }

  .gallery-empty h3 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--ink);
  }

  .gallery-empty p {
    margin: 0;
    color: var(--ink-soft);
    font-size: 0.95rem;
    max-width: 42ch;
  }

  .btn-empty-upload {
    margin-top: 0.5rem;
    height: 40px;
    padding: 0 1.25rem;
    border-radius: 9999px;
    background: var(--accent);
    color: #ffffff;
    border: none;
    font-size: 0.88rem;
    font-weight: 700;
    cursor: pointer;
  }
</style>
