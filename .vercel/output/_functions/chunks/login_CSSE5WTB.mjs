import { r as __exportAll } from './rolldown-runtime_BMI-E3GI.mjs';
import {
  O as renderTemplate,
  S as renderComponent,
  j as addAttribute,
  k as maybeRenderHead,
  z as createAstro,
} from './sequence_AxU5uU3I.mjs';
import { t as createComponent } from './compiler_BjIU_xd3.mjs';
import { n as paths, t as $$BaseLayout } from './BaseLayout_CuXyOlbb.mjs';
import { t as JoinWithGoogle } from './JoinWithGoogle_Bvc6K4SM.mjs';
//#region src/pages/login.astro
var login_exports = /* @__PURE__ */ __exportAll({
  default: () => $$Login,
  file: () => $$file,
  url: () => $$url,
});
createAstro('https://astro.build');
var $$Login = createComponent(
  ($$result, $$props, $$slots) => {
    const Astro = $$result.createAstro($$props, $$slots);
    Astro.self = $$Login;
    const message = Astro.url.searchParams.get('message');
    return renderTemplate`${renderComponent(
      $$result,
      'BaseLayout',
      $$BaseLayout,
      {
        title: 'Masuk ke SoonWiki',
        description: 'Masuk ke SoonWiki untuk mengelola perjalanan dan kisah kamu.',
        'data-astro-cid-sjqh5bze': true,
      },
      {
        default: ($$result) =>
          renderTemplate`${maybeRenderHead($$result)}<main id="main-content" class="login-layout" data-astro-cid-sjqh5bze><!-- Left Column: Editorial Showcase (Seamless Dark Surface) --><aside class="login-showcase" aria-hidden="true" data-astro-cid-sjqh5bze><div class="login-showcase__ambient" data-astro-cid-sjqh5bze><div class="showcase-orb showcase-orb--1" data-astro-cid-sjqh5bze></div><div class="showcase-orb showcase-orb--2" data-astro-cid-sjqh5bze></div></div><div class="login-showcase__content" data-reveal data-astro-cid-sjqh5bze><blockquote class="showcase-quote" data-astro-cid-sjqh5bze><p data-astro-cid-sjqh5bze>“Banyak cara untuk menjalani hidup. Setiap pilihan dan titik balik SoonMates layak dicatat dan dibagikan.”</p></blockquote><div class="showcase-footer" data-astro-cid-sjqh5bze><div class="showcase-avatars" data-astro-cid-sjqh5bze><img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80" alt="" class="avatar" data-astro-cid-sjqh5bze><img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" alt="" class="avatar" data-astro-cid-sjqh5bze><img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80" alt="" class="avatar" data-astro-cid-sjqh5bze><span class="avatar-count" data-astro-cid-sjqh5bze>+6</span></div><div class="showcase-meta" data-astro-cid-sjqh5bze><strong data-astro-cid-sjqh5bze>Komunitas Terkurasi</strong><span data-astro-cid-sjqh5bze>Menghubungkan lintas angkatan dan bidang</span></div></div></div></aside><!-- Right Column: Direct-on-Surface Minimalist Form --><section class="login-panel" aria-labelledby="login-title" data-astro-cid-sjqh5bze><header class="login-panel__top" data-astro-cid-sjqh5bze><a${addAttribute(paths.home(), 'href')} class="login-back-btn" data-astro-cid-sjqh5bze><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-astro-cid-sjqh5bze><path d="M19 12H5M12 19l-7-7 7-7" data-astro-cid-sjqh5bze></path></svg><span data-astro-cid-sjqh5bze>Kembali ke Beranda</span></a></header><div class="login-panel__center" data-astro-cid-sjqh5bze><div class="login-surface-form" data-reveal data-astro-cid-sjqh5bze><div class="login-header" data-astro-cid-sjqh5bze><span class="login-tag" data-astro-cid-sjqh5bze>Ruang Khusus SoonMates</span><h1 id="login-title" data-astro-cid-sjqh5bze>Masuk ke SoonWiki</h1><p class="login-subtitle" data-astro-cid-sjqh5bze>Sambungkan akun Google terdaftarmu untuk memperbarui linimasa perjalanan dan karya kebanggaanmu.</p></div>${message && renderTemplate`<div class="login-alert" role="alert" data-astro-cid-sjqh5bze><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" data-astro-cid-sjqh5bze><circle cx="12" cy="12" r="10" data-astro-cid-sjqh5bze></circle><line x1="12" y1="8" x2="12" y2="12" data-astro-cid-sjqh5bze></line><line x1="12" y1="16" x2="12.01" y2="16" data-astro-cid-sjqh5bze></line></svg><span data-astro-cid-sjqh5bze>${message}</span></div>`}<div class="login-action" data-astro-cid-sjqh5bze>${renderComponent(
            $$result,
            'JoinWithGoogle',
            JoinWithGoogle,
            {
              'client:load': true,
              mode: 'login',
              'data-astro-cid-sjqh5bze': true,
              'client:component-hydration': 'load',
              'client:component-path': '@/components/svelte/JoinWithGoogle.svelte',
              'client:component-export': 'default',
            },
          )}</div><div class="login-perks" data-astro-cid-sjqh5bze><div class="login-perk" data-astro-cid-sjqh5bze><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-astro-cid-sjqh5bze><polyline points="20 6 9 17 4 12" data-astro-cid-sjqh5bze></polyline></svg><span data-astro-cid-sjqh5bze>Sunting babak hidup sejak lulus SOON</span></div><div class="login-perk" data-astro-cid-sjqh5bze><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-astro-cid-sjqh5bze><polyline points="20 6 9 17 4 12" data-astro-cid-sjqh5bze></polyline></svg><span data-astro-cid-sjqh5bze>Katalogkan karya dan momen kebanggaan</span></div><div class="login-perk" data-astro-cid-sjqh5bze><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-astro-cid-sjqh5bze><polyline points="20 6 9 17 4 12" data-astro-cid-sjqh5bze></polyline></svg><span data-astro-cid-sjqh5bze>Terhubung dalam direktori terpercaya alumni</span></div></div><footer class="login-footer" data-astro-cid-sjqh5bze><p class="invite-notice" data-astro-cid-sjqh5bze>Belum punya akses? SoonWiki adalah arsip terkurasi. Hubungi koordinator angkatan SOON untuk mendapatkan tautan undangan.</p></footer></div></div></section></main>`,
      },
    )}`;
  },
  'D:/development/SoonWiki/src/pages/login.astro',
  void 0,
);
var $$file = 'D:/development/SoonWiki/src/pages/login.astro';
var $$url = '/login';
//#endregion
//#region \0virtual:astro:page:src/pages/login@_@astro
var page = () => login_exports;
//#endregion
export { page };

//# sourceMappingURL=login_CSSE5WTB.mjs.map
