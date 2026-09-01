import { createServerSupabase } from '@/lib/supabase/server';

import type {
  ExploreResult,
  HomeStory,
  JourneyChapter,
  ProfileCard,
  ProfileDetail,
  ProudMoment,
} from '@/lib/shared/public-models';
import type { APIContext } from 'astro';

export type RepositoryResult<T> =
  { ok: true; data: T } | { ok: false; code: 'NOT_FOUND' | 'UNAVAILABLE'; requestId?: string };

type ServerContext = Pick<APIContext, 'request' | 'cookies'>;

interface ProfileCardLike {
  id: string | null;
  slug: string | null;
  name: string | null;
  photo_path: string | null;
  batch_year: number | null;
  current_activity: string | null;
  current_place_name: string | null;
  current_place_slug: string | null;
  field_labels: string[] | null;
  updated_at: string | null;
}

function toProfileCard(row: ProfileCardLike): ProfileCard {
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
    updatedAt: row.updated_at ?? new Date().toISOString(),
  };
}

export interface SearchFilters {
  query?: string;
  fieldSlug?: string;
  batchYear?: number;
  placeSlug?: string;
  limit?: number;
  offset?: number;
}

export async function searchPublishedProfiles(
  context: ServerContext,
  filters: SearchFilters,
): Promise<RepositoryResult<ExploreResult>> {
  const supabase = createServerSupabase(context);
  const { data, error } = await supabase.rpc('search_profiles', {
    ...(filters.query !== undefined && { query: filters.query }),
    ...(filters.fieldSlug !== undefined && { field_slug: filters.fieldSlug }),
    ...(filters.batchYear !== undefined && { batch_year: filters.batchYear }),
    ...(filters.placeSlug !== undefined && { place_slug: filters.placeSlug }),
    result_limit: filters.limit ?? 20,
    result_offset: filters.offset ?? 0,
  });

  if (error) {
    return { ok: false, code: 'UNAVAILABLE' };
  }

  const profiles = (data ?? []).map(toProfileCard);
  return { ok: true, data: { profiles, total: profiles.length } };
}

export async function getProfileBySlug(
  context: ServerContext,
  slug: string,
): Promise<RepositoryResult<ProfileDetail>> {
  const supabase = createServerSupabase(context);

  const { data: profile, error: profileError } = await supabase
    .from('published_profile_details')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (profileError) {
    return { ok: false, code: 'UNAVAILABLE' };
  }

  if (!profile || !profile.id) {
    return { ok: false, code: 'NOT_FOUND' };
  }

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
      .order('year', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false }),
    supabase.from('published_profile_cards').select('*').neq('id', profile.id).limit(6),
  ]);

  const journeys: JourneyChapter[] = (journeyResult.data ?? []).map((row) => ({
    id: row.id,
    activity: row.activity,
    placeName: row.places?.name ?? null,
    startYear: row.start_year,
    endYear: row.end_year,
    story: row.story,
  }));

  const fieldLabels = (fieldResult.data ?? [])
    .map((row) => row.fields?.name)
    .filter((name): name is string => Boolean(name));

  const proudMoments: ProudMoment[] = (proudResult.data ?? []).map((row) => ({
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
      updatedAt: profile.updated_at ?? new Date().toISOString(),
    },
  };
}

export async function getHomeStoryData(
  context: ServerContext,
): Promise<RepositoryResult<HomeStory>> {
  const supabase = createServerSupabase(context);

  const { data: candidates, error } = await supabase
    .from('published_profile_details')
    .select('id, slug, since_soon_story, turning_point_story, current_direction_story, updated_at')
    .order('updated_at', { ascending: false })
    .limit(20);

  if (error) {
    return { ok: false, code: 'UNAVAILABLE' };
  }

  if (!candidates || candidates.length === 0) {
    return { ok: false, code: 'NOT_FOUND' };
  }

  const richness = (row: (typeof candidates)[number]) =>
    [row.since_soon_story, row.turning_point_story, row.current_direction_story].filter(Boolean)
      .length;

  const featuredRow = [...candidates].sort((a, b) => richness(b) - richness(a))[0];

  if (!featuredRow?.slug) {
    return { ok: false, code: 'NOT_FOUND' };
  }

  const featuredResult = await getProfileBySlug(context, featuredRow.slug);

  if (!featuredResult.ok) {
    return featuredResult;
  }

  const { data: contactSheetRows } = await supabase
    .from('published_profile_cards')
    .select('*')
    .neq('id', featuredRow.id)
    .order('updated_at', { ascending: false })
    .limit(12);

  const { count } = await supabase
    .from('published_profile_cards')
    .select('id', { count: 'exact', head: true });

  return {
    ok: true,
    data: {
      featured: featuredResult.data,
      contactSheet: (contactSheetRows ?? []).map(toProfileCard),
      totalPublishedProfiles: count ?? 0,
    },
  };
}

export async function getFieldCollection(
  context: ServerContext,
  slug: string,
): Promise<RepositoryResult<{ name: string; profiles: ProfileCard[] }>> {
  const supabase = createServerSupabase(context);
  const { data: field } = await supabase
    .from('fields')
    .select('name')
    .eq('slug', slug)
    .maybeSingle();

  if (!field) {
    return { ok: false, code: 'NOT_FOUND' };
  }

  const { data, error } = await supabase.rpc('search_profiles', {
    field_slug: slug,
    result_limit: 50,
  });

  if (error) {
    return { ok: false, code: 'UNAVAILABLE' };
  }

  return { ok: true, data: { name: field.name, profiles: (data ?? []).map(toProfileCard) } };
}

export async function getBatchCollection(
  context: ServerContext,
  year: number,
): Promise<RepositoryResult<{ year: number; profiles: ProfileCard[] }>> {
  if (year < 2000 || year > 2100) {
    return { ok: false, code: 'NOT_FOUND' };
  }

  const supabase = createServerSupabase(context);
  const { data, error } = await supabase.rpc('search_profiles', {
    batch_year: year,
    result_limit: 50,
  });

  if (error) {
    return { ok: false, code: 'UNAVAILABLE' };
  }

  const profiles = (data ?? []).map(toProfileCard);

  return { ok: true, data: { year, profiles } };
}

export async function getPlaceCollection(
  context: ServerContext,
  slug: string,
): Promise<RepositoryResult<{ name: string; profiles: ProfileCard[] }>> {
  const supabase = createServerSupabase(context);
  const { data: place } = await supabase
    .from('places')
    .select('name')
    .eq('slug', slug)
    .maybeSingle();

  if (!place) {
    return { ok: false, code: 'NOT_FOUND' };
  }

  const { data, error } = await supabase.rpc('search_profiles', {
    place_slug: slug,
    result_limit: 50,
  });

  if (error) {
    return { ok: false, code: 'UNAVAILABLE' };
  }

  return { ok: true, data: { name: place.name, profiles: (data ?? []).map(toProfileCard) } };
}
