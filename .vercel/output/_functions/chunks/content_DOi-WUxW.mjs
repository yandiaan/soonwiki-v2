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
  l as listRecentContent,
  r as deleteProudMomentAsAdmin,
  t as deleteJourneyEntryAsAdmin,
} from './admin_BHxA83-B.mjs';
import { t as createServerSupabase } from './server_zdj2Qb-F.mjs';
import { t as getMemberSession } from './session_wgSvdIaH.mjs';
//#region src/pages/admin/content.astro
var content_exports = /* @__PURE__ */ __exportAll({
  default: () => $$Content,
  file: () => $$file,
  url: () => $$url,
});
createAstro('https://astro.build');
var $$Content = createComponent(
  async ($$result, $$props, $$slots) => {
    const Astro = $$result.createAstro($$props, $$slots);
    Astro.self = $$Content;
    const session = await getMemberSession(Astro);
    if (!session || session.member?.role !== 'admin' || session.member.status !== 'active')
      return new Response('Halaman tidak ditemukan.', { status: 404 });
    const supabase = createServerSupabase(Astro);
    let actionMessage = '';
    if (Astro.request.method === 'POST') {
      const form = await Astro.request.formData();
      const kind = form.get('kind');
      const id = String(form.get('id') ?? '');
      if (id)
        actionMessage = (kind === 'journey_entry'
          ? await deleteJourneyEntryAsAdmin(supabase, id)
          : await deleteProudMomentAsAdmin(supabase, id)
        ).ok
          ? 'Konten dihapus.'
          : 'Gagal menghapus konten.';
    }
    const content = await listRecentContent(supabase);
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
        title: 'Admin · Konten',
        description: 'Moderasi perjalanan dan hal yang dibanggakan.',
        'data-astro-cid-ev227uxa': true,
      },
      {
        default: ($$result) =>
          renderTemplate`${maybeRenderHead($$result)}<main id="main-content" class="admin" data-astro-cid-ev227uxa><p class="frame-number" data-astro-cid-ev227uxa>ADMIN</p><h1 data-astro-cid-ev227uxa>Konten</h1><nav class="admin__nav" aria-label="Navigasi admin" data-astro-cid-ev227uxa>${navLinks.map((link) => renderTemplate`<a${addAttribute(link.href, 'href')}${addAttribute(currentPath === link.href ? 'page' : void 0, 'aria-current')} data-astro-cid-ev227uxa>${link.label}</a>`)}</nav>${actionMessage && renderTemplate`<p role="status" data-astro-cid-ev227uxa>${actionMessage}</p>`}<table data-astro-cid-ev227uxa><thead data-astro-cid-ev227uxa><tr data-astro-cid-ev227uxa><th data-astro-cid-ev227uxa>Jenis</th><th data-astro-cid-ev227uxa>Judul</th><th data-astro-cid-ev227uxa>Pemilik profil</th><th data-astro-cid-ev227uxa>Aksi</th></tr></thead><tbody data-astro-cid-ev227uxa>${content.map((item) => renderTemplate`<tr data-astro-cid-ev227uxa><td data-astro-cid-ev227uxa>${item.kind === 'journey_entry' ? 'Perjalanan' : 'Hal yang dibanggakan'}</td><td data-astro-cid-ev227uxa>${item.title}</td><td data-astro-cid-ev227uxa>${item.profileName}</td><td data-astro-cid-ev227uxa><form class="inline" method="post" data-astro-cid-ev227uxa><input type="hidden" name="kind"${addAttribute(item.kind, 'value')} data-astro-cid-ev227uxa><input type="hidden" name="id"${addAttribute(item.id, 'value')} data-astro-cid-ev227uxa><button type="submit" data-astro-cid-ev227uxa>Hapus</button></form></td></tr>`)}</tbody></table></main>`,
      },
    )}`;
  },
  'D:/development/SoonWiki/src/pages/admin/content.astro',
  void 0,
);
var $$file = 'D:/development/SoonWiki/src/pages/admin/content.astro';
var $$url = '/admin/content';
//#endregion
//#region \0virtual:astro:page:src/pages/admin/content@_@astro
var page = () => content_exports;
//#endregion
export { page };

//# sourceMappingURL=content_DOi-WUxW.mjs.map
