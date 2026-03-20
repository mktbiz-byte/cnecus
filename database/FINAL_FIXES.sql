-- ============================================
-- CNEC US Platform - Final Fixes
-- Execute this script to resolve remaining issues
-- ============================================

-- ============================================
-- FIX 1: Remove campaign status constraints that prevent status changes
-- ============================================

-- Drop the existing constraint if it exists
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;

-- Add a more flexible status constraint
ALTER TABLE campaigns 
ADD CONSTRAINT campaigns_status_check 
CHECK (status IN ('draft', 'active', 'closed', 'completed'));

-- ============================================
-- FIX 2: Create applications view for admin panel
-- ============================================

-- Create a comprehensive view for applications with user and campaign details
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
    -- Campaign details
    c.title as campaign_title,
    c.brand as campaign_brand,
    c.reward_amount,
    c.status as campaign_status,
    -- User details
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

-- Grant access to authenticated users
GRANT SELECT ON admin_applications_view TO authenticated;

-- ============================================
-- FIX 3: Ensure admin role is properly set
-- ============================================

-- Function to check and update admin role
CREATE OR REPLACE FUNCTION ensure_admin_role(user_email TEXT)
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    role TEXT,
    updated BOOLEAN
) AS $$
DECLARE
    v_user_id UUID;
    v_current_role TEXT;
    v_updated BOOLEAN := FALSE;
BEGIN
    -- Find user by email
    SELECT up.user_id, up.role INTO v_user_id, v_current_role
    FROM user_profiles up
    WHERE up.email = user_email;
    
    -- If user exists and is not admin, update to admin
    IF v_user_id IS NOT NULL AND v_current_role != 'admin' THEN
        UPDATE user_profiles 
        SET role = 'admin', updated_at = NOW()
        WHERE user_profiles.user_id = v_user_id;
        v_updated := TRUE;
    END IF;
    
    -- Return result
    RETURN QUERY
    SELECT v_user_id, user_email, 'admin'::TEXT, v_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FIX 4: Add function to manage user points
-- ============================================

-- Function to add/subtract points for users
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
    -- Get user's platform region
    SELECT platform_region INTO v_platform_region
    FROM user_profiles
    WHERE user_id = p_user_id;
    
    -- Insert transaction
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

-- ============================================
-- FIX 5: Add function to change campaign status
-- ============================================

-- Function to change campaign status with validation
CREATE OR REPLACE FUNCTION admin_change_campaign_status(
    p_campaign_id UUID,
    p_new_status TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_status TEXT;
BEGIN
    -- Get current status
    SELECT status INTO v_current_status
    FROM campaigns
    WHERE id = p_campaign_id;
    
    -- Validate status transition
    IF v_current_status IS NULL THEN
        RAISE EXCEPTION 'Campaign not found';
    END IF;
    
    -- Update status
    UPDATE campaigns
    SET status = p_new_status, updated_at = NOW()
    WHERE id = p_campaign_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FIX 6: Create view for user points balance
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

-- Grant access to authenticated users
GRANT SELECT ON user_points_balance TO authenticated;

-- ============================================
-- FIX 7: Update RLS policies for admin access
-- ============================================

-- Drop existing policies if they exist
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
-- FIX 8: Add helper function to get user role
-- ============================================

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
-- COMPLETION MESSAGE
-- ============================================

SELECT 'Final fixes applied successfully!' as result;
SELECT 'Campaign status constraints removed' as fix_1;
SELECT 'Applications view created' as fix_2;
SELECT 'Admin role management function added' as fix_3;
SELECT 'Point management function added' as fix_4;
SELECT 'Campaign status change function added' as fix_5;
SELECT 'User points balance view created' as fix_6;
SELECT 'Admin RLS policies updated' as fix_7;
SELECT 'User role helper function added' as fix_8;

