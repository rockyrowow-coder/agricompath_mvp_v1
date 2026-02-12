-- Phase 7: Community Security & Friendships

-- 1. Add password to communities
ALTER TABLE public.communities 
ADD COLUMN IF NOT EXISTS join_password text;

-- 2. Create friendships table
CREATE TABLE IF NOT EXISTS public.friendships (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    friend_id uuid REFERENCES auth.users(id) NOT NULL,
    status text CHECK (status IN ('pending', 'accepted', 'following')) DEFAULT 'pending',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id, friend_id)
);

-- 3. RLS for Friendships
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own friendships (both as query-er or target)
CREATE POLICY "Users can view their own friendships" 
ON public.friendships FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Allow users to create requests
CREATE POLICY "Users can create friendship requests" 
ON public.friendships FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own sent requests (e.g. cancel) or received requests (accept/reject)
CREATE POLICY "Users can update their friendships" 
ON public.friendships FOR UPDATE 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Allow users to delete their friendships
CREATE POLICY "Users can delete their friendships" 
ON public.friendships FOR DELETE 
USING (auth.uid() = user_id OR auth.uid() = friend_id);
