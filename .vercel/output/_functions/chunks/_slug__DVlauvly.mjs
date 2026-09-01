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
import { n as getFieldCollection } from './public-repository_Cf0L4DJa.mjs';
import { t as $$ProfileCard } from './ProfileCard_BflUSjSo.mjs';
/* empty css                      */
//#region src/pages/field/[slug].astro
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
    if (!slug) return new Response('Hal yang ditekuni ini tidak ditemukan.', { status: 404 });
    const result = await getFieldCollection(Astro, slug);
    if (!result.ok) return new Response('Hal yang ditekuni ini tidak ditemukan.', { status: 404 });
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
        description: `SoonMates yang menekuni ${name} di berbagai peran, tempat, dan tahap perjalanan.`,
        canonical: new URL(`/field/${slug}`, Astro.url),
        image: coverPhoto,
      },
      {
        default: ($$result) =>
          renderTemplate`${maybeRenderHead($$result)}<main id="main-content" class="collection"><header class="collection__header"><p class="collection__tag">Hal yang ditekuni</p><h1>${name}</h1><p class="collection__intro">SoonMates yang menekuni ${name} di berbagai peran, tempat, dan tahap perjalanan.</p></header>${
            profiles.length === 0
              ? renderTemplate`${renderComponent($$result, 'EmptyState', $$EmptyState, {
                  title: 'Belum ada kisah di sini',
                  description:
                    'Belum ada SoonMates yang menekuni bidang ini dan menerbitkan profilnya.',
                  actionHref: paths.explore(),
                  actionLabel: 'Jelajahi semua',
                })}`
              : renderTemplate`<ul class="collection__grid">${profiles.map((profile) => renderTemplate`<li>${renderComponent($$result, 'ProfileCard', $$ProfileCard, { profile: profile })}</li>`)}</ul>`
          }</main>`,
      },
    )}`;
  },
  'D:/development/SoonWiki/src/pages/field/[slug].astro',
  void 0,
);
var $$file = 'D:/development/SoonWiki/src/pages/field/[slug].astro';
var $$url = '/field/[slug]';
//#endregion
//#region \0virtual:astro:page:src/pages/field/[slug]@_@astro
var page = () => _slug__exports;
//#endregion
export { page };

//# sourceMappingURL=_slug__DVlauvly.mjs.map
