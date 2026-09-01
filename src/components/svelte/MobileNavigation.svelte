<script lang="ts">
  import { onMount } from 'svelte';
  import { paths } from '@/lib/shared/paths';

  let {
    currentPath,
    isLoggedIn = false,
    userRole,
  }: {
    currentPath: string;
    isLoggedIn?: boolean;
    userRole?: string | undefined;
  } = $props();

  let isHidden = $state(false);

  const navItems = $derived.by(() => {
    return [
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
        match: (p: string) =>
          p.startsWith('/explore') ||
          p.startsWith('/people') ||
          p.startsWith('/field') ||
          p.startsWith('/batch') ||
          p.startsWith('/place'),
      },
      {
        href: paths.memories(),
        label: 'Kenangan',
        icon: 'memories',
        match: (p: string) => p.startsWith('/memories'),
      },
      isLoggedIn
        ? {
            href: paths.me(),
            label: userRole === 'admin' ? 'Profil' : 'Profilku',
            icon: 'profile',
            isAdmin: userRole === 'admin',
            match: (p: string) =>
              p.startsWith('/me') || p.startsWith('/admin') || p.startsWith('/feedback'),
          }
        : {
            href: paths.login(),
            label: 'Masuk',
            icon: 'login',
            match: (p: string) => p.startsWith('/login') || p.startsWith('/join'),
          },
    ];
  });

  let activeIndex = $derived.by(() => {
    const idx = navItems.findIndex((item) => item.match(currentPath));
    return idx >= 0 ? idx : 0;
  });

  onMount(() => {
    let lastScrollY = window.scrollY;

    function handleScroll() {
      const scrollY = window.scrollY;
      if (scrollY > 75 && scrollY > lastScrollY + 6) {
        if (!isHidden) isHidden = true;
      } else if (scrollY < lastScrollY - 6 || scrollY <= 75) {
        if (isHidden) isHidden = false;
      }
      lastScrollY = Math.max(0, scrollY);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  });
</script>

{#if !currentPath.startsWith('/me/edit')}
  <nav aria-label="Navigasi bawah mobile" class="mobile-dock" class:is-hidden={isHidden}>
    <div class="mobile-dock__capsule">
      <!-- Smooth Magnetic Active Indicator Pill -->
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
          <span class="dock-icon-wrapper">
            {#if item.icon === 'home'}
              <!-- House / Home -->
              <svg
                class="dock-icon"
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                stroke-width="1.85"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M3 10.5L12 3l9 7.5v10a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 20.5z" />
                <path d="M9 22V12h6v10" />
              </svg>
            {:else if item.icon === 'explore'}
              <!-- Compass -->
              <svg
                class="dock-icon"
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                stroke-width="1.85"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="9.25" />
                <polygon
                  points="15.8 8.2 13.5 13.5 8.2 15.8 10.5 10.5"
                  fill={isActive ? 'currentColor' : 'none'}
                />
                <circle cx="12" cy="12" r="1.2" fill="currentColor" />
              </svg>
            {:else if item.icon === 'memories'}
              <!-- Gallery Photo / Memory Frame -->
              <svg
                class="dock-icon"
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                stroke-width="1.85"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="4" />
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            {:else if item.icon === 'profile'}
              <!-- User Profile / Avatar -->
              <div class="profile-icon-wrap">
                <svg
                  class="dock-icon"
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.85"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {#if item.isAdmin}
                  <span class="admin-dot" title="Akses Admin" aria-hidden="true"></span>
                {/if}
              </div>
            {:else if item.icon === 'login'}
              <!-- Sign In / Log In Key -->
              <svg
                class="dock-icon"
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                stroke-width="1.85"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
            {/if}
          </span>
          <span class="dock-label">{item.label}</span>
        </a>
      {/each}
    </div>
  </nav>
{/if}

<style>
  .mobile-dock {
    display: none;
  }

  @media (max-width: 768px) {
    .mobile-dock {
      position: fixed;
      inset-inline: 0;
      bottom: calc(0.85rem + env(safe-area-inset-bottom, 0px));
      z-index: 50;
      display: flex;
      justify-content: center;
      padding-inline: 1rem;
      pointer-events: none;
      transition:
        transform 360ms cubic-bezier(0.16, 1, 0.3, 1),
        opacity 300ms ease;
    }

    .mobile-dock.is-hidden {
      transform: translateY(140%);
      opacity: 0;
      pointer-events: none;
    }

    .mobile-dock__capsule {
      pointer-events: auto;
      position: relative;
      display: flex;
      align-items: center;
      background: color-mix(in srgb, var(--surface) 88%, transparent);
      backdrop-filter: blur(28px) saturate(180%);
      -webkit-backdrop-filter: blur(28px) saturate(180%);
      border: 1px solid color-mix(in srgb, var(--ink) 12%, transparent);
      border-radius: 9999px;
      padding: 0.3rem 0.35rem;
      box-shadow:
        0 16px 36px -8px rgba(18, 21, 20, 0.22),
        0 0 0 1px color-mix(in srgb, var(--surface) 60%, transparent) inset;
      width: min(100%, 22rem);
    }

    .mobile-active-pill {
      position: absolute;
      left: 0.35rem;
      top: 0.3rem;
      bottom: 0.3rem;
      width: calc((100% - 0.7rem) / 4);
      border-radius: 9999px;
      background: var(--ink);
      box-shadow: 0 4px 14px rgba(18, 21, 20, 0.25);
      pointer-events: none;
      transition: transform 380ms cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 1;
    }

    .dock-item {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.16rem;
      padding: 0.45rem 0.2rem;
      width: 25%;
      text-decoration: none;
      color: var(--ink-soft);
      border-radius: 9999px;
      transition:
        color 220ms ease,
        transform 220ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    .dock-item:active {
      transform: scale(0.92);
    }

    .dock-item.is-active {
      color: #ffffff;
    }

    .dock-icon-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }

    .profile-icon-wrap {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .admin-dot {
      position: absolute;
      top: -1px;
      right: -3px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #3b82f6;
      border: 1px solid var(--surface);
    }

    .dock-icon {
      transition: transform 260ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    .dock-item.is-active .dock-icon {
      transform: scale(1.08);
    }

    .dock-label {
      font-size: 0.65rem;
      font-weight: 750;
      letter-spacing: 0.015em;
      line-height: 1;
      text-transform: capitalize;
    }
  }
</style>
