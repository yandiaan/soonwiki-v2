import {
  A as renderHead,
  M as createRenderInstruction,
  O as renderTemplate,
  S as renderComponent,
  T as renderSlot,
  j as addAttribute,
  k as maybeRenderHead,
  z as createAstro,
} from './sequence_AxU5uU3I.mjs';
import {
  a as ensure_array_like,
  c as attr,
  i as derived,
  l as escape_html,
  n as attr_style,
  s as stringify,
  t as attr_class,
} from './dev_2mDreT1n.mjs';
import { t as createComponent } from './compiler_BjIU_xd3.mjs';
//#region node_modules/.pnpm/astro@7.2.9_@emnapi+core@1._1ba17e19fb65d1b3adcc0713c7cc04ee/node_modules/astro/dist/runtime/server/render/script.js
async function renderScript(result, id) {
  const inlined = result.inlinedScripts.get(id);
  let content = '';
  if (inlined != null) {
    if (inlined) content = `<script type="module">${inlined}<\/script>`;
  } else {
    const resolved = await result.resolve(id);
    content = `<script type="module" src="${result.userAssetsBase ? (result.base === '/' ? '' : result.base) + result.userAssetsBase : ''}${resolved}"><\/script>`;
  }
  return createRenderInstruction({
    type: 'script',
    id,
    content,
  });
}
//#endregion
//#region src/lib/shared/paths.ts
var paths = {
  home: () => '/',
  about: () => '/#tentang',
  explore: () => '/explore',
  profile: (slug) => `/people/${slug}`,
  field: (slug) => `/field/${slug}`,
  batch: (year) => `/batch/${year}`,
  place: (slug) => `/place/${slug}`,
  me: () => '/me',
  meEdit: () => '/me/edit',
  login: () => '/login',
  join: (token) => `/join/${token}`,
};
(paths.home(), paths.explore(), paths.about(), paths.login());
function publicStorageUrl(bucket, path) {
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/'))
    return path;
  return `${'https://gixwqgnsarwtwjlotaul.supabase.co'.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${path}`;
}
//#endregion
//#region src/components/svelte/MobileNavigation.svelte
function MobileNavigation($$renderer, $$props) {
  $$renderer.component(($$renderer) => {
    let { currentPath } = $$props;
    const navItems = [
      {
        href: paths.home(),
        label: 'Beranda',
        icon: 'home',
        match: (p) => p === '/',
      },
      {
        href: paths.explore(),
        label: 'Jelajahi',
        icon: 'explore',
        match: (p) => p === '/explore' || p.startsWith('/explore'),
      },
      {
        href: paths.about(),
        label: 'Tentang',
        icon: 'about',
        match: (p) => p === '/#tentang',
      },
      {
        href: paths.login(),
        label: 'Masuk',
        icon: 'login',
        match: (p) => p === '/login' || p.startsWith('/login') || p.startsWith('/join'),
      },
    ];
    let activeIndex = derived(() => {
      const idx = navItems.findIndex((item) => item.match(currentPath));
      return idx >= 0 ? idx : 0;
    });
    $$renderer.push(
      `<nav aria-label="Navigasi bawah mobile" class="mobile-dock svelte-sked84"><div class="mobile-dock__capsule svelte-sked84"><div class="mobile-active-pill svelte-sked84"${attr_style(`transform: translate3d(calc(${stringify(activeIndex())} * 100%), 0, 0);`)} aria-hidden="true"></div> <!--[-->`,
    );
    const each_array = ensure_array_like(navItems);
    for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
      let item = each_array[idx];
      const isActive = idx === activeIndex();
      $$renderer.push(
        `<a${attr('href', item.href)}${attr_class('dock-item svelte-sked84', void 0, { 'is-active': isActive })}${attr('aria-current', isActive ? 'page' : void 0)}${attr('aria-label', item.label)}><span class="dock-icon-wrapper svelte-sked84">`,
      );
      if (item.icon === 'home')
        $$renderer.push(
          `<!--[0--><svg class="dock-icon svelte-sked84" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5L12 3l9 7.5v10a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 20.5z"></path><path d="M9 22V12h6v10"></path></svg>`,
        );
      else if (item.icon === 'explore')
        $$renderer.push(
          `<!--[1--><svg class="dock-icon svelte-sked84" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.25"></circle><polygon points="15.8 8.2 13.5 13.5 8.2 15.8 10.5 10.5"${attr('fill', isActive ? 'var(--accent-soft)' : 'none')}></polygon><circle cx="12" cy="12" r="1.2" fill="currentColor"></circle></svg>`,
        );
      else if (item.icon === 'about')
        $$renderer.push(
          `<!--[2--><svg class="dock-icon svelte-sked84" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path><line x1="9" y1="7" x2="16" y2="7"></line><line x1="9" y1="11" x2="14" y2="11"></line></svg>`,
        );
      else if (item.icon === 'login')
        $$renderer.push(
          `<!--[3--><svg class="dock-icon svelte-sked84" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
        );
      else $$renderer.push('<!--[-1-->');
      $$renderer.push(
        `<!--]--></span> <span class="dock-label svelte-sked84">${escape_html(item.label)}</span></a>`,
      );
    }
    $$renderer.push(`<!--]--></div></nav>`);
  });
}
//#endregion
//#region src/components/astro/SiteFooter.astro
var $$SiteFooter = createComponent(
  ($$result, $$props, $$slots) => {
    const year = /* @__PURE__ */ new Date().getFullYear();
    return renderTemplate`${maybeRenderHead($$result)}<footer class="site-footer" data-astro-cid-v3fbrohj><p data-astro-cid-v3fbrohj><strong data-astro-cid-v3fbrohj>SoonWiki</strong> menyimpan banyak jalan yang dimulai dari SOON.</p><p data-astro-cid-v3fbrohj>${year}</p></footer>`;
  },
  'D:/development/SoonWiki/src/components/astro/SiteFooter.astro',
  void 0,
);
//#endregion
//#region src/components/astro/SiteHeader.astro
createAstro('https://astro.build');
var $$SiteHeader = createComponent(
  ($$result, $$props, $$slots) => {
    const Astro = $$result.createAstro($$props, $$slots);
    Astro.self = $$SiteHeader;
    const { currentPath } = Astro.props;
    const isDarkHero = currentPath === '/';
    const navItems = [
      {
        href: paths.home(),
        label: 'Beranda',
      },
      {
        href: paths.explore(),
        label: 'Jelajahi',
      },
      {
        href: paths.about(),
        label: 'Tentang',
      },
    ];
    return renderTemplate`${maybeRenderHead($$result)}<header${addAttribute(['site-header', { 'is-dark-hero': isDarkHero }], 'class:list')} id="site-header"${addAttribute(isDarkHero ? 'true' : void 0, 'data-dark-hero')} data-astro-cid-wzfd4wrd><div class="site-header__container" data-astro-cid-wzfd4wrd><!-- Brand / Editorial Monogram --><a class="brand"${addAttribute(paths.home(), 'href')} aria-label="SoonWiki Beranda" data-astro-cid-wzfd4wrd><span class="brand__icon" aria-hidden="true" data-astro-cid-wzfd4wrd><img src="/soon-logo.png" alt="SOON" width="22" height="22" class="brand__logo" loading="eager" decoding="async" data-astro-cid-wzfd4wrd></span><span class="brand__text" data-astro-cid-wzfd4wrd><strong class="brand__name" data-astro-cid-wzfd4wrd>SOON</strong><span class="brand__sub" data-astro-cid-wzfd4wrd>WIKI</span></span></a><!-- Center Navigation Links with Magnetic Sliding Active Pill --><nav aria-label="Navigasi utama" class="desktop-nav" data-astro-cid-wzfd4wrd><ul class="nav-pill-list" id="nav-pill-list" data-astro-cid-wzfd4wrd><!-- Floating Sliding Background Indicator Pill --><li class="nav-indicator" id="nav-indicator" aria-hidden="true" data-astro-cid-wzfd4wrd></li>${navItems.map(
      (link) => {
        const isActive =
          link.href === '/'
            ? currentPath === '/'
            : currentPath === link.href || currentPath.startsWith(link.href);
        return renderTemplate`<li class="nav-item" data-astro-cid-wzfd4wrd><a${addAttribute(link.href, 'href')}${addAttribute(['nav-link', { 'is-active': isActive }], 'class:list')}${addAttribute(isActive ? 'page' : void 0, 'aria-current')} data-nav-item data-astro-cid-wzfd4wrd><span data-astro-cid-wzfd4wrd>${link.label}</span></a></li>`;
      },
    )}</ul></nav><!-- Right Controls: Auth CTA Button --><div class="site-header__actions" data-astro-cid-wzfd4wrd><a${addAttribute(paths.login(), 'href')}${addAttribute(['login-btn', { 'is-active': currentPath.startsWith('/login') || currentPath.startsWith('/join') }], 'class:list')} aria-label="Masuk ke Ruang SoonMates" data-astro-cid-wzfd4wrd><span data-astro-cid-wzfd4wrd>Masuk</span><svg class="login-btn__arrow" viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-astro-cid-wzfd4wrd><path d="M4.5 11.5L11.5 4.5M11.5 4.5H6M11.5 4.5V10" data-astro-cid-wzfd4wrd></path></svg></a></div></div></header>${renderScript($$result, 'D:/development/SoonWiki/src/components/astro/SiteHeader.astro?astro&type=script&index=0&lang.ts')}`;
  },
  'D:/development/SoonWiki/src/components/astro/SiteHeader.astro',
  void 0,
);
//#endregion
//#region src/layouts/BaseLayout.astro
createAstro('https://astro.build');
var $$BaseLayout = createComponent(
  ($$result, $$props, $$slots) => {
    const Astro2 = $$result.createAstro($$props, $$slots);
    Astro2.self = $$BaseLayout;
    const { title, description, image, imageAlt, canonical, type = 'website' } = Astro2.props;
    const siteName = 'SoonWiki';
    const fullTitle =
      title === siteName ? `${siteName} — Direktori & Arsip Alumni SOON` : `${title} · ${siteName}`;
    const currentPath = Astro2.url.pathname;
    const siteOrigin = 'http://127.0.0.1:4321'.replace(/\/$/, '');
    const pageUrl = canonical ? canonical.toString() : `${siteOrigin}${currentPath}`;
    const ogImage = image
      ? image.startsWith('http')
        ? image
        : `${siteOrigin}${image.startsWith('/') ? '' : '/'}${image}`
      : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&h=630&q=85';
    const ogImageAlt = imageAlt || `SoonWiki — ${fullTitle}`;
    return renderTemplate`<html lang="id"><head><!-- Primary Meta Tags --><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${fullTitle}</title><meta name="title"${addAttribute(fullTitle, 'content')}><meta name="description"${addAttribute(description, 'content')}><meta name="theme-color" content="#0a0c0b"><meta name="color-scheme" content="light dark"><meta name="view-transition" content="same-origin"><meta name="robots" content="index, follow"><meta name="author" content="Komunitas Alumni SOON"><link rel="canonical"${addAttribute(pageUrl, 'href')}><link rel="icon" type="image/png" href="/favicon.png"><link rel="apple-touch-icon" href="/favicon.png"><!-- Open Graph / WhatsApp / Telegram / Facebook / LinkedIn --><meta property="og:type"${addAttribute(type, 'content')}><meta property="og:site_name"${addAttribute(siteName, 'content')}><meta property="og:url"${addAttribute(pageUrl, 'content')}><meta property="og:title"${addAttribute(fullTitle, 'content')}><meta property="og:description"${addAttribute(description, 'content')}><meta property="og:image"${addAttribute(ogImage, 'content')}><meta property="og:image:secure_url"${addAttribute(ogImage, 'content')}><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt"${addAttribute(ogImageAlt, 'content')}><meta property="og:image:type" content="image/jpeg"><meta property="og:locale" content="id_ID"><!-- Twitter / X / Discord Cards --><meta name="twitter:card" content="summary_large_image"><meta name="twitter:url"${addAttribute(pageUrl, 'content')}><meta name="twitter:title"${addAttribute(fullTitle, 'content')}><meta name="twitter:description"${addAttribute(description, 'content')}><meta name="twitter:image"${addAttribute(ogImage, 'content')}><meta name="twitter:image:alt"${addAttribute(ogImageAlt, 'content')}>${renderHead($$result)}</head><body><!--
    THESIS: SoonWiki's homepage opens with one honest alumni journey, refusing the search-first directory this category defaults to.
    OWN-WORLD: Lembar Kontak Redaksi — warm newsprint, near-black ink, committed cobalt fields, signal orange metadata, documentary portraits, numbered contact-sheet frames, caption strips, hard rules, Plus Jakarta Sans.
    STORY: One featured Soonie portrait and turning-point line, then three short chapters (since SOON, turning point, current direction), one concrete proud moment, a diverse contact sheet of other journeys, and an exit through Field/Batch/Place chips into Explore, where search lives as a quiet utility.
    FIRST VIEWPORT: Compact masthead, then the featured portrait filling most of the fold with a large turning-point headline plus frame number and caption; no search bar above the fold.
    FORM: Code-led (no comp); ambition carried by this contract; signature interaction is the shared-element transition from a contact-sheet portrait into the profile hero.
    FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
    --><a class="skip-link" href="#main-content">Lewati ke konten utama</a>${renderComponent($$result, 'SiteHeader', $$SiteHeader, { currentPath: currentPath })}${renderSlot($$result, $$slots['default'])}${renderComponent($$result, 'SiteFooter', $$SiteFooter, {})}${renderComponent(
      $$result,
      'MobileNavigation',
      MobileNavigation,
      {
        'client:load': true,
        currentPath: currentPath,
        'client:component-hydration': 'load',
        'client:component-path': '@/components/svelte/MobileNavigation.svelte',
        'client:component-export': 'default',
      },
    )}${renderScript($$result, 'D:/development/SoonWiki/src/layouts/BaseLayout.astro?astro&type=script&index=0&lang.ts')}</body></html>`;
  },
  'D:/development/SoonWiki/src/layouts/BaseLayout.astro',
  void 0,
);
//#endregion
export { paths as n, publicStorageUrl as r, $$BaseLayout as t };

//# sourceMappingURL=BaseLayout_CuXyOlbb.mjs.map
