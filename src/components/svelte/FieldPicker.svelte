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
  let newFieldName = $state('');
  let adding = $state(false);

  function toggle(id: string) {
    selectedFieldIds = selectedFieldIds.includes(id)
      ? selectedFieldIds.filter((existing) => existing !== id)
      : [...selectedFieldIds, id];
  }

  async function addField() {
    const name = newFieldName.trim();

    if (!name) {
      return;
    }

    adding = true;
    const supabase = createBrowserSupabase();
    const id = await resolveOrCreateFieldId(supabase, name);
    adding = false;

    if (id) {
      if (!fields.some((field) => field.id === id)) {
        fields = [...fields, { id, name }];
      }

      toggle(id);
    }

    newFieldName = '';
  }
</script>

<div class="field-picker">
  <ul class="field-picker__list">
    {#each fields as field (field.id)}
      <li>
        <label>
          <input
            type="checkbox"
            checked={selectedFieldIds.includes(field.id)}
            onchange={() => toggle(field.id)}
          />
          <span>{field.name}</span>
        </label>
      </li>
    {/each}
  </ul>
  <div class="field-picker__add">
    <input type="text" placeholder="Tambah hal yang ditekuni baru" bind:value={newFieldName} />
    <button type="button" disabled={adding} onclick={addField}>Tambah</button>
  </div>
</div>

<style>
  .field-picker {
    display: grid;
    gap: 0.75rem;
  }

  .field-picker__list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .field-picker__list label {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    min-height: 44px;
    padding-inline: 0.75rem;
    border: 2px solid var(--ink);
  }

  .field-picker__add {
    display: flex;
    gap: 0.5rem;
  }

  .field-picker__add input {
    flex: 1;
    min-height: 44px;
    padding-inline: 0.75rem;
    border: 2px solid var(--ink);
    background: var(--paper);
    color: var(--ink);
  }

  .field-picker__add button {
    min-height: 44px;
    padding-inline: 1rem;
    border: 2px solid var(--ink);
    background: var(--ink);
    color: var(--paper);
    font-weight: 700;
  }
</style>
