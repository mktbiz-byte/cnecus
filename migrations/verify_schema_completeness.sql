-- ============================================================
-- SCHEMA VERIFICATION SCRIPT (READ-ONLY)
-- Checks which columns exist and which are missing
-- Run this FIRST to see the current state before fixing
-- ============================================================

-- 1. USER_PROFILES: Check required columns
SELECT 'user_profiles' AS "table",
  col AS "column",
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_profiles'
      AND column_name = col
  ) THEN 'EXISTS' ELSE 'MISSING' END AS status
FROM unnest(ARRAY[
  'user_id', 'name', 'email', 'role', 'phone', 'bio', 'age', 'region',
  'gender', 'skin_type', 'address', 'profile_image_url',
  'instagram_url', 'tiktok_url', 'youtube_url', 'other_sns_url',
  'instagram_followers', 'tiktok_followers', 'youtube_subscribers',
  'platform_region', 'created_at', 'updated_at'
]) AS col
ORDER BY status DESC, col;

-- 2. CAMPAIGNS: Check required columns
SELECT 'campaigns' AS "table",
  col AS "column",
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'campaigns'
      AND column_name = col
  ) THEN 'EXISTS' ELSE 'MISSING' END AS status
FROM unnest(ARRAY[
  'id', 'title', 'brand', 'description', 'image_url', 'status',
  'campaign_type', 'reward_amount', 'max_participants',
  'application_deadline', 'video_deadline', 'sns_deadline',
  'week1_deadline', 'week2_deadline', 'week3_deadline', 'week4_deadline',
  'week1_sns_deadline', 'week2_sns_deadline', 'week3_sns_deadline', 'week4_sns_deadline',
  'question1', 'question2', 'question3', 'question4',
  'question1_type', 'question2_type', 'question3_type', 'question4_type',
  'google_drive_url', 'google_slides_url', 'video_guide_url',
  'title_en', 'brand_en', 'brand_name_en', 'product_name_en',
  'required_dialogues_en', 'required_scenes_en', 'required_hashtags_en',
  'video_duration_en', 'video_tempo_en', 'video_tone_en',
  'shooting_scenes_ba_photo', 'shooting_scenes_no_makeup',
  'shooting_scenes_closeup', 'shooting_scenes_product_closeup',
  'requires_ad_code', 'requires_clean_video', 'meta_ad_code_requested',
  'target_country', 'platform_region'
]) AS col
ORDER BY status DESC, col;

-- 3. CAMPAIGN_APPLICATIONS: Check required columns
SELECT 'campaign_applications' AS "table",
  col AS "column",
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'campaign_applications'
      AND column_name = col
  ) THEN 'EXISTS' ELSE 'MISSING' END AS status
FROM unnest(ARRAY[
  'id', 'campaign_id', 'user_id', 'status',
  'applicant_name', 'email', 'age_range', 'skin_type', 'profile_photo_url',
  'instagram_url', 'tiktok_url', 'youtube_url', 'other_sns_url',
  'instagram_followers', 'tiktok_followers', 'youtube_subscribers',
  'answer_1', 'answer_2', 'answer_3', 'answer_4',
  'additional_info', 'portrait_rights_consent', 'points_requested',
  'google_drive_url', 'google_slides_url',
  'video_url', 'video_submitted_at', 'sns_url', 'sns_upload_url', 'sns_submitted_at',
  'revision_requests', 'revision_requested', 'clean_video_url', 'partnership_code',
  'week1_video_url', 'week1_sns_url', 'week2_video_url', 'week2_sns_url',
  'week3_video_url', 'week3_sns_url', 'week4_video_url', 'week4_sns_url',
  'custom_deadlines',
  'phone_number', 'address', 'shipping_status', 'tracking_number',
  'applicant_country', 'platform_region'
]) AS col
ORDER BY status DESC, col;

-- 4. WITHDRAWAL_REQUESTS: Check required columns
SELECT 'withdrawal_requests' AS "table",
  col AS "column",
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'withdrawal_requests'
      AND column_name = col
  ) THEN 'EXISTS' ELSE 'MISSING' END AS status
FROM unnest(ARRAY[
  'id', 'user_id', 'amount', 'paypal_email', 'paypal_name',
  'status', 'admin_notes', 'reason', 'transaction_id',
  'withdrawal_method', 'processed_by', 'processed_at', 'platform_region'
]) AS col
ORDER BY status DESC, col;

-- 5. SUMMARY: Count missing per table
SELECT 'SUMMARY' AS info,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='user_profiles') AS user_profiles_cols,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='campaigns') AS campaigns_cols,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='campaign_applications') AS applications_cols,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='withdrawal_requests') AS withdrawals_cols;
