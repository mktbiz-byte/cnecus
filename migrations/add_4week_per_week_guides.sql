-- ============================================================
-- MIGRATION: Add per-week guide URLs, clean video URLs,
-- and partnership codes for 4-week challenge campaigns
--
-- PROBLEM:
--   기획형(standard) 캠페인은 가이드 1개면 충분하지만,
--   4주 챌린지(4week_challenge)는 각 주마다 별도의 가이드,
--   클린본 영상, 광고코드가 필요함
--
-- SOLUTION:
--   campaign_applications 테이블에 주별 컬럼 추가
--
-- Supabase SQL Editor에서 실행
-- 여러 번 실행해도 안전 (IF NOT EXISTS 사용)
-- ============================================================

-- ============================================================
-- 1. PER-WEEK GUIDE URLs (주별 가이드 문서 링크)
--    관리자가 크리에이터별로 주별 가이드를 전달
-- ============================================================

-- Week 1 guide
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS week1_guide_drive_url TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS week1_guide_slides_url TEXT;

-- Week 2 guide
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS week2_guide_drive_url TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS week2_guide_slides_url TEXT;

-- Week 3 guide
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS week3_guide_drive_url TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS week3_guide_slides_url TEXT;

-- Week 4 guide
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS week4_guide_drive_url TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS week4_guide_slides_url TEXT;

-- ============================================================
-- 2. PER-WEEK CLEAN VIDEO URLs (주별 클린본 영상)
--    4주 챌린지는 매주 클린본을 별도로 제출해야 함
-- ============================================================

ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS week1_clean_video_url TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS week2_clean_video_url TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS week3_clean_video_url TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS week4_clean_video_url TEXT;

-- ============================================================
-- 3. PER-WEEK PARTNERSHIP CODES (주별 광고코드)
--    4주 챌린지는 매주 SNS 게시 시 광고코드가 필요
-- ============================================================

ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS week1_partnership_code TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS week2_partnership_code TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS week3_partnership_code TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS week4_partnership_code TEXT;

-- ============================================================
-- 4. PER-WEEK SUBMISSION TIMESTAMPS (주별 제출 시각)
--    이미 있을 수 있지만 안전하게 추가
-- ============================================================

ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS week1_video_submitted_at TIMESTAMPTZ;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS week2_video_submitted_at TIMESTAMPTZ;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS week3_video_submitted_at TIMESTAMPTZ;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS week4_video_submitted_at TIMESTAMPTZ;

ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS week1_sns_submitted_at TIMESTAMPTZ;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS week2_sns_submitted_at TIMESTAMPTZ;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS week3_sns_submitted_at TIMESTAMPTZ;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS week4_sns_submitted_at TIMESTAMPTZ;

-- ============================================================
-- 5. COMMENTS (컬럼 설명)
-- ============================================================

COMMENT ON COLUMN campaign_applications.week1_guide_drive_url IS 'Week 1 shooting guide PDF (Google Drive URL) - admin provides';
COMMENT ON COLUMN campaign_applications.week1_guide_slides_url IS 'Week 1 AI guide (Google Slides URL) - admin provides';
COMMENT ON COLUMN campaign_applications.week1_clean_video_url IS 'Week 1 clean video without music/subtitles for ad usage';
COMMENT ON COLUMN campaign_applications.week1_partnership_code IS 'Week 1 Meta partnership ad code from Instagram';

COMMENT ON COLUMN campaign_applications.week2_guide_drive_url IS 'Week 2 shooting guide PDF (Google Drive URL) - admin provides';
COMMENT ON COLUMN campaign_applications.week2_guide_slides_url IS 'Week 2 AI guide (Google Slides URL) - admin provides';
COMMENT ON COLUMN campaign_applications.week2_clean_video_url IS 'Week 2 clean video without music/subtitles for ad usage';
COMMENT ON COLUMN campaign_applications.week2_partnership_code IS 'Week 2 Meta partnership ad code from Instagram';

COMMENT ON COLUMN campaign_applications.week3_guide_drive_url IS 'Week 3 shooting guide PDF (Google Drive URL) - admin provides';
COMMENT ON COLUMN campaign_applications.week3_guide_slides_url IS 'Week 3 AI guide (Google Slides URL) - admin provides';
COMMENT ON COLUMN campaign_applications.week3_clean_video_url IS 'Week 3 clean video without music/subtitles for ad usage';
COMMENT ON COLUMN campaign_applications.week3_partnership_code IS 'Week 3 Meta partnership ad code from Instagram';

COMMENT ON COLUMN campaign_applications.week4_guide_drive_url IS 'Week 4 shooting guide PDF (Google Drive URL) - admin provides';
COMMENT ON COLUMN campaign_applications.week4_guide_slides_url IS 'Week 4 AI guide (Google Slides URL) - admin provides';
COMMENT ON COLUMN campaign_applications.week4_clean_video_url IS 'Week 4 clean video without music/subtitles for ad usage';
COMMENT ON COLUMN campaign_applications.week4_partnership_code IS 'Week 4 Meta partnership ad code from Instagram';

-- ============================================================
-- 6. INDEXES (인덱스 - 주별 제출 조회 성능)
--    관리자가 "아직 제출 안 한 주차" 필터링 시 필요
-- ============================================================

-- 주별 영상 제출 타임스탬프 인덱스
CREATE INDEX IF NOT EXISTS idx_ca_week1_video_submitted_at ON campaign_applications(week1_video_submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_ca_week2_video_submitted_at ON campaign_applications(week2_video_submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_ca_week3_video_submitted_at ON campaign_applications(week3_video_submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_ca_week4_video_submitted_at ON campaign_applications(week4_video_submitted_at DESC);

-- 주별 SNS 제출 타임스탬프 인덱스
CREATE INDEX IF NOT EXISTS idx_ca_week1_sns_submitted_at ON campaign_applications(week1_sns_submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_ca_week2_sns_submitted_at ON campaign_applications(week2_sns_submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_ca_week3_sns_submitted_at ON campaign_applications(week3_sns_submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_ca_week4_sns_submitted_at ON campaign_applications(week4_sns_submitted_at DESC);

-- ============================================================
-- 7. STORAGE POLICIES (creator-videos 버킷 보안 정책)
--    영상 업로드/조회 권한 설정
--    ※ 버킷이 Supabase Dashboard에서 생성되어 있어야 함
-- ============================================================

-- 크리에이터: 자기 폴더에만 업로드 가능
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'creators_upload_own_videos'
      AND tablename = 'objects'
      AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "creators_upload_own_videos"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'creator-videos'
    );
  END IF;
END $$;

-- 크리에이터: 자기 영상 조회 가능
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'creators_read_own_videos'
      AND tablename = 'objects'
      AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "creators_read_own_videos"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'creator-videos'
    );
  END IF;
END $$;

-- 관리자: 모든 크리에이터 영상 조회 + 삭제 가능
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'admins_manage_all_videos'
      AND tablename = 'objects'
      AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "admins_manage_all_videos"
    ON storage.objects
    FOR ALL
    TO authenticated
    USING (
      bucket_id = 'creator-videos'
      AND EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    );
  END IF;
END $$;

-- ============================================================
-- 8. VERIFICATION: Check columns were added
-- ============================================================

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'campaign_applications'
  AND column_name LIKE 'week%'
ORDER BY column_name;
