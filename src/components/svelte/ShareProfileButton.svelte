<script lang="ts">
  let { title, name }: { title: string; name: string } = $props();

  let copied = $state(false);
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  async function handleShare() {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (!url) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title || `${name} — SoonWiki`,
          text: `Baca kisah perjalanan ${name} di SoonWiki.`,
          url,
        });
        return;
      } catch (err) {
        // Fallback to clipboard if share was cancelled or failed
        if ((err as Error).name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      copied = true;
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        copied = false;
      }, 2400);
    } catch {
      // Fallback
    }
  }
</script>

<button
  type="button"
  class="share-btn"
  class:share-btn--copied={copied}
  onclick={handleShare}
  aria-label={copied ? 'Tautan profil berhasil disalin' : 'Bagikan profil'}
  title="Bagikan atau salin tautan profil"
>
  {#if copied}
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
    <span>Tautan Tersalin!</span>
  {:else}
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
    <span>Bagikan</span>
  {/if}
</button>

<style>
  .share-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    min-height: 42px;
    padding: 0.5rem 1.15rem;
    border-radius: 9999px;
    background: var(--surface);
    border: 1px solid var(--line-soft);
    font-size: 0.88rem;
    font-weight: 650;
    color: var(--ink);
    cursor: pointer;
    transition:
      background-color 180ms cubic-bezier(0.16, 1, 0.3, 1),
      border-color 180ms cubic-bezier(0.16, 1, 0.3, 1),
      color 180ms cubic-bezier(0.16, 1, 0.3, 1),
      transform 180ms cubic-bezier(0.16, 1, 0.3, 1),
      box-shadow 180ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .share-btn:hover {
    background: var(--surface-muted);
    border-color: var(--ink);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(18, 21, 20, 0.06);
  }

  .share-btn:active {
    transform: translateY(0);
  }

  .share-btn:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }

  .share-btn--copied {
    background: var(--accent);
    color: #ffffff;
    border-color: var(--accent);
    box-shadow: 0 4px 14px color-mix(in srgb, var(--accent) 30%, transparent);
  }

  .share-btn--copied:hover {
    background: var(--accent);
    color: #ffffff;
    border-color: var(--accent);
  }
</style>
