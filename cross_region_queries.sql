-- Cross-Region Data Management Queries
-- For centralized management system to pull data from different regions

-- ============================================
-- 1. ALL REGIONS DATA VIEWS
-- ============================================

-- View: All creators across all regions
CREATE OR REPLACE VIEW all_regions_creators AS
SELECT 
    user_id,
    name,
    email,
    platform_region,
    country_code,
    instagram_followers,
    tiktok_followers,
    youtube_subscribers,
    created_at,
    CASE 
        WHEN platform_region = 'us' THEN 'United States'
        WHEN platform_region = 'tw' THEN 'Taiwan'
        WHEN platform_region = 'jp' THEN 'Japan'
        WHEN platform_region = 'kr' THEN 'Korea'
        ELSE 'Unknown'
    END as region_name
FROM user_profiles
WHERE role = 'creator'
ORDER BY platform_region, created_at DESC;

-- View: All campaigns across all regions
CREATE OR REPLACE VIEW all_regions_campaigns AS
SELECT 
    id,
    title,
    brand,
    platform_region,
    target_country,
    status,
    reward_amount,
    max_participants,
    start_date,
    end_date,
    created_at,
    CASE 
        WHEN platform_region = 'us' THEN 'United States'
        WHEN platform_region = 'tw' THEN 'Taiwan'
        WHEN platform_region = 'jp' THEN 'Japan'
        WHEN platform_region = 'kr' THEN 'Korea'
        ELSE 'Unknown'
    END as region_name
FROM campaigns
ORDER BY platform_region, created_at DESC;

-- View: All applications across all regions
CREATE OR REPLACE VIEW all_regions_applications AS
SELECT 
    ca.id,
    ca.campaign_id,
    ca.user_id,
    ca.status,
    ca.platform_region,
    ca.applicant_country,
    ca.created_at,
    c.title as campaign_title,
    c.brand as campaign_brand,
    up.name as creator_name,
    up.email as creator_email,
    CASE 
        WHEN ca.platform_region = 'us' THEN 'United States'
        WHEN ca.platform_region = 'tw' THEN 'Taiwan'
        WHEN ca.platform_region = 'jp' THEN 'Japan'
        WHEN ca.platform_region = 'kr' THEN 'Korea'
        ELSE 'Unknown'
    END as region_name
FROM campaign_applications ca
JOIN campaigns c ON ca.campaign_id = c.id
JOIN user_profiles up ON ca.user_id = up.user_id
ORDER BY ca.platform_region, ca.created_at DESC;

-- ============================================
-- 2. REGION-SPECIFIC STATISTICS
-- ============================================

-- View: Statistics by region
CREATE OR REPLACE VIEW region_statistics AS
SELECT 
    platform_region,
    CASE 
        WHEN platform_region = 'us' THEN 'United States'
        WHEN platform_region = 'tw' THEN 'Taiwan'
        WHEN platform_region = 'jp' THEN 'Japan'
        WHEN platform_region = 'kr' THEN 'Korea'
        ELSE 'Unknown'
    END as region_name,
    (SELECT COUNT(*) FROM user_profiles WHERE role = 'creator' AND user_profiles.platform_region = r.platform_region) as total_creators,
    (SELECT COUNT(*) FROM campaigns WHERE campaigns.platform_region = r.platform_region) as total_campaigns,
    (SELECT COUNT(*) FROM campaigns WHERE campaigns.platform_region = r.platform_region AND status = 'active') as active_campaigns,
    (SELECT COUNT(*) FROM campaign_applications ca JOIN campaigns c ON ca.campaign_id = c.id WHERE c.platform_region = r.platform_region) as total_applications,
    (SELECT COUNT(*) FROM campaign_applications ca JOIN campaigns c ON ca.campaign_id = c.id WHERE c.platform_region = r.platform_region AND ca.status = 'approved') as approved_applications,
    (SELECT COALESCE(SUM(amount), 0) FROM point_transactions WHERE platform_region = r.platform_region AND transaction_type IN ('earn', 'campaign_reward')) as total_points_distributed,
    (SELECT COALESCE(SUM(amount), 0) FROM withdrawal_requests WHERE platform_region = r.platform_region AND status = 'completed') as total_withdrawals
