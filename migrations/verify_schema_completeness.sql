-- ============================================================
-- SCHEMA VERIFICATION (READ-ONLY) - cnec-us.com 전체 코드 기준
-- DB를 변경하지 않음. 체크만 함.
-- Supabase SQL Editor에서 실행
-- ============================================================

-- ============================================================
-- 1. 테이블 존재 여부 체크
-- ============================================================
SELECT t.table_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = t.table_name
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END AS status
FROM (VALUES
  ('user_profiles'),
  ('campaigns'),
  ('campaign_applications'),
  ('withdrawal_requests'),
  ('point_transactions'),
  ('email_templates')
) AS t(table_name)
ORDER BY status, table_name;

-- ============================================================
-- 2. USER_PROFILES 컬럼 체크
-- ============================================================
SELECT 'user_profiles' AS "table", col AS "column",
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='user_profiles' AND column_name=col
  ) THEN '✅' ELSE '❌ MISSING' END AS status
FROM unnest(ARRAY[
  'id', 'user_id', 'name', 'email', 'bio', 'age',
  'phone', 'gender', 'skin_type', 'address', 'role',
  'profile_image_url',
  'instagram_url', 'tiktok_url', 'youtube_url', 'other_sns_url',
  'created_at', 'updated_at'
]) AS col
ORDER BY status DESC, col;

-- ============================================================
-- 3. CAMPAIGNS 컬럼 체크
-- ============================================================
SELECT 'campaigns' AS "table", col AS "column",
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='campaigns' AND column_name=col
  ) THEN '✅' ELSE '❌ MISSING' END AS status
FROM unnest(ARRAY[
  -- 기본
  'id', 'title', 'brand', 'status', 'image_url',
  'campaign_type',
  -- 데드라인
  'application_deadline', 'video_deadline', 'sns_deadline',
  'week1_deadline', 'week2_deadline', 'week3_deadline', 'week4_deadline',
  'week1_sns_deadline', 'week2_sns_deadline', 'week3_sns_deadline', 'week4_sns_deadline',
  -- 커스텀 질문
  'question1', 'question1_type', 'question1_options', 'question_1_required',
  'question2', 'question2_type', 'question2_options', 'question_2_required',
  'question3', 'question3_type', 'question3_options', 'question_3_required',
  'question4', 'question4_type', 'question4_options', 'question_4_required',
  -- 자료 URL
  'google_drive_url', 'google_slides_url',
  'video_guide_url', 'reference_video_url',
  -- 촬영 가이드
  'shooting_guide',
  'shooting_scenes_ba_photo', 'shooting_scenes_no_makeup',
  'shooting_scenes_closeup', 'shooting_scenes_product_closeup',
  'shooting_scenes_product_texture', 'shooting_scenes_outdoor',
  'shooting_scenes_couple', 'shooting_scenes_child',
  'shooting_scenes_troubled_skin', 'shooting_scenes_wrinkles',
  -- 영문 콘텐츠
  'title_en', 'brand_en', 'brand_name_en',
  'product_name_en', 'product_description_en', 'product_features_en',
  'required_dialogues_en', 'required_scenes_en', 'required_hashtags_en',
  'shooting_scenes_en',
  'video_duration_en', 'video_tempo_en', 'video_tone_en',
  'additional_details_en', 'additional_shooting_requests_en',
  -- 특수 요구사항
  'requires_ad_code', 'meta_ad_code_requested', 'requires_clean_video',
  -- 타겟
  'target_platforms', 'age_requirement', 'skin_type_requirement', 'target_country',
  -- 타임스탬프
  'created_at', 'updated_at'
]) AS col
ORDER BY status DESC, col;

-- ============================================================
-- 4. CAMPAIGN_APPLICATIONS 컬럼 체크
-- ============================================================
SELECT 'campaign_applications' AS "table", col AS "column",
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='campaign_applications' AND column_name=col
  ) THEN '✅' ELSE '❌ MISSING' END AS status
