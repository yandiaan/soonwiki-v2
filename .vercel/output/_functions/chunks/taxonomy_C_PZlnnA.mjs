import { r as __exportAll } from './rolldown-runtime_BMI-E3GI.mjs';
import {
  O as renderTemplate,
  S as renderComponent,
  j as addAttribute,
  k as maybeRenderHead,
  z as createAstro,
} from './sequence_AxU5uU3I.mjs';
import { t as createComponent } from './compiler_BjIU_xd3.mjs';
import { t as $$BaseLayout } from './BaseLayout_CuXyOlbb.mjs';
import {
  a as listAllFieldsForAdmin,
  d as mergeFields,
  f as mergePlaces,
  o as listAllPlacesForAdmin,
} from './admin_BHxA83-B.mjs';
import { t as createServerSupabase } from './server_zdj2Qb-F.mjs';
import { t as getMemberSession } from './session_wgSvdIaH.mjs';
//#region src/pages/admin/taxonomy.astro
var taxonomy_exports = /* @__PURE__ */ __exportAll({
  default: () => $$Taxonomy,
  file: () => $$file,
  url: () => $$url,
});
createAstro('https://astro.build');
var $$Taxonomy = createComponent(
  async ($$result, $$props, $$slots) => {
    const Astro = $$result.createAstro($$props, $$slots);
    Astro.self = $$Taxonomy;
    const session = await getMemberSession(Astro);
    if (!session || session.member?.role !== 'admin' || session.member.status !== 'active')
      return new Response('Halaman tidak ditemukan.', { status: 404 });
    const supabase = createServerSupabase(Astro);
    let actionMessage = '';
    if (Astro.request.method === 'POST') {
      const form = await Astro.request.formData();
      const type = form.get('type');
      const sourceId = String(form.get('sourceId') ?? '');
      const targetId = String(form.get('targetId') ?? '');
      if (sourceId && targetId) {
        if (type === 'field') {
          const result = await mergeFields(supabase, sourceId, targetId);
          actionMessage = result.ok
            ? `Berhasil menggabungkan hal yang ditekuni (${result.data.profilesAffected} profil terpengaruh).`
            : 'Gagal menggabungkan hal yang ditekuni.';
        } else if (type === 'place') {
          const result = await mergePlaces(supabase, sourceId, targetId);
          actionMessage = result.ok
            ? `Berhasil menggabungkan tempat (${result.data.profilesAffected} profil terpengaruh).`
            : 'Gagal menggabungkan tempat.';
        }
      }
    }
    const [fields, places] = await Promise.all([
      listAllFieldsForAdmin(supabase),
      listAllPlacesForAdmin(supabase),
    ]);
    const navLinks = [
      {
        href: '/admin',
        label: 'Dashboard',
      },
      {
        href: '/admin/people',
        label: 'Orang',
      },
      {
        href: '/admin/content',
        label: 'Konten',
      },
      {
        href: '/admin/taxonomy',
        label: 'Taksonomi',
      },
      {
        href: '/admin/reports',
        label: 'Laporan',
      },
      {
        href: '/admin/invitations',
        label: 'Undangan',
      },
    ];
    const currentPath = Astro.url.pathname;
    return renderTemplate`${renderComponent(
      $$result,
      'BaseLayout',
      $$BaseLayout,
      {
        title: 'Admin · Taksonomi',
        description: 'Kelola hal yang ditekuni dan tempat.',
        'data-astro-cid-gu7ytzbg': true,
      },
      {
        default: ($$result) =>
          renderTemplate`${maybeRenderHead($$result)}<main id="main-content" class="admin" data-astro-cid-gu7ytzbg><p class="frame-number" data-astro-cid-gu7ytzbg>ADMIN</p><h1 data-astro-cid-gu7ytzbg>Taksonomi</h1><nav class="admin__nav" aria-label="Navigasi admin" data-astro-cid-gu7ytzbg>${navLinks.map((link) => renderTemplate`<a${addAttribute(link.href, 'href')}${addAttribute(currentPath === link.href ? 'page' : void 0, 'aria-current')} data-astro-cid-gu7ytzbg>${link.label}</a>`)}</nav>${actionMessage && renderTemplate`<p role="status" data-astro-cid-gu7ytzbg>${actionMessage}</p>`}<h2 data-astro-cid-gu7ytzbg>Gabungkan hal yang ditekuni</h2><form class="admin__merge-form" method="post" data-astro-cid-gu7ytzbg><input type="hidden" name="type" value="field" data-astro-cid-gu7ytzbg><label data-astro-cid-gu7ytzbg><span data-astro-cid-gu7ytzbg>Dari (akan dihapus)</span><select name="sourceId" required data-astro-cid-gu7ytzbg>${fields.map((field) => renderTemplate`<option${addAttribute(field.id, 'value')} data-astro-cid-gu7ytzbg>${field.name}</option>`)}</select></label><label data-astro-cid-gu7ytzbg><span data-astro-cid-gu7ytzbg>Ke</span><select name="targetId" required data-astro-cid-gu7ytzbg>${fields.map((field) => renderTemplate`<option${addAttribute(field.id, 'value')} data-astro-cid-gu7ytzbg>${field.name}</option>`)}</select></label><button type="submit" data-astro-cid-gu7ytzbg>Gabungkan</button></form><h2 data-astro-cid-gu7ytzbg>Gabungkan tempat</h2><form class="admin__merge-form" method="post" data-astro-cid-gu7ytzbg><input type="hidden" name="type" value="place" data-astro-cid-gu7ytzbg><label data-astro-cid-gu7ytzbg><span data-astro-cid-gu7ytzbg>Dari (akan dihapus)</span><select name="sourceId" required data-astro-cid-gu7ytzbg>${places.map((place) => renderTemplate`<option${addAttribute(place.id, 'value')} data-astro-cid-gu7ytzbg>${place.name}</option>`)}</select></label><label data-astro-cid-gu7ytzbg><span data-astro-cid-gu7ytzbg>Ke</span><select name="targetId" required data-astro-cid-gu7ytzbg>${places.map((place) => renderTemplate`<option${addAttribute(place.id, 'value')} data-astro-cid-gu7ytzbg>${place.name}</option>`)}</select></label><button type="submit" data-astro-cid-gu7ytzbg>Gabungkan</button></form></main>`,
      },
    )}`;
  },
  'D:/development/SoonWiki/src/pages/admin/taxonomy.astro',
  void 0,
);
var $$file = 'D:/development/SoonWiki/src/pages/admin/taxonomy.astro';
var $$url = '/admin/taxonomy';
//#endregion
//#region \0virtual:astro:page:src/pages/admin/taxonomy@_@astro
var page = () => taxonomy_exports;
//#endregion
export { page };

//# sourceMappingURL=taxonomy_C_PZlnnA.mjs.map
