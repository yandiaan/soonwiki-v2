import { r as __exportAll } from './rolldown-runtime_BMI-E3GI.mjs';
import {
  O as renderTemplate,
  S as renderComponent,
  j as addAttribute,
  k as maybeRenderHead,
} from './sequence_AxU5uU3I.mjs';
import { t as createComponent } from './compiler_BjIU_xd3.mjs';
import { n as paths, t as $$BaseLayout } from './BaseLayout_CuXyOlbb.mjs';
//#region src/pages/join-required.astro
var join_required_exports = /* @__PURE__ */ __exportAll({
  default: () => $$JoinRequired,
  file: () => $$file,
  url: () => $$url,
});
var $$JoinRequired = createComponent(
  ($$result, $$props, $$slots) => {
    return renderTemplate`${renderComponent(
      $$result,
      'BaseLayout',
      $$BaseLayout,
      {
        title: 'Akses Terbatas · Butuh Undangan',
        description: 'Akses SoonWiki membutuhkan tautan undangan dari pengelola SOON.',
        'data-astro-cid-2bqm4pfa': true,
      },
      {
        default: ($$result) =>
          renderTemplate`${maybeRenderHead($$result)}<main id="main-content" class="auth-page" data-astro-cid-2bqm4pfa><div class="auth-card" data-reveal data-astro-cid-2bqm4pfa><header class="auth-card__header" data-astro-cid-2bqm4pfa><a${addAttribute(paths.home(), 'href')} class="auth-card__back" aria-label="Kembali ke Beranda" data-astro-cid-2bqm4pfa><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-astro-cid-2bqm4pfa><path d="M19 12H5M12 19l-7-7 7-7" data-astro-cid-2bqm4pfa></path></svg><span data-astro-cid-2bqm4pfa>Beranda</span></a><span class="auth-card__tag" data-astro-cid-2bqm4pfa>Akses Terkurasi</span><h1 data-astro-cid-2bqm4pfa>Undangan Diperlukan</h1><p class="auth-card__subtitle" data-astro-cid-2bqm4pfa>Akun Google ini belum terdaftar dalam keanggotaan SoonWiki. Komunitas ini menjaga keaslian cerita melalui verifikasi sesama alumni.</p></header><div class="auth-card__body" data-astro-cid-2bqm4pfa><p class="auth-card__instructions" data-astro-cid-2bqm4pfa>Minta tautan undangan resmi dari pengurus angkatan atau pengelola komunitas SOON untuk mulai mengisi profil dan perjalananmu.</p><a${addAttribute(paths.login(), 'href')} class="auth-card__action-btn" data-astro-cid-2bqm4pfa>Coba akun lain</a></div><footer class="auth-card__footer" data-astro-cid-2bqm4pfa><a${addAttribute(paths.explore(), 'href')} class="auth-card__explore-link" data-astro-cid-2bqm4pfa>Ingin sekadar membaca? Jelajahi profil publik →</a></footer></div></main>`,
      },
    )}`;
  },
  'D:/development/SoonWiki/src/pages/join-required.astro',
  void 0,
);
var $$file = 'D:/development/SoonWiki/src/pages/join-required.astro';
var $$url = '/join-required';
//#endregion
//#region \0virtual:astro:page:src/pages/join-required@_@astro
var page = () => join_required_exports;
//#endregion
export { page };

//# sourceMappingURL=join-required_yV6sN-Mc.mjs.map
