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
    newLink = `${import.meta.env.PUBLIC_SITE_URL}/join/${result.rawToken}`;
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
      <input type="text" bind:value={label} placeholder="Mis. Grup WhatsApp Batch 2020" />
    </label>
    <button type="submit" disabled={creating}>Buat tautan</button>
  </form>

  {#if newLink}
    <p role="status">
      Tautan baru (simpan sekarang, tidak akan tampil lagi): <code>{newLink}</code>
    </p>
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
</style>
