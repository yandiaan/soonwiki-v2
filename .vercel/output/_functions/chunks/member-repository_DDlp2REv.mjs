//#region src/lib/server/member-repository.ts
async function getPlaceName(client, placeId) {
  if (!placeId) return null;
  const { data } = await client.from('places').select('name').eq('id', placeId).maybeSingle();
  return data?.name ?? null;
}
async function loadOwnProfile(client) {
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user)
    return {
      ok: false,
      code: 'UNAUTHORIZED',
    };
  const { data: profile, error } = await client
    .from('profiles')
    .select('*')
    .eq('owner_id', user.id)
    .maybeSingle();
  if (error)
    return {
      ok: false,
      code: 'UNAVAILABLE',
    };
  if (!profile)
    return {
      ok: true,
      data: null,
    };
  const [journeyResult, fieldResult, proudResult, placeNameResult] = await Promise.all([
    client
      .from('journey_entries')
      .select('id, activity, story, start_year, end_year, places(name)')
      .eq('profile_id', profile.id)
      .order('sort_order', { ascending: true }),
    client.from('profile_fields').select('field_id').eq('profile_id', profile.id),
    client
      .from('proud_moments')
      .select('id, title, description, year, image_path, external_url, places(name)')
      .eq('profile_id', profile.id)
      .order('year', {
        ascending: false,
        nullsFirst: false,
      }),
    getPlaceName(client, profile.current_place_id),
  ]);
  return {
    ok: true,
    data: {
      profile: {
        id: profile.id,
        slug: profile.slug,
        name: profile.name,
        photoPath: profile.photo_path,
        batchYear: profile.batch_year,
        bio: profile.bio,
        location: profile.location,
        currentActivity: profile.current_activity,
        currentPlaceName: placeNameResult,
        sinceSoonStory: profile.since_soon_story,
        turningPointStory: profile.turning_point_story,
        currentDirectionStory: profile.current_direction_story,
        linkedinUrl: profile.linkedin_url,
        instagramUrl: profile.instagram_url,
        websiteUrl: profile.website_url,
        isPublished: profile.is_published,
        updatedAt: profile.updated_at,
      },
      journeys: (journeyResult.data ?? []).map((row) => ({
        id: row.id,
        activity: row.activity,
        placeName: row.places?.name ?? null,
        startYear: row.start_year,
        endYear: row.end_year,
        story: row.story,
      })),
      fieldIds: (fieldResult.data ?? []).map((row) => row.field_id),
      proudMoments: (proudResult.data ?? []).map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        placeName: row.places?.name ?? null,
        year: row.year,
        imagePath: row.image_path,
        externalUrl: row.external_url,
      })),
    },
  };
}
async function resolveOrCreatePlaceId(client, name) {
  const trimmed = name.trim();
  if (!trimmed) return;
  const { data: existing } = await client
    .from('places')
    .select('id')
    .ilike('name', trimmed)
    .maybeSingle();
  if (existing) return existing.id;
  const { data: normalized } = await client.rpc('normalize_slug_source', { value: trimmed });
  const slug = normalized || trimmed.toLowerCase();
  const { data: created, error } = await client
    .from('places')
    .insert({
      name: trimmed,
      slug,
    })
    .select('id')
    .single();
  if (error || !created) {
    const { data: retry } = await client
      .from('places')
      .select('id')
      .ilike('name', trimmed)
      .maybeSingle();
    return retry?.id;
  }
  return created.id;
}
async function upsertOwnProfile(client, input) {
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user)
    return {
      ok: false,
      code: 'UNAUTHORIZED',
    };
  const { data: existing } = await client
    .from('profiles')
    .select('id, slug')
    .eq('owner_id', user.id)
    .maybeSingle();
  const currentPlaceId = input.currentPlaceName
    ? await resolveOrCreatePlaceId(client, input.currentPlaceName)
    : void 0;
  const payload = {
    owner_id: user.id,
    name: input.name,
    batch_year: input.batchYear,
    bio: input.bio ?? null,
    location: input.location ?? null,
    current_activity: input.currentActivity ?? null,
    current_place_id: currentPlaceId ?? null,
    since_soon_story: input.sinceSoonStory ?? null,
    turning_point_story: input.turningPointStory ?? null,
    current_direction_story: input.currentDirectionStory ?? null,
    linkedin_url: input.linkedinUrl ?? null,
    instagram_url: input.instagramUrl ?? null,
    website_url: input.websiteUrl ?? null,
    is_published: input.isPublished,
  };
  if (existing) {
    const { data, error } = await client
      .from('profiles')
      .update(payload)
      .eq('id', existing.id)
      .select('id, slug')
      .single();
    if (error || !data)
      return {
        ok: false,
        code: 'UNAVAILABLE',
      };
    return {
      ok: true,
      data,
    };
  }
  const { data: normalized } = await client.rpc('normalize_slug_source', { value: input.name });
  let slug = normalized || 'soonie';
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data, error } = await client
      .from('profiles')
      .insert({
        ...payload,
        slug,
      })
      .select('id, slug')
      .single();
    if (!error && data)
      return {
        ok: true,
        data,
      };
    if (error?.code === '23505') {
      slug = `${normalized || 'soonie'}-${Math.floor(Math.random() * 1e4)}`;
      continue;
    }
    return {
      ok: false,
      code: 'VALIDATION',
    };
  }
  return {
    ok: false,
    code: 'UNAVAILABLE',
  };
}
async function replaceJourneyEntries(client, profileId, entries) {
  const resolvedEntries = await Promise.all(
    entries.map(async (entry, index) => ({
      activity: entry.activity,
      place_id: entry.placeName
        ? ((await resolveOrCreatePlaceId(client, entry.placeName)) ?? null)
        : null,
      start_year: entry.startYear ?? null,
      end_year: entry.endYear ?? null,
      story: entry.story ?? null,
      sort_order: index,
    })),
  );
  const { error } = await client.rpc('replace_own_journey_entries', {
    profile_id: profileId,
    entries: resolvedEntries,
  });
  if (error)
    return {
      ok: false,
      code: 'UNAVAILABLE',
      message: error.message,
    };
  return {
    ok: true,
    data: void 0,
  };
}
async function replaceProfileFields(client, profileId, fieldIds) {
  const { error } = await client.rpc('replace_own_profile_fields', {
    profile_id: profileId,
    field_ids: fieldIds,
  });
  if (error)
    return {
      ok: false,
      code: 'UNAVAILABLE',
      message: error.message,
    };
  return {
    ok: true,
    data: void 0,
  };
}
async function listAllFields(client) {
  const { data } = await client.from('fields').select('id, name, slug').order('name');
  return data ?? [];
}
//#endregion
export {
  upsertOwnProfile as a,
  replaceProfileFields as i,
  loadOwnProfile as n,
  replaceJourneyEntries as r,
  listAllFields as t,
};

//# sourceMappingURL=member-repository_DDlp2REv.mjs.map
