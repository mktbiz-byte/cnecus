-- =====================================================
-- TEST ADMIN ACCESS - Quick Verification Script
-- US Platform
-- =====================================================

-- =====================================================
-- TEST 1: Check if user exists and has admin role
-- =====================================================
SELECT 
  '=== TEST 1: User Auth Data ===' as test,
  id as user_id,
  email,
  raw_user_meta_data->>'role' as role_in_jwt_metadata,
  CASE 
    WHEN raw_user_meta_data->>'role' = 'admin' THEN '✅ PASS'
    ELSE '❌ FAIL - Role is not admin'
  END as status
FROM auth.users
WHERE email = 'mkt_biz@cnec.co.kr';

-- =====================================================
-- TEST 2: Check user_profiles table
-- =====================================================
SELECT 
  '=== TEST 2: User Profile Data ===' as test,
  user_id,
  email,
  role,
  CASE 
    WHEN role = 'admin' THEN '✅ PASS'
    ELSE '❌ FAIL - Role is not admin'
  END as status
FROM user_profiles
WHERE email = 'mkt_biz@cnec.co.kr';

-- =====================================================
-- TEST 3: Check RLS policies on campaigns table
-- =====================================================
SELECT 
  '=== TEST 3: Campaigns RLS Policies ===' as test,
  policyname,
  cmd as command,
  CASE 
    WHEN policyname LIKE '%admin%' THEN '✅ Admin policy exists'
    ELSE 'ℹ️ Other policy'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'campaigns'
ORDER BY policyname;

-- =====================================================
-- TEST 4: Check if RLS is enabled on campaigns
-- =====================================================
SELECT 
  '=== TEST 4: RLS Status ===' as test,
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity = true THEN '✅ RLS is enabled'
    ELSE '⚠️ RLS is disabled'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'campaigns';

-- =====================================================
-- TEST 5: Check Storage buckets
-- =====================================================
SELECT 
  '=== TEST 5: Storage Buckets ===' as test,
  id as bucket_id,
  name as bucket_name,
  public,
  CASE 
    WHEN name IN ('campaign-images', 'creator-materials') THEN '✅ Required bucket exists'
    ELSE 'ℹ️ Other bucket'
  END as status
FROM storage.buckets
ORDER BY name;

-- =====================================================
-- TEST 6: Check Storage policies
-- =====================================================
SELECT 
  '=== TEST 6: Storage Policies ===' as test,
  bucket_id,
  name as policy_name,
  CASE 
    WHEN name LIKE '%admin%' OR name LIKE '%authenticated%' THEN '✅ Policy exists'
    ELSE 'ℹ️ Other policy'
  END as status
FROM storage.policies
WHERE bucket_id IN ('campaign-images', 'creator-materials')
ORDER BY bucket_id, name;

-- =====================================================
-- TEST 7: Count existing campaigns (should work for admin)
-- =====================================================
SELECT 
  '=== TEST 7: Campaigns Count ===' as test,
  COUNT(*) as total_campaigns,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_campaigns,
  COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_campaigns,
  '✅ Query successful' as status
FROM campaigns;

-- =====================================================
-- TEST 8: Count campaign applications
-- =====================================================
SELECT 
  '=== TEST 8: Applications Count ===' as test,
  COUNT(*) as total_applications,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_applications,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_applications,
  '✅ Query successful' as status
FROM campaign_applications;

-- =====================================================
-- SUMMARY
-- =====================================================
SELECT 
  '=== SUMMARY ===' as section,
  (SELECT COUNT(*) FROM auth.users WHERE email = 'mkt_biz@cnec.co.kr' AND raw_user_meta_data->>'role' = 'admin') as admin_in_auth,
  (SELECT COUNT(*) FROM user_profiles WHERE email = 'mkt_biz@cnec.co.kr' AND role = 'admin') as admin_in_profiles,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'campaigns' AND policyname LIKE '%admin%') as admin_policies,
  (SELECT COUNT(*) FROM storage.buckets WHERE name IN ('campaign-images', 'creator-materials')) as storage_buckets,
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users WHERE email = 'mkt_biz@cnec.co.kr' AND raw_user_meta_data->>'role' = 'admin') > 0
      AND (SELECT COUNT(*) FROM user_profiles WHERE email = 'mkt_biz@cnec.co.kr' AND role = 'admin') > 0
      AND (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'campaigns' AND policyname LIKE '%admin%') >= 3
    THEN '✅ ALL CHECKS PASSED - Ready to test campaign creation'
    ELSE '❌ SOME CHECKS FAILED - Review results above'
  END as overall_status;

-- =====================================================
-- INSTRUCTIONS
-- =====================================================
-- 1. Run this entire script in US Supabase SQL Editor
-- 2. Review all test results
-- 3. If overall_status is ✅, proceed to:
--    a. Log out completely from website
--    b. Clear browser cache/cookies OR use incognito mode
--    c. Log in again
--    d. Try creating a campaign
-- 4. If overall_status is ❌, check COMPLETE_US_SCHEMA.sql was applied
-- =====================================================

