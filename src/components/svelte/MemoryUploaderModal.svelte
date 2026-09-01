<script lang="ts">
  import { compressImageToWebP } from '@/lib/browser/image-compression';
  import { SOON_GENERATIONS } from '@/lib/shared/generations';
  import { paths, publicStorageUrl } from '@/lib/shared/paths';
  import { createBrowserSupabase } from '@/lib/supabase/browser';

  let {
    isOpen = $bindable(false),
    onSuccess,
  }: {
    isOpen: boolean;
    onSuccess?: (newId: string) => void;
  } = $props();

  let title = $state('');
  let story = $state('');
  let generationKey = $state(SOON_GENERATIONS[0]?.key ?? 'superteam');
  let memoryYear = $state<number | undefined>(new Date().getFullYear());
  let locationTag = $state('');
  let mediaAspectRatio = $state<'16/10' | '4/3' | '1/1' | '9/16'>('16/10');

  let mediaType = $state<'image' | 'video'>('image');
  let mediaPath = $state<string | null>(null);
  let previewUrl = $state<string | null>(null);

  let uploadStatus = $state<'idle' | 'processing' | 'uploading' | 'ready' | 'error'>('idle');
  let uploadError = $state('');
  let isSubmitting = $state(false);
  let submitError = $state('');

  function resetForm() {
    title = '';
    story = '';
    generationKey = SOON_GENERATIONS[0]?.key ?? 'superteam';
    memoryYear = new Date().getFullYear();
    locationTag = '';
    mediaAspectRatio = '16/10';
    mediaType = 'image';
    mediaPath = null;
    previewUrl = null;
    uploadStatus = 'idle';
    uploadError = '';
    submitError = '';
  }

  async function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    uploadError = '';

    if (file.type.startsWith('video/')) {
      if (file.size > 45 * 1024 * 1024) {
        uploadError = 'Ukuran video terlalu besar (maksimal 45MB).';
        uploadStatus = 'error';
        return;
      }
      mediaType = 'video';
      await uploadMediaFile(file);
    } else if (file.type.startsWith('image/')) {
      if (file.size > 20 * 1024 * 1024) {
        uploadError = 'Ukuran foto terlalu besar (maksimal 20MB).';
        uploadStatus = 'error';
        return;
      }
      mediaType = 'image';
      uploadStatus = 'processing';

      try {
        const compressedBlob = await compressImageToWebP(file, { square: false });
        await uploadMediaBlob(compressedBlob, 'webp');
      } catch (err) {
        uploadStatus = 'error';
        uploadError = err instanceof Error ? err.message : 'Gagal memproses gambar.';
      }
    } else {
      uploadError = 'Pilih file foto (JPG, PNG, WebP) atau video (MP4, WebM).';
      uploadStatus = 'error';
    }
  }

  async function uploadMediaBlob(blob: Blob, ext: string) {
    uploadStatus = 'uploading';

    try {
      const supabase = createBrowserSupabase();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('Sesi masuk telah berakhir. Silakan masuk terlebih dahulu.');
      }

      const path = `${user.id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

      const { error: uploadErr } = await supabase.storage.from('memories').upload(path, blob, {
        contentType: `image/${ext}`,
        upsert: false,
      });

      if (uploadErr) {
        throw new Error(uploadErr.message);
      }

      mediaPath = path;
      previewUrl = publicStorageUrl('memories', path);
      uploadStatus = 'ready';
    } catch (err) {
      uploadStatus = 'error';
      const msg = err instanceof Error ? err.message : '';
      if (msg.toLowerCase().includes('bucket not found')) {
        uploadError =
          'Storage bucket "memories" belum dibuat di Supabase. Silakan jalankan SQL migration atau buat bucket "memories" (Public: ON) di Supabase Dashboard.';
      } else {
        uploadError = msg || 'Gagal mengunggah media.';
      }
    }
  }

  async function uploadMediaFile(file: File) {
    uploadStatus = 'uploading';

    try {
      const supabase = createBrowserSupabase();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('Sesi masuk telah berakhir. Silakan masuk terlebih dahulu.');
      }

      const ext = file.name.split('.').pop() || 'mp4';
      const path = `${user.id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

      const { error: uploadErr } = await supabase.storage.from('memories').upload(path, file, {
        contentType: file.type || 'video/mp4',
        upsert: false,
      });

      if (uploadErr) {
        throw new Error(uploadErr.message);
      }

      mediaPath = path;
      previewUrl = publicStorageUrl('memories', path);
      uploadStatus = 'ready';
    } catch (err) {
      uploadStatus = 'error';
      const msg = err instanceof Error ? err.message : '';
      if (msg.toLowerCase().includes('bucket not found')) {
        uploadError =
          'Storage bucket "memories" belum dibuat di Supabase. Silakan jalankan SQL migration atau buat bucket "memories" (Public: ON) di Supabase Dashboard.';
      } else {
        uploadError = msg || 'Gagal mengunggah video.';
      }
    }
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!mediaPath) {
      submitError = 'Unggah foto atau video kenangan terlebih dahulu.';
      return;
    }

    isSubmitting = true;
    submitError = '';

    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          story,
          generationKey,
          mediaType,
          mediaPath,
          mediaAspectRatio,
          memoryYear: memoryYear ? Number(memoryYear) : null,
          locationTag: locationTag || null,
        }),
      });

      const payload = (await res.json()) as {
        ok: boolean;
        data?: { id: string };
        message?: string;
      };

      if (!res.ok || !payload.ok || !payload.data) {
        submitError = payload.message || 'Gagal menerbitkan kenangan. Pastikan kamu sudah masuk.';
        return;
      }

      const newId = payload.data.id;
      resetForm();
      isOpen = false;

      if (onSuccess) {
        onSuccess(newId);
      } else {
        window.location.href = paths.memoryDetail(newId);
      }
    } catch {
      submitError = 'Terjadi kesalahan saat menyimpan kenangan.';
    } finally {
      isSubmitting = false;
    }
  }
