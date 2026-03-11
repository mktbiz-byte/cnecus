-- Migration: Add structured shipping address fields to user_profiles
-- Run on US DB: ybsibqlaipsbvbyqlcny

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS shipping_country text DEFAULT 'US',
  ADD COLUMN IF NOT EXISTS shipping_state text,
  ADD COLUMN IF NOT EXISTS shipping_city text,
  ADD COLUMN IF NOT EXISTS shipping_zip text,
  ADD COLUMN IF NOT EXISTS shipping_phone text,
  ADD COLUMN IF NOT EXISTS shipping_recipient_name text,
  ADD COLUMN IF NOT EXISTS shipping_address_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS shipping_address_verified_at timestamptz;

-- Note: Existing shipping_address, postal_code, detail_address columns are preserved for backward compatibility.
