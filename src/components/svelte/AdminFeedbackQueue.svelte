<script lang="ts">
  import { updateFeedbackStatus } from '@/lib/server/feedback-repository';
  import { createBrowserSupabase } from '@/lib/supabase/browser';
  import type {
    AppFeedbackRow,
    FeedbackCategory,
    FeedbackStatus,
  } from '@/lib/server/feedback-repository';

  let {
    feedbacks: initialFeedbacks,
    adminUserId,
  }: {
    feedbacks: AppFeedbackRow[];
    adminUserId: string;
  } = $props();

  let feedbacks = $state<AppFeedbackRow[]>([...initialFeedbacks]);
  let filterCategory = $state<'all' | FeedbackCategory>('all');
  let filterStatus = $state<'all' | FeedbackStatus>('all');
  let editingNotesId = $state<string | null>(null);
  let noteText = $state('');
  let isSaving = $state(false);

  const filteredList = $derived.by(() => {
    return feedbacks.filter((item) => {
      const matchCat = filterCategory === 'all' || item.category === filterCategory;
      const matchStatus = filterStatus === 'all' || item.status === filterStatus;
      return matchCat && matchStatus;
    });
  });

  async function handleStatusChange(
    feedbackId: string,
    newStatus: FeedbackStatus,
    adminNotes?: string | null,
  ) {
    const supabase = createBrowserSupabase();
    const currentNotes =
      adminNotes !== undefined
        ? adminNotes
        : (feedbacks.find((f) => f.id === feedbackId)?.adminNotes ?? null);

    const res = await updateFeedbackStatus(
      supabase,
      feedbackId,
      newStatus,
      currentNotes,
      adminUserId,
    );

    if (res.ok) {
      feedbacks = feedbacks.map((item) =>
        item.id === feedbackId
          ? {
              ...item,
              status: newStatus,
              adminNotes: currentNotes,
              resolvedAt:
                newStatus === 'resolved' || newStatus === 'closed'
                  ? new Date().toISOString()
                  : null,
            }
          : item,
      );
    }
  }

  async function saveAdminNote(feedbackId: string) {
    const feedback = feedbacks.find((f) => f.id === feedbackId);
    if (!feedback) return;

    isSaving = true;
    const supabase = createBrowserSupabase();
    const res = await updateFeedbackStatus(
      supabase,
      feedbackId,
      feedback.status,
      noteText.trim() || null,
      adminUserId,
    );

    if (res.ok) {
      feedbacks = feedbacks.map((item) =>
        item.id === feedbackId ? { ...item, adminNotes: noteText.trim() || null } : item,
      );
      editingNotesId = null;
      noteText = '';
    }
    isSaving = false;
  }

  function startEditNotes(item: AppFeedbackRow) {
    editingNotesId = item.id;
    noteText = item.adminNotes || '';
  }

  function formatCategoryBadge(cat: FeedbackCategory): { label: string; class: string } {
    switch (cat) {
      case 'bug':
        return { label: 'Kendala / Bug', class: 'cat-bug' };
      case 'feature':
        return { label: 'Request Fitur', class: 'cat-feature' };
      default:
        return { label: 'Saran Umum', class: 'cat-general' };
    }
  }
</script>

