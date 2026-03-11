-- Migration: Add detailed creator profile fields to user_profiles
-- Run on US DB: ybsibqlaipsbvbyqlcny

ALTER TABLE public.user_profiles
  -- Skin/beauty details
  ADD COLUMN IF NOT EXISTS skin_shade text,
  ADD COLUMN IF NOT EXISTS personal_color text,
  ADD COLUMN IF NOT EXISTS hair_type text,
  ADD COLUMN IF NOT EXISTS skin_concerns jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS hair_concerns jsonb DEFAULT '[]'::jsonb,
  -- Content/channel details
  ADD COLUMN IF NOT EXISTS primary_interest text,
  ADD COLUMN IF NOT EXISTS experience_level text,
  ADD COLUMN IF NOT EXISTS follower_range text,
  ADD COLUMN IF NOT EXISTS upload_frequency text,
  ADD COLUMN IF NOT EXISTS video_length_style text,
  ADD COLUMN IF NOT EXISTS shortform_tempo text,
  ADD COLUMN IF NOT EXISTS content_formats jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS video_styles jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS editing_level text,
  ADD COLUMN IF NOT EXISTS shooting_level text,
  ADD COLUMN IF NOT EXISTS collaboration_preferences jsonb DEFAULT '[]'::jsonb,
  -- Job/family
  ADD COLUMN IF NOT EXISTS job text,
  ADD COLUMN IF NOT EXISTS job_visibility text,
  ADD COLUMN IF NOT EXISTS child_appearance text,
  ADD COLUMN IF NOT EXISTS family_appearance text,
  ADD COLUMN IF NOT EXISTS children jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS family_members jsonb DEFAULT '[]'::jsonb,
  -- Language/other
  ADD COLUMN IF NOT EXISTS languages jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS target_gender text,
  ADD COLUMN IF NOT EXISTS target_age_group text,
  ADD COLUMN IF NOT EXISTS ethnicity text,
  ADD COLUMN IF NOT EXISTS diet_concerns jsonb DEFAULT '[]'::jsonb,
  -- Profile completion tracking
  ADD COLUMN IF NOT EXISTS profile_completed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS profile_completion_step integer DEFAULT 0;
