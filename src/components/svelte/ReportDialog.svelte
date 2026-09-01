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
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--signal);
    background: none;
    border: none;
  }

  .report-dialog {
    max-width: 28rem;
    padding: 1.25rem;
    border: 2px solid var(--ink);
    background: var(--paper);
    color: var(--ink);
  }

  .report-dialog[open] {
    display: grid;
    gap: 0.75rem;
  }

  .report-dialog::backdrop {
    background: color-mix(in srgb, var(--ink) 60%, transparent);
  }

  .report-dialog fieldset {
    display: grid;
    gap: 0.4rem;
    padding: 0;
    border: none;
  }

  .report-dialog label {
    display: grid;
    gap: 0.25rem;
    font-size: 0.85rem;
  }

  .report-dialog textarea {
    min-height: 3rem;
    padding: 0.5rem;
    border: 2px solid var(--ink);
    font: inherit;
  }

  .report-dialog__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .report-dialog__actions button {
    min-height: 44px;
    padding-inline: 1rem;
    border: 2px solid var(--ink);
    background: var(--paper);
    font-weight: 700;
  }
</style>
