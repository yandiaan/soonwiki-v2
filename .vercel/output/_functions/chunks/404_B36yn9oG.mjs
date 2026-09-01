import { r as __exportAll } from './rolldown-runtime_BMI-E3GI.mjs';
import { O as renderTemplate, S as renderComponent } from './sequence_AxU5uU3I.mjs';
import { t as createComponent } from './compiler_BjIU_xd3.mjs';
import { t as $$BaseLayout } from './BaseLayout_CuXyOlbb.mjs';
import { t as $$ErrorState } from './ErrorState_CkjsAu1u.mjs';
//#region src/pages/404.astro
var _404_exports = /* @__PURE__ */ __exportAll({
  default: () => $$404,
  file: () => $$file,
  url: () => $$url,
});
var $$404 = createComponent(
  ($$result, $$props, $$slots) => {
    return renderTemplate`${renderComponent(
      $$result,
      'BaseLayout',
      $$BaseLayout,
      {
        title: 'Halaman tidak ditemukan',
        description: 'Halaman yang kamu cari tidak ditemukan di SoonWiki.',
      },
      {
        default: ($$result) =>
          renderTemplate`${renderComponent($$result, 'ErrorState', $$ErrorState, {
            code: '404',
            title: 'Halaman tidak ditemukan',
            description:
              'Tautan ini mungkin sudah tidak berlaku, salah ketik, atau kontennya belum terbit.',
            actionHref: '/',
            actionLabel: 'Kembali ke beranda',
          })}`,
      },
    )}`;
  },
  'D:/development/SoonWiki/src/pages/404.astro',
  void 0,
);
var $$file = 'D:/development/SoonWiki/src/pages/404.astro';
var $$url = '/404';
//#endregion
//#region \0virtual:astro:page:src/pages/404@_@astro
var page = () => _404_exports;
//#endregion
export { page };

//# sourceMappingURL=404_B36yn9oG.mjs.map
