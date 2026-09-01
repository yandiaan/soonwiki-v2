import {
  O as renderTemplate,
  j as addAttribute,
  k as maybeRenderHead,
  z as createAstro,
} from './sequence_AxU5uU3I.mjs';
import { t as createComponent } from './compiler_BjIU_xd3.mjs';
//#region src/components/astro/EmptyState.astro
createAstro('https://astro.build');
var $$EmptyState = createComponent(
  ($$result, $$props, $$slots) => {
    const Astro = $$result.createAstro($$props, $$slots);
    Astro.self = $$EmptyState;
    const { title, description, actionHref, actionLabel } = Astro.props;
    return renderTemplate`${maybeRenderHead($$result)}<div class="empty-state" data-astro-cid-ikde634f><h2 data-astro-cid-ikde634f>${title}</h2><p data-astro-cid-ikde634f>${description}</p>${actionHref && actionLabel && renderTemplate`<a${addAttribute(actionHref, 'href')} data-astro-cid-ikde634f>${actionLabel}</a>`}</div>`;
  },
  'D:/development/SoonWiki/src/components/astro/EmptyState.astro',
  void 0,
);
//#endregion
export { $$EmptyState as t };

//# sourceMappingURL=EmptyState_BejkaiQ0.mjs.map
