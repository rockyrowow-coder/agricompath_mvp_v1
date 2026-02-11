-- Create a table for user settings
create table user_settings (
  user_id uuid references auth.users not null primary key,
  ja_id text,
  line_info text,
  custom_crops text[],   -- Array of strings
  custom_methods text[], -- Array of strings
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table user_settings enable row level security;

-- Policies
create policy "Users can view their own settings" on user_settings for select using (auth.uid() = user_id);
create policy "Users can insert their own settings" on user_settings for insert with check (auth.uid() = user_id);
create policy "Users can update their own settings" on user_settings for update using (auth.uid() = user_id);

-- Storage (This usually requires Dashboard access to create the bucket 'images', but we can try to SQL it if extensions allow, otherwise instruct user)
-- For MVP, we assume 'images' bucket exists or we create it via dashboard.
-- Note: SQL to create bucket is not standard in public schema usually, needs storage schema access.
-- We will proceed assuming 'images' bucket is created manually or via client code if policy allows.
-- Just in case, policy for storage objects:
-- create policy "Authenticated users can upload images" on storage.objects for insert with check (bucket_id = 'images' and auth.role() = 'authenticated');
-- create policy "Public can view images" on storage.objects for select using (bucket_id = 'images');
