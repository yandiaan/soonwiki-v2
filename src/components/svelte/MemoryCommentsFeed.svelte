<script lang="ts">
  import { getGenerationName } from '@/lib/shared/generations';
  import { paths, publicStorageUrl } from '@/lib/shared/paths';
  import type { MemoryComment } from '@/lib/shared/memory-models';

  let {
    memoryId,
    initialComments = [],
    canModerate = false,
  }: {
    memoryId: string;
    initialComments: MemoryComment[];
    canModerate?: boolean;
  } = $props();

  let comments = $state<MemoryComment[]>([...initialComments]);
  let newContent = $state('');
  let isSubmitting = $state(false);
  let errorMessage = $state('');
  let deletingId = $state<string | null>(null);

  function formatTimeAgo(dateString: string): string {
    const now = Date.now();
    const past = new Date(dateString).getTime();
    const diffSec = Math.floor((now - past) / 1000);

    if (diffSec < 60) return 'Baru saja';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m yang lalu`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}j yang lalu`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 30) return `${diffDay}h yang lalu`;

    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateString));
  }

  async function handleSubmitComment(e: SubmitEvent) {
    e.preventDefault();
    const content = newContent.trim();
    if (!content || isSubmitting) return;

    isSubmitting = true;
    errorMessage = '';

    try {
      const res = await fetch(`/api/memories/${memoryId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      const payload = (await res.json()) as {
        ok: boolean;
        data?: MemoryComment;
        message?: string;
      };

      if (!res.ok || !payload.ok || !payload.data) {
        errorMessage = payload.message || 'Gagal mengirim komentar. Pastikan kamu sudah masuk.';
        return;
      }

      comments = [...comments, payload.data];
      newContent = '';
    } catch {
      errorMessage = 'Terjadi kesalahan jaringan saat mengirim komentar.';
    } finally {
      isSubmitting = false;
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (deletingId) return;
    deletingId = commentId;

    try {
      const res = await fetch(`/api/memories/${memoryId}/comments?commentId=${commentId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        comments = comments.filter((c) => c.id !== commentId);
      }
    } catch {
      // Ignore
    } finally {
      deletingId = null;
    }
  }
</script>

<section class="comments-section" aria-labelledby="comments-title">
  <div class="comments-header">
    <div class="comments-badge">
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path
          d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
        />
      </svg>
      <span>Cerita Bersama ({comments.length})</span>
    </div>
    <h3 id="comments-title">Tinggalkan Jejak & Komentar</h3>
  </div>

  <!-- Form Tulis Komentar -->
  <form class="comment-form" onsubmit={handleSubmitComment}>
    <textarea
      bind:value={newContent}
      placeholder="Bagikan kenanganmu tentang momen ini..."
      rows="3"
      maxlength="1000"
      required
      aria-label="Tulis komentar kenangan"></textarea>

    {#if errorMessage}
      <p class="comment-form__error" role="alert">{errorMessage}</p>
    {/if}

    <div class="comment-form__footer">
      <span class="char-count">{newContent.length}/1000</span>
      <button type="submit" class="submit-btn" disabled={isSubmitting || !newContent.trim()}>
        {#if isSubmitting}
          <span>Mengirim...</span>
        {:else}
          <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          <span>Kirim Komentar</span>
        {/if}
      </button>
    </div>
  </form>

  <!-- Feed Komentar -->
  {#if comments.length === 0}
    <div class="empty-comments">
      <svg
        viewBox="0 0 24 24"
        width="28"
        height="28"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      <p>Belum ada komentar untuk kenangan ini. Jadilah yang pertama bernostalgia!</p>
    </div>
  {:else}
    <ul class="comments-list">
      {#each comments as comment (comment.id)}
        {@const avatarUrl = comment.author.photoPath
          ? publicStorageUrl('profile-photos', comment.author.photoPath)
          : null}
        {@const initials = comment.author.name
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((p) => p[0]?.toUpperCase())
          .join('')}

        <li class="comment-item">
          <!-- Avatar -->
          <div class="comment-avatar">
            {#if avatarUrl}
              <img src={avatarUrl} alt={comment.author.name} />
            {:else}
              <span class="avatar-initials">{initials}</span>
            {/if}
          </div>

          <!-- Content -->
          <div class="comment-body">
            <div class="comment-header">
              <div class="comment-author-info">
                {#if comment.author.slug}
                  <a href={paths.profile(comment.author.slug)} class="comment-author-name">
                    {comment.author.name}
                  </a>
                {:else}
                  <strong class="comment-author-name">{comment.author.name}</strong>
                {/if}
                <span class="comment-gen">{getGenerationName(comment.author.generationKey)}</span>
                <span class="comment-time">{formatTimeAgo(comment.createdAt)}</span>
              </div>

              {#if canModerate}
                <button
                  type="button"
                  class="comment-delete-btn"
                  onclick={() => handleDeleteComment(comment.id)}
                  title="Hapus komentar"
                  aria-label="Hapus komentar"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path
                      d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                    />
                  </svg>
                </button>
              {/if}
            </div>

            <p class="comment-text">{comment.content}</p>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  .comments-section {
    display: grid;
    gap: 1.5rem;
    padding-top: 2rem;
    border-top: 1px solid var(--line-soft);
    margin-top: 1.5rem;
  }

  .comments-header {
    display: grid;
    gap: 0.35rem;
  }

  .comments-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
    font-weight: 800;
    color: var(--accent);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  h3 {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 700;
    letter-spacing: -0.025em;
    color: var(--ink);
  }

  /* Form */
  .comment-form {
    display: grid;
    gap: 0.75rem;
    background: var(--surface);
    border: 1px solid var(--line-soft);
    border-radius: 1rem;
    padding: 1rem;
    box-shadow: 0 4px 16px -4px rgba(18, 21, 20, 0.04);
  }

  .comment-form textarea {
    width: 100%;
    border: none;
    background: transparent;
    color: var(--ink);
    font-family: inherit;
    font-size: 0.95rem;
    line-height: 1.55;
    resize: vertical;
    outline: none;
    padding: 0;
  }

  .comment-form textarea::placeholder {
    color: var(--ink-soft);
  }

  .comment-form__error {
    margin: 0;
    font-size: 0.85rem;
    font-weight: 600;
    color: #c0392b;
  }

  .comment-form__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 0.6rem;
    border-top: 1px solid var(--line-soft);
  }

  .char-count {
    font-size: 0.75rem;
    color: var(--ink-soft);
  }

  .submit-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    height: 38px;
    padding: 0 1.15rem;
    border-radius: 9999px;
    background: var(--accent);
    color: #ffffff;
    border: none;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    transition:
      opacity 150ms ease,
      transform 150ms ease;
  }

  .submit-btn:hover:not(:disabled) {
    opacity: 0.92;
    transform: translateY(-1px);
  }

  .submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Empty Comments */
  .empty-comments {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    padding: 2.5rem 1rem;
    text-align: center;
    background: var(--surface-muted);
    border-radius: 1rem;
    color: var(--ink-soft);
    font-size: 0.92rem;
  }

  .empty-comments p {
    margin: 0;
    max-width: 36ch;
  }

  /* List */
  .comments-list {
    display: grid;
    gap: 1rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .comment-item {
    display: grid;
    grid-template-columns: 2.5rem 1fr;
    gap: 0.85rem;
    padding: 1rem;
    border-radius: 0.85rem;
    background: var(--surface);
    border: 1px solid var(--line-soft);
  }

  .comment-avatar {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    overflow: hidden;
    background: var(--surface-muted);
    border: 1.5px solid var(--accent);
    flex-shrink: 0;
  }

  .comment-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-initials {
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 800;
    color: var(--accent);
    background: var(--accent-soft);
  }

  .comment-body {
    display: grid;
    gap: 0.35rem;
  }

  .comment-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .comment-author-info {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.45rem;
  }

  .comment-author-name {
    font-size: 0.9rem;
    font-weight: 750;
    color: var(--ink);
    text-decoration: none;
  }

  .comment-author-name:hover {
    color: var(--accent);
  }

  .comment-gen {
    font-size: 0.72rem;
    font-weight: 750;
    padding: 0.1rem 0.45rem;
    border-radius: 9999px;
    background: var(--accent-soft);
    color: var(--accent);
  }

  .comment-time {
    font-size: 0.76rem;
    color: var(--ink-soft);
  }

  .comment-delete-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: none;
    background: transparent;
    color: var(--ink-soft);
    cursor: pointer;
    transition:
      color 150ms ease,
      background-color 150ms ease;
  }

  .comment-delete-btn:hover {
    background: #fee2e2;
    color: #b91c1c;
  }

  .comment-text {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.6;
    color: var(--ink);
    word-break: break-word;
  }
</style>
