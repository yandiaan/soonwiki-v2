import { r as __exportAll } from './rolldown-runtime_BMI-E3GI.mjs';
import {
  O as renderTemplate,
  S as renderComponent,
  k as maybeRenderHead,
  z as createAstro,
} from './sequence_AxU5uU3I.mjs';
import {
  a as ensure_array_like,
  c as attr,
  l as escape_html,
  r as bind_props,
} from './dev_2mDreT1n.mjs';
import { t as createComponent } from './compiler_BjIU_xd3.mjs';
import { t as $$BaseLayout } from './BaseLayout_CuXyOlbb.mjs';
import { t as createServerSupabase } from './server_zdj2Qb-F.mjs';
import { t as getMemberSession } from './session_wgSvdIaH.mjs';
import {
  a as upsertOwnProfile,
  i as replaceProfileFields,
  n as loadOwnProfile,
  r as replaceJourneyEntries,
  t as listAllFields,
} from './member-repository_DDlp2REv.mjs';
import { createBrowserClient } from '@supabase/ssr';
import { z } from 'zod';
//#region src/lib/supabase/browser.ts
function createBrowserSupabase() {
  return createBrowserClient(
    'https://gixwqgnsarwtwjlotaul.supabase.co',
    'sb_publishable_gPLV-YAyiPlxT8Bzn1oFOw_E5xAAn3e',
  );
}
//#endregion
//#region src/components/svelte/DuplicateWarning.svelte
function DuplicateWarning($$renderer, $$props) {
  $$renderer.component(($$renderer) => {
    let { candidates, onConfirm, onDismiss } = $$props;
    if (candidates.length > 0) {
      $$renderer.push(
        `<!--[0--><div class="duplicate-warning svelte-8smbvj" role="alertdialog" aria-labelledby="duplicate-warning-title"><p id="duplicate-warning-title">Ada ${escape_html(candidates.length)} profil dengan nama dan batch mirip. Apakah salah satunya kamu?</p> <ul class="svelte-8smbvj"><!--[-->`,
      );
      const each_array = ensure_array_like(candidates);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let candidate = each_array[$$index];
        $$renderer.push(
          `<li>${escape_html(candidate.name)} · Soon ${escape_html(candidate.batchYear)}</li>`,
        );
      }
      $$renderer.push(
        `<!--]--></ul> <div class="duplicate-warning__actions svelte-8smbvj"><button type="button" class="svelte-8smbvj">Kembali periksa data</button> <button type="button" class="svelte-8smbvj">Bukan saya, lanjutkan</button></div></div>`,
      );
    } else $$renderer.push('<!--[-1-->');
    $$renderer.push(`<!--]-->`);
  });
}
//#endregion
//#region src/components/svelte/FieldPicker.svelte
function FieldPicker($$renderer, $$props) {
  $$renderer.component(($$renderer) => {
    let { availableFields, selectedFieldIds = void 0 } = $$props;
    let fields = availableFields;
    let newFieldName = '';
    let adding = false;
    $$renderer.push(
      `<div class="field-picker svelte-11i1hcy"><ul class="field-picker__list svelte-11i1hcy"><!--[-->`,
    );
    const each_array = ensure_array_like(fields);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let field = each_array[$$index];
      $$renderer.push(
        `<li><label class="svelte-11i1hcy"><input type="checkbox"${attr('checked', selectedFieldIds.includes(field.id), true)}/> <span>${escape_html(field.name)}</span></label></li>`,
      );
    }
    $$renderer.push(
      `<!--]--></ul> <div class="field-picker__add svelte-11i1hcy"><input type="text" placeholder="Tambah hal yang ditekuni baru"${attr('value', newFieldName)} class="svelte-11i1hcy"/> <button type="button"${attr('disabled', adding, true)} class="svelte-11i1hcy">Tambah</button></div></div>`,
    );
    bind_props($$props, { selectedFieldIds });
  });
}
//#endregion
//#region src/components/svelte/JourneyEditor.svelte
function JourneyEditor($$renderer, $$props) {
  $$renderer.component(($$renderer) => {
    let { entries = void 0 } = $$props;
    $$renderer.push(`<div class="journey-editor svelte-1feeepj"><!--[-->`);
    const each_array = ensure_array_like(entries);
    for (let index = 0, $$length = each_array.length; index < $$length; index++) {
      let entry = each_array[index];
      $$renderer.push(
        `<fieldset class="journey-editor__item svelte-1feeepj"><legend class="svelte-1feeepj">Perjalanan ${escape_html(index + 1)}</legend> <label class="svelte-1feeepj"><span>Peran atau kegiatan</span> <input type="text"${attr('value', entry.activity)} placeholder="Mis. Relawan komunitas lokal" class="svelte-1feeepj"/></label> <label class="svelte-1feeepj"><span>Tempat, organisasi, atau usaha (opsional)</span> <input type="text"${attr('value', entry.placeName)} class="svelte-1feeepj"/></label> <div class="journey-editor__years svelte-1feeepj"><label class="svelte-1feeepj"><span>Mulai</span> <input type="number"${attr('value', entry.startYear)} min="1900" max="2100" class="svelte-1feeepj"/></label> <label class="svelte-1feeepj"><span>Selesai</span> <input type="number"${attr('value', entry.endYear)} min="1900" max="2100" class="svelte-1feeepj"/></label></div> <label class="svelte-1feeepj"><span>Ceritanya (opsional)</span> <textarea rows="3" class="svelte-1feeepj">`,
      );
      const $$body = escape_html(entry.story);
      if ($$body) $$renderer.push(`${$$body}`);
      $$renderer.push(
        `</textarea></label> <div class="journey-editor__actions svelte-1feeepj"><button type="button"${attr('disabled', index === 0, true)} class="svelte-1feeepj">Naik</button> <button type="button"${attr('disabled', index === entries.length - 1, true)} class="svelte-1feeepj">Turun</button> <button type="button" class="svelte-1feeepj">Hapus</button></div></fieldset>`,
      );
    }
    $$renderer.push(`<!--]--> <button type="button">+ Tambah perjalanan</button></div>`);
    bind_props($$props, { entries });
  });
}
//#endregion
//#region src/components/svelte/MediaUploader.svelte
function MediaUploader($$renderer, $$props) {
  $$renderer.component(($$renderer) => {
    let { bucket, square = false, value = null, onUploaded } = $$props;
    $$renderer.push(
      `<div class="media-uploader svelte-thvaca"><label class="svelte-thvaca"><span>${escape_html(value ? 'Ganti gambar' : 'Unggah gambar')}</span> <input type="file" accept="image/jpeg,image/png,image/webp"${attr('disabled', false, true)} class="svelte-thvaca"/></label> `,
    );
    $$renderer.push('<!--[-1-->');
    $$renderer.push(`<!--]--></div>`);
  });
}
//#endregion
//#region src/components/svelte/ProudMomentEditor.svelte
function ProudMomentEditor($$renderer, $$props) {
  $$renderer.component(($$renderer) => {
    let { profileId, moments } = $$props;
    let items = moments.map((moment) => ({
      id: moment.id,
      title: moment.title,
      description: moment.description ?? '',
      placeName: moment.placeName ?? '',
      year: moment.year ? String(moment.year) : '',
      imagePath: moment.imagePath ?? '',
      externalUrl: moment.externalUrl ?? '',
      status: 'idle',
    }));
    $$renderer.push(`<div class="proud-moment-editor svelte-hiy65d">`);
    if (!profileId)
      $$renderer.push(
        `<!--[0--><p role="note">Simpan profil dulu sebelum menambahkan hal yang dibanggakan.</p>`,
      );
    else $$renderer.push('<!--[-1-->');
    $$renderer.push(`<!--]--> <!--[-->`);
    const each_array = ensure_array_like(items);
    for (let index = 0, $$length = each_array.length; index < $$length; index++) {
      let item = each_array[index];
      $$renderer.push(
        `<fieldset class="proud-moment-editor__item svelte-hiy65d"><legend class="svelte-hiy65d">Hal yang dibanggakan ${escape_html(index + 1)}</legend> <label class="svelte-hiy65d"><span>Judul</span> <input type="text"${attr('value', item.title)} class="svelte-hiy65d"/></label> <label class="svelte-hiy65d"><span>Ceritanya (opsional)</span> <textarea rows="3" class="svelte-hiy65d">`,
      );
      const $$body = escape_html(item.description);
      if ($$body) $$renderer.push(`${$$body}`);
      $$renderer.push(
        `</textarea></label> <label class="svelte-hiy65d"><span>Tempat (opsional)</span> <input type="text"${attr('value', item.placeName)} class="svelte-hiy65d"/></label> <label class="svelte-hiy65d"><span>Tahun (opsional)</span> <input type="number"${attr('value', item.year)} min="1900" max="2100" class="svelte-hiy65d"/></label> <label class="svelte-hiy65d"><span>Tautan (opsional)</span> <input type="url"${attr('value', item.externalUrl)} placeholder="https://" class="svelte-hiy65d"/></label> `,
      );
      if (profileId) {
        $$renderer.push('<!--[0-->');
        MediaUploader($$renderer, {
          bucket: 'proud-moments',
          value: item.imagePath || null,
          onUploaded: (path) => {
            item.imagePath = path;
            items = [...items];
          },
        });
      } else $$renderer.push('<!--[-1-->');
      $$renderer.push(
        `<!--]--> <div class="proud-moment-editor__actions svelte-hiy65d"><button type="button"${attr('disabled', !profileId || item.status === 'saving', true)} class="svelte-hiy65d">Simpan</button> <button type="button" class="svelte-hiy65d">Hapus</button> `,
      );
      if (item.status === 'saved') $$renderer.push(`<!--[0--><span role="status">Tersimpan</span>`);
      else $$renderer.push('<!--[-1-->');
      $$renderer.push(`<!--]--> `);
      if (item.status === 'error')
        $$renderer.push(`<!--[0--><span role="alert" class="svelte-hiy65d">Gagal menyimpan</span>`);
      else $$renderer.push('<!--[-1-->');
      $$renderer.push(`<!--]--></div></fieldset>`);
    }
    $$renderer.push(`<!--]--> <button type="button">+ Tambah hal yang dibanggakan</button></div>`);
  });
}
//#endregion
//#region src/lib/browser/local-draft.ts
function draftKey(userId) {
  return `soonwiki:profile-draft:${userId}`;
}
function clearDraft(userId) {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(draftKey(userId));
}
//#endregion
//#region src/lib/shared/profile-schema.ts
function normalizeText(value) {
  return value.normalize('NFC').trim().replace(/\s+/g, ' ');
}
function trimmedOptional(maxLength) {
  return z
    .string()
    .optional()
    .transform((value) => {
      const normalized = value ? normalizeText(value) : void 0;
      return normalized === '' ? void 0 : normalized;
    })
    .refine((value) => !value || value.length <= maxLength, {
      message: `Maksimal ${maxLength} karakter`,
    });
}
function httpsUrlOptional() {
  return z
    .string()
    .optional()
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed === '' ? void 0 : trimmed;
    })
    .refine((value) => !value || value.startsWith('https://'), {
      message: 'URL harus menggunakan https://',
    });
}
var profileInputSchema = z.object({
  name: z
    .string()
    .transform(normalizeText)
    .refine((value) => value.length >= 2 && value.length <= 160, {
      message: 'Nama harus 2–160 karakter',
    }),
  batchYear: z
    .number()
    .int()
    .min(2e3, { message: 'Batch minimal 2000' })
    .max(/* @__PURE__ */ new Date().getFullYear(), { message: 'Batch tidak boleh di masa depan' }),
  bio: trimmedOptional(500),
  location: trimmedOptional(120),
  currentActivity: trimmedOptional(200),
  currentPlaceName: trimmedOptional(160),
  sinceSoonStory: trimmedOptional(1200),
  turningPointStory: trimmedOptional(1200),
  currentDirectionStory: trimmedOptional(1200),
  linkedinUrl: httpsUrlOptional(),
  instagramUrl: httpsUrlOptional(),
  websiteUrl: httpsUrlOptional(),
  isPublished: z.boolean(),
});
z.object({
  activity: z
    .string()
    .transform(normalizeText)
    .refine((value) => value.length >= 1 && value.length <= 200, {
      message: 'Peran atau kegiatan wajib diisi, maksimal 200 karakter',
    }),
  placeName: trimmedOptional(160),
  startYear: z.number().int().min(1900).max(2100).optional(),
  endYear: z.number().int().min(1900).max(2100).optional(),
  story: trimmedOptional(1200),
});
z.object({
  title: z
    .string()
    .transform(normalizeText)
    .refine((value) => value.length >= 1 && value.length <= 200, {
      message: 'Judul wajib diisi, maksimal 200 karakter',
    }),
  description: trimmedOptional(2e3),
  placeName: trimmedOptional(160),
  year: z.number().int().min(1900).max(2100).optional(),
  imagePath: z.string().optional(),
  externalUrl: httpsUrlOptional(),
});
//#endregion
//#region src/components/svelte/ProfileEditor.svelte
function ProfileEditor($$renderer, $$props) {
  $$renderer.component(($$renderer) => {
    let {
      userId,
      initialProfile,
      initialJourneys,
      initialFieldIds,
      initialProudMoments,
      availableFields,
    } = $$props;
    function toFormState(profile) {
      return {
        name: profile?.name ?? '',
        batchYear: profile ? String(profile.batchYear) : '',
        bio: profile?.bio ?? '',
        location: profile?.location ?? '',
        currentActivity: profile?.currentActivity ?? '',
        currentPlaceName: profile?.currentPlaceName ?? '',
        sinceSoonStory: profile?.sinceSoonStory ?? '',
        turningPointStory: profile?.turningPointStory ?? '',
        currentDirectionStory: profile?.currentDirectionStory ?? '',
        linkedinUrl: profile?.linkedinUrl ?? '',
        instagramUrl: profile?.instagramUrl ?? '',
        websiteUrl: profile?.websiteUrl ?? '',
        isPublished: profile?.isPublished ?? false,
        photoPath: profile?.photoPath ?? '',
      };
    }
    function toJourneyDrafts(journeys) {
      return journeys.map((entry) => ({
        activity: entry.activity,
        placeName: entry.placeName ?? '',
        startYear: entry.startYear ? String(entry.startYear) : '',
        endYear: entry.endYear ? String(entry.endYear) : '',
        story: entry.story ?? '',
      }));
    }
    let profileId = initialProfile?.id ?? null;
    let slug = initialProfile?.slug ?? null;
    let form = toFormState(initialProfile);
    let journeys = toJourneyDrafts(initialJourneys);
    let selectedFieldIds = [...initialFieldIds];
    let saveState = 'idle';
    let errorMessage = '';
    let duplicateCandidates = [];
    async function performSave() {
      saveState = 'saving';
      errorMessage = '';
      const parsed = profileInputSchema.safeParse({
        name: form.name,
        batchYear: Number.parseInt(form.batchYear, 10),
        bio: form.bio,
        location: form.location,
        currentActivity: form.currentActivity,
        currentPlaceName: form.currentPlaceName,
        sinceSoonStory: form.sinceSoonStory,
        turningPointStory: form.turningPointStory,
        currentDirectionStory: form.currentDirectionStory,
        linkedinUrl: form.linkedinUrl,
        instagramUrl: form.instagramUrl,
        websiteUrl: form.websiteUrl,
        isPublished: form.isPublished,
      });
      if (!parsed.success) {
        saveState = 'error';
        errorMessage = parsed.error.issues[0]?.message ?? 'Ada data yang belum valid.';
        return;
      }
      const supabase = createBrowserSupabase();
      const profileResult = await upsertOwnProfile(supabase, parsed.data);
      if (!profileResult.ok) {
        saveState = 'error';
        errorMessage = 'Gagal menyimpan profil. Coba lagi.';
        return;
      }
      profileId = profileResult.data.id;
      slug = profileResult.data.slug;
      const [journeyResult, fieldResult] = await Promise.all([
        replaceJourneyEntries(
          supabase,
          profileId,
          journeys
            .filter((entry) => entry.activity.trim().length > 0)
            .map((entry) => ({
              activity: entry.activity,
              placeName: entry.placeName || void 0,
              startYear: entry.startYear ? Number.parseInt(entry.startYear, 10) : void 0,
              endYear: entry.endYear ? Number.parseInt(entry.endYear, 10) : void 0,
              story: entry.story || void 0,
            })),
        ),
        replaceProfileFields(supabase, profileId, selectedFieldIds),
      ]);
      if (!journeyResult.ok || !fieldResult.ok) {
        saveState = 'error';
        errorMessage =
          'Profil tersimpan, tapi sebagian perjalanan atau hal yang ditekuni gagal disimpan.';
        return;
      }
      saveState = 'saved';
      clearDraft(userId);
    }
    function confirmDuplicate() {
      duplicateCandidates = [];
      performSave();
    }
    function dismissDuplicate() {
      duplicateCandidates = [];
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer) {
      $$renderer.push('<!--[-1-->');
      $$renderer.push(`<!--]--> `);
      DuplicateWarning($$renderer, {
        candidates: duplicateCandidates,
        onConfirm: confirmDuplicate,
        onDismiss: dismissDuplicate,
      });
      $$renderer.push(
        `<!----> <form class="profile-editor"><section class="profile-editor__section" aria-labelledby="section-profil"><h2 id="section-profil">Profil</h2> `,
      );
      MediaUploader($$renderer, {
        bucket: 'profile-photos',
        square: true,
        value: form.photoPath || null,
        onUploaded: (path) => {
          form.photoPath = path;
        },
      });
      $$renderer.push(
        `<!----> <label><span>Nama</span> <input type="text"${attr('value', form.name)} required=""/></label> <label><span>Batch</span> <input type="number"${attr('value', form.batchYear)} min="2000" max="2100" required=""/></label> <label><span>Lagi menjalani apa sekarang? (opsional)</span> <input type="text"${attr('value', form.currentActivity)}/></label> <label><span>Tempat, organisasi, atau usaha (opsional)</span> <input type="text"${attr('value', form.currentPlaceName)}/></label> <label><span>Domisili (opsional)</span> <input type="text"${attr('value', form.location)}/></label> <label><span>Bio singkat (opsional)</span> <textarea rows="3">`,
      );
      const $$body = escape_html(form.bio);
      if ($$body) $$renderer.push(`${$$body}`);
      $$renderer.push(
        `</textarea></label> <label><span>Apa yang berubah sejak kamu di SOON? (opsional)</span> <textarea rows="4">`,
      );
      const $$body_1 = escape_html(form.sinceSoonStory);
      if ($$body_1) $$renderer.push(`${$$body_1}`);
      $$renderer.push(
        `</textarea></label> <label><span>Turning point terbesar dalam perjalananmu? (opsional)</span> <textarea rows="4">`,
      );
      const $$body_2 = escape_html(form.turningPointStory);
      if ($$body_2) $$renderer.push(`${$$body_2}`);
      $$renderer.push(
        `</textarea></label> <label><span>Apa yang sedang kamu bangun atau tuju sekarang? (opsional)</span> <textarea rows="4">`,
      );
      const $$body_3 = escape_html(form.currentDirectionStory);
      if ($$body_3) $$renderer.push(`${$$body_3}`);
      $$renderer.push(
        `</textarea></label> <label class="profile-editor__checkbox"><input type="checkbox"${attr('checked', form.isPublished, true)}/> <span>Terbitkan profil ke publik</span></label></section> <section class="profile-editor__section" aria-labelledby="section-perjalanan"><h2 id="section-perjalanan">Perjalanan</h2> `,
      );
      JourneyEditor($$renderer, {
        get entries() {
          return journeys;
        },
        set entries($$value) {
          journeys = $$value;
          $$settled = false;
        },
      });
      $$renderer.push(
        `<!----></section> <section class="profile-editor__section" aria-labelledby="section-fields"><h2 id="section-fields">Hal yang ditekuni</h2> `,
      );
      FieldPicker($$renderer, {
        availableFields,
        get selectedFieldIds() {
          return selectedFieldIds;
        },
        set selectedFieldIds($$value) {
          selectedFieldIds = $$value;
          $$settled = false;
        },
      });
      $$renderer.push(
        `<!----></section> <section class="profile-editor__section" aria-labelledby="section-proud"><h2 id="section-proud">Hal yang dibanggakan</h2> `,
      );
      ProudMomentEditor($$renderer, {
        profileId,
        moments: initialProudMoments,
      });
      $$renderer.push(
        `<!----></section> <section class="profile-editor__section" aria-labelledby="section-links"><h2 id="section-links">Tautan</h2> <label><span>LinkedIn (opsional)</span> <input type="url"${attr('value', form.linkedinUrl)} placeholder="https://"/></label> <label><span>Instagram (opsional)</span> <input type="url"${attr('value', form.instagramUrl)} placeholder="https://"/></label> <label><span>Situs (opsional)</span> <input type="url"${attr('value', form.websiteUrl)} placeholder="https://"/></label></section> <div class="profile-editor__sticky">`,
      );
      if (slug)
        $$renderer.push(
          `<!--[0--><a${attr('href', `/people/${slug}`)} target="_blank" rel="noreferrer">Lihat pratinjau publik</a>`,
        );
      else $$renderer.push('<!--[-1-->');
      $$renderer.push(`<!--]--> <span class="profile-editor__status" role="status">`);
      if (saveState === 'saving') $$renderer.push(`<!--[0-->Menyimpan…`);
      else if (saveState === 'saved') $$renderer.push(`<!--[1-->Tersimpan`);
      else if (saveState === 'error') $$renderer.push(`<!--[2-->${escape_html(errorMessage)}`);
      else if (saveState === 'dirty') $$renderer.push(`<!--[3-->Ada perubahan belum tersimpan`);
      else $$renderer.push('<!--[-1-->');
      $$renderer.push(
        `<!--]--></span> <button type="button"${attr('disabled', saveState === 'saving', true)}>Simpan</button></div></form>`,
      );
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer.subsume($$inner_renderer);
  });
}
//#endregion
//#region src/pages/me/edit.astro
var edit_exports = /* @__PURE__ */ __exportAll({
  default: () => $$Edit,
  file: () => $$file,
  url: () => $$url,
});
createAstro('https://astro.build');
var $$Edit = createComponent(
  async ($$result, $$props, $$slots) => {
    const Astro = $$result.createAstro($$props, $$slots);
    Astro.self = $$Edit;
    const session = await getMemberSession(Astro);
    if (!session) return Astro.redirect('/login');
    if (!session.member || session.member.status !== 'active')
      return Astro.redirect('/join-required');
    const supabase = createServerSupabase(Astro);
    const [profileResult, availableFields] = await Promise.all([
      loadOwnProfile(supabase),
      listAllFields(supabase),
    ]);
    if (!profileResult.ok)
      return new Response('Terjadi kesalahan saat memuat profil.', { status: 500 });
    const bundle = profileResult.data;
    return renderTemplate`${renderComponent(
      $$result,
      'BaseLayout',
      $$BaseLayout,
      {
        title: 'Edit profil',
        description: 'Perbarui perjalanan SoonWiki kamu.',
        'data-astro-cid-eednme3v': true,
      },
      {
        default: ($$result) =>
          renderTemplate`${maybeRenderHead($$result)}<main id="main-content" class="editor-page" data-astro-cid-eednme3v><p class="frame-number" data-astro-cid-eednme3v>EDIT PROFIL</p><h1 data-astro-cid-eednme3v>Ceritakan perjalananmu</h1><p data-astro-cid-eednme3v>Isi minimal nama dan batch untuk mulai. Bagian lain boleh menyusul kapan saja — kamu bisa menyimpan lalu kembali lagi nanti.</p>${renderComponent(
            $$result,
            'ProfileEditor',
            ProfileEditor,
            {
              'client:load': true,
              userId: session.user.id,
              initialProfile: bundle?.profile ?? null,
              initialJourneys: bundle?.journeys ?? [],
              initialFieldIds: bundle?.fieldIds ?? [],
              initialProudMoments: bundle?.proudMoments ?? [],
              availableFields: availableFields,
              'data-astro-cid-eednme3v': true,
              'client:component-hydration': 'load',
              'client:component-path': '@/components/svelte/ProfileEditor.svelte',
              'client:component-export': 'default',
            },
          )}</main>`,
      },
    )}`;
  },
  'D:/development/SoonWiki/src/pages/me/edit.astro',
  void 0,
);
var $$file = 'D:/development/SoonWiki/src/pages/me/edit.astro';
var $$url = '/me/edit';
//#endregion
//#region \0virtual:astro:page:src/pages/me/edit@_@astro
var page = () => edit_exports;
//#endregion
export { page };

//# sourceMappingURL=edit_CZRMHnHY.mjs.map
