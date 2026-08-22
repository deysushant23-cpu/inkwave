-- =================================================================================
-- PHASE 6: POSTGRESQL ROW LEVEL SECURITY (RLS) AUDIT SCRIPT
-- =================================================================================

-- 1. Verify RLS is enabled on all tables
-- Any table returned by this query is MISSING RLS.
SELECT relname as "Table without RLS" 
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' 
  AND c.relkind = 'r' 
  AND NOT c.relrowsecurity;

-- 2. Validate Profiles Isolation Policy
-- Expected: Users can only read/update their own profile
-- Expected: Admins can read all profiles (via JWT claims)
-- Note: Replace this with the actual pg_policies query to check policy definitions
SELECT tablename, policyname, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- 3. Validate Products Public Read Access
-- Expected: Products and Categories should be readable by PUBLIC
SELECT tablename, policyname, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename IN ('products', 'categories');

-- 4. Sample JWT Custom Claim Admin Policy (For illustration)
/*
  CREATE POLICY "Admin full access to products" 
  ON public.products 
  FOR ALL 
  TO authenticated 
  USING (
    (auth.jwt() ->> 'role')::text IN ('super_admin', 'store_ops', 'content_mgr')
  );
*/
