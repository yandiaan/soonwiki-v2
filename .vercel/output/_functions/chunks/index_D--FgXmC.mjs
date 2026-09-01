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
import { t as createServerSupabase } from './server_zdj2Qb-F.mjs';
import { t as getMemberSession } from './session_wgSvdIaH.mjs';
import { n as loadOwnProfile } from './member-repository_DDlp2REv.mjs';
//#region src/pages/me/index.astro
var me_exports = /* @__PURE__ */ __exportAll({
  default: () => $$Index,
  file: () => $$file,
  url: () => '/me',
});
createAstro('https://astro.build');
var $$Index = createComponent(
  async ($$result, $$props, $$slots) => {
    const Astro = $$result.createAstro($$props, $$slots);
    Astro.self = $$Index;
    const session = await getMemberSession(Astro);
    if (!session) return Astro.redirect(paths.login());
    if (!session.member || session.member.status !== 'active')
      return Astro.redirect('/join-required');
    const supabase = createServerSupabase(Astro);
    const result = await loadOwnProfile(supabase);
    if (!result.ok) return new Response('Terjadi kesalahan saat memuat profil.', { status: 500 });
    if (!result.data) return Astro.redirect(paths.meEdit());
    const { profile } = result.data;
    return renderTemplate`${renderComponent(
      $$result,
      'BaseLayout',
      $$BaseLayout,
      {
        title: 'Profilku',
        description: 'Ringkasan profil SoonWiki kamu.',
        'data-astro-cid-i324j43t': true,
      },
      {
        default: ($$result) =>
          renderTemplate`${maybeRenderHead($$result)}<main id="main-content" class="me" data-astro-cid-i324j43t><p class="frame-number" data-astro-cid-i324j43t>PROFILKU</p><h1 data-astro-cid-i324j43t>${profile.name}</h1><p data-astro-cid-i324j43t>Soon ${profile.batchYear}</p><p class="me__status" data-astro-cid-i324j43t>Status: ${profile.isPublished ? 'Sudah terbit' : 'Belum terbit'}</p><div class="me__actions" data-astro-cid-i324j43t><a${addAttribute(paths.meEdit(), 'href')} data-astro-cid-i324j43t>Edit profil</a>${profile.isPublished && renderTemplate`<a${addAttribute(paths.profile(profile.slug), 'href')} data-astro-cid-i324j43t>Lihat profil publik</a>`}</div></main>`,
      },
    )}`;
  },
  'D:/development/SoonWiki/src/pages/me/index.astro',
  void 0,
);
var $$file = 'D:/development/SoonWiki/src/pages/me/index.astro';
//#endregion
//#region \0virtual:astro:page:src/pages/me/index@_@astro
var page = () => me_exports;
//#endregion
export { page };

//# sourceMappingURL=index_D--FgXmC.mjs.map
