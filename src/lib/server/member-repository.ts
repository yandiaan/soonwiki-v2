import type { JourneyInput, ProfileInput, ProudMomentInput } from '@/lib/shared/profile-schema';
import type { Database } from '@/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';

export type MutationResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      code: 'UNAUTHORIZED' | 'NOT_FOUND' | 'VALIDATION' | 'UNAVAILABLE';
      message?: string;
    };

export interface OwnJourneyEntry {
  id: string;
  activity: string;
  placeName: string | null;
  startYear: number | null;
  endYear: number | null;
  story: string | null;
}

export interface OwnProudMoment {
  id: string;
  title: string;
  description: string | null;
  placeName: string | null;
  year: number | null;
  imagePath: string | null;
  externalUrl: string | null;
}

export interface OwnProfile {
  id: string;
  slug: string;
  name: string;
  photoPath: string | null;
  generationKey: string;
  bio: string | null;
  location: string | null;
  currentActivity: string | null;
  currentPlaceName: string | null;
  sinceSoonStory: string | null;
  turningPointStory: string | null;
  currentDirectionStory: string | null;
  linkedinUrl: string | null;
  instagramUrl: string | null;
  websiteUrl: string | null;
  isPublished: boolean;
  updatedAt: string;
}

export interface OwnProfileBundle {
  profile: OwnProfile;
  journeys: OwnJourneyEntry[];
  fieldIds: string[];
  proudMoments: OwnProudMoment[];
}

export interface DuplicateCandidate {
  id: string;
  name: string;
  slug: string;
  generationKey: string;
  photoPath: string | null;
}

type Client = SupabaseClient<Database>;

async function getPlaceName(client: Client, placeId: string | null): Promise<string | null> {
  if (!placeId) {
    return null;
  }

  const { data } = await client.from('places').select('name').eq('id', placeId).maybeSingle();
  return data?.name ?? null;
}

export async function loadOwnProfile(
  client: Client,
): Promise<MutationResult<OwnProfileBundle | null>> {
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return { ok: false, code: 'UNAUTHORIZED' };
  }

  const { data: profile, error } = await client
    .from('profiles')
    .select('*')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (error) {
    return { ok: false, code: 'UNAVAILABLE' };
  }

  if (!profile) {
    return { ok: true, data: null };
  }

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
      .order('year', { ascending: false, nullsFirst: false }),
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
        generationKey: profile.generation_key,
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

export async function resolveOrCreatePlaceId(
  client: Client,
  name: string,
): Promise<string | undefined> {
  const trimmed = name.trim();

  if (!trimmed) {
    return undefined;
  }

  const { data: existing } = await client
    .from('places')
    .select('id')
    .ilike('name', trimmed)
    .maybeSingle();

  if (existing) {
    return existing.id;
  }

  const { data: normalized } = await client.rpc('normalize_slug_source', { value: trimmed });
  const slug = normalized || trimmed.toLowerCase();

  const { data: created, error } = await client
    .from('places')
    .insert({ name: trimmed, slug })
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

export async function resolveOrCreateFieldId(
  client: Client,
  name: string,
): Promise<string | undefined> {
  const trimmed = name.trim();

  if (!trimmed) {
    return undefined;
  }

  const { data: existing } = await client
    .from('fields')
    .select('id')
    .ilike('name', trimmed)
    .maybeSingle();

  if (existing) {
    return existing.id;
  }

  const { data: normalized } = await client.rpc('normalize_slug_source', { value: trimmed });
  const slug = normalized || trimmed.toLowerCase();

  const { data: created, error } = await client
    .from('fields')
    .insert({ name: trimmed, slug })
    .select('id')
    .single();

  if (error || !created) {
    const { data: retry } = await client
      .from('fields')
      .select('id')
      .ilike('name', trimmed)
      .maybeSingle();
    return retry?.id;
  }

  return created.id;
}

export async function upsertOwnProfile(
  client: Client,
  input: ProfileInput,
): Promise<MutationResult<{ id: string; slug: string }>> {
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return { ok: false, code: 'UNAUTHORIZED' };
  }

  const { data: existing } = await client
    .from('profiles')
    .select('id, slug')
    .eq('owner_id', user.id)
    .maybeSingle();

  const currentPlaceId = input.currentPlaceName
    ? await resolveOrCreatePlaceId(client, input.currentPlaceName)
    : undefined;

  const payload = {
    owner_id: user.id,
    name: input.name,
    photo_path: input.photoPath ?? null,
    generation_key: input.generationKey,
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

    if (error || !data) {
      return { ok: false, code: 'UNAVAILABLE' };
    }

    return { ok: true, data };
  }

  const { data: normalized } = await client.rpc('normalize_slug_source', { value: input.name });
  let slug = normalized || 'soonie';

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data, error } = await client
      .from('profiles')
      .insert({ ...payload, slug })
      .select('id, slug')
      .single();

    if (!error && data) {
      return { ok: true, data };
    }

    if (error?.code === '23505') {
      slug = `${normalized || 'soonie'}-${Math.floor(Math.random() * 10000)}`;
      continue;
    }

    return { ok: false, code: 'VALIDATION' };
  }

  return { ok: false, code: 'UNAVAILABLE' };
}

