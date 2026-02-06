-- Migration: Add missing columns to user_profiles table
-- These columns are referenced in MyPage profile editing but don't exist in the schema
-- Run this in Supabase SQL Editor

-- 1. skin_type - User's skin type (for beauty campaigns)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS skin_type TEXT;

-- 2. profile_image_url - Profile picture URL
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- 3. instagram_url - Instagram profile URL
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS instagram_url TEXT;

-- 4. tiktok_url - TikTok profile URL
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS tiktok_url TEXT;

-- 5. youtube_url - YouTube channel URL
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS youtube_url TEXT;

-- 6. other_sns_url - Other social media URL
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS other_sns_url TEXT;

-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
  AND column_name IN ('skin_type', 'profile_image_url', 'instagram_url', 'tiktok_url', 'youtube_url', 'other_sns_url')
ORDER BY column_name;
