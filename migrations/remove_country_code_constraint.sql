-- Migration: Remove country_code CHECK constraint for worldwide creator support
-- Run on US DB: ybsibqlaipsbvbyqlcny

-- Drop the view that depends on country_code
DROP VIEW IF EXISTS us_creators;

-- Remove CHECK constraint and change type to text
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_country_code_check;
ALTER TABLE public.user_profiles ALTER COLUMN country_code TYPE text USING country_code::text;
ALTER TABLE public.user_profiles ALTER COLUMN country_code SET DEFAULT 'US';

-- Recreate the view
CREATE OR REPLACE VIEW us_creators AS
SELECT id, user_id, name, email, role, gender, age, region, bio, weight, height,
       has_children, is_married, instagram_followers, tiktok_followers, youtube_subscribers,
       address, phone_number, phone, country_code, platform_region, created_at, updated_at
FROM user_profiles
WHERE platform_region = 'us' AND role = 'creator';
