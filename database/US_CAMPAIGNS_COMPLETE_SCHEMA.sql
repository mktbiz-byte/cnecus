-- ============================================
-- US campaigns 테이블 - JP 버전과 완전히 동일한 구조
-- ============================================

-- 기본 컬럼
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid() PRIMARY KEY;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS title VARCHAR(255) NOT NULL;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS brand VARCHAR(255) NOT NULL;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS description TEXT NOT NULL;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS requirements TEXT NOT NULL;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS reward_amount INTEGER NOT NULL;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS max_participants INTEGER NOT NULL;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS application_deadline DATE;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS category VARCHAR(255) NOT NULL;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Google Drive/Slides
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS google_drive_url TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS google_slides_url TEXT;

-- 타겟 플랫폼 (JSONB)
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS target_platforms JSONB DEFAULT '{"tiktok": false, "youtube": false, "instagram": true}'::jsonb;

-- 요구사항
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS age_requirement TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS skin_type_requirement TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS offline_visit_requirement TEXT;

-- 질문 1
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS question1 TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS question1_type TEXT DEFAULT 'short';
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS question1_options TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS question_1_required BOOLEAN DEFAULT false;

-- 질문 2
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS question2 TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS question2_type TEXT DEFAULT 'short';
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS question2_options TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS question_2_required BOOLEAN DEFAULT false;

-- 질문 3
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS question3 TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS question3_type TEXT DEFAULT 'short';
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS question3_options TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS question_3_required BOOLEAN DEFAULT false;

-- 질문 4
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS question4 TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS question4_type TEXT DEFAULT 'short';
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS question4_options TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS question_4_required BOOLEAN DEFAULT false;

-- 지역
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS region VARCHAR(255);

-- US 전용 추가 컬럼 (JP에는 없지만 필요한 것들)
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS platform_region VARCHAR(10) DEFAULT 'us';
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS country_code VARCHAR(10) DEFAULT 'US';

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_category ON campaigns(category);
CREATE INDEX IF NOT EXISTS idx_campaigns_start_date ON campaigns(start_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_end_date ON campaigns(end_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_platform_region ON campaigns(platform_region);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);

-- 완료 메시지
SELECT 'US campaigns table structure matches JP version!' AS status;

