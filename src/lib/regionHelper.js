// Region Helper for CNEC US Platform
// Automatically adds region information to database operations

const PLATFORM_REGION = import.meta.env.VITE_PLATFORM_REGION || 'us'
const PLATFORM_COUNTRY = import.meta.env.VITE_PLATFORM_COUNTRY || 'US'

/**
 * Get current platform region
 * @returns {string} Platform region code (e.g., 'us', 'tw', 'jp')
 */
export const getPlatformRegion = () => {
  return PLATFORM_REGION
}

/**
 * Get current platform country code
 * @returns {string} Country code (e.g., 'US', 'TW', 'JP')
 */
export const getPlatformCountry = () => {
  return PLATFORM_COUNTRY
}

/**
 * Add region data to user profile creation
 * @param {Object} profileData - User profile data
 * @returns {Object} Profile data with region information
 */
export const addRegionToProfile = (profileData) => {
  return {
    ...profileData,
    platform_region: PLATFORM_REGION,
    country_code: PLATFORM_COUNTRY
  }
}

/**
 * Add region data to campaign creation
 * @param {Object} campaignData - Campaign data
 * @returns {Object} Campaign data with region information
 */
export const addRegionToCampaign = (campaignData) => {
  return {
    ...campaignData,
    platform_region: PLATFORM_REGION,
    target_country: PLATFORM_COUNTRY
  }
}

/**
 * Filter query by platform region
 * @param {Object} query - Supabase query object
 * @returns {Object} Query with region filter applied
 */
export const filterByRegion = (query) => {
  return query.eq('platform_region', PLATFORM_REGION)
}

/**
 * Get region-specific configuration
 * @returns {Object} Region configuration
 */
export const getRegionConfig = () => {
  return {
    region: PLATFORM_REGION,
    country: PLATFORM_COUNTRY,
    currency: import.meta.env.VITE_CURRENCY || 'USD',
    locale: import.meta.env.VITE_LOCALE || 'en-US',
    timezone: import.meta.env.VITE_TIMEZONE || 'America/New_York',
    minWithdrawal: parseInt(import.meta.env.VITE_MIN_WITHDRAWAL_AMOUNT || '50'),
    supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || 'support@cnec.us',
    platformName: import.meta.env.VITE_PLATFORM_NAME || 'CNEC United States'
  }
}

/**
 * Format currency based on region
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  const config = getRegionConfig()
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency
  }).format(amount)
}

/**
 * Format date based on region
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  const config = getRegionConfig()
  return new Intl.DateTimeFormat(config.locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date))
}

/**
 * Format datetime based on region
 * @param {Date|string} datetime - Datetime to format
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (datetime) => {
  const config = getRegionConfig()
  return new Intl.DateTimeFormat(config.locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(datetime))
}

/**
 * Get region-specific text translations
 * @param {string} key - Translation key
 * @returns {string} Translated text
 */
export const getRegionText = (key) => {
  const texts = {
    us: {
      platformName: 'CNEC United States',
      welcomeMessage: 'Welcome to CNEC US Campaign Platform',
      signupComplete: 'Registration Complete',
      applicationSubmitted: 'Application Submitted',
      applicationApproved: 'Application Approved',
      pointsEarned: 'Points Earned',
      withdrawalRequested: 'Withdrawal Requested',
      currency: 'USD',
      minWithdrawal: 'Minimum withdrawal amount is $50'
    },
    tw: {
      platformName: 'CNEC Taiwan',
      welcomeMessage: '歡迎來到 CNEC 台灣活動平台',
      signupComplete: '註冊完成',
      applicationSubmitted: '申請已提交',
      applicationApproved: '申請已批准',
      pointsEarned: '獲得積分',
      withdrawalRequested: '提款申請',
      currency: 'TWD',
      minWithdrawal: '最低提款金額為 NT$500'
    },
    jp: {
      platformName: 'CNEC Japan',
      welcomeMessage: 'CNEC Japan キャンペーンプラットフォームへようこそ',
      signupComplete: '会員登録完了',
      applicationSubmitted: 'キャンペーン応募完了',
      applicationApproved: 'キャンペーン参加確定',
      pointsEarned: 'ポイント獲得',
      withdrawalRequested: 'ポイント出金申請',
      currency: 'JPY',
      minWithdrawal: '最低出金額は¥5,000です'
    }
  }

  return texts[PLATFORM_REGION]?.[key] || texts.us[key] || key
}

export default {
  getPlatformRegion,
  getPlatformCountry,
  addRegionToProfile,
  addRegionToCampaign,
  filterByRegion,
  getRegionConfig,
  formatCurrency,
  formatDate,
  formatDateTime,
  getRegionText
}

