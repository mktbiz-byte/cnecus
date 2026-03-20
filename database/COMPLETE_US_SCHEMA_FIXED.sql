-- ============================================
-- CNEC US Platform - Complete Database Schema (Fixed)
-- Execute this entire script in Supabase SQL Editor
-- This creates ALL tables from scratch
-- ============================================

-- ============================================
-- PART 1: CREATE BASE TABLES FIRST
-- ============================================

-- 1. user_profiles 테이블 생성
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT DEFAULT 'creator' CHECK (role IN ('creator', 'admin', 'manager')),
    gender TEXT,
    age INTEGER,
    region TEXT,
    bio TEXT,
    weight DECIMAL(5,2),
    height DECIMAL(5,2),
    has_children BOOLEAN DEFAULT FALSE,
    is_married BOOLEAN DEFAULT FALSE,
    instagram_followers INTEGER DEFAULT 0,
    tiktok_followers INTEGER DEFAULT 0,
    youtube_subscribers INTEGER DEFAULT 0,
    address TEXT,
    phone_number TEXT,
    phone TEXT,
    country_code VARCHAR(2) DEFAULT 'US' CHECK (country_code IN ('US', 'TW', 'JP', 'KR')),
    platform_region VARCHAR(10) DEFAULT 'us' CHECK (platform_region IN ('us', 'tw', 'jp', 'kr')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. campaigns 테이블 생성
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    brand TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    reward_amount INTEGER NOT NULL,
    max_participants INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed', 'completed')),
    requirements TEXT,
    category TEXT,
    target_country VARCHAR(2) DEFAULT 'US' CHECK (target_country IN ('US', 'TW', 'JP', 'KR')),
    platform_region VARCHAR(10) DEFAULT 'us' CHECK (platform_region IN ('us', 'tw', 'jp', 'kr')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. campaign_applications 테이블 생성
CREATE TABLE IF NOT EXISTS campaign_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    application_data JSONB,
    admin_notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    tracking_number TEXT,
    shipping_status TEXT DEFAULT 'pending' CHECK (shipping_status IN ('pending', 'shipped', 'delivered')),
    applicant_country VARCHAR(2),
    platform_region VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(campaign_id, user_id)
);

-- 4. point_transactions 테이블 생성
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

-- 5. withdrawal_requests 테이블 생성
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

-- ============================================
-- PART 2: CREATOR MATERIALS TABLES
-- ============================================

-- 6. creator_materials 테이블 생성
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

-- 7. creator_material_access_logs 테이블 생성
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

-- 8. email_logs 테이블 생성
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

-- 9. email_schedules 테이블 생성
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

-- 10. email_templates 테이블 생성
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

-- 11. email_subscriptions 테이블 생성
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
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_country_code ON user_profiles(country_code);
CREATE INDEX IF NOT EXISTS idx_user_profiles_platform_region ON user_profiles(platform_region);

-- campaigns indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_start_date ON campaigns(start_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_end_date ON campaigns(end_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_target_country ON campaigns(target_country);
CREATE INDEX IF NOT EXISTS idx_campaigns_platform_region ON campaigns(platform_region);

-- campaign_applications indexes
CREATE INDEX IF NOT EXISTS idx_applications_campaign_id ON campaign_applications(campaign_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON campaign_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON campaign_applications(status);
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

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_material_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;

-- user_profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
CREATE POLICY "Admins can manage all profiles" ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- campaigns policies
DROP POLICY IF EXISTS "Anyone can view active campaigns" ON campaigns;
CREATE POLICY "Anyone can view active campaigns" ON campaigns
    FOR SELECT USING (status = 'active' OR EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    ));

DROP POLICY IF EXISTS "Admins can manage campaigns" ON campaigns;
CREATE POLICY "Admins can manage campaigns" ON campaigns
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- campaign_applications policies
DROP POLICY IF EXISTS "Users can view own applications" ON campaign_applications;
CREATE POLICY "Users can view own applications" ON campaign_applications
    FOR SELECT USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    ));

DROP POLICY IF EXISTS "Users can create own applications" ON campaign_applications;
CREATE POLICY "Users can create own applications" ON campaign_applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all applications" ON campaign_applications;
CREATE POLICY "Admins can manage all applications" ON campaign_applications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

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
            WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
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
            WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- creator_materials policies
DROP POLICY IF EXISTS "Admins can manage all creator materials" ON creator_materials;
CREATE POLICY "Admins can manage all creator materials" ON creator_materials
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() AND user_profiles.role = 'admin'
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
            WHERE user_profiles.user_id = auth.uid() AND user_profiles.role = 'admin'
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

-- Trigger: Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
CREATE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_applications_updated_at ON campaign_applications;
CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON campaign_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

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

CREATE OR REPLACE VIEW us_point_transactions AS
SELECT pt.* 
FROM point_transactions pt
JOIN user_profiles up ON pt.user_id = up.user_id
WHERE up.platform_region = 'us';

CREATE OR REPLACE VIEW us_withdrawal_requests AS
SELECT wr.* 
FROM withdrawal_requests wr
JOIN user_profiles up ON wr.user_id = up.user_id
WHERE up.platform_region = 'us';

-- ============================================
-- PART 8: INSERT DEFAULT EMAIL TEMPLATES
-- ============================================

INSERT INTO email_templates (template_type, subject_template, html_template, variables) VALUES
('SIGNUP_COMPLETE', 'Welcome to CNEC United States!', 
 '<!DOCTYPE html><html><body><h1>Welcome {{name}}!</h1><p>Your registration is complete.</p></body></html>', 
 '{"name": "string", "email": "string"}'),

('APPLICATION_SUBMITTED', 'Campaign Application Received',
 '<!DOCTYPE html><html><body><h1>Application Submitted</h1><p>Thank you for applying to {{campaignTitle}}!</p></body></html>',
 '{"name": "string", "campaignTitle": "string", "brandName": "string", "rewardAmount": "number"}'),

('APPLICATION_APPROVED', 'Congratulations! Your Application is Approved',
 '<!DOCTYPE html><html><body><h1>You are approved for {{campaignTitle}}!</h1></body></html>',
 '{"name": "string", "campaignTitle": "string", "deadline": "string", "rewardAmount": "number"}')
ON CONFLICT (template_type) DO NOTHING;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

SELECT 'CNEC US Platform Database Schema - Setup Complete!' as result;
SELECT 'All tables, indexes, policies, triggers, and views have been created' as status;
SELECT 'Platform region is set to: us' as region;
SELECT 'You can now configure authentication and deploy to Netlify' as next_step;

