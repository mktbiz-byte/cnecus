-- =====================================================
-- FIX ALL INFINITE RECURSION - Complete RLS Policy Reset
-- US Platform
-- =====================================================
-- This script completely removes ALL policies that reference
-- other tables and creates new policies using ONLY JWT tokens
-- =====================================================

-- =====================================================
-- STEP 1: Drop ALL existing RLS policies on ALL tables
-- =====================================================

-- user_profiles policies
DROP POLICY IF EXISTS "user_profiles_select_own" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_own" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_own" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_select_admin" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_admin" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete_admin" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON user_profiles;

-- campaigns policies
DROP POLICY IF EXISTS "campaigns_select_all" ON campaigns;
DROP POLICY IF EXISTS "campaigns_insert_admin" ON campaigns;
DROP POLICY IF EXISTS "campaigns_update_admin" ON campaigns;
DROP POLICY IF EXISTS "campaigns_delete_admin" ON campaigns;
DROP POLICY IF EXISTS "Anyone can view active campaigns" ON campaigns;
DROP POLICY IF EXISTS "Admins can manage campaigns" ON campaigns;
DROP POLICY IF EXISTS "Enable read access for all users" ON campaigns;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON campaigns;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON campaigns;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON campaigns;

-- campaign_applications policies
DROP POLICY IF EXISTS "applications_select_own" ON campaign_applications;
DROP POLICY IF EXISTS "applications_insert_own" ON campaign_applications;
DROP POLICY IF EXISTS "applications_update_own" ON campaign_applications;
DROP POLICY IF EXISTS "applications_select_admin" ON campaign_applications;
DROP POLICY IF EXISTS "applications_update_admin" ON campaign_applications;
DROP POLICY IF EXISTS "applications_delete_admin" ON campaign_applications;
DROP POLICY IF EXISTS "Users can view own applications" ON campaign_applications;
DROP POLICY IF EXISTS "Users can create applications" ON campaign_applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON campaign_applications;
DROP POLICY IF EXISTS "Admins can update applications" ON campaign_applications;

-- point_transactions policies
DROP POLICY IF EXISTS "point_transactions_select_own" ON point_transactions;
DROP POLICY IF EXISTS "point_transactions_select_admin" ON point_transactions;
DROP POLICY IF EXISTS "point_transactions_insert_system" ON point_transactions;
DROP POLICY IF EXISTS "Users can view own transactions" ON point_transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON point_transactions;
DROP POLICY IF EXISTS "System can insert transactions" ON point_transactions;

-- withdrawal_requests policies
DROP POLICY IF EXISTS "withdrawals_select_own" ON withdrawal_requests;
DROP POLICY IF EXISTS "withdrawals_insert_own" ON withdrawal_requests;
DROP POLICY IF EXISTS "withdrawals_select_admin" ON withdrawal_requests;
DROP POLICY IF EXISTS "withdrawals_update_admin" ON withdrawal_requests;
DROP POLICY IF EXISTS "Users can view own withdrawals" ON withdrawal_requests;
DROP POLICY IF EXISTS "Users can create withdrawals" ON withdrawal_requests;
DROP POLICY IF EXISTS "Admins can view all withdrawals" ON withdrawal_requests;
DROP POLICY IF EXISTS "Admins can update withdrawals" ON withdrawal_requests;

-- =====================================================
-- STEP 2: Create NEW policies using ONLY JWT tokens
-- =====================================================

-- =====================================================
-- user_profiles: Simple policies, NO other table references
-- =====================================================

-- Users can SELECT their own profile
CREATE POLICY "user_profiles_select_own"
ON user_profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can INSERT their own profile
CREATE POLICY "user_profiles_insert_own"
ON user_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can UPDATE their own profile
CREATE POLICY "user_profiles_update_own"
ON user_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can SELECT all profiles (JWT only)
CREATE POLICY "user_profiles_select_admin"
ON user_profiles FOR SELECT
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Admins can UPDATE all profiles (JWT only)
CREATE POLICY "user_profiles_update_admin"
ON user_profiles FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Admins can DELETE profiles (JWT only)
CREATE POLICY "user_profiles_delete_admin"
ON user_profiles FOR DELETE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- =====================================================
-- campaigns: Public read, admin write (JWT only)
-- =====================================================

