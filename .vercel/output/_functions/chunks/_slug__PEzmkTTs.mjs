import { r as __exportAll } from './rolldown-runtime_BMI-E3GI.mjs';
import {
  O as renderTemplate,
  S as renderComponent,
  k as maybeRenderHead,
  z as createAstro,
} from './sequence_AxU5uU3I.mjs';
import { t as createComponent } from './compiler_BjIU_xd3.mjs';
import { n as paths, r as publicStorageUrl, t as $$BaseLayout } from './BaseLayout_CuXyOlbb.mjs';
import { t as $$EmptyState } from './EmptyState_BejkaiQ0.mjs';
import { i as getPlaceCollection } from './public-repository_Cf0L4DJa.mjs';
import { t as $$ProfileCard } from './ProfileCard_BflUSjSo.mjs';
/* empty css                      */
//#region src/pages/place/[slug].astro
var _slug__exports = /* @__PURE__ */ __exportAll({
  default: () => $$Slug,
  file: () => $$file,
  url: () => $$url,
});
createAstro('https://astro.build');
var $$Slug = createComponent(
  async ($$result, $$props, $$slots) => {
    const Astro = $$result.createAstro($$props, $$slots);
    Astro.self = $$Slug;
    const { slug } = Astro.params;
    if (!slug) return new Response('Tempat ini tidak ditemukan.', { status: 404 });
    const result = await getPlaceCollection(Astro, slug);
    if (!result.ok) return new Response('Tempat ini tidak ditemukan.', { status: 404 });
    const { name, profiles } = result.data;
    const coverPhoto = profiles[0]?.photoPath
      ? publicStorageUrl('profile-photos', profiles[0].photoPath)
      : void 0;
    return renderTemplate`${renderComponent(
      $$result,
      'BaseLayout',
      $$BaseLayout,
      {
        title: name,
        description: `SoonMates yang menjalani proses dan perjalanannya di ${name}.`,
        canonical: new URL(`/place/${slug}`, Astro.url),
        image: coverPhoto,
      },
      {
        default: ($$result) =>
          renderTemplate`${maybeRenderHead($$result)}<main id="main-content" class="collection"><header class="collection__header"><p class="collection__tag">Tempat, organisasi, atau usaha</p><h1>${name}</h1><p class="collection__intro">SoonMates yang menjalani perjalanannya lewat ${name}.</p></header>${
            profiles.length === 0
              ? renderTemplate`${renderComponent($$result, 'EmptyState', $$EmptyState, {
                  title: 'Belum ada kisah di sini',
                  description: 'Belum ada SoonMates di tempat ini yang menerbitkan profilnya.',
                  actionHref: paths.explore(),
                  actionLabel: 'Jelajahi semua',
                })}`
              : renderTemplate`<ul class="collection__grid">${profiles.map((profile) => renderTemplate`<li>${renderComponent($$result, 'ProfileCard', $$ProfileCard, { profile: profile })}</li>`)}</ul>`
          }</main>`,
      },
    )}`;
  },
  'D:/development/SoonWiki/src/pages/place/[slug].astro',
  void 0,
);
var $$file = 'D:/development/SoonWiki/src/pages/place/[slug].astro';
var $$url = '/place/[slug]';
//#endregion
//#region \0virtual:astro:page:src/pages/place/[slug]@_@astro
var page = () => _slug__exports;
//#endregion
export { page };

//# sourceMappingURL=_slug__PEzmkTTs.mjs.map
