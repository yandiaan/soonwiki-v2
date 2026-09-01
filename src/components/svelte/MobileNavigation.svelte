<script lang="ts">
  import { paths } from '@/lib/shared/paths';

  let { currentPath }: { currentPath: string } = $props();

  let isSurpriseSpinning = $state(false);

  function triggerSurprise() {
    isSurpriseSpinning = true;
    setTimeout(() => {
      isSurpriseSpinning = false;
    }, 600);
  }
</script>

<nav aria-label="Navigasi bawah mobile" class="mobile-dock">
  <div class="mobile-dock__capsule">
    <!-- 1. Beranda -->
    <a
      href={paths.home()}
      class="dock-item"
      class:is-active={currentPath === '/'}
      aria-current={currentPath === '/' ? 'page' : undefined}
      aria-label="Beranda"
    >
      <svg
        class="dock-icon"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
      <span>Beranda</span>
    </a>

    <!-- 2. Jelajahi -->
    <a
      href={paths.explore()}
      class="dock-item"
      class:is-active={currentPath === '/explore' || currentPath.startsWith('/explore')}
      aria-current={currentPath === '/explore' ? 'page' : undefined}
      aria-label="Jelajahi"
    >
      <svg
        class="dock-icon"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
      <span>Jelajahi</span>
    </a>

    <!-- 3. Element of Surprise: Center Surprise Button (Kisah Acak) -->
    <a
      href={paths.randomJourney()}
      class="dock-item dock-item--surprise"
      class:is-spinning={isSurpriseSpinning}
      onclick={triggerSurprise}
      aria-label="Kisah Acak (Kejutan)"
      title="Buka kisah Soonies secara acak"
    >
      <div class="surprise-bubble">
        <svg
          class="surprise-icon"
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z"
          />
        </svg>
      </div>
      <span class="surprise-label">Acak</span>
    </a>

    <!-- 4. Tentang -->
    <a
      href={paths.about()}
      class="dock-item"
      class:is-active={currentPath === '/#tentang'}
      aria-label="Tentang SoonWiki"
    >
      <svg
        class="dock-icon"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
      <span>Tentang</span>
    </a>

    <!-- 5. Masuk -->
    <a
      href={paths.login()}
      class="dock-item"
      class:is-active={currentPath === '/login' || currentPath.startsWith('/login')}
      aria-current={currentPath === '/login' ? 'page' : undefined}
      aria-label="Masuk ke Akun"
    >
      <svg
        class="dock-icon"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
      <span>Masuk</span>
    </a>
  </div>
</nav>

<style>
  .mobile-dock {
    display: none;
  }

  @media (max-width: 768px) {
    .mobile-dock {
      position: fixed;
      inset-inline: 0;
      bottom: calc(1rem + env(safe-area-inset-bottom, 0));
      z-index: 50;
      display: flex;
      justify-content: center;
      padding-inline: 1rem;
      pointer-events: none;
    }

    .mobile-dock__capsule {
      pointer-events: auto;
      display: flex;
      align-items: center;
      justify-content: space-around;
      gap: 0.25rem;
      width: min(100%, 24rem);
      padding: 0.4rem 0.5rem;
      border-radius: 9999px;
      background: color-mix(in srgb, var(--surface) 86%, transparent);
      backdrop-filter: blur(28px) saturate(1.6);
      -webkit-backdrop-filter: blur(28px) saturate(1.6);
      border: 1px solid color-mix(in srgb, var(--ink) 12%, transparent);
      box-shadow:
        0 16px 40px -8px rgb(0 0 0 / 0.16),
        0 2px 6px 0 rgb(0 0 0 / 0.04);
    }

    .dock-item {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.2rem;
      min-width: 48px;
      min-height: 48px;
      padding: 0.35rem 0.45rem;
      border-radius: 9999px;
      color: var(--ink-soft);
      text-decoration: none;
      transition:
        color 200ms ease,
        transform 200ms cubic-bezier(0.19, 1, 0.22, 1);
      -webkit-tap-highlight-color: transparent;
    }

    .dock-item:active {
      transform: scale(0.92);
    }

    .dock-item span {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: -0.01em;
    }

    .dock-icon {
      transition: transform 200ms cubic-bezier(0.19, 1, 0.22, 1);
    }

    .dock-item.is-active {
      color: var(--accent);
    }

    .dock-item.is-active .dock-icon {
      transform: scale(1.12);
    }

    /* Center Surprise Action Pod */
    .dock-item--surprise {
      transform: translateY(-4px);
    }

    .surprise-bubble {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: linear-gradient(
        135deg,
        var(--accent),
        color-mix(in srgb, var(--accent) 70%, #ff7b54)
      );
      color: var(--surface);
      box-shadow: 0 4px 14px 0 color-mix(in srgb, var(--accent) 45%, transparent);
      transition:
        transform 300ms cubic-bezier(0.19, 1, 0.22, 1),
        box-shadow 300ms ease;
    }

    .dock-item--surprise:active .surprise-bubble {
      transform: scale(0.88);
    }

    .surprise-label {
      color: var(--accent) !important;
      font-weight: 800 !important;
    }

    .dock-item--surprise.is-spinning .surprise-icon {
      animation: surprise-spin 600ms cubic-bezier(0.19, 1, 0.22, 1);
    }

    @keyframes surprise-spin {
      0% {
        transform: rotate(0deg) scale(1);
      }
      50% {
        transform: rotate(180deg) scale(1.25);
      }
      100% {
        transform: rotate(360deg) scale(1);
      }
    }
  }
</style>
