<script lang="ts">
  import { compressImageToWebP } from '@/lib/browser/image-compression';
  import { publicStorageUrl } from '@/lib/shared/paths';
  import { createBrowserSupabase } from '@/lib/supabase/browser';

  let {
    bucket,
    square = false,
    value = null,
    label = 'Foto',
    hint = 'Format JPG, PNG, atau WebP (maks. 5MB)',
    onUploaded,
    onRemoved,
  }: {
    bucket: 'profile-photos' | 'proud-moments';
    square?: boolean;
    value?: string | null;
    label?: string;
    hint?: string;
    onUploaded: (path: string) => void;
    onRemoved?: () => void;
  } = $props();

  let status: 'idle' | 'compressing' | 'uploading' | 'success' | 'error' = $state('idle');
  let errorMessage = $state('');
  let isDragging = $state(false);
  let previewUrl = $state<string | null>(null);

  // Compute preview URL based on value or local preview
  $effect(() => {
    if (value) {
      previewUrl = publicStorageUrl(bucket, value);
    } else {
      previewUrl = null;
    }
  });

  async function processFile(file: File) {
    if (!file.type.startsWith('image/')) {
      status = 'error';
      errorMessage = 'Pilih file gambar berformat JPG, PNG, atau WebP.';
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      status = 'error';
      errorMessage = 'Ukuran file terlalu besar (maksimal 15MB sebelum kompresi).';
      return;
    }

    status = 'compressing';
    errorMessage = '';

    // Create temporary local blob preview immediately for delightful instant UX
    const localUrl = URL.createObjectURL(file);
    previewUrl = localUrl;

    try {
      const blob = await compressImageToWebP(file, { square });
      status = 'uploading';

      const supabase = createBrowserSupabase();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('Sesi masuk telah berakhir. Silakan masuk kembali.');
      }

      const fileExt = 'webp';
      const path = `${user.id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, blob, {
        contentType: 'image/webp',
        upsert: false,
      });

      if (uploadError) {
        throw new Error(`Gagal menyimpan ke penyimpanan: ${uploadError.message}`);
      }

      status = 'success';
      onUploaded(path);

      setTimeout(() => {
        if (status === 'success') {
          status = 'idle';
        }
      }, 2500);
    } catch (err) {
      status = 'error';
      previewUrl = value ? publicStorageUrl(bucket, value) : null;
      errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat mengunggah foto.';
    } finally {
      URL.revokeObjectURL(localUrl);
    }
  }

  function handleFileChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      void processFile(file);
    }
    input.value = '';
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDragging = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      void processFile(file);
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    isDragging = true;
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    isDragging = false;
  }

  function handleRemove() {
    previewUrl = null;
    status = 'idle';
    errorMessage = '';
    onRemoved?.();
  }
</script>

<div class="media-uploader" class:is-square={square}>
  <div class="uploader-header">
    <span class="uploader-label">{label}</span>
    {#if hint}
      <span class="uploader-hint">{hint}</span>
    {/if}
  </div>

  <div
    class="dropzone"
    class:is-dragging={isDragging}
    class:has-preview={Boolean(previewUrl)}
    class:is-loading={status === 'compressing' || status === 'uploading'}
    ondragover={handleDragOver}
    ondragleave={handleDragLeave}
    ondrop={handleDrop}
    role="region"
    aria-label="Area unggah gambar"
  >
    {#if previewUrl}
      <div class="preview-wrapper">
        <img
          src={previewUrl}
          alt="Pratinjau foto"
          class="preview-img"
          loading="lazy"
          onerror={() => {
            // If remote load fails (e.g. mock placeholder)
            previewUrl = null;
          }}
        />
        <div class="preview-overlay">
          <label class="action-btn action-btn--edit">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              disabled={status === 'compressing' || status === 'uploading'}
              onchange={handleFileChange}
              class="sr-only"
            />
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Ganti</span>
          </label>
          {#if onRemoved}
            <button
              type="button"
              class="action-btn action-btn--remove"
              onclick={handleRemove}
              aria-label="Hapus foto"
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
              <span>Hapus</span>
            </button>
          {/if}
        </div>
      </div>
    {:else}
      <label class="dropzone-empty">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          disabled={status === 'compressing' || status === 'uploading'}
          onchange={handleFileChange}
          class="sr-only"
        />
        <div class="upload-icon-circle">
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <rect x="3" y="3" width="18" height="18" rx="3" ry="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
        <div class="upload-text">
          <span class="upload-title">Klik atau seret foto ke sini</span>
          <span class="upload-sub">Format JPG, PNG, atau WebP</span>
        </div>
      </label>
    {/if}

    <!-- Progress & Status Overlay -->
    {#if status === 'compressing' || status === 'uploading'}
      <div class="loading-overlay" role="status">
        <div class="spinner"></div>
        <span class="loading-text">
          {status === 'compressing'
            ? 'Memproses & mengompresi gambar…'
            : 'Mengunggah ke penyimpanan…'}
        </span>
      </div>
    {/if}
  </div>

  {#if status === 'success'}
    <div class="status-msg status-msg--success" role="status">
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
      <span>Foto berhasil diunggah!</span>
    </div>
  {:else if status === 'error'}
    <div class="status-msg status-msg--error" role="alert">
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
      <span>{errorMessage}</span>
    </div>
  {/if}
</div>

<style>
  .media-uploader {
    display: grid;
    gap: 0.6rem;
  }

  .uploader-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .uploader-label {
    font-size: 0.88rem;
    font-weight: 700;
    color: var(--ink);
    letter-spacing: -0.01em;
  }

  .uploader-hint {
    font-size: 0.78rem;
    color: var(--ink-soft);
  }

  .dropzone {
    position: relative;
    border: 1.5px dashed var(--line-soft);
    border-radius: 1rem;
    background: var(--surface);
    overflow: hidden;
    transition:
      border-color 200ms ease,
      background-color 200ms ease,
      box-shadow 200ms ease;
  }

  .dropzone:hover:not(.is-loading) {
    border-color: var(--accent);
    background: color-mix(in srgb, var(--accent-soft) 30%, var(--surface));
  }

  .dropzone.is-dragging {
    border-color: var(--accent);
    background: var(--accent-soft);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 15%, transparent);
  }

  .dropzone.has-preview {
    border-style: solid;
    border-color: var(--line-soft);
    background: var(--canvas);
  }

  .dropzone-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.85rem;
    padding: 2.25rem 1.5rem;
    cursor: pointer;
    text-align: center;
    min-height: 140px;
  }

  .upload-icon-circle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--accent-soft);
    color: var(--accent);
    transition: transform 200ms var(--ease-out);
  }

  .dropzone:hover .upload-icon-circle {
    transform: scale(1.08);
  }

  .upload-text {
    display: grid;
    gap: 0.2rem;
  }

  .upload-title {
    font-size: 0.92rem;
    font-weight: 700;
    color: var(--ink);
  }

  .upload-sub {
    font-size: 0.78rem;
    color: var(--ink-soft);
  }

  /* Preview Styles */
  .preview-wrapper {
    position: relative;
    width: 100%;
    max-height: 280px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .is-square .preview-wrapper {
    aspect-ratio: 1 / 1;
    max-height: 220px;
    max-width: 220px;
    margin-inline: auto;
    border-radius: 0.75rem;
  }

  .preview-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .preview-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba(18, 21, 20, 0.7) 0%,
      rgba(18, 21, 20, 0.2) 60%,
      transparent 100%
    );
    opacity: 0;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 0.6rem;
    padding: 1rem;
    transition: opacity 200ms ease;
  }

  .dropzone:hover .preview-overlay,
  .dropzone:focus-within .preview-overlay {
    opacity: 1;
  }

  .action-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 0.85rem;
    border-radius: 0.5rem;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    border: none;
    backdrop-filter: blur(8px);
    transition:
      transform 150ms var(--ease-out),
      background-color 150ms ease;
  }

  .action-btn:hover {
    transform: translateY(-2px);
  }

  .action-btn--edit {
    background: rgba(255, 255, 255, 0.92);
    color: var(--ink);
  }

  .action-btn--edit:hover {
    background: #ffffff;
  }

  .action-btn--remove {
    background: rgba(200, 68, 40, 0.9);
    color: #ffffff;
  }

  .action-btn--remove:hover {
    background: var(--signal);
  }

  /* Loading State */
  .loading-overlay {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(6px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    z-index: 10;
  }

  .spinner {
    width: 32px;
    height: 32px;
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

  .loading-text {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--ink);
  }

  /* Status messages */
  .status-msg {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.82rem;
    font-weight: 600;
    line-height: 1.4;
    padding: 0.35rem 0.6rem;
    border-radius: 0.5rem;
  }

  .status-msg--success {
    background: #eaf6ed;
    color: #1e6e38;
  }

  .status-msg--error {
    background: #fdf0ed;
    color: var(--signal);
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
</style>
