-- ---------------------------------------------------------------------------
-- Migration: 202609020001_memory_gallery
-- Feature: Memory Gallery (Kenangan Komunitas SOON)
-- ---------------------------------------------------------------------------

-- 1. Table: memories
create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 160),
  story text not null check (char_length(story) between 10 and 5000),
  generation_key text not null,
  media_type text not null default 'image' check (media_type in ('image', 'video')),
  media_path text not null,
  media_aspect_ratio text not null default '16/10' check (media_aspect_ratio in ('16/10', '4/3', '1/1', '9/16')),
  memory_year smallint check (memory_year is null or (memory_year between 2000 and 2100)),
  location_tag text check (location_tag is null or char_length(location_tag) <= 100),
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Table: memory_comments
create table if not exists public.memory_comments (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.memories(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Table: memory_reactions
create table if not exists public.memory_reactions (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.memories(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction_type text not null check (reaction_type in ('heart', 'nostalgic', 'sparkle', 'proud')),
  created_at timestamptz not null default now(),
  constraint memory_reactions_unique unique (memory_id, user_id, reaction_type)
);

-- Indexes for optimal lookup performance
create index if not exists memories_gen_created_idx on public.memories (generation_key, created_at desc);
create index if not exists memories_author_created_idx on public.memories (author_id, created_at desc);
create index if not exists memory_comments_memory_idx on public.memory_comments (memory_id, created_at asc);
create index if not exists memory_reactions_memory_idx on public.memory_reactions (memory_id);
create index if not exists memory_reactions_user_idx on public.memory_reactions (user_id);

-- Enable RLS
alter table public.memories enable row level security;
alter table public.memory_comments enable row level security;
alter table public.memory_reactions enable row level security;

-- 4. RLS Policies: memories
create policy memories_select_public
  on public.memories for select
  to public
  using (is_published = true or auth.uid() = author_id or public.is_admin());

create policy memories_insert_member
  on public.memories for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and public.is_active_member()
  );

create policy memories_update_owner_or_admin
  on public.memories for update
  to authenticated
  using (
    (author_id = auth.uid() and public.is_active_member())
    or public.is_admin()
  )
  with check (
    (author_id = auth.uid() and public.is_active_member())
    or public.is_admin()
  );

create policy memories_delete_owner_or_admin
  on public.memories for delete
  to authenticated
  using (
    (author_id = auth.uid() and public.is_active_member())
    or public.is_admin()
  );

-- 5. RLS Policies: memory_comments
create policy memory_comments_select_public
  on public.memory_comments for select
  to public
  using (true);

create policy memory_comments_insert_member
  on public.memory_comments for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and public.is_active_member()
  );

create policy memory_comments_delete_owner_or_admin
  on public.memory_comments for delete
  to authenticated
  using (
    (author_id = auth.uid() and public.is_active_member())
    or public.is_admin()
  );

-- 6. RLS Policies: memory_reactions
create policy memory_reactions_select_public
  on public.memory_reactions for select
  to public
  using (true);

create policy memory_reactions_insert_member
  on public.memory_reactions for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.is_active_member()
  );

create policy memory_reactions_delete_owner
  on public.memory_reactions for delete
  to authenticated
  using (
    user_id = auth.uid()
    and public.is_active_member()
  );

-- 7. Storage Bucket: memories
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'memories',
  'memories',
  true,
  52428800, -- 50MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do nothing;

create policy storage_memories_public_read
  on storage.objects for select
  to public
  using (bucket_id = 'memories');

create policy storage_memories_member_insert
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'memories'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.is_active_member()
  );

create policy storage_memories_member_delete
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'memories'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      and public.is_active_member()
    )
    or public.is_admin()
  );

-- 8. View: published_memory_cards
create or replace view public.published_memory_cards
  with (security_invoker = true)
as
select
  m.id,
  m.author_id,
  m.title,
  m.story,
  m.generation_key,
  m.media_type,
  m.media_path,
  m.media_aspect_ratio,
  m.memory_year,
  m.location_tag,
  m.created_at,
  p.name as author_name,
  p.slug as author_slug,
  p.photo_path as author_photo_path,
  p.generation_key as author_generation_key,
  coalesce(r.reaction_count, 0)::bigint as reaction_count,
  coalesce(c.comment_count, 0)::bigint as comment_count
from public.memories m
left join public.profiles p on p.owner_id = m.author_id
left join (
  select memory_id, count(*) as reaction_count
  from public.memory_reactions
  group by memory_id
) r on r.memory_id = m.id
left join (
  select memory_id, count(*) as comment_count
  from public.memory_comments
  group by memory_id
) c on c.memory_id = m.id
where m.is_published;

-- 9. View: published_memory_comments
create or replace view public.published_memory_comments
  with (security_invoker = true)
as
select
  c.id,
  c.memory_id,
  c.author_id,
  c.content,
  c.created_at,
  p.name as author_name,
  p.slug as author_slug,
  p.photo_path as author_photo_path,
  p.generation_key as author_generation_key
from public.memory_comments c
left join public.profiles p on p.owner_id = c.author_id
order by c.created_at asc;
