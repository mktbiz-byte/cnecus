import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { database } from '../lib/supabase'


const CampaignApplicationUpdated = () => {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { language } = useLanguage()

  // URL에서 campaign_id 파라미터 가져오기 (두 가지 방법 모두 지원)
  const campaignId = id || searchParams.get('campaign_id')

  const [campaign, setCampaign] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [existingApplication, setExistingApplication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // 신청서 폼 데이터 (기존 질문 + 새로운 필수 정보)
  const [applicationData, setApplicationData] = useState({
    // 기존 질문 답변
    answer_1: '',
    answer_2: '',
    answer_3: '',
    answer_4: '',
    additional_info: '',
    
    // 개인정보 (수정 가능)
    applicant_name: '',
    age: '',
    skin_type: '',
    
    // 새로운 필수 정보
    postal_code: '',
    address: '',
    phone_number: '',
    instagram_url: '',
    youtube_url: '',
    tiktok_url: '',
    
    // 오프라인 방문 관련
    offline_visit_available: false,
    offline_visit_notes: ''
  })

  // 다국어 텍스트
  const texts = {
    ko: {
      title: '캠페인 신청',
      backToCampaigns: '캠페인 목록으로',
      campaignInfo: '캠페인 정보',
      applicationForm: '신청서 작성',
      personalInfo: '개인정보',
      contactInfo: '연락처 및 배송 정보',
      snsInfo: 'SNS 정보',
      questions: '질문 답변',
      additionalInfo: '추가 정보',
      submit: '신청하기',
      submitting: '신청 중...',
      alreadyApplied: '이미 신청한 캠페인입니다',
      applicationSuccess: '캠페인 신청이 완료되었습니다!',
      requiredField: '필수 항목',
      optionalField: '선택 항목',
      reward: '보상금',
      participants: '모집 인원',
      deadline: '신청 마감',
      period: '캠페인 기간',
      requirements: '참여 조건',
      description: '캠페인 설명',
      brand: '브랜드',
      category: '카테고리',
      profileIncomplete: '프로필을 먼저 완성해주세요',
      goToProfile: '프로필 설정하기',
      campaignNotFound: '캠페인을 찾을 수 없습니다',
      loginRequired: '로그인이 필요합니다',
      
      // 폼 필드
      name: '이름',
      email: '이메일',
      age: '나이',
      skinType: '피부타입',
      postalCode: '우편번호',
      address: '주소',
      phoneNumber: '연락처',
      instagramUrl: '인스타그램 URL',
      youtubeUrl: '유튜브 URL',
      tiktokUrl: '틱톡 URL',
      
      // 플레이스홀더
      postalCodePlaceholder: '예: 123-4567',
      addressPlaceholder: '상세 주소를 입력해주세요',
      phoneNumberPlaceholder: '예: 010-1234-5678',
      instagramPlaceholder: 'https://instagram.com/username',
      youtubePlaceholder: 'https://youtube.com/@username',
      tiktokPlaceholder: 'https://tiktok.com/@username',
      
      // 검증 메시지
      postalCodeRequired: '우편번호는 필수입니다',
      addressRequired: '주소는 필수입니다',
      phoneRequired: '연락처는 필수입니다',
      instagramRequired: '인스타그램 URL은 필수입니다'
    },
    ja: {
      title: 'キャンペーン応募',
      backToCampaigns: 'キャンペーン一覧へ',
      campaignInfo: 'キャンペーン情報',
      applicationForm: '応募フォーム',
      personalInfo: '個人情報',
      contactInfo: '連絡先・配送情報',
      snsInfo: 'SNS情報',
      questions: '質問回答',
      additionalInfo: '追加情報',
      submit: '応募する',
      submitting: '応募中...',
      alreadyApplied: '既に応募済みのキャンペーンです',
      applicationSuccess: 'キャンペーン応募が完了しました！',
      requiredField: '必須項目',
      optionalField: '任意項目',
      reward: '報酬金',
      participants: '募集人数',
      deadline: '応募締切',
      period: 'キャンペーン期間',
      requirements: '参加条件',
      description: 'キャンペーン説明',
      brand: 'ブランド',
      category: 'カテゴリ',
      profileIncomplete: 'プロフィールを先に完成させてください',
      goToProfile: 'プロフィール設定',
      campaignNotFound: 'キャンペーンが見つかりません',
      loginRequired: 'ログインが必要です',
      
      // 폼 필드
      name: '名前',
      email: 'メール',
      age: '年齢',
      skinType: '肌タイプ',
      postalCode: '郵便番号',
      address: '住所',
      phoneNumber: '電話番号',
      instagramUrl: 'Instagram URL',
      youtubeUrl: 'YouTube URL',
      tiktokUrl: 'TikTok URL',
      
      // 플레이스홀더
      postalCodePlaceholder: '例: 123-4567',
      addressPlaceholder: '詳細住所を入力してください',
      phoneNumberPlaceholder: '例: 090-1234-5678',
      instagramPlaceholder: 'https://instagram.com/username',
      youtubePlaceholder: 'https://youtube.com/@username',
      tiktokPlaceholder: 'https://tiktok.com/@username',
      
      // 검증 메시지
      postalCodeRequired: '郵便番号は必須です',
      addressRequired: '住所は必須です',
      phoneRequired: '電話番号は必須です',
      instagramRequired: 'Instagram URLは必須です'
    },
    en: {
      title: 'Campaign Application',
      backToCampaigns: 'Back to Campaigns',
      campaignInfo: 'Campaign Information',
      applicationForm: 'Application Form',
      personalInfo: 'Personal Information',
      contactInfo: 'Contact & Shipping Information',
      snsInfo: 'SNS Information',
      questions: 'Questions',
      additionalInfo: 'Additional Information',
      submit: 'Submit Application',
      submitting: 'Submitting...',
      alreadyApplied: 'You have already applied to this campaign',
      applicationSuccess: 'Application submitted successfully!',
      requiredField: 'Required',
      optionalField: 'Optional',
      reward: 'Reward',
      participants: 'Participants',
      deadline: 'Deadline',
      period: 'Campaign Period',
      requirements: 'Requirements',
      description: 'Description',
      brand: 'Brand',
      category: 'Category',
      profileIncomplete: 'Please complete your profile first',
      goToProfile: 'Go to Profile',
      campaignNotFound: 'Campaign not found',
      loginRequired: 'Login required',
      
      // Form fields
      name: 'Name',
      email: 'Email',
      age: 'Age',
      skinType: 'Skin Type',
      postalCode: 'Postal Code',
      address: 'Address',
      phoneNumber: 'Phone Number',
      instagramUrl: 'Instagram URL',
      youtubeUrl: 'YouTube URL',
      tiktokUrl: 'TikTok URL',
      
      // Placeholders
      postalCodePlaceholder: 'e.g., 12345',
      addressPlaceholder: 'Enter your full address',
      phoneNumberPlaceholder: 'e.g., 555-1234-5678',
      instagramPlaceholder: 'https://instagram.com/username',
      youtubePlaceholder: 'https://youtube.com/@username',
      tiktokPlaceholder: 'https://tiktok.com/@username',
      
      // Validation messages
      postalCodeRequired: 'Postal code is required',
      addressRequired: 'Address is required',
      phoneRequired: 'Phone number is required',
      instagramRequired: 'Instagram URL is required',
      
      // Additional texts
      targetPlatforms: 'Target SNS Platforms',
      ageLabel: 'Age:',
      skinTypeLabel: 'Skin Type:',
      offlineVisitCondition: 'Offline Visit Requirement',
      offlineVisitNote: 'Offline Visit Note',
      offlineVisitAvailable: 'I can visit offline according to the above conditions',
      people: '',  // Empty for English (e.g., "50" instead of "50명")
      redirectingToHome: 'Redirecting to home page in 3 seconds...'
    }
  }

  const t = texts[language] || texts.en

  useEffect(() => {
    if (!user) {
      setError(t.loginRequired)
      setLoading(false)
      return
    }

    if (!campaignId) {
      setError(t.campaignNotFound)
      setLoading(false)
      return
    }

    loadData()
  }, [user, campaignId])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      console.log('데이터 로딩 시작:', { campaignId, userId: user?.id })

      // 1. 캠페인 정보 로드
      const campaignData = await database.campaigns.getById(campaignId)
      console.log('캠페인 데이터:', campaignData)
      
      if (!campaignData) {
        throw new Error(t.campaignNotFound)
      }
      setCampaign(campaignData)

      // 2. 사용자 프로필 로드
      const profileData = await database.userProfiles.get(user.id)
      console.log('프로필 데이터:', profileData)
      setUserProfile(profileData)

      // 프로필에서 기존 정보 가져와서 폼에 미리 채우기
      if (profileData) {
        setApplicationData(prev => ({
          ...prev,
          applicant_name: profileData.name || '',
          age: profileData.age || '',
          skin_type: profileData.skin_type || '',
          instagram_url: profileData.instagram_url || '',
          youtube_url: profileData.youtube_url || '',
          tiktok_url: profileData.tiktok_url || ''
        }))
      }

      // 3. 기존 신청서 확인
      const existingApp = await database.applications.getByUserAndCampaign(user.id, campaignId)
      console.log('기존 신청서:', existingApp)
      setExistingApplication(existingApp)

      // 기존 신청서가 있으면 데이터 로드
      if (existingApp) {
        setApplicationData(prev => ({
          ...prev,
          applicant_name: existingApp.applicant_name || profileData?.name || '',
          answer_1: existingApp.answer_1 || '',
          answer_2: existingApp.answer_2 || '',
          answer_3: existingApp.answer_3 || '',
          answer_4: existingApp.answer_4 || '',
          additional_info: existingApp.additional_info || '',
          age: existingApp.age || profileData?.age || '',
          skin_type: existingApp.skin_type || profileData?.skin_type || '',
          postal_code: existingApp.postal_code || '',
          address: existingApp.address || '',
          phone_number: existingApp.phone_number || '',
          instagram_url: existingApp.instagram_url || profileData?.instagram_url || '',
          youtube_url: existingApp.youtube_url || profileData?.youtube_url || '',
          tiktok_url: existingApp.tiktok_url || profileData?.tiktok_url || '',
          offline_visit_available: existingApp.offline_visit_available || false,
          offline_visit_notes: existingApp.offline_visit_notes || ''
        }))
      }

    } catch (error) {
      console.error('데이터 로딩 오류:', error)
      setError(error.message || '데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const errors = []

    // 개인정보 필수 필드 검증
    if (!applicationData.age || applicationData.age.toString().trim() === '' || applicationData.age < 1) {
      errors.push('Please enter a valid age')
    }
    if (!applicationData.skin_type || applicationData.skin_type.trim() === '') {
      errors.push('Please select your skin type')
    }

    // 연락처 및 배송 정보 필수 필드 검증
    if (!applicationData.postal_code.trim()) {
      errors.push(t.postalCodeRequired)
    }
    if (!applicationData.address.trim()) {
      errors.push(t.addressRequired)
    }
    if (!applicationData.phone_number.trim()) {
      errors.push(t.phoneRequired)
    }
    if (!applicationData.instagram_url.trim()) {
      errors.push(t.instagramRequired)
    }

    // 질문 답변 검증 (개별 질문 필드 사용)
    if (campaign?.question1 && !applicationData.answer_1?.trim()) {
      errors.push(language === 'ja' ? '質問 1は必須です' : '질문 1은 필수입니다')
    }
    if (campaign?.question2 && !applicationData.answer_2?.trim()) {
      errors.push(language === 'ja' ? '質問 2は必須です' : '질문 2는 필수입니다')
    }
    if (campaign?.question3 && !applicationData.answer_3?.trim()) {
      errors.push(language === 'ja' ? '質問 3は必須です' : '질문 3은 필수입니다')
    }
    if (campaign?.question4 && !applicationData.answer_4?.trim()) {
      errors.push(language === 'ja' ? '質問 4は必須です' : '질문 4는 필수입니다')
    }

    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setError(validationErrors.join('\n'))
      return
    }

    try {
      setSubmitting(true)
      setError('')

      // 申請データの準備 - applicationsテーブル用の構造に合わせる
      const submissionData = {
        user_id: user.id,
        campaign_id: campaignId,
        applicant_name: applicationData.applicant_name,
        age: parseInt(applicationData.age) || null,
        skin_type: applicationData.skin_type,
        postal_code: applicationData.postal_code,
        address: applicationData.address,
        phone_number: applicationData.phone_number,
        instagram_url: applicationData.instagram_url,
        youtube_url: applicationData.youtube_url || null,
        tiktok_url: applicationData.tiktok_url || null,
        answer_1: applicationData.answer_1 || null,
        answer_2: applicationData.answer_2 || null,
        answer_3: applicationData.answer_3 || null,
        answer_4: applicationData.answer_4 || null,
        additional_info: applicationData.additional_info || null,
        offline_visit_available: applicationData.offline_visit_available || false,
        offline_visit_notes: applicationData.offline_visit_notes || null,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('申請書提出データ:', submissionData)

      if (existingApplication) {
        // 既存申請書の更新
        console.log('既存申請書を更新:', existingApplication.id)
        await database.applications.update(existingApplication.id, submissionData)
      } else {
        // 新規申請書作成
        console.log('新規申請書を作成')
        await database.applications.create(submissionData)
      }

      setSuccess(t.applicationSuccess)
      
      // 3초 후 메인 페이지로 이동
      setTimeout(() => {
        navigate('/')
      }, 3000)

    } catch (error) {
      console.error('신청서 제출 오류:', error)
      setError('신청서 제출 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString(language === 'ja' ? 'ja-JP' : 'ko-KR')
  }

  const formatCurrency = (amount) => {
    if (!amount) return '$0'
    return `$${amount.toLocaleString()}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error && !campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
          >
            {t.backToCampaigns}
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            {success}
          </div>
          <p className="text-gray-600">{t.redirectingToHome || 'Redirecting to home page in 3 seconds...'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            {t.backToCampaigns}
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 캠페인 정보 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              {t.campaignInfo}
            </h2>

            {campaign && (
              <div className="space-y-4">
                {/* 캠페인 제목 */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{campaign.title}</h3>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className="text-sm text-gray-500">{t.brand}:</span>
                    <span className="text-sm font-medium text-gray-700">{campaign.brand}</span>
                    {campaign.category && (
                      <>
                        <span className="text-gray-300">|</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {campaign.category}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* 캠페인 설명 */}
                {campaign.description && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">{t.description}</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{campaign.description}</p>
                  </div>
                )}

                {/* 기본 정보 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                    </svg>
                    <div>
                      <p className="text-xs text-gray-500">{t.reward}</p>
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(campaign.reward_amount)}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    <div>
                      <p className="text-xs text-gray-500">{t.participants}</p>
                      <p className="text-sm font-medium text-gray-900">{campaign.max_participants}{language === 'ko' ? '명' : ''}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8m-8 0H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2v-6a2 2 0 00-2-2h-4"></path>
                    </svg>
                    <div>
                      <p className="text-xs text-gray-500">{t.deadline}</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(campaign.application_deadline)}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8m-8 0H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2v-6a2 2 0 00-2-2h-4"></path>
                    </svg>
                    <div>
                      <p className="text-xs text-gray-500">{t.period}</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(campaign.start_date)} ~ {formatDate(campaign.end_date)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 대상 SNS 플랫폼 */}
                {campaign.target_platforms && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">{t.targetPlatforms || 'Target SNS Platforms'}</h4>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        // target_platforms가 객체인 경우 처리
                        if (typeof campaign.target_platforms === 'object') {
                          const platforms = []
                          if (campaign.target_platforms.instagram) platforms.push('Instagram')
                          if (campaign.target_platforms.youtube) platforms.push('YouTube')
                          if (campaign.target_platforms.tiktok) platforms.push('TikTok')
                          return platforms
                        }
                        // 배열인 경우
                        return campaign.target_platforms || []
                      })().map((platform) => (
                        <span 
                          key={platform} 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 참여 조건 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">{t.requirements}</h4>
                  <div className="space-y-2">
                    {/* 기본 참여 조건 */}
                    {campaign.requirements && (
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{campaign.requirements}</p>
                    )}
                    
                    {/* 나이 조건 */}
                    {campaign.age_requirement && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium mr-2">{t.ageLabel || 'Age:'}</span>
                        <span>{campaign.age_requirement}</span>
                      </div>
                    )}
                    
                    {/* 피부타입 조건 */}
                    {campaign.skin_type_requirement && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium mr-2">{t.skinTypeLabel || 'Skin Type:'}</span>
                        <span>{campaign.skin_type_requirement}</span>
                      </div>
                    )}
                    
                    {/* 오프라인 방문 조건 */}
                    {campaign.offline_visit_requirement && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center text-sm text-blue-800 mb-1">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                          <span className="font-medium">{t.offlineVisitCondition || 'Offline Visit Requirement'}</span>
                        </div>
                        <p className="text-sm text-blue-700 whitespace-pre-wrap">{campaign.offline_visit_requirement}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 신청서 폼 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              {t.applicationForm}
            </h2>

            {existingApplication && (
              <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
                {t.alreadyApplied}
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 whitespace-pre-wrap">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 개인정보 섹션 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t.personalInfo}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.name} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={applicationData.applicant_name || userProfile?.name || ''}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, applicant_name: e.target.value }))}
                      placeholder="Enter your name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.email} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={userProfile?.email || user?.email || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.age} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={applicationData.age || userProfile?.age || ''}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, age: e.target.value }))}
                      placeholder="Enter your age"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.skinType} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={applicationData.skin_type || userProfile?.skin_type || ''}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, skin_type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      required
                    >
                      <option value="">Select skin type</option>
                      <option value="dry">Dry</option>
                      <option value="oily">Oily</option>
                      <option value="combination">Combination</option>
                      <option value="sensitive">Sensitive</option>
                      <option value="normal">Normal</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 연락처 및 배송 정보 섹션 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t.contactInfo}</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t.postalCode} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={applicationData.postal_code}
                        onChange={(e) => setApplicationData(prev => ({ ...prev, postal_code: e.target.value }))}
                        placeholder={t.postalCodePlaceholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t.phoneNumber} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={applicationData.phone_number}
                        onChange={(e) => setApplicationData(prev => ({ ...prev, phone_number: e.target.value }))}
                        placeholder={t.phoneNumberPlaceholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.address} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={applicationData.address}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder={t.addressPlaceholder}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      required
                    />
                  </div>

                  {/* 오프라인 방문 가능 여부 */}
                  {campaign?.offline_visit_requirement && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">오프라인 방문 조건</h4>
                      <p className="text-blue-800 text-sm mb-3">{campaign.offline_visit_requirement}</p>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={applicationData.offline_visit_available || false}
                              onChange={(e) => setApplicationData(prev => ({ 
                                ...prev, 
                                offline_visit_available: e.target.checked 
                              }))}
                              className="mr-2"
                            />
                            <span className="text-sm">{t.offlineVisitAvailable || 'I can visit offline according to the above conditions'}</span>
                          </label>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t.offlineVisitNote || 'Offline Visit Note'}
                          </label>
                          <textarea
                            value={applicationData.offline_visit_notes || ''}
                            onChange={(e) => setApplicationData(prev => ({ 
                              ...prev, 
                              offline_visit_notes: e.target.value 
                            }))}
                            placeholder="訪問可能な時間帯、特記事項などをご記入ください"
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SNS 정보 섹션 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t.snsInfo}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.instagramUrl} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      value={applicationData.instagram_url}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, instagram_url: e.target.value }))}
                      placeholder={t.instagramPlaceholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t.youtubeUrl}
                      </label>
                      <input
                        type="url"
                        value={applicationData.youtube_url}
                        onChange={(e) => setApplicationData(prev => ({ ...prev, youtube_url: e.target.value }))}
                        placeholder={t.youtubePlaceholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t.tiktokUrl}
                      </label>
                      <input
                        type="url"
                        value={applicationData.tiktok_url}
                        onChange={(e) => setApplicationData(prev => ({ ...prev, tiktok_url: e.target.value }))}
                        placeholder={t.tiktokPlaceholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 질문 답변 섹션 */}
              {(campaign?.question1 || campaign?.question2 || campaign?.question3 || campaign?.question4) && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{t.questions}</h3>
                  <div className="space-y-4">
                    {/* 질문 1 */}
                    {campaign?.question1 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {campaign.question1} <span className="text-red-500 ml-1">*</span>
                        </label>
                        {campaign.question1_type === 'checkbox' ? (
                          <div className="space-y-2">
                            {campaign.question1_options?.split(',').map((option, idx) => (
                              <label key={idx} className="flex items-center">
                                <input
                                  type="checkbox"
                                  value={option.trim()}
                                  checked={applicationData.answer_1?.includes(option.trim()) || false}
                                  onChange={(e) => {
                                    const currentAnswers = applicationData.answer_1?.split(',').map(a => a.trim()).filter(Boolean) || []
                                    const newAnswers = e.target.checked 
                                      ? [...currentAnswers, option.trim()]
                                      : currentAnswers.filter(a => a !== option.trim())
                                    setApplicationData(prev => ({
                                      ...prev,
                                      answer_1: newAnswers.join(', ')
                                    }))
                                  }}
                                  className="mr-2"
                                />
                                {option.trim()}
                              </label>
                            ))}
                          </div>
                        ) : (
                          <textarea
                            value={applicationData.answer_1 || ''}
                            onChange={(e) => setApplicationData(prev => ({
                              ...prev,
                              answer_1: e.target.value
                            }))}
                            rows={campaign.question1_type === 'long' ? 5 : 3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Enter your answer..."
                            required
                          />
                        )}
                      </div>
                    )}

                    {/* 질문 2 */}
                    {campaign?.question2 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {campaign.question2} <span className="text-red-500 ml-1">*</span>
                        </label>
                        {campaign.question2_type === 'checkbox' ? (
                          <div className="space-y-2">
                            {campaign.question2_options?.split(',').map((option, idx) => (
                              <label key={idx} className="flex items-center">
                                <input
                                  type="checkbox"
                                  value={option.trim()}
                                  checked={applicationData.answer_2?.includes(option.trim()) || false}
                                  onChange={(e) => {
                                    const currentAnswers = applicationData.answer_2?.split(',').map(a => a.trim()).filter(Boolean) || []
                                    const newAnswers = e.target.checked 
                                      ? [...currentAnswers, option.trim()]
                                      : currentAnswers.filter(a => a !== option.trim())
                                    setApplicationData(prev => ({
                                      ...prev,
                                      answer_2: newAnswers.join(', ')
                                    }))
                                  }}
                                  className="mr-2"
                                />
                                {option.trim()}
                              </label>
                            ))}
                          </div>
                        ) : (
                          <textarea
                            value={applicationData.answer_2 || ''}
                            onChange={(e) => setApplicationData(prev => ({
                              ...prev,
                              answer_2: e.target.value
                            }))}
                            rows={campaign.question2_type === 'long' ? 5 : 3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Enter your answer..."
                            required
                          />
                        )}
                      </div>
                    )}

                    {/* 질문 3 */}
                    {campaign?.question3 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {campaign.question3} <span className="text-red-500 ml-1">*</span>
                        </label>
                        {campaign.question3_type === 'checkbox' ? (
                          <div className="space-y-2">
                            {campaign.question3_options?.split(',').map((option, idx) => (
                              <label key={idx} className="flex items-center">
                                <input
                                  type="checkbox"
                                  value={option.trim()}
                                  checked={applicationData.answer_3?.includes(option.trim()) || false}
                                  onChange={(e) => {
                                    const currentAnswers = applicationData.answer_3?.split(',').map(a => a.trim()).filter(Boolean) || []
                                    const newAnswers = e.target.checked 
                                      ? [...currentAnswers, option.trim()]
                                      : currentAnswers.filter(a => a !== option.trim())
                                    setApplicationData(prev => ({
                                      ...prev,
                                      answer_3: newAnswers.join(', ')
                                    }))
                                  }}
                                  className="mr-2"
                                />
                                {option.trim()}
                              </label>
                            ))}
                          </div>
                        ) : (
                          <textarea
                            value={applicationData.answer_3 || ''}
                            onChange={(e) => setApplicationData(prev => ({
                              ...prev,
                              answer_3: e.target.value
                            }))}
                            rows={campaign.question3_type === 'long' ? 5 : 3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Enter your answer..."
                            required
                          />
                        )}
                      </div>
                    )}

                    {/* 질문 4 */}
                    {campaign?.question4 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {campaign.question4} <span className="text-red-500 ml-1">*</span>
                        </label>
                        {campaign.question4_type === 'checkbox' ? (
                          <div className="space-y-2">
                            {campaign.question4_options?.split(',').map((option, idx) => (
                              <label key={idx} className="flex items-center">
                                <input
                                  type="checkbox"
                                  value={option.trim()}
                                  checked={applicationData.answer_4?.includes(option.trim()) || false}
                                  onChange={(e) => {
                                    const currentAnswers = applicationData.answer_4?.split(',').map(a => a.trim()).filter(Boolean) || []
                                    const newAnswers = e.target.checked 
                                      ? [...currentAnswers, option.trim()]
                                      : currentAnswers.filter(a => a !== option.trim())
                                    setApplicationData(prev => ({
                                      ...prev,
                                      answer_4: newAnswers.join(', ')
                                    }))
                                  }}
                                  className="mr-2"
                                />
                                {option.trim()}
                              </label>
                            ))}
                          </div>
                        ) : (
                          <textarea
                            value={applicationData.answer_4 || ''}
                            onChange={(e) => setApplicationData(prev => ({
                              ...prev,
                              answer_4: e.target.value
                            }))}
                            rows={campaign.question4_type === 'long' ? 5 : 3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Enter your answer..."
                            required
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 추가 정보 섹션 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.additionalInfo}
                </label>
                <textarea
                  value={applicationData.additional_info}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, additional_info: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Please enter any additional information you would like to share..."
                />
              </div>

              {/* 제출 버튼 */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t.submitting}
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                      </svg>
                      {t.submit}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>



        </div>
      </div>
    </div>
  )
}

export default CampaignApplicationUpdated