FROM unnest(ARRAY[
  -- 기본
  'id', 'campaign_id', 'user_id', 'status',
  -- 지원자 정보
  'applicant_name', 'email', 'age_range', 'skin_type', 'profile_photo_url',
  -- SNS
  'instagram_url', 'tiktok_url', 'youtube_url', 'other_sns_url',
  'instagram_followers', 'tiktok_followers', 'youtube_subscribers',
  -- 답변
  'answer_1', 'answer_2', 'answer_3', 'answer_4',
  'additional_info', 'portrait_rights_consent', 'points_requested',
  -- 가이드 자료 (어드민→크리에이터)
  'google_drive_url', 'google_slides_url', 'drive_notes', 'drive_provided_at',
  -- 영상 워크플로우
  'video_url', 'video_submission_url', 'video_submitted_at',
  'revision_requested', 'revision_notes', 'revision_requests',
  'clean_video_url', 'partnership_code',
  -- SNS 제출
  'sns_url', 'sns_upload_url', 'sns_submitted_at',
  -- 4주 챌린지
  'week1_video_url', 'week1_sns_url',
  'week2_video_url', 'week2_sns_url',
  'week3_video_url', 'week3_sns_url',
  'week4_video_url', 'week4_sns_url',
  'custom_deadlines',
  -- 연락처/배송
  'phone_number', 'postal_code', 'address', 'address_detail',
  'contact_submitted', 'contact_submitted_at',
  'contact_email_sent', 'contact_email_sent_at',
  'shipped_at', 'tracking_number', 'shipping_status',
  -- 상태 타임스탬프
  'virtual_selected_at', 'rejected_at', 'approved_at', 'completed_at',
  'created_at', 'updated_at'
]) AS col
ORDER BY status DESC, col;

-- ============================================================
-- 5. WITHDRAWAL_REQUESTS 컬럼 체크
-- ============================================================
SELECT 'withdrawal_requests' AS "table", col AS "column",
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='withdrawal_requests' AND column_name=col
  ) THEN '✅' ELSE '❌ MISSING' END AS status
FROM unnest(ARRAY[
  'id', 'user_id', 'amount', 'status',
  'withdrawal_method', 'paypal_email', 'paypal_name',
  'reason', 'notes', 'bank_info',
  'processed_by', 'processed_at', 'platform_region',
  'created_at', 'updated_at'
]) AS col
ORDER BY status DESC, col;

-- ============================================================
-- 6. POINT_TRANSACTIONS 컬럼 체크
-- ============================================================
SELECT 'point_transactions' AS "table", col AS "column",
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='point_transactions' AND column_name=col
  ) THEN '✅' ELSE '❌ MISSING' END AS status
FROM unnest(ARRAY[
  'id', 'user_id', 'amount',
  'transaction_type', 'description', 'status',
  'created_at', 'updated_at'
]) AS col
ORDER BY status DESC, col;

-- ============================================================
-- 7. EMAIL_TEMPLATES 컬럼 체크
-- ============================================================
SELECT 'email_templates' AS "table", col AS "column",
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='email_templates' AND column_name=col
  ) THEN '✅' ELSE '❌ MISSING' END AS status
FROM unnest(ARRAY[
  'id', 'template_type', 'subject', 'body',
  'variables', 'is_active',
  'created_at', 'updated_at'
]) AS col
ORDER BY status DESC, col;

-- ============================================================
-- 8. STORAGE BUCKETS 체크
-- ============================================================
SELECT id AS bucket_name, public AS is_public
FROM storage.buckets
WHERE id IN ('campaign-images', 'profile-images', 'video-uploads');

-- ============================================================
-- 9. 요약: 테이블별 컬럼 수
-- ============================================================
SELECT table_name, COUNT(*) AS total_columns
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'user_profiles', 'campaigns', 'campaign_applications',
    'withdrawal_requests', 'point_transactions', 'email_templates'
  )
GROUP BY table_name
ORDER BY table_name;
