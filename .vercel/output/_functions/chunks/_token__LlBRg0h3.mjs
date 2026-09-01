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
import { t as describeAuthError } from './auth-errors_BTQxLM_0.mjs';
import { t as JoinWithGoogle } from './JoinWithGoogle_Bvc6K4SM.mjs';
//#region src/pages/join/[token].astro
var _token__exports = /* @__PURE__ */ __exportAll({
  default: () => $$Token,
  file: () => $$file,
  url: () => $$url,
});
createAstro('https://astro.build');
var $$Token = createComponent(
  async ($$result, $$props, $$slots) => {
    const Astro2 = $$result.createAstro($$props, $$slots);
    Astro2.self = $$Token;
    const { token } = Astro2.params;
    if (!token) return Astro2.redirect('/join-required');
    const validation = await fetch(
      `https://gixwqgnsarwtwjlotaul.supabase.co/functions/v1/invitations`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: 'sb_publishable_gPLV-YAyiPlxT8Bzn1oFOw_E5xAAn3e',
        },
        body: JSON.stringify({
          action: 'start',
          token,
        }),
      },
    );
    const invalidMessage = validation.ok
      ? null
      : describeAuthError((await validation.json().catch(() => null))?.error);
    return renderTemplate`${renderComponent(
      $$result,
      'BaseLayout',
      $$BaseLayout,
      {
        title: 'Gabung ke SoonWiki',
        description: 'Gabung SoonWiki lewat tautan undangan resmi SOON.',
        'data-astro-cid-27m7mzmy': true,
      },
      {
        default: ($$result2) =>
          renderTemplate`${maybeRenderHead($$result2)}<main id="main-content" class="auth-page" data-astro-cid-27m7mzmy><div class="auth-card" data-reveal data-astro-cid-27m7mzmy><header class="auth-card__header" data-astro-cid-27m7mzmy><a${addAttribute(paths.home(), 'href')} class="auth-card__back" aria-label="Kembali ke Beranda" data-astro-cid-27m7mzmy><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-astro-cid-27m7mzmy><path d="M19 12H5M12 19l-7-7 7-7" data-astro-cid-27m7mzmy></path></svg><span data-astro-cid-27m7mzmy>Beranda</span></a><span class="auth-card__tag" data-astro-cid-27m7mzmy>Undangan Valid</span><h1 data-astro-cid-27m7mzmy>Mulai Ceritamu di SoonWiki</h1><p class="auth-card__subtitle" data-astro-cid-27m7mzmy>${invalidMessage ? 'Tautan undangan ini tidak dapat digunakan.' : 'Tautan undangan terverifikasi. Sambungkan akun Google kamu untuk mengklaim profil keanggotaan SoonMates.'}</p></header>${
            invalidMessage
              ? renderTemplate`<div class="auth-card__alert" role="alert" data-astro-cid-27m7mzmy><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" data-astro-cid-27m7mzmy><circle cx="12" cy="12" r="10" data-astro-cid-27m7mzmy></circle><line x1="12" y1="8" x2="12" y2="12" data-astro-cid-27m7mzmy></line><line x1="12" y1="16" x2="12.01" y2="16" data-astro-cid-27m7mzmy></line></svg><span data-astro-cid-27m7mzmy>${invalidMessage}</span></div>`
              : renderTemplate`<div class="auth-card__form" data-astro-cid-27m7mzmy>${renderComponent(
                  $$result2,
                  'JoinWithGoogle',
                  JoinWithGoogle,
                  {
                    'client:load': true,
                    mode: 'join',
                    invitationToken: token,
                    'data-astro-cid-27m7mzmy': true,
                    'client:component-hydration': 'load',
                    'client:component-path': '@/components/svelte/JoinWithGoogle.svelte',
                    'client:component-export': 'default',
                  },
                )}</div>`
          }<footer class="auth-card__footer" data-astro-cid-27m7mzmy><ul class="auth-card__perks" data-astro-cid-27m7mzmy><li class="perk-item" data-astro-cid-27m7mzmy><svg class="perk-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-astro-cid-27m7mzmy><polyline points="20 6 9 17 4 12" data-astro-cid-27m7mzmy></polyline></svg><span data-astro-cid-27m7mzmy>Tulis babak kehidupan sejak lulus SOON</span></li><li class="perk-item" data-astro-cid-27m7mzmy><svg class="perk-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-astro-cid-27m7mzmy><polyline points="20 6 9 17 4 12" data-astro-cid-27m7mzmy></polyline></svg><span data-astro-cid-27m7mzmy>Katalogkan karya dan foto kebanggaanmu</span></li></ul></footer></div></main>`,
      },
    )}`;
  },
  'D:/development/SoonWiki/src/pages/join/[token].astro',
  void 0,
);
var $$file = 'D:/development/SoonWiki/src/pages/join/[token].astro';
var $$url = '/join/[token]';
//#endregion
//#region \0virtual:astro:page:src/pages/join/[token]@_@astro
var page = () => _token__exports;
//#endregion
export { page };

//# sourceMappingURL=_token__LlBRg0h3.mjs.map
