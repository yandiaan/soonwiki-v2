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
import { t as getBatchCollection } from './public-repository_Cf0L4DJa.mjs';
import { t as $$ProfileCard } from './ProfileCard_BflUSjSo.mjs';
/* empty css                      */
//#region src/pages/batch/[year].astro
var _year__exports = /* @__PURE__ */ __exportAll({
  default: () => $$Year,
  file: () => $$file,
  url: () => $$url,
});
createAstro('https://astro.build');
var $$Year = createComponent(
  async ($$result, $$props, $$slots) => {
    const Astro = $$result.createAstro($$props, $$slots);
    Astro.self = $$Year;
    const yearParam = Astro.params.year;
    const year = yearParam ? Number.parseInt(yearParam, 10) : NaN;
    if (!Number.isFinite(year)) return new Response('Batch ini tidak ditemukan.', { status: 404 });
    const result = await getBatchCollection(Astro, year);
    if (!result.ok) return new Response('Batch ini tidak ditemukan.', { status: 404 });
    const { profiles } = result.data;
    const coverPhoto = profiles[0]?.photoPath
      ? publicStorageUrl('profile-photos', profiles[0].photoPath)
      : void 0;
    return renderTemplate`${renderComponent(
      $$result,
      'BaseLayout',
      $$BaseLayout,
      {
        title: `Soon ${year}`,
        description: `Kisah dan perjalanan hidup SoonMates dari angkatan Soon ${year}.`,
        canonical: new URL(`/batch/${year}`, Astro.url),
        image: coverPhoto,
      },
      {
        default: ($$result) =>
          renderTemplate`${maybeRenderHead($$result)}<main id="main-content" class="collection"><header class="collection__header"><p class="collection__tag">Angkatan</p><h1>Soon ${year}</h1><p class="collection__intro">Perjalanan SoonMates dari batch ${year}, dari berbagai jalan hidup.</p></header>${
            profiles.length === 0
              ? renderTemplate`${renderComponent($$result, 'EmptyState', $$EmptyState, {
                  title: 'Belum ada kisah di sini',
                  description: 'Belum ada SoonMates dari batch ini yang menerbitkan profilnya.',
                  actionHref: paths.explore(),
                  actionLabel: 'Jelajahi semua',
                })}`
              : renderTemplate`<ul class="collection__grid">${profiles.map((profile) => renderTemplate`<li>${renderComponent($$result, 'ProfileCard', $$ProfileCard, { profile: profile })}</li>`)}</ul>`
          }</main>`,
      },
    )}`;
  },
  'D:/development/SoonWiki/src/pages/batch/[year].astro',
  void 0,
);
var $$file = 'D:/development/SoonWiki/src/pages/batch/[year].astro';
var $$url = '/batch/[year]';
//#endregion
//#region \0virtual:astro:page:src/pages/batch/[year]@_@astro
var page = () => _year__exports;
//#endregion
export { page };

//# sourceMappingURL=_year__CLV_76YG.mjs.map
