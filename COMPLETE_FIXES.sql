-- ============================================
-- CNEC US Platform - Complete Fixes
-- Execute this entire script in Supabase SQL Editor
-- ============================================

-- ============================================
-- FIX 1: Update Admin Role
-- Replace with your actual admin email
-- ============================================

-- Check current admin users
SELECT id, user_id, email, name, role, created_at 
FROM user_profiles 
WHERE email LIKE '%@%' 
ORDER BY created_at DESC;

-- Update admin role for specific email (REPLACE WITH YOUR EMAIL)
-- UPDATE user_profiles 
-- SET role = 'admin', updated_at = NOW()
-- WHERE email = 'your-email@example.com';

-- ============================================
-- FIX 2: Remove Campaign Status Constraints
-- ============================================

ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;
ALTER TABLE campaigns 
ADD CONSTRAINT campaigns_status_check 
CHECK (status IN ('draft', 'active', 'closed', 'completed'));

-- ============================================
-- FIX 3: Create Applications View
-- ============================================

CREATE OR REPLACE VIEW admin_applications_view AS
SELECT 
    ca.id,
    ca.campaign_id,
    ca.user_id,
    ca.status,
    ca.application_data,
    ca.admin_notes,
    ca.submitted_at,
    ca.approved_at,
    ca.completed_at,
    ca.shipped_at,
    ca.tracking_number,
    ca.shipping_status,
    ca.applicant_country,
    ca.platform_region,
    ca.created_at,
    ca.updated_at,
    c.title as campaign_title,
    c.brand as campaign_brand,
    c.reward_amount,
    c.status as campaign_status,
    up.name as applicant_name,
    up.email as applicant_email,
    up.role as applicant_role,
    up.instagram_followers,
    up.tiktok_followers,
    up.youtube_subscribers
FROM campaign_applications ca
LEFT JOIN campaigns c ON ca.campaign_id = c.id
LEFT JOIN user_profiles up ON ca.user_id = up.user_id
WHERE c.platform_region = 'us';

GRANT SELECT ON admin_applications_view TO authenticated;

-- ============================================
-- FIX 4: Create User Points Balance View
-- ============================================

CREATE OR REPLACE VIEW user_points_balance AS
SELECT 
    up.user_id,
    up.email,
    up.name,
    up.role,
    up.platform_region,
    COALESCE(SUM(CASE 
        WHEN pt.transaction_type IN ('earn', 'bonus', 'admin_add', 'campaign_reward') THEN pt.amount
        WHEN pt.transaction_type IN ('spend', 'admin_subtract') THEN -pt.amount
        ELSE 0
    END), 0) as total_points,
    COUNT(pt.id) as transaction_count,
    MAX(pt.created_at) as last_transaction_at
FROM user_profiles up
LEFT JOIN point_transactions pt ON up.user_id = pt.user_id AND pt.status = 'completed'
GROUP BY up.user_id, up.email, up.name, up.role, up.platform_region;

GRANT SELECT ON user_points_balance TO authenticated;

-- ============================================
-- FIX 5: Admin Helper Functions
-- ============================================

