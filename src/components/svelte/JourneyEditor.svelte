<script lang="ts">
  export interface JourneyEntryDraft {
    activity: string;
    placeName: string;
    startYear: string;
    endYear: string;
    story: string;
  }

  let { entries = $bindable() }: { entries: JourneyEntryDraft[] } = $props();

  function addEntry() {
    entries = [...entries, { activity: '', placeName: '', startYear: '', endYear: '', story: '' }];
  }

  function removeEntry(index: number) {
    entries = entries.filter((_, i) => i !== index);
  }

  function moveEntry(index: number, direction: -1 | 1) {
    const target = index + direction;

    if (target < 0 || target >= entries.length) {
      return;
    }

    const next = [...entries];
    const [item] = next.splice(index, 1);

    if (item) {
      next.splice(target, 0, item);
    }

    entries = next;
  }
</script>

<div class="journey-editor">
  {#each entries as entry, index (index)}
    <fieldset class="journey-editor__item">
      <legend>Perjalanan {index + 1}</legend>
      <label>
        <span>Peran atau kegiatan</span>
        <input type="text" bind:value={entry.activity} placeholder="Mis. Relawan komunitas lokal" />
      </label>
      <label>
        <span>Tempat, organisasi, atau usaha (opsional)</span>
        <input type="text" bind:value={entry.placeName} />
      </label>
      <div class="journey-editor__years">
        <label>
          <span>Mulai</span>
          <input type="number" bind:value={entry.startYear} min="1900" max="2100" />
        </label>
        <label>
          <span>Selesai</span>
          <input type="number" bind:value={entry.endYear} min="1900" max="2100" />
        </label>
      </div>
      <label>
        <span>Ceritanya (opsional)</span>
        <textarea bind:value={entry.story} rows="3"></textarea>
      </label>
      <div class="journey-editor__actions">
        <button type="button" disabled={index === 0} onclick={() => moveEntry(index, -1)}
          >Naik</button
        >
        <button
          type="button"
          disabled={index === entries.length - 1}
          onclick={() => moveEntry(index, 1)}
        >
          Turun
        </button>
        <button type="button" onclick={() => removeEntry(index)}>Hapus</button>
      </div>
    </fieldset>
  {/each}
  <button type="button" onclick={addEntry}>+ Tambah perjalanan</button>
</div>

<style>
  .journey-editor {
    display: grid;
    gap: 1rem;
  }

  .journey-editor__item {
    display: grid;
    gap: 0.6rem;
    padding: 1rem;
    border: 2px solid var(--ink);
  }

  legend {
    padding-inline: 0.4rem;
    font-weight: 800;
    letter-spacing: 0.04em;
  }

  label {
    display: grid;
    gap: 0.25rem;
    font-size: 0.85rem;
    font-weight: 700;
  }

  input,
  textarea {
    min-height: 44px;
    padding-inline: 0.75rem;
    border: 2px solid var(--ink);
    background: var(--paper);
    color: var(--ink);
    font: inherit;
  }

  textarea {
    min-height: unset;
    padding-block: 0.5rem;
  }

  .journey-editor__years {
    display: flex;
    gap: 0.75rem;
  }

  .journey-editor__years label {
    flex: 1;
  }

  .journey-editor__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .journey-editor__actions button {
    min-height: 44px;
    padding-inline: 0.85rem;
    border: 2px solid var(--ink);
    background: var(--paper);
    font-weight: 700;
  }
</style>
