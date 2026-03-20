-- ============================================
-- CNEC US Platform - Complete Database Schema
-- Execute this entire script in Supabase SQL Editor
-- ============================================

-- ============================================
-- PART 1: BASE TABLES
-- ============================================

-- 1. withdrawal_requests 테이블
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    paypal_email TEXT NOT NULL,
    paypal_name TEXT NOT NULL,
    reason TEXT DEFAULT 'Point withdrawal request',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    admin_notes TEXT,
    transaction_id TEXT,
    platform_region VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- 2. user_profiles 테이블 확장
DO $$ 
BEGIN
    -- Basic profile fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'age') THEN
        ALTER TABLE user_profiles ADD COLUMN age INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'region') THEN
        ALTER TABLE user_profiles ADD COLUMN region TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'bio') THEN
        ALTER TABLE user_profiles ADD COLUMN bio TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'weight') THEN
        ALTER TABLE user_profiles ADD COLUMN weight DECIMAL(5,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'height') THEN
        ALTER TABLE user_profiles ADD COLUMN height DECIMAL(5,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'has_children') THEN
        ALTER TABLE user_profiles ADD COLUMN has_children BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'is_married') THEN
        ALTER TABLE user_profiles ADD COLUMN is_married BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Social media fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'instagram_followers') THEN
        ALTER TABLE user_profiles ADD COLUMN instagram_followers INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'tiktok_followers') THEN
        ALTER TABLE user_profiles ADD COLUMN tiktok_followers INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'youtube_subscribers') THEN
        ALTER TABLE user_profiles ADD COLUMN youtube_subscribers INTEGER DEFAULT 0;
    END IF;
    
    -- Address fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'address') THEN
        ALTER TABLE user_profiles ADD COLUMN address TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'phone_number') THEN
        ALTER TABLE user_profiles ADD COLUMN phone_number TEXT;
    END IF;
    
    -- Region fields for multi-country support
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'country_code') THEN
        ALTER TABLE user_profiles ADD COLUMN country_code VARCHAR(2) DEFAULT 'US' CHECK (country_code IN ('US', 'TW', 'JP', 'KR'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'platform_region') THEN
        ALTER TABLE user_profiles ADD COLUMN platform_region VARCHAR(10) DEFAULT 'us' CHECK (platform_region IN ('us', 'tw', 'jp', 'kr'));
    END IF;
END $$;

-- 3. point_transactions 테이블
CREATE TABLE IF NOT EXISTS point_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    application_id UUID REFERENCES campaign_applications(id) ON DELETE SET NULL,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    amount INTEGER NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn', 'spend', 'bonus', 'admin_add', 'admin_subtract', 'campaign_reward', 'pending_reward')),
    description TEXT,
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
    platform_region VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. campaigns 테이블에 region 필드 추가
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'target_country') THEN
        ALTER TABLE campaigns ADD COLUMN target_country VARCHAR(2) DEFAULT 'US' CHECK (target_country IN ('US', 'TW', 'JP', 'KR'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'platform_region') THEN
        ALTER TABLE campaigns ADD COLUMN platform_region VARCHAR(10) DEFAULT 'us' CHECK (platform_region IN ('us', 'tw', 'jp', 'kr'));
    END IF;
END $$;

-- 5. campaign_applications 테이블 확장
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaign_applications' AND column_name = 'shipped_at') THEN
        ALTER TABLE campaign_applications ADD COLUMN shipped_at TIMESTAMP WITH TIME ZONE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaign_applications' AND column_name = 'tracking_number') THEN
        ALTER TABLE campaign_applications ADD COLUMN tracking_number TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaign_applications' AND column_name = 'shipping_status') THEN
        ALTER TABLE campaign_applications ADD COLUMN shipping_status TEXT DEFAULT 'pending' CHECK (shipping_status IN ('pending', 'shipped', 'delivered'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaign_applications' AND column_name = 'applicant_country') THEN
        ALTER TABLE campaign_applications ADD COLUMN applicant_country VARCHAR(2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaign_applications' AND column_name = 'platform_region') THEN
        ALTER TABLE campaign_applications ADD COLUMN platform_region VARCHAR(10);
    END IF;
END $$;

-- ============================================
-- PART 2: CREATOR MATERIALS TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS creator_materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES campaign_applications(id) ON DELETE CASCADE,
    google_drive_url TEXT,
    google_slides_url TEXT,
    additional_notes TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'provided', 'accessed')),
    accessed_at TIMESTAMP WITH TIME ZONE,
    platform_region VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(campaign_id, creator_id)
);

CREATE TABLE IF NOT EXISTS creator_material_access_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    material_id UUID NOT NULL REFERENCES creator_materials(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    access_type VARCHAR(20) NOT NULL CHECK (access_type IN ('drive_access', 'slides_access')),
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- ============================================
-- PART 3: EMAIL SYSTEM TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_email VARCHAR(255) NOT NULL,
    template_type VARCHAR(100) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    data JSONB,
    status VARCHAR(50) DEFAULT 'pending',
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    platform_region VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    email_type VARCHAR(100) NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled',
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_type VARCHAR(100) UNIQUE NOT NULL,
    subject_template VARCHAR(500) NOT NULL,
    html_template TEXT NOT NULL,
    variables JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email_type VARCHAR(100) NOT NULL,
    is_subscribed BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, email_type)
);

