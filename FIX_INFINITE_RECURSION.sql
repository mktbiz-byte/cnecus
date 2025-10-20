-- =====================================================
-- FIX INFINITE RECURSION IN RLS POLICIES
-- US Platform
-- =====================================================
-- This script fixes the infinite recursion error by:
-- 1. Removing user_profiles table checks from campaigns policies
-- 2. Using ONLY JWT token for admin verification
-- 3. Ensuring no circular references
-- =====================================================

-- =====================================================
-- STEP 1: Drop ALL existing campaigns policies
-- =====================================================

DROP POLICY IF EXISTS "campaigns_select_all" ON campaigns;
DROP POLICY IF EXISTS "campaigns_insert_admin" ON campaigns;
DROP POLICY IF EXISTS "campaigns_update_admin" ON campaigns;
DROP POLICY IF EXISTS "campaigns_delete_admin" ON campaigns;
DROP POLICY IF EXISTS "Anyone can view active campaigns" ON campaigns;
DROP POLICY IF EXISTS "Admins can manage campaigns" ON campaigns;
DROP POLICY IF EXISTS "Enable read access for all users" ON campaigns;

-- =====================================================
-- STEP 2: Create NEW campaigns policies WITHOUT user_profiles reference
-- =====================================================

-- Anyone can SELECT campaigns (no admin check needed for reading)
CREATE POLICY "campaigns_select_all"
ON campaigns FOR SELECT
TO authenticated
USING (true);

-- Admins can INSERT campaigns (check JWT ONLY, no user_profiles)
CREATE POLICY "campaigns_insert_admin"
ON campaigns FOR INSERT
TO authenticated
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Admins can UPDATE campaigns (check JWT ONLY)
CREATE POLICY "campaigns_update_admin"
ON campaigns FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Admins can DELETE campaigns (check JWT ONLY)
CREATE POLICY "campaigns_delete_admin"
ON campaigns FOR DELETE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- =====================================================
-- STEP 3: Verify campaigns policies
-- =====================================================

SELECT 
  '=== Campaigns Policies ===' as section,
  policyname,
  cmd as command
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'campaigns'
ORDER BY policyname;

-- =====================================================
-- STEP 4: Ensure user_profiles policies are simple
-- =====================================================

-- Drop existing user_profiles policies
DROP POLICY IF EXISTS "user_profiles_select_own" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_own" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_own" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_select_admin" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_admin" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete_admin" ON user_profiles;

-- Create simple user_profiles policies (no recursion)
CREATE POLICY "user_profiles_select_own"
ON user_profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "user_profiles_insert_own"
ON user_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profiles_update_own"
ON user_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admin can SELECT all profiles (JWT only)
CREATE POLICY "user_profiles_select_admin"
ON user_profiles FOR SELECT
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Admin can UPDATE all profiles (JWT only)
CREATE POLICY "user_profiles_update_admin"
ON user_profiles FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Admin can DELETE profiles (JWT only)
CREATE POLICY "user_profiles_delete_admin"
ON user_profiles FOR DELETE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- =====================================================
-- STEP 5: Verify user_profiles policies
-- =====================================================

SELECT 
  '=== User Profiles Policies ===' as section,
  policyname,
  cmd as command
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'user_profiles'
ORDER BY policyname;

-- =====================================================
-- STEP 6: Verify admin user has role in JWT metadata
-- =====================================================

SELECT 
  '=== Admin User Check ===' as section,
  id,
  email,
  raw_user_meta_data->>'role' as role_in_jwt
FROM auth.users
WHERE email = 'mkt_biz@cnec.co.kr';

-- =====================================================
-- IMPORTANT: The role MUST be in raw_user_meta_data
-- =====================================================
-- If the role is NULL or not 'admin', run this:

UPDATE auth.users
SET raw_user_meta_data = 
  jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
  )
WHERE email = 'mkt_biz@cnec.co.kr';

-- Verify again
SELECT 
  '=== Verification ===' as section,
  id,
  email,
  raw_user_meta_data->>'role' as role_in_jwt,
  CASE 
    WHEN raw_user_meta_data->>'role' = 'admin' THEN '✅ CORRECT'
    ELSE '❌ STILL WRONG'
  END as status
FROM auth.users
WHERE email = 'mkt_biz@cnec.co.kr';

-- =====================================================
-- DONE! Now you must:
-- 1. Log out completely
-- 2. Clear browser cache OR use incognito mode
-- 3. Log in again (to get new JWT with admin role)
-- 4. Try creating a campaign
-- =====================================================

-- =====================================================
-- WHY THIS FIXES THE INFINITE RECURSION:
-- =====================================================
-- BEFORE: campaigns policies checked user_profiles table
--         → user_profiles has RLS policies
--         → those policies might check other tables
--         → INFINITE LOOP
--
-- AFTER:  campaigns policies check ONLY JWT token
--         → JWT is just a JSON object, no database query
--         → NO RECURSION
-- =====================================================