</script>

{#if isOpen}
  <div
    class="modal-backdrop"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    onclick={() => (isOpen = false)}
  >
    <div class="modal-card" onclick={(e) => e.stopPropagation()}>
      <!-- Header -->
      <div class="modal-header">
        <div class="modal-badge">
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
            <path
              d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
            />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <span>Abadikan Momen</span>
        </div>
        <h2 id="modal-title">Bagikan Kenangan SOON</h2>
        <p class="modal-subtitle">
          Unggah foto atau video kenangan berharga bersama sesama alumni untuk disimpan di Galeri
          Kenangan.
        </p>

        <button
          type="button"
          class="modal-close-btn"
          onclick={() => (isOpen = false)}
          aria-label="Tutup formulir"
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <!-- Body Form -->
      <form class="modal-form" onsubmit={handleSubmit}>
        <!-- Media Dropzone -->
        <div class="form-group">
          <label for="memory-media-input" class="form-label">
            <span>Media Kenangan (Foto atau Video)</span>
            <span class="required">*</span>
          </label>

          {#if previewUrl}
            <div class="media-preview-box">
              {#if mediaType === 'video'}
                <video
                  src={previewUrl}
                  controls
                  playsinline
                  webkit-playsinline
                  preload="metadata"
                  class="preview-media"
                >
                  <track kind="captions" />
                </video>
              {:else}
                <img src={previewUrl} alt="Pratinjau kenangan" class="preview-media" />
              {/if}
              <button
                type="button"
                class="remove-media-btn"
                onclick={() => {
                  mediaPath = null;
                  previewUrl = null;
                  uploadStatus = 'idle';
                }}
              >
                Ganti Media
              </button>
            </div>
          {:else}
            <label
              class="dropzone"
              class:dropzone--loading={uploadStatus === 'processing' ||
                uploadStatus === 'uploading'}
            >
              <input
                id="memory-media-input"
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                onchange={handleFileChange}
                disabled={uploadStatus === 'processing' || uploadStatus === 'uploading'}
              />
              <div class="dropzone-content">
                {#if uploadStatus === 'processing' || uploadStatus === 'uploading'}
                  <div class="spinner" aria-hidden="true"></div>
                  <p class="dropzone-text">Sedang mengunggah media...</p>
                {:else}
                  <svg
                    class="dropzone-icon"
                    viewBox="0 0 24 24"
                    width="32"
                    height="32"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <p class="dropzone-text">
                    <strong>Klik untuk memilih file</strong> atau seret ke sini
                  </p>
                  <span class="dropzone-hint"
                    >Format foto (JPG, PNG, WebP) atau video (MP4, WebM, maks. 45MB)</span
                  >
                {/if}
              </div>
            </label>
          {/if}

          {#if uploadError}
            <p class="field-error" role="alert">{uploadError}</p>
          {/if}
        </div>

        <!-- Grid Fields -->
        <div class="form-row">
          <!-- Generation -->
          <div class="form-group">
            <label for="memory-gen" class="form-label">
              <span>Angkatan Terkait</span>
              <span class="required">*</span>
            </label>
            <select id="memory-gen" bind:value={generationKey} class="form-input" required>
              {#each SOON_GENERATIONS as gen (gen.key)}
                <option value={gen.key}>{gen.name}</option>
              {/each}
            </select>
          </div>

          <!-- Year -->
          <div class="form-group">
            <label for="memory-year" class="form-label">
              <span>Tahun Kejadian</span>
            </label>
            <input
              id="memory-year"
              type="number"
              bind:value={memoryYear}
              placeholder="Contoh: 2023"
              min="2000"
              max="2100"
              class="form-input"
            />
          </div>
        </div>

        <div class="form-row">
          <!-- Location / Event -->
          <div class="form-group">
            <label for="memory-loc" class="form-label">
              <span>Lokasi / Nama Acara</span>
            </label>
            <input
              id="memory-loc"
              type="text"
              bind:value={locationTag}
              placeholder="Misal: Wisuda Akbar, Bandung, atau Gathering"
              maxlength="100"
              class="form-input"
            />
          </div>

          <!-- Aspect Ratio -->
          <div class="form-group">
            <label for="memory-aspect" class="form-label">
              <span>Rasio Tampilan</span>
            </label>
            <select id="memory-aspect" bind:value={mediaAspectRatio} class="form-input">
              <option value="16/10">Lanskap (16:10)</option>
              <option value="4/3">Klasik (4:3)</option>
              <option value="1/1">Persegi (1:1)</option>
              <option value="9/16">Potret (9:16)</option>
            </select>
          </div>
        </div>

        <!-- Title -->
        <div class="form-group">
          <label for="memory-title" class="form-label">
            <span>Judul Kenangan</span>
            <span class="required">*</span>
          </label>
          <input
            id="memory-title"
            type="text"
            bind:value={title}
            placeholder="Misal: Malam Keakraban Terakhir Sebelum Kelulusan"
            minlength="3"
            maxlength="160"
            required
            class="form-input"
          />
        </div>

        <!-- Story Narrative -->
        <div class="form-group">
          <label for="memory-story" class="form-label">
            <span>Cerita di Balik Kenangan</span>
            <span class="required">*</span>
          </label>
          <textarea
            id="memory-story"
            bind:value={story}
            placeholder="Ceritakan bagaimana momen ini terjadi, apa yang kamu rasakan, dan siapa saja yang ada di sana..."
            rows="4"
            minlength="10"
            maxlength="5000"
            required
            class="form-input form-textarea"></textarea>
        </div>

        {#if submitError}
          <div class="submit-error-banner" role="alert">
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{submitError}</span>
          </div>
        {/if}

        <!-- Footer Actions -->
        <div class="modal-footer">
          <button
            type="button"
            class="btn-cancel"
            onclick={() => (isOpen = false)}
            disabled={isSubmitting}
          >
            Batal
          </button>
          <button
            type="submit"
            class="btn-publish"
            disabled={isSubmitting || !mediaPath || !title.trim() || !story.trim()}
          >
            {#if isSubmitting}
              <span>Menyimpan...</span>
            {:else}
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Terbitkan Kenangan</span>
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 9990;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(10, 12, 11, 0.7);
    backdrop-filter: blur(8px);
    padding: 1.25rem;
    overflow-y: auto;
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

  .modal-card {
    position: relative;
    width: 100%;
    max-width: 620px;
    max-height: 90vh;
    overflow-y: auto;
    background: var(--surface);
    border: 1px solid var(--line-soft);
    border-radius: 1.5rem;
    padding: clamp(1.5rem, 4vw, 2.25rem);
    box-shadow:
      0 24px 60px -12px rgba(18, 21, 20, 0.25),
      0 4px 16px -2px rgba(18, 21, 20, 0.08);
    animation: slideUp 240ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .modal-header {
    position: relative;
    display: grid;
    gap: 0.35rem;
    padding-bottom: 1.25rem;
    border-bottom: 1px solid var(--line-soft);
  }

  .modal-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
    font-weight: 800;
    color: var(--accent);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 750;
    letter-spacing: -0.03em;
    color: var(--ink);
  }

  .modal-subtitle {
    margin: 0;
    color: var(--ink-soft);
    font-size: 0.92rem;
    line-height: 1.5;
  }

  .modal-close-btn {
    position: absolute;
    top: 0;
    right: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: none;
    background: var(--surface-muted);
    color: var(--ink-soft);
    cursor: pointer;
    transition: background-color 150ms ease;
  }

  .modal-close-btn:hover {
    background: color-mix(in srgb, var(--ink) 12%, transparent);
    color: var(--ink);
  }

  /* Form */
  .modal-form {
    display: grid;
    gap: 1.2rem;
    padding-top: 1.25rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  @media (min-width: 540px) {
    .form-row {
      grid-template-columns: 1fr 1fr;
    }
  }

  .form-group {
    display: grid;
    gap: 0.4rem;
  }

  .form-label {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--ink);
  }

  .required {
    color: #e74c3c;
  }

  .form-input {
    width: 100%;
    height: 42px;
    padding: 0 0.85rem;
    border-radius: 0.65rem;
    border: 1px solid var(--line-soft);
    background: var(--surface-muted);
    color: var(--ink);
    font-family: inherit;
    font-size: 0.9rem;
    outline: none;
    transition:
      border-color 150ms ease,
      box-shadow 150ms ease;
  }

  .form-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent);
    background: var(--surface);
  }

  .form-textarea {
    height: auto;
    padding: 0.75rem 0.85rem;
    resize: vertical;
    line-height: 1.6;
  }

  /* Dropzone */
  .dropzone {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem 1.25rem;
    border: 2px dashed var(--line-soft);
    border-radius: 1rem;
    background: var(--surface-muted);
    cursor: pointer;
    text-align: center;
    transition:
      border-color 150ms ease,
      background-color 150ms ease;
  }

  .dropzone:hover {
    border-color: var(--accent);
    background: color-mix(in srgb, var(--accent) 3%, var(--surface-muted));
  }

  .dropzone input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }

  .dropzone-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    pointer-events: none;
  }

  .dropzone-icon {
    color: var(--accent);
    margin-bottom: 0.25rem;
  }

  .dropzone-text {
    margin: 0;
    font-size: 0.92rem;
    color: var(--ink);
  }

  .dropzone-hint {
    font-size: 0.78rem;
    color: var(--ink-soft);
  }

  .media-preview-box {
    position: relative;
    width: 100%;
    border-radius: 1rem;
    overflow: hidden;
    background: #000000;
    max-height: 260px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .preview-media {
    max-width: 100%;
    max-height: 260px;
    object-fit: contain;
  }

  .remove-media-btn {
    position: absolute;
    bottom: 0.75rem;
    right: 0.75rem;
    padding: 0.35rem 0.85rem;
    border-radius: 9999px;
    background: rgba(0, 0, 0, 0.75);
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.3);
    font-size: 0.78rem;
    font-weight: 700;
    cursor: pointer;
    backdrop-filter: blur(4px);
  }

  .spinner {
    width: 28px;
    height: 28px;
    border: 3px solid color-mix(in srgb, var(--accent) 25%, transparent);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 700ms linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .field-error {
    margin: 0;
    font-size: 0.82rem;
    font-weight: 600;
    color: #c0392b;
  }

  .submit-error-banner {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #991b1b;
    font-size: 0.88rem;
    font-weight: 600;
  }

  /* Modal Footer */
  .modal-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.75rem;
    padding-top: 1rem;
    border-top: 1px solid var(--line-soft);
  }

  .btn-cancel {
    height: 42px;
    padding: 0 1.25rem;
    border-radius: 9999px;
    border: 1px solid var(--line-soft);
    background: var(--surface);
    color: var(--ink-soft);
    font-size: 0.88rem;
    font-weight: 700;
    cursor: pointer;
  }

  .btn-publish {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    height: 42px;
    padding: 0 1.5rem;
    border-radius: 9999px;
    background: var(--accent);
    color: #ffffff;
    border: none;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    transition:
      opacity 150ms ease,
      transform 150ms ease;
  }

  .btn-publish:hover:not(:disabled) {
    opacity: 0.92;
    transform: translateY(-1px);
  }

  .btn-publish:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
