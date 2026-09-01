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
  m as transferProfileOwner,
  n as deleteProfileAsAdmin,
  p as setProfilePublished,
  s as listAllProfilesForAdmin,
} from './admin_BHxA83-B.mjs';
import { t as createServerSupabase } from './server_zdj2Qb-F.mjs';
import { t as getMemberSession } from './session_wgSvdIaH.mjs';
//#region src/pages/admin/people.astro
var people_exports = /* @__PURE__ */ __exportAll({
  default: () => $$People,
  file: () => $$file,
  url: () => $$url,
});
createAstro('https://astro.build');
var $$People = createComponent(
  async ($$result, $$props, $$slots) => {
    const Astro = $$result.createAstro($$props, $$slots);
    Astro.self = $$People;
    const session = await getMemberSession(Astro);
    if (!session || session.member?.role !== 'admin' || session.member.status !== 'active')
      return new Response('Halaman tidak ditemukan.', { status: 404 });
    const supabase = createServerSupabase(Astro);
    let actionMessage = '';
    if (Astro.request.method === 'POST') {
      const form = await Astro.request.formData();
      const action = form.get('action');
      const profileId = String(form.get('profileId') ?? '');
      if (action === 'toggle-publish' && profileId) {
        const nextState = form.get('nextState') === 'true';
        actionMessage = (await setProfilePublished(supabase, profileId, nextState)).ok
          ? 'Status publikasi diperbarui.'
          : 'Gagal memperbarui status.';
      } else if (action === 'delete' && profileId)
        actionMessage = (await deleteProfileAsAdmin(supabase, profileId)).ok
          ? 'Profil dihapus.'
          : 'Gagal menghapus profil.';
      else if (action === 'transfer' && profileId) {
        const newOwnerId = String(form.get('newOwnerId') ?? '');
        actionMessage = (await transferProfileOwner(supabase, profileId, newOwnerId)).ok
          ? 'Kepemilikan dipindahkan.'
          : 'Gagal memindahkan kepemilikan.';
      }
    }
    const search = Astro.url.searchParams.get('q') ?? '';
    const profilesResult = await listAllProfilesForAdmin(supabase, search || void 0);
    const profiles = profilesResult.ok ? profilesResult.data : [];
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
        title: 'Admin · Orang',
        description: 'Kelola profil member SoonWiki.',
        'data-astro-cid-4cvwqot3': true,
      },
      {
        default: ($$result) =>
          renderTemplate`${maybeRenderHead($$result)}<main id="main-content" class="admin" data-astro-cid-4cvwqot3><p class="frame-number" data-astro-cid-4cvwqot3>ADMIN</p><h1 data-astro-cid-4cvwqot3>Orang</h1><nav class="admin__nav" aria-label="Navigasi admin" data-astro-cid-4cvwqot3>${navLinks.map((link) => renderTemplate`<a${addAttribute(link.href, 'href')}${addAttribute(currentPath === link.href ? 'page' : void 0, 'aria-current')} data-astro-cid-4cvwqot3>${link.label}</a>`)}</nav>${actionMessage && renderTemplate`<p role="status" data-astro-cid-4cvwqot3>${actionMessage}</p>`}<form class="admin__search" method="get" data-astro-cid-4cvwqot3><input type="search" name="q"${addAttribute(search, 'value')} placeholder="Cari nama" data-astro-cid-4cvwqot3><button type="submit" data-astro-cid-4cvwqot3>Cari</button></form><table data-astro-cid-4cvwqot3><thead data-astro-cid-4cvwqot3><tr data-astro-cid-4cvwqot3><th data-astro-cid-4cvwqot3>Nama</th><th data-astro-cid-4cvwqot3>Batch</th><th data-astro-cid-4cvwqot3>Status</th><th data-astro-cid-4cvwqot3>Aksi</th></tr></thead><tbody data-astro-cid-4cvwqot3>${profiles.map((profile) => renderTemplate`<tr data-astro-cid-4cvwqot3><td data-astro-cid-4cvwqot3><a${addAttribute(`/people/${profile.slug}`, 'href')} data-astro-cid-4cvwqot3>${profile.name}</a></td><td data-astro-cid-4cvwqot3>${profile.batchYear}</td><td data-astro-cid-4cvwqot3>${profile.isPublished ? 'Terbit' : 'Draf'}</td><td data-astro-cid-4cvwqot3><form class="inline" method="post" data-astro-cid-4cvwqot3><input type="hidden" name="action" value="toggle-publish" data-astro-cid-4cvwqot3><input type="hidden" name="profileId"${addAttribute(profile.id, 'value')} data-astro-cid-4cvwqot3><input type="hidden" name="nextState"${addAttribute(String(!profile.isPublished), 'value')} data-astro-cid-4cvwqot3><button type="submit" data-astro-cid-4cvwqot3>${profile.isPublished ? 'Batalkan terbit' : 'Terbitkan'}</button></form><form class="inline" method="post" data-astro-cid-4cvwqot3><input type="hidden" name="action" value="delete" data-astro-cid-4cvwqot3><input type="hidden" name="profileId"${addAttribute(profile.id, 'value')} data-astro-cid-4cvwqot3><button type="submit" data-astro-cid-4cvwqot3>Hapus</button></form><form class="inline" method="post" data-astro-cid-4cvwqot3><input type="hidden" name="action" value="transfer" data-astro-cid-4cvwqot3><input type="hidden" name="profileId"${addAttribute(profile.id, 'value')} data-astro-cid-4cvwqot3><input type="text" name="newOwnerId" placeholder="user_id pemilik baru" data-astro-cid-4cvwqot3><button type="submit" data-astro-cid-4cvwqot3>Pindahkan</button></form></td></tr>`)}</tbody></table></main>`,
      },
    )}`;
  },
  'D:/development/SoonWiki/src/pages/admin/people.astro',
  void 0,
);
var $$file = 'D:/development/SoonWiki/src/pages/admin/people.astro';
var $$url = '/admin/people';
//#endregion
//#region \0virtual:astro:page:src/pages/admin/people@_@astro
var page = () => people_exports;
//#endregion
export { page };

//# sourceMappingURL=people_D6Spnwvy.mjs.map