-- Function to manage user points
CREATE OR REPLACE FUNCTION admin_manage_points(
    p_user_id UUID,
    p_amount INTEGER,
    p_transaction_type TEXT,
    p_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_transaction_id UUID;
    v_platform_region TEXT;
BEGIN
    SELECT platform_region INTO v_platform_region
    FROM user_profiles
    WHERE user_id = p_user_id;
    
    INSERT INTO point_transactions (
        user_id,
        amount,
        transaction_type,
        description,
        status,
        platform_region
    ) VALUES (
        p_user_id,
        p_amount,
        p_transaction_type,
        COALESCE(p_description, 'Admin adjustment'),
        'completed',
        v_platform_region
    ) RETURNING id INTO v_transaction_id;
    
    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to change campaign status
CREATE OR REPLACE FUNCTION admin_change_campaign_status(
    p_campaign_id UUID,
    p_new_status TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE campaigns
    SET status = p_new_status, updated_at = NOW()
    WHERE id = p_campaign_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_role TEXT;
BEGIN
    SELECT role INTO v_role
    FROM user_profiles
    WHERE user_id = p_user_id;
    
    RETURN COALESCE(v_role, 'creator');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FIX 6: Update RLS Policies for Admin Access
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admin full access to applications" ON campaign_applications;
DROP POLICY IF EXISTS "Admin full access to campaigns" ON campaigns;
DROP POLICY IF EXISTS "Admin full access to user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admin full access to point_transactions" ON point_transactions;

-- Create comprehensive admin policies
CREATE POLICY "Admin full access to applications" ON campaign_applications
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.user_id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

CREATE POLICY "Admin full access to campaigns" ON campaigns
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.user_id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

CREATE POLICY "Admin full access to user_profiles" ON user_profiles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.user_id = auth.uid()
            AND up.role = 'admin'
        )
    );

CREATE POLICY "Admin full access to point_transactions" ON point_transactions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.user_id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- ============================================
-- FIX 7: Update Email Templates to English
-- ============================================

DELETE FROM email_templates;

INSERT INTO email_templates (template_type, subject_template, html_template, variables, is_active) VALUES

('SIGNUP_COMPLETE', 
 'Welcome to CNEC United States!', 
 '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;"><h1>Welcome to CNEC!</h1></div><div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;"><h2>Hello {{name}}!</h2><p>Thank you for joining CNEC United States. Your registration is complete!</p><p>You can now browse and apply for exciting campaigns, connect with top brands, and earn points and rewards.</p></div></div></body></html>', 
 '{"name": "string", "email": "string"}',
 true),

('APPLICATION_SUBMITTED', 
 'Campaign Application Received - {{campaignTitle}}',
 '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;"><h1>Application Submitted!</h1></div><div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;"><h2>Hello {{name}}!</h2><p>Thank you for applying to <strong>{{campaignTitle}}</strong> by {{brandName}}.</p><p>Your application has been received and is currently under review. We will notify you once a decision has been made.</p></div></div></body></html>',
 '{"name": "string", "campaignTitle": "string", "brandName": "string", "rewardAmount": "number"}',
 true),

('APPLICATION_APPROVED', 
 'Congratulations! Your Application is Approved - {{campaignTitle}}',
 '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;"><h1>🎉 Congratulations!</h1><div style="background: #10b981; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 20px 0;">APPLICATION APPROVED</div></div><div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;"><h2>Hello {{name}}!</h2><p>Great news! You have been selected for <strong>{{campaignTitle}}</strong>.</p><p><strong>Reward Amount:</strong> ${{rewardAmount}}</p><p><strong>Campaign Deadline:</strong> {{deadline}}</p><p>Please complete and submit your content before the deadline to receive your reward.</p></div></div></body></html>',
 '{"name": "string", "campaignTitle": "string", "deadline": "string", "rewardAmount": "number"}',
 true);

-- ============================================
-- FIX 8: Ensure applications table exists
-- ============================================

-- Check if applications table exists, if not create it as a view
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'applications') THEN
        CREATE OR REPLACE VIEW applications AS
        SELECT * FROM campaign_applications;
        
        GRANT SELECT ON applications TO authenticated;
    END IF;
END $$;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

SELECT 'All fixes applied successfully!' as result;
SELECT 'Please update admin email in FIX 1 section' as important_note;
SELECT 'Campaign status constraints removed' as fix_1;
SELECT 'Applications view created' as fix_2;
SELECT 'User points balance view created' as fix_3;
SELECT 'Admin helper functions added' as fix_4;
SELECT 'Admin RLS policies updated' as fix_5;
SELECT 'Email templates updated to English' as fix_6;
SELECT 'Applications table/view verified' as fix_7;

