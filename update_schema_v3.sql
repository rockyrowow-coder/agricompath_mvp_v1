-- update_schema_v3.sql

-- 0. Ensure Tables Exist (Phase 1 & 2 Re-check)
create table if not exists public.communities (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  image_url text,
  created_by uuid references auth.users(id),
  rep_email text,
  rep_phone text,
  rep_ja_number text,
  created_at timestamptz default now()
);

create table if not exists public.community_members (
  id uuid default gen_random_uuid() primary key,
  community_id uuid references public.communities(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text default 'member', 
  joined_at timestamptz default now(),
  unique(community_id, user_id)
);

-- Missing Records Table (Critical Fix)
create table if not exists public.records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  date date not null,
  time_start time,
  time_end time,
  field text,
  range text,
  crop text,
  worker text,
  target text,
  type text not null, -- pesticide, fertilizer, work, etc.
  detail text, -- pesticide name, work type, etc.
  pesticide text, -- specific column for pesticide name if needed for queries
  dilution numeric,
  amount text, -- stored as text because it might contain units or be complex
  method text,
  memo text,
  image_url text,
  created_at timestamptz default now()
);

create table if not exists public.community_posts (
  id uuid default gen_random_uuid() primary key,
  community_id uuid references public.communities(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  content text,
  image_url text,
  created_at timestamptz default now()
);

create table if not exists public.record_shares (
  id uuid default gen_random_uuid() primary key,
  community_id uuid references public.communities(id) on delete cascade,
  record_id uuid references public.records(id) on delete cascade, 
  created_at timestamptz default now(),
  unique(community_id, record_id)
);

-- 1. Update community_posts for Threaded Discussions & Alerts (Phase 3)
alter table public.community_posts 
add column if not exists parent_id uuid references public.community_posts(id),
add column if not exists title text, -- For Topic starters
add column if not exists is_alert boolean default false;

-- 2. Ensure Storage Bucket 'images' exists
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

-- 3. Update Storage Policies
-- Drop existing policies to avoid conflicts or duplication
drop policy if exists "Authenticated users can upload images" on storage.objects;
drop policy if exists "Anyone can view images" on storage.objects;

create policy "Authenticated users can upload images"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'images' );

create policy "Anyone can view images"
on storage.objects for select
to public
using ( bucket_id = 'images' );

-- 4. Create/Ensure "Provisional Moriyama Melon Department" exists
do $$
declare
    admin_id uuid;
    melon_id uuid;
begin
    -- Get a user to be the creator (first user found)
    select id into admin_id from auth.users limit 1;

    if admin_id is not null then
        -- Check if it exists
        select id into melon_id from public.communities where name = '仮・守山メロン部会';
        
        if melon_id is null then
            -- Create it
            insert into public.communities (name, description, created_by, rep_email, rep_phone, rep_ja_number)
            values (
                '仮・守山メロン部会', 
                '守山名産のメロン栽培農家の集まりです（仮設）。品質向上とブランド化を目指して活動しています。', 
                admin_id, 
                'melon_rep@example.com', 
                '077-582-1111', 
                '99887766'
            ) returning id into melon_id;
        end if;

        -- Auto-join the creator
        insert into public.community_members (community_id, user_id, role)
        values (melon_id, admin_id, 'admin')
        on conflict (community_id, user_id) do nothing;
    end if;
end $$;
