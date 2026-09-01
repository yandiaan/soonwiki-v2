<script lang="ts">
  import { createBrowserSupabase } from '@/lib/supabase/browser';

  import type { AdminInvitationRow } from '@/lib/server/admin-repository';

  let { invitations: initialInvitations }: { invitations: AdminInvitationRow[] } = $props();

  let invitations = $state([...initialInvitations]);
  let label = $state('');
  let creating = $state(false);
  let newLink = $state('');
  let errorMessage = $state('');

  async function getAccessToken(): Promise<string | null> {
    const supabase = createBrowserSupabase();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }

  async function callInvitationsFunction(body: Record<string, string>): Promise<Response | null> {
    const token = await getAccessToken();

    if (!token) {
      errorMessage = 'Sesi kamu berakhir, silakan masuk lagi.';
      return null;
    }

    return fetch(`${import.meta.env.PUBLIC_SUPABASE_URL}/functions/v1/invitations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  }

  async function createInvitation() {
    const trimmed = label.trim();

    if (!trimmed) {
      return;
    }

    creating = true;
    errorMessage = '';
    newLink = '';

    const response = await callInvitationsFunction({ action: 'create', label: trimmed });

    if (!response) {
      creating = false;
      return;
    }

    if (!response.ok) {
      errorMessage = 'Gagal membuat tautan undangan.';
      creating = false;
      return;
    }

    const result = (await response.json()) as { rawToken: string; invitationId: string };
    const origin =
      typeof window !== 'undefined' ? window.location.origin : import.meta.env.PUBLIC_SITE_URL;
    newLink = `${origin}/join/${result.rawToken}`;
    invitations = [
      {
        id: result.invitationId,
        label: trimmed,
        status: 'active',
        createdAt: new Date().toISOString(),
        revokedAt: null,
      },
      ...invitations,
    ];
    label = '';
    creating = false;
  }

  async function revokeInvitation(id: string) {
    const response = await callInvitationsFunction({ action: 'revoke', invitationId: id });

    if (response?.ok) {
      invitations = invitations.map((invitation) =>
        invitation.id === id
          ? { ...invitation, status: 'revoked', revokedAt: new Date().toISOString() }
          : invitation,
      );
    }
  }
  let copied = $state(false);

  async function copyLink() {
    if (!newLink) return;
    await navigator.clipboard.writeText(newLink);
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 2500);
  }
</script>

<div class="admin-invitations">
  <form
    onsubmit={(event) => {
      event.preventDefault();
      void createInvitation();
    }}
  >
    <label>
      <span>Label undangan</span>
      <input type="text" bind:value={label} placeholder="Mis. Grup WhatsApp Komunitas SOON" />
    </label>
    <button type="submit" disabled={creating}>
      {creating ? 'Membuat…' : 'Buat tautan'}
    </button>
  </form>

  {#if newLink}
    <div class="new-link-card" role="status">
      <div class="new-link-header">
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <strong>Tautan Undangan Berhasil Dibuat!</strong>
      </div>
      <p class="new-link-note">
        Salin tautan ini sekarang untuk dibagikan ke group chat. Tautan lengkap tidak akan
        ditampilkan lagi setelah halaman dimuat ulang.
      </p>
      <div class="new-link-box">
        <code>{newLink}</code>
        <button type="button" class="btn-copy-link" onclick={copyLink}>
          {#if copied}
            <span>Tersalin!</span>
          {:else}
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
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            <span>Salin Tautan</span>
          {/if}
        </button>
      </div>
    </div>
  {/if}

  {#if errorMessage}
    <p role="alert">{errorMessage}</p>
  {/if}

  <table class="admin-invitations__table">
    <thead>
      <tr>
        <th>Label</th>
        <th>Status</th>
        <th>Dibuat</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {#each invitations as invitation (invitation.id)}
        <tr>
          <td>{invitation.label}</td>
          <td>{invitation.status === 'active' ? 'Aktif' : 'Dicabut'}</td>
          <td>{new Date(invitation.createdAt).toLocaleDateString('id-ID')}</td>
          <td>
            {#if invitation.status === 'active'}
              <button type="button" onclick={() => revokeInvitation(invitation.id)}>Cabut</button>
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .admin-invitations {
    display: grid;
    gap: 1rem;
  }

  .admin-invitations form {
    display: flex;
    flex-wrap: wrap;
    align-items: end;
    gap: 0.75rem;
  }

  .admin-invitations label {
    display: grid;
    gap: 0.25rem;
    font-size: 0.85rem;
    font-weight: 700;
  }

  .admin-invitations input {
    min-height: 44px;
    padding-inline: 0.75rem;
    border: 2px solid var(--ink);
    background: var(--paper);
    color: var(--ink);
  }

  .admin-invitations button {
    min-height: 44px;
    padding-inline: 1rem;
    border: 2px solid var(--ink);
    background: var(--ink);
    color: var(--paper);
    font-weight: 700;
  }

  .admin-invitations__table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
  }

  .admin-invitations__table th,
  .admin-invitations__table td {
    padding: 0.5rem;
    border-bottom: 1px solid var(--ink);
    text-align: left;
  }

  .admin-invitations__table td button {
    min-height: 32px;
    padding-inline: 0.6rem;
    background: var(--paper);
    color: var(--ink);
    font-weight: 700;
  }

  [role='alert'] {
    color: var(--signal);
  }

  .new-link-card {
    display: grid;
    gap: 0.5rem;
    padding: 1.25rem;
    border-radius: 0.75rem;
    background: color-mix(in srgb, #10b981 12%, var(--surface));
    border: 1.5px solid color-mix(in srgb, #10b981 40%, transparent);
    color: var(--ink);
  }

  .new-link-header {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    color: #059669;
    font-size: 0.95rem;
  }

  .new-link-note {
    margin: 0;
    font-size: 0.84rem;
    color: var(--ink-soft);
    line-height: 1.4;
  }

  .new-link-box {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.6rem;
    margin-top: 0.25rem;
  }

  .new-link-box code {
    flex: 1;
    min-width: 240px;
    padding: 0.6rem 0.85rem;
    background: var(--surface);
    border: 1px solid var(--line-soft);
    border-radius: 0.5rem;
    font-size: 0.88rem;
    color: var(--ink);
    word-break: break-all;
    user-select: all;
  }

  .btn-copy-link {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    min-height: 40px;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    border: none;
    background: var(--accent);
    color: var(--surface);
    font-size: 0.85rem;
    font-weight: 750;
    cursor: pointer;
    transition: background-color 150ms ease;
  }

  .btn-copy-link:hover {
    background: var(--accent-strong);
  }
</style>
