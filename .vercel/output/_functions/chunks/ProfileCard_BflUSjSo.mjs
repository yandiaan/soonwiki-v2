import {
  O as renderTemplate,
  S as renderComponent,
  j as addAttribute,
  k as maybeRenderHead,
  z as createAstro,
} from './sequence_AxU5uU3I.mjs';
import { t as createComponent } from './compiler_BjIU_xd3.mjs';
import { n as paths } from './BaseLayout_CuXyOlbb.mjs';
import { s as $$PortraitFrame } from './public-repository_Cf0L4DJa.mjs';
//#region src/components/astro/ProfileCard.astro
createAstro('https://astro.build');
var $$ProfileCard = createComponent(
  ($$result, $$props, $$slots) => {
    const Astro = $$result.createAstro($$props, $$slots);
    Astro.self = $$ProfileCard;
    const { profile } = Astro.props;
    const subtitle = [
      profile.fieldLabels[0] ?? profile.currentActivity,
      profile.currentPlaceName,
      `Soon ${profile.batchYear}`,
    ].filter((item) => Boolean(item));
    return renderTemplate`${maybeRenderHead($$result)}<a class="profile-card"${addAttribute(paths.profile(profile.slug), 'href')} data-astro-cid-57vfi6p6><div class="profile-card__media" data-astro-cid-57vfi6p6>${renderComponent(
      $$result,
      'PortraitFrame',
      $$PortraitFrame,
      {
        photoPath: profile.photoPath,
        name: profile.name,
        transitionKey: `profile-${profile.id}`,
        'data-astro-cid-57vfi6p6': true,
      },
    )}</div><div class="profile-card__info" data-astro-cid-57vfi6p6><strong data-astro-cid-57vfi6p6>${profile.name}</strong>${subtitle.length > 0 && renderTemplate`<span data-astro-cid-57vfi6p6>${subtitle.join(' · ')}</span>`}</div></a>`;
  },
  'D:/development/SoonWiki/src/components/astro/ProfileCard.astro',
  void 0,
);
//#endregion
export { $$ProfileCard as t };

//# sourceMappingURL=ProfileCard_BflUSjSo.mjs.map
