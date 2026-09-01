create extension if not exists pgcrypto with schema extensions;
create extension if not exists unaccent with schema extensions;
create extension if not exists pg_trgm with schema extensions;

create type public.member_role as enum ('member', 'admin');
create type public.member_status as enum ('active', 'disabled');
create type public.invitation_status as enum ('active', 'revoked');
create type public.report_status as enum ('open', 'resolved', 'dismissed');

create or replace function public.normalize_slug_source(value text)
returns text
language sql
stable
set search_path = ''
as $$
  select trim(
    both '-' from regexp_replace(
      lower(extensions.unaccent(coalesce(value, ''))),
      '[^a-z0-9]+',
      '-',
      'g'
    )
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.validate_batch_year()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.batch_year > extract(year from current_date)::integer then
    raise exception 'batch_year cannot be in the future' using errcode = '22023';
  end if;
  return new;
end;
$$;

create table public.members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.member_role not null default 'member',
  status public.member_status not null default 'active',
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.shared_invitations (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  label text not null check (char_length(label) between 1 and 120),
  status public.invitation_status not null default 'active',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  constraint revoked_invitation_has_timestamp check (
    (status = 'active' and revoked_at is null)
    or (status = 'revoked' and revoked_at is not null)
  )
);

create table public.invitation_attempts (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.shared_invitations(id) on delete cascade,
  opaque_token_hash text not null unique,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.invitation_redemptions (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.shared_invitations(id),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  redeemed_at timestamptz not null default now()
);

create table public.places (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 160),
  slug text not null unique check (slug = public.normalize_slug_source(slug)),
  website_url text check (website_url is null or website_url ~ '^https://'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.members(user_id) on delete cascade,
  name text not null check (char_length(name) between 2 and 160),
  slug text not null unique check (slug = public.normalize_slug_source(slug)),
  photo_path text,
  batch_year integer not null check (batch_year between 2000 and 2100),
  bio text check (char_length(bio) <= 500),
  location text check (char_length(location) <= 120),
  current_activity text check (char_length(current_activity) <= 200),
  current_place_id uuid references public.places(id) on delete set null,
  since_soon_story text check (char_length(since_soon_story) <= 1200),
  turning_point_story text check (char_length(turning_point_story) <= 1200),
  current_direction_story text check (char_length(current_direction_story) <= 1200),
  linkedin_url text check (linkedin_url is null or linkedin_url ~ '^https://'),
  instagram_url text check (instagram_url is null or instagram_url ~ '^https://'),
  website_url text check (website_url is null or website_url ~ '^https://'),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.journey_entries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  activity text not null check (char_length(activity) between 1 and 200),
  place_id uuid references public.places(id) on delete set null,
  start_year integer check (start_year between 1900 and 2100),
  end_year integer check (end_year between 1900 and 2100),
  story text check (char_length(story) <= 1200),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint journey_year_order check (
    start_year is null or end_year is null or end_year >= start_year
  )
);

create table public.fields (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  slug text not null unique check (slug = public.normalize_slug_source(slug)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profile_fields (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  field_id uuid not null references public.fields(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, field_id)
);

create table public.proud_moments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  description text check (char_length(description) <= 2000),
  place_id uuid references public.places(id) on delete set null,
  year integer check (year between 1900 and 2100),
  image_path text,
  external_url text check (external_url is null or external_url ~ '^https://'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references auth.users(id) on delete set null,
  profile_id uuid references public.profiles(id) on delete cascade,
  proud_moment_id uuid references public.proud_moments(id) on delete cascade,
  reason text not null check (
    reason in ('incorrect_information', 'inappropriate_content', 'impersonation', 'other')
  ),
  description text check (char_length(description) <= 2000),
  status public.report_status not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id) on delete set null,
  constraint report_has_one_target check (num_nonnulls(profile_id, proud_moment_id) = 1),
  constraint resolved_report_has_metadata check (
    (status = 'open' and resolved_at is null and resolved_by is null)
    or (status <> 'open' and resolved_at is not null and resolved_by is not null)
  )
);

create unique index places_name_unique on public.places (lower(name));
create unique index fields_name_unique on public.fields (lower(name));
create index profiles_published_updated_idx
  on public.profiles (updated_at desc)
  where is_published;
create index profiles_batch_idx on public.profiles (batch_year);
create index journey_entries_profile_order_idx
  on public.journey_entries (profile_id, sort_order, start_year desc nulls last);
create index proud_moments_profile_year_idx
  on public.proud_moments (profile_id, year desc nulls last, created_at desc);
create index reports_status_created_idx on public.reports (status, created_at desc);
create index invitation_attempts_expiry_idx on public.invitation_attempts (expires_at);

create trigger members_set_updated_at
before update on public.members
for each row execute function public.set_updated_at();

create trigger places_set_updated_at
before update on public.places
for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger profiles_validate_batch_year
before insert or update of batch_year on public.profiles
for each row execute function public.validate_batch_year();

create trigger journey_entries_set_updated_at
before update on public.journey_entries
for each row execute function public.set_updated_at();

create trigger fields_set_updated_at
before update on public.fields
for each row execute function public.set_updated_at();

create trigger proud_moments_set_updated_at
before update on public.proud_moments
for each row execute function public.set_updated_at();
