-- ============================================================
-- COMPREHENSIVE COLUMN & TABLE FIX: All missing items
-- Run this in Supabase SQL Editor
-- Safe to run multiple times (uses IF NOT EXISTS)
-- Last updated: 2026-02-04 (double-checked against full codebase)
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
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS address TEXT;

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

-- Virtual selection & status timestamps
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS virtual_selected_at TIMESTAMPTZ;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- ============================================================
-- 4. WITHDRAWAL_REQUESTS - Missing columns
-- ============================================================

ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS withdrawal_method TEXT DEFAULT 'paypal';
ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS processed_by UUID;
ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS platform_region VARCHAR(10) DEFAULT 'us';
ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS paypal_email TEXT;
ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS paypal_name TEXT;
ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS reason TEXT;
ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;
ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS bank_info JSONB;

-- ============================================================
-- 5. POINT_TRANSACTIONS - Create table if not exists
-- ============================================================

CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL DEFAULT 'admin_add',
  description TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user point lookups
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at ON point_transactions(created_at DESC);

-- ============================================================
-- 6. EMAIL_TEMPLATES - Create table if not exists
-- ============================================================

CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_type TEXT NOT NULL,
  subject TEXT,
  body TEXT,
  variables JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_templates_type ON email_templates(template_type);

-- ============================================================
-- 7. RLS POLICIES - Admin full access for all tables
-- ============================================================

-- Enable RLS on all tables (safe to run if already enabled)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- Helper: Create admin check function
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND (role = 'admin' OR role = 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add role column to user_profiles if missing
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- --------------------------------------------------------
-- USER_PROFILES RLS
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin full access to user_profiles" ON user_profiles;
CREATE POLICY "Admin full access to user_profiles" ON user_profiles
  FOR ALL USING (public.is_admin());

-- --------------------------------------------------------
-- CAMPAIGNS RLS
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view active campaigns" ON campaigns;
CREATE POLICY "Anyone can view active campaigns" ON campaigns
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full access to campaigns" ON campaigns;
CREATE POLICY "Admin full access to campaigns" ON campaigns
  FOR ALL USING (public.is_admin());

-- --------------------------------------------------------
-- CAMPAIGN_APPLICATIONS RLS
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own applications" ON campaign_applications;
CREATE POLICY "Users can view own applications" ON campaign_applications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own applications" ON campaign_applications;
CREATE POLICY "Users can insert own applications" ON campaign_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own applications" ON campaign_applications;
CREATE POLICY "Users can update own applications" ON campaign_applications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin full access to campaign_applications" ON campaign_applications;
CREATE POLICY "Admin full access to campaign_applications" ON campaign_applications
  FOR ALL USING (public.is_admin());

-- --------------------------------------------------------
-- WITHDRAWAL_REQUESTS RLS
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own withdrawals" ON withdrawal_requests;
CREATE POLICY "Users can view own withdrawals" ON withdrawal_requests
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own withdrawals" ON withdrawal_requests;
CREATE POLICY "Users can insert own withdrawals" ON withdrawal_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin full access to withdrawal_requests" ON withdrawal_requests;
CREATE POLICY "Admin full access to withdrawal_requests" ON withdrawal_requests
  FOR ALL USING (public.is_admin());

-- --------------------------------------------------------
-- POINT_TRANSACTIONS RLS
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own points" ON point_transactions;
CREATE POLICY "Users can view own points" ON point_transactions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin full access to point_transactions" ON point_transactions;
CREATE POLICY "Admin full access to point_transactions" ON point_transactions
  FOR ALL USING (public.is_admin());

-- --------------------------------------------------------
-- EMAIL_TEMPLATES RLS
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Admin full access to email_templates" ON email_templates;
CREATE POLICY "Admin full access to email_templates" ON email_templates
  FOR ALL USING (public.is_admin());

-- ============================================================
-- 8. STORAGE BUCKET POLICIES (for campaign-images)
-- ============================================================

-- Allow authenticated users to upload to campaign-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('campaign-images', 'campaign-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'campaign-images'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Anyone can view campaign images" ON storage.objects;
CREATE POLICY "Anyone can view campaign images" ON storage.objects
  FOR SELECT USING (bucket_id = 'campaign-images');

DROP POLICY IF EXISTS "Users can update own uploaded images" ON storage.objects;
CREATE POLICY "Users can update own uploaded images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'campaign-images'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Admin can delete images" ON storage.objects;
CREATE POLICY "Admin can delete images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'campaign-images'
    AND public.is_admin()
  );

-- ============================================================
-- 9. SET ADMIN USER (run after creating your admin account)
-- Replace 'your-admin-email@example.com' with actual admin email
-- ============================================================

-- Example: Make a user admin by email
-- UPDATE user_profiles
-- SET role = 'admin'
-- WHERE email = 'your-admin-email@example.com';

-- ============================================================
-- 10. VERIFICATION: Check all columns exist
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

-- point_transactions check
SELECT 'point_transactions' AS table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'point_transactions'
ORDER BY ordinal_position;

-- email_templates check
SELECT 'email_templates' AS table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'email_templates'
ORDER BY ordinal_position;
