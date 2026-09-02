<script lang="ts">
  import { getGenerationName } from '@/lib/shared/generations';
  import type { ExtractedProfileData } from '@/lib/server/ai-service';

  let {
    isOpen = $bindable(false),
    availableFields = [],
    onApply,
  }: {
    isOpen: boolean;
    availableFields?: { id: string; name: string; slug: string }[];
    onApply: (data: ExtractedProfileData, mode: 'fill_empty' | 'overwrite_all') => void;
  } = $props();

  let inputText = $state('');
  let status = $state<'input' | 'extracting' | 'review' | 'error'>('input');
  let errorMessage = $state('');
  let extractedData = $state<ExtractedProfileData | null>(null);
  let applyMode = $state<'overwrite_all' | 'fill_empty'>('overwrite_all');
  let modelUsed = $state('');

  // Individual selection toggles for each detected section
  let includeIdentity = $state(true);
  let includeStories = $state(true);
  let includeJourneys = $state(true);
  let includeFields = $state(true);
  let includeLinks = $state(true);

  function handleClose() {
    isOpen = false;
    // reset state after closing animation
    setTimeout(() => {
      status = 'input';
      errorMessage = '';
      extractedData = null;
    }, 200);
  }

  function handleSampleText() {
    inputText = `Nama saya Dian Setiawan, alumni SOON angkatan Gen.Beta. Saat ini saya berdomisili di Yogyakarta dan berkarier sebagai Full Stack Web Developer di sebuah software house. 

Setelah menyelesaikan masa-masa seru di SOON, saya melanjutkan studi di bidang Teknologi Informasi dan mulai fokus membangun berbagai aplikasi web modern. Titik balik dalam perjalanan saya adalah ketika dipercaya memimpin arsitektur platform digital untuk ribuan pengguna. Saat ini saya sedang mendalami ekosistem cloud architecture dan open-source AI tooling.

Riwayat Karier:
1. Full Stack Developer di Tech Craft Studio (2022 - sekarang): Membangun scalable web applications.
2. Web Developer Intern di Digital Solusi (2020 - 2021): Mengembangkan antarmuka sistem enterprise.

LinkedIn: https://linkedin.com/in/diansetiawan
Website: https://diansetiawan.dev`;
  }

  async function handleExtract() {
    if (!inputText.trim() || inputText.trim().length < 15) {
      errorMessage =
        'Tempelkan atau ketik deskripsi profil kamu terlebih dahulu (minimal 1-2 kalimat).';
      status = 'error';
      return;
    }

    status = 'extracting';
    errorMessage = '';

    try {
      const res = await fetch('/api/ai/quick-fill-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });

      const payload = (await res.json()) as {
        ok: boolean;
        data?: ExtractedProfileData;
        modelUsed?: string;
        message?: string;
        error?: string;
      };

      if (!res.ok || !payload.ok || !payload.data) {
        status = 'error';
        errorMessage =
          payload.message ||
          'Terjadi kesalahan saat memproses ekstraksi dengan AI. Pastikan API key OpenRouter sudah terpasang.';
        return;
      }

      extractedData = payload.data;
      modelUsed = payload.modelUsed || 'OpenRouter AI';
      status = 'review';
    } catch (err) {
      status = 'error';
      errorMessage =
        err instanceof Error
          ? err.message
          : 'Gagal menghubungi server. Periksa koneksi internet Anda.';
    }
  }

  function handleConfirmApply() {
    if (!extractedData) return;

    // Filter out unchecked sections
    const finalData: ExtractedProfileData = {
      name: includeIdentity ? extractedData.name : undefined,
      generationKey: includeIdentity ? extractedData.generationKey : undefined,
      bio: includeIdentity ? extractedData.bio : undefined,
      location: includeIdentity ? extractedData.location : undefined,
      currentActivity: includeIdentity ? extractedData.currentActivity : undefined,
      currentPlaceName: includeIdentity ? extractedData.currentPlaceName : undefined,
      sinceSoonStory: includeStories ? extractedData.sinceSoonStory : undefined,
      turningPointStory: includeStories ? extractedData.turningPointStory : undefined,
      currentDirectionStory: includeStories ? extractedData.currentDirectionStory : undefined,
      linkedinUrl: includeLinks ? extractedData.linkedinUrl : undefined,
      instagramUrl: includeLinks ? extractedData.instagramUrl : undefined,
      websiteUrl: includeLinks ? extractedData.websiteUrl : undefined,
      journeys: includeJourneys ? extractedData.journeys : [],
      fieldIds: includeFields ? extractedData.fieldIds : [],
    };

    onApply(finalData, applyMode);
    handleClose();
  }

  function getMatchedFieldNames(fieldIds: string[]): string[] {
    return fieldIds
      .map((id) => availableFields.find((f) => f.id === id)?.name)
      .filter((n): n is string => Boolean(n));
  }
</script>

{#if isOpen}
  <div
    class="ai-modal-backdrop"
    role="dialog"
    aria-modal="true"
    aria-labelledby="ai-modal-title"
    onclick={handleClose}
  >
    <div class="ai-modal-card" onclick={(e) => e.stopPropagation()}>
      <!-- Header -->
      <div class="ai-modal-header">
        <div class="ai-header-lead">
          <h2 id="ai-modal-title">Quick Fill Profil dengan AI</h2>
        </div>

        <button type="button" class="ai-close-btn" onclick={handleClose} aria-label="Tutup dialog">
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
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="ai-modal-body">
        {#if status === 'input' || status === 'error'}
          <p class="ai-modal-intro">
            Tempelkan bio LinkedIn, rangkuman CV, atau ketik deskripsi bebas perjalanan hidup dan
            kariermu. AI akan mengekstrak informasi dan memetakannya ke setiap field formulir secara
            otomatis.
          </p>

          <div class="ai-textarea-wrap">
            <textarea
              class="ai-textarea"
              placeholder="Contoh: Nama saya Budi Santoso, alumni Gen.SuperTeam yang berdomisili di Jakarta. Saat ini bekerja sebagai UI/UX Designer di..."
              bind:value={inputText}
              rows="8"></textarea>

            <div class="ai-textarea-footer">
              <span class="ai-char-count">{inputText.length} karakter</span>
              <button type="button" class="ai-sample-btn" onclick={handleSampleText}>
                Pakai Contoh Teks
              </button>
            </div>
          </div>

          {#if status === 'error' && errorMessage}
            <div class="ai-error-banner" role="alert">
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

          <div class="ai-modal-actions">
            <button type="button" class="btn-secondary" onclick={handleClose}> Batal </button>
            <button
              type="button"
              class="btn-primary-ai"
              onclick={handleExtract}
              disabled={!inputText.trim()}
            >
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
                <path
                  d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z"
                />
              </svg>
              <span>Ekstrak Data Profil</span>
            </button>
          </div>
        {:else if status === 'extracting'}
          <div class="ai-loading-state">
            <div class="ai-spinner" aria-hidden="true"></div>
            <h3>Menganalisis dan mengekstrak narasi profil...</h3>
            <p>
              Model AI sedang membaca teks deskripsi dan menyelaraskannya dengan skema SoonWiki.
            </p>
          </div>
        {:else if status === 'review' && extractedData}
          <div class="ai-review-header">
            <div class="ai-review-badge">
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Ekstraksi Berhasil ({modelUsed})</span>
            </div>
            <p class="ai-review-desc">
              Periksa data hasil ekstraksi di bawah ini. Anda dapat memilih bagian yang ingin
              dimasukkan ke formulir sebelum menerapkannya.
            </p>
          </div>

          <div class="ai-extracted-grid">
            <!-- 1. Identitas & Karier -->
            <label class="ai-section-card" class:is-disabled={!includeIdentity}>
              <div class="ai-section-top">
                <input type="checkbox" bind:checked={includeIdentity} class="ai-checkbox" />
                <strong class="ai-section-title">Identitas & Peran Utama</strong>
              </div>
              <div class="ai-section-content">
                <div class="ai-field-item">
                  <span class="ai-field-k">Nama:</span>
                  <span class="ai-field-v">{extractedData.name || '(Tidak terdeteksi)'}</span>
                </div>
                {#if extractedData.generationKey}
                  <div class="ai-field-item">
                    <span class="ai-field-k">Angkatan:</span>
                    <span class="ai-field-v badge-gen"
                      >{getGenerationName(extractedData.generationKey)}</span
                    >
                  </div>
                {/if}
                <div class="ai-field-item">
                  <span class="ai-field-k">Domisili:</span>
                  <span class="ai-field-v">{extractedData.location || '(Tidak terdeteksi)'}</span>
                </div>
                <div class="ai-field-item">
                  <span class="ai-field-k">Peran / Tempat:</span>
                  <span class="ai-field-v">
                    {extractedData.currentActivity || '-'}
                    {extractedData.currentPlaceName ? `@ ${extractedData.currentPlaceName}` : ''}
                  </span>
                </div>
                {#if extractedData.bio}
                  <div class="ai-field-item ai-field-item--block">
                    <span class="ai-field-k">Bio Singkat:</span>
                    <p class="ai-field-p">{extractedData.bio}</p>
                  </div>
                {/if}
              </div>
            </label>

            <!-- 2. Narasi Kisah -->
            <label class="ai-section-card" class:is-disabled={!includeStories}>
              <div class="ai-section-top">
                <input type="checkbox" bind:checked={includeStories} class="ai-checkbox" />
                <strong class="ai-section-title">Narasi Editorial & Kisah</strong>
              </div>
              <div class="ai-section-content">
                {#if extractedData.sinceSoonStory}
                  <div class="ai-field-item ai-field-item--block">
                    <span class="ai-field-k">Kisah Sejak di SOON:</span>
                    <p class="ai-field-p">{extractedData.sinceSoonStory}</p>
                  </div>
                {/if}
                {#if extractedData.turningPointStory}
                  <div class="ai-field-item ai-field-item--block">
                    <span class="ai-field-k">Titik Balik:</span>
                    <p class="ai-field-p">{extractedData.turningPointStory}</p>
                  </div>
                {/if}
                {#if extractedData.currentDirectionStory}
                  <div class="ai-field-item ai-field-item--block">
                    <span class="ai-field-k">Arah & Fokus Sekarang:</span>
                    <p class="ai-field-p">{extractedData.currentDirectionStory}</p>
                  </div>
                {/if}
                {#if !extractedData.sinceSoonStory && !extractedData.turningPointStory && !extractedData.currentDirectionStory}
                  <p class="ai-empty-hint">Tidak ada bagian narasi kisah yang terdeteksi.</p>
                {/if}
              </div>
            </label>

            <!-- 3. Jejak Perjalanan (Journeys) -->
            <label class="ai-section-card" class:is-disabled={!includeJourneys}>
              <div class="ai-section-top">
                <input type="checkbox" bind:checked={includeJourneys} class="ai-checkbox" />
                <strong class="ai-section-title"
                  >Jejak Perjalanan ({extractedData.journeys.length} entri)</strong
                >
              </div>
              <div class="ai-section-content">
                {#if extractedData.journeys.length > 0}
                  <ul class="ai-journey-list">
                    {#each extractedData.journeys as journey, jIdx (journey.activity + jIdx)}
                      <li class="ai-journey-item">
                        <strong>{journey.activity}</strong>
                        {#if journey.placeName}<span>· {journey.placeName}</span>{/if}
                        {#if journey.startYear || journey.endYear}
                          <small class="journey-years"
                            >({journey.startYear || ''} - {journey.endYear || 'Sekarang'})</small
                          >
                        {/if}
                      </li>
                    {/each}
                  </ul>
                {:else}
                  <p class="ai-empty-hint">Tidak ada entri riwayat perjalanan terdeteksi.</p>
                {/if}
              </div>
            </label>

            <!-- 4. Bidang & Tautan Sosial -->
            <label class="ai-section-card" class:is-disabled={!includeFields && !includeLinks}>
              <div class="ai-section-top">
                <input type="checkbox" bind:checked={includeFields} class="ai-checkbox" />
                <strong class="ai-section-title">Rekomendasi Bidang & Tautan</strong>
              </div>
              <div class="ai-section-content">
                <div class="ai-field-item ai-field-item--block">
                  <span class="ai-field-k">Bidang Minat Terdeteksi:</span>
                  <div class="ai-tags-wrap">
                    {#each getMatchedFieldNames(extractedData.fieldIds) as fieldName (fieldName)}
                      <span class="ai-tag-pill">{fieldName}</span>
                    {:else}
                      <span class="ai-empty-hint">Tidak ada bidang keahlian cocok terdeteksi.</span>
                    {/each}
                  </div>
                </div>

                <div class="ai-field-item ai-field-item--block">
                  <span class="ai-field-k">Tautan:</span>
                  <ul class="ai-links-list">
                    {#if extractedData.linkedinUrl}<li>
                        LinkedIn: <a
                          href={extractedData.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer">{extractedData.linkedinUrl}</a
                        >
                      </li>{/if}
                    {#if extractedData.instagramUrl}<li>
                        Instagram: <a
                          href={extractedData.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer">{extractedData.instagramUrl}</a
                        >
                      </li>{/if}
                    {#if extractedData.websiteUrl}<li>
                        Website: <a
                          href={extractedData.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer">{extractedData.websiteUrl}</a
                        >
                      </li>{/if}
                    {#if !extractedData.linkedinUrl && !extractedData.instagramUrl && !extractedData.websiteUrl}
                      <li class="ai-empty-hint">Tidak ada tautan media sosial.</li>
                    {/if}
                  </ul>
                </div>
              </div>
            </label>
          </div>

          <!-- Apply Mode Selector -->
          <div class="ai-mode-selector">
            <span class="ai-mode-label">Metode Pengisian:</span>
            <div class="ai-mode-options">
              <label class="ai-radio-label">
                <input type="radio" name="applyMode" value="overwrite_all" bind:group={applyMode} />
                <span>Timpa data form dengan hasil AI</span>
              </label>
              <label class="ai-radio-label">
                <input type="radio" name="applyMode" value="fill_empty" bind:group={applyMode} />
                <span>Hanya isi field yang saat ini masih kosong</span>
              </label>
            </div>
          </div>

          <div class="ai-modal-actions">
            <button type="button" class="btn-secondary" onclick={() => (status = 'input')}>
              ← Ubah Teks
            </button>
            <button type="button" class="btn-primary-apply" onclick={handleConfirmApply}>
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
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Terapkan ke Formulir Profil</span>
            </button>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .ai-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(18, 21, 20, 0.72);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    padding: 1.25rem;
    animation: fadeIn 180ms ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .ai-modal-card {
    position: relative;
    width: 100%;
    max-width: 44rem;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    background: var(--surface);
    border: 1px solid var(--line-soft);
    border-radius: 1.25rem;
    box-shadow:
      0 24px 60px -12px rgba(18, 21, 20, 0.28),
      0 4px 12px rgba(18, 21, 20, 0.08);
    overflow: hidden;
    animation: scaleUp 220ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes scaleUp {
    from {
      transform: scale(0.96) translateY(8px);
      opacity: 0;
    }
    to {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
  }

  .ai-modal-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 1.35rem 1.5rem 1rem;
    border-bottom: 1px solid var(--line-soft);
    background: color-mix(in srgb, var(--surface) 95%, var(--accent-soft));
  }

  .ai-header-lead {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .ai-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    width: fit-content;
    padding: 0.2rem 0.6rem;
    border-radius: 9999px;
    background: var(--accent-soft);
    color: var(--accent);
    font-size: 0.75rem;
    font-weight: 750;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  #ai-modal-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 750;
    color: var(--ink);
    letter-spacing: -0.02em;
  }

  .ai-close-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid var(--line-soft);
    background: var(--surface);
    color: var(--ink-soft);
    cursor: pointer;
    transition:
      background-color 150ms ease,
      color 150ms ease,
      transform 150ms ease;
  }

  .ai-close-btn:hover {
    background: var(--surface-muted);
    color: var(--ink);
    transform: scale(1.05);
  }

  .ai-modal-body {
    padding: 1.5rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .ai-modal-intro {
    margin: 0;
    color: var(--ink-soft);
    font-size: 0.92rem;
    line-height: 1.55;
  }

  .ai-textarea-wrap {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--line-soft);
    border-radius: 0.85rem;
    background: var(--canvas);
    overflow: hidden;
    transition: border-color 150ms ease;
  }

  .ai-textarea-wrap:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }

  .ai-textarea {
    width: 100%;
    padding: 0.85rem 1rem;
    border: none;
    background: transparent;
    font-family: inherit;
    font-size: 0.9rem;
    line-height: 1.6;
    color: var(--ink);
    resize: vertical;
    min-height: 140px;
    outline: none;
  }

  .ai-textarea-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    border-top: 1px solid color-mix(in srgb, var(--line-soft) 60%, transparent);
    background: color-mix(in srgb, var(--surface) 50%, var(--canvas));
  }

  .ai-char-count {
    font-size: 0.78rem;
    color: var(--ink-soft);
  }

  .ai-sample-btn {
    background: none;
    border: none;
    color: var(--accent);
    font-size: 0.8rem;
    font-weight: 650;
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .ai-sample-btn:hover {
    color: var(--accent-strong);
  }

  .ai-error-banner {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    background: color-mix(in srgb, var(--signal) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--signal) 30%, transparent);
    color: var(--signal);
    font-size: 0.88rem;
    line-height: 1.45;
  }

  .ai-modal-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  .btn-secondary {
    display: inline-flex;
    align-items: center;
    padding: 0.6rem 1.15rem;
    border-radius: 9999px;
    border: 1px solid var(--line-soft);
    background: var(--surface);
    color: var(--ink-soft);
    font-size: 0.88rem;
    font-weight: 650;
    cursor: pointer;
    transition:
      background-color 150ms ease,
      color 150ms ease;
  }

  .btn-secondary:hover {
    background: var(--surface-muted);
    color: var(--ink);
  }

  .btn-primary-ai,
  .btn-primary-apply {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.6rem 1.35rem;
    border-radius: 9999px;
    border: none;
    background: var(--accent);
    color: #ffffff;
    font-size: 0.88rem;
    font-weight: 700;
    cursor: pointer;
    transition:
      background-color 150ms ease,
      transform 150ms ease;
  }

  .btn-primary-ai:hover:not(:disabled),
  .btn-primary-apply:hover {
    background: var(--accent-strong);
    transform: translateY(-1px);
  }

  .btn-primary-ai:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Loading State */
  .ai-loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1.5rem;
    text-align: center;
    gap: 0.75rem;
  }

  .ai-spinner {
    width: 38px;
    height: 38px;
    border: 3px solid var(--accent-soft);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 700ms linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .ai-loading-state h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 750;
    color: var(--ink);
  }

  .ai-loading-state p {
    margin: 0;
    font-size: 0.88rem;
    color: var(--ink-soft);
    max-width: 28rem;
  }

  /* Review State */
  .ai-review-header {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .ai-review-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    background: color-mix(in srgb, #10b981 12%, transparent);
    color: #059669;
    font-size: 0.8rem;
    font-weight: 750;
    width: fit-content;
  }

  .ai-review-desc {
    margin: 0;
    font-size: 0.88rem;
    color: var(--ink-soft);
    line-height: 1.5;
  }

  .ai-extracted-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(19rem, 1fr));
    gap: 1rem;
  }

  .ai-section-card {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 0.95rem;
    background: var(--canvas);
    border: 1px solid var(--line-soft);
    transition:
      opacity 150ms ease,
      border-color 150ms ease;
    cursor: pointer;
  }

  .ai-section-card.is-disabled {
    opacity: 0.55;
    background: var(--surface-muted);
  }

  .ai-section-top {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .ai-checkbox {
    width: 18px;
    height: 18px;
    accent-color: var(--accent);
    cursor: pointer;
  }

  .ai-section-title {
    font-size: 0.9rem;
    color: var(--ink);
  }

  .ai-section-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.84rem;
    padding-left: 1.75rem;
  }

  .ai-field-item {
    display: flex;
    gap: 0.4rem;
    color: var(--ink);
  }

  .ai-field-item--block {
    flex-direction: column;
    gap: 0.2rem;
  }

  .ai-field-k {
    font-weight: 650;
    color: var(--ink-soft);
    min-width: 5rem;
  }

  .ai-field-v {
    color: var(--ink);
    word-break: break-word;
  }

  .ai-field-p {
    margin: 0;
    color: var(--ink);
    line-height: 1.45;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .badge-gen {
    display: inline-block;
    padding: 0.1rem 0.5rem;
    border-radius: 9999px;
    background: var(--accent-soft);
    color: var(--accent);
    font-size: 0.75rem;
    font-weight: 700;
  }

  .ai-journey-list {
    margin: 0;
    padding-left: 1.1rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .ai-journey-item {
    line-height: 1.35;
  }

  .journey-years {
    color: var(--ink-soft);
  }

  .ai-tags-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-top: 0.2rem;
  }

  .ai-tag-pill {
    display: inline-flex;
    padding: 0.15rem 0.55rem;
    border-radius: 9999px;
    background: var(--surface);
    border: 1px solid var(--line-soft);
    font-size: 0.76rem;
    font-weight: 650;
    color: var(--ink);
  }

  .ai-links-list {
    margin: 0;
    padding-left: 1.1rem;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .ai-links-list a {
    color: var(--accent);
    text-decoration: underline;
    word-break: break-all;
  }

  .ai-empty-hint {
    margin: 0;
    color: var(--ink-soft);
    font-style: italic;
  }

  /* Mode selector */
  .ai-mode-selector {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.85rem 1rem;
    border-radius: 0.85rem;
    background: color-mix(in srgb, var(--accent-soft) 40%, var(--canvas));
    border: 1px solid var(--line-soft);
  }

  .ai-mode-label {
    font-size: 0.82rem;
    font-weight: 750;
    color: var(--ink);
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  .ai-mode-options {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .ai-radio-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.86rem;
    color: var(--ink);
    cursor: pointer;
  }

  .ai-radio-label input {
    accent-color: var(--accent);
  }
</style>
