-- CNEC US Campaign Platform Database Schema
-- Region-based data separation for multi-country management
-- This schema allows centralized management while keeping data separated by region

-- ============================================
-- 1. USER PROFILES - Add region/country field
-- ============================================

-- Add region column to user_profiles if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'country_code'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN country_code VARCHAR(2) DEFAULT 'US' CHECK (country_code IN ('US', 'TW', 'JP', 'KR'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'platform_region'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN platform_region VARCHAR(10) DEFAULT 'us' CHECK (platform_region IN ('us', 'tw', 'jp', 'kr'));
    END IF;
END $$;

-- Create index for region-based queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_country_code ON user_profiles(country_code);
CREATE INDEX IF NOT EXISTS idx_user_profiles_platform_region ON user_profiles(platform_region);

-- ============================================
-- 2. CAMPAIGNS - Add region/country field
-- ============================================

-- Add region column to campaigns if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' 
        AND column_name = 'target_country'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN target_country VARCHAR(2) DEFAULT 'US' CHECK (target_country IN ('US', 'TW', 'JP', 'KR'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' 
        AND column_name = 'platform_region'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN platform_region VARCHAR(10) DEFAULT 'us' CHECK (platform_region IN ('us', 'tw', 'jp', 'kr'));
    END IF;
END $$;

-- Create index for region-based queries
CREATE INDEX IF NOT EXISTS idx_campaigns_target_country ON campaigns(target_country);
CREATE INDEX IF NOT EXISTS idx_campaigns_platform_region ON campaigns(platform_region);

-- ============================================
-- 3. APPLICATIONS - Add region tracking
-- ============================================

-- Add region column to campaign_applications if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaign_applications' 
        AND column_name = 'applicant_country'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaign_applications ADD COLUMN applicant_country VARCHAR(2);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaign_applications' 
        AND column_name = 'platform_region'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaign_applications ADD COLUMN platform_region VARCHAR(10);
    END IF;
END $$;

-- Create index for region-based queries
CREATE INDEX IF NOT EXISTS idx_applications_applicant_country ON campaign_applications(applicant_country);
CREATE INDEX IF NOT EXISTS idx_applications_platform_region ON campaign_applications(platform_region);

-- ============================================
-- 4. POINT TRANSACTIONS - Add region tracking
-- ============================================

-- Add region column to point_transactions if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'point_transactions' 
        AND column_name = 'platform_region'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE point_transactions ADD COLUMN platform_region VARCHAR(10);
    END IF;
END $$;

-- Create index for region-based queries
CREATE INDEX IF NOT EXISTS idx_point_transactions_platform_region ON point_transactions(platform_region);

-- ============================================
-- 5. WITHDRAWAL REQUESTS - Add region tracking
-- ============================================

-- Add region column to withdrawal_requests if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'withdrawal_requests' 
        AND column_name = 'platform_region'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE withdrawal_requests ADD COLUMN platform_region VARCHAR(10);
    END IF;
END $$;

-- Create index for region-based queries
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_platform_region ON withdrawal_requests(platform_region);

-- ============================================
-- 6. CREATOR MATERIALS - Add region tracking
-- ============================================

-- Add region column to creator_materials if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'creator_materials' 
        AND column_name = 'platform_region'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE creator_materials ADD COLUMN platform_region VARCHAR(10);
    END IF;
END $$;

-- Create index for region-based queries
CREATE INDEX IF NOT EXISTS idx_creator_materials_platform_region ON creator_materials(platform_region);

-- ============================================
-- 7. EMAIL LOGS - Add region tracking
-- ============================================

-- Add region column to email_logs if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'email_logs' 
        AND column_name = 'platform_region'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE email_logs ADD COLUMN platform_region VARCHAR(10);
    END IF;
END $$;

-- Create index for region-based queries
CREATE INDEX IF NOT EXISTS idx_email_logs_platform_region ON email_logs(platform_region);

-- ============================================
-- 8. VIEWS FOR REGION-BASED DATA RETRIEVAL
-- ============================================

-- View: US creators only
CREATE OR REPLACE VIEW us_creators AS
SELECT * FROM user_profiles
WHERE platform_region = 'us' AND role = 'creator';

-- View: US campaigns only
CREATE OR REPLACE VIEW us_campaigns AS
SELECT * FROM campaigns
WHERE platform_region = 'us';

-- View: US applications only
CREATE OR REPLACE VIEW us_applications AS
SELECT ca.* 
FROM campaign_applications ca
JOIN campaigns c ON ca.campaign_id = c.id
WHERE c.platform_region = 'us';

-- View: US point transactions only
CREATE OR REPLACE VIEW us_point_transactions AS
SELECT pt.* 
FROM point_transactions pt
JOIN user_profiles up ON pt.user_id = up.user_id
WHERE up.platform_region = 'us';

-- View: US withdrawal requests only
CREATE OR REPLACE VIEW us_withdrawal_requests AS
SELECT wr.* 
FROM withdrawal_requests wr
JOIN user_profiles up ON wr.user_id = up.user_id
WHERE up.platform_region = 'us';

-- ============================================
-- 9. FUNCTIONS FOR REGION-BASED OPERATIONS
-- ============================================

-- Function: Get total points for US users
CREATE OR REPLACE FUNCTION get_us_user_total_points(target_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_points INTEGER := 0;
    user_region VARCHAR(10);
BEGIN
    -- Check if user is from US platform
    SELECT platform_region INTO user_region
    FROM user_profiles
    WHERE user_id = target_user_id;
    
    IF user_region != 'us' THEN
        RETURN 0;
    END IF;
    
    SELECT COALESCE(SUM(amount), 0) INTO total_points
    FROM point_transactions 
    WHERE user_id = target_user_id 
    AND status = 'completed'
    AND transaction_type IN ('earn', 'bonus', 'admin_add', 'campaign_reward');
    
    -- Subtract withdrawn points
    SELECT total_points - COALESCE(SUM(amount), 0) INTO total_points
    FROM point_transactions 
    WHERE user_id = target_user_id 
    AND status = 'completed'
    AND transaction_type IN ('spend', 'admin_subtract');
    
    RETURN GREATEST(total_points, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get campaign statistics by region
CREATE OR REPLACE FUNCTION get_campaign_stats_by_region(region_code VARCHAR(10))
RETURNS TABLE (
    total_campaigns BIGINT,
    active_campaigns BIGINT,
    total_applications BIGINT,
    approved_applications BIGINT,
    total_creators BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT c.id) as total_campaigns,
        COUNT(DISTINCT CASE WHEN c.status = 'active' THEN c.id END) as active_campaigns,
        COUNT(DISTINCT ca.id) as total_applications,
        COUNT(DISTINCT CASE WHEN ca.status = 'approved' THEN ca.id END) as approved_applications,
        COUNT(DISTINCT up.user_id) as total_creators
    FROM campaigns c
    LEFT JOIN campaign_applications ca ON c.id = ca.campaign_id
    LEFT JOIN user_profiles up ON ca.user_id = up.user_id AND up.role = 'creator'
    WHERE c.platform_region = region_code;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10. TRIGGERS FOR AUTO-SETTING REGION
-- ============================================

-- Trigger function: Auto-set region for new applications
CREATE OR REPLACE FUNCTION set_application_region()
RETURNS TRIGGER AS $$
BEGIN
    -- Set applicant_country and platform_region from user profile
    SELECT country_code, platform_region 
    INTO NEW.applicant_country, NEW.platform_region
    FROM user_profiles
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for campaign_applications
DROP TRIGGER IF EXISTS trigger_set_application_region ON campaign_applications;
CREATE TRIGGER trigger_set_application_region
    BEFORE INSERT ON campaign_applications
    FOR EACH ROW
    EXECUTE FUNCTION set_application_region();

-- Trigger function: Auto-set region for point transactions
CREATE OR REPLACE FUNCTION set_point_transaction_region()
RETURNS TRIGGER AS $$
BEGIN
    -- Set platform_region from user profile
    SELECT platform_region 
    INTO NEW.platform_region
    FROM user_profiles
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for point_transactions
DROP TRIGGER IF EXISTS trigger_set_point_transaction_region ON point_transactions;
CREATE TRIGGER trigger_set_point_transaction_region
    BEFORE INSERT ON point_transactions
    FOR EACH ROW
    EXECUTE FUNCTION set_point_transaction_region();

-- Trigger function: Auto-set region for withdrawal requests
CREATE OR REPLACE FUNCTION set_withdrawal_region()
RETURNS TRIGGER AS $$
BEGIN
    -- Set platform_region from user profile
    SELECT platform_region 
    INTO NEW.platform_region
    FROM user_profiles
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for withdrawal_requests
DROP TRIGGER IF EXISTS trigger_set_withdrawal_region ON withdrawal_requests;
CREATE TRIGGER trigger_set_withdrawal_region
    BEFORE INSERT ON withdrawal_requests
    FOR EACH ROW
    EXECUTE FUNCTION set_withdrawal_region();

-- ============================================
-- 11. RLS POLICIES UPDATE (Region-based)
-- ============================================

-- Update RLS policies to include region filtering
-- Note: These are examples, adjust based on your existing policies

-- Example: Users can only see campaigns from their region
DROP POLICY IF EXISTS "Users can view campaigns from their region" ON campaigns;
CREATE POLICY "Users can view campaigns from their region" ON campaigns
    FOR SELECT USING (
        platform_region = (
            SELECT platform_region FROM user_profiles WHERE user_id = auth.uid()
        )
    );

-- Example: Users can only see applications from their region
DROP POLICY IF EXISTS "Users can view applications from their region" ON campaign_applications;
CREATE POLICY "Users can view applications from their region" ON campaign_applications
    FOR SELECT USING (
        platform_region = (
            SELECT platform_region FROM user_profiles WHERE user_id = auth.uid()
        )
        OR user_id = auth.uid()
    );

-- ============================================
-- 12. UTILITY QUERIES FOR REGION MANAGEMENT
-- ============================================

-- Query to check region distribution
COMMENT ON VIEW us_creators IS 'View of all creators registered on US platform';
COMMENT ON VIEW us_campaigns IS 'View of all campaigns targeting US market';
COMMENT ON VIEW us_applications IS 'View of all applications for US campaigns';

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

SELECT 'US Platform Database Schema with Region Separation - Setup Complete' as result;
SELECT 'All tables now support multi-region data management' as info;
SELECT 'Use platform_region = ''us'' to filter US-specific data' as usage_note;

