-- Phase 5.2 Fix: Add missing 'is_public' column and reload schema cache

-- 1. Ensure 'is_public' column exists in records table
ALTER TABLE public.records 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- 2. Ensure 'is_public' column exists in inventory (just in case future needs)
-- Not needed yet, skipping.

-- 3. Just in case other columns are missing from previous updates, lets add them safely
ALTER TABLE public.records 
ADD COLUMN IF NOT EXISTS time_start TEXT,
ADD COLUMN IF NOT EXISTS time_end TEXT,
ADD COLUMN IF NOT EXISTS pesticide TEXT, 
ADD COLUMN IF NOT EXISTS dilution TEXT,
ADD COLUMN IF NOT EXISTS work_type TEXT;

-- 4. Reload PostgREST Schema Cache (Critical for PGRST204 error)
NOTIFY pgrst, 'reload schema';

-- 5. Re-apply RLS policies just to be sure
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;
