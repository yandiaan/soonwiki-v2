<script lang="ts">
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

  const navItems = $derived.by(() => {
    if (isLoggedIn) {
      if (userRole === 'admin') {
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
            match: (p: string) => p === '/explore' || p.startsWith('/explore'),
          },
          {
            href: paths.memories(),
            label: 'Kenangan',
            icon: 'memories',
            match: (p: string) => p === '/memories' || p.startsWith('/memories'),
          },
          {
            href: paths.admin(),
            label: 'Admin',
            icon: 'admin',
            match: (p: string) => p === '/admin' || p.startsWith('/admin'),
          },
          {
            href: paths.me(),
            label: 'Profilku',
            icon: 'profile',
            match: (p: string) => p === '/me' || p.startsWith('/me'),
          },
        ];
      }

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
          match: (p: string) => p === '/explore' || p.startsWith('/explore'),
        },
        {
          href: paths.memories(),
          label: 'Kenangan',
          icon: 'memories',
          match: (p: string) => p === '/memories' || p.startsWith('/memories'),
        },
        {
          href: paths.feedback(),
          label: 'Masukan',
          icon: 'feedback',
          match: (p: string) => p === '/feedback' || p.startsWith('/feedback'),
        },
        {
          href: paths.me(),
          label: 'Profilku',
          icon: 'profile',
          match: (p: string) => p === '/me' || p.startsWith('/me'),
        },
      ];
    }

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
        match: (p: string) => p === '/explore' || p.startsWith('/explore'),
      },
      {
        href: paths.memories(),
        label: 'Kenangan',
        icon: 'memories',
        match: (p: string) => p === '/memories' || p.startsWith('/memories'),
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
  });

  let activeIndex = $derived.by(() => {
    const idx = navItems.findIndex((item) => item.match(currentPath));
    return idx >= 0 ? idx : 0;
  });
</script>

{#if !currentPath.startsWith('/me/edit')}
  <nav aria-label="Navigasi bawah mobile" class="mobile-dock">
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
              <!-- Editorial House / Home Architecture -->
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
              <!-- Bespoke Editorial Compass / Discovery Lens -->
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
                  fill={isActive ? 'var(--accent-soft)' : 'none'}
                />
                <circle cx="12" cy="12" r="1.2" fill="currentColor" />
              </svg>
            {:else if item.icon === 'memories'}
              <!-- Memory Gallery / Photo Album -->
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
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            {:else if item.icon === 'about'}
              <!-- Open Editorial Storybook / Archive Journal -->
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
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                <line x1="9" y1="7" x2="16" y2="7" />
                <line x1="9" y1="11" x2="14" y2="11" />
              </svg>
            {:else if item.icon === 'admin'}
              <!-- Admin Shield / Security Aura -->
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
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            {:else if item.icon === 'profile' || item.icon === 'login'}
              <!-- Member Silhouette with Keyhole Aura -->
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
            {:else if item.icon === 'feedback'}
              <!-- Editorial Feedback Message Box -->
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
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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
      bottom: calc(0.9rem + env(safe-area-inset-bottom, 0px));
      z-index: 50;
      display: flex;
      justify-content: center;
      padding-inline: 1rem;
      pointer-events: none;
    }

    .mobile-dock__capsule {
      pointer-events: auto;
      position: relative;
      display: flex;
      align-items: center;
      background: color-mix(in srgb, var(--surface) 86%, transparent);
      backdrop-filter: blur(28px) saturate(180%);
      -webkit-backdrop-filter: blur(28px) saturate(180%);
      border: 1px solid color-mix(in srgb, var(--ink) 12%, transparent);
      border-radius: 9999px;
      padding: 0.35rem 0.4rem;
      box-shadow:
        0 16px 36px -8px rgba(18, 21, 20, 0.22),
        0 0 0 1px color-mix(in srgb, var(--surface) 60%, transparent) inset;
      max-width: 100%;
    }

    .mobile-active-pill {
      position: absolute;
      left: 0.4rem;
      top: 0.35rem;
      bottom: 0.35rem;
      width: calc((100% - 0.8rem) / 5);
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
      gap: 0.18rem;
      padding: 0.4rem 0.65rem;
      min-width: 48px;
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
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }

    .dock-icon {
      transition: transform 260ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    .dock-item.is-active .dock-icon {
      transform: scale(1.1);
    }

    .dock-label {
      font-size: 0.65rem;
      font-weight: 750;
      letter-spacing: 0.02em;
      line-height: 1;
      text-transform: capitalize;
    }
  }
</style>
