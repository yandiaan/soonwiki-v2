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
import { i as listAdminOverview } from './admin_BHxA83-B.mjs';
import { t as createServerSupabase } from './server_zdj2Qb-F.mjs';
import { t as getMemberSession } from './session_wgSvdIaH.mjs';
//#region src/pages/admin/index.astro
var admin_exports = /* @__PURE__ */ __exportAll({
  default: () => $$Index,
  file: () => $$file,
  url: () => $$url,
});
createAstro('https://astro.build');
var $$Index = createComponent(
  async ($$result, $$props, $$slots) => {
    const Astro = $$result.createAstro($$props, $$slots);
    Astro.self = $$Index;
    const session = await getMemberSession(Astro);
    if (!session || session.member?.role !== 'admin' || session.member.status !== 'active')
      return new Response('Halaman tidak ditemukan.', { status: 404 });
    const supabase = createServerSupabase(Astro);
    const overviewResult = await listAdminOverview(supabase);
    const overview = overviewResult.ok
      ? overviewResult.data
      : {
          totalPublishedProfiles: 0,
          totalMembers: 0,
          openReports: 0,
        };
    const currentPath = Astro.url.pathname;
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
    return renderTemplate`${renderComponent(
      $$result,
      'BaseLayout',
      $$BaseLayout,
      {
        title: 'Admin',
        description: 'Panel admin SoonWiki.',
        'data-astro-cid-nsou3le4': true,
      },
      {
        default: ($$result) =>
          renderTemplate`${maybeRenderHead($$result)}<main id="main-content" class="admin" data-astro-cid-nsou3le4><p class="frame-number" data-astro-cid-nsou3le4>ADMIN</p><h1 data-astro-cid-nsou3le4>Dashboard</h1><nav class="admin__nav" aria-label="Navigasi admin" data-astro-cid-nsou3le4>${navLinks.map((link) => renderTemplate`<a${addAttribute(link.href, 'href')}${addAttribute(currentPath === link.href ? 'page' : void 0, 'aria-current')} data-astro-cid-nsou3le4>${link.label}</a>`)}</nav><div class="admin__cards" data-astro-cid-nsou3le4><div class="admin__card" data-astro-cid-nsou3le4><strong data-astro-cid-nsou3le4>${overview.totalPublishedProfiles}</strong><span data-astro-cid-nsou3le4>Profil terbit</span></div><div class="admin__card" data-astro-cid-nsou3le4><strong data-astro-cid-nsou3le4>${overview.totalMembers}</strong><span data-astro-cid-nsou3le4>Member aktif</span></div><div class="admin__card" data-astro-cid-nsou3le4><strong data-astro-cid-nsou3le4>${overview.openReports}</strong><span data-astro-cid-nsou3le4>Laporan terbuka</span></div></div></main>`,
      },
    )}`;
  },
  'D:/development/SoonWiki/src/pages/admin/index.astro',
  void 0,
);
var $$file = 'D:/development/SoonWiki/src/pages/admin/index.astro';
var $$url = '/admin';
//#endregion
//#region \0virtual:astro:page:src/pages/admin/index@_@astro
var page = () => admin_exports;
//#endregion
export { page };

//# sourceMappingURL=index_CGhraMOQ.mjs.map
