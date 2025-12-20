-- Create applications table for tracking LOIs and grant applications
create table if not exists public.applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  grant_id uuid references public.grants(id) on delete set null,
  
  -- Basic info
  grant_title text not null,
  funder_name text not null,
  application_type text not null check (application_type in ('LOI', 'Full Application', 'Letter of Intent', 'Proposal')),
  
  -- Status tracking
  status text not null default 'Draft' check (status in ('Draft', 'In Progress', 'Submitted', 'Under Review', 'Awarded', 'Declined', 'Withdrawn')),
  
  -- Dates
  due_date date,
  submitted_date date,
  decision_date date,
  
  -- Financial
  amount_requested numeric(12, 2),
  amount_awarded numeric(12, 2),
  
  -- Additional info
  notes text,
  attachments jsonb default '[]'::jsonb,
  
  -- Metadata
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table public.applications enable row level security;

-- Users can only see their own applications
create policy "Users can view own applications"
  on public.applications for select
  using (auth.uid() = user_id);

-- Users can insert their own applications
create policy "Users can insert own applications"
  on public.applications for insert
  with check (auth.uid() = user_id);

-- Users can update their own applications
create policy "Users can update own applications"
  on public.applications for update
  using (auth.uid() = user_id);

-- Users can delete their own applications
create policy "Users can delete own applications"
  on public.applications for delete
  using (auth.uid() = user_id);

-- Create indexes for performance
create index applications_user_id_idx on public.applications(user_id);
create index applications_status_idx on public.applications(status);
create index applications_due_date_idx on public.applications(due_date);
create index applications_grant_id_idx on public.applications(grant_id);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_applications_updated_at
  before update on public.applications
  for each row
  execute procedure public.handle_updated_at();
