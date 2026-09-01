<script lang="ts">
  import { submitReport } from '@/lib/server/admin-repository';
  import { createBrowserSupabase } from '@/lib/supabase/browser';

  let { profileId }: { profileId: string } = $props();

  let dialogElement: HTMLDialogElement | undefined = $state();
  let triggerElement: HTMLButtonElement | undefined = $state();
  let reason: 'incorrect_information' | 'inappropriate_content' | 'impersonation' | 'other' =
    $state('incorrect_information');
  let description = $state('');
  let status: 'idle' | 'submitting' | 'success' | 'error' = $state('idle');

  $effect(() => {
    const dialog = dialogElement;

    if (!dialog) {
      return;
    }

    function handleClose() {
      triggerElement?.focus();
    }

    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  });

  function openDialog() {
    status = 'idle';
    description = '';
    dialogElement?.showModal();
  }

  function closeDialog() {
    dialogElement?.close();
  }

  async function submit() {
    status = 'submitting';
    const supabase = createBrowserSupabase();
    const result = await submitReport(supabase, {
      profileId,
      reason,
      description: description || undefined,
    });

    status = result.ok ? 'success' : 'error';
  }
</script>

<button
  bind:this={triggerElement}
  type="button"
  class="report-dialog__trigger"
  onclick={openDialog}
>
  Laporkan profil ini
</button>

<dialog bind:this={dialogElement} class="report-dialog">
  <form onsubmit={(event) => event.preventDefault()}>
    <h2>Laporkan profil ini</h2>
    {#if status === 'success'}
      <p role="status">Terima kasih, laporan kamu sudah kami terima.</p>
      <button type="button" onclick={closeDialog}>Tutup</button>
    {:else}
      <fieldset>
        <legend>Alasan</legend>
        <label>
          <input type="radio" bind:group={reason} value="incorrect_information" /> Informasi tidak tepat
        </label>
        <label>
          <input type="radio" bind:group={reason} value="inappropriate_content" /> Konten tidak pantas
        </label>
        <label>
          <input type="radio" bind:group={reason} value="impersonation" /> Meniru orang lain
        </label>
        <label><input type="radio" bind:group={reason} value="other" /> Lainnya</label>
      </fieldset>
      <label>
        <span>Detail (opsional)</span>
        <textarea bind:value={description} rows="3"></textarea>
      </label>
      {#if status === 'error'}
        <p role="alert">Gagal mengirim laporan. Pastikan kamu sudah masuk, lalu coba lagi.</p>
      {/if}
      <div class="report-dialog__actions">
        <button type="button" onclick={closeDialog}>Batal</button>
        <button type="button" disabled={status === 'submitting'} onclick={submit}>
          Kirim laporan
        </button>
      </div>
    {/if}
  </form>
</dialog>

<style>
  .report-dialog__trigger {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--ink-soft);
    background: none;
    border: none;
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }

  .report-dialog__trigger:hover {
    color: var(--signal);
  }

  .report-dialog {
    max-width: 30rem;
    width: calc(100% - 2rem);
    padding: 1.75rem;
    border-radius: 1rem;
    border: 1px solid var(--line-soft);
    background: var(--surface);
    color: var(--ink);
    box-shadow: 0 20px 40px rgb(0 0 0 / 0.15);
  }

  .report-dialog[open] {
    display: grid;
    gap: 1.25rem;
  }

  .report-dialog::backdrop {
    background: color-mix(in srgb, var(--ink) 40%, transparent);
    backdrop-filter: blur(4px);
  }

  .report-dialog h2 {
    margin: 0;
    font-size: 1.35rem;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .report-dialog fieldset {
    display: grid;
    gap: 0.6rem;
    margin: 0;
    padding: 0;
    border: none;
  }

  .report-dialog legend {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--ink-soft);
    margin-bottom: 0.35rem;
  }

  .report-dialog label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    cursor: pointer;
  }

  .report-dialog textarea {
    width: 100%;
    min-height: 4.5rem;
    padding: 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid var(--line-soft);
    background: var(--canvas);
    color: var(--ink);
    font: inherit;
    font-size: 0.9rem;
    box-sizing: border-box;
  }

  .report-dialog textarea:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }

  .report-dialog__actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  .report-dialog__actions button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding-inline: 1.25rem;
    border-radius: 0.5rem;
    font: inherit;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    transition: background-color 180ms var(--ease-out);
  }

  .report-dialog__actions button[type='button']:first-child {
    border: 1px solid var(--line-soft);
    background: var(--surface);
    color: var(--ink);
  }

  .report-dialog__actions button[type='button']:first-child:hover {
    background: var(--surface-muted);
  }

  .report-dialog__actions button:last-child {
    border: 0;
    background: var(--signal);
    color: var(--surface);
  }

  .report-dialog__actions button:last-child:hover {
    opacity: 0.9;
  }
</style>