export async function replaceJourneyEntries(
  client: Client,
  profileId: string,
  entries: JourneyInput[],
): Promise<MutationResult<void>> {
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

  if (error) {
    return { ok: false, code: 'UNAVAILABLE', message: error.message };
  }

  return { ok: true, data: undefined };
}

export async function replaceProfileFields(
  client: Client,
  profileId: string,
  fieldIds: string[],
): Promise<MutationResult<void>> {
  const { error } = await client.rpc('replace_own_profile_fields', {
    profile_id: profileId,
    field_ids: fieldIds,
  });

  if (error) {
    return { ok: false, code: 'UNAVAILABLE', message: error.message };
  }

  return { ok: true, data: undefined };
}

export async function upsertProudMoment(
  client: Client,
  profileId: string,
  input: ProudMomentInput,
  momentId?: string,
): Promise<MutationResult<{ id: string }>> {
  const placeId = input.placeName
    ? await resolveOrCreatePlaceId(client, input.placeName)
    : undefined;

  const payload = {
    profile_id: profileId,
    title: input.title,
    description: input.description ?? null,
    place_id: placeId ?? null,
    year: input.year ?? null,
    image_path: input.imagePath ?? null,
    external_url: input.externalUrl ?? null,
  };

  const query = momentId
    ? client.from('proud_moments').update(payload).eq('id', momentId)
    : client.from('proud_moments').insert(payload);

  const { data, error } = await query.select('id').single();

  if (error || !data) {
    return { ok: false, code: 'UNAVAILABLE' };
  }

  return { ok: true, data };
}

export async function deleteProudMoment(
  client: Client,
  momentId: string,
): Promise<MutationResult<void>> {
  const { error } = await client.from('proud_moments').delete().eq('id', momentId);

  if (error) {
    return { ok: false, code: 'UNAVAILABLE' };
  }

  return { ok: true, data: undefined };
}

export async function findDuplicateCandidates(
  client: Client,
  name: string,
  generationKey: string,
): Promise<DuplicateCandidate[]> {
  const trimmed = name.trim();

  if (!trimmed) {
    return [];
  }

  const { data } = await client
    .from('published_profile_cards')
    .select('id, name, slug, generation_key, photo_path')
    .eq('generation_key', generationKey)
    .ilike('name', `%${trimmed}%`)
    .limit(5);

  return (data ?? [])
    .filter(
      (
        row,
      ): row is typeof row & { id: string; name: string; slug: string; generation_key: string } =>
        Boolean(row.id && row.name && row.slug && row.generation_key),
    )
    .map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      generationKey: row.generation_key,
      photoPath: row.photo_path,
    }));
}

export async function listAllFields(
  client: Client,
): Promise<{ id: string; name: string; slug: string }[]> {
  const { data } = await client.from('fields').select('id, name, slug').order('name');
  return data ?? [];
}
