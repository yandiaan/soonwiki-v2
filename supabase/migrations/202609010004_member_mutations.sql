-- Task 9: Atomic owner-scoped replacement functions for journey entries and profile fields.
-- Both functions run as invoker: existing RLS policies (Task 3) already restrict
-- inserts/deletes to the active-member owner, this adds validation and a clearer error surface.

create or replace function public.replace_own_journey_entries(profile_id uuid, entries jsonb)
returns setof public.journey_entries
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_owner_id uuid;
begin
  if not public.is_active_member() then
    raise exception 'UNAUTHORIZED' using errcode = 'P0001';
  end if;

  select owner_id into v_owner_id from public.profiles where id = replace_own_journey_entries.profile_id;

  if v_owner_id is null or v_owner_id <> auth.uid() then
    raise exception 'UNAUTHORIZED' using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(entries) as e(place_id uuid)
    where e.place_id is not null
      and not exists (select 1 from public.places p where p.id = e.place_id)
  ) then
    raise exception 'VALIDATION' using errcode = 'P0001';
  end if;

  delete from public.journey_entries
  where journey_entries.profile_id = replace_own_journey_entries.profile_id;

  return query
  insert into public.journey_entries (profile_id, activity, place_id, start_year, end_year, story, sort_order)
  select
    replace_own_journey_entries.profile_id,
    e.activity,
    e.place_id,
    e.start_year,
    e.end_year,
    e.story,
    e.sort_order
  from jsonb_to_recordset(entries) as e(
    activity text,
    place_id uuid,
    start_year int,
    end_year int,
    story text,
    sort_order int
  )
  returning *;
end;
$$;

revoke all on function public.replace_own_journey_entries(uuid, jsonb) from public, anon;
grant execute on function public.replace_own_journey_entries(uuid, jsonb) to authenticated;

create or replace function public.replace_own_profile_fields(profile_id uuid, field_ids uuid[])
returns setof public.profile_fields
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_owner_id uuid;
begin
  if not public.is_active_member() then
    raise exception 'UNAUTHORIZED' using errcode = 'P0001';
  end if;

  select owner_id into v_owner_id from public.profiles where id = replace_own_profile_fields.profile_id;

  if v_owner_id is null or v_owner_id <> auth.uid() then
    raise exception 'UNAUTHORIZED' using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from unnest(field_ids) as f(id)
    where not exists (select 1 from public.fields where fields.id = f.id)
  ) then
    raise exception 'VALIDATION' using errcode = 'P0001';
  end if;

  delete from public.profile_fields
  where profile_fields.profile_id = replace_own_profile_fields.profile_id;

  return query
  insert into public.profile_fields (profile_id, field_id)
  select replace_own_profile_fields.profile_id, f
  from unnest(field_ids) as f
  returning *;
end;
$$;

revoke all on function public.replace_own_profile_fields(uuid, uuid[]) from public, anon;
grant execute on function public.replace_own_profile_fields(uuid, uuid[]) to authenticated;
