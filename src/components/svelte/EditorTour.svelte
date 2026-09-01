<script lang="ts">
  import { onMount } from 'svelte';

  export type TabKey = 'identity' | 'story' | 'journey' | 'moments' | 'links';

  interface TourStep {
    tab: TabKey;
    badge: string;
    title: string;
    icon: string;
    description: string;
    tip: string;
  }

  const TOUR_STEPS: TourStep[] = [
    {
      tab: 'identity',
      badge: 'Langkah 1 dari 6',
      icon: '📸',
      title: 'Identitas & Foto Diri',
      description:
        'Pasang foto portrait terbaikmu! Isi nama lengkap atau nama panggilan akrab dan tahun angkatan SOON. Ini bakal jadi kartu pengenal utamamu.',
      tip: '💡 Tips: Foto dengan rasio kotak (1:1) dan wajah tersenyum jelas paling enak dilihat.',
    },
    {
      tab: 'story',
      badge: 'Langkah 2 dari 6',
      icon: '✍️',
      title: 'Narasi & Refleksi Hidup',
      description:
        'Gak usah kaku kayak nulis CV formal! Tulis santai tentang apa yang berubah dalam caramu memandang dunia sejak di SOON, dan titik balik yang mengubah arah hidupmu.',
      tip: '💡 Tips: Cerita yang jujur dan apa adanya selalu jadi yang paling inspiratif bagi sesama SoonMates.',
    },
    {
      tab: 'journey',
      badge: 'Langkah 3 dari 6',
      icon: '🛤️',
      title: 'Jejak Perjalanan (Timeline)',
      description:
        'Pernah magang, ganti haluan karir, bikin usaha sendiri, atau kuliah lagi? Rangkai babak-babak penting hidupmu di sini. Satu per satu aja, gak harus langsung komplit.',
      tip: '💡 Tips: Gunakan tombol naik/turun untuk merapikan urutan kronologi perjalananmu.',
    },
    {
      tab: 'moments',
      badge: 'Langkah 4 dari 6',
      icon: '🏆',
      title: 'Karya & Momen Kebanggaan',
      description:
        'Showcase hal-hal bermakna yang pernah kamu wujudkan: rilis buku, proyek open-source, pameran seni, inovasi riset, atau inisiatif sosial. Kamu juga bisa lampirkan foto dokumentasi!',
      tip: '💡 Tips: Tambahkan link ke Behance, GitHub, artikel berita, atau website karyamu.',
    },
    {
      tab: 'links',
      badge: 'Langkah 5 dari 6',
      icon: '🌐',
      title: 'Bidang, Jejaring & Publikasi',
      description:
        'Pilih bidang-bidang yang kamu tekuni dan pasang tautan LinkedIn atau Instagram agar teman lintas angkatan bisa saling terhubung.',
      tip: '💡 Tips: Pastikan toggle "Terbitkan ke Publik" aktif agar profilmu bisa ditemukan di direktori!',
    },
    {
      tab: 'identity',
      badge: 'Langkah 6 dari 6',
      icon: '✨',
      title: 'Live Preview & Otomatis Aman!',
      description:
        'Lihat panel di sebelah kanan? Setiap huruf yang kamu ketik langsung berubah jadi kartu profil keren secara real-time. Tenang, drafmu otomatis tersimpan di HP/laptop ini!',
      tip: '💡 Tips: Kapan pun siap, klik tombol "Simpan Profil" di bar bawah atau cukup tekan Ctrl+S / Cmd+S.',
    },
  ];

  let {
    isOpen = $bindable(false),
    onTabChange,
  }: {
    isOpen: boolean;
    onTabChange: (tab: TabKey) => void;
  } = $props();

  let stepIndex = $state(0);

  const currentStep = $derived(TOUR_STEPS[stepIndex] ?? TOUR_STEPS[0]);

  function goToStep(index: number) {
    if (index >= 0 && index < TOUR_STEPS.length) {
      stepIndex = index;
      const next = TOUR_STEPS[index];
      if (next) {
        onTabChange(next.tab);
      }
    }
  }

  function handleNext() {
    if (stepIndex < TOUR_STEPS.length - 1) {
      goToStep(stepIndex + 1);
    } else {
      handleClose();
    }
  }

  function handlePrev() {
    if (stepIndex > 0) {
      goToStep(stepIndex - 1);
    }
  }

  function handleClose() {
    isOpen = false;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('soonwiki_editor_tour_seen', 'true');
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!isOpen) return;
    if (event.key === 'Escape') {
      handleClose();
    } else if (event.key === 'ArrowRight') {
      handleNext();
    } else if (event.key === 'ArrowLeft') {
      handlePrev();
    }
  }

  onMount(() => {
    // Auto trigger on first visit if not seen
    const urlParams = new URLSearchParams(window.location.search);
    const isWelcome = urlParams.get('welcome') === '1';
    const hasSeen = localStorage.getItem('soonwiki_editor_tour_seen');

    if (isWelcome || !hasSeen) {
      isOpen = true;
      const initial = TOUR_STEPS[0];
      if (initial) {
        onTabChange(initial.tab);
      }
    }
  });
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
  <div class="tour-backdrop" role="dialog" aria-modal="true" aria-labelledby="tour-title">
    <div class="tour-card" data-reveal>
      <!-- Header with Icon & Close -->
      <div class="tour-card__header">
        <div class="step-indicator">
          <span class="step-badge">{currentStep.badge}</span>
        </div>
        <button
          type="button"
          class="btn-close-tour"
          onclick={handleClose}
          aria-label="Tutup panduan tur"
        >
          ✕
        </button>
      </div>

      <!-- Content Body -->
      <div class="tour-card__body">
        <div class="step-icon-bubble">
          <span>{currentStep.icon}</span>
        </div>

        <h3 id="tour-title" class="step-title">{currentStep.title}</h3>
        <p class="step-desc">{currentStep.description}</p>

        <div class="step-tip-box">
          <p>{currentStep.tip}</p>
        </div>
      </div>

      <!-- Footer with Progress Dots & Nav Buttons -->
      <div class="tour-card__footer">
        <div class="progress-dots">
          {#each TOUR_STEPS as step, i (step.title)}
            <button
              type="button"
              class="dot-btn"
              class:is-active={i === stepIndex}
              onclick={() => goToStep(i)}
              aria-label={`Lompat ke langkah ${i + 1}`}
            ></button>
          {/each}
        </div>

        <div class="footer-buttons">
          {#if stepIndex > 0}
            <button type="button" class="btn-tour-secondary" onclick={handlePrev}>
              ← Kembali
            </button>
          {:else}
            <button type="button" class="btn-tour-secondary" onclick={handleClose}>
              Lewati Tur
            </button>
          {/if}

          <button type="button" class="btn-tour-primary" onclick={handleNext}>
            {stepIndex === TOUR_STEPS.length - 1 ? 'Mulai Mengisi! 🚀' : 'Lanjut →'}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .tour-backdrop {
    position: fixed;
    inset: 0;
    z-index: 100;
    background: rgba(18, 21, 20, 0.65);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.25rem;
    animation: fadeIn 200ms ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .tour-card {
    width: min(100%, 30rem);
    background: var(--surface);
    border-radius: 1.5rem;
    border: 1px solid var(--line-soft);
    box-shadow:
      0 24px 60px -12px rgba(18, 21, 20, 0.25),
      0 4px 16px -2px rgba(18, 21, 20, 0.08);
    display: grid;
    gap: 1.25rem;
    padding: 1.75rem;
    overflow: hidden;
    position: relative;
    animation: slideUp 250ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(16px) scale(0.97);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .tour-card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .step-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.3rem 0.75rem;
    border-radius: 9999px;
    background: var(--accent-soft);
    color: var(--accent);
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .btn-close-tour {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid var(--line-soft);
    background: var(--canvas);
    color: var(--ink-soft);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 700;
    transition:
      background-color 150ms ease,
      color 150ms ease;
  }

  .btn-close-tour:hover {
    background: var(--surface-muted);
    color: var(--ink);
  }

  .tour-card__body {
    display: grid;
    gap: 0.85rem;
  }

  .step-icon-bubble {
    width: 54px;
    height: 54px;
    border-radius: 1rem;
    background: var(--canvas);
    border: 1px solid var(--line-soft);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.85rem;
  }

  .step-title {
    margin: 0;
    font-size: 1.35rem;
    font-weight: 750;
    letter-spacing: -0.025em;
    color: var(--ink);
    line-height: 1.2;
  }

  .step-desc {
    margin: 0;
    font-size: 0.95rem;
    color: var(--ink-soft);
    line-height: 1.55;
  }

  .step-tip-box {
    padding: 0.85rem 1rem;
    border-radius: 0.75rem;
    background: color-mix(in srgb, var(--accent-soft) 50%, var(--surface));
    border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
  }

  .step-tip-box p {
    margin: 0;
    font-size: 0.82rem;
    color: var(--ink);
    line-height: 1.45;
    font-weight: 550;
  }

  .tour-card__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 1rem;
    border-top: 1px solid var(--line-soft);
    gap: 1rem;
  }

  .progress-dots {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .dot-btn {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: none;
    background: var(--line-soft);
    cursor: pointer;
    padding: 0;
    transition:
      width 200ms ease,
      background-color 200ms ease,
      border-radius 200ms ease;
  }

  .dot-btn.is-active {
    width: 22px;
    border-radius: 9999px;
    background: var(--accent);
  }

  .footer-buttons {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .btn-tour-secondary {
    padding: 0.6rem 1rem;
    border-radius: 0.65rem;
    border: 1px solid var(--line-soft);
    background: var(--surface);
    color: var(--ink-soft);
    font-size: 0.86rem;
    font-weight: 700;
    cursor: pointer;
    transition:
      background-color 150ms ease,
      color 150ms ease;
  }

  .btn-tour-secondary:hover {
    background: var(--canvas);
    color: var(--ink);
  }

  .btn-tour-primary {
    padding: 0.6rem 1.25rem;
    border-radius: 0.65rem;
    border: none;
    background: var(--accent);
    color: var(--surface);
    font-size: 0.86rem;
    font-weight: 750;
    cursor: pointer;
    box-shadow: 0 4px 12px -2px color-mix(in srgb, var(--accent) 45%, transparent);
    transition:
      background-color 150ms ease,
      transform 150ms var(--ease-out);
  }

  .btn-tour-primary:hover {
    background: var(--accent-strong);
    transform: translateY(-1px);
  }
</style>
