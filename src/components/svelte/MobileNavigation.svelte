<script lang="ts">
  import { paths } from '@/lib/shared/paths';

  let { currentPath }: { currentPath: string } = $props();

  const navItems = [
    {
      href: paths.home(),
      label: 'Beranda',
      icon: 'home',
      match: (p: string) => p === '/',
    },
    {
      href: paths.explore(),
      label: 'Jelajahi',
      icon: 'explore',
      match: (p: string) => p === '/explore' || p.startsWith('/explore'),
    },
    {
      href: paths.about(),
      label: 'Tentang',
      icon: 'about',
      match: (p: string) => p === '/#tentang',
    },
    {
      href: paths.login(),
      label: 'Masuk',
      icon: 'login',
      match: (p: string) => p === '/login' || p.startsWith('/login') || p.startsWith('/join'),
    },
  ];

  let activeIndex = $derived.by(() => {
    const idx = navItems.findIndex((item) => item.match(currentPath));
    return idx >= 0 ? idx : 0;
  });
</script>

<nav aria-label="Navigasi bawah mobile" class="mobile-dock">
  <div class="mobile-dock__capsule">
    <!-- Smooth Sliding Active Indicator Pill -->
    <div
      class="mobile-active-pill"
      style="transform: translate3d(calc({activeIndex} * 100%), 0, 0);"
      aria-hidden="true"
    ></div>

    <!-- Navigation Items -->
    {#each navItems as item, idx (item.href)}
      {@const isActive = idx === activeIndex}
      <a
        href={item.href}
        class="dock-item"
        class:is-active={isActive}
        aria-current={isActive ? 'page' : undefined}
        aria-label={item.label}
      >
        {#if item.icon === 'home'}
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
        {:else if item.icon === 'explore'}
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
        {:else if item.icon === 'about'}
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
        {:else if item.icon === 'login'}
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
        {/if}
        <span>{item.label}</span>
      </a>
    {/each}
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
      position: relative;
      pointer-events: auto;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      width: min(100%, 22rem);
      padding: 0.35rem;
      border-radius: 9999px;
      background: color-mix(in srgb, var(--surface) 86%, transparent);
      backdrop-filter: blur(28px) saturate(1.6);
      -webkit-backdrop-filter: blur(28px) saturate(1.6);
      border: 1px solid color-mix(in srgb, var(--ink) 12%, transparent);
      box-shadow:
        0 16px 40px -8px rgb(0 0 0 / 0.16),
        0 2px 6px 0 rgb(0 0 0 / 0.04);
    }

    /* Sliding Active Indicator Pill */
    .mobile-active-pill {
      position: absolute;
      top: 0.35rem;
      bottom: 0.35rem;
      left: 0.35rem;
      width: calc((100% - 0.7rem) / 4);
      border-radius: 9999px;
      background: var(--surface);
      box-shadow:
        0 3px 10px -2px rgb(0 0 0 / 0.12),
        0 1px 2px 0 rgb(0 0 0 / 0.06);
      pointer-events: none;
      z-index: 1;
      transition: transform 350ms cubic-bezier(0.19, 1, 0.22, 1);
    }

    .dock-item {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.15rem;
      min-height: 46px;
      padding: 0.35rem 0.25rem;
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
      transition: color 200ms ease;
    }

    .dock-icon {
      transition: transform 250ms cubic-bezier(0.19, 1, 0.22, 1);
    }

    .dock-item.is-active {
      color: var(--ink);
    }

    .dock-item.is-active .dock-icon {
      color: var(--accent);
      transform: scale(1.1);
    }

    .dock-item.is-active span {
      color: var(--ink);
    }
  }
</style>
