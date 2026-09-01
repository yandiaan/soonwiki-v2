<script lang="ts">
  import { onMount, tick } from 'svelte';

  export type TabKey = 'identity' | 'story' | 'journey' | 'moments' | 'links';

  export interface TourStep {
    selector: string;
    tab?: TabKey;
    badge: string;
    icon: string;
    title: string;
    description: string;
    tip: string;
    placement?: 'bottom' | 'top' | 'left' | 'right' | 'auto';
  }

  const TOUR_STEPS: TourStep[] = [
    {
      selector: '[data-tour="photo-upload"]',
      tab: 'identity',
      badge: 'Langkah 1 dari 7',
      icon: '📸',
      title: 'Pasang Foto Portrait Terbaikmu',
      description:
        'Foto 1:1 dengan senyum ramah paling mantap di sini! Format JPG, PNG, atau WebP otomatis dikompresi agar cepat diakses.',
      tip: '💡 Boleh foto formal santai atau candid dokumenter yang mencerminkan dirimu.',
      placement: 'bottom',
    },
    {
      selector: '[data-tour="identity-fields"]',
      tab: 'identity',
      badge: 'Langkah 2 dari 7',
      icon: '🏷️',
      title: 'Nama & Angkatan SOON',
      description:
        'Tulis nama panggilan akrab dan tahun angkatan SOON-mu. Masukkan juga peran atau kesibukan yang lagi kamu jalani saat ini.',
      tip: '💡 Ini kartu pengenal utamamu agar sesama SoonMates mudah menemukan dan mengenali kamu.',
      placement: 'bottom',
    },
    {
      selector: '[data-tour="story-prompts"]',
      tab: 'story',
      badge: 'Langkah 3 dari 7',
      icon: '✍️',
      title: 'Ceritakan Titik Balik & Refleksi',
      description:
        'Gak usah kaku kayak nulis CV! Tulis santai tentang perubahan cara pandangmu sejak di SOON dan keputusan penting yang mengubah arah hidupmu.',
      tip: '💡 Cerita yang autentik dan apa adanya selalu jadi yang paling berkesan.',
      placement: 'bottom',
    },
    {
      selector: '[data-tour="journey-section"]',
      tab: 'journey',
      badge: 'Langkah 4 dari 7',
      icon: '🛤️',
      title: 'Rangkai Jejak Perjalananmu',
      description:
        'Pernah magang, ganti karir, bikin startup, atau lanjut studi? Susun babak-babak hidupmu di sini. Gunakan tombol naik/turun untuk merapikan urutan kronologi.',
      tip: '💡 Satu per satu aja, gak harus langsung semua terisi sekarang.',
      placement: 'bottom',
    },
    {
      selector: '[data-tour="moments-section"]',
      tab: 'moments',
      badge: 'Langkah 5 dari 7',
      icon: '🏆',
      title: 'Showcase Karya & Kebanggaan',
      description:
        'Pernah rilis karya, proyek open-source, buku, atau inisiatif sosial? Upload foto dokumentasinya dan cantumkan link portofoliomu di sini!',
      tip: '💡 Setiap karya berharga dan bisa jadi inspirasi bagi adik tingkat dan rekan alumni.',
      placement: 'bottom',
    },
    {
      selector: '[data-tour="links-section"]',
      tab: 'links',
      badge: 'Langkah 6 dari 7',
      icon: '🌐',
      title: 'Bidang, Tautan & Publikasi',
      description:
        'Pilih bidang yang kamu tekuni, pasang link LinkedIn/Instagram, lalu nyalakan toggle "Terbit ke Publik" agar profilmu tayang di direktori SoonWiki!',
      tip: '💡 Profil yang terbit akan masuk ke penelusuran publik SoonWiki.',
      placement: 'bottom',
    },
    {
      selector: '[data-tour="live-preview"]',
      badge: 'Langkah 7 dari 7',
      icon: '✨',
      title: 'Live Preview Real-Time & Auto-Save',
      description:
        'Setiap huruf yang kamu ketik langsung berubah jadi kartu profil keren di panel ini! Drafmu otomatis aman tersimpan di browser.',
      tip: '💡 Kapan pun siap, klik "Simpan Profil" di bar bawah atau tekan tombol shortcut Ctrl+S / Cmd+S.',
      placement: 'left',
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
  let targetRect = $state<{ x: number; y: number; width: number; height: number } | null>(null);
  let popoverStyle = $state('');

  const currentStep = $derived(TOUR_STEPS[stepIndex] ?? TOUR_STEPS[0]);

  async function updateSpotlightPosition() {
    if (!isOpen) return;

    await tick();
    const selector = currentStep.selector;
    let target = document.querySelector(selector) as HTMLElement | null;

    // If target is inside preview and on mobile preview is closed, fallback to studio tabs
    if (!target && selector === '[data-tour="live-preview"]') {
      target = document.querySelector('[data-tour="save-bar"]') as HTMLElement | null;
    }

    if (!target) {
      targetRect = null;
      popoverStyle = 'top: 50%; left: 50%; transform: translate(-50%, -50%);';
      return;
    }

    // Scroll into view smoothly
    target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });

    // Wait a brief tick for smooth scroll to initiate
    const rect = target.getBoundingClientRect();
    const pad = 10;
    const x = Math.max(4, rect.left - pad);
    const y = Math.max(4, rect.top - pad);
    const width = Math.min(window.innerWidth - 8, rect.width + pad * 2);
    const height = rect.height + pad * 2;

    targetRect = { x, y, width, height };

    // Calculate popover coordinates
    const popoverWidth = Math.min(window.innerWidth - 32, 380);
    const placement = currentStep.placement || 'auto';

    // Decide vertical position
    let top: number;
    let left: number;

    const spaceBelow = window.innerHeight - (y + height);
    const spaceAbove = y;
    const spaceRight = window.innerWidth - (x + width);

    if (window.innerWidth < 768) {
      // Mobile positioning: center or pin to bottom/top
      if (spaceBelow > 260) {
        top = y + height + 16;
      } else if (spaceAbove > 260) {
        top = Math.max(16, y - 260);
      } else {
        top = window.innerHeight - 270;
      }
      left = (window.innerWidth - popoverWidth) / 2;
    } else if (placement === 'left' && x > popoverWidth + 24) {
      top = Math.max(20, Math.min(window.innerHeight - 280, y + 20));
      left = x - popoverWidth - 20;
    } else if (placement === 'right' && spaceRight > popoverWidth + 24) {
      top = Math.max(20, Math.min(window.innerHeight - 280, y + 20));
      left = x + width + 20;
    } else if (spaceBelow > 240) {
      top = y + height + 16;
      left = Math.max(16, Math.min(window.innerWidth - popoverWidth - 16, x));
    } else if (spaceAbove > 240) {
      top = Math.max(16, y - 250);
      left = Math.max(16, Math.min(window.innerWidth - popoverWidth - 16, x));
    } else {
      top = Math.max(16, (window.innerHeight - 260) / 2);
      left = Math.max(16, (window.innerWidth - popoverWidth) / 2);
    }

    popoverStyle = `top: ${Math.round(top)}px; left: ${Math.round(left)}px; width: ${popoverWidth}px;`;
  }

  async function goToStep(index: number) {
    if (index >= 0 && index < TOUR_STEPS.length) {
      stepIndex = index;
      const step = TOUR_STEPS[index];
      if (step?.tab) {
        onTabChange(step.tab);
      }
      setTimeout(updateSpotlightPosition, 100);
    }
  }

  function handleNext() {
    if (stepIndex < TOUR_STEPS.length - 1) {
      void goToStep(stepIndex + 1);
    } else {
      handleClose();
    }
  }

  function handlePrev() {
    if (stepIndex > 0) {
      void goToStep(stepIndex - 1);
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

  $effect(() => {
    if (isOpen) {
      const step = TOUR_STEPS[stepIndex];
      if (step?.tab) {
        onTabChange(step.tab);
      }
      void updateSpotlightPosition();
    }
  });

  onMount(() => {
    const handleReposition = () => {
      if (isOpen) {
        void updateSpotlightPosition();
      }
    };

    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, { passive: true });

    // Auto trigger on first visit if not seen
    const urlParams = new URLSearchParams(window.location.search);
    const isWelcome = urlParams.get('welcome') === '1';
    const hasSeen = localStorage.getItem('soonwiki_editor_tour_seen');

    if (isWelcome || !hasSeen) {
      setTimeout(() => {
        isOpen = true;
        void goToStep(0);
      }, 500);
    }

    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition);
    };
  });
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
  <div
    class="spotlight-tour-overlay"
    role="dialog"
    aria-modal="true"
    aria-labelledby="spotlight-title"
  >
    <!-- SVG Mask Backdrop with Rounded Cutout -->
    <svg class="spotlight-svg" aria-hidden="true">
      <defs>
        <mask id="spotlight-cutout-mask">
          <!-- White background covers everything -->
          <rect width="100%" height="100%" fill="white" />
          <!-- Black rectangle cuts a transparent hole for target element -->
          {#if targetRect}
            <rect
              x={targetRect.x}
              y={targetRect.y}
              width={targetRect.width}
              height={targetRect.height}
              rx="14"
              fill="black"
            />
          {/if}
        </mask>
      </defs>

      <!-- Masked dark overlay covering whole screen -->
      <rect
        width="100%"
        height="100%"
        fill="rgba(10, 14, 12, 0.75)"
        mask="url(#spotlight-cutout-mask)"
      />

      <!-- Glowing border outline around the spotlight hole -->
      {#if targetRect}
        <rect
          x={targetRect.x}
          y={targetRect.y}
          width={targetRect.width}
          height={targetRect.height}
          rx="14"
          fill="none"
          stroke="var(--accent)"
          stroke-width="3"
          class="spotlight-glow-rect"
        />
      {/if}
    </svg>

    <!-- Interactive Floating Popover Card -->
    <div class="tour-popover" style={popoverStyle}>
      <div class="popover-header">
        <span class="popover-badge">{currentStep.badge}</span>
        <button
          type="button"
          class="btn-popover-close"
          onclick={handleClose}
          aria-label="Tutup panduan tur"
        >
          ✕
        </button>
      </div>

      <div class="popover-body">
        <div class="popover-title-row">
          <span class="popover-icon">{currentStep.icon}</span>
          <h3 id="spotlight-title" class="popover-title">{currentStep.title}</h3>
        </div>
        <p class="popover-desc">{currentStep.description}</p>
        <div class="popover-tip">
          <p>{currentStep.tip}</p>
        </div>
      </div>

      <div class="popover-footer">
        <div class="popover-dots">
          {#each TOUR_STEPS as step, i (step.title)}
            <button
              type="button"
              class="dot-pill"
              class:is-active={i === stepIndex}
              onclick={() => goToStep(i)}
              aria-label={`Lompat ke langkah ${i + 1}`}
            ></button>
          {/each}
        </div>

        <div class="popover-nav-buttons">
          {#if stepIndex > 0}
            <button type="button" class="btn-popover-back" onclick={handlePrev}> ← Kembali </button>
          {:else}
            <button type="button" class="btn-popover-skip" onclick={handleClose}> Lewati </button>
          {/if}

          <button type="button" class="btn-popover-next" onclick={handleNext}>
            {stepIndex === TOUR_STEPS.length - 1 ? 'Mulai Mengisi! 🚀' : 'Lanjut →'}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .spotlight-tour-overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
    pointer-events: auto;
    overflow: hidden;
  }

  .spotlight-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: auto;
  }

  .spotlight-glow-rect {
    filter: drop-shadow(0 0 10px rgba(35, 55, 110, 0.65));
    animation: pulseGlow 2s ease-in-out infinite alternate;
  }

  @keyframes pulseGlow {
    from {
      stroke-opacity: 0.85;
      stroke-width: 2.5;
    }
    to {
      stroke-opacity: 1;
      stroke-width: 3.5;
      filter: drop-shadow(0 0 16px rgba(35, 55, 110, 0.9));
    }
  }

  .tour-popover {
    position: fixed;
    z-index: 101;
    background: var(--surface);
    border-radius: 1.25rem;
    border: 1px solid color-mix(in srgb, var(--accent) 35%, var(--line-soft));
    box-shadow:
      0 20px 48px -10px rgba(0, 0, 0, 0.35),
      0 4px 16px -2px rgba(0, 0, 0, 0.1);
    display: grid;
    gap: 0.85rem;
    padding: 1.35rem;
    transition:
      top 250ms cubic-bezier(0.16, 1, 0.3, 1),
      left 250ms cubic-bezier(0.16, 1, 0.3, 1),
      opacity 200ms ease;
    animation: popIn 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes popIn {
    from {
      opacity: 0;
      transform: scale(0.96);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .popover-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .popover-badge {
    padding: 0.25rem 0.65rem;
    border-radius: 9999px;
    background: var(--accent-soft);
    color: var(--accent);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .btn-popover-close {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: 1px solid var(--line-soft);
    background: var(--canvas);
    color: var(--ink-soft);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: 700;
    transition:
      background-color 150ms ease,
      color 150ms ease;
  }

  .btn-popover-close:hover {
    background: var(--surface-muted);
    color: var(--ink);
  }

  .popover-body {
    display: grid;
    gap: 0.65rem;
  }

  .popover-title-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .popover-icon {
    font-size: 1.35rem;
    flex-shrink: 0;
  }

  .popover-title {
    margin: 0;
    font-size: 1.12rem;
    font-weight: 750;
    letter-spacing: -0.02em;
    color: var(--ink);
    line-height: 1.25;
  }

  .popover-desc {
    margin: 0;
    font-size: 0.88rem;
    color: var(--ink-soft);
    line-height: 1.5;
  }

  .popover-tip {
    padding: 0.65rem 0.85rem;
    border-radius: 0.65rem;
    background: color-mix(in srgb, var(--accent-soft) 60%, var(--surface));
    border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
  }

  .popover-tip p {
    margin: 0;
    font-size: 0.8rem;
    color: var(--ink);
    line-height: 1.4;
    font-weight: 550;
  }

  .popover-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 0.75rem;
    border-top: 1px solid var(--line-soft);
    gap: 0.75rem;
  }

  .popover-dots {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .dot-pill {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    border: none;
    background: var(--line-soft);
    cursor: pointer;
    padding: 0;
    transition:
      width 180ms ease,
      background-color 180ms ease;
  }

  .dot-pill.is-active {
    width: 18px;
    border-radius: 9999px;
    background: var(--accent);
  }

  .popover-nav-buttons {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .btn-popover-back,
  .btn-popover-skip {
    padding: 0.45rem 0.8rem;
    border-radius: 0.55rem;
    border: 1px solid var(--line-soft);
    background: var(--surface);
    color: var(--ink-soft);
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    transition:
      background-color 150ms ease,
      color 150ms ease;
  }

  .btn-popover-back:hover,
  .btn-popover-skip:hover {
    background: var(--canvas);
    color: var(--ink);
  }

  .btn-popover-next {
    padding: 0.5rem 1rem;
    border-radius: 0.6rem;
    border: none;
    background: var(--accent);
    color: var(--surface);
    font-size: 0.82rem;
    font-weight: 750;
    cursor: pointer;
    box-shadow: 0 4px 10px -2px color-mix(in srgb, var(--accent) 45%, transparent);
    transition:
      background-color 150ms ease,
      transform 150ms var(--ease-out);
  }

  .btn-popover-next:hover {
    background: var(--accent-strong);
    transform: translateY(-1px);
  }
</style>
