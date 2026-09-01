//#region src/lib/server/admin-repository.ts
async function listAdminOverview(client) {
  const [{ count: totalPublishedProfiles }, { count: totalMembers }, { count: openReports }] =
    await Promise.all([
      client
        .from('profiles')
        .select('id', {
          count: 'exact',
          head: true,
        })
        .eq('is_published', true),
      client
        .from('members')
        .select('user_id', {
          count: 'exact',
          head: true,
        })
        .eq('status', 'active'),
      client
        .from('reports')
        .select('id', {
          count: 'exact',
          head: true,
        })
        .eq('status', 'open'),
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
async function listAllProfilesForAdmin(client, search) {
  let query = client
    .from('profiles')
    .select('id, name, slug, batch_year, is_published, owner_id, updated_at')
    .order('updated_at', { ascending: false })
    .limit(100);
  if (search) query = query.ilike('name', `%${search}%`);
  const { data, error } = await query;
  if (error)
    return {
      ok: false,
      code: 'UNAVAILABLE',
    };
  return {
    ok: true,
    data: (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      batchYear: row.batch_year,
      isPublished: row.is_published,
      ownerId: row.owner_id,
      updatedAt: row.updated_at,
    })),
  };
}
async function setProfilePublished(client, profileId, isPublished) {
  const { error } = await client
    .from('profiles')
    .update({ is_published: isPublished })
    .eq('id', profileId);
  if (error)
    return {
      ok: false,
      code: 'UNAVAILABLE',
    };
  return {
    ok: true,
    data: void 0,
  };
}
async function deleteProfileAsAdmin(client, profileId) {
  const { error } = await client.from('profiles').delete().eq('id', profileId);
  if (error)
    return {
      ok: false,
      code: 'UNAVAILABLE',
    };
  return {
    ok: true,
    data: void 0,
  };
}
async function transferProfileOwner(client, profileId, newOwnerId) {
  const { error } = await client.rpc('transfer_profile_owner', {
    profile_id: profileId,
    new_owner_id: newOwnerId,
  });
  if (error)
    return {
      ok: false,
      code: 'VALIDATION',
      message: error.message,
    };
  return {
    ok: true,
    data: void 0,
  };
}
async function listAllFieldsForAdmin(client) {
  const { data } = await client.from('fields').select('id, name, slug').order('name');
  return data ?? [];
}
async function listAllPlacesForAdmin(client) {
  const { data } = await client.from('places').select('id, name, slug').order('name');
  return data ?? [];
}
async function listRecentContent(client) {
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
  const journeyRows = (journeys.data ?? []).map((row) => ({
    id: row.id,
    kind: 'journey_entry',
    title: row.activity,
    profileId: row.profile_id,
    profileName: row.profiles?.name ?? 'Tanpa nama',
  }));
  const proudRows = (proudMoments.data ?? []).map((row) => ({
    id: row.id,
    kind: 'proud_moment',
    title: row.title,
    profileId: row.profile_id,
    profileName: row.profiles?.name ?? 'Tanpa nama',
  }));
  return [...journeyRows, ...proudRows];
}
async function deleteJourneyEntryAsAdmin(client, id) {
  const { error } = await client.from('journey_entries').delete().eq('id', id);
  if (error)
    return {
      ok: false,
      code: 'UNAVAILABLE',
    };
  return {
    ok: true,
    data: void 0,
  };
}
async function deleteProudMomentAsAdmin(client, id) {
  const { error } = await client.from('proud_moments').delete().eq('id', id);
  if (error)
    return {
      ok: false,
      code: 'UNAVAILABLE',
    };
  return {
    ok: true,
    data: void 0,
  };
}
async function mergeFields(client, sourceId, targetId) {
  const { data, error } = await client
    .rpc('merge_fields', {
      source_id: sourceId,
      target_id: targetId,
    })
    .single();
  if (error || !data)
    return {
      ok: false,
      code: 'VALIDATION',
      message: error?.message,
    };
  return {
    ok: true,
    data: { profilesAffected: data.profiles_affected },
  };
}
async function mergePlaces(client, sourceId, targetId) {
  const { data, error } = await client
    .rpc('merge_places', {
      source_id: sourceId,
      target_id: targetId,
    })
    .single();
  if (error || !data)
    return {
      ok: false,
      code: 'VALIDATION',
      message: error?.message,
    };
  return {
    ok: true,
    data: {
      profilesAffected: data.profiles_affected,
      journeysAffected: data.journeys_affected,
      proudMomentsAffected: data.proud_moments_affected,
    },
  };
}
async function listReports(client, status) {
  let query = client
    .from('reports')
    .select('id, reason, description, status, profile_id, proud_moment_id, created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  if (status) query = query.eq('status', status);
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
async function listInvitations(client) {
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
//#endregion
export {
  listAllFieldsForAdmin as a,
  listInvitations as c,
  mergeFields as d,
  mergePlaces as f,
  listAdminOverview as i,
  listRecentContent as l,
  transferProfileOwner as m,
  deleteProfileAsAdmin as n,
  listAllPlacesForAdmin as o,
  setProfilePublished as p,
  deleteProudMomentAsAdmin as r,
  listAllProfilesForAdmin as s,
  deleteJourneyEntryAsAdmin as t,
  listReports as u,
};

//# sourceMappingURL=admin_BHxA83-B.mjs.map
