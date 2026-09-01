<script lang="ts">
  import { SOON_GENERATIONS } from '@/lib/shared/generations';
  import { paths } from '@/lib/shared/paths';

  let {
    query = '',
    batch = '',
    field = '',
    place = '',
  }: { query?: string; batch?: string; field?: string; place?: string } = $props();

  const hasFilters = $derived(Boolean(query || batch || field || place));
</script>

<form method="get" action="/explore" class="explore-filters">
  {#if field}
    <input type="hidden" name="field" value={field} />
  {/if}
  {#if place}
    <input type="hidden" name="place" value={place} />
  {/if}

  <div class="explore-filters__inputs">
    <div class="explore-filters__field explore-filters__search">
      <label for="filter-query">Pencarian</label>
      <input
        id="filter-query"
        type="search"
        name="q"
        value={query}
        placeholder="Cari nama, bidang, atau tempat…"
      />
    </div>
    <div class="explore-filters__field explore-filters__batch">
      <label for="filter-batch">Generasi SOON</label>
      <select id="filter-batch" name="batch">
        <option value="">Semua Generasi</option>
        {#each SOON_GENERATIONS as gen (gen.key)}
          <option value={gen.key} selected={batch === gen.key}>
            {gen.name}
          </option>
        {/each}
      </select>
    </div>
    <div class="explore-filters__actions">
      <button type="submit" class="explore-filters__submit">Terapkan</button>
      {#if hasFilters}
        <a href={paths.explore()} class="explore-filters__reset">Reset filter</a>
      {/if}
    </div>
  </div>
</form>

<style>
  .explore-filters {
    padding: 1.25rem;
    border-radius: 0.75rem;
    background: var(--surface);
    border: 1px solid var(--line-soft);
  }

  .explore-filters__inputs {
    display: grid;
    grid-template-columns: 1fr auto auto;
    align-items: end;
    gap: 1rem;
  }

  .explore-filters__field {
    display: grid;
    gap: 0.35rem;
  }

  label {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--ink-soft);
  }

  input,
  select {
    min-height: 44px;
    padding-inline: 0.85rem;
    border: 1px solid var(--line-soft);
    border-radius: 0.5rem;
    background: var(--canvas);
    color: var(--ink);
    font: inherit;
    font-size: 0.95rem;
  }

  input:focus-visible,
  select:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }

  .explore-filters__batch select {
    width: 12rem;
    cursor: pointer;
  }

  .explore-filters__actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .explore-filters__submit {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding-inline: 1.25rem;
    border: 0;
    border-radius: 0.5rem;
    background: var(--accent);
    color: var(--surface);
    font: inherit;
    font-size: 0.95rem;
    font-weight: 750;
    cursor: pointer;
    transition: background-color 180ms var(--ease-out);
  }

  .explore-filters__submit:hover {
    background: var(--accent-strong);
  }

  .explore-filters__submit:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }

  .explore-filters__reset {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    padding-inline: 0.75rem;
    color: var(--ink-soft);
    font-size: 0.85rem;
    font-weight: 600;
    text-decoration: none;
  }

  .explore-filters__reset:hover {
    color: var(--ink);
    text-decoration: underline;
  }

  @media (max-width: 768px) {
    .explore-filters__inputs {
      grid-template-columns: 1fr;
    }

    .explore-filters__batch input {
      width: 100%;
    }

    .explore-filters__actions {
      flex-direction: column;
      align-items: stretch;
    }
  }
</style>
