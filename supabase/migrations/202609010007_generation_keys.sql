-- Store the stable SOON generation key instead of an implementation-era year.

do $$
declare
  unsupported_years text;
begin
  select string_agg(distinct batch_year::text, ', ' order by batch_year::text)
  into unsupported_years
  from public.profiles
  where batch_year not between 2018 and 2026;

  if unsupported_years is not null then
    raise exception 'Cannot migrate unknown batch years: %', unsupported_years;
  end if;
end;
$$;

drop view public.published_profile_details;
drop view public.published_profile_cards;
drop function public.search_profiles(text, text, int, text, int, int);

drop trigger profiles_validate_batch_year on public.profiles;
drop function public.validate_batch_year();

alter table public.profiles
  drop constraint profiles_batch_year_check;

alter table public.profiles
  rename column batch_year to generation_key;

alter table public.profiles
  alter column generation_key type text
  using case generation_key
    when 2026 then 'superteam'
    when 2025 then 'sobat-skawan'
    when 2024 then 'osida'
    when 2023 then 'reborn'
    when 2022 then 'metaverse'
    when 2021 then 'hybrid'
    when 2020 then 'cov19'
    when 2019 then '2-0'
    when 2018 then 'beta'
  end;

alter table public.profiles
  add constraint profiles_generation_key_check check (
    generation_key in (
      'superteam',
      'sobat-skawan',
      'osida',
      'reborn',
      'metaverse',
      'hybrid',
      'cov19',
      '2-0',
      'beta'
    )
  );

alter index public.profiles_batch_idx rename to profiles_generation_idx;

create view public.published_profile_cards
  with (security_invoker = true)
as
select
  p.id,
  p.slug,
  p.name,
  p.photo_path,
  p.generation_key,
  p.current_activity,
  pl.name as current_place_name,
  pl.slug as current_place_slug,
  (
    select array_agg(ordered.name)
    from (
      select f.name
      from public.profile_fields pf
      join public.fields f on f.id = pf.field_id
      where pf.profile_id = p.id
      order by f.name
      limit 3
    ) ordered
  ) as field_labels,
  p.updated_at
from public.profiles p
left join public.places pl on pl.id = p.current_place_id
where p.is_published;

create view public.published_profile_details
  with (security_invoker = true)
as
select
  p.id,
  p.slug,
  p.name,
  p.photo_path,
  p.generation_key,
  p.bio,
  p.location,
  p.current_activity,
  pl.name as current_place_name,
  pl.slug as current_place_slug,
  p.since_soon_story,
  p.turning_point_story,
  p.current_direction_story,
  p.linkedin_url,
  p.instagram_url,
  p.website_url,
  p.updated_at
from public.profiles p
left join public.places pl on pl.id = p.current_place_id
where p.is_published;

grant select on public.published_profile_cards to anon, authenticated;
grant select on public.published_profile_details to anon, authenticated;

create function public.search_profiles(
  query text default null,
  field_slug text default null,
  generation_key text default null,
  place_slug text default null,
  result_limit int default 20,
  result_offset int default 0
)
returns table (
  id uuid,
  slug text,
  name text,
  photo_path text,
  generation_key text,
  current_activity text,
  current_place_name text,
  current_place_slug text,
  field_labels text[],
  updated_at timestamptz,
  rank int
)
language sql
stable
security invoker
set search_path = ''
as $$
  with normalized_query as (
    select nullif(public.normalize_slug_source(coalesce(query, '')), '') as value
  )
  select
    p.id,
    p.slug,
    p.name,
    p.photo_path,
    p.generation_key,
    p.current_activity,
    pl.name as current_place_name,
    pl.slug as current_place_slug,
    (
      select array_agg(ordered.name)
      from (
        select f.name
        from public.profile_fields pf
        join public.fields f on f.id = pf.field_id
        where pf.profile_id = p.id
        order by f.name
        limit 3
      ) ordered
    ) as field_labels,
    p.updated_at,
    case
      when nq.value is null then 0
      when public.normalize_slug_source(p.name) = nq.value then 100
      when public.normalize_slug_source(p.name) like nq.value || '%' then 80
      when public.normalize_slug_source(p.name) like '%' || nq.value || '%' then 60
      when pl.name is not null and public.normalize_slug_source(pl.name) like '%' || nq.value || '%' then 40
      when p.current_activity is not null
        and public.normalize_slug_source(p.current_activity) like '%' || nq.value || '%' then 30
      when exists (
        select 1
        from public.profile_fields pf3
        join public.fields f3 on f3.id = pf3.field_id
        where pf3.profile_id = p.id
          and public.normalize_slug_source(f3.name) like '%' || nq.value || '%'
      ) then 20
      else 0
    end as rank
  from public.profiles p
  cross join normalized_query nq
  left join public.places pl on pl.id = p.current_place_id
  where p.is_published
    and ($3 is null or p.generation_key = $3)
    and (place_slug is null or pl.slug = place_slug)
    and (
      field_slug is null
      or exists (
        select 1
        from public.profile_fields pf2
        join public.fields f2 on f2.id = pf2.field_id
        where pf2.profile_id = p.id and f2.slug = field_slug
      )
    )
    and (
      nq.value is null
      or public.normalize_slug_source(p.name) like '%' || nq.value || '%'
      or (pl.name is not null and public.normalize_slug_source(pl.name) like '%' || nq.value || '%')
      or (
        p.current_activity is not null
        and public.normalize_slug_source(p.current_activity) like '%' || nq.value || '%'
      )
      or exists (
        select 1
        from public.profile_fields pf4
        join public.fields f4 on f4.id = pf4.field_id
        where pf4.profile_id = p.id
          and public.normalize_slug_source(f4.name) like '%' || nq.value || '%'
      )
    )
  order by rank desc, p.updated_at desc
  limit least(coalesce(result_limit, 20), 50)
  offset greatest(coalesce(result_offset, 0), 0);
$$;

grant execute on function public.search_profiles(text, text, text, text, int, int)
  to anon, authenticated;
