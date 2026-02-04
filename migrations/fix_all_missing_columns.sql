-- ============================================================
-- COMPREHENSIVE COLUMN FIX: Add all missing columns
-- Run this in Supabase SQL Editor
-- Safe to run multiple times (uses IF NOT EXISTS)
-- ============================================================

-- ============================================================
-- 1. USER_PROFILES - Missing columns
-- ============================================================

-- Profile image
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- SNS URLs
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS tiktok_url TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS other_sns_url TEXT;

-- Personal info
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS skin_type TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- ============================================================
-- 2. CAMPAIGNS - Missing columns
-- ============================================================

-- Campaign type
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS campaign_type TEXT DEFAULT 'standard';

-- Deadlines
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS application_deadline DATE;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS video_deadline DATE;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS sns_deadline DATE;

-- 4-week challenge deadlines
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS week1_deadline DATE;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS week2_deadline DATE;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS week3_deadline DATE;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS week4_deadline DATE;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS week1_sns_deadline DATE;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS week2_sns_deadline DATE;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS week3_sns_deadline DATE;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS week4_sns_deadline DATE;

-- Custom questions (1-4)
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS question1 TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS question1_type TEXT DEFAULT 'text';
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS question1_options TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS question_1_required BOOLEAN DEFAULT FALSE;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS question2 TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS question2_type TEXT DEFAULT 'text';
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS question2_options TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS question_2_required BOOLEAN DEFAULT FALSE;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS question3 TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS question3_type TEXT DEFAULT 'text';
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS question3_options TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS question_3_required BOOLEAN DEFAULT FALSE;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS question4 TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS question4_type TEXT DEFAULT 'text';
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS question4_options TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS question_4_required BOOLEAN DEFAULT FALSE;

-- Material URLs (on campaigns table)
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS google_drive_url TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS google_slides_url TEXT;

-- Shooting guide fields
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS shooting_guide JSONB;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS shooting_scenes_ba_photo BOOLEAN DEFAULT FALSE;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS shooting_scenes_no_makeup BOOLEAN DEFAULT FALSE;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS shooting_scenes_closeup BOOLEAN DEFAULT FALSE;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS shooting_scenes_product_closeup BOOLEAN DEFAULT FALSE;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS shooting_scenes_product_texture BOOLEAN DEFAULT FALSE;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS shooting_scenes_outdoor BOOLEAN DEFAULT FALSE;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS shooting_scenes_couple BOOLEAN DEFAULT FALSE;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS shooting_scenes_child BOOLEAN DEFAULT FALSE;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS shooting_scenes_troubled_skin BOOLEAN DEFAULT FALSE;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS shooting_scenes_wrinkles BOOLEAN DEFAULT FALSE;

-- Video/content specs (English)
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS title_en TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS brand_en TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS brand_name_en TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS product_name_en TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS product_description_en TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS product_features_en JSONB;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS required_dialogues_en JSONB;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS required_scenes_en JSONB;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS required_hashtags_en JSONB;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS shooting_scenes_en JSONB;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS video_duration_en TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS video_tempo_en TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS video_tone_en TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS additional_details_en TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS additional_shooting_requests_en TEXT;

-- Special requirements
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS requires_ad_code BOOLEAN DEFAULT FALSE;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS meta_ad_code_requested BOOLEAN DEFAULT FALSE;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS requires_clean_video BOOLEAN DEFAULT FALSE;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS video_guide_url TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS reference_video_url TEXT;

-- Target platforms
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS target_platforms JSONB;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS age_requirement TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS skin_type_requirement TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS target_country TEXT;

-- ============================================================
-- 3. CAMPAIGN_APPLICATIONS - Missing columns
-- ============================================================

-- Applicant personal info
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS applicant_name TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS age_range TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS skin_type TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

-- SNS URLs (per application)
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS tiktok_url TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS other_sns_url TEXT;

-- SNS followers (per application)
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS instagram_followers INTEGER;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS tiktok_followers INTEGER;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS youtube_subscribers INTEGER;

-- Question answers
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS answer_1 TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS answer_2 TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS answer_3 TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS answer_4 TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS additional_info TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS portrait_rights_consent BOOLEAN DEFAULT FALSE;

-- Points
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS points_requested BOOLEAN DEFAULT FALSE;

-- Google Drive/Slides (admin provides to creator)
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS google_drive_url TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS google_slides_url TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS drive_notes TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS drive_provided_at TIMESTAMPTZ;

-- Video workflow
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS video_submission_url TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS video_submitted_at TIMESTAMPTZ;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS revision_requested BOOLEAN DEFAULT FALSE;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS revision_notes TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS revision_requests JSONB DEFAULT '[]'::jsonb;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS clean_video_url TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS partnership_code TEXT;

-- SNS submission
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS sns_url TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS sns_upload_url TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS sns_submitted_at TIMESTAMPTZ;

-- 4-week challenge per-week fields
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS week1_video_url TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS week1_sns_url TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS week2_video_url TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS week2_sns_url TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS week3_video_url TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS week3_sns_url TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS week4_video_url TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS week4_sns_url TEXT;

-- Custom deadlines (admin per-application override)
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS custom_deadlines JSONB;

-- Contact fields
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS address_detail TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS contact_submitted BOOLEAN DEFAULT FALSE;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS contact_submitted_at TIMESTAMPTZ;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS contact_email_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS contact_email_sent_at TIMESTAMPTZ;

-- Shipping
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS shipping_status TEXT DEFAULT 'pending';

-- Virtual selection
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS virtual_selected_at TIMESTAMPTZ;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;

-- ============================================================
-- 4. WITHDRAWAL_REQUESTS - Missing columns
-- ============================================================

ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS withdrawal_method TEXT DEFAULT 'paypal';
ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS processed_by UUID;
ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS platform_region VARCHAR(10) DEFAULT 'us';

-- ============================================================
-- 5. VERIFICATION: Check all columns exist
-- ============================================================

-- user_profiles check
SELECT 'user_profiles' AS table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- campaigns check
SELECT 'campaigns' AS table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'campaigns'
ORDER BY ordinal_position;

-- campaign_applications check
SELECT 'campaign_applications' AS table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'campaign_applications'
ORDER BY ordinal_position;

-- withdrawal_requests check
SELECT 'withdrawal_requests' AS table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'withdrawal_requests'
ORDER BY ordinal_position;
