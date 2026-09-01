-- Task 3: RLS enforcement, transactional membership, discovery search, and Storage.

-- ---------------------------------------------------------------------------
-- Immutable normalization (required so we can build trigram expression indexes)
-- ---------------------------------------------------------------------------

create or replace function public.immutable_unaccent(value text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select extensions.unaccent('extensions.unaccent'::regdictionary, value);
$$;

create or replace function public.normalize_slug_source(value text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select trim(
    both '-' from regexp_replace(
      lower(public.immutable_unaccent(coalesce(value, ''))),
      '[^a-z0-9]+',
      '-',
      'g'
    )
  );
$$;

create index if not exists profiles_name_trgm_idx
  on public.profiles using gin (public.normalize_slug_source(name) extensions.gin_trgm_ops);
create index if not exists profiles_activity_trgm_idx
  on public.profiles using gin (public.normalize_slug_source(current_activity) extensions.gin_trgm_ops);
create index if not exists places_name_trgm_idx
  on public.places using gin (public.normalize_slug_source(name) extensions.gin_trgm_ops);
create index if not exists fields_name_trgm_idx
  on public.fields using gin (public.normalize_slug_source(name) extensions.gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- Membership helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_active_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.members
    where user_id = auth.uid() and status = 'active'
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.members
    where user_id = auth.uid() and status = 'active' and role = 'admin'
  );
$$;

revoke all on function public.is_active_member() from public;
revoke all on function public.is_admin() from public;
grant execute on function public.is_active_member() to authenticated;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.members enable row level security;
alter table public.shared_invitations enable row level security;
alter table public.invitation_attempts enable row level security;
alter table public.invitation_redemptions enable row level security;
alter table public.places enable row level security;
alter table public.profiles enable row level security;
alter table public.journey_entries enable row level security;
alter table public.fields enable row level security;
alter table public.profile_fields enable row level security;
alter table public.proud_moments enable row level security;
alter table public.reports enable row level security;

-- members: no direct mutation policy; membership rows are only ever written by
-- the security-definer invitation functions below (executed as the migration owner).
create policy members_select_self
  on public.members for select
  to authenticated
  using (user_id = auth.uid());

create policy members_select_admin
  on public.members for select
  to authenticated
  using (public.is_admin());

-- shared_invitations: admins may list invitations they manage; all mutation
-- happens through create_shared_invitation()/revoke_shared_invitation() below.
create policy shared_invitations_select_admin
  on public.shared_invitations for select
  to authenticated
  using (public.is_admin());

-- places: shared vocabulary, readable by everyone; members may add new entries;
-- only admins may rename or remove them.
create policy places_select_public
  on public.places for select
  to public
  using (true);

create policy places_insert_member
  on public.places for insert
  to authenticated
  with check (public.is_active_member());

create policy places_update_admin
  on public.places for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy places_delete_admin
  on public.places for delete
  to authenticated
  using (public.is_admin());

-- fields: same shape as places.
create policy fields_select_public
  on public.fields for select
  to public
  using (true);

create policy fields_insert_member
  on public.fields for insert
  to authenticated
  with check (public.is_active_member());

create policy fields_update_admin
  on public.fields for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy fields_delete_admin
  on public.fields for delete
  to authenticated
  using (public.is_admin());

-- profiles: public reads published rows; owners always read/write their own
-- row; admins may read and moderate every row.
create policy profiles_select_public
  on public.profiles for select
  to public
  using (is_published);

create policy profiles_select_owner
  on public.profiles for select
  to authenticated
  using (owner_id = auth.uid());

create policy profiles_select_admin
  on public.profiles for select
  to authenticated
  using (public.is_admin());

create policy profiles_insert_owner
  on public.profiles for insert
  to authenticated
  with check (owner_id = auth.uid() and public.is_active_member());

create policy profiles_update_owner
  on public.profiles for update
  to authenticated
  using (owner_id = auth.uid() and public.is_active_member())
  with check (owner_id = auth.uid());

create policy profiles_update_admin
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy profiles_delete_admin
  on public.profiles for delete
  to authenticated
  using (public.is_admin());

-- journey_entries: visibility and ownership follow the parent profile.
create policy journey_entries_select_public
  on public.journey_entries for select
  to public
  using (
    exists (
      select 1 from public.profiles p
      where p.id = journey_entries.profile_id and p.is_published
    )
  );

create policy journey_entries_select_owner
  on public.journey_entries for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = journey_entries.profile_id and p.owner_id = auth.uid()
    )
  );

