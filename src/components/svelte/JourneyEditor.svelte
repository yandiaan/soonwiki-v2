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
    entries = [
      ...entries,
      {
        activity: '',
        placeName: '',
        startYear: '',
        endYear: '',
        story: '',
      },
    ];
  }

  function removeEntry(index: number) {
    entries = entries.filter((_, i) => i !== index);
  }

  function moveEntry(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= entries.length) return;

    const next = [...entries];
    const [item] = next.splice(index, 1);
    if (item) {
      next.splice(target, 0, item);
    }
    entries = next;
  }
</script>

<div class="journey-editor">
  {#if entries.length === 0}
    <div class="journey-empty">
      <div class="empty-icon">
        <svg
          viewBox="0 0 24 24"
          width="28"
          height="28"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>
      <div class="empty-text">
        <h4>Belum ada babak perjalanan</h4>
        <p>Catat jejak langkahmu: karir, studi, karya, kerelawanan, atau eksplorasi baru.</p>
      </div>
      <button type="button" class="btn-add-initial" onclick={addEntry}>
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
        <span>Tambah Babak Pertama</span>
      </button>
    </div>
  {/if}

  <div class="journey-list">
    {#each entries as entry, index (index)}
      <div class="journey-card">
        <div class="card-header">
          <div class="header-left">
            <span class="chapter-badge">Babak {index + 1}</span>
            {#if entry.activity}
              <span class="chapter-title">{entry.activity}</span>
            {/if}
          </div>

          <div class="header-actions">
            <button
              type="button"
              class="icon-action-btn"
              disabled={index === 0}
              onclick={() => moveEntry(index, -1)}
              title="Pindahkan ke atas"
              aria-label="Pindahkan ke atas"
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </button>
            <button
              type="button"
              class="icon-action-btn"
              disabled={index === entries.length - 1}
              onclick={() => moveEntry(index, 1)}
              title="Pindahkan ke bawah"
              aria-label="Pindahkan ke bawah"
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <button
              type="button"
              class="icon-action-btn icon-action-btn--delete"
              onclick={() => removeEntry(index)}
              title="Hapus babak ini"
              aria-label="Hapus babak"
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
          <div class="form-grid">
            <div class="field field--main">
              <label for={`activity-${index}`}
                >Peran, Karir, atau Kegiatan <span class="req">*</span></label
              >
              <input
                id={`activity-${index}`}
                type="text"
                bind:value={entry.activity}
                placeholder="Contoh: Product Designer, Founder, Relawan"
                required
              />
            </div>

            <div class="field">
              <label for={`place-${index}`}>Tempat / Organisasi / Lembaga (Opsional)</label>
              <input
                id={`place-${index}`}
                type="text"
                bind:value={entry.placeName}
                placeholder="Contoh: Tokopedia, Studio Kita, ITB"
              />
            </div>
          </div>

          <div class="years-row">
            <div class="field field--year">
              <label for={`startYear-${index}`}>Tahun Mulai</label>
              <input
                id={`startYear-${index}`}
                type="number"
                bind:value={entry.startYear}
                placeholder="2020"
                min="1900"
                max="2100"
              />
            </div>
            <div class="year-divider">→</div>
            <div class="field field--year">
              <label for={`endYear-${index}`}>Tahun Selesai</label>
              <input
                id={`endYear-${index}`}
                type="number"
                bind:value={entry.endYear}
                placeholder="Sekarang (kosongkan jika aktif)"
                min="1900"
                max="2100"
              />
            </div>
          </div>

          <div class="field">
            <label for={`story-${index}`}>Cerita & Pengalaman Berkesan (Opsional)</label>
            <textarea
              id={`story-${index}`}
              bind:value={entry.story}
              rows="3"
              placeholder="Ceritakan momen penting, pembelajaran, atau pencapaian menarik selama menjalani babak ini…"
            ></textarea>
          </div>
        </div>
      </div>
    {/each}
  </div>

  {#if entries.length > 0}
    <button type="button" class="btn-add-more" onclick={addEntry}>
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
      <span>Tambah Babak Perjalanan Baru</span>
    </button>
  {/if}
</div>

<style>
  .journey-editor {
    display: grid;
    gap: 1.25rem;
  }

  .journey-empty {
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

  .journey-list {
    display: grid;
    gap: 1.25rem;
  }

  .journey-card {
    border: 1px solid var(--line-soft);
    border-radius: 1rem;
    background: var(--surface);
    overflow: hidden;
    box-shadow: 0 2px 8px -2px rgba(18, 21, 20, 0.04);
    transition:
      border-color 200ms ease,
      box-shadow 200ms ease;
  }

  .journey-card:hover {
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

  .chapter-badge {
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

  .chapter-title {
    font-size: 0.88rem;
    font-weight: 700;
    color: var(--ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    flex-shrink: 0;
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

  .icon-action-btn:hover:not(:disabled) {
    background: var(--surface-muted);
    color: var(--ink);
    border-color: var(--ink);
  }

  .icon-action-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .icon-action-btn--delete:hover:not(:disabled) {
    background: #fdf0ed;
    color: var(--signal);
    border-color: var(--signal);
  }

  .card-body {
    padding: 1.25rem;
    display: grid;
    gap: 1rem;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  @media (min-width: 640px) {
    .form-grid {
      grid-template-columns: 1.2fr 1fr;
    }
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

  .years-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .field--year {
    flex: 1;
  }

  .year-divider {
    color: var(--ink-soft);
    font-weight: 700;
    margin-top: 1.25rem;
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
