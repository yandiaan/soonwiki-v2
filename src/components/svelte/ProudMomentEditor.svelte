<script lang="ts">
  import MediaUploader from '@/components/svelte/MediaUploader.svelte';
  import { deleteProudMoment, upsertProudMoment } from '@/lib/server/member-repository';
  import { createBrowserSupabase } from '@/lib/supabase/browser';

  import type { OwnProudMoment } from '@/lib/server/member-repository';

  interface DraftMoment {
    id?: string;
    title: string;
    description: string;
    placeName: string;
    year: string;
    imagePath: string;
    externalUrl: string;
    status: 'idle' | 'saving' | 'saved' | 'error';
  }

  let { profileId, moments }: { profileId: string | null; moments: OwnProudMoment[] } = $props();

  let items = $state<DraftMoment[]>(
    moments.map((moment) => ({
      id: moment.id,
      title: moment.title,
      description: moment.description ?? '',
      placeName: moment.placeName ?? '',
      year: moment.year ? String(moment.year) : '',
      imagePath: moment.imagePath ?? '',
      externalUrl: moment.externalUrl ?? '',
      status: 'idle' as const,
    })),
  );

  function addItem() {
    items = [
      ...items,
      {
        title: '',
        description: '',
        placeName: '',
        year: '',
        imagePath: '',
        externalUrl: '',
        status: 'idle',
      },
    ];
  }

  async function saveItem(index: number) {
    const item = items[index];

    if (!profileId || !item) {
      return;
    }

    item.status = 'saving';
    items = [...items];

    const supabase = createBrowserSupabase();
    const result = await upsertProudMoment(
      supabase,
      profileId,
      {
        title: item.title,
        description: item.description || undefined,
        placeName: item.placeName || undefined,
        year: item.year ? Number.parseInt(item.year, 10) : undefined,
        imagePath: item.imagePath || undefined,
        externalUrl: item.externalUrl || undefined,
      },
      item.id,
    );

    if (result.ok) {
      item.id = result.data.id;
      item.status = 'saved';
    } else {
      item.status = 'error';
    }

    items = [...items];
  }

  async function removeItem(index: number) {
    const item = items[index];

    if (!item) {
      return;
    }

    if (item.id) {
      const supabase = createBrowserSupabase();
      await deleteProudMoment(supabase, item.id);
    }

    items = items.filter((_, i) => i !== index);
  }
</script>

<div class="proud-moment-editor">
  {#if !profileId}
    <p role="note">Simpan profil dulu sebelum menambahkan hal yang dibanggakan.</p>
  {/if}
  {#each items as item, index (item.id ?? index)}
    <fieldset class="proud-moment-editor__item">
      <legend>Hal yang dibanggakan {index + 1}</legend>
      <label>
        <span>Judul</span>
        <input type="text" bind:value={item.title} />
      </label>
      <label>
        <span>Ceritanya (opsional)</span>
        <textarea bind:value={item.description} rows="3"></textarea>
      </label>
      <label>
        <span>Tempat (opsional)</span>
        <input type="text" bind:value={item.placeName} />
      </label>
      <label>
        <span>Tahun (opsional)</span>
        <input type="number" bind:value={item.year} min="1900" max="2100" />
      </label>
      <label>
        <span>Tautan (opsional)</span>
        <input type="url" bind:value={item.externalUrl} placeholder="https://" />
      </label>
      {#if profileId}
        <MediaUploader
          bucket="proud-moments"
          value={item.imagePath || null}
          onUploaded={(path) => {
            item.imagePath = path;
            items = [...items];
          }}
        />
      {/if}
      <div class="proud-moment-editor__actions">
        <button
          type="button"
          disabled={!profileId || item.status === 'saving'}
          onclick={() => saveItem(index)}
        >
          Simpan
        </button>
        <button type="button" onclick={() => removeItem(index)}>Hapus</button>
        {#if item.status === 'saved'}
          <span role="status">Tersimpan</span>
        {/if}
        {#if item.status === 'error'}
          <span role="alert">Gagal menyimpan</span>
        {/if}
      </div>
    </fieldset>
  {/each}
  <button type="button" onclick={addItem}>+ Tambah hal yang dibanggakan</button>
</div>

<style>
  .proud-moment-editor {
    display: grid;
    gap: 1rem;
  }

  .proud-moment-editor__item {
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

  .proud-moment-editor__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  .proud-moment-editor__actions button {
    min-height: 44px;
    padding-inline: 0.85rem;
    border: 2px solid var(--ink);
    background: var(--paper);
    font-weight: 700;
  }

  [role='alert'] {
    color: var(--signal);
    font-size: 0.8rem;
  }
</style>
