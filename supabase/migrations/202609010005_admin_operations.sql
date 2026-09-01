-- Task 10: Admin-only transactional taxonomy merges and ownership transfer.
-- All three run as invoker: the admin RLS policies added in Task 3 already permit
-- an active admin to update/delete these rows; this adds an explicit admin check,
-- input validation, and affected-row counts for confirmation UI.

create or replace function public.merge_fields(source_id uuid, target_id uuid)
returns table (profiles_affected integer)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_count integer;
begin
  if not public.is_admin() then
    raise exception 'ADMIN_REQUIRED' using errcode = 'P0001';
  end if;

  if source_id = target_id then
    raise exception 'VALIDATION' using errcode = 'P0001';
  end if;

  if not exists (select 1 from public.fields where id = target_id) then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;

  if not exists (select 1 from public.fields where id = source_id) then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;

  insert into public.profile_fields (profile_id, field_id)
  select pf.profile_id, target_id
  from public.profile_fields pf
  where pf.field_id = source_id
  on conflict (profile_id, field_id) do nothing;

  select count(*) into v_count from public.profile_fields where field_id = source_id;

  delete from public.profile_fields where field_id = source_id;
  delete from public.fields where id = source_id;

  return query select v_count;
end;
$$;

revoke all on function public.merge_fields(uuid, uuid) from public, anon;
grant execute on function public.merge_fields(uuid, uuid) to authenticated;

create or replace function public.merge_places(source_id uuid, target_id uuid)
returns table (profiles_affected integer, journeys_affected integer, proud_moments_affected integer)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_profiles integer;
  v_journeys integer;
  v_proud integer;
begin
  if not public.is_admin() then
    raise exception 'ADMIN_REQUIRED' using errcode = 'P0001';
  end if;

  if source_id = target_id then
    raise exception 'VALIDATION' using errcode = 'P0001';
  end if;

  if not exists (select 1 from public.places where id = target_id) then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;

  if not exists (select 1 from public.places where id = source_id) then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;

  select count(*) into v_profiles from public.profiles where current_place_id = source_id;
  update public.profiles set current_place_id = target_id where current_place_id = source_id;

  select count(*) into v_journeys from public.journey_entries where place_id = source_id;
  update public.journey_entries set place_id = target_id where place_id = source_id;

  select count(*) into v_proud from public.proud_moments where place_id = source_id;
  update public.proud_moments set place_id = target_id where place_id = source_id;

  delete from public.places where id = source_id;

  return query select v_profiles, v_journeys, v_proud;
end;
$$;

revoke all on function public.merge_places(uuid, uuid) from public, anon;
grant execute on function public.merge_places(uuid, uuid) to authenticated;

create or replace function public.transfer_profile_owner(profile_id uuid, new_owner_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'ADMIN_REQUIRED' using errcode = 'P0001';
  end if;

  if not exists (
    select 1 from public.members where user_id = new_owner_id and status = 'active'
  ) then
    raise exception 'VALIDATION' using errcode = 'P0001';
  end if;

  if exists (select 1 from public.profiles where owner_id = new_owner_id) then
    raise exception 'MEMBER_EXISTS' using errcode = 'P0001';
  end if;

  update public.profiles
  set owner_id = new_owner_id
  where id = transfer_profile_owner.profile_id;

  if not found then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;
end;
$$;

revoke all on function public.transfer_profile_owner(uuid, uuid) from public, anon;
grant execute on function public.transfer_profile_owner(uuid, uuid) to authenticated;
