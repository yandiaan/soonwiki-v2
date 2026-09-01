<script lang="ts">
  import {
    REACTION_CONFIG,
    type MemoryReactionSummary,
    type ReactionType,
  } from '@/lib/shared/memory-models';

  let {
    memoryId,
    initialReactions,
  }: {
    memoryId: string;
    initialReactions: MemoryReactionSummary;
  } = $props();

  let counts = $state<Record<ReactionType, number>>({ ...initialReactions.counts });
  let userReactions = $state<ReactionType[]>([...initialReactions.userReactions]);
  let isSubmitting = $state(false);

  const reactionList: ReactionType[] = ['heart', 'nostalgic', 'sparkle', 'proud'];

  async function handleToggle(type: ReactionType) {
    if (isSubmitting) return;

    const hasReacted = userReactions.includes(type);

    // Optimistic UI update
    if (hasReacted) {
      userReactions = userReactions.filter((r) => r !== type);
      counts[type] = Math.max(0, (counts[type] ?? 1) - 1);
    } else {
      userReactions = [...userReactions, type];
      counts[type] = (counts[type] ?? 0) + 1;
    }

    isSubmitting = true;

    try {
      const res = await fetch(`/api/memories/${memoryId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reactionType: type }),
      });

      if (!res.ok) {
        // Rollback
        if (hasReacted) {
          userReactions = [...userReactions, type];
          counts[type] = (counts[type] ?? 0) + 1;
        } else {
          userReactions = userReactions.filter((r) => r !== type);
          counts[type] = Math.max(0, (counts[type] ?? 1) - 1);
        }
        return;
      }

      const payload = (await res.json()) as {
        ok: boolean;
        data?: {
          counts: Record<ReactionType, number>;
          userReactions: ReactionType[];
        };
      };

      if (payload.ok && payload.data) {
        counts = { ...payload.data.counts };
        userReactions = [...payload.data.userReactions];
      }
    } catch {
      // Rollback on network error
      if (hasReacted) {
        userReactions = [...userReactions, type];
        counts[type] = (counts[type] ?? 0) + 1;
      } else {
        userReactions = userReactions.filter((r) => r !== type);
        counts[type] = Math.max(0, (counts[type] ?? 1) - 1);
      }
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="reactions-bar" aria-label="Reaksi apresiasi kenangan">
  <span class="reactions-bar__label">Apresiasi:</span>

  <div class="reactions-list">
    {#each reactionList as type (type)}
      {@const meta = REACTION_CONFIG[type]}
      {@const isActive = userReactions.includes(type)}
      {@const count = counts[type] ?? 0}

      <button
        type="button"
        class="reaction-btn"
        class:reaction-btn--active={isActive}
        onclick={() => handleToggle(type)}
        aria-pressed={isActive}
        title={`${meta.label}: ${meta.description}`}
      >
        <!-- Clean SVG Icons for each reaction (Zero emoji rule) -->
        {#if type === 'heart'}
          <svg
            class="reaction-icon"
            viewBox="0 0 24 24"
            width="17"
            height="17"
            fill={isActive ? 'currentColor' : 'none'}
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            />
          </svg>
        {:else if type === 'nostalgic'}
          <svg
            class="reaction-icon"
            viewBox="0 0 24 24"
            width="17"
            height="17"
            fill={isActive ? 'currentColor' : 'none'}
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        {:else if type === 'sparkle'}
          <svg
            class="reaction-icon"
            viewBox="0 0 24 24"
            width="17"
            height="17"
            fill={isActive ? 'currentColor' : 'none'}
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path
              d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
            />
          </svg>
        {:else if type === 'proud'}
          <svg
            class="reaction-icon"
            viewBox="0 0 24 24"
            width="17"
            height="17"
            fill={isActive ? 'currentColor' : 'none'}
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polygon
              points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
            />
          </svg>
        {/if}

        <span class="reaction-label">{meta.label}</span>

        {#if count > 0}
          <span class="reaction-count">{count}</span>
        {/if}
      </button>
    {/each}
  </div>
</div>

<style>
  .reactions-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
    padding-block: 0.5rem;
  }

  .reactions-bar__label {
    font-size: 0.8rem;
    font-weight: 750;
    color: var(--ink-soft);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .reactions-list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  .reaction-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.8rem;
    border-radius: 9999px;
    background: var(--surface);
    border: 1px solid var(--line-soft);
    color: var(--ink-soft);
    font-size: 0.82rem;
    font-weight: 650;
    cursor: pointer;
    transition:
      background-color 160ms ease,
      border-color 160ms ease,
      color 160ms ease,
      transform 160ms cubic-bezier(0.16, 1, 0.3, 1),
      box-shadow 160ms ease;
  }

  .reaction-btn:hover {
    background: var(--surface-muted);
    border-color: var(--ink);
    color: var(--ink);
    transform: translateY(-1px);
  }

  .reaction-btn:active {
    transform: scale(0.96);
  }

  .reaction-btn--active {
    background: var(--accent-soft);
    border-color: var(--accent);
    color: var(--accent);
    font-weight: 750;
  }

  .reaction-btn--active:hover {
    background: var(--accent-soft);
    border-color: var(--accent);
    color: var(--accent);
  }

  .reaction-icon {
    flex-shrink: 0;
    transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .reaction-btn:hover .reaction-icon {
    transform: scale(1.15);
  }

  .reaction-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding-inline: 4px;
    border-radius: 9999px;
    background: color-mix(in srgb, var(--ink) 8%, transparent);
    font-size: 0.72rem;
    font-weight: 800;
  }

  .reaction-btn--active .reaction-count {
    background: color-mix(in srgb, var(--accent) 20%, transparent);
    color: var(--accent);
  }
</style>
