-- 1. Drop the foreign key constraint that ties profiles to Supabase Auth
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. Add a new column to store the Clerk User ID
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS clerk_id TEXT UNIQUE;

-- 3. We can optionally set a default UUID generation for the 'id' column if it doesn't already have one
-- (It already has it in most setups, but let's be safe for inserts without an explicit ID)
ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT uuid_generate_v4();
