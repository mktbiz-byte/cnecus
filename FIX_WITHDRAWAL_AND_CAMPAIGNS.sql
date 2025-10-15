-- ============================================
-- Fix withdrawal_requests table and add test campaigns
-- ============================================

-- ============================================
-- FIX 1: Remove withdrawal_method column (US uses PayPal only)
-- ============================================

-- Check if column exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'withdrawal_requests' 
        AND column_name = 'withdrawal_method'
    ) THEN
        ALTER TABLE withdrawal_requests DROP COLUMN withdrawal_method;
        RAISE NOTICE 'withdrawal_method column dropped';
    ELSE
        RAISE NOTICE 'withdrawal_method column does not exist';
    END IF;
END $$;

-- Ensure withdrawal_requests has correct structure for US version
ALTER TABLE withdrawal_requests 
DROP COLUMN IF EXISTS bank_name,
DROP COLUMN IF EXISTS bank_account_number,
DROP COLUMN IF EXISTS bank_account_holder;

-- Ensure PayPal columns exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'withdrawal_requests' AND column_name = 'paypal_email'
    ) THEN
        ALTER TABLE withdrawal_requests ADD COLUMN paypal_email TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'withdrawal_requests' AND column_name = 'paypal_name'
    ) THEN
        ALTER TABLE withdrawal_requests ADD COLUMN paypal_name TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'withdrawal_requests' AND column_name = 'transaction_id'
    ) THEN
        ALTER TABLE withdrawal_requests ADD COLUMN transaction_id TEXT;
    END IF;
END $$;

-- ============================================
-- FIX 2: Create test campaigns for US platform
-- ============================================

-- Insert sample campaigns (only if no campaigns exist)
INSERT INTO campaigns (
    title,
    brand,
    description,
    image_url,
    reward_amount,
    max_participants,
    start_date,
    end_date,
    status,
    requirements,
    category,
    target_country,
    platform_region,
    question1,
    question2,
    question3
)
SELECT 
    'Beauty Product Review Campaign',
    'GlowUp Cosmetics',
    'We are looking for beauty influencers to review our new skincare line. Create engaging content showcasing the products and share your honest experience with your followers.',
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800',
    150,
    20,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    'active',
    'Must have at least 1,000 followers on Instagram or TikTok. Must be located in the United States. Must create at least 2 posts (1 Instagram + 1 TikTok or YouTube Short).',
    'Beauty',
    'US',
    'us',
    'What is your favorite skincare routine?',
    'Which social media platform do you primarily use?',
    'Have you reviewed beauty products before?'
WHERE NOT EXISTS (
    SELECT 1 FROM campaigns WHERE platform_region = 'us' LIMIT 1
);

INSERT INTO campaigns (
    title,
    brand,
    description,
    image_url,
    reward_amount,
    max_participants,
    start_date,
    end_date,
    status,
    requirements,
    category,
    target_country,
    platform_region,
    question1,
    question2
)
SELECT 
    'Fitness Gear Promotion',
    'ActiveLife Sports',
    'Promote our new line of workout equipment and activewear. Show your followers how you incorporate our products into your fitness routine.',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
    200,
    15,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '45 days',
    'active',
    'Must have at least 2,000 followers on Instagram, TikTok, or YouTube. Must be a fitness enthusiast or trainer. Must create workout content featuring our products.',
    'Fitness',
    'US',
    'us',
    'What type of fitness content do you create?',
    'How often do you post workout videos?'
WHERE NOT EXISTS (
    SELECT 1 FROM campaigns WHERE platform_region = 'us' AND brand = 'ActiveLife Sports'
);

INSERT INTO campaigns (
    title,
    brand,
    description,
    image_url,
    reward_amount,
    max_participants,
    start_date,
    end_date,
    status,
    requirements,
    category,
    target_country,
    platform_region,
    question1,
    question2,
    question3
)
SELECT 
    'Food & Lifestyle Campaign',
    'TastyBites Kitchen',
    'Share your culinary creations using our premium kitchen products. Create mouth-watering content that inspires your audience to cook.',
    'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800',
    175,
    25,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '60 days',
    'active',
    'Must have at least 1,500 followers. Must create food-related content. Must be comfortable showing your face in videos.',
    'Food & Lifestyle',
    'US',
    'us',
    'What type of cuisine do you specialize in?',
    'Do you have experience with product photography?',
    'What is your average video engagement rate?'
WHERE NOT EXISTS (
    SELECT 1 FROM campaigns WHERE platform_region = 'us' AND brand = 'TastyBites Kitchen'
);

-- ============================================
-- FIX 3: Verify campaign structure
-- ============================================

-- Ensure all required columns exist
DO $$
BEGIN
    -- Add question columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'question1') THEN
        ALTER TABLE campaigns ADD COLUMN question1 TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'question2') THEN
        ALTER TABLE campaigns ADD COLUMN question2 TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'question3') THEN
        ALTER TABLE campaigns ADD COLUMN question3 TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'question4') THEN
        ALTER TABLE campaigns ADD COLUMN question4 TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'question5') THEN
        ALTER TABLE campaigns ADD COLUMN question5 TEXT;
    END IF;
END $$;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

SELECT 'Fixes applied successfully!' as result;
SELECT 'withdrawal_method column removed' as fix_1;
SELECT 'Test campaigns created' as fix_2;
SELECT 'Campaign structure verified' as fix_3;

-- Show created campaigns
SELECT 
    id,
    title,
    brand,
    status,
    platform_region,
    reward_amount,
    max_participants,
    start_date,
    end_date
FROM campaigns 
WHERE platform_region = 'us'
ORDER BY created_at DESC;

