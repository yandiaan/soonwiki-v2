import { r as __exportAll } from './rolldown-runtime_BMI-E3GI.mjs';
import { O as renderTemplate, S as renderComponent } from './sequence_AxU5uU3I.mjs';
import { t as createComponent } from './compiler_BjIU_xd3.mjs';
import { t as $$BaseLayout } from './BaseLayout_CuXyOlbb.mjs';
import { t as $$ErrorState } from './ErrorState_CkjsAu1u.mjs';
//#region src/pages/500.astro
var _500_exports = /* @__PURE__ */ __exportAll({
  default: () => $$500,
  file: () => $$file,
  url: () => $$url,
});
var $$500 = createComponent(
  ($$result, $$props, $$slots) => {
    return renderTemplate`${renderComponent(
      $$result,
      'BaseLayout',
      $$BaseLayout,
      {
        title: 'Terjadi kendala',
        description: 'SoonWiki sedang mengalami kendala sementara.',
      },
      {
        default: ($$result) =>
          renderTemplate`${renderComponent($$result, 'ErrorState', $$ErrorState, {
            code: '500',
            title: 'Terjadi kendala di sisi kami',
            description:
              'Silakan muat ulang halaman ini dalam beberapa saat. Kalau masih terjadi, beri tahu pengelola SOON.',
            actionHref: '/',
            actionLabel: 'Kembali ke beranda',
          })}`,
      },
    )}`;
  },
  'D:/development/SoonWiki/src/pages/500.astro',
  void 0,
);
var $$file = 'D:/development/SoonWiki/src/pages/500.astro';
var $$url = '/500';
//#endregion
//#region \0virtual:astro:page:src/pages/500@_@astro
var page = () => _500_exports;
//#endregion
export { page };

//# sourceMappingURL=500_CO5W0eLM.mjs.map
