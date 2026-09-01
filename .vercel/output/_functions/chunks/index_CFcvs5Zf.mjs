import { r as __exportAll } from './rolldown-runtime_BMI-E3GI.mjs';
import {
  O as renderTemplate,
  S as renderComponent,
  j as addAttribute,
  k as maybeRenderHead,
  z as createAstro,
} from './sequence_AxU5uU3I.mjs';
import { c as attr, i as derived } from './dev_2mDreT1n.mjs';
import { t as createComponent } from './compiler_BjIU_xd3.mjs';
import { n as paths, t as $$BaseLayout } from './BaseLayout_CuXyOlbb.mjs';
import { t as $$EmptyState } from './EmptyState_BejkaiQ0.mjs';
import { o as searchPublishedProfiles } from './public-repository_Cf0L4DJa.mjs';
import { t as $$ProfileCard } from './ProfileCard_BflUSjSo.mjs';
//#region src/components/svelte/ExploreFilters.svelte
function ExploreFilters($$renderer, $$props) {
  $$renderer.component(($$renderer) => {
    let { query = '', batch = '', field = '', place = '' } = $$props;
    const hasFilters = derived(() => Boolean(query || batch || field || place));
    $$renderer.push(`<form method="get" action="/explore" class="explore-filters svelte-s74cym">`);
    if (field)
      $$renderer.push(
        `<!--[0--><input type="hidden" name="field"${attr('value', field)} class="svelte-s74cym"/>`,
      );
    else $$renderer.push('<!--[-1-->');
    $$renderer.push(`<!--]--> `);
    if (place)
      $$renderer.push(
        `<!--[0--><input type="hidden" name="place"${attr('value', place)} class="svelte-s74cym"/>`,
      );
    else $$renderer.push('<!--[-1-->');
    $$renderer.push(
      `<!--]--> <div class="explore-filters__inputs svelte-s74cym"><div class="explore-filters__field explore-filters__search svelte-s74cym"><label for="filter-query" class="svelte-s74cym">Pencarian</label> <input id="filter-query" type="search" name="q"${attr('value', query)} placeholder="Cari nama, bidang, atau tempat…" class="svelte-s74cym"/></div> <div class="explore-filters__field explore-filters__batch svelte-s74cym"><label for="filter-batch" class="svelte-s74cym">Angkatan (Soon)</label> <input id="filter-batch" type="number" name="batch"${attr('value', batch)} placeholder="Contoh: 2021" min="2000" max="2100" class="svelte-s74cym"/></div> <div class="explore-filters__actions svelte-s74cym"><button type="submit" class="explore-filters__submit svelte-s74cym">Terapkan</button> `,
    );
    if (hasFilters())
      $$renderer.push(
        `<!--[0--><a${attr('href', paths.explore())} class="explore-filters__reset svelte-s74cym">Reset filter</a>`,
      );
    else $$renderer.push('<!--[-1-->');
    $$renderer.push(`<!--]--></div></div></form>`);
  });
}
//#endregion
//#region src/pages/explore/index.astro
var explore_exports = /* @__PURE__ */ __exportAll({
  default: () => $$Index,
  file: () => $$file,
  url: () => $$url,
});
createAstro('https://astro.build');
var $$Index = createComponent(
  async ($$result, $$props, $$slots) => {
    const Astro = $$result.createAstro($$props, $$slots);
    Astro.self = $$Index;
    const PAGE_SIZE = 20;
    const url = Astro.url;
    const q = url.searchParams.get('q') ?? '';
    const field = url.searchParams.get('field') ?? '';
    const place = url.searchParams.get('place') ?? '';
    const batchParam = url.searchParams.get('batch') ?? '';
    const batch = batchParam ? Number.parseInt(batchParam, 10) : void 0;
    const pageParam = url.searchParams.get('page');
    const page = pageParam ? Math.max(1, Number.parseInt(pageParam, 10)) : 1;
    const result = await searchPublishedProfiles(Astro, {
      ...(q && { query: q }),
      ...(field && { fieldSlug: field }),
      ...(place && { placeSlug: place }),
      ...(batch !== void 0 && Number.isFinite(batch) && { batchYear: batch }),
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    });
    const profiles = result.ok ? result.data.profiles : [];
    const hasNextPage = profiles.length === PAGE_SIZE;
    function buildQuery(overrides) {
      const params = new URLSearchParams();
      const source = {
        q,
        field,
        place,
        batch: batchParam,
        ...overrides,
      };
      for (const [key, value] of Object.entries(source))
        if (value !== void 0 && value !== '') params.set(key, String(value));
      return params.toString();
    }
    return renderTemplate`${renderComponent(
      $$result,
      'BaseLayout',
      $$BaseLayout,
      {
        title: 'Jelajahi',
        description:
          'Jelajahi perjalanan SoonMates berdasarkan nama, tempat, hal yang ditekuni, atau batch.',
        canonical: new URL('/explore', Astro.url),
      },
      {
        default: ($$result) =>
          renderTemplate`${maybeRenderHead($$result)}<main id="main-content" class="explore"><header class="explore__header"><h1>Jelajahi SoonMates</h1><p class="explore__subtitle">Temukan perjalanan alumni dan member SOON berdasarkan nama, bidang, angkatan, atau tempat.</p></header>${renderComponent(
            $$result,
            'ExploreFilters',
            ExploreFilters,
            {
              'client:load': true,
              query: q,
              batch: batchParam,
              field: field,
              place: place,
              'client:component-hydration': 'load',
              'client:component-path': '@/components/svelte/ExploreFilters.svelte',
              'client:component-export': 'default',
            },
          )}${
            profiles.length === 0
              ? renderTemplate`${renderComponent($$result, 'EmptyState', $$EmptyState, {
                  title: 'Belum ada hasil',
                  description: 'Coba kata kunci lain, atau lihat semua SoonMates tanpa filter.',
                  actionHref: paths.explore(),
                  actionLabel: 'Lihat semua SoonMates',
                })}`
              : renderTemplate`<ul class="explore__results">${profiles.map((profile) => renderTemplate`<li>${renderComponent($$result, 'ProfileCard', $$ProfileCard, { profile: profile })}</li>`)}</ul>`
          }<nav class="explore__pagination" aria-label="Navigasi halaman hasil">${page > 1 && renderTemplate`<a${addAttribute(`${paths.explore()}?${buildQuery({ page: page - 1 })}`, 'href')}>Sebelumnya</a>`}${hasNextPage && renderTemplate`<a${addAttribute(`${paths.explore()}?${buildQuery({ page: page + 1 })}`, 'href')}>Berikutnya</a>`}</nav></main>`,
      },
    )}`;
  },
  'D:/development/SoonWiki/src/pages/explore/index.astro',
  void 0,
);
var $$file = 'D:/development/SoonWiki/src/pages/explore/index.astro';
var $$url = '/explore';
//#endregion
//#region \0virtual:astro:page:src/pages/explore/index@_@astro
var page = () => explore_exports;
//#endregion
export { page };

//# sourceMappingURL=index_CFcvs5Zf.mjs.map
