import type { Database } from '@/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';

export type AdminResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      code: 'UNAUTHORIZED' | 'NOT_FOUND' | 'VALIDATION' | 'UNAVAILABLE';
      message?: string;
    };

type Client = SupabaseClient<Database>;

export interface AdminOverview {
  totalPublishedProfiles: number;
  totalMembers: number;
  openReports: number;
}

export interface AdminProfileRow {
  id: string;
  name: string;
  slug: string;
  generationKey: string;
  isPublished: boolean;
  ownerId: string;
  updatedAt: string;
}

export interface AdminMemberProfileRow {
  userId: string;
  email: string;
  name: string;
  slug: string | null;
  generationKey: string | null;
  profileId: string | null;
  isPublished: boolean;
  hasProfile: boolean;
  updatedAt: string;
}

export interface AdminReportRow {
  id: string;
  reason: string;
  description: string | null;
  status: 'open' | 'resolved' | 'dismissed';
  profileId: string | null;
  proudMomentId: string | null;
  createdAt: string;
}

export interface AdminTaxonomyRow {
  id: string;
  name: string;
  slug: string;
}

export async function listAdminOverview(client: Client): Promise<AdminResult<AdminOverview>> {
  const [{ count: totalPublishedProfiles }, { count: totalMembers }, { count: openReports }] =
    await Promise.all([
      client.from('profiles').select('id', { count: 'exact', head: true }).eq('is_published', true),
      client
        .from('members')
        .select('user_id', { count: 'exact', head: true })
        .eq('status', 'active'),
      client.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    ]);

  return {
    ok: true,
    data: {
      totalPublishedProfiles: totalPublishedProfiles ?? 0,
      totalMembers: totalMembers ?? 0,
      openReports: openReports ?? 0,
    },
  };
}

export async function listAllProfilesForAdmin(
  client: Client,
  search?: string,
): Promise<AdminResult<AdminProfileRow[]>> {
  let query = client
    .from('profiles')
    .select('id, name, slug, generation_key, is_published, owner_id, updated_at')
    .order('updated_at', { ascending: false })
    .limit(100);

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return { ok: false, code: 'UNAVAILABLE' };
  }

  return {
    ok: true,
    data: (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      generationKey: row.generation_key,
      isPublished: row.is_published,
      ownerId: row.owner_id,
      updatedAt: row.updated_at,
    })),
  };
}

export async function listAllMemberProfilesForAdmin(
  client: Client,
  search?: string,
): Promise<AdminResult<AdminMemberProfileRow[]>> {
  // 1. Try secure RPC first
  const rpcResult = await client.rpc('admin_list_member_profiles');

  if (!rpcResult.error && rpcResult.data && Array.isArray(rpcResult.data)) {
    let list: AdminMemberProfileRow[] = rpcResult.data.map((row) => ({
      userId: row.user_id,
      email: row.email || '',
      name: row.name || 'Tanpa nama',
      slug: row.slug,
      generationKey: row.generation_key,
      profileId: row.profile_id,
      isPublished: Boolean(row.is_published),
      hasProfile: Boolean(row.has_profile),
      updatedAt: row.updated_at,
    }));

    if (search) {
      const lower = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          p.email.toLowerCase().includes(lower) ||
          (p.slug && p.slug.toLowerCase().includes(lower)),
      );
    }

    return { ok: true, data: list };
  }

  // 2. Fallback: Query profiles directly
  const profilesResult = await listAllProfilesForAdmin(client, search);
  if (!profilesResult.ok) {
    return profilesResult;
  }

  return {
    ok: true,
    data: profilesResult.data.map((p) => ({
      userId: p.ownerId,
      email: '',
      name: p.name,
      slug: p.slug,
      generationKey: p.generationKey,
      profileId: p.id,
      isPublished: p.isPublished,
      hasProfile: true,
      updatedAt: p.updatedAt,
    })),
  };
}

export async function getUnpublishedMembers(
  client: Client,
): Promise<AdminResult<Array<{ userId: string; email: string; name: string; isDraft: boolean }>>> {
  const result = await listAllMemberProfilesForAdmin(client);
  if (!result.ok) return result;

  const unpublished = result.data
    .filter((member) => !member.isPublished)
    .map((member) => ({
      userId: member.userId,
      email: member.email,
      name: member.name,
      isDraft: member.hasProfile,
    }));

  return { ok: true, data: unpublished };
}

export async function setProfilePublished(
  client: Client,
  profileId: string,
  isPublished: boolean,
): Promise<AdminResult<void>> {
  const { error } = await client
    .from('profiles')
    .update({ is_published: isPublished })
    .eq('id', profileId);

  if (error) {
    return { ok: false, code: 'UNAVAILABLE' };
  }

  return { ok: true, data: undefined };
}

export async function deleteProfileAsAdmin(
  client: Client,
  profileId: string,
): Promise<AdminResult<void>> {
  const { error } = await client.from('profiles').delete().eq('id', profileId);

  if (error) {
    return { ok: false, code: 'UNAVAILABLE' };
  }

  return { ok: true, data: undefined };
}

export async function transferProfileOwner(
  client: Client,
  profileId: string,
  newOwnerId: string,
): Promise<AdminResult<void>> {
  const { error } = await client.rpc('transfer_profile_owner', {
    profile_id: profileId,
    new_owner_id: newOwnerId,
  });

  if (error) {
    return { ok: false, code: 'VALIDATION', message: error.message };
  }

  return { ok: true, data: undefined };
}

export async function listAllFieldsForAdmin(client: Client): Promise<AdminTaxonomyRow[]> {
  const { data } = await client.from('fields').select('id, name, slug').order('name');
  return data ?? [];
}

