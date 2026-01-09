create table shadow_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  organization_type text not null,
  state text not null,
  focus_area text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table shadow_profiles enable row level security;

-- Policies
create policy "Users can view own shadow profiles"
  on shadow_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own shadow profiles"
  on shadow_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own shadow profiles"
  on shadow_profiles for update
  using (auth.uid() = user_id);

create policy "Users can delete own shadow profiles"
  on shadow_profiles for delete
  using (auth.uid() = user_id);
