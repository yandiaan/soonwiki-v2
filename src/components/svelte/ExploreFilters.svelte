<script lang="ts">
  let {
    query = '',
    batch = '',
    field = '',
    place = '',
  }: { query?: string; batch?: string; field?: string; place?: string } = $props();
</script>

<form method="get" action="/explore" class="explore-filters">
  {#if field}
    <input type="hidden" name="field" value={field} />
  {/if}
  {#if place}
    <input type="hidden" name="place" value={place} />
  {/if}
  <label>
    <span>Cari</span>
    <input
      type="search"
      name="q"
      value={query}
      placeholder="Cari nama, tempat, atau hal yang ditekuni"
    />
  </label>
  <label>
    <span>Batch</span>
    <input type="number" name="batch" value={batch} min="2000" max="2100" />
  </label>
  <button type="submit">Terapkan</button>
</form>

<style>
  .explore-filters {
    display: flex;
    flex-wrap: wrap;
    align-items: end;
    gap: 1rem;
    padding-block: 1rem;
    border-block: 2px solid var(--ink);
  }

  label {
    display: grid;
    gap: 0.25rem;
    font-size: 0.8rem;
    font-weight: 700;
  }

  input {
    min-height: 44px;
    padding-inline: 0.75rem;
    border: 2px solid var(--ink);
    background: var(--paper);
    color: var(--ink);
  }

  input:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }

  button {
    min-height: 44px;
    padding-inline: 1.25rem;
    border: 2px solid var(--ink);
    background: var(--ink);
    color: var(--paper);
    font-weight: 700;
  }

  button:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }
</style>
