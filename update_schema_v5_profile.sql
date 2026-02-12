-- Phase 6: Profile Settings & Bug Fixes

-- 1. Create Profiles Table (Publicly viewable user info)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  bio text,
  avatar_url text,
  is_public boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Enable RLS
alter table public.profiles enable row level security;

-- 3. Policies
-- Anyone can view profiles (for community features)
create policy "Public profiles are viewable by everyone" 
on public.profiles for select 
using (true);

-- Users can insert their own profile
create policy "Users can insert their own profile" 
on public.profiles for insert 
with check (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update their own profile" 
on public.profiles for update 
using (auth.uid() = id);

-- 4. Create a trigger to auto-create profile on signup (Optional but recommended)
-- For MVP, we might rely on the app creating it, but a trigger is safer.
-- Let's stick to App logic for now to avoid complex SQL triggers if user is not comfortable, 
-- BUT handling it in SQL is better for data integrity. Let's add a simple function.

create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger only if it doesn't exist (hard to check cleanly in pure SQL without error, so we skip for now)
-- We will handle profile creation in the Frontend "Settings" save if it doesn't exist.

-- 5. Helper to ensure current user has a profile (Run this manually or via app)
-- insert into public.profiles (id, display_name)
-- select id, split_part(email, '@', 1) from auth.users
-- on conflict do nothing;
