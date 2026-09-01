import { r as __exportAll } from './rolldown-runtime_BMI-E3GI.mjs';
import {
  O as renderTemplate,
  S as renderComponent,
  j as addAttribute,
  k as maybeRenderHead,
  z as createAstro,
} from './sequence_AxU5uU3I.mjs';
import { a as ensure_array_like, c as attr, l as escape_html } from './dev_2mDreT1n.mjs';
import { t as createComponent } from './compiler_BjIU_xd3.mjs';
import { t as $$BaseLayout } from './BaseLayout_CuXyOlbb.mjs';
import { c as listInvitations } from './admin_BHxA83-B.mjs';
import { t as createServerSupabase } from './server_zdj2Qb-F.mjs';
import { t as getMemberSession } from './session_wgSvdIaH.mjs';
//#region src/components/svelte/AdminInvitationManager.svelte
function AdminInvitationManager($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { invitations: initialInvitations } = $$props;
    let invitations = [...initialInvitations];
    $$renderer2.push(
      `<div class="admin-invitations svelte-iyj4ef"><form class="svelte-iyj4ef"><label class="svelte-iyj4ef"><span>Label undangan</span> <input type="text"${attr('value', '')} placeholder="Mis. Grup WhatsApp Batch 2020" class="svelte-iyj4ef"/></label> <button type="submit"${attr('disabled', false, true)} class="svelte-iyj4ef">Buat tautan</button></form> `,
    );
    $$renderer2.push('<!--[-1-->');
    $$renderer2.push(`<!--]--> `);
    $$renderer2.push('<!--[-1-->');
    $$renderer2.push(
      `<!--]--> <table class="admin-invitations__table svelte-iyj4ef"><thead><tr><th class="svelte-iyj4ef">Label</th><th class="svelte-iyj4ef">Status</th><th class="svelte-iyj4ef">Dibuat</th><th class="svelte-iyj4ef"></th></tr></thead><tbody><!--[-->`,
    );
    const each_array = ensure_array_like(invitations);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let invitation = each_array[$$index];
      $$renderer2.push(
        `<tr><td class="svelte-iyj4ef">${escape_html(invitation.label)}</td><td class="svelte-iyj4ef">${escape_html(invitation.status === 'active' ? 'Aktif' : 'Dicabut')}</td><td class="svelte-iyj4ef">${escape_html(new Date(invitation.createdAt).toLocaleDateString('id-ID'))}</td><td class="svelte-iyj4ef">`,
      );
      if (invitation.status === 'active')
        $$renderer2.push(`<!--[0--><button type="button" class="svelte-iyj4ef">Cabut</button>`);
      else $$renderer2.push('<!--[-1-->');
      $$renderer2.push(`<!--]--></td></tr>`);
    }
    $$renderer2.push(`<!--]--></tbody></table></div>`);
  });
}
//#endregion
//#region src/pages/admin/invitations.astro
var invitations_exports = /* @__PURE__ */ __exportAll({
  default: () => $$Invitations,
  file: () => $$file,
  url: () => $$url,
});
createAstro('https://astro.build');
var $$Invitations = createComponent(
  async ($$result, $$props, $$slots) => {
    const Astro = $$result.createAstro($$props, $$slots);
    Astro.self = $$Invitations;
    const session = await getMemberSession(Astro);
    if (!session || session.member?.role !== 'admin' || session.member.status !== 'active')
      return new Response('Halaman tidak ditemukan.', { status: 404 });
    const supabase = createServerSupabase(Astro);
    const invitations = await listInvitations(supabase);
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
        title: 'Admin · Undangan',
        description: 'Kelola tautan undangan SoonWiki.',
        'data-astro-cid-uin4moxl': true,
      },
      {
        default: ($$result) =>
          renderTemplate`${maybeRenderHead($$result)}<main id="main-content" class="admin" data-astro-cid-uin4moxl><p class="frame-number" data-astro-cid-uin4moxl>ADMIN</p><h1 data-astro-cid-uin4moxl>Undangan</h1><nav class="admin__nav" aria-label="Navigasi admin" data-astro-cid-uin4moxl>${navLinks.map((link) => renderTemplate`<a${addAttribute(link.href, 'href')}${addAttribute(currentPath === link.href ? 'page' : void 0, 'aria-current')} data-astro-cid-uin4moxl>${link.label}</a>`)}</nav>${renderComponent(
            $$result,
            'AdminInvitationManager',
            AdminInvitationManager,
            {
              'client:load': true,
              invitations: invitations,
              'data-astro-cid-uin4moxl': true,
              'client:component-hydration': 'load',
              'client:component-path': '@/components/svelte/AdminInvitationManager.svelte',
              'client:component-export': 'default',
            },
          )}</main>`,
      },
    )}`;
  },
  'D:/development/SoonWiki/src/pages/admin/invitations.astro',
  void 0,
);
var $$file = 'D:/development/SoonWiki/src/pages/admin/invitations.astro';
var $$url = '/admin/invitations';
//#endregion
//#region \0virtual:astro:page:src/pages/admin/invitations@_@astro
var page = () => invitations_exports;
//#endregion
export { page };

//# sourceMappingURL=invitations_zL7oSgJ1.mjs.map
