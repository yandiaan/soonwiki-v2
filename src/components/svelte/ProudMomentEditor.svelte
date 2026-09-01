<script lang="ts">
  import MediaUploader from '@/components/svelte/MediaUploader.svelte';
  import { deleteProudMoment, upsertProudMoment } from '@/lib/server/member-repository';
  import { createBrowserSupabase } from '@/lib/supabase/browser';

  import type { OwnProudMoment } from '@/lib/server/member-repository';

  export interface DraftMoment {
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
    if (!item || !item.title.trim()) return;

    if (!profileId) {
      item.status = 'error';
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
      setTimeout(() => {
        if (item.status === 'saved') {
          item.status = 'idle';
          items = [...items];
        }
      }, 3000);
    } else {
      item.status = 'error';
    }

    items = [...items];
  }

  async function removeItem(index: number) {
    const item = items[index];
    if (!item) return;

    if (item.id) {
      const supabase = createBrowserSupabase();
      await deleteProudMoment(supabase, item.id);
    }

    items = items.filter((_, i) => i !== index);
  }
</script>

<div class="proud-moment-editor">
  {#if !profileId}
    <div class="notice-card">
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
      <div>
        <strong>Profil baru terdeteksi</strong>
        <p>
          Klik tombol <em>Simpan</em> di bagian bawah terlebih dahulu untuk mengaktifkan penyimpanan momen
          dan karya.
        </p>
      </div>
    </div>
  {/if}

  {#if items.length === 0}
    <div class="moments-empty">
      <div class="empty-icon">
        <svg
          viewBox="0 0 24 24"
          width="28"
          height="28"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
        >
          <polygon
            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
          />
        </svg>
      </div>
      <div class="empty-text">
        <h4>Belum ada karya atau momen kebanggaan</h4>
        <p>
          Tampilkan karya, proyek, penghargaan, pameran, publikasi, atau inisiatif yang bermakna
          bagi kamu.
        </p>
      </div>
      <button type="button" class="btn-add-initial" onclick={addItem}>
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span>Tambah Karya / Momen Baru</span>
      </button>
    </div>
  {/if}

  <div class="moments-list">
    {#each items as item, index (item.id ?? index)}
      <div class="moment-card">
        <div class="card-header">
          <div class="header-left">
            <span class="moment-badge">Karya #{index + 1}</span>
            {#if item.title}
              <span class="moment-title">{item.title}</span>
            {/if}
          </div>

          <div class="header-actions">
            <button
              type="button"
              class="icon-action-btn icon-action-btn--delete"
              onclick={() => removeItem(index)}
              title="Hapus karya ini"
              aria-label="Hapus karya"
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="3 6 5 6 21 6" />
                <path
                  d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                />
              </svg>
            </button>
          </div>
        </div>

        <div class="card-body">
          <div class="field field--main">
            <label for={`title-${index}`}
              >Judul Karya, Proyek, atau Momen <span class="req">*</span></label
            >
            <input
              id={`title-${index}`}
              type="text"
              bind:value={item.title}
              placeholder="Contoh: Merilis Single Pertama, Membangun Aplikasi Desa Pintar"
              required
            />
          </div>

          <!-- Media Uploader for Moments -->
          <div class="media-section">
            <MediaUploader
              bucket="proud-moments"
              value={item.imagePath || null}
              label="Dokumentasi Visual / Foto Karya"
              hint="Foto lanskap atau cover proyek (maks. 5MB)"
              onUploaded={(path) => {
                item.imagePath = path;
                items = [...items];
                if (profileId && item.title.trim()) {
                  void saveItem(index);
                }
              }}
              onRemoved={() => {
                item.imagePath = '';
                items = [...items];
              }}
            />
          </div>

          <div class="field">
            <label for={`desc-${index}`}>Cerita di Balik Karya (Opsional)</label>
            <textarea
              id={`desc-${index}`}
              bind:value={item.description}
              rows="3"
              placeholder="Jelaskan proses, tantangan, atau makna karya ini bagi perjalananmu…"
            ></textarea>
          </div>

          <div class="meta-grid">
            <div class="field">
              <label for={`placeName-${index}`}>Tempat / Lembaga / Kota (Opsional)</label>
              <input
                id={`placeName-${index}`}
                type="text"
                bind:value={item.placeName}
                placeholder="Contoh: Jakarta Art Center"
              />
            </div>
            <div class="field field--year">
              <label for={`momentYear-${index}`}>Tahun (Opsional)</label>
              <input
                id={`momentYear-${index}`}
                type="number"
                bind:value={item.year}
                placeholder="2023"
                min="1900"
                max="2100"
              />
            </div>
          </div>

          <div class="field">
            <label for={`url-${index}`}>Tautan Karya / Berita Terkait (Opsional)</label>
            <input
              id={`url-${index}`}
              type="url"
              bind:value={item.externalUrl}
              placeholder="https://behance.net/karya-saya atau https://github.com/..."
            />
          </div>

          <div class="card-footer">
            {#if profileId}
              <button
                type="button"
                class="btn-save-item"
                disabled={item.status === 'saving' || !item.title.trim()}
                onclick={() => saveItem(index)}
              >
                {#if item.status === 'saving'}
                  <span>Menyimpan…</span>
                {:else if item.status === 'saved'}
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Tersimpan</span>
                {:else}
                  <span>Simpan Karya Ini</span>
                {/if}
              </button>
            {/if}

            {#if item.status === 'error'}
              <span class="status-error" role="alert"
                >Gagal menyimpan karya. Pastikan judul terisi.</span
              >
            {/if}
          </div>
        </div>
      </div>
    {/each}
  </div>

  {#if items.length > 0}
    <button type="button" class="btn-add-more" onclick={addItem}>
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      <span>Tambah Karya / Momen Kebanggaan Lain</span>
    </button>
  {/if}
</div>

<style>
  .proud-moment-editor {
    display: grid;
    gap: 1.25rem;
  }

  .notice-card {
    display: flex;
    align-items: flex-start;
    gap: 0.85rem;
    padding: 1rem 1.25rem;
    border-radius: 0.85rem;
    background: var(--accent-soft);
    border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
    color: var(--ink);
  }

  .notice-card svg {
    color: var(--accent);
    flex-shrink: 0;
    margin-top: 0.15rem;
  }

  .notice-card strong {
    display: block;
    font-size: 0.9rem;
    margin-bottom: 0.2rem;
  }

  .notice-card p {
    margin: 0;
    font-size: 0.82rem;
    color: var(--ink-soft);
    line-height: 1.45;
  }

  .moments-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 3rem 1.5rem;
    border: 1.5px dashed var(--line-soft);
    border-radius: 1rem;
    background: var(--surface);
    gap: 1rem;
  }

  .empty-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--accent-soft);
    color: var(--accent);
  }

  .empty-text h4 {
    margin: 0 0 0.25rem;
    font-size: 1.05rem;
    font-weight: 750;
    color: var(--ink);
  }

  .empty-text p {
    margin: 0;
    font-size: 0.88rem;
    color: var(--ink-soft);
    max-width: 24rem;
    line-height: 1.45;
  }

  .btn-add-initial {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.4rem;
    border-radius: 0.75rem;
    border: none;
    background: var(--accent);
    color: var(--surface);
    font-size: 0.92rem;
    font-weight: 700;
    cursor: pointer;
    transition:
      transform 150ms var(--ease-out),
      background-color 150ms ease;
  }

  .btn-add-initial:hover {
    transform: translateY(-2px);
    background: var(--accent-strong);
  }

  .moments-list {
    display: grid;
    gap: 1.25rem;
  }

  .moment-card {
    border: 1px solid var(--line-soft);
    border-radius: 1rem;
    background: var(--surface);
    overflow: hidden;
    box-shadow: 0 2px 8px -2px rgba(18, 21, 20, 0.04);
    transition:
      border-color 200ms ease,
      box-shadow 200ms ease;
  }

  .moment-card:hover {
    border-color: color-mix(in srgb, var(--accent) 35%, var(--line-soft));
    box-shadow: 0 6px 16px -4px rgba(18, 21, 20, 0.08);
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.85rem 1.25rem;
    background: var(--canvas);
    border-bottom: 1px solid var(--line-soft);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    min-width: 0;
  }

  .moment-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.65rem;
    border-radius: 9999px;
    background: var(--accent-soft);
    color: var(--accent);
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    flex-shrink: 0;
  }

  .moment-title {
    font-size: 0.88rem;
    font-weight: 700;
    color: var(--ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .icon-action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 0.45rem;
    border: 1px solid var(--line-soft);
    background: var(--surface);
    color: var(--ink-soft);
    cursor: pointer;
    transition:
      background-color 150ms ease,
      color 150ms ease,
      border-color 150ms ease;
  }

  .icon-action-btn--delete:hover {
    background: #fdf0ed;
    color: var(--signal);
    border-color: var(--signal);
  }

  .card-body {
    padding: 1.25rem;
    display: grid;
    gap: 1.1rem;
  }

  .field {
    display: grid;
    gap: 0.4rem;
  }

  .field label {
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--ink-soft);
    letter-spacing: -0.01em;
  }

  .req {
    color: var(--signal);
  }

  .field input,
  .field textarea {
    min-height: 44px;
    padding: 0.65rem 0.85rem;
    border: 1px solid var(--line-soft);
    border-radius: 0.6rem;
    background: var(--surface);
    color: var(--ink);
    font: inherit;
    font-size: 0.92rem;
    transition:
      border-color 180ms ease,
      box-shadow 180ms ease;
  }

  .field input:focus,
  .field textarea:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent);
  }

  .field textarea {
    min-height: 5.5rem;
    line-height: 1.5;
    resize: vertical;
  }

  .meta-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  @media (min-width: 640px) {
    .meta-grid {
      grid-template-columns: 1.4fr 1fr;
    }
  }

  .card-footer {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding-top: 0.5rem;
  }

  .btn-save-item {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.55rem 1.15rem;
    border-radius: 0.55rem;
    border: 1px solid var(--accent);
    background: var(--accent);
    color: var(--surface);
    font-size: 0.86rem;
    font-weight: 700;
    cursor: pointer;
    transition:
      background-color 150ms ease,
      transform 150ms var(--ease-out);
  }

  .btn-save-item:hover:not(:disabled) {
    background: var(--accent-strong);
    transform: translateY(-1px);
  }

  .btn-save-item:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .status-error {
    font-size: 0.8rem;
    color: var(--signal);
    font-weight: 600;
  }

  .btn-add-more {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    width: 100%;
    min-height: 48px;
    border: 1.5px dashed var(--line-soft);
    border-radius: 0.85rem;
    background: var(--surface);
    color: var(--accent);
    font-size: 0.9rem;
    font-weight: 750;
    cursor: pointer;
    transition:
      background-color 150ms ease,
      border-color 150ms ease,
      transform 150ms var(--ease-out);
  }

  .btn-add-more:hover {
    background: var(--accent-soft);
    border-color: var(--accent);
    transform: translateY(-1px);
  }
</style>
