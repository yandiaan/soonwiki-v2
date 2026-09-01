<script lang="ts">
  import { resolveOrCreateFieldId } from '@/lib/server/member-repository';
  import { createBrowserSupabase } from '@/lib/supabase/browser';

  let {
    availableFields,
    selectedFieldIds = $bindable(),
  }: {
    availableFields: { id: string; name: string }[];
    selectedFieldIds: string[];
  } = $props();

  let fields = $state(availableFields);
  let searchQuery = $state('');
  let newFieldName = $state('');
  let isAdding = $state(false);

  let filteredFields = $derived.by(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return fields;
    return fields.filter((f) => f.name.toLowerCase().includes(q));
  });

  function toggle(id: string) {
    selectedFieldIds = selectedFieldIds.includes(id)
      ? selectedFieldIds.filter((existing) => existing !== id)
      : [...selectedFieldIds, id];
  }

  async function addField() {
    const name = newFieldName.trim();
    if (!name) return;

    // Check if already exists in available list
    const existing = fields.find((f) => f.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      if (!selectedFieldIds.includes(existing.id)) {
        toggle(existing.id);
      }
      newFieldName = '';
      return;
    }

    isAdding = true;
    const supabase = createBrowserSupabase();
    const id = await resolveOrCreateFieldId(supabase, name);
    isAdding = false;

    if (id) {
      if (!fields.some((field) => field.id === id)) {
        fields = [...fields, { id, name }];
      }
      toggle(id);
    }

    newFieldName = '';
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      void addField();
    }
  }
</script>

<div class="field-picker">
  <!-- Search & Add Bar -->
  <div class="search-add-bar">
    <div class="search-field">
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="search"
        placeholder="Cari atau filter bidang…"
        bind:value={searchQuery}
        class="search-input"
      />
    </div>

    <div class="add-field">
      <input
        type="text"
        placeholder="Tambah bidang baru…"
        bind:value={newFieldName}
        onkeydown={handleKeydown}
        class="add-input"
      />
      <button
        type="button"
        disabled={isAdding || !newFieldName.trim()}
        onclick={addField}
        class="add-btn"
      >
        {isAdding ? '…' : '+ Tambah'}
      </button>
    </div>
  </div>

  <!-- Chip Selector Cloud -->
  <div class="chips-container" role="group" aria-label="Daftar bidang yang ditekuni">
    {#each filteredFields as field (field.id)}
      {@const isSelected = selectedFieldIds.includes(field.id)}
      <button
        type="button"
        class="field-chip"
        class:is-selected={isSelected}
        onclick={() => toggle(field.id)}
        aria-pressed={isSelected}
      >
        {#if isSelected}
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        {/if}
        <span>{field.name}</span>
      </button>
    {/each}
  </div>

  {#if selectedFieldIds.length === 0}
    <p class="helper-hint">
      Pilih minimal 1–3 bidang yang paling menggambarkan fokus atau minatmu.
    </p>
  {:else}
    <p class="helper-hint">{selectedFieldIds.length} bidang terpilih.</p>
  {/if}
</div>

<style>
  .field-picker {
    display: grid;
    gap: 1rem;
  }

  .search-add-bar {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  @media (min-width: 640px) {
    .search-add-bar {
      grid-template-columns: 1fr 1fr;
    }
  }

  .search-field {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-field svg {
    position: absolute;
    left: 0.85rem;
    color: var(--ink-soft);
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    min-height: 42px;
    padding-inline-start: 2.3rem;
    padding-inline-end: 0.85rem;
    border: 1px solid var(--line-soft);
    border-radius: 0.6rem;
    background: var(--surface);
    color: var(--ink);
    font: inherit;
    font-size: 0.88rem;
    transition:
      border-color 150ms ease,
      box-shadow 150ms ease;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent);
  }

  .add-field {
    display: flex;
    gap: 0.4rem;
  }

  .add-input {
    flex: 1;
    min-height: 42px;
    padding-inline: 0.85rem;
    border: 1px solid var(--line-soft);
    border-radius: 0.6rem;
    background: var(--surface);
    color: var(--ink);
    font: inherit;
    font-size: 0.88rem;
    transition:
      border-color 150ms ease,
      box-shadow 150ms ease;
  }

  .add-input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent);
  }

  .add-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding-inline: 1rem;
    min-height: 42px;
    border-radius: 0.6rem;
    border: 1px solid var(--accent);
    background: var(--accent);
    color: var(--surface);
    font-size: 0.85rem;
    font-weight: 750;
    cursor: pointer;
    white-space: nowrap;
    transition:
      background-color 150ms ease,
      transform 150ms var(--ease-out);
  }

  .add-btn:hover:not(:disabled) {
    background: var(--accent-strong);
    transform: translateY(-1px);
  }

  .add-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .chips-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    max-height: 220px;
    overflow-y: auto;
    padding: 0.25rem;
    scrollbar-width: thin;
  }

  .field-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.45rem 0.9rem;
    border-radius: 9999px;
    border: 1px solid var(--line-soft);
    background: var(--surface);
    color: var(--ink);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition:
      background-color 150ms ease,
      color 150ms ease,
      border-color 150ms ease,
      transform 150ms var(--ease-out),
      box-shadow 150ms ease;
  }

  .field-chip:hover {
    border-color: color-mix(in srgb, var(--accent) 40%, var(--line-soft));
    background: color-mix(in srgb, var(--accent-soft) 40%, var(--surface));
    transform: translateY(-1px);
  }

  .field-chip.is-selected {
    background: var(--accent);
    color: var(--surface);
    border-color: var(--accent);
    box-shadow: 0 2px 8px -1px color-mix(in srgb, var(--accent) 40%, transparent);
  }

  .field-chip.is-selected:hover {
    background: var(--accent-strong);
  }

  .helper-hint {
    margin: 0;
    font-size: 0.8rem;
    color: var(--ink-soft);
  }
</style>
