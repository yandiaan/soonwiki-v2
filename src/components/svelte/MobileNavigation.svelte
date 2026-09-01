<script lang="ts">
  import type { NavigationLink } from '@/lib/shared/paths';

  let { links, currentPath }: { links: NavigationLink[]; currentPath: string } = $props();
</script>

<nav aria-label="Navigasi bawah" class="mobile-nav">
  <ul>
    {#each links as link (link.href)}
      <li>
        <a href={link.href} aria-current={currentPath === link.href ? 'page' : undefined}>
          {link.label}
        </a>
      </li>
    {/each}
  </ul>
</nav>

<style>
  .mobile-nav {
    display: none;
  }

  @media (max-width: 640px) {
    .mobile-nav {
      position: fixed;
      inset-inline: 0;
      bottom: 0;
      z-index: 20;
      border-top: 1px solid var(--line-soft);
      background: color-mix(in srgb, var(--canvas) 94%, transparent);
      backdrop-filter: blur(14px);
      padding-bottom: env(safe-area-inset-bottom, 0);
    }

    .mobile-nav ul {
      display: flex;
      justify-content: space-around;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .mobile-nav a {
      display: flex;
      min-width: 44px;
      min-height: 44px;
      align-items: center;
      justify-content: center;
      padding: 0.5rem;
      font-size: 0.8rem;
      font-weight: 700;
      text-decoration: none;
    }

    .mobile-nav a[aria-current='page'] {
      color: var(--accent);
    }

    .mobile-nav a:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
    }
  }
</style>
