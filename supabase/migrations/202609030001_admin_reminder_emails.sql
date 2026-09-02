-- Migration: Admin List Member Profiles & Reminder Queries
-- Provides secure helper for admins to view member profile status and emails

create or replace function public.admin_list_member_profiles()
returns table (
  user_id uuid,
  email text,
  name text,
  slug text,
  generation_key text,
  profile_id uuid,
  is_published boolean,
  has_profile boolean,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'ADMIN_REQUIRED' using errcode = 'P0001';
  end if;

  return query
  select
    m.user_id,
    u.email::text,
    coalesce(
      p.name,
      nullif((u.raw_user_meta_data->>'full_name'), ''),
      nullif((u.raw_user_meta_data->>'name'), ''),
      split_part(u.email, '@', 1)
    )::text as name,
    p.slug::text,
    p.generation_key::text,
    p.id as profile_id,
    coalesce(p.is_published, false) as is_published,
    (p.id is not null) as has_profile,
    coalesce(p.updated_at, m.updated_at) as updated_at
  from public.members m
  join auth.users u on u.id = m.user_id
  left join public.profiles p on p.owner_id = m.user_id
  where m.status = 'active'
  order by coalesce(p.updated_at, m.updated_at) desc;
end;
$$;

revoke all on function public.admin_list_member_profiles() from public, anon;
grant execute on function public.admin_list_member_profiles() to authenticated;
