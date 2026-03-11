-- Migration: Add worldwide shipping fields to campaign_applications
-- Run on US DB: ybsibqlaipsbvbyqlcny

ALTER TABLE public.campaign_applications
  ADD COLUMN IF NOT EXISTS shipping_country text,
  ADD COLUMN IF NOT EXISTS shipping_state text,
  ADD COLUMN IF NOT EXISTS shipping_city text,
  ADD COLUMN IF NOT EXISTS shipping_zip text,
  ADD COLUMN IF NOT EXISTS shipping_phone text,
  ADD COLUMN IF NOT EXISTS shipping_recipient_name text,
  ADD COLUMN IF NOT EXISTS shipping_address_line1 text,
  ADD COLUMN IF NOT EXISTS shipping_address_line2 text,
  ADD COLUMN IF NOT EXISTS shipping_address_confirmed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS shipping_address_confirmed_at timestamptz;

-- Note: Existing address, address_detail, postal_code, applicant_country, phone_number columns are preserved.
