create table if not exists public.app_feedbacks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  category text not null check (category in ('bug', 'feature', 'general')),
  title text not null check (char_length(title) between 3 and 200),
  description text not null check (char_length(description) between 10 and 3000),
  device_info text,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id) on delete set null,
  admin_notes text
);

alter table public.app_feedbacks enable row level security;

-- Members/users can insert feedbacks
create policy app_feedbacks_insert_authenticated
  on public.app_feedbacks for insert
  with check (auth.uid() is not null);

-- Members can see their own feedbacks, admins can see all
create policy app_feedbacks_select_own_or_admin
  on public.app_feedbacks for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.members
      where user_id = auth.uid() and role = 'admin' and status = 'active'
    )
  );

-- Admins can update feedbacks
create policy app_feedbacks_update_admin
  on public.app_feedbacks for update
  using (
    exists (
      select 1 from public.members
      where user_id = auth.uid() and role = 'admin' and status = 'active'
    )
  );

create index if not exists app_feedbacks_user_created_idx
  on public.app_feedbacks (user_id, created_at desc);

create index if not exists app_feedbacks_status_idx
  on public.app_feedbacks (status, created_at desc);
