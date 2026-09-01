<script lang="ts">
  import { onMount } from 'svelte';
  import type { AppFeedbackRow, FeedbackCategory } from '@/lib/server/feedback-repository';

  let {
    initialFeedbacks = [],
    isLoggedIn = false,
  }: {
    initialFeedbacks?: AppFeedbackRow[];
    isLoggedIn?: boolean;
  } = $props();

  let feedbacks = $state<AppFeedbackRow[]>([...initialFeedbacks]);
  let category = $state<FeedbackCategory>('bug');
  let title = $state('');
  let description = $state('');
  let includeDeviceInfo = $state(true);
  let deviceInfo = $state('');
  let isSubmitting = $state(false);
  let successMessage = $state('');
  let errorMessage = $state('');

  onMount(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent;
      const screenRes = `${window.screen.width}x${window.screen.height}`;
      const pathname = window.location.pathname;
      deviceInfo = `Browser: ${ua} | Layar: ${screenRes} | URL: ${pathname}`;
    }
  });

  const categoryConfigs: Record<
    FeedbackCategory,
    {
      label: string;
      desc: string;
      titlePlaceholder: string;
      descPlaceholder: string;
      icon: string;
    }
  > = {
    bug: {
      label: 'Kendala / Bug',
      desc: 'Laporkan halaman error, tombol tidak berfungsi, atau masalah tampilan.',
      titlePlaceholder: 'Contoh: Tombol simpan tidak bisa diklik di browser Safari',
      descPlaceholder:
        'Jelaskan kronologi kendala: di halaman mana hal ini terjadi, apa yang kamu lakukan, dan pesan error yang muncul...',
      icon: 'bug',
    },
    feature: {
      label: 'Request Fitur',
      desc: 'Punya ide fitur baru yang bikin SoonWiki makin seru & bermanfaat?',
      titlePlaceholder: 'Contoh: Fitur pencarian anggota berdasarkan hobi atau industri',
      descPlaceholder:
        'Jelaskan ide fitur yang kamu harapkan, bagaimana cara kerjanya, dan mengapa fitur ini penting untuk komunitas...',
      icon: 'sparkle',
    },
    general: {
      label: 'Saran Umum',
      desc: 'Masukan umum, pertanyaan seputar data, atau apresiasi untuk pengembang.',
      titlePlaceholder: 'Contoh: Saran perbaikan tata bahasa di halaman Panduan',
      descPlaceholder: 'Tuliskan masukan atau saranmu secara lengkap di sini...',
      icon: 'message',
    },
  };

  async function handleSubmit(event: Event) {
    event.preventDefault();
    if (!isLoggedIn) {
      errorMessage = 'Silakan masuk dengan akun Google kamu untuk mengirim masukan.';
      return;
    }

    if (title.trim().length < 3) {
      errorMessage = 'Judul minimal harus 3 karakter.';
      return;
    }

    if (description.trim().length < 10) {
      errorMessage = 'Deskripsi minimal harus 10 karakter.';
      return;
    }

    isSubmitting = true;
    errorMessage = '';
    successMessage = '';

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          title: title.trim(),
          description: description.trim(),
          deviceInfo: includeDeviceInfo ? deviceInfo : undefined,
        }),
      });

      const json = (await res.json()) as {
        success?: boolean;
        data?: AppFeedbackRow;
        message?: string;
      };

      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.message || 'Gagal mengirim masukan. Silakan coba lagi.');
      }

      feedbacks = [json.data, ...feedbacks];
      title = '';
      description = '';
      successMessage =
        category === 'bug'
          ? 'Laporan kendala kamu berhasil dikirim! Tim akan segera menindaklanjutinya.'
          : category === 'feature'
            ? 'Request fitur kamu telah diterima! Terima kasih telah berkontribusi memajukan SoonWiki.'
            : 'Terima kasih! Masukan dan saran kamu telah berhasil terkirim.';

      setTimeout(() => {
        successMessage = '';
      }, 7000);
    } catch (err: unknown) {
      errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan teknis.';
    } finally {
      isSubmitting = false;
    }
  }

  function formatStatusBadge(status: string): { label: string; class: string } {
    switch (status) {
      case 'in_progress':
        return { label: 'Sedang Dikerjakan', class: 'status-progress' };
      case 'resolved':
        return { label: 'Terselesaikan', class: 'status-resolved' };
      case 'closed':
        return { label: 'Ditutup', class: 'status-closed' };
      default:
        return { label: 'Menunggu Peninjauan', class: 'status-open' };
    }
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

<div class="feedback-container">
  <!-- Feedback Submission Form -->
  <section class="feedback-card" aria-labelledby="form-heading">
    <header class="feedback-card__header">
      <h2 id="form-heading">Kirim Laporan atau Request Fitur</h2>
      <p class="subtitle">
        Bantu kami menyempurnakan SoonWiki. Suara dan idemu sangat berharga bagi komunitas
        SoonMates!
      </p>
    </header>

    <form onsubmit={handleSubmit} class="feedback-form">
      <!-- Category Selection Tabs -->
      <fieldset class="category-fieldset">
        <legend class="field-label">Pilih Kategori</legend>
        <div class="category-grid" role="radiogroup">
          {#each ['bug', 'feature', 'general'] as FeedbackCategory[] as key (key)}
            <label class="category-option" class:is-selected={category === key}>
              <input
                type="radio"
                name="feedback-category"
                value={key}
                checked={category === key}
                onchange={() => {
                  category = key;
                  errorMessage = '';
                }}
              />
              <div class="category-body">
                <div class="category-icon" aria-hidden="true">
                  {#if key === 'bug'}
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <rect width="8" height="14" x="8" y="6" rx="4" />
                      <path d="m19 7-3 2" />
                      <path d="m5 7 3 2" />
                      <path d="m19 19-3-2" />
                      <path d="m5 19 3-2" />
                      <path d="M20 13h-4" />
                      <path d="M4 13h4" />
                      <path d="m10 4 1 2" />
                      <path d="m14 4-1 2" />
                    </svg>
                  {:else if key === 'feature'}
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path
                        d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"
                      />
                      <path d="M9 18h6" />
                      <path d="M10 22h4" />
                    </svg>
                  {:else}
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  {/if}
                </div>
                <div class="category-meta">
                  <strong>{categoryConfigs[key].label}</strong>
                  <span>{categoryConfigs[key].desc}</span>
                </div>
              </div>
            </label>
          {/each}
        </div>
      </fieldset>

      <!-- Title Input -->
      <div class="form-field">
        <label for="feedback-title" class="field-label">
          <span>Judul {categoryConfigs[category].label}</span>
          <span class="char-count">{title.length}/200</span>
        </label>
        <input
          id="feedback-title"
          type="text"
          bind:value={title}
          placeholder={categoryConfigs[category].titlePlaceholder}
          maxlength="200"
          required
        />
      </div>

      <!-- Description Input -->
      <div class="form-field">
        <label for="feedback-desc" class="field-label">
          <span>Detail Penjelasan</span>
          <span class="char-count">{description.length}/3000</span>
        </label>
        <textarea
          id="feedback-desc"
          bind:value={description}
          placeholder={categoryConfigs[category].descPlaceholder}
          rows="5"
          maxlength="3000"
          required></textarea>
      </div>

      <!-- Device Info Toggle (Useful for Bug Reports) -->
      {#if category === 'bug'}
        <label class="device-toggle">
          <input type="checkbox" bind:checked={includeDeviceInfo} />
          <span
            >Sertakan informasi sistem & peramban secara otomatis untuk mempermudah perbaikan.</span
          >
        </label>
      {/if}

      <!-- Status Alerts -->
      {#if errorMessage}
        <div class="alert alert-error" role="alert">
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      {/if}

      {#if successMessage}
        <div class="alert alert-success" role="status">
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{successMessage}</span>
        </div>
      {/if}

      <!-- Form Footer / Submit -->
      <div class="form-footer">
        {#if !isLoggedIn}
          <div class="login-prompt">
            <p>Kamu perlu masuk terlebih dahulu untuk mengirimkan masukan.</p>
            <a href="/login" class="btn-login-redirect">Masuk Akun</a>
          </div>
        {:else}
          <button type="submit" class="btn-submit" disabled={isSubmitting}>
            {#if isSubmitting}
              <div class="spinner" aria-hidden="true"></div>
              <span>Mengirimkan…</span>
            {:else}
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              <span>Kirim {categoryConfigs[category].label}</span>
            {/if}
          </button>
        {/if}
      </div>
    </form>
  </section>

  <!-- My Submitted Feedbacks History -->
  <section class="history-section" aria-labelledby="history-heading">
    <div class="history-header">
      <h3 id="history-heading">Riwayat Laporan & Usulan Kamu</h3>
      <span class="history-count">{feedbacks.length} Masukan</span>
    </div>

    {#if feedbacks.length === 0}
      <div class="empty-history">
        <p>Belum ada laporan atau request fitur yang pernah kamu kirimkan.</p>
      </div>
    {:else}
      <div class="feedback-list">
        {#each feedbacks as item (item.id)}
          {@const catBadge = formatCategoryBadge(item.category)}
          {@const statusBadge = formatStatusBadge(item.status)}
          <article class="feedback-item">
            <div class="feedback-item__top">
              <div class="badges-row">
                <span class="badge {catBadge.class}">{catBadge.label}</span>
                <span class="badge {statusBadge.class}">{statusBadge.label}</span>
              </div>
              <time class="feedback-time">
                {new Date(item.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </time>
            </div>

            <h4 class="feedback-item__title">{item.title}</h4>
            <p class="feedback-item__desc">{item.description}</p>

            {#if item.adminNotes}
              <div class="admin-response">
                <div class="admin-response__tag">
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
                  </svg>
                  <span>Tanggapan Tim SoonWiki:</span>
                </div>
                <p class="admin-response__text">{item.adminNotes}</p>
              </div>
            {/if}
          </article>
        {/each}
      </div>
    {/if}
  </section>
</div>

<style>
  .feedback-container {
    display: grid;
    gap: 2.5rem;
    max-width: 760px;
    margin-inline: auto;
    width: 100%;
  }

  .feedback-card {
    background: var(--surface);
    border: 1px solid var(--line-soft);
    border-radius: 1.25rem;
    padding: clamp(1.25rem, 4vw, 2.25rem);
    box-shadow: 0 4px 20px -4px rgba(18, 21, 20, 0.05);
  }

  .feedback-card__header h2 {
    margin: 0;
    font-size: clamp(1.35rem, 3.5vw, 1.75rem);
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--ink);
  }

  .subtitle {
    margin: 0.45rem 0 0;
    color: var(--ink-soft);
    font-size: 0.92rem;
    line-height: 1.5;
  }

  .feedback-form {
    margin-top: 1.75rem;
    display: grid;
    gap: 1.35rem;
  }

  .category-fieldset {
    border: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 0.6rem;
  }

  .field-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.88rem;
    font-weight: 750;
    color: var(--ink);
    margin-bottom: 0.35rem;
  }

  .char-count {
    font-size: 0.76rem;
    color: var(--ink-soft);
    font-weight: 500;
  }

  .category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.65rem;
  }

  .category-option {
    position: relative;
    display: block;
    cursor: pointer;
  }

  .category-option input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .category-body {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.85rem;
    border-radius: 0.85rem;
    border: 1.5px solid var(--line-soft);
    background: var(--surface);
    transition:
      border-color 150ms ease,
      background-color 150ms ease,
      transform 150ms ease;
    height: 100%;
    box-sizing: border-box;
  }

  .category-option:hover .category-body {
    background: var(--surface-muted);
    border-color: color-mix(in srgb, var(--accent) 30%, transparent);
  }

  .category-option.is-selected .category-body {
    border-color: var(--accent);
    background: color-mix(in srgb, var(--accent) 8%, var(--surface));
  }

  .category-icon {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border-radius: 0.55rem;
    background: var(--canvas);
    color: var(--ink-soft);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 0.1rem;
    transition:
      color 150ms ease,
      background-color 150ms ease;
  }

  .category-option.is-selected .category-icon {
    background: var(--accent);
    color: var(--surface);
  }

  .category-meta {
    display: grid;
    gap: 0.2rem;
  }

  .category-meta strong {
    font-size: 0.88rem;
    color: var(--ink);
  }

  .category-meta span {
    font-size: 0.75rem;
    color: var(--ink-soft);
    line-height: 1.35;
  }

  .form-field {
    display: grid;
    gap: 0.35rem;
  }

  .form-field input,
  .form-field textarea {
    width: 100%;
    padding: 0.75rem 0.95rem;
    border-radius: 0.65rem;
    border: 1px solid var(--line-soft);
    background: var(--surface);
    color: var(--ink);
    font: inherit;
    font-size: 0.92rem;
    box-sizing: border-box;
    transition:
      border-color 150ms ease,
      box-shadow 150ms ease;
  }

  .form-field input:focus,
  .form-field textarea:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent);
  }

  .device-toggle {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    font-size: 0.8rem;
    color: var(--ink-soft);
    cursor: pointer;
    line-height: 1.4;
  }

  .device-toggle input {
    margin-top: 0.15rem;
    cursor: pointer;
    accent-color: var(--accent);
  }

  .alert {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.85rem 1.1rem;
    border-radius: 0.65rem;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .alert-error {
    background: color-mix(in srgb, var(--signal) 12%, var(--surface));
    color: var(--signal);
    border: 1px solid color-mix(in srgb, var(--signal) 30%, transparent);
  }

  .alert-success {
    background: color-mix(in srgb, #10b981 12%, var(--surface));
    color: #059669;
    border: 1px solid color-mix(in srgb, #10b981 30%, transparent);
  }

  .form-footer {
    margin-top: 0.5rem;
  }

  .btn-submit {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 46px;
    padding: 0.75rem 1.5rem;
    border-radius: 0.75rem;
    border: none;
    background: var(--accent);
    color: var(--surface);
    font-size: 0.9rem;
    font-weight: 750;
    cursor: pointer;
    box-shadow: 0 4px 14px -3px color-mix(in srgb, var(--accent) 50%, transparent);
    transition:
      background-color 150ms ease,
      transform 150ms var(--ease-out);
  }

  .btn-submit:hover:not(:disabled) {
    background: var(--accent-strong);
    transform: translateY(-1px);
  }

  .btn-submit:disabled {
    opacity: 0.7;
    cursor: wait;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid color-mix(in srgb, var(--surface) 35%, transparent);
    border-top-color: var(--surface);
    border-radius: 50%;
    animation: spin 600ms linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .login-prompt {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 0.75rem;
    background: var(--canvas);
  }

  .login-prompt p {
    margin: 0;
    font-size: 0.85rem;
    color: var(--ink-soft);
  }

  .btn-login-redirect {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1rem;
    border-radius: 0.55rem;
    background: var(--ink);
    color: var(--paper);
    font-size: 0.84rem;
    font-weight: 700;
    text-decoration: none;
  }

  /* History Section */
  .history-section {
    display: grid;
    gap: 1rem;
  }

  .history-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .history-header h3 {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 800;
    color: var(--ink);
  }

  .history-count {
    font-size: 0.78rem;
    color: var(--ink-soft);
    font-weight: 600;
    background: var(--canvas);
    padding: 0.2rem 0.6rem;
    border-radius: 9999px;
  }

  .empty-history {
    padding: 2rem;
    text-align: center;
    background: var(--surface);
    border: 1px dashed var(--line-soft);
    border-radius: 1rem;
    color: var(--ink-soft);
    font-size: 0.88rem;
  }

  .feedback-list {
    display: grid;
    gap: 0.85rem;
  }

  .feedback-item {
    background: var(--surface);
    border: 1px solid var(--line-soft);
    border-radius: 1rem;
    padding: 1.15rem;
    display: grid;
    gap: 0.55rem;
  }

  .feedback-item__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .badges-row {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .badge {
    font-size: 0.72rem;
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

  .status-open {
    background: var(--canvas);
    color: var(--ink-soft);
    border: 1px solid var(--line-soft);
  }

  .status-progress {
    background: color-mix(in srgb, var(--accent) 15%, var(--surface));
    color: var(--accent);
    border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
  }

  .status-resolved {
    background: color-mix(in srgb, #10b981 15%, var(--surface));
    color: #059669;
    border: 1px solid color-mix(in srgb, #10b981 30%, transparent);
  }

  .status-closed {
    background: var(--canvas);
    color: var(--ink-soft);
  }

  .feedback-time {
    font-size: 0.75rem;
    color: var(--ink-soft);
  }

  .feedback-item__title {
    margin: 0;
    font-size: 0.98rem;
    font-weight: 750;
    color: var(--ink);
  }

  .feedback-item__desc {
    margin: 0;
    font-size: 0.86rem;
    color: var(--ink-soft);
    line-height: 1.45;
    white-space: pre-wrap;
  }

  .admin-response {
    margin-top: 0.4rem;
    padding: 0.85rem;
    border-radius: 0.65rem;
    background: color-mix(in srgb, var(--accent) 8%, var(--surface));
    border-left: 3px solid var(--accent);
    display: grid;
    gap: 0.3rem;
  }

  .admin-response__tag {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.78rem;
    font-weight: 750;
    color: var(--accent);
  }

  .admin-response__text {
    margin: 0;
    font-size: 0.84rem;
    color: var(--ink);
    line-height: 1.4;
  }
</style>
