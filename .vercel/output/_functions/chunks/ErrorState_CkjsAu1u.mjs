import {
  O as renderTemplate,
  j as addAttribute,
  k as maybeRenderHead,
  z as createAstro,
} from './sequence_AxU5uU3I.mjs';
import { t as createComponent } from './compiler_BjIU_xd3.mjs';
//#region src/components/astro/ErrorState.astro
createAstro('https://astro.build');
var $$ErrorState = createComponent(
  ($$result, $$props, $$slots) => {
    const Astro = $$result.createAstro($$props, $$slots);
    Astro.self = $$ErrorState;
    const { code, title, description, actionHref, actionLabel } = Astro.props;
    return renderTemplate`${maybeRenderHead($$result)}<main id="main-content" class="error-state" data-astro-cid-oudz5c6i><p class="error-state__code" data-astro-cid-oudz5c6i>${code}</p><h1 data-astro-cid-oudz5c6i>${title}</h1><p data-astro-cid-oudz5c6i>${description}</p>${actionHref && actionLabel && renderTemplate`<a${addAttribute(actionHref, 'href')} data-astro-cid-oudz5c6i>${actionLabel}</a>`}</main>`;
  },
  'D:/development/SoonWiki/src/components/astro/ErrorState.astro',
  void 0,
);
//#endregion
export { $$ErrorState as t };

//# sourceMappingURL=ErrorState_CkjsAu1u.mjs.map
