-- =====================================================
-- FIX RLS ADMIN ACCESS - US Platform
-- =====================================================
-- This script fixes the RLS policy issue preventing admin users
-- from creating campaigns. The problem is that JWT tokens need
-- to be refreshed after granting admin role.
-- =====================================================

-- =====================================================
-- STEP 1: Verify current admin user setup
-- =====================================================

-- Check if user exists and has admin role in auth.users
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role_in_metadata,
  raw_user_meta_data
FROM auth.users
WHERE email = 'mkt_biz@cnec.co.kr';

-- Check if user exists in user_profiles
SELECT 
  user_id,
  email,
  name,
  role
FROM user_profiles
WHERE email = 'mkt_biz@cnec.co.kr';

-- =====================================================
-- STEP 2: Ensure admin role is properly set
-- =====================================================

-- Update auth.users metadata
UPDATE auth.users
SET raw_user_meta_data = 
  jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
  )
WHERE email = 'mkt_biz@cnec.co.kr';

-- Update user_profiles table
UPDATE user_profiles
SET role = 'admin'
WHERE email = 'mkt_biz@cnec.co.kr';

-- =====================================================
-- STEP 3: Check current RLS policies on campaigns table
-- =====================================================

SELECT 
  policyname,
  cmd,
  qual as using_clause,
  with_check as with_check_clause
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'campaigns'
ORDER BY policyname;

-- =====================================================
-- STEP 4: Create more permissive admin policies
-- =====================================================

-- Drop existing admin policies
DROP POLICY IF EXISTS "campaigns_insert_admin" ON campaigns;
DROP POLICY IF EXISTS "campaigns_update_admin" ON campaigns;
DROP POLICY IF EXISTS "campaigns_delete_admin" ON campaigns;

-- Create new admin policies with multiple checks
CREATE POLICY "campaigns_insert_admin"
ON campaigns FOR INSERT
TO authenticated
WITH CHECK (
  -- Check JWT metadata
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  OR
  -- Check user_profiles table
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

CREATE POLICY "campaigns_update_admin"
ON campaigns FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  OR
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.role = 'admin'
  )
)
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  OR
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

CREATE POLICY "campaigns_delete_admin"
ON campaigns FOR DELETE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  OR
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

-- =====================================================
-- STEP 5: Verify new policies
-- =====================================================

SELECT 
  policyname,
  cmd,
  qual as using_clause,
  with_check as with_check_clause
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'campaigns'
  AND policyname LIKE '%admin%'
ORDER BY policyname;

-- =====================================================
-- IMPORTANT: NEXT STEPS
-- =====================================================
-- 1. Run this SQL in US Supabase SQL Editor
-- 2. Log out from the website completely
-- 3. Clear browser cache/cookies (or use incognito mode)
-- 4. Log in again to get fresh JWT token with admin role
-- 5. Try creating a campaign
-- 
-- If still not working:
-- - Check browser console for errors
-- - Check Supabase logs for RLS violations
-- - Verify JWT token contains role: admin in user_metadata
-- =====================================================