create policy journey_entries_select_admin
  on public.journey_entries for select
  to authenticated
  using (public.is_admin());

create policy journey_entries_write_owner
  on public.journey_entries for all
  to authenticated
  using (
    public.is_active_member()
    and exists (
      select 1 from public.profiles p
      where p.id = journey_entries.profile_id and p.owner_id = auth.uid()
    )
  )
  with check (
    public.is_active_member()
    and exists (
      select 1 from public.profiles p
      where p.id = journey_entries.profile_id and p.owner_id = auth.uid()
    )
  );

create policy journey_entries_write_admin
  on public.journey_entries for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- profile_fields: same visibility and ownership shape as journey_entries.
create policy profile_fields_select_public
  on public.profile_fields for select
  to public
  using (
    exists (
      select 1 from public.profiles p
      where p.id = profile_fields.profile_id and p.is_published
    )
  );

create policy profile_fields_select_owner
  on public.profile_fields for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = profile_fields.profile_id and p.owner_id = auth.uid()
    )
  );

create policy profile_fields_select_admin
  on public.profile_fields for select
  to authenticated
  using (public.is_admin());

create policy profile_fields_write_owner
  on public.profile_fields for all
  to authenticated
  using (
    public.is_active_member()
    and exists (
      select 1 from public.profiles p
      where p.id = profile_fields.profile_id and p.owner_id = auth.uid()
    )
  )
  with check (
    public.is_active_member()
    and exists (
      select 1 from public.profiles p
      where p.id = profile_fields.profile_id and p.owner_id = auth.uid()
    )
  );

create policy profile_fields_write_admin
  on public.profile_fields for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- proud_moments: same visibility and ownership shape as journey_entries.
create policy proud_moments_select_public
  on public.proud_moments for select
  to public
  using (
    exists (
      select 1 from public.profiles p
      where p.id = proud_moments.profile_id and p.is_published
    )
  );

create policy proud_moments_select_owner
  on public.proud_moments for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = proud_moments.profile_id and p.owner_id = auth.uid()
    )
  );

create policy proud_moments_select_admin
  on public.proud_moments for select
  to authenticated
  using (public.is_admin());

create policy proud_moments_write_owner
  on public.proud_moments for all
  to authenticated
  using (
    public.is_active_member()
    and exists (
      select 1 from public.profiles p
      where p.id = proud_moments.profile_id and p.owner_id = auth.uid()
    )
  )
  with check (
    public.is_active_member()
    and exists (
      select 1 from public.profiles p
      where p.id = proud_moments.profile_id and p.owner_id = auth.uid()
    )
  );

create policy proud_moments_write_admin
  on public.proud_moments for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- reports: any signed-in identity may file a report about themselves; only
-- admins may read or resolve them.
create policy reports_insert_authenticated
  on public.reports for insert
  to authenticated
  with check (reporter_id = auth.uid());

create policy reports_select_admin
  on public.reports for select
  to authenticated
  using (public.is_admin());

create policy reports_update_admin
  on public.reports for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Invitation transactions (service-role only)
-- ---------------------------------------------------------------------------