export async function listAllPlacesForAdmin(client: Client): Promise<AdminTaxonomyRow[]> {
  const { data } = await client.from('places').select('id, name, slug').order('name');
  return data ?? [];
}

export interface AdminContentRow {
  id: string;
  kind: 'journey_entry' | 'proud_moment';
  title: string;
  profileId: string;
  profileName: string;
}

export async function listRecentContent(client: Client): Promise<AdminContentRow[]> {
  const [journeys, proudMoments] = await Promise.all([
    client
      .from('journey_entries')
      .select('id, activity, profile_id, profiles(name)')
      .order('created_at', { ascending: false })
      .limit(25),
    client
      .from('proud_moments')
      .select('id, title, profile_id, profiles(name)')
      .order('created_at', { ascending: false })
      .limit(25),
  ]);

  const journeyRows: AdminContentRow[] = (journeys.data ?? []).map((row) => ({
    id: row.id,
    kind: 'journey_entry',
    title: row.activity,
    profileId: row.profile_id,
    profileName: row.profiles?.name ?? 'Tanpa nama',
  }));

  const proudRows: AdminContentRow[] = (proudMoments.data ?? []).map((row) => ({
    id: row.id,
    kind: 'proud_moment',
    title: row.title,
    profileId: row.profile_id,
    profileName: row.profiles?.name ?? 'Tanpa nama',
  }));

  return [...journeyRows, ...proudRows];
}

export async function deleteJourneyEntryAsAdmin(
  client: Client,
  id: string,
): Promise<AdminResult<void>> {
  const { error } = await client.from('journey_entries').delete().eq('id', id);

  if (error) {
    return { ok: false, code: 'UNAVAILABLE' };
  }

  return { ok: true, data: undefined };
}

export async function deleteProudMomentAsAdmin(
  client: Client,
  id: string,
): Promise<AdminResult<void>> {
  const { error } = await client.from('proud_moments').delete().eq('id', id);

  if (error) {
    return { ok: false, code: 'UNAVAILABLE' };
  }

  return { ok: true, data: undefined };
}

export async function mergeFields(
  client: Client,
  sourceId: string,
  targetId: string,
): Promise<AdminResult<{ profilesAffected: number }>> {
  const { data, error } = await client
    .rpc('merge_fields', { source_id: sourceId, target_id: targetId })
    .single();

  if (error || !data) {
    return { ok: false, code: 'VALIDATION', message: error?.message };
  }

  return { ok: true, data: { profilesAffected: data.profiles_affected } };
}

export async function mergePlaces(
  client: Client,
  sourceId: string,
  targetId: string,
): Promise<
  AdminResult<{ profilesAffected: number; journeysAffected: number; proudMomentsAffected: number }>
> {
  const { data, error } = await client
    .rpc('merge_places', { source_id: sourceId, target_id: targetId })
    .single();

  if (error || !data) {
    return { ok: false, code: 'VALIDATION', message: error?.message };
  }

  return {
    ok: true,
    data: {
      profilesAffected: data.profiles_affected,
      journeysAffected: data.journeys_affected,
      proudMomentsAffected: data.proud_moments_affected,
    },
  };
}

export async function listReports(
  client: Client,
  status?: 'open' | 'resolved' | 'dismissed',
): Promise<AdminReportRow[]> {
  let query = client
    .from('reports')
    .select('id, reason, description, status, profile_id, proud_moment_id, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  if (status) {
    query = query.eq('status', status);
  }

  const { data } = await query;

  return (data ?? []).map((row) => ({
    id: row.id,
    reason: row.reason,
    description: row.description,
    status: row.status,
    profileId: row.profile_id,
    proudMomentId: row.proud_moment_id,
    createdAt: row.created_at,
  }));
}

export async function resolveReport(
  client: Client,
  reportId: string,
  status: 'resolved' | 'dismissed',
  resolvedBy: string,
): Promise<AdminResult<void>> {
  const { error } = await client
    .from('reports')
    .update({ status, resolved_at: new Date().toISOString(), resolved_by: resolvedBy })
    .eq('id', reportId);

  if (error) {
    return { ok: false, code: 'UNAVAILABLE' };
  }

  return { ok: true, data: undefined };
}

export interface ReportInput {
  profileId?: string;
  proudMomentId?: string;
  reason: 'incorrect_information' | 'inappropriate_content' | 'impersonation' | 'other';
  description?: string;
}

export async function submitReport(client: Client, input: ReportInput): Promise<AdminResult<void>> {
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return { ok: false, code: 'UNAUTHORIZED' };
  }

  const { error } = await client.from('reports').insert({
    reporter_id: user.id,
    profile_id: input.profileId ?? null,
    proud_moment_id: input.proudMomentId ?? null,
    reason: input.reason,
    description: input.description ?? null,
  });

  if (error) {
    return { ok: false, code: 'UNAVAILABLE' };
  }

  return { ok: true, data: undefined };
}

export interface AdminInvitationRow {
  id: string;
  label: string;
  status: 'active' | 'revoked';
  createdAt: string;
  revokedAt: string | null;
}

export async function listInvitations(client: Client): Promise<AdminInvitationRow[]> {
  const { data } = await client
    .from('shared_invitations')
    .select('id, label, status, created_at, revoked_at')
    .order('created_at', { ascending: false });

  return (data ?? []).map((row) => ({
    id: row.id,
    label: row.label,
    status: row.status,
    createdAt: row.created_at,
    revokedAt: row.revoked_at,
  }));
}
