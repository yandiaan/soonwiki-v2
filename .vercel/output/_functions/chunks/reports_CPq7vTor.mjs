import { r as __exportAll } from './rolldown-runtime_BMI-E3GI.mjs';
import {
  O as renderTemplate,
  S as renderComponent,
  j as addAttribute,
  k as maybeRenderHead,
  z as createAstro,
} from './sequence_AxU5uU3I.mjs';
import { a as ensure_array_like, l as escape_html } from './dev_2mDreT1n.mjs';
import { t as createComponent } from './compiler_BjIU_xd3.mjs';
import { t as $$BaseLayout } from './BaseLayout_CuXyOlbb.mjs';
import { u as listReports } from './admin_BHxA83-B.mjs';
import { t as createServerSupabase } from './server_zdj2Qb-F.mjs';
import { t as getMemberSession } from './session_wgSvdIaH.mjs';
//#region src/components/svelte/AdminReportQueue.svelte
function AdminReportQueue($$renderer, $$props) {
  $$renderer.component(($$renderer) => {
    let { reports: initialReports, adminUserId } = $$props;
    let reports = [...initialReports];
    const reasonLabels = {
      incorrect_information: 'Informasi tidak tepat',
      inappropriate_content: 'Konten tidak pantas',
      impersonation: 'Meniru orang lain',
      other: 'Lainnya',
    };
    $$renderer.push(`<ul class="admin-reports svelte-139uvpg"><!--[-->`);
    const each_array = ensure_array_like(reports);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let report = each_array[$$index];
      $$renderer.push(
        `<li class="svelte-139uvpg"><p class="admin-reports__reason svelte-139uvpg">${escape_html(reasonLabels[report.reason] ?? report.reason)}</p> `,
      );
      if (report.description) $$renderer.push(`<!--[0--><p>${escape_html(report.description)}</p>`);
      else $$renderer.push('<!--[-1-->');
      $$renderer.push(
        `<!--]--> <p class="admin-reports__meta svelte-139uvpg">Status: ${escape_html(report.status)} · ${escape_html(new Date(report.createdAt).toLocaleDateString('id-ID'))}</p> `,
      );
      if (report.status === 'open')
        $$renderer.push(
          `<!--[0--><div class="admin-reports__actions svelte-139uvpg"><button type="button" class="svelte-139uvpg">Tandai selesai</button> <button type="button" class="svelte-139uvpg">Abaikan</button></div>`,
        );
      else $$renderer.push('<!--[-1-->');
      $$renderer.push(`<!--]--></li>`);
    }
    $$renderer.push(`<!--]--> `);
    if (reports.length === 0)
      $$renderer.push(`<!--[0--><li class="svelte-139uvpg">Tidak ada laporan.</li>`);
    else $$renderer.push('<!--[-1-->');
    $$renderer.push(`<!--]--></ul>`);
  });
}
//#endregion
//#region src/pages/admin/reports.astro
var reports_exports = /* @__PURE__ */ __exportAll({
  default: () => $$Reports,
  file: () => $$file,
  url: () => $$url,
});
createAstro('https://astro.build');
var $$Reports = createComponent(
  async ($$result, $$props, $$slots) => {
    const Astro = $$result.createAstro($$props, $$slots);
    Astro.self = $$Reports;
    const session = await getMemberSession(Astro);
    if (!session || session.member?.role !== 'admin' || session.member.status !== 'active')
      return new Response('Halaman tidak ditemukan.', { status: 404 });
    const supabase = createServerSupabase(Astro);
    const reports = await listReports(supabase);
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
        title: 'Admin · Laporan',
        description: 'Tinjau laporan komunitas SoonWiki.',
        'data-astro-cid-52qkyqi2': true,
      },
      {
        default: ($$result) =>
          renderTemplate`${maybeRenderHead($$result)}<main id="main-content" class="admin" data-astro-cid-52qkyqi2><p class="frame-number" data-astro-cid-52qkyqi2>ADMIN</p><h1 data-astro-cid-52qkyqi2>Laporan</h1><nav class="admin__nav" aria-label="Navigasi admin" data-astro-cid-52qkyqi2>${navLinks.map((link) => renderTemplate`<a${addAttribute(link.href, 'href')}${addAttribute(currentPath === link.href ? 'page' : void 0, 'aria-current')} data-astro-cid-52qkyqi2>${link.label}</a>`)}</nav>${renderComponent(
            $$result,
            'AdminReportQueue',
            AdminReportQueue,
            {
              'client:load': true,
              reports: reports,
              adminUserId: session.user.id,
              'data-astro-cid-52qkyqi2': true,
              'client:component-hydration': 'load',
              'client:component-path': '@/components/svelte/AdminReportQueue.svelte',
              'client:component-export': 'default',
            },
          )}</main>`,
      },
    )}`;
  },
  'D:/development/SoonWiki/src/pages/admin/reports.astro',
  void 0,
);
var $$file = 'D:/development/SoonWiki/src/pages/admin/reports.astro';
var $$url = '/admin/reports';
//#endregion
//#region \0virtual:astro:page:src/pages/admin/reports@_@astro
var page = () => reports_exports;
//#endregion
export { page };

//# sourceMappingURL=reports_CPq7vTor.mjs.map