create or replace function public.start_invitation_attempt(raw_token text)
returns table (attempt_token text, expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_invitation_id uuid;
  v_raw_attempt text;
  v_expires_at timestamptz;
begin
  select id into v_invitation_id
  from public.shared_invitations
  where token_hash = encode(extensions.digest(raw_token, 'sha256'), 'hex')
    and status = 'active';

  if v_invitation_id is null then
    raise exception 'INVITATION_INVALID' using errcode = 'P0001';
  end if;

  v_raw_attempt := encode(extensions.gen_random_bytes(32), 'hex');
  v_expires_at := now() + interval '15 minutes';

  insert into public.invitation_attempts (invitation_id, opaque_token_hash, expires_at)
  values (
    v_invitation_id,
    encode(extensions.digest(v_raw_attempt, 'sha256'), 'hex'),
    v_expires_at
  );

  return query select v_raw_attempt, v_expires_at;
end;
$$;

create or replace function public.complete_invitation_attempt(raw_attempt text, actor_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempt record;
  v_invitation record;
begin
  select * into v_attempt
  from public.invitation_attempts
  where opaque_token_hash = encode(extensions.digest(raw_attempt, 'sha256'), 'hex')
  for update;

  if v_attempt is null or v_attempt.expires_at < now() then
    raise exception 'ATTEMPT_EXPIRED' using errcode = 'P0001';
  end if;

  if v_attempt.consumed_at is not null then
    raise exception 'ATTEMPT_CONSUMED' using errcode = 'P0001';
  end if;

  select * into v_invitation
  from public.shared_invitations
  where id = v_attempt.invitation_id;

  if v_invitation is null or v_invitation.status <> 'active' then
    raise exception 'INVITATION_REVOKED' using errcode = 'P0001';
  end if;

  if exists (select 1 from public.invitation_redemptions where user_id = actor_user_id) then
    raise exception 'MEMBER_EXISTS' using errcode = 'P0001';
  end if;

  insert into public.members (user_id)
  values (actor_user_id)
  on conflict (user_id) do nothing;

  insert into public.invitation_redemptions (invitation_id, user_id)
  values (v_invitation.id, actor_user_id);

  update public.invitation_attempts
  set consumed_at = now()
  where id = v_attempt.id;
end;
$$;

create or replace function public.create_shared_invitation(label text, actor_user_id uuid)
returns table (raw_token text, invitation_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_raw_token text;
  v_invitation_id uuid;
begin
  if not exists (
    select 1 from public.members
    where user_id = actor_user_id and status = 'active' and role = 'admin'
  ) then
    raise exception 'ADMIN_REQUIRED' using errcode = 'P0001';
  end if;

  v_raw_token := encode(extensions.gen_random_bytes(32), 'hex');

  insert into public.shared_invitations (token_hash, label, created_by)
  values (encode(extensions.digest(v_raw_token, 'sha256'), 'hex'), label, actor_user_id)
  returning id into v_invitation_id;

  return query select v_raw_token, v_invitation_id;
end;
$$;

create or replace function public.revoke_shared_invitation(invitation_id uuid, actor_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.members
    where user_id = actor_user_id and status = 'active' and role = 'admin'
  ) then
    raise exception 'ADMIN_REQUIRED' using errcode = 'P0001';
  end if;

  update public.shared_invitations
  set status = 'revoked', revoked_at = now()
  where id = invitation_id and status = 'active';
end;
$$;

revoke all on function public.start_invitation_attempt(text) from public, anon, authenticated;
revoke all on function public.complete_invitation_attempt(text, uuid) from public, anon, authenticated;
revoke all on function public.create_shared_invitation(text, uuid) from public, anon, authenticated;
revoke all on function public.revoke_shared_invitation(uuid, uuid) from public, anon, authenticated;
grant execute on function public.start_invitation_attempt(text) to service_role;
grant execute on function public.complete_invitation_attempt(text, uuid) to service_role;
grant execute on function public.create_shared_invitation(text, uuid) to service_role;
grant execute on function public.revoke_shared_invitation(uuid, uuid) to service_role;

-- ---------------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('profile-photos', 'profile-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('proud-moments', 'proud-moments', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy storage_public_read
  on storage.objects for select
  to public
  using (bucket_id in ('profile-photos', 'proud-moments'));

create policy storage_member_insert
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id in ('profile-photos', 'proud-moments')
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.is_active_member()
  );

create policy storage_member_update
  on storage.objects for update
  to authenticated
  using (
    bucket_id in ('profile-photos', 'proud-moments')
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.is_active_member()
  )
  with check (
    bucket_id in ('profile-photos', 'proud-moments')
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.is_active_member()
  );

create policy storage_member_delete
  on storage.objects for delete
  to authenticated
  using (
    bucket_id in ('profile-photos', 'proud-moments')
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.is_active_member()
  );
