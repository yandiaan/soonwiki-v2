import { r as __exportAll } from './rolldown-runtime_BMI-E3GI.mjs';
import {
  O as renderTemplate,
  S as renderComponent,
  j as addAttribute,
  k as maybeRenderHead,
  z as createAstro,
} from './sequence_AxU5uU3I.mjs';
import { c as attr, l as escape_html } from './dev_2mDreT1n.mjs';
import { t as createComponent } from './compiler_BjIU_xd3.mjs';
import { r as publicStorageUrl, t as $$BaseLayout } from './BaseLayout_CuXyOlbb.mjs';
import { a as getProfileBySlug, s as $$PortraitFrame } from './public-repository_Cf0L4DJa.mjs';
import { t as $$ProfileCard } from './ProfileCard_BflUSjSo.mjs';
//#region src/components/svelte/JourneyTimeline.svelte
function JourneyTimeline($$renderer, $$props) {
  $$renderer.component(($$renderer) => {
    let { children } = $$props;
    $$renderer.push(`<div class="journey-timeline svelte-1gjf50p">`);
    children($$renderer);
    $$renderer.push(`<!----></div>`);
  });
}
//#endregion
//#region src/components/astro/JourneyChapterList.astro
createAstro('https://astro.build');
var $$JourneyChapterList = createComponent(
  ($$result, $$props, $$slots) => {
    const Astro = $$result.createAstro($$props, $$slots);
    Astro.self = $$JourneyChapterList;
    const { journeys } = Astro.props;
    function formatPeriod(entry) {
      if (entry.startYear && entry.endYear) return `${entry.startYear}–${entry.endYear}`;
      if (entry.startYear) return `${entry.startYear}–Sekarang`;
      return '';
    }
    return renderTemplate`${maybeRenderHead($$result)}<section class="journey-list" aria-labelledby="journey-list-title" data-astro-cid-guuxfvnv><h2 id="journey-list-title" data-astro-cid-guuxfvnv>Perjalanan</h2>${renderComponent(
      $$result,
      'JourneyTimeline',
      JourneyTimeline,
      {
        'client:visible': true,
        'data-astro-cid-guuxfvnv': true,
        'client:component-hydration': 'visible',
        'client:component-path': '@/components/svelte/JourneyTimeline.svelte',
        'client:component-export': 'default',
      },
      {
        default: ($$result) =>
          renderTemplate`<ol class="journey-list__items" data-astro-cid-guuxfvnv>${journeys.map((entry) => renderTemplate`<li data-journey-entry data-astro-cid-guuxfvnv>${formatPeriod(entry) && renderTemplate`<p class="journey-list__period" data-astro-cid-guuxfvnv>${formatPeriod(entry)}</p>`}<h3 data-astro-cid-guuxfvnv>${entry.activity}</h3>${entry.placeName && renderTemplate`<p class="journey-list__place" data-astro-cid-guuxfvnv>${entry.placeName}</p>`}${entry.story && renderTemplate`<p class="journey-list__story" data-astro-cid-guuxfvnv>${entry.story}</p>`}</li>`)}</ol>`,
      },
    )}</section>`;
  },
  'D:/development/SoonWiki/src/components/astro/JourneyChapterList.astro',
  void 0,
);
//#endregion
//#region src/components/astro/MetadataStrip.astro
createAstro('https://astro.build');
var $$MetadataStrip = createComponent(
  ($$result, $$props, $$slots) => {
    const Astro = $$result.createAstro($$props, $$slots);
    Astro.self = $$MetadataStrip;
    const { items } = Astro.props;
    return renderTemplate`${items.length > 0 && renderTemplate`${maybeRenderHead($$result)}<ul class="metadata-strip" data-astro-cid-am2i42sp>${items.map((item) => renderTemplate`<li data-astro-cid-am2i42sp>${item}</li>`)}</ul>`}`;
  },
  'D:/development/SoonWiki/src/components/astro/MetadataStrip.astro',
  void 0,
);
//#endregion
//#region src/components/astro/ProfileHero.astro
createAstro('https://astro.build');
var $$ProfileHero = createComponent(
  ($$result, $$props, $$slots) => {
    const Astro = $$result.createAstro($$props, $$slots);
    Astro.self = $$ProfileHero;
    const { profile } = Astro.props;
    const metadata = [
      `Soon ${profile.batchYear}`,
      profile.currentActivity,
      profile.currentPlaceName,
    ].filter((item) => Boolean(item));
    return renderTemplate`${maybeRenderHead($$result)}<header class="profile-hero" data-astro-cid-pjqa5r4l><div class="profile-hero__media" data-astro-cid-pjqa5r4l>${renderComponent(
      $$result,
      'PortraitFrame',
      $$PortraitFrame,
      {
        photoPath: profile.photoPath,
        name: profile.name,
        loading: 'eager',
        transitionKey: `profile-${profile.id}`,
        'data-astro-cid-pjqa5r4l': true,
      },
    )}</div><div class="profile-hero__body" data-astro-cid-pjqa5r4l><h1 data-astro-cid-pjqa5r4l>${profile.name}</h1>${renderComponent(
      $$result,
      'MetadataStrip',
      $$MetadataStrip,
      {
        items: metadata,
        'data-astro-cid-pjqa5r4l': true,
      },
    )}${profile.bio && renderTemplate`<p class="profile-hero__bio" data-astro-cid-pjqa5r4l>${profile.bio}</p>`}</div></header>`;
  },
  'D:/development/SoonWiki/src/components/astro/ProfileHero.astro',
  void 0,
);
//#endregion
//#region src/components/astro/ProudMomentGallery.astro
createAstro('https://astro.build');
var $$ProudMomentGallery = createComponent(
  ($$result, $$props, $$slots) => {
    const Astro = $$result.createAstro($$props, $$slots);
    Astro.self = $$ProudMomentGallery;
    const { moments } = Astro.props;
    return renderTemplate`${maybeRenderHead($$result)}<section class="proud-moment-gallery" aria-labelledby="proud-moment-gallery-title" data-astro-cid-dksgsahb><h2 id="proud-moment-gallery-title" data-astro-cid-dksgsahb>Hal yang dibanggakan</h2><ul class="proud-moment-gallery__items" data-astro-cid-dksgsahb>${moments.map(
      (moment) => {
        const imageUrl = moment.imagePath
          ? publicStorageUrl('proud-moments', moment.imagePath)
          : null;
        const caption = [moment.placeName, moment.year ? String(moment.year) : null].filter(
          (part) => Boolean(part),
        );
        return renderTemplate`<li data-astro-cid-dksgsahb>${imageUrl && renderTemplate`<figure class="proud-moment-gallery__figure" data-astro-cid-dksgsahb><img${addAttribute(imageUrl, 'src')}${addAttribute(moment.title, 'alt')} loading="lazy" decoding="async" data-astro-cid-dksgsahb></figure>`}<h3 data-astro-cid-dksgsahb>${moment.title}</h3>${moment.description && renderTemplate`<p data-astro-cid-dksgsahb>${moment.description}</p>`}${caption.length > 0 && renderTemplate`<p class="proud-moment-gallery__caption" data-astro-cid-dksgsahb>${caption.join(' · ')}</p>`}${moment.externalUrl && renderTemplate`<a${addAttribute(moment.externalUrl, 'href')} target="_blank" rel="noreferrer" data-astro-cid-dksgsahb>Lihat selengkapnya</a>`}</li>`;
      },
    )}</ul></section>`;
  },
  'D:/development/SoonWiki/src/components/astro/ProudMomentGallery.astro',
  void 0,
);
//#endregion
//#region src/components/astro/RelatedJourneys.astro
createAstro('https://astro.build');
var $$RelatedJourneys = createComponent(
  ($$result, $$props, $$slots) => {
    const Astro = $$result.createAstro($$props, $$slots);
    Astro.self = $$RelatedJourneys;
    const { profiles } = Astro.props;
    return renderTemplate`${maybeRenderHead($$result)}<section class="related-journeys" aria-labelledby="related-journeys-title" data-astro-cid-a5k5g2ef><h2 id="related-journeys-title" data-astro-cid-a5k5g2ef>Perjalanan lain yang mungkin menarik</h2><ul class="related-journeys__grid" data-astro-cid-a5k5g2ef>${profiles.map(
      (profile) =>
        renderTemplate`<li data-astro-cid-a5k5g2ef>${renderComponent(
          $$result,
          'ProfileCard',
          $$ProfileCard,
          {
            profile: profile,
            'data-astro-cid-a5k5g2ef': true,
          },
        )}</li>`,
    )}</ul></section>`;
  },
  'D:/development/SoonWiki/src/components/astro/RelatedJourneys.astro',
  void 0,
);
//#endregion
//#region src/components/astro/StoryChapter.astro
createAstro('https://astro.build');
var $$StoryChapter = createComponent(
  ($$result, $$props, $$slots) => {
    const Astro = $$result.createAstro($$props, $$slots);
    Astro.self = $$StoryChapter;
    const { label, story, frameNumber, variant = 'default' } = Astro.props;
    return renderTemplate`${maybeRenderHead($$result)}<article${addAttribute(`story-chapter story-chapter--${variant}`, 'class')} data-story-chapter data-astro-cid-sj2iwkdf>${frameNumber && renderTemplate`<p class="frame-number" data-astro-cid-sj2iwkdf>${frameNumber}</p>`}<p class="label" data-astro-cid-sj2iwkdf>${label}</p>${variant === 'pullquote' ? renderTemplate`<blockquote class="story-chapter__quote" data-astro-cid-sj2iwkdf><span class="story-chapter__mark" aria-hidden="true" data-astro-cid-sj2iwkdf>“</span>${story}</blockquote>` : renderTemplate`<p class="story" data-astro-cid-sj2iwkdf>${story}</p>`}</article>`;
  },
  'D:/development/SoonWiki/src/components/astro/StoryChapter.astro',
  void 0,
);
//#endregion
//#region src/components/svelte/ReportDialog.svelte
function ReportDialog($$renderer, $$props) {
  $$renderer.component(($$renderer) => {
    let { profileId } = $$props;
    let description = '';
    $$renderer.push(
      `<button type="button" class="report-dialog__trigger svelte-196ay96">Laporkan profil ini</button> <dialog class="report-dialog svelte-196ay96"><form><h2 class="svelte-196ay96">Laporkan profil ini</h2> `,
    );
    {
      $$renderer.push(
        `<!--[-1--><fieldset class="svelte-196ay96"><legend class="svelte-196ay96">Alasan</legend> <label class="svelte-196ay96"><input type="radio"${attr('checked', true, true)} value="incorrect_information"/> Informasi tidak tepat</label> <label class="svelte-196ay96"><input type="radio"${attr('checked', false, true)} value="inappropriate_content"/> Konten tidak pantas</label> <label class="svelte-196ay96"><input type="radio"${attr('checked', false, true)} value="impersonation"/> Meniru orang lain</label> <label class="svelte-196ay96"><input type="radio"${attr('checked', false, true)} value="other"/> Lainnya</label></fieldset> <label class="svelte-196ay96"><span>Detail (opsional)</span> <textarea rows="3" class="svelte-196ay96">`,
      );
      const $$body = escape_html(description);
      if ($$body) $$renderer.push(`${$$body}`);
      $$renderer.push(`</textarea></label> `);
      $$renderer.push('<!--[-1-->');
      $$renderer.push(
        `<!--]--> <div class="report-dialog__actions svelte-196ay96"><button type="button" class="svelte-196ay96">Batal</button> <button type="button"${attr('disabled', false, true)} class="svelte-196ay96">Kirim laporan</button></div>`,
      );
    }
    $$renderer.push(`<!--]--></form></dialog>`);
  });
}
//#endregion
//#region src/pages/people/[slug].astro
var _slug__exports = /* @__PURE__ */ __exportAll({
  default: () => $$Slug,
  file: () => $$file,
  url: () => $$url,
});
createAstro('https://astro.build');
var $$Slug = createComponent(
  async ($$result, $$props, $$slots) => {
    const Astro = $$result.createAstro($$props, $$slots);
    Astro.self = $$Slug;
    const { slug } = Astro.params;
    if (!slug) return new Response('Profil tidak ditemukan.', { status: 404 });
    const result = await getProfileBySlug(Astro, slug);
    if (!result.ok) return new Response('Profil tidak ditemukan.', { status: 404 });
    const profile = result.data;
    const socialLinks = [
      profile.linkedinUrl && {
        href: profile.linkedinUrl,
        label: 'LinkedIn',
      },
      profile.instagramUrl && {
        href: profile.instagramUrl,
        label: 'Instagram',
      },
      profile.websiteUrl && {
        href: profile.websiteUrl,
        label: 'Situs',
      },
    ].filter((link) => Boolean(link));
    const image = profile.photoPath
      ? publicStorageUrl('profile-photos', profile.photoPath)
      : void 0;
    return renderTemplate`${renderComponent(
      $$result,
      'BaseLayout',
      $$BaseLayout,
      {
        title: profile.name,
        description: profile.bio ?? `Perjalanan ${profile.name} dari SOON.`,
        canonical: new URL(`/people/${profile.slug}`, Astro.url),
        ...(image ? { image } : {}),
      },
      {
        default: ($$result) =>
          renderTemplate`${maybeRenderHead($$result)}<main id="main-content" class="profile">${renderComponent($$result, 'ProfileHero', $$ProfileHero, { profile: profile })}${
            profile.sinceSoonStory &&
            renderTemplate`${renderComponent($$result, 'StoryChapter', $$StoryChapter, {
              label: 'Sejak SOON',
              story: profile.sinceSoonStory,
            })}`
          }${profile.journeys.length > 0 && renderTemplate`${renderComponent($$result, 'JourneyChapterList', $$JourneyChapterList, { journeys: profile.journeys })}`}${
            profile.turningPointStory &&
            renderTemplate`${renderComponent($$result, 'StoryChapter', $$StoryChapter, {
              label: 'Turning point',
              story: profile.turningPointStory,
            })}`
          }${profile.proudMoments.length > 0 && renderTemplate`${renderComponent($$result, 'ProudMomentGallery', $$ProudMomentGallery, { moments: profile.proudMoments })}`}${
            profile.currentDirectionStory &&
            renderTemplate`${renderComponent($$result, 'StoryChapter', $$StoryChapter, {
              label: 'Arah sekarang',
              story: profile.currentDirectionStory,
            })}`
          }${profile.fieldLabels.length > 0 && renderTemplate`${renderComponent($$result, 'MetadataStrip', $$MetadataStrip, { items: profile.fieldLabels })}`}${socialLinks.length > 0 && renderTemplate`<ul class="profile__social">${socialLinks.map((link) => renderTemplate`<li><a${addAttribute(link.href, 'href')} target="_blank" rel="noreferrer">${link.label}</a></li>`)}</ul>`}${profile.relatedProfiles.length > 0 && renderTemplate`${renderComponent($$result, 'RelatedJourneys', $$RelatedJourneys, { profiles: profile.relatedProfiles })}`}<div class="profile__report">${renderComponent(
            $$result,
            'ReportDialog',
            ReportDialog,
            {
              'client:visible': true,
              profileId: profile.id,
              'client:component-hydration': 'visible',
              'client:component-path': '@/components/svelte/ReportDialog.svelte',
              'client:component-export': 'default',
            },
          )}</div></main>`,
      },
    )}`;
  },
  'D:/development/SoonWiki/src/pages/people/[slug].astro',
  void 0,
);
var $$file = 'D:/development/SoonWiki/src/pages/people/[slug].astro';
var $$url = '/people/[slug]';
//#endregion
//#region \0virtual:astro:page:src/pages/people/[slug]@_@astro
var page = () => _slug__exports;
//#endregion
export { page };

//# sourceMappingURL=_slug__kAdqB3sA.mjs.map