FROM (
    SELECT DISTINCT platform_region 
    FROM user_profiles 
    WHERE platform_region IS NOT NULL
) r
ORDER BY platform_region;

-- ============================================
-- 3. CROSS-REGION QUERIES FOR SPECIFIC DATA
-- ============================================

-- Query: Get all US creators
CREATE OR REPLACE FUNCTION get_creators_by_region(region_code VARCHAR(10))
RETURNS TABLE (
    user_id UUID,
    name TEXT,
    email TEXT,
    instagram_followers INTEGER,
    tiktok_followers INTEGER,
    youtube_subscribers INTEGER,
    total_campaigns_participated BIGINT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.user_id,
        up.name,
        up.email,
        up.instagram_followers,
        up.tiktok_followers,
        up.youtube_subscribers,
        COUNT(DISTINCT ca.campaign_id) as total_campaigns_participated,
        up.created_at
    FROM user_profiles up
    LEFT JOIN campaign_applications ca ON up.user_id = ca.user_id AND ca.status = 'approved'
    WHERE up.platform_region = region_code AND up.role = 'creator'
    GROUP BY up.user_id, up.name, up.email, up.instagram_followers, up.tiktok_followers, up.youtube_subscribers, up.created_at
    ORDER BY up.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Query: Get all campaigns by region
CREATE OR REPLACE FUNCTION get_campaigns_by_region(region_code VARCHAR(10))
RETURNS TABLE (
    campaign_id UUID,
    title TEXT,
    brand TEXT,
    status TEXT,
    reward_amount INTEGER,
    max_participants INTEGER,
    current_participants BIGINT,
    approved_participants BIGINT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as campaign_id,
        c.title,
        c.brand,
        c.status,
        c.reward_amount,
        c.max_participants,
        COUNT(DISTINCT ca.id) as current_participants,
        COUNT(DISTINCT CASE WHEN ca.status = 'approved' THEN ca.id END) as approved_participants,
        c.start_date,
        c.end_date,
        c.created_at
    FROM campaigns c
    LEFT JOIN campaign_applications ca ON c.id = ca.campaign_id
    WHERE c.platform_region = region_code
    GROUP BY c.id, c.title, c.brand, c.status, c.reward_amount, c.max_participants, c.start_date, c.end_date, c.created_at
    ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Query: Get all applications by region with details
CREATE OR REPLACE FUNCTION get_applications_by_region(region_code VARCHAR(10))
RETURNS TABLE (
    application_id UUID,
    campaign_title TEXT,
    campaign_brand TEXT,
    creator_name TEXT,
    creator_email TEXT,
    application_status TEXT,
    reward_amount INTEGER,
    applied_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ca.id as application_id,
        c.title as campaign_title,
        c.brand as campaign_brand,
        up.name as creator_name,
        up.email as creator_email,
        ca.status as application_status,
        c.reward_amount,
        ca.created_at as applied_at,
        ca.approved_at
    FROM campaign_applications ca
    JOIN campaigns c ON ca.campaign_id = c.id
    JOIN user_profiles up ON ca.user_id = up.user_id
    WHERE c.platform_region = region_code
    ORDER BY ca.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. EXPORT QUERIES FOR INTEGRATION
-- ============================================

-- Query: Export US creators for integration (CSV-ready format)
CREATE OR REPLACE VIEW export_us_creators AS
SELECT 
    up.user_id::TEXT as creator_id,
    up.name as creator_name,
    up.email,
    up.phone_number,
    up.country_code,
    up.region,
    up.age,
    up.gender,
    up.instagram_followers,
    up.tiktok_followers,
    up.youtube_subscribers,
    up.bio,
    up.created_at::TEXT as registration_date,
    'US' as platform,
    COUNT(DISTINCT ca.campaign_id) as total_campaigns,
    COALESCE(SUM(CASE WHEN ca.status = 'approved' THEN 1 ELSE 0 END), 0) as approved_campaigns,
    COALESCE(
        (SELECT SUM(amount) FROM point_transactions 
         WHERE user_id = up.user_id 
         AND transaction_type IN ('earn', 'campaign_reward') 
         AND status = 'completed'), 
        0
    ) as total_points_earned
FROM user_profiles up
LEFT JOIN campaign_applications ca ON up.user_id = ca.user_id
WHERE up.platform_region = 'us' AND up.role = 'creator'
GROUP BY up.user_id, up.name, up.email, up.phone_number, up.country_code, up.region, 
         up.age, up.gender, up.instagram_followers, up.tiktok_followers, 
         up.youtube_subscribers, up.bio, up.created_at;

-- Query: Export US campaigns for integration (CSV-ready format)
CREATE OR REPLACE VIEW export_us_campaigns AS
SELECT 
    c.id::TEXT as campaign_id,
    c.title,
    c.brand,
    c.description,
    c.status,
    c.reward_amount,
    c.max_participants,
    c.start_date::TEXT,
    c.end_date::TEXT,
    c.target_country,
    'US' as platform,
    COUNT(DISTINCT ca.id) as total_applications,
    COUNT(DISTINCT CASE WHEN ca.status = 'approved' THEN ca.id END) as approved_applications,
    COUNT(DISTINCT CASE WHEN ca.status = 'completed' THEN ca.id END) as completed_applications,
    c.created_at::TEXT as created_date
FROM campaigns c
LEFT JOIN campaign_applications ca ON c.id = ca.campaign_id
WHERE c.platform_region = 'us'
GROUP BY c.id, c.title, c.brand, c.description, c.status, c.reward_amount, 
         c.max_participants, c.start_date, c.end_date, c.target_country, c.created_at;

-- ============================================
-- 5. API-READY JSON EXPORT FUNCTIONS
-- ============================================

-- Function: Get US data as JSON for API integration
CREATE OR REPLACE FUNCTION get_us_platform_data_json()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'platform', 'US',
        'statistics', (
            SELECT json_build_object(
                'total_creators', (SELECT COUNT(*) FROM user_profiles WHERE platform_region = 'us' AND role = 'creator'),
                'total_campaigns', (SELECT COUNT(*) FROM campaigns WHERE platform_region = 'us'),
                'active_campaigns', (SELECT COUNT(*) FROM campaigns WHERE platform_region = 'us' AND status = 'active'),
                'total_applications', (SELECT COUNT(*) FROM campaign_applications ca JOIN campaigns c ON ca.campaign_id = c.id WHERE c.platform_region = 'us'),
                'approved_applications', (SELECT COUNT(*) FROM campaign_applications ca JOIN campaigns c ON ca.campaign_id = c.id WHERE c.platform_region = 'us' AND ca.status = 'approved')
            )
        ),
        'creators', (
            SELECT json_agg(row_to_json(t))
            FROM (
                SELECT user_id, name, email, instagram_followers, tiktok_followers, youtube_subscribers
                FROM user_profiles
                WHERE platform_region = 'us' AND role = 'creator'
                ORDER BY created_at DESC
                LIMIT 100
            ) t
        ),
        'campaigns', (
            SELECT json_agg(row_to_json(t))
            FROM (
                SELECT id, title, brand, status, reward_amount, start_date, end_date
                FROM campaigns
                WHERE platform_region = 'us'
                ORDER BY created_at DESC
                LIMIT 100
            ) t
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. USAGE EXAMPLES
-- ============================================

-- Example 1: Get all US creators
-- SELECT * FROM get_creators_by_region('us');

-- Example 2: Get all US campaigns
-- SELECT * FROM get_campaigns_by_region('us');

-- Example 3: Get all US applications
-- SELECT * FROM get_applications_by_region('us');

-- Example 4: Export US creators as CSV
-- COPY (SELECT * FROM export_us_creators) TO '/tmp/us_creators.csv' WITH CSV HEADER;

-- Example 5: Get US platform data as JSON for API
-- SELECT get_us_platform_data_json();

-- Example 6: Compare statistics across all regions
-- SELECT * FROM region_statistics;

-- Example 7: Get all creators from all regions
-- SELECT * FROM all_regions_creators WHERE platform_region IN ('us', 'tw', 'jp');

SELECT 'Cross-Region Data Management Queries - Setup Complete' as result;
SELECT 'Use these views and functions to pull region-specific data for centralized management' as info;

