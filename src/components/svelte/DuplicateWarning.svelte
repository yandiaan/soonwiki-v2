<script lang="ts">
  import { getGenerationName } from '@/lib/shared/generations';
  import type { DuplicateCandidate } from '@/lib/server/member-repository';

  let {
    candidates,
    onConfirm,
    onDismiss,
  }: {
    candidates: DuplicateCandidate[];
    onConfirm: () => void;
    onDismiss: () => void;
  } = $props();
</script>

{#if candidates.length > 0}
  <div class="duplicate-warning" role="alertdialog" aria-labelledby="duplicate-warning-title">
    <p id="duplicate-warning-title">
      Ada {candidates.length} profil dengan nama dan generasi mirip. Apakah salah satunya kamu?
    </p>
    <ul>
      {#each candidates as candidate (candidate.id)}
        <li>{candidate.name} · {getGenerationName(candidate.generationKey)}</li>
      {/each}
    </ul>
    <div class="duplicate-warning__actions">
      <button type="button" onclick={onDismiss}>Kembali periksa data</button>
      <button type="button" onclick={onConfirm}>Bukan saya, lanjutkan</button>
    </div>
  </div>
{/if}

<style>
  .duplicate-warning {
    display: grid;
    gap: 0.75rem;
    padding: 1rem;
    border: 2px solid var(--signal);
    background: var(--paper);
  }

  .duplicate-warning ul {
    margin: 0;
    padding-left: 1.25rem;
  }

  .duplicate-warning__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .duplicate-warning__actions button {
    min-height: 44px;
    padding-inline: 0.85rem;
    border: 2px solid var(--ink);
    background: var(--paper);
    font-weight: 700;
  }
</style>