<div class="admin-feedback-manager">
  <!-- Controls Bar -->
  <div class="admin-feedback__controls">
    <div class="filter-group">
      <span class="filter-label">Kategori:</span>
      <div class="filter-buttons">
        {#each [{ key: 'all', label: 'Semua' }, { key: 'bug', label: 'Bug' }, { key: 'feature', label: 'Fitur' }, { key: 'general', label: 'Saran' }] as tab (tab.key)}
          <button
            type="button"
            class="btn-filter"
            class:is-active={filterCategory === tab.key}
            onclick={() => (filterCategory = tab.key as 'all' | FeedbackCategory)}
          >
            {tab.label}
          </button>
        {/each}
      </div>
    </div>

    <div class="filter-group">
      <span class="filter-label">Status:</span>
      <select bind:value={filterStatus} class="select-status">
        <option value="all">Semua Status</option>
        <option value="open">Menunggu Peninjauan</option>
        <option value="in_progress">Sedang Dikerjakan</option>
        <option value="resolved">Terselesaikan</option>
        <option value="closed">Ditutup</option>
      </select>
    </div>
  </div>

  <!-- Feedbacks List -->
  {#if filteredList.length === 0}
    <div class="empty-state">
      <p>Tidak ada masukan atau request fitur dalam filter ini.</p>
    </div>
  {:else}
    <div class="feedback-grid">
      {#each filteredList as item (item.id)}
        {@const catBadge = formatCategoryBadge(item.category)}
        <article class="feedback-admin-card" class:is-resolved={item.status === 'resolved'}>
          <header class="card-header">
            <div class="badges-row">
              <span class="badge {catBadge.class}">{catBadge.label}</span>
              <span class="status-indicator status-{item.status}">
                {item.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <time class="card-time">
              {new Date(item.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </time>
          </header>

          <h3 class="card-title">{item.title}</h3>
          <p class="card-desc">{item.description}</p>

          {#if item.deviceInfo}
            <details class="device-details">
              <summary>Detail Peramban & Sistem</summary>
              <pre>{item.deviceInfo}</pre>
            </details>
          {/if}

          <!-- Admin Response / Note -->
          {#if editingNotesId === item.id}
            <div class="note-edit-box">
              <label for="admin-note-{item.id}">Tanggapan Tim / Catatan Admin:</label>
              <textarea
                id="admin-note-{item.id}"
                bind:value={noteText}
                placeholder="Tuliskan catatan internal atau tanggapan untuk user..."
                rows="3"></textarea>
              <div class="note-edit-actions">
                <button
                  type="button"
                  class="btn-save-note"
                  onclick={() => saveAdminNote(item.id)}
                  disabled={isSaving}
                >
                  {isSaving ? 'Menyimpan…' : 'Simpan Catatan'}
                </button>
                <button
                  type="button"
                  class="btn-cancel-note"
                  onclick={() => (editingNotesId = null)}
                >
                  Batal
                </button>
              </div>
            </div>
          {:else}
            <div class="note-display">
              {#if item.adminNotes}
                <div class="note-content">
                  <strong>Tanggapan:</strong>
                  <span>{item.adminNotes}</span>
                </div>
              {/if}
              <button type="button" class="btn-edit-note" onclick={() => startEditNotes(item)}>
                {item.adminNotes ? 'Ubah Tanggapan' : '+ Beri Tanggapan'}
              </button>
            </div>
          {/if}

          <!-- Status Action Buttons -->
          <footer class="card-footer">
            <span class="action-label">Ubah Status:</span>
            <div class="status-action-btns">
              <button
                type="button"
                class="btn-action btn-open"
                class:is-current={item.status === 'open'}
                onclick={() => handleStatusChange(item.id, 'open')}
              >
                Open
              </button>
              <button
                type="button"
                class="btn-action btn-progress"
                class:is-current={item.status === 'in_progress'}
                onclick={() => handleStatusChange(item.id, 'in_progress')}
              >
                Dikerjakan
              </button>
              <button
                type="button"
                class="btn-action btn-resolve"
                class:is-current={item.status === 'resolved'}
                onclick={() => handleStatusChange(item.id, 'resolved')}
              >
                Selesai
              </button>
              <button
                type="button"
                class="btn-action btn-close"
                class:is-current={item.status === 'closed'}
                onclick={() => handleStatusChange(item.id, 'closed')}
              >
                Tutup
              </button>
            </div>
          </footer>
        </article>
      {/each}
    </div>
  {/if}
</div>

<style>
  .admin-feedback-manager {
    display: grid;
    gap: 1.5rem;
  }

  .admin-feedback__controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem;
    background: var(--surface);
    border: 1px solid var(--line-soft);
    border-radius: 0.85rem;
  }

  .filter-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .filter-label {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--ink-soft);
  }

  .filter-buttons {
    display: flex;
    gap: 0.35rem;
  }

  .btn-filter {
    padding: 0.35rem 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid var(--line-soft);
    background: var(--surface);
    color: var(--ink);
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
  }

  .btn-filter.is-active {
    background: var(--ink);
    color: var(--paper);
    border-color: var(--ink);
  }

  .select-status {
    padding: 0.4rem 0.8rem;
    border-radius: 0.5rem;
    border: 1px solid var(--line-soft);
    background: var(--surface);
    color: var(--ink);
    font: inherit;
    font-size: 0.85rem;
  }

  .empty-state {
    padding: 3rem;
    text-align: center;
    background: var(--surface);
    border: 1px dashed var(--line-soft);
    border-radius: 1rem;
    color: var(--ink-soft);
  }

  .feedback-grid {
    display: grid;
    gap: 1rem;
  }

  .feedback-admin-card {
    background: var(--surface);
    border: 1px solid var(--line-soft);
    border-radius: 1rem;
    padding: 1.25rem;
    display: grid;
    gap: 0.75rem;
  }

  .feedback-admin-card.is-resolved {
    opacity: 0.85;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .badges-row {
    display: flex;
    align-items: center;
    gap: 0.45rem;
  }

  .badge {
    font-size: 0.75rem;
    font-weight: 750;
    padding: 0.2rem 0.55rem;
    border-radius: 0.4rem;
  }

  .cat-bug {
    background: color-mix(in srgb, #ef4444 12%, var(--surface));
    color: #dc2626;
  }

  .cat-feature {
    background: color-mix(in srgb, #3b82f6 12%, var(--surface));
    color: #2563eb;
  }

  .cat-general {
    background: color-mix(in srgb, #8b5cf6 12%, var(--surface));
    color: #7c3aed;
  }

  .status-indicator {
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    padding: 0.2rem 0.5rem;
    border-radius: 0.35rem;
  }

  .status-open {
    background: var(--canvas);
    color: var(--ink-soft);
  }

  .status-in_progress {
    background: color-mix(in srgb, var(--accent) 15%, var(--surface));
    color: var(--accent);
  }

  .status-resolved {
    background: color-mix(in srgb, #10b981 15%, var(--surface));
    color: #059669;
  }

  .status-closed {
    background: var(--canvas);
    color: var(--ink-soft);
  }

  .card-time {
    font-size: 0.78rem;
    color: var(--ink-soft);
  }

  .card-title {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 750;
    color: var(--ink);
  }

  .card-desc {
    margin: 0;
    font-size: 0.9rem;
    color: var(--ink-soft);
    line-height: 1.5;
    white-space: pre-wrap;
  }

  .device-details {
    font-size: 0.78rem;
    color: var(--ink-soft);
    background: var(--canvas);
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
  }

  .device-details summary {
    cursor: pointer;
    font-weight: 600;
  }

  .device-details pre {
    margin: 0.4rem 0 0;
    white-space: pre-wrap;
    word-break: break-all;
    font-family: inherit;
  }

  .note-display {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.65rem 0.85rem;
    background: color-mix(in srgb, var(--accent) 6%, var(--surface));
    border-radius: 0.5rem;
    font-size: 0.85rem;
  }

  .note-content strong {
    color: var(--accent);
  }

  .btn-edit-note {
    background: none;
    border: none;
    color: var(--accent);
    font-size: 0.8rem;
    font-weight: 700;
    cursor: pointer;
    padding: 0;
  }

  .btn-edit-note:hover {
    text-decoration: underline;
  }

  .note-edit-box {
    display: grid;
    gap: 0.4rem;
    padding: 0.85rem;
    background: var(--canvas);
    border-radius: 0.65rem;
  }

  .note-edit-box label {
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--ink);
  }

  .note-edit-box textarea {
    padding: 0.5rem;
    border-radius: 0.45rem;
    border: 1px solid var(--line-soft);
    background: var(--surface);
    color: var(--ink);
    font: inherit;
    font-size: 0.85rem;
  }

  .note-edit-actions {
    display: flex;
    gap: 0.5rem;
  }

  .btn-save-note {
    padding: 0.4rem 0.8rem;
    border-radius: 0.45rem;
    border: none;
    background: var(--accent);
    color: var(--surface);
    font-weight: 700;
    font-size: 0.8rem;
    cursor: pointer;
  }

  .btn-cancel-note {
    padding: 0.4rem 0.8rem;
    border-radius: 0.45rem;
    border: 1px solid var(--line-soft);
    background: var(--surface);
    color: var(--ink);
    font-size: 0.8rem;
    cursor: pointer;
  }

  .card-footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem;
    padding-top: 0.65rem;
    border-top: 1px solid var(--line-soft);
  }

  .action-label {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--ink-soft);
  }

  .status-action-btns {
    display: flex;
    gap: 0.35rem;
  }

  .btn-action {
    padding: 0.35rem 0.65rem;
    border-radius: 0.45rem;
    border: 1px solid var(--line-soft);
    background: var(--surface);
    color: var(--ink);
    font-size: 0.78rem;
    font-weight: 700;
    cursor: pointer;
  }

  .btn-action.is-current {
    background: var(--ink);
    color: var(--paper);
    border-color: var(--ink);
  }
</style>