-- ============================================
-- PART 4: INDEXES
-- ============================================

-- user_profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_country_code ON user_profiles(country_code);
CREATE INDEX IF NOT EXISTS idx_user_profiles_platform_region ON user_profiles(platform_region);

-- campaigns indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_target_country ON campaigns(target_country);
CREATE INDEX IF NOT EXISTS idx_campaigns_platform_region ON campaigns(platform_region);

-- campaign_applications indexes
CREATE INDEX IF NOT EXISTS idx_applications_applicant_country ON campaign_applications(applicant_country);
CREATE INDEX IF NOT EXISTS idx_applications_platform_region ON campaign_applications(platform_region);
CREATE INDEX IF NOT EXISTS idx_applications_shipped_at ON campaign_applications(shipped_at);
CREATE INDEX IF NOT EXISTS idx_applications_tracking_number ON campaign_applications(tracking_number);
CREATE INDEX IF NOT EXISTS idx_applications_shipping_status ON campaign_applications(shipping_status);

-- point_transactions indexes
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_application_id ON point_transactions(application_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_campaign_id ON point_transactions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_type ON point_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_point_transactions_status ON point_transactions(status);
CREATE INDEX IF NOT EXISTS idx_point_transactions_platform_region ON point_transactions(platform_region);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at ON point_transactions(created_at DESC);

-- withdrawal_requests indexes
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_platform_region ON withdrawal_requests(platform_region);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_created_at ON withdrawal_requests(created_at DESC);

-- creator_materials indexes
CREATE INDEX IF NOT EXISTS idx_creator_materials_campaign_id ON creator_materials(campaign_id);
CREATE INDEX IF NOT EXISTS idx_creator_materials_creator_id ON creator_materials(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_materials_application_id ON creator_materials(application_id);
CREATE INDEX IF NOT EXISTS idx_creator_materials_status ON creator_materials(status);
CREATE INDEX IF NOT EXISTS idx_creator_materials_platform_region ON creator_materials(platform_region);

-- creator_material_access_logs indexes
CREATE INDEX IF NOT EXISTS idx_material_access_logs_material_id ON creator_material_access_logs(material_id);
CREATE INDEX IF NOT EXISTS idx_material_access_logs_creator_id ON creator_material_access_logs(creator_id);
CREATE INDEX IF NOT EXISTS idx_material_access_logs_accessed_at ON creator_material_access_logs(accessed_at);

-- email_logs indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_platform_region ON email_logs(platform_region);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at);

-- email_schedules indexes
CREATE INDEX IF NOT EXISTS idx_email_schedules_campaign_id ON email_schedules(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_schedules_scheduled_at ON email_schedules(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_email_schedules_status ON email_schedules(status);

-- email_subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_user_id ON email_subscriptions(user_id);

-- ============================================
-- PART 5: ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_material_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;

-- withdrawal_requests policies
DROP POLICY IF EXISTS "Users can view own withdrawal requests" ON withdrawal_requests;
CREATE POLICY "Users can view own withdrawal requests" ON withdrawal_requests
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own withdrawal requests" ON withdrawal_requests;
CREATE POLICY "Users can create own withdrawal requests" ON withdrawal_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all withdrawal requests" ON withdrawal_requests;
CREATE POLICY "Admins can manage all withdrawal requests" ON withdrawal_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'manager')
        )
    );

-- point_transactions policies
DROP POLICY IF EXISTS "Users can view own point transactions" ON point_transactions;
CREATE POLICY "Users can view own point transactions" ON point_transactions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all point transactions" ON point_transactions;
CREATE POLICY "Admins can manage all point transactions" ON point_transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'manager')
        )
    );

