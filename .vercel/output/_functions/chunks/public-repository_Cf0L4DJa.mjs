import {
  O as renderTemplate,
  j as addAttribute,
  k as maybeRenderHead,
  z as createAstro,
} from './sequence_AxU5uU3I.mjs';
import { t as createComponent } from './compiler_BjIU_xd3.mjs';
import { r as publicStorageUrl } from './BaseLayout_CuXyOlbb.mjs';
import { t as createServerSupabase } from './server_zdj2Qb-F.mjs';
//#region src/lib/browser/view-transitions.ts
function viewTransitionStyle(transitionKey) {
  if (!transitionKey) return;
  return `view-transition-name: ${transitionKey}`;
}
//#endregion
//#region src/components/astro/PortraitFrame.astro
createAstro('https://astro.build');
var $$PortraitFrame = createComponent(
  ($$result, $$props, $$slots) => {
    const Astro = $$result.createAstro($$props, $$slots);
    Astro.self = $$PortraitFrame;
    const { photoPath, name, frameNumber, caption, loading = 'lazy', transitionKey } = Astro.props;
    const initials = name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
    const photoUrl = photoPath ? publicStorageUrl('profile-photos', photoPath) : null;
    return renderTemplate`${maybeRenderHead($$result)}<figure class="portrait-frame"${addAttribute(transitionKey, 'data-profile-transition-key')}${addAttribute(viewTransitionStyle(transitionKey), 'style')} data-astro-cid-crvthqin>${photoUrl ? renderTemplate`<img${addAttribute(photoUrl, 'src')}${addAttribute(name, 'alt')}${addAttribute(loading, 'loading')} decoding="async" data-astro-cid-crvthqin>` : renderTemplate`<span class="initials" aria-hidden="true" data-astro-cid-crvthqin>${initials}</span>`}${frameNumber && renderTemplate`<span class="frame-number" data-astro-cid-crvthqin>${frameNumber}</span>`}${caption && renderTemplate`<figcaption data-astro-cid-crvthqin>${caption}</figcaption>`}</figure>`;
  },
  'D:/development/SoonWiki/src/components/astro/PortraitFrame.astro',
  void 0,
);
//#endregion
//#region src/lib/server/public-repository.ts
function toProfileCard(row) {
  return {
    id: row.id ?? '',
    slug: row.slug ?? '',
    name: row.name ?? '',
    photoPath: row.photo_path,
    batchYear: row.batch_year ?? 0,
    currentActivity: row.current_activity,
    currentPlaceName: row.current_place_name,
    currentPlaceSlug: row.current_place_slug,
    fieldLabels: row.field_labels ?? [],
    updatedAt: row.updated_at ?? /* @__PURE__ */ new Date().toISOString(),
  };
}
async function searchPublishedProfiles(context, filters) {
  const { data, error } = await createServerSupabase(context).rpc('search_profiles', {
    ...(filters.query !== void 0 && { query: filters.query }),
    ...(filters.fieldSlug !== void 0 && { field_slug: filters.fieldSlug }),
    ...(filters.batchYear !== void 0 && { batch_year: filters.batchYear }),
    ...(filters.placeSlug !== void 0 && { place_slug: filters.placeSlug }),
    result_limit: filters.limit ?? 20,
    result_offset: filters.offset ?? 0,
  });
  if (error)
    return {
      ok: false,
      code: 'UNAVAILABLE',
    };
  const profiles = (data ?? []).map(toProfileCard);
  return {
    ok: true,
    data: {
      profiles,
      total: profiles.length,
    },
  };
}
async function getProfileBySlug(context, slug) {
  const supabase = createServerSupabase(context);
  const { data: profile, error: profileError } = await supabase
    .from('published_profile_details')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (profileError)
    return {
      ok: false,
      code: 'UNAVAILABLE',
    };
  if (!profile || !profile.id)
    return {
      ok: false,
      code: 'NOT_FOUND',
    };
  const [journeyResult, fieldResult, proudResult, relatedResult] = await Promise.all([
    supabase
      .from('journey_entries')
      .select('id, activity, story, start_year, end_year, places(name)')
      .eq('profile_id', profile.id)
      .order('sort_order', { ascending: true }),
    supabase.from('profile_fields').select('fields(name)').eq('profile_id', profile.id),
    supabase
      .from('proud_moments')
      .select('id, title, description, year, image_path, external_url, places(name)')
      .eq('profile_id', profile.id)
      .order('year', {
        ascending: false,
        nullsFirst: false,
      })
      .order('created_at', { ascending: false }),
    supabase.from('published_profile_cards').select('*').neq('id', profile.id).limit(6),
  ]);
  const journeys = (journeyResult.data ?? []).map((row) => ({
    id: row.id,
    activity: row.activity,
    placeName: row.places?.name ?? null,
    startYear: row.start_year,
    endYear: row.end_year,
    story: row.story,
  }));
  const fieldLabels = (fieldResult.data ?? [])
    .map((row) => row.fields?.name)
    .filter((name) => Boolean(name));
  const proudMoments = (proudResult.data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    placeName: row.places?.name ?? null,
    year: row.year,
    imagePath: row.image_path,
    externalUrl: row.external_url,
  }));
  const relatedProfiles = (relatedResult.data ?? []).map(toProfileCard);
  return {
    ok: true,
    data: {
      id: profile.id,
      slug: profile.slug ?? slug,
      name: profile.name ?? '',
      photoPath: profile.photo_path ?? null,
      batchYear: profile.batch_year ?? 0,
      bio: profile.bio ?? null,
      location: profile.location ?? null,
      currentActivity: profile.current_activity ?? null,
      currentPlaceName: profile.current_place_name ?? null,
      currentPlaceSlug: profile.current_place_slug ?? null,
      sinceSoonStory: profile.since_soon_story ?? null,
      turningPointStory: profile.turning_point_story ?? null,
      currentDirectionStory: profile.current_direction_story ?? null,
      linkedinUrl: profile.linkedin_url ?? null,
      instagramUrl: profile.instagram_url ?? null,
      websiteUrl: profile.website_url ?? null,
      journeys,
      fieldLabels,
      proudMoments,
      relatedProfiles,
      updatedAt: profile.updated_at ?? /* @__PURE__ */ new Date().toISOString(),
    },
  };
}
async function getHomeStoryData(context) {
  const supabase = createServerSupabase(context);
  const { data: candidates, error } = await supabase
    .from('published_profile_details')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(20);
  if (error)
    return {
      ok: false,
      code: 'UNAVAILABLE',
    };
  if (!candidates || candidates.length === 0)
    return {
      ok: false,
      code: 'NOT_FOUND',
    };
  const richness = (row) =>
    [row.since_soon_story, row.turning_point_story, row.current_direction_story].filter(Boolean)
      .length;
  const featuredRow = [...candidates].sort((a, b) => richness(b) - richness(a))[0];
  if (!featuredRow?.slug)
    return {
      ok: false,
      code: 'NOT_FOUND',
    };
  const featuredResult = await getProfileBySlug(context, featuredRow.slug);
  if (!featuredResult.ok) return featuredResult;
  const { data: contactSheetRows } = await supabase
    .from('published_profile_cards')
    .select('*')
    .neq('id', featuredRow.id)
    .order('updated_at', { ascending: false })
    .limit(12);
  const turningPoints = candidates
    .filter((row) => Boolean(row.turning_point_story && row.slug && row.id))
    .slice(0, 3)
    .map((row) => ({
      profileId: row.id ?? '',
      profileName: row.name ?? '',
      profileSlug: row.slug ?? '',
      batchYear: row.batch_year ?? 0,
      activity: row.current_activity ?? null,
      placeName: row.current_place_name ?? null,
      quote: row.turning_point_story ?? '',
    }));
  const { count: totalPublishedProfiles } = await supabase
    .from('published_profile_cards')
    .select('id', {
      count: 'exact',
      head: true,
    });
  const { count: totalFields } = await supabase.from('fields').select('id', {
    count: 'exact',
    head: true,
  });
  const batchYears = Array.from(
    new Set(candidates.map((c) => c.batch_year).filter((y) => Boolean(y))),
  );
  const firstProudMoment = featuredResult.data.proudMoments[0];
  return {
    ok: true,
    data: {
      featured: featuredResult.data,
      contactSheet: (contactSheetRows ?? []).map(toProfileCard),
      turningPoints,
      proudMoment: firstProudMoment,
      totalPublishedProfiles: totalPublishedProfiles ?? candidates.length,
      stats: {
        totalStories: totalPublishedProfiles ?? candidates.length,
        totalFields: totalFields ?? 8,
        totalBatches: Math.max(batchYears.length, 1),
      },
    },
  };
}
async function getFieldCollection(context, slug) {
  const supabase = createServerSupabase(context);
  const { data: field } = await supabase
    .from('fields')
    .select('name')
    .eq('slug', slug)
    .maybeSingle();
  if (!field)
    return {
      ok: false,
      code: 'NOT_FOUND',
    };
  const { data, error } = await supabase.rpc('search_profiles', {
    field_slug: slug,
    result_limit: 50,
  });
  if (error)
    return {
      ok: false,
      code: 'UNAVAILABLE',
    };
  return {
    ok: true,
    data: {
      name: field.name,
      profiles: (data ?? []).map(toProfileCard),
    },
  };
}
async function getBatchCollection(context, year) {
  if (year < 2e3 || year > 2100)
    return {
      ok: false,
      code: 'NOT_FOUND',
    };
  const { data, error } = await createServerSupabase(context).rpc('search_profiles', {
    batch_year: year,
    result_limit: 50,
  });
  if (error)
    return {
      ok: false,
      code: 'UNAVAILABLE',
    };
  return {
    ok: true,
    data: {
      year,
      profiles: (data ?? []).map(toProfileCard),
    },
  };
}
async function getPlaceCollection(context, slug) {
  const supabase = createServerSupabase(context);
  const { data: place } = await supabase
    .from('places')
    .select('name')
    .eq('slug', slug)
    .maybeSingle();
  if (!place)
    return {
      ok: false,
      code: 'NOT_FOUND',
    };
  const { data, error } = await supabase.rpc('search_profiles', {
    place_slug: slug,
    result_limit: 50,
  });
  if (error)
    return {
      ok: false,
      code: 'UNAVAILABLE',
    };
  return {
    ok: true,
    data: {
      name: place.name,
      profiles: (data ?? []).map(toProfileCard),
    },
  };
}
//#endregion
export {
  getProfileBySlug as a,
  getPlaceCollection as i,
  getFieldCollection as n,
  searchPublishedProfiles as o,
  getHomeStoryData as r,
  $$PortraitFrame as s,
  getBatchCollection as t,
};

//# sourceMappingURL=public-repository_Cf0L4DJa.mjs.map
