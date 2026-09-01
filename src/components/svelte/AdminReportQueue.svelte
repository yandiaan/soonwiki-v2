<script lang="ts">
  import { resolveReport } from '@/lib/server/admin-repository';
  import { createBrowserSupabase } from '@/lib/supabase/browser';

  import type { AdminReportRow } from '@/lib/server/admin-repository';

  let { reports: initialReports, adminUserId }: { reports: AdminReportRow[]; adminUserId: string } =
    $props();

  let reports = $state([...initialReports]);

  const reasonLabels: Record<string, string> = {
    incorrect_information: 'Informasi tidak tepat',
    inappropriate_content: 'Konten tidak pantas',
    impersonation: 'Meniru orang lain',
    other: 'Lainnya',
  };

  async function resolve(id: string, status: 'resolved' | 'dismissed') {
    const supabase = createBrowserSupabase();
    const result = await resolveReport(supabase, id, status, adminUserId);

    if (result.ok) {
      reports = reports.map((report) => (report.id === id ? { ...report, status } : report));
    }
  }
</script>

<ul class="admin-reports">
  {#each reports as report (report.id)}
    <li>
      <p class="admin-reports__reason">{reasonLabels[report.reason] ?? report.reason}</p>
      {#if report.description}
        <p>{report.description}</p>
      {/if}
      <p class="admin-reports__meta">
        Status: {report.status} · {new Date(report.createdAt).toLocaleDateString('id-ID')}
      </p>
      {#if report.status === 'open'}
        <div class="admin-reports__actions">
          <button type="button" onclick={() => resolve(report.id, 'resolved')}
            >Tandai selesai</button
          >
          <button type="button" onclick={() => resolve(report.id, 'dismissed')}>Abaikan</button>
        </div>
      {/if}
    </li>
  {/each}
  {#if reports.length === 0}
    <li>Tidak ada laporan.</li>
  {/if}
</ul>

<style>
  .admin-reports {
    display: grid;
    gap: 1rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .admin-reports li {
    display: grid;
    gap: 0.35rem;
    padding: 1rem;
    border: 2px solid var(--ink);
  }

  .admin-reports__reason {
    margin: 0;
    font-weight: 800;
  }

  .admin-reports__meta {
    margin: 0;
    font-size: 0.8rem;
    color: var(--cobalt);
  }

  .admin-reports__actions {
    display: flex;
    gap: 0.5rem;
  }

  .admin-reports__actions button {
    min-height: 44px;
    padding-inline: 0.85rem;
    border: 2px solid var(--ink);
    background: var(--paper);
    font-weight: 700;
  }
</style>