-- creator_materials policies
DROP POLICY IF EXISTS "Admins can manage all creator materials" ON creator_materials;
CREATE POLICY "Admins can manage all creator materials" ON creator_materials
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Creators can view their own materials" ON creator_materials;
CREATE POLICY "Creators can view their own materials" ON creator_materials
    FOR SELECT USING (creator_id = auth.uid() AND status = 'provided');

-- creator_material_access_logs policies
DROP POLICY IF EXISTS "Admins can view all access logs" ON creator_material_access_logs;
CREATE POLICY "Admins can view all access logs" ON creator_material_access_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- email policies
DROP POLICY IF EXISTS "Admin can manage email logs" ON email_logs;
CREATE POLICY "Admin can manage email logs" ON email_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admin can manage email schedules" ON email_schedules;
CREATE POLICY "Admin can manage email schedules" ON email_schedules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admin can manage email templates" ON email_templates;
CREATE POLICY "Admin can manage email templates" ON email_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Users can manage own subscriptions" ON email_subscriptions;
CREATE POLICY "Users can manage own subscriptions" ON email_subscriptions
    FOR ALL USING (user_id = auth.uid());

-- ============================================
-- PART 6: FUNCTIONS AND TRIGGERS
-- ============================================

-- Function: Get user total points
CREATE OR REPLACE FUNCTION get_user_total_points(target_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_points INTEGER := 0;
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO total_points
    FROM point_transactions 
    WHERE user_id = target_user_id 
    AND status = 'completed'
    AND transaction_type IN ('earn', 'bonus', 'admin_add', 'campaign_reward');
    
    SELECT total_points - COALESCE(SUM(amount), 0) INTO total_points
    FROM point_transactions 
    WHERE user_id = target_user_id 
    AND status = 'completed'
    AND transaction_type IN ('spend', 'admin_subtract');
    
    RETURN GREATEST(total_points, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Auto-set region for applications
CREATE OR REPLACE FUNCTION set_application_region()
RETURNS TRIGGER AS $$
BEGIN
    SELECT country_code, platform_region 
    INTO NEW.applicant_country, NEW.platform_region
    FROM user_profiles
    WHERE user_id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_application_region ON campaign_applications;
CREATE TRIGGER trigger_set_application_region
    BEFORE INSERT ON campaign_applications
    FOR EACH ROW
    EXECUTE FUNCTION set_application_region();

-- Trigger: Auto-set region for point transactions
CREATE OR REPLACE FUNCTION set_point_transaction_region()
RETURNS TRIGGER AS $$
BEGIN
    SELECT platform_region 
    INTO NEW.platform_region
    FROM user_profiles
    WHERE user_id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_point_transaction_region ON point_transactions;
CREATE TRIGGER trigger_set_point_transaction_region
    BEFORE INSERT ON point_transactions
    FOR EACH ROW
    EXECUTE FUNCTION set_point_transaction_region();

-- Trigger: Auto-set region for withdrawal requests
CREATE OR REPLACE FUNCTION set_withdrawal_region()
RETURNS TRIGGER AS $$
BEGIN
    SELECT platform_region 
    INTO NEW.platform_region
    FROM user_profiles
    WHERE user_id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_withdrawal_region ON withdrawal_requests;
CREATE TRIGGER trigger_set_withdrawal_region
    BEFORE INSERT ON withdrawal_requests
    FOR EACH ROW
    EXECUTE FUNCTION set_withdrawal_region();

-- Trigger: Update material accessed_at
CREATE OR REPLACE FUNCTION update_material_accessed_at()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE creator_materials 
    SET accessed_at = NOW(), status = 'accessed'
    WHERE id = NEW.material_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_material_accessed_at ON creator_material_access_logs;
CREATE TRIGGER trigger_update_material_accessed_at
    AFTER INSERT ON creator_material_access_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_material_accessed_at();

-- ============================================
-- PART 7: VIEWS FOR US PLATFORM
-- ============================================

CREATE OR REPLACE VIEW us_creators AS
SELECT * FROM user_profiles
WHERE platform_region = 'us' AND role = 'creator';

CREATE OR REPLACE VIEW us_campaigns AS
SELECT * FROM campaigns
WHERE platform_region = 'us';

CREATE OR REPLACE VIEW us_applications AS
SELECT ca.* 
FROM campaign_applications ca
JOIN campaigns c ON ca.campaign_id = c.id
WHERE c.platform_region = 'us';

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

SELECT 'CNEC US Platform Database Schema - Setup Complete!' as result;
SELECT 'All tables, indexes, policies, and triggers have been created' as status;
SELECT 'Platform region is set to: us' as region;