-- Anyone can SELECT campaigns
CREATE POLICY "campaigns_select_all"
ON campaigns FOR SELECT
TO authenticated
USING (true);

-- Admins can INSERT campaigns (JWT only)
CREATE POLICY "campaigns_insert_admin"
ON campaigns FOR INSERT
TO authenticated
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Admins can UPDATE campaigns (JWT only)
CREATE POLICY "campaigns_update_admin"
ON campaigns FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Admins can DELETE campaigns (JWT only)
CREATE POLICY "campaigns_delete_admin"
ON campaigns FOR DELETE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- =====================================================
-- campaign_applications: Users see own, admins see all (JWT only)
-- =====================================================

-- Users can SELECT their own applications
CREATE POLICY "applications_select_own"
ON campaign_applications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can INSERT their own applications
CREATE POLICY "applications_insert_own"
ON campaign_applications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can UPDATE their own applications
CREATE POLICY "applications_update_own"
ON campaign_applications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can SELECT all applications (JWT only)
CREATE POLICY "applications_select_admin"
ON campaign_applications FOR SELECT
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Admins can UPDATE all applications (JWT only)
CREATE POLICY "applications_update_admin"
ON campaign_applications FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Admins can DELETE applications (JWT only)
CREATE POLICY "applications_delete_admin"
ON campaign_applications FOR DELETE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- =====================================================
-- point_transactions: Users see own, admins see all (JWT only)
-- =====================================================

-- Users can SELECT their own transactions
CREATE POLICY "point_transactions_select_own"
ON point_transactions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can SELECT all transactions (JWT only)
CREATE POLICY "point_transactions_select_admin"
ON point_transactions FOR SELECT
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- System can INSERT transactions (any authenticated user can create)
CREATE POLICY "point_transactions_insert_system"
ON point_transactions FOR INSERT
TO authenticated
WITH CHECK (true);

-- =====================================================
-- withdrawal_requests: Users see own, admins see all (JWT only)
-- =====================================================

-- Users can SELECT their own withdrawals
CREATE POLICY "withdrawals_select_own"
ON withdrawal_requests FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can INSERT their own withdrawals
CREATE POLICY "withdrawals_insert_own"
ON withdrawal_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admins can SELECT all withdrawals (JWT only)
CREATE POLICY "withdrawals_select_admin"
ON withdrawal_requests FOR SELECT
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Admins can UPDATE all withdrawals (JWT only)
CREATE POLICY "withdrawals_update_admin"
ON withdrawal_requests FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- =====================================================
-- STEP 3: Ensure admin role is set in auth.users
-- =====================================================

-- Check current admin user
SELECT 
  '=== Admin User Check ===' as section,
  id,
  email,
  raw_user_meta_data->>'role' as role_in_jwt
FROM auth.users
WHERE email = 'mkt_biz@cnec.co.kr';

-- Set admin role if not already set
UPDATE auth.users
SET raw_user_meta_data = 
  jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
  )
WHERE email = 'mkt_biz@cnec.co.kr';

-- Verify admin role is set
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
-- STEP 4: Verify all policies
-- =====================================================

SELECT 
  '=== All RLS Policies ===' as section,
  tablename,
  policyname,
  cmd as command
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'campaigns', 'campaign_applications', 'point_transactions', 'withdrawal_requests')
ORDER BY tablename, policyname;

-- =====================================================
-- DONE! Now you MUST:
-- =====================================================
-- 1. Log out completely from the website
-- 2. Clear browser cache OR use incognito mode
-- 3. Log in again (to get new JWT with admin role)
-- 4. Try creating a campaign
-- 5. Try applying to a campaign
-- 
-- Both should work without infinite recursion errors!
-- =====================================================

-- =====================================================
-- KEY PRINCIPLE:
-- =====================================================
-- ❌ NEVER reference other tables in RLS policies
-- ✅ ALWAYS use only JWT tokens and auth.uid()
-- 
-- This prevents infinite recursion because:
-- - JWT is just a JSON object (no database query)
-- - auth.uid() is a simple function (no table access)
-- - No circular dependencies possible
-- =====================================================

