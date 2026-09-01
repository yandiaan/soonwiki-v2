<script lang="ts">
  import { compressImageToWebP } from '@/lib/browser/image-compression';
  import { createBrowserSupabase } from '@/lib/supabase/browser';

  let {
    bucket,
    square = false,
    value = null,
    onUploaded,
  }: {
    bucket: 'profile-photos' | 'proud-moments';
    square?: boolean;
    value?: string | null;
    onUploaded: (path: string) => void;
  } = $props();

  let status: 'idle' | 'compressing' | 'uploading' | 'error' = $state('idle');
  let errorMessage = $state('');

  async function handleChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    status = 'compressing';
    errorMessage = '';

    try {
      const blob = await compressImageToWebP(file, { square });
      status = 'uploading';

      const supabase = createBrowserSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Sesi kamu berakhir, silakan masuk lagi.');
      }

      const path = `${user.id}/${crypto.randomUUID()}.webp`;
      const { error } = await supabase.storage.from(bucket).upload(path, blob, {
        contentType: 'image/webp',
        upsert: false,
      });

      if (error) {
        throw error;
      }

      status = 'idle';
      onUploaded(path);
    } catch (uploadError) {
      status = 'error';
      errorMessage =
        uploadError instanceof Error ? uploadError.message : 'Gagal mengunggah gambar.';
    } finally {
      input.value = '';
    }
  }
</script>

<div class="media-uploader">
  <label>
    <span>{value ? 'Ganti gambar' : 'Unggah gambar'}</span>
    <input
      type="file"
      accept="image/jpeg,image/png,image/webp"
      disabled={status === 'compressing' || status === 'uploading'}
      onchange={handleChange}
    />
  </label>
  {#if status === 'compressing'}
    <p role="status">Memproses gambar…</p>
  {:else if status === 'uploading'}
    <p role="status">Mengunggah…</p>
  {:else if status === 'error'}
    <p role="alert">{errorMessage}</p>
  {/if}
</div>

<style>
  .media-uploader {
    display: grid;
    gap: 0.35rem;
  }

  label {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    font-size: 0.85rem;
    font-weight: 700;
  }

  input[type='file'] {
    max-width: 100%;
  }

  [role='alert'] {
    color: var(--signal);
    font-size: 0.8rem;
  }

  [role='status'] {
    font-size: 0.8rem;
  }
</style>
