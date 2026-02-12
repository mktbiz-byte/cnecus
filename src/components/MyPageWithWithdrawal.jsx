import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { database, supabase } from '../lib/supabase'
import {
  User, Mail, Phone, MapPin, Calendar, Award,
  CreditCard, Download, Settings, LogOut,
  AlertTriangle, Trash2, Shield, Eye, EyeOff, X,
  Camera, Loader2, DollarSign, TrendingUp, BarChart3,
  CheckCircle2, Clock, ArrowUpRight, Wallet, ChevronRight,
  Globe, Instagram, Youtube, ExternalLink, Briefcase,
  Target, Zap, Home
} from 'lucide-react'

// Import new mypage components
import {
  CampaignProgressCard,
  CampaignWorkflowStepper,
  ShootingGuideModal,
  RevisionRequestsModal,
  VideoUploadModal,
  SNSSubmitModal
} from './mypage'

// PayPal 정보 추출 헬퍼 함수
const extractPayPalFromDescription = (description) => {
  if (!description) return ''
  
  // "출금 신청: 50000포인트 (PayPal: MKT@HOWLAB.CO.KR)" 형식에서 이메일 추출
  const paypalMatch1 = description.match(/\(PayPal:\s*([^)]+)\)/)
  if (paypalMatch1) {
    return paypalMatch1[1].trim()
  }
  
  // "PayPal: email@example.com" 형식에서 이메일 추출
  const paypalMatch2 = description.match(/PayPal:\s*([^)]+)/)
  if (paypalMatch2) {
    return paypalMatch2[1].trim()
  }
  
  // "출금 신청: 20000 (PayPal: 123)" 형식에서 정보 추출
  const paypalMatch3 = description.match(/\(PayPal:\s*([^)]+)\)/)
  if (paypalMatch3) {
    return paypalMatch3[1].trim()
  }
  
  // 이메일 패턴 직접 추출
  const emailMatch = description.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)
  if (emailMatch) {
    return emailMatch[1]
  }
  
  return ''
}

const MyPageWithWithdrawal = () => {
  const { user, signOut } = useAuth()
  const { language } = useLanguage()
  
  const [profile, setProfile] = useState(null)
  const [applications, setApplications] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [pointTransactions, setPointTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  
  // 회원 탈퇴 관련 상태
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false)
  const [withdrawalReason, setWithdrawalReason] = useState('')
  const [withdrawalDetails, setWithdrawalDetails] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // 출금 신청 관련 상태
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    paypalEmail: '',
    paypalName: '',
    reason: ''
  })

  // SNS 업로드 및 포인트 신청 관련 상태
  const [showSnsUploadModal, setShowSnsUploadModal] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [snsUploadForm, setSnsUploadForm] = useState({
    sns_upload_url: '',
    notes: ''
  })

  // Shooting guide and video upload states
  const [expandedGuides, setExpandedGuides] = useState({})
  const [showVideoUploadModal, setShowVideoUploadModal] = useState(false)
  const [videoFile, setVideoFile] = useState(null)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedWeekNumber, setSelectedWeekNumber] = useState(1) // For 4-week challenge
  const videoInputRef = useRef(null)

  // New mypage modal states
  const [showShootingGuideModal, setShowShootingGuideModal] = useState(false)
  const [showRevisionModal, setShowRevisionModal] = useState(false)
  const [showSNSSubmitModal, setShowSNSSubmitModal] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState(null)

  // 프로필 편집 관련 상태
  const [isEditing, setIsEditing] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    bio: '',
    age: '',
    region: '',
    skin_type: '',
    address: '',
    profile_image_url: '',
    instagram_url: '',
    tiktok_url: '',
    youtube_url: '',
    other_sns_url: '',
    instagram_followers: '',
    tiktok_followers: '',
    youtube_subscribers: ''
  })

  // 다국어 텍스트
  const texts = {
    ko: {
      title: '마이페이지',
      profile: '프로필',
      applications: '신청 내역',
      withdrawals: '출금 내역',
      points: '포인트 내역',
      accountSettings: '계정 설정',
      personalInfo: '개인정보',
      name: '이름',
      email: '이메일',
      phone: '전화번호',
      address: '주소',
      joinDate: '가입일',
      userRole: '사용자 등급',
      currentPoints: '보유 포인트',
      totalEarned: '총 획득 포인트',
      campaignApplications: '캠페인 신청',
      totalApplications: '총 신청 수',
      approvedApplications: '승인된 신청',
      completedCampaigns: '완료된 캠페인',
      withdrawalHistory: '출금 내역',
      totalWithdrawn: '총 출금액',
      pendingWithdrawals: '출금 대기',
      pointHistory: '포인트 내역',
      transactionType: '거래 유형',
      amount: '금액',
      date: '날짜',
      description: '설명',
      earned: '획득',
      spent: '사용',
      bonus: '보너스',
      withdrawal: '출금',
      withdrawRequest: '출금 신청',
      withdrawRequestTitle: '포인트 출금 신청',
      withdrawAmount: '출금 금액',
      paypalEmail: 'PayPal 이메일',
      paypalName: 'PayPal 계정명',
      withdrawReason: '출금 사유',
      submitWithdrawRequest: '출금 신청하기',
      accountDeletion: '회원 탈퇴',
      deleteAccount: '계정 삭제',
      deleteAccountWarning: '계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.',
      deleteAccountDescription: '회원 탈퇴를 신청하시면 관리자 검토 후 처리됩니다. 탈퇴 후에는 모든 데이터가 복구 불가능하게 삭제됩니다.',
      withdrawalReason: '탈퇴 사유',
      withdrawalDetails: '상세 내용',
      confirmDeletion: '탈퇴 확인',
      confirmText: '정말로 탈퇴하시겠습니까? 확인하려면 "탈퇴합니다"를 입력하세요.',
      confirmPlaceholder: '탈퇴합니다',
      submitWithdrawal: '탈퇴 신청',
      cancel: '취소',
      processing: '처리 중...',
      logout: '로그아웃',
      goHome: '홈으로 가기',
      noData: '데이터가 없습니다',
      edit: '수정',
      save: '저장',
      skinType: '피부타입',
      postalCode: '우편번호',
      roles: {
        user: '일반 사용자',
        vip: 'VIP 사용자',
        manager: '매니저',
        admin: '관리자'
      },
      reasons: {
        service: '서비스 불만족',
        privacy: '개인정보 우려',
        unused: '서비스 미사용',
        other: '기타'
      },
      snsUpload: 'SNS 업로드',
      snsUploadUrl: 'SNS 업로드 URL',
      pointRequest: '포인트 신청',
      pointRequestTitle: 'SNS 업로드 및 포인트 신청',
      snsUploadDescription: 'SNS에 업로드한 콘텐츠의 URL을 입력하고 포인트를 신청하세요.',
      additionalNotes: '추가 메모',
      submitPointRequest: '포인트 신청하기',
      pointRequestPending: '포인트 신청 대기중',
      pointRequestApproved: '포인트 지급 완료',
      messages: {
        withdrawalSubmitted: '탈퇴 신청이 완료되었습니다. 관리자 검토 후 처리됩니다.',
        error: '오류가 발생했습니다. 다시 시도해주세요.',
        confirmRequired: '탈퇴 확인 문구를 정확히 입력해주세요.',
        reasonRequired: '탈퇴 사유를 선택해주세요.',
        snsUploadSubmitted: 'SNS 업로드 및 포인트 신청이 완료되었습니다.',
        snsUrlRequired: 'SNS 업로드 URL을 입력해주세요.'
      }
    },
    ja: {
      title: 'マイページ',
      profile: 'プロフィール',
      applications: '応募履歴',
      withdrawals: '出金履歴',
      points: 'ポイント履歴',
      accountSettings: 'アカウント設定',
      personalInfo: '個人情報',
      name: '名前',
      email: 'メール',
      phone: '電話番号',
      address: '住所',
      joinDate: '登録日',
      userRole: 'ユーザーランク',
      currentPoints: '保有ポイント',
      totalEarned: '総獲得ポイント',
      campaignApplications: 'キャンペーン応募',
      totalApplications: '総応募数',
      approvedApplications: '承認済み応募',
      completedCampaigns: '完了キャンペーン',
      withdrawalHistory: '出金履歴',
      totalWithdrawn: '総出金額',
      pendingWithdrawals: '出金待ち',
      pointHistory: 'ポイント履歴',
      transactionType: '取引種別',
      amount: '金額',
      date: '日付',
      description: '説明',
      earned: '獲得',
      spent: '使用',
      bonus: 'ボーナス',
      withdrawal: '出金',
      withdrawRequest: '出金申請',
      withdrawRequestTitle: 'ポイント出金申請',
      withdrawAmount: '出金金額',
      paypalEmail: 'PayPal メール',
      paypalName: 'PayPal アカウント名',
      withdrawReason: '出金理由',
      submitWithdrawRequest: '出金申請する',
      accountDeletion: '退会',
      deleteAccount: 'アカウント削除',
      deleteAccountWarning: 'アカウントを削除すると、すべてのデータが永久に削除されます。',
      deleteAccountDescription: '退会申請をすると、管理者の審査後に処理されます。退会後はすべてのデータが復旧不可能に削除されます。',
      withdrawalReason: '退会理由',
      withdrawalDetails: '詳細内容',
      confirmDeletion: '退会確認',
      confirmText: '本当に退会しますか？確認するには「退会します」と入力してください。',
      confirmPlaceholder: '退会します',
      submitWithdrawal: '退会申請',
      cancel: 'キャンセル',
      processing: '処理中...',
      logout: 'ログアウト',
      goHome: 'ホームに戻る',
      noData: 'データがありません',
      edit: '編集',
      save: '保存',
      skinType: '肌タイプ',
      postalCode: '郵便番号',
      age: '年齢',
      region: '地域',
      bio: '自己紹介',
 
      instagramFollowers: 'Instagramフォロワー数',
      tiktokFollowers: 'TikTokフォロワー数',
      youtubeSubscribers: 'YouTube登録者数',
      roles: {
        user: '一般ユーザー',
        vip: 'VIPユーザー',
        manager: 'マネージャー',
        admin: '管理者'
      },
      reasons: {
        service: 'サービス不満',
        privacy: 'プライバシー懸念',
        unused: 'サービス未使用',
        other: 'その他'
      },
      snsUpload: 'SNS投稿',
      snsUploadUrl: 'SNS投稿URL',
      pointRequest: 'ポイント申請',
      pointRequestTitle: 'SNS投稿およびポイント申請',
      snsUploadDescription: 'SNSに投稿したコンテンツのURLを入力してポイントを申請してください。',
      additionalNotes: '追加メモ',
      submitPointRequest: 'ポイント申請する',
      pointRequestPending: 'ポイント申請待ち',
      pointRequestApproved: 'ポイント支給完了',
      messages: {
        withdrawalSubmitted: '退会申請が完了しました。管理者の審査後に処理されます。',
        error: 'エラーが発生しました。再度お試しください。',
        confirmRequired: '退会確認文を正確に入力してください。',
        reasonRequired: '退会理由を選択してください。',
        snsUploadSubmitted: 'SNS投稿およびポイント申請が完了しました。',
        snsUrlRequired: 'SNS投稿 URLを入力してください。'
      }
    },
    en: {
      title: 'My Page',
      profile: 'Profile',
      applications: 'Applications',
      withdrawals: 'Withdrawals',
      points: 'Points History',
      accountSettings: 'Account Settings',
      personalInfo: 'Personal Information',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      joinDate: 'Join Date',
      userRole: 'User Role',
      currentPoints: 'Current Points',
      totalEarned: 'Total Earned',
      campaignApplications: 'Campaign Applications',
      totalApplications: 'Total Applications',
      approvedApplications: 'Approved',
      completedCampaigns: 'Completed',
      withdrawalHistory: 'Withdrawal History',
      totalWithdrawn: 'Total Withdrawn',
      pendingWithdrawals: 'Pending',
      pointHistory: 'Point History',
      transactionType: 'Type',
      amount: 'Amount',
      date: 'Date',
      description: 'Description',
      earned: 'Earned',
      spent: 'Spent',
      bonus: 'Bonus',
      withdrawal: 'Withdrawal',
      withdrawRequest: 'Request Withdrawal',
      withdrawRequestTitle: 'Point Withdrawal Request',
      withdrawAmount: 'Withdrawal Amount',
      paypalEmail: 'PayPal Email',
      paypalName: 'PayPal Account Name',
      withdrawReason: 'Reason',
      submitWithdrawRequest: 'Submit Request',
      accountDeletion: 'Account Deletion',
      deleteAccount: 'Delete Account',
      deleteAccountWarning: 'Deleting your account will permanently remove all your data.',
      deleteAccountDescription: 'Your account deletion request will be reviewed by administrators. After deletion, all data will be permanently removed and cannot be recovered.',
      withdrawalReason: 'Reason for Deletion',
      withdrawalDetails: 'Details',
      confirmDeletion: 'Confirm Deletion',
      confirmText: 'Are you sure you want to delete your account? Type "DELETE" to confirm.',
      confirmPlaceholder: 'DELETE',
      submitWithdrawal: 'Submit Deletion Request',
      cancel: 'Cancel',
      processing: 'Processing...',
      logout: 'Logout',
      goHome: 'Go Home',
      noData: 'No data available',
      edit: 'Edit',
      save: 'Save',
      skinType: 'Skin Type',
      postalCode: 'Postal Code',
      age: 'Age',
      region: 'Region',
      bio: 'Bio',
      instagramFollowers: 'Instagram Followers',
      tiktokFollowers: 'TikTok Followers',
      youtubeSubscribers: 'YouTube Subscribers',
      roles: {
        user: 'User',
        creator: 'Creator',
        vip: 'VIP',
        manager: 'Manager',
        admin: 'Admin'
      },
      reasons: {
        service: 'Service Dissatisfaction',
        privacy: 'Privacy Concerns',
        unused: 'Not Using Service',
        other: 'Other'
      },
      snsUpload: 'SNS Upload',
      snsUploadUrl: 'SNS Upload URL',
      pointRequest: 'Request Points',
      pointRequestTitle: 'SNS Upload & Point Request',
      snsUploadDescription: 'Enter the URL of your SNS content and request points.',
      additionalNotes: 'Additional Notes',
      submitPointRequest: 'Submit Point Request',
      pointRequestPending: 'Point Request Pending',
      pointRequestApproved: 'Points Approved',
      messages: {
        withdrawalSubmitted: 'Account deletion request submitted. It will be reviewed by administrators.',
        error: 'An error occurred. Please try again.',
        confirmRequired: 'Please type the confirmation text correctly.',
        reasonRequired: 'Please select a reason for deletion.',
        snsUploadSubmitted: 'SNS upload and point request submitted successfully.',
        snsUrlRequired: 'Please enter the SNS upload URL.'
      }
    }
  }

  const t = texts[language] || texts.en

  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    try {
      setLoading(true)

      // 🚀 모든 데이터를 병렬로 로딩
      // Step 1: applications 조회 (campaigns join 시도)
      const { data: appsData, error: appsError } = await supabase
        .from('applications')
        .select('*, campaigns(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      console.log('[DEBUG] applications query:', { appsData: appsData?.length, appsError: appsError?.message })

      let applicationsWithGuide = appsData

      // applications 쿼리 실패 시 campaign_applications fallback
      if (appsError || !appsData) {
        console.warn('[DEBUG] applications 실패, campaign_applications 시도:', appsError?.message)
        const { data: caData, error: caError } = await supabase
          .from('campaign_applications')
          .select('*, campaigns(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        console.log('[DEBUG] campaign_applications query:', { caData: caData?.length, caError: caError?.message })
        applicationsWithGuide = caData
      }

      // Step 2: campaigns join이 null인지 체크 → 직접 campaigns 조회로 보완
      if (applicationsWithGuide && applicationsWithGuide.length > 0) {
        const firstApp = applicationsWithGuide[0]
        const c = firstApp.campaigns
        console.log('[DEBUG] 첫 application campaigns join 결과:', c)
        console.log('[DEBUG] campaign 주요 필드:', c ? {
          id: c.id,
          title: c.title,
          title_en: c.title_en,
          video_deadline: c.video_deadline,
          sns_deadline: c.sns_deadline,
          application_deadline: c.application_deadline,
          posting_deadline: c.posting_deadline,
          google_drive_url: c.google_drive_url,
          google_slides_url: c.google_slides_url,
          shooting_guide: c.shooting_guide ? 'EXISTS (jsonb)' : null,
          brand_name_en: c.brand_name_en,
          product_name_en: c.product_name_en,
          required_dialogues_en: c.required_dialogues_en,
          required_scenes_en: c.required_scenes_en,
          requires_clean_video: c.requires_clean_video,
          requires_ad_code: c.requires_ad_code,
          meta_ad_code_requested: c.meta_ad_code_requested,
          _allKeys: Object.keys(c).filter(k => c[k] != null).join(', ')
        } : 'NULL')

        // campaigns가 null이면 RLS 또는 FK 문제 → 직접 조회
        const hasMissingCampaigns = applicationsWithGuide.some(app => !app.campaigns && app.campaign_id)
        if (hasMissingCampaigns) {
          console.warn('[DEBUG] campaigns join이 null → campaigns 직접 조회 시도')
          const campaignIds = [...new Set(applicationsWithGuide.filter(a => a.campaign_id).map(a => a.campaign_id))]
          console.log('[DEBUG] 조회할 campaign IDs:', campaignIds)

          const { data: campaignsData, error: campaignsError } = await supabase
            .from('campaigns')
            .select('*')
            .in('id', campaignIds)

          console.log('[DEBUG] campaigns 직접 조회 결과:', {
            count: campaignsData?.length,
            error: campaignsError?.message,
            firstCampaign: campaignsData?.[0] ? Object.keys(campaignsData[0]).slice(0, 10) : 'null'
          })

          if (campaignsData && campaignsData.length > 0) {
            // campaigns 데이터를 applications에 수동 매핑
            const campaignMap = {}
            campaignsData.forEach(c => { campaignMap[c.id] = c })
            applicationsWithGuide = applicationsWithGuide.map(app => ({
              ...app,
              campaigns: app.campaigns || campaignMap[app.campaign_id] || null
            }))
            console.log('[DEBUG] campaigns 수동 매핑 완료, 첫번째:', applicationsWithGuide[0]?.campaigns?.title)
          } else {
            console.error('[DEBUG] campaigns 직접 조회도 실패 - RLS 정책 확인 필요')
          }
        }
      }

      const [profileData, _, pointTransactionsResult, videoSubmissionsResult] = await Promise.all([
        // 1. 프로필 정보
        database.userProfiles.get(user.id),
        // 2. 신청 내역 (already loaded above with shooting_guide)
        Promise.resolve(applicationsWithGuide),
        // 3. 포인트 거래 내역 (출금 + 전체)
        supabase
          .from('point_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        // 4. 영상 제출 이력 (버전 관리 + 수정 요청)
        supabase
          .from('video_submissions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ])

      // 프로필 설정
      setProfile(profileData)
      if (profileData) {
        setEditForm({
          name: profileData.name || '',
          phone: profileData.phone || '',
          bio: profileData.bio || '',
          age: profileData.age || '',
          region: profileData.region || '',
          skin_type: profileData.skin_type || '',
          address: profileData.address || '',
          profile_image_url: profileData.profile_image_url || '',
          instagram_url: profileData.instagram_url || '',
          tiktok_url: profileData.tiktok_url || '',
          youtube_url: profileData.youtube_url || '',
          other_sns_url: profileData.other_sns_url || '',
          instagram_followers: profileData.instagram_followers || '',
          tiktok_followers: profileData.tiktok_followers || '',
          youtube_subscribers: profileData.youtube_subscribers || ''
        })
      }

      // Process video_submissions to attach revision_requests to applications
      const videoSubmissions = videoSubmissionsResult?.data || []
      const enrichedApplications = (applicationsWithGuide || []).map(app => {
        // Find revision requests from video_submissions for this application
        const appSubmissions = videoSubmissions.filter(vs => vs.application_id === app.id)
        const revisionRequests = appSubmissions
          .filter(vs => vs.status === 'revision_requested')
          .map(vs => ({
            id: vs.id,
            comment: vs.revision_notes || vs.admin_comment || '',
            comment_en: vs.revision_notes_en || vs.admin_comment_en || '',
            created_at: vs.updated_at || vs.created_at,
            video_number: vs.video_number,
            week_number: vs.week_number,
            version: vs.version
          }))
        return {
          ...app,
          revision_requests: revisionRequests,
          video_submissions: appSubmissions
        }
      })

      // 신청 내역 설정 (with shooting_guide from campaigns + revision data)
      setApplications(enrichedApplications)

      // 포인트 거래 내역 처리
      const { data: pointData, error: pointError } = pointTransactionsResult

      if (!pointError && pointData) {
        // 출금 내역 필터링 (음수 금액)
        const withdrawalData = pointData.filter(item => item.amount < 0)
        const formattedWithdrawals = withdrawalData.map(item => {
          let status = 'pending'
          if (item.description?.includes('[상태:승인됨]') || item.description?.includes('[状態:承認済み]')) {
            status = 'approved'
          } else if (item.description?.includes('[상태:완료됨]') || item.description?.includes('[状態:完了]')) {
            status = 'completed'
          } else if (item.description?.includes('[상태:거부됨]') || item.description?.includes('[状態:拒否済み]')) {
            status = 'rejected'
          }
          return {
            id: item.id,
            user_id: item.user_id,
            amount: Math.abs(item.amount),
            status: status,
            paypal_email: extractPayPalFromDescription(item.description),
            paypal_name: extractPayPalFromDescription(item.description),
            reason: item.description,
            created_at: item.created_at,
            updated_at: item.updated_at
          }
        })

        // 중복 제거
        const uniqueWithdrawals = []
        const seenWithdrawals = new Set()
        for (const withdrawal of formattedWithdrawals) {
          const key = `${withdrawal.user_id}-${withdrawal.amount}-${withdrawal.created_at.split('T')[0]}`
          if (!seenWithdrawals.has(key)) {
            seenWithdrawals.add(key)
            uniqueWithdrawals.push(withdrawal)
          }
        }
        setWithdrawals(uniqueWithdrawals)

        // 포인트 거래 내역 중복 제거
        const uniquePointTransactions = []
        const seenPoints = new Set()
        for (const transaction of pointData) {
          const key = `${transaction.user_id}-${transaction.amount}-${transaction.created_at.split('T')[0]}-${transaction.description || ''}`
          if (!seenPoints.has(key)) {
            seenPoints.add(key)
            uniquePointTransactions.push(transaction)
          }
        }
        setPointTransactions(uniquePointTransactions)
      } else {
        setWithdrawals([])
        setPointTransactions([])
      }

    } catch (error) {
      console.error('사용자 데이터 로드 오류:', error)
      // 프로필 데이터가 없어도 페이지는 표시되도록 함
      if (!profile) {
        setProfile({
          name: user?.user_metadata?.full_name || user?.email || '',
          email: user?.email || '',
          phone_number: '',
          address: '',
          created_at: new Date().toISOString(),
          user_role: 'user',
          points: 0
        })
      }
      // 오류 메시지는 콘솔에만 표시하고 UI에는 표시하지 않음
      console.warn('일부 데이터 로드에 실패했지만 페이지는 계속 표시됩니다.')
      setError('') // 오류 상태 초기화
    } finally {
      setLoading(false)
    }
  }

  // 프로필 이미지 업로드 함수
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 유효성 검사
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    try {
      setUploadingImage(true)
      setError('')

      // 고유 파일명 생성
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `profiles/${fileName}`

      // Supabase Storage에 업로드 (기존 campaign-images 버킷 사용)
      const { data, error: uploadError } = await supabase.storage
        .from('campaign-images')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        setError('Image upload failed. Please try again.')
        return
      }

      // Public URL 가져오기
      const { data: { publicUrl } } = supabase.storage
        .from('campaign-images')
        .getPublicUrl(filePath)

      // editForm 업데이트
      setEditForm(prev => ({ ...prev, profile_image_url: publicUrl }))

      // DB에 저장 (profile_image_url 컬럼만 존재)
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          profile_image_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (updateError) {
        console.error('DB update error:', updateError)
      } else {
        setProfile(prev => ({ ...prev, profile_image_url: publicUrl }))
        setSuccess('Profile photo uploaded!')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (error) {
      console.error('Image upload error:', error)
      setError('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleProfileSave = async () => {
    try {
      setProcessing(true)
      setError('')
      
      // 숫자 필드 유효성 검사
  const validateNumber = (value, fieldName) => {
    // 빈 값이나 undefined는 null로 처리 (허용)
    if (!value || value === '' || value === undefined) {
      return null
    }
    
    // 숫자로 변환 시도
    const numValue = Number(value)
    if (isNaN(numValue)) {
      throw new Error(`${fieldName} must be a number.`)
    }
    
    // 음수는 허용하지 않음 (나이, 팔로워 수 등)
    if (numValue < 0) {
      throw new Error(`${fieldName} must be 0 or greater.`)
    }
    
    return numValue
  }

      // 업데이트할 데이터 준비 - 스키마 업데이트 완료로 모든 필드 저장 가능
      const updateData = {}

      // 기본 정보 필드들
      if (editForm.name !== undefined) updateData.name = editForm.name?.trim() || null
      if (editForm.bio !== undefined) updateData.bio = editForm.bio?.trim() || null
      if (editForm.phone !== undefined) updateData.phone = editForm.phone?.trim() || null
      if (editForm.region !== undefined) updateData.region = editForm.region?.trim() || null
      if (editForm.skin_type !== undefined) updateData.skin_type = editForm.skin_type?.trim() || null
      if (editForm.age !== undefined) updateData.age = editForm.age ? parseInt(editForm.age) : null
      if (editForm.address !== undefined) updateData.address = editForm.address?.trim() || null
      // 프로필 이미지 URL (profile_image_url 컬럼만 존재)
      if (editForm.profile_image_url !== undefined) {
        updateData.profile_image_url = editForm.profile_image_url || null
      }

      // SNS URL 필드들
      if (editForm.instagram_url !== undefined) updateData.instagram_url = editForm.instagram_url?.trim() || null
      if (editForm.tiktok_url !== undefined) updateData.tiktok_url = editForm.tiktok_url?.trim() || null
      if (editForm.youtube_url !== undefined) updateData.youtube_url = editForm.youtube_url?.trim() || null
      if (editForm.other_sns_url !== undefined) updateData.other_sns_url = editForm.other_sns_url?.trim() || null

      // SNS 팔로워 수 필드들
      if (editForm.instagram_followers !== undefined) {
        updateData.instagram_followers = editForm.instagram_followers ? parseInt(editForm.instagram_followers) : null
      }
      if (editForm.tiktok_followers !== undefined) {
        updateData.tiktok_followers = editForm.tiktok_followers ? parseInt(editForm.tiktok_followers) : null
      }
      if (editForm.youtube_subscribers !== undefined) {
        updateData.youtube_subscribers = editForm.youtube_subscribers ? parseInt(editForm.youtube_subscribers) : null
      }

      // 업데이트 시간 추가
      updateData.updated_at = new Date().toISOString()

      console.log('프로필 업데이트 데이터:', updateData)
      
      // Supabase 직접 업데이트 사용
      const { data, error: updateError } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
      
      if (updateError) {
        console.error('프로필 업데이트 오류:', updateError)
        throw new Error(updateError.message)
      }

      console.log('프로필 업데이트 성공:', data)
      
      // 로컬 상태 업데이트
      setProfile(prev => ({ ...prev, ...updateData }))
      
      setSuccess('Profile updated successfully.')
      setIsEditing(false)
      
      setTimeout(() => setSuccess(''), 5000)
    } catch (error) {
      console.error('프로필 업데이트 오류:', error)
      setError(error.message || 'プロフィールの更新に失敗しました。')
    } finally {
      setProcessing(false)
    }
  }

  // 출금 신청 처리 함수
  const handleWithdrawSubmit = async () => {
    if (!withdrawForm.amount || !withdrawForm.paypalEmail || !withdrawForm.paypalName) {
      setError('Please fill in all required fields.')
      return
    }

    const requestAmount = parseInt(withdrawForm.amount)
    const currentPoints = profile?.points || 0

    if (requestAmount > currentPoints) {
      setError('Cannot withdraw more than available points.')
      return
    }

    if (requestAmount < 1000) {
      setError('Minimum withdrawal amount is 1,000 points.')
      return
    }

    try {
      setProcessing(true)
      setError('')

      // withdrawal_requests 테이블에 출금 신청 기록
      const { data: withdrawalData, error: withdrawalError } = await supabase
        .from('withdrawal_requests')
        .insert([{
          user_id: user.id,
          amount: requestAmount,
          paypal_email: withdrawForm.paypalEmail,
          paypal_name: withdrawForm.paypalName,
          reason: withdrawForm.reason || 'Point Withdrawal Request',
          status: 'pending',
          created_at: new Date().toISOString()
        }])
        .select()

      if (withdrawalError) {
        console.error('출금 신청 오류:', withdrawalError)
        throw new Error(withdrawalError.message)
      }

      console.log('출금 신청 성공:', withdrawalData)

      // 실제 사용자 프로필의 포인트 차감
      const newPoints = currentPoints - requestAmount
      const { error: profileUpdateError } = await supabase
        .from('user_profiles')
        .update({ points: newPoints })
        .eq('user_id', user.id)

      if (profileUpdateError) {
        console.error('프로필 포인트 업데이트 오류:', profileUpdateError)
        throw new Error('Failed to deduct points.')
      }

      // 포인트 차감 기록을 point_transactions에 추가 (출금 신청이 아닌 포인트 사용으로 기록)
      const { error: pointError } = await supabase
        .from('point_transactions')
        .insert([{
          user_id: user.id,
          amount: -requestAmount,
          transaction_type: 'spent',
          description: 'Points used: Withdrawal request',
          created_at: new Date().toISOString()
        }])

      if (pointError) {
        console.warn('포인트 차감 기록 실패:', pointError)
        // 포인트 기록 실패는 치명적이지 않으므로 계속 진행
      }
      
      setSuccess('Withdrawal request submitted. It will be processed after admin review.')
      setShowWithdrawModal(false)
      setWithdrawForm({
        amount: '',
        paypalEmail: '',
        paypalName: '',
        reason: ''
      })
      
      // 데이터를 다시 로드하여 최신 상태 반영
      await loadUserData()
      
      setTimeout(() => setSuccess(''), 5000)
    } catch (error) {
      console.error('출금 신청 오류:', error)
      setError(error.message || '出金申請中にエラーが発生しました。再度お試しください。')
    } finally {
      setProcessing(false)
    }
  }



  // SNS 업로드 모달에서 제출 처리
  const handleSnsUploadSubmit = async () => {
    try {
      if (!snsUploadForm.sns_upload_url || typeof snsUploadForm.sns_upload_url !== 'string' || !snsUploadForm.sns_upload_url.trim()) {
        setError(t.messages?.snsUrlRequired || 'SNS投稿URLを入力してください。')
        return
      }

      if (!selectedApplication) {
        setError('Selected application not found.')
        return
      }
      
      setProcessing(true)
      setError('')
      
      // URL 유효성 검사
      try {
        new URL(snsUploadForm.sns_upload_url)
      } catch (urlError) {
        setError('Please enter a valid URL.')
        setProcessing(false)
        return
      }
      
      // applications 테이블의 기존 컬럼 활용
      const updateData = {
        video_links: snsUploadForm.sns_upload_url, // SNS URL을 video_links에 저장
        additional_info: snsUploadForm.notes, // 추가 메모를 additional_info에 저장
        updated_at: new Date().toISOString()
      }
      
      const { error: updateError } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', selectedApplication.id)
        .eq('user_id', user.id) // 보안을 위해 user_id도 확인
      
      if (updateError) {
        console.error('Application update error:', updateError)
        throw new Error('Failed to update SNS post.')
      }
      
      // point_transactions 테이블에 포인트 신청 기록 추가
      try {
        const { error: pointError } = await supabase
          .from('point_transactions')
          .insert({
            user_id: user.id,
            campaign_id: selectedApplication.campaign_id,
            application_id: selectedApplication.id,
            transaction_type: 'pending',
            amount: 0, // 승인 전이므로 0
            description: `SNS 업로드 포인트 신청: ${snsUploadForm.sns_upload_url}`,
            created_at: new Date().toISOString()
          })
        
        if (pointError) {
          console.warn('포인트 신청 기록 추가 실패:', pointError)
          // 포인트 기록 실패는 치명적이지 않으므로 계속 진행
        }
      } catch (pointInsertError) {
        console.warn('Point transaction insert failed:', pointInsertError)
        // 포인트 기록 실패는 치명적이지 않으므로 계속 진행
      }
      
      setSuccess(t.messages?.snsUploadSubmitted || 'SNS upload and point request submitted successfully.')
      setShowSnsUploadModal(false)
      setSnsUploadForm({ sns_upload_url: '', notes: '' })
      setSelectedApplication(null)
      
      // 데이터 새로고침
      await loadUserData()
      
      setTimeout(() => setSuccess(''), 5000)
    } catch (error) {
      console.error('SNS 업로드 오류:', error)
      setError(error.message || 'An error occurred. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const openSnsUploadModal = (application) => {
    try {
      // 에러 상태 초기화
      setError('')
      setSuccess('')

      if (!application) {
        setError('Application information not found.')
        return
      }

      setSelectedApplication(application)
      setSnsUploadForm({
        sns_upload_url: application.video_links || '',
        notes: application.additional_info || ''
      })
      setShowSnsUploadModal(true)

      console.log('SNS 업로드 모달 열림:', application.id, application.campaign_title)
    } catch (error) {
      console.error('SNS 업로드 모달 열기 오류:', error)
      setError('Could not open modal.')
    }
  }

  // Toggle shooting guide expansion
  const toggleGuideExpand = (applicationId) => {
    setExpandedGuides(prev => ({
      ...prev,
      [applicationId]: !prev[applicationId]
    }))
  }

  // Check if application has personalized guide (stored in applications.personalized_guide)
  // Parse personalized_guide into unified format (3 types: ai_guide, external_url, external_pdf, text)
  const parseGuide = (personalized_guide) => {
    if (!personalized_guide) return null
    let guide = personalized_guide
    if (typeof guide === 'string') {
      try { guide = JSON.parse(guide) } catch {
        return { type: 'text', content: guide }
      }
    }
    if (guide.type === 'external_url') {
      return { type: 'external_url', url: guide.url, title: guide.title || 'Filming Guide' }
    }
    if (guide.type === 'external_pdf') {
      return { type: 'external_pdf', url: guide.fileUrl, fileName: guide.fileName, title: guide.title || 'Filming Guide' }
    }
    if (guide.scenes && Array.isArray(guide.scenes)) {
      return { type: 'ai_guide', scenes: guide.scenes, style: guide.dialogue_style, tempo: guide.tempo, mood: guide.mood }
    }
    return null
  }

  const hasShootingGuide = (application) => {
    // Check personalized_guide (all 3 types)
    const guide = parseGuide(application.personalized_guide)
    if (guide) return true
    // Check campaigns fields
    const c = application.campaigns
    if (!c) return false
    if (c.shooting_guide) return true
    if (c.ai_generated_guide) return true
    if (c.brand_name_en || c.product_name_en || c.product_description_en) return true
    if (c.required_dialogues_en?.length > 0 || c.required_scenes_en?.length > 0) return true
    if (c.video_duration_en || c.video_tempo_en || c.video_tone_en) return true
    if (c.google_drive_url || c.google_slides_url) return true
    if (c.requires_ad_code || c.requires_clean_video || c.meta_ad_code_requested) return true
    if (c.video_deadline || c.sns_deadline || c.end_date || c.application_deadline || c.posting_deadline) return true
    return false
  }

  // Open video upload modal
  const openVideoUploadModal = (application) => {
    setSelectedApplication(application)
    setVideoFile(null)
    setUploadProgress(0)
    setShowVideoUploadModal(true)
  }

  // Handle video file selection
  const handleVideoFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type (accept all video/* types)
    if (!file.type.startsWith('video/')) {
      setError('Please upload a valid video file')
      return
    }

    // Validate file size (max 2GB)
    const maxSize = 2 * 1024 * 1024 * 1024
    if (file.size > maxSize) {
      setError('File size must be less than 2GB')
      return
    }

    setError('')
    setVideoFile(file)
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Handle video submission with Supabase Storage upload
  const handleVideoSubmit = async () => {
    if (!videoFile) {
      setError('Please select a video file to upload.')
      return
    }

    try {
      setUploadingVideo(true)
      setError('')
      setUploadProgress(10)

      // Check if this is a 4-week challenge
      const is4WeekChallenge = selectedApplication?.campaigns?.campaign_type === '4week_challenge'

      // Determine version
      let version = 1
      try {
        const { data: existingSubs } = await supabase
          .from('video_submissions')
          .select('version')
          .eq('application_id', selectedApplication.id)
          .eq('week_number', is4WeekChallenge ? selectedWeekNumber : null)
          .order('version', { ascending: false })
          .limit(1)
        if (existingSubs && existingSubs.length > 0) {
          version = (existingSubs[0].version || 0) + 1
        }
      } catch (e) {
        console.warn('Could not fetch existing version:', e)
      }

      // Upload to Supabase Storage (videos bucket, spec path pattern)
      const timestamp = Date.now()
      const fileExt = videoFile.name.split('.').pop()
      const videoSlot = is4WeekChallenge ? `week${selectedWeekNumber}` : 'main'
      const fileName = `${videoSlot}_v${version}_${timestamp}.${fileExt}`
      const filePath = `${selectedApplication.campaign_id}/${selectedApplication.user_id}/${fileName}`

      setUploadProgress(30)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, videoFile, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)

      setUploadProgress(70)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath)

      const videoUrl = urlData.publicUrl

      setUploadProgress(80)

      // Insert into video_submissions table for version tracking
      try {
        await supabase.from('video_submissions').insert({
          campaign_id: selectedApplication.campaign_id,
          application_id: selectedApplication.id,
          user_id: user.id,
          video_number: is4WeekChallenge ? null : 1,
          week_number: is4WeekChallenge ? selectedWeekNumber : null,
          version: version,
          video_file_url: videoUrl,
          video_file_name: videoFile.name,
          video_file_size: videoFile.size,
          video_uploaded_at: new Date().toISOString(),
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
      } catch (e) {
        console.warn('video_submissions insert failed:', e)
      }

      setUploadProgress(90)

      // Update application record
      let updateData = {
        updated_at: new Date().toISOString()
      }

      if (is4WeekChallenge) {
        const weekUrlKey = `week${selectedWeekNumber}_url`
        updateData[weekUrlKey] = videoUrl
      } else {
        updateData.video_file_url = videoUrl
        updateData.video_file_name = videoFile.name
        updateData.video_file_size = videoFile.size
        updateData.video_uploaded_at = new Date().toISOString()
        updateData.status = 'video_submitted'
      }

      const { error: updateError } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', selectedApplication.id)

      if (updateError) throw updateError

      setUploadProgress(100)

      const successMessage = is4WeekChallenge
        ? `Week ${selectedWeekNumber} video uploaded successfully!`
        : 'Video uploaded successfully!'

      setSuccess(successMessage)
      setShowVideoUploadModal(false)
      setVideoFile(null)
      setSelectedWeekNumber(1)
      setUploadProgress(0)
      loadUserData()

      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Video upload error:', error)
      setError(error.message || 'Failed to upload video.')
    } finally {
      setUploadingVideo(false)
    }
  }

  // New modal handlers for campaign progress
  const handleViewGuide = (application, campaign) => {
    setSelectedApplication(application)
    setSelectedCampaign(campaign)
    setShowShootingGuideModal(true)
  }

  const handleUploadVideo = (application, campaign) => {
    setSelectedApplication(application)
    setSelectedCampaign(campaign)
    setShowVideoUploadModal(true)
  }

  const handleViewRevisions = (application) => {
    setSelectedApplication(application)
    setShowRevisionModal(true)
  }

  const handleSubmitSNS = (application, campaign) => {
    setSelectedApplication(application)
    setSelectedCampaign(campaign)
    setShowSNSSubmitModal(true)
  }

  // Handle video submission from new modal
  const handleNewVideoSubmit = async ({ applicationId, campaignId, userId, videoUrl, cleanVideoUrl, videoFileName, videoFileSize, version, weekNumber, is4Week }) => {
    try {
      // Insert into video_submissions table for version tracking
      try {
        await supabase.from('video_submissions').insert({
          campaign_id: campaignId || selectedApplication?.campaign_id,
          application_id: applicationId,
          user_id: userId || user.id,
          video_number: is4Week ? null : 1,
          week_number: weekNumber || null,
          version: version || 1,
          video_file_url: videoUrl,
          video_file_name: videoFileName || null,
          video_file_size: videoFileSize || null,
          video_uploaded_at: new Date().toISOString(),
          clean_video_url: cleanVideoUrl || null,
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
      } catch (e) {
        console.warn('video_submissions insert failed:', e)
      }

      let updateData = {
        updated_at: new Date().toISOString()
      }

      if (is4Week && weekNumber) {
        updateData[`week${weekNumber}_url`] = videoUrl
        updateData.status = 'video_submitted'
      } else {
        updateData.video_file_url = videoUrl
        updateData.video_file_name = videoFileName || null
        updateData.video_file_size = videoFileSize || null
        updateData.video_uploaded_at = new Date().toISOString()
        updateData.status = 'video_submitted'
      }

      if (cleanVideoUrl) {
        if (is4Week && weekNumber) {
          updateData[`week${weekNumber}_clean_video_url`] = cleanVideoUrl
        } else {
          updateData.clean_video_url = cleanVideoUrl
        }
      }

      const { error: updateError } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', applicationId)

      if (updateError) throw updateError

      const message = is4Week
        ? `Week ${weekNumber} video submitted successfully!`
        : 'Video submitted successfully!'

      setSuccess(message)
      loadUserData()
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Video submit error:', error)
      throw error
    }
  }

  // Handle SNS submission from new modal
  const handleNewSNSSubmit = async ({ applicationId, snsUrl, partnershipCode, cleanVideoUrl, weekNumber, is4Week }) => {
    try {
      let updateData = {
        updated_at: new Date().toISOString()
      }

      if (is4Week && weekNumber) {
        // 4-week challenge: store SNS URL per-week if column exists, also update main field
        updateData[`week${weekNumber}_sns_url`] = snsUrl
        updateData.sns_upload_url = snsUrl
      } else {
        updateData.sns_upload_url = snsUrl
        updateData.status = 'sns_uploaded'
      }

      if (partnershipCode) {
        if (is4Week && weekNumber) {
          updateData[`week${weekNumber}_partnership_code`] = partnershipCode
        } else {
          updateData.partnership_code = partnershipCode
        }
      }

      if (cleanVideoUrl) {
        if (is4Week && weekNumber) {
          updateData[`week${weekNumber}_clean_video_url`] = cleanVideoUrl
        } else {
          updateData.clean_video_url = cleanVideoUrl
        }
      }

      // Also update the video_submissions record if exists
      try {
        const { data: latestSub } = await supabase
          .from('video_submissions')
          .select('id')
          .eq('application_id', applicationId)
          .eq('week_number', is4Week ? weekNumber : null)
          .order('version', { ascending: false })
          .limit(1)

        if (latestSub && latestSub.length > 0) {
          await supabase.from('video_submissions').update({
            sns_upload_url: snsUrl,
            partnership_code: partnershipCode || null,
            clean_video_url: cleanVideoUrl || null,
            updated_at: new Date().toISOString()
          }).eq('id', latestSub[0].id)
        }
      } catch (e) {
        console.warn('video_submissions SNS update failed:', e)
      }

      const { error: updateError } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', applicationId)

      if (updateError) throw updateError

      const message = is4Week
        ? `Week ${weekNumber} SNS link submitted successfully!`
        : 'SNS link submitted successfully!'

      setSuccess(message)
      loadUserData()
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('SNS submit error:', error)
      throw error
    }
  }

  const handleWithdrawalSubmit = async () => {
    if (!withdrawalReason) {
      setError(t.messages.reasonRequired)
      return
    }
    
    const confirmTexts = { ko: '탈퇴합니다', ja: '退会します', en: 'DELETE' }
    if (confirmText !== (confirmTexts[language] || confirmTexts.en)) {
      setError(t.messages.confirmRequired)
      return
    }
    
    try {
      setProcessing(true)
      setError('')
      
      const { error } = await supabase
        .from('withdrawal_requests')
        .insert({
          user_id: user.id,
          reason: withdrawalReason,
          additional_info: withdrawalDetails,
          status: 'pending'
        })
      
      if (error) throw error
      
      setSuccess(t.messages.withdrawalSubmitted)
      setShowWithdrawalModal(false)
      setWithdrawalReason('')
      setWithdrawalDetails('')
      setConfirmText('')
      
      setTimeout(() => setSuccess(''), 5000)
      
    } catch (error) {
      console.error('탈퇴 신청 오류:', error)
      setError(t.messages.error)
    } finally {
      setProcessing(false)
    }
  }

  const getRoleBadge = (role) => {
    const badges = {
      user: 'bg-gray-100 text-gray-800',
      vip: 'bg-purple-100 text-purple-800',
      manager: 'bg-blue-100 text-blue-800',
      admin: 'bg-red-100 text-red-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[role] || badges.user}`}>
        {t.roles[role] || t.roles.user}
      </span>
    )
  }

  const getTransactionTypeColor = (type) => {
    const colors = {
      earn: 'text-green-600',
      bonus: 'text-blue-600',
      admin_add: 'text-purple-600',
      spend: 'text-red-600',
      admin_subtract: 'text-red-600'
    }
    return colors[type] || 'text-gray-600'
  }

  const getTransactionTypeText = (type) => {
    const types = {
      earn: t.earned,
      earned: t.earned,
      bonus: t.bonus,
      admin_add: t.bonus,
      spend: t.spent,
      spent: t.spent,
      admin_subtract: t.spent,
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      completed: 'Completed',
      reward: 'Reward'
    }
    return types[type] || type
  }

  // Computed dashboard metrics
  const totalEarnedAmount = pointTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)
  const totalWithdrawnAmount = withdrawals
    .reduce((sum, w) => sum + (w.amount || 0), 0)
  const completedCount = applications.filter(a => ['sns_uploaded', 'completed'].includes(a.status)).length
  const successRate = applications.length > 0
    ? Math.round((completedCount / applications.length) * 100)
    : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-slate-200 animate-pulse"></div>
            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm font-medium text-slate-500 tracking-wide">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation Bar */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-tight">Creator Dashboard</h1>
                <p className="text-xs text-slate-400">{profile?.email || user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.location.href = '/'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.goHome}</span>
              </button>
              <button
                onClick={signOut}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.logout}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Alert Messages */}
        {error && error !== t.messages?.error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-red-800">{error}</p>
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
          </div>
        )}
        {success && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-emerald-800">{success}</p>
            <button onClick={() => setSuccess('')} className="ml-auto text-emerald-400 hover:text-emerald-600"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Earnings Card - Premium Dark Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-5 sm:p-8 mb-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-600/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden ring-4 ring-white/10">
                  {(editForm.profile_image_url || profile?.profile_image_url) ? (
                    <img src={editForm.profile_image_url || profile?.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-2xl sm:text-3xl font-black">{profile?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-indigo-500 transition-colors ring-2 ring-slate-900">
                  {uploadingImage ? <Loader2 className="h-3.5 w-3.5 text-white animate-spin" /> : <Camera className="h-3.5 w-3.5 text-white" />}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
                </label>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight truncate">{profile?.name || 'Creator'}</h2>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    profile?.user_role === 'vip' ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30' :
                    profile?.user_role === 'admin' ? 'bg-red-500/20 text-red-300 ring-1 ring-red-500/30' :
                    profile?.user_role === 'manager' ? 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30' :
                    'bg-slate-500/20 text-slate-300 ring-1 ring-slate-500/30'
                  }`}>
                    {t.roles[profile?.user_role] || t.roles.user}
                  </span>
                </div>
                <p className="text-slate-400 text-sm mt-0.5">
                  Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '-'}
                </p>
              </div>
            </div>

            {/* Earnings Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 ring-1 ring-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Available Balance</p>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-white">{(profile?.points || 0).toLocaleString()}<span className="text-base font-medium text-slate-400 ml-1">P</span></p>
                <p className="text-xs text-slate-500 mt-1">= ${(profile?.points || 0).toLocaleString()} USD</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 ring-1 ring-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{t.totalEarned}</p>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-white">{totalEarnedAmount.toLocaleString()}<span className="text-base font-medium text-slate-400 ml-1">P</span></p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 ring-1 ring-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <ArrowUpRight className="w-4 h-4 text-amber-400" />
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{t.totalWithdrawn}</p>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-white">{totalWithdrawnAmount.toLocaleString()}<span className="text-base font-medium text-slate-400 ml-1">P</span></p>
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  {t.withdrawRequest}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 ring-1 ring-slate-200/60 hover:ring-indigo-200 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-xs font-medium text-slate-400">{t.totalApplications}</span>
            </div>
            <p className="text-2xl font-black text-slate-900">{applications.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 ring-1 ring-slate-200/60 hover:ring-amber-200 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-xs font-medium text-slate-400">In Progress</span>
            </div>
            <p className="text-2xl font-black text-slate-900">
              {applications.filter(a => ['selected', 'filming', 'video_submitted', 'revision_requested', 'approved'].includes(a.status)).length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 ring-1 ring-slate-200/60 hover:ring-emerald-200 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Target className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-xs font-medium text-slate-400">Success Rate</span>
            </div>
            <p className="text-2xl font-black text-slate-900">{successRate}<span className="text-base font-medium text-slate-400">%</span></p>
          </div>
          <div className="bg-white rounded-xl p-4 ring-1 ring-slate-200/60 hover:ring-purple-200 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-slate-400">{t.completedCampaigns}</span>
            </div>
            <p className="text-2xl font-black text-slate-900">{completedCount}</p>
          </div>
        </div>

        {/* Tab Navigation - Pill Style */}
        <div className="bg-white rounded-xl p-1.5 ring-1 ring-slate-200/60 mb-6 overflow-x-auto">
          <nav className="flex gap-1 min-w-max">
            {[
              { id: 'profile', label: t.profile, icon: User },
              { id: 'applications', label: t.applications, icon: Briefcase },
              { id: 'withdrawals', label: t.withdrawals, icon: CreditCard },
              { id: 'points', label: t.points, icon: BarChart3 },
              { id: 'settings', label: t.accountSettings, icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Personal Information Card */}
              <div className="bg-white rounded-xl ring-1 ring-slate-200/60 overflow-hidden">
                <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-base font-bold text-slate-900">{t.personalInfo}</h2>
                  </div>
                  <button
                    onClick={() => { if (isEditing) { handleProfileSave() } else { setIsEditing(true) } }}
                    disabled={processing}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all disabled:opacity-50 ${
                      isEditing
                        ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {processing ? t.processing : (isEditing ? t.save : t.edit)}
                  </button>
                </div>
                <div className="p-5 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t.name}</label>
                      {isEditing ? (
                        <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                      ) : (
                        <p className="text-sm font-medium text-slate-900">{profile?.name || 'Not Set'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t.email}</label>
                      <p className="text-sm font-medium text-slate-900">{profile?.email || user?.email}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t.phone}</label>
                      {isEditing ? (
                        <input type="tel" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="(555) 123-4567" />
                      ) : (
                        <p className="text-sm font-medium text-slate-900">{profile?.phone || 'Not Registered'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t.age}</label>
                      {isEditing ? (
                        <input type="number" value={editForm.age || ''} onChange={(e) => setEditForm({...editForm, age: e.target.value})}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="25" min="1" max="100" />
                      ) : (
                        <p className="text-sm font-medium text-slate-900">{profile?.age || 'Not Set'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t.region}</label>
                      {isEditing ? (
                        <input type="text" value={editForm.region || ''} onChange={(e) => setEditForm({...editForm, region: e.target.value})}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="New York" />
                      ) : (
                        <p className="text-sm font-medium text-slate-900">{profile?.region || 'Not Set'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t.skinType}</label>
                      {isEditing ? (
                        <select value={editForm.skin_type} onChange={(e) => setEditForm({...editForm, skin_type: e.target.value})}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                          <option value="">Select</option>
                          <option value="Dry">Dry</option>
                          <option value="Oily">Oily</option>
                          <option value="Combination">Combination</option>
                          <option value="Sensitive">Sensitive</option>
                          <option value="Normal">Normal</option>
                        </select>
                      ) : (
                        <p className="text-sm font-medium text-slate-900">{profile?.skin_type || 'Not Set'}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t.bio}</label>
                      {isEditing ? (
                        <textarea value={editForm.bio || ''} onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          rows="2" placeholder="Enter your bio..." />
                      ) : (
                        <p className="text-sm font-medium text-slate-900">{profile?.bio || 'Not Set'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Accounts Card */}
              <div className="bg-white rounded-xl ring-1 ring-slate-200/60 overflow-hidden">
                <div className="flex items-center gap-2 px-5 sm:px-6 py-4 border-b border-slate-100">
                  <Globe className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-base font-bold text-slate-900">Social Accounts</h2>
                </div>
                <div className="p-5 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                      { label: 'Instagram', key: 'instagram_url', placeholder: 'https://instagram.com/username', color: 'from-pink-500 to-purple-500' },
                      { label: 'TikTok', key: 'tiktok_url', placeholder: 'https://tiktok.com/@username', color: 'from-slate-900 to-slate-700' },
                      { label: 'YouTube', key: 'youtube_url', placeholder: 'https://youtube.com/@username', color: 'from-red-500 to-red-600' },
                      { label: 'Other SNS', key: 'other_sns_url', placeholder: 'https://other-sns.com/username', color: 'from-blue-500 to-blue-600' }
                    ].map((sns) => (
                      <div key={sns.key} className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${sns.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <Globe className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{sns.label}</label>
                          {isEditing ? (
                            <input type="url" value={editForm[sns.key]} onChange={(e) => setEditForm({...editForm, [sns.key]: e.target.value})}
                              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              placeholder={sns.placeholder} />
                          ) : (
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {profile?.[sns.key] ? (
                                <a href={profile[sns.key]} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500 flex items-center gap-1">
                                  {profile[sns.key].replace(/^https?:\/\/(www\.)?/, '')}
                                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                </a>
                              ) : <span className="text-slate-400">Not Connected</span>}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Audience Metrics Card */}
              <div className="bg-white rounded-xl ring-1 ring-slate-200/60 overflow-hidden">
                <div className="flex items-center gap-2 px-5 sm:px-6 py-4 border-b border-slate-100">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-base font-bold text-slate-900">Audience Metrics</h2>
                </div>
                <div className="p-5 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: t.instagramFollowers, key: 'instagram_followers', icon: 'IG', color: 'bg-gradient-to-br from-pink-500 to-purple-500' },
                      { label: t.tiktokFollowers, key: 'tiktok_followers', icon: 'TT', color: 'bg-gradient-to-br from-slate-900 to-slate-700' },
                      { label: t.youtubeSubscribers, key: 'youtube_subscribers', icon: 'YT', color: 'bg-gradient-to-br from-red-500 to-red-600' }
                    ].map((metric) => (
                      <div key={metric.key} className="bg-slate-50 rounded-xl p-4 ring-1 ring-slate-200/60">
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`w-8 h-8 rounded-lg ${metric.color} flex items-center justify-center`}>
                            <span className="text-xs font-black text-white">{metric.icon}</span>
                          </div>
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{metric.label}</span>
                        </div>
                        {isEditing ? (
                          <input type="number" value={editForm[metric.key]} onChange={(e) => setEditForm({...editForm, [metric.key]: e.target.value})}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="0" min="0" />
                        ) : (
                          <p className="text-2xl font-black text-slate-900">
                            {profile?.[metric.key] ? profile[metric.key].toLocaleString() : <span className="text-slate-300 text-lg">--</span>}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="space-y-6">
              {/* Active Campaigns Section */}
              {applications.filter(a => ['selected', 'filming', 'video_submitted', 'revision_requested', 'approved', 'sns_uploaded', 'completed'].includes(a.status)).length > 0 && (
                <div className="bg-white rounded-xl ring-1 ring-slate-200/60 overflow-hidden">
                  <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-indigo-600" />
                      <h2 className="text-base font-bold text-slate-900">Active Campaigns</h2>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                        {applications.filter(a => ['selected', 'filming', 'video_submitted', 'revision_requested', 'approved', 'sns_uploaded', 'completed'].includes(a.status)).length}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 sm:p-6 space-y-4">
                    {applications
                      .filter(a => ['selected', 'filming', 'video_submitted', 'revision_requested', 'approved', 'sns_uploaded', 'completed'].includes(a.status))
                      .map((application) => (
                        <CampaignWorkflowStepper
                          key={application.id}
                          application={application}
                          campaign={application.campaigns}
                          onViewGuide={handleViewGuide}
                          onUploadVideo={handleUploadVideo}
                          onSubmitSNS={handleSubmitSNS}
                          onViewRevisions={handleViewRevisions}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* Pending Applications Section */}
              <div className="bg-white rounded-xl ring-1 ring-slate-200/60 overflow-hidden">
                <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    <h2 className="text-base font-bold text-slate-900">Pending Applications</h2>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                      {applications.filter(a => a.status === 'pending').length}
                    </span>
                  </div>
                </div>
                <div className="p-5 sm:p-6">

              <div className="space-y-4">
                {applications.filter(a => !['selected', 'filming', 'video_submitted', 'revision_requested', 'approved', 'sns_uploaded', 'completed'].includes(a.status)).length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <p className="text-sm font-medium text-slate-400">{t.noData}</p>
                  </div>
                ) : (
                  applications.filter(a => !['selected', 'filming', 'video_submitted', 'revision_requested', 'approved', 'sns_uploaded', 'completed'].includes(a.status)).map((application) => {
                    // Get campaign type
                    const campaignType = application.campaigns?.campaign_type || 'regular'
                    const is4WeekChallenge = campaignType === '4week_challenge'

                    // Get effective deadlines (custom_deadlines override default)
                    const getEffectiveDeadline = (weekNum, deadlineType) => {
                      const customDeadlines = application.custom_deadlines || {}
                      const customKey = `week${weekNum}_${deadlineType}`
                      if (customDeadlines[customKey]) {
                        return customDeadlines[customKey]
                      }
                      // Fall back to campaign default
                      return application.campaigns?.[customKey]
                    }

                    // Check weekly submissions for 4-week challenge
                    const getWeeklySubmissions = () => {
                      if (!is4WeekChallenge) return []
                      const submissions = []
                      for (let i = 1; i <= 4; i++) {
                        const videoKey = `week${i}_url`
                        const snsKey = `week${i}_sns_url`
                        submissions.push({
                          week: i,
                          videoUrl: application[videoKey] || null,
                          snsUrl: application[snsKey] || null,
                          deadline: getEffectiveDeadline(i, 'deadline'),
                          snsDeadline: getEffectiveDeadline(i, 'sns_deadline')
                        })
                      }
                      return submissions
                    }

                    const weeklySubmissions = getWeeklySubmissions()

                    return (
                    <div key={application.id} className="rounded-xl ring-1 ring-slate-200/60 overflow-hidden hover:ring-indigo-200 transition-all">
                      {/* Campaign Header */}
                      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 to-white flex justify-between items-start gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                              {application.campaigns?.title_en || application.campaigns?.title || application.campaign_title || 'Campaign'}
                            </h3>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              is4WeekChallenge ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                            }`}>
                              {is4WeekChallenge ? '4-Week' : 'Standard'}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-indigo-600">{application.campaigns?.brand_en || application.campaigns?.brand}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            Applied {new Date(application.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${
                          application.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          application.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          application.status === 'completed' ? 'bg-indigo-100 text-indigo-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {application.status === 'approved' ? 'Approved' :
                           application.status === 'rejected' ? 'Rejected' :
                           application.status === 'completed' ? 'Completed' :
                           'Pending'}
                        </span>
                      </div>

                      {/* Approved Campaign Content */}
                      {(application.status === 'approved' || application.status === 'completed') && (
                        <div className="p-4 sm:p-5 border-t border-slate-100">
                          {/* SNS Upload Warning */}
                          <div className="mb-4 p-3 bg-amber-50 rounded-xl ring-1 ring-amber-200/60">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-amber-700">
                                <span className="font-bold">Important:</span> Before uploading to SNS, please ensure your video has been reviewed and approved.
                              </p>
                            </div>
                          </div>

                          {/* 4-Week Challenge Progress Section */}
                          {is4WeekChallenge && (
                            <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                              <h4 className="font-semibold text-orange-800 mb-3 flex items-center">
                                📅 Weekly Submission Progress
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {weeklySubmissions.map((week) => {
                                  const isVideoSubmitted = !!week.videoUrl
                                  const isSnsSubmitted = !!week.snsUrl
                                  const deadlineDate = week.deadline ? new Date(week.deadline) : null
                                  const isOverdue = deadlineDate && deadlineDate < new Date() && !isVideoSubmitted

                                  return (
                                    <div
                                      key={week.week}
                                      className={`p-3 rounded-lg border ${
                                        isVideoSubmitted && isSnsSubmitted ? 'bg-green-50 border-green-200' :
                                        isVideoSubmitted ? 'bg-blue-50 border-blue-200' :
                                        isOverdue ? 'bg-red-50 border-red-200' :
                                        'bg-white border-gray-200'
                                      }`}
                                    >
                                      <div className="font-medium text-sm mb-1">Week {week.week}</div>

                                      {/* Deadline */}
                                      {week.deadline && (
                                        <div className={`text-xs mb-2 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                                          Due: {new Date(week.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                          {isOverdue && ' (Overdue)'}
                                        </div>
                                      )}

                                      {/* Status Icons */}
                                      <div className="flex flex-col gap-1 text-xs">
                                        <div className={`flex items-center ${isVideoSubmitted ? 'text-green-600' : 'text-gray-400'}`}>
                                          {isVideoSubmitted ? '✅' : '⬜'} Video
                                        </div>
                                        <div className={`flex items-center ${isSnsSubmitted ? 'text-green-600' : 'text-gray-400'}`}>
                                          {isSnsSubmitted ? '✅' : '⬜'} SNS
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>

                              {/* Custom Deadlines Notice */}
                              {application.custom_deadlines && Object.keys(application.custom_deadlines).length > 0 && (
                                <div className="mt-3 text-xs text-orange-600 flex items-center">
                                  ℹ️ You have personalized deadlines. Check each week's due date above.
                                </div>
                              )}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {hasShootingGuide(application) && (
                              <button
                                onClick={() => toggleGuideExpand(application.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 ring-1 ring-indigo-200/60 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" /> Shooting Guide
                                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${expandedGuides[application.id] ? 'rotate-90' : ''}`} />
                              </button>
                            )}

                            <button
                              onClick={() => openVideoUploadModal(application)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm transition-colors"
                            >
                              <Camera className="w-3.5 h-3.5" /> {is4WeekChallenge ? 'Submit Weekly Video' : (application.video_file_url ? 'Update Video' : 'Submit Video')}
                            </button>

                            {application.video_file_url && !is4WeekChallenge && (
                              <a
                                href={application.video_file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 ring-1 ring-emerald-200/60 transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" /> View Video
                              </a>
                            )}
                          </div>

                          {/* Video Submission Status - Standard Campaign */}
                          {application.video_file_url && !is4WeekChallenge && (
                            <div className="flex items-center text-sm text-green-600 mb-4">
                              ✅ Video submitted on {new Date(application.video_uploaded_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </div>
                          )}

                          {/* Revision Request Alert */}
                          {application.revision_requested && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-sm text-red-800">
                                <strong>Revision Requested:</strong> {application.revision_notes || 'Please check with the brand for revision details.'}
                              </p>
                            </div>
                          )}

                          {/* Expandable Shooting Guide - Using personalized_guide from applications */}
                          {expandedGuides[application.id] && hasShootingGuide(application) && (() => {
                            const guideData = parseGuide(application.personalized_guide)
                            return (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                                Shooting Guide
                              </h4>

                              {/* External URL Guide */}
                              {guideData?.type === 'external_url' && guideData.url && (
                                <a
                                  href={guideData.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-md transition-all group mb-4"
                                >
                                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <ExternalLink className="w-6 h-6 text-purple-600" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-purple-800 text-sm">{guideData.title}</p>
                                    <p className="text-xs text-gray-500 mt-0.5 truncate">{guideData.url}</p>
                                  </div>
                                  <div className="flex-shrink-0 bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium">
                                    Open
                                  </div>
                                </a>
                              )}

                              {/* External PDF Guide */}
                              {guideData?.type === 'external_pdf' && guideData.url && (
                                <a
                                  href={guideData.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-indigo-200 hover:border-indigo-400 hover:shadow-md transition-all group mb-4"
                                >
                                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-6 h-6 text-indigo-600" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-indigo-800 text-sm">{guideData.title}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{guideData.fileName || 'PDF Guide'}</p>
                                  </div>
                                  <div className="flex-shrink-0 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium">
                                    Download
                                  </div>
                                </a>
                              )}

                              {/* Text Guide */}
                              {guideData?.type === 'text' && guideData.content && (
                                <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{guideData.content}</pre>
                                </div>
                              )}

                              {/* AI Guide - mood/tempo/style info */}
                              {guideData?.type === 'ai_guide' && (guideData.mood || guideData.tempo) && (
                                <div className="mb-4 p-3 bg-purple-50 rounded-lg flex flex-wrap gap-2">
                                  {guideData.mood && (
                                    <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded">
                                      Mood: {guideData.mood}
                                    </span>
                                  )}
                                  {guideData.tempo && (
                                    <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded">
                                      Tempo: {guideData.tempo}
                                    </span>
                                  )}
                                  {guideData.style && (
                                    <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded">
                                      Style: {guideData.style}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* AI Guide - Scenes */}
                              {guideData?.type === 'ai_guide' && guideData.scenes?.length > 0 && (
                                <div className="space-y-3">
                                  {guideData.scenes.map((scene, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                                      <div className="bg-gray-100 px-4 py-2 flex justify-between items-center">
                                        <h5 className="font-medium text-gray-800">
                                          Scene {scene.order || index + 1}: {scene.scene_type}
                                        </h5>
                                      </div>
                                      <div className="p-4 space-y-3">
                                        {(scene.scene_description_translated || scene.scene_description) && (
                                          <div>
                                            <h6 className="text-sm font-medium text-gray-700 mb-1">What to Film</h6>
                                            <p className="text-sm text-gray-600 pl-5">
                                              {scene.scene_description_translated || scene.scene_description}
                                            </p>
                                          </div>
                                        )}
                                        {(scene.dialogue_translated || scene.dialogue) && (
                                          <div>
                                            <h6 className="text-sm font-medium text-gray-700 mb-1">Script / What to Say</h6>
                                            <div className="bg-green-50 p-2 rounded pl-5">
                                              <p className="text-sm text-gray-700 italic">
                                                "{scene.dialogue_translated || scene.dialogue}"
                                              </p>
                                            </div>
                                          </div>
                                        )}
                                        {(scene.shooting_tip_translated || scene.shooting_tip) && (
                                          <div>
                                            <h6 className="text-sm font-medium text-gray-700 mb-1">Tips</h6>
                                            <p className="text-sm text-gray-600 pl-5">
                                              {scene.shooting_tip_translated || scene.shooting_tip}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Required Scenes & Dialogues (from personalized_guide) */}
                              {(application.personalized_guide?.required_scenes?.length > 0 ||
                                application.personalized_guide?.required_dialogues?.length > 0) && (
                                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                  <h5 className="font-medium text-amber-800 mb-2">Required Elements</h5>
                                  {application.personalized_guide?.required_scenes?.length > 0 && (
                                    <div className="mb-2">
                                      <p className="text-xs font-medium text-amber-700">Required Scenes:</p>
                                      <ul className="text-sm text-amber-800 list-disc pl-5">
                                        {application.personalized_guide.required_scenes.map((item, i) => (
                                          <li key={i}>{item}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {application.personalized_guide?.required_dialogues?.length > 0 && (
                                    <div>
                                      <p className="text-xs font-medium text-amber-700">Required Dialogues:</p>
                                      <ul className="text-sm text-amber-800 list-disc pl-5">
                                        {application.personalized_guide.required_dialogues.map((item, i) => (
                                          <li key={i}>{item}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            )
                          })()}

                          {/* No Guide Message */}
                          {!hasShootingGuide(application) && (
                            <p className="text-sm text-gray-500 italic">
                              Shooting guide will be available soon. Please check back later.
                            </p>
                          )}
                        </div>
                      )}

                      {/* Pending Status */}
                      {application.status === 'pending' && (
                        <div className="p-4 sm:p-5 border-t border-slate-100">
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                            <span>Your application is being reviewed. We'll notify you once a decision is made.</span>
                          </div>
                        </div>
                      )}

                      {/* Rejected Status */}
                      {application.status === 'rejected' && (
                        <div className="p-4 sm:p-5 border-t border-slate-100">
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <X className="h-4 w-4 text-red-400" />
                            <span>Unfortunately, your application was not selected for this campaign.</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )})
                )}
              </div>
              </div>
              </div>

              {/* SNS Posting Guidelines */}
              {applications.some(app => app.status === 'approved') && (
                <div className="bg-white rounded-xl ring-1 ring-amber-200/60 overflow-hidden">
                  <div className="p-5 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 mb-1">SNS Posting Guidelines</p>
                      <p className="text-xs text-slate-500">
                        Please upload to SNS only after your video has been reviewed and approved. Do not post immediately without approval.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'withdrawals' && (
            <div className="bg-white rounded-xl ring-1 ring-slate-200/60 overflow-hidden">
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-base font-bold text-slate-900">{t.withdrawalHistory}</h2>
                </div>
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  {t.withdrawRequest}
                </button>
              </div>
              <div className="p-5 sm:p-6">
                {withdrawals.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <p className="text-sm font-medium text-slate-400">{t.noData}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="px-3 sm:px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Method</th>
                          <th className="px-3 sm:px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.amount}</th>
                          <th className="px-3 sm:px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                          <th className="px-3 sm:px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Requested</th>
                          <th className="px-3 sm:px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Processed</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {withdrawals.map((withdrawal) => (
                          <tr key={withdrawal.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                                <Wallet className="w-4 h-4 text-indigo-500" /> PayPal
                              </span>
                            </td>
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm font-bold text-slate-900">
                              ${withdrawal.amount?.toLocaleString() || '0'}
                            </td>
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                withdrawal.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                withdrawal.status === 'approved' ? 'bg-indigo-100 text-indigo-700' :
                                withdrawal.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-amber-100 text-amber-700'
                              }`}>
                                {withdrawal.status === 'completed' ? 'Completed' :
                                 withdrawal.status === 'approved' ? 'Approved' :
                                 withdrawal.status === 'rejected' ? 'Rejected' :
                                 'Pending'}
                              </span>
                            </td>
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                              {new Date(withdrawal.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                              {withdrawal.processed_at ? new Date(withdrawal.processed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '--'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'points' && (
            <div className="bg-white rounded-xl ring-1 ring-slate-200/60 overflow-hidden">
              <div className="flex items-center gap-2 px-5 sm:px-6 py-4 border-b border-slate-100">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">{t.pointHistory}</h2>
              </div>
              <div className="p-5 sm:p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="px-3 sm:px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.transactionType}</th>
                        <th className="px-3 sm:px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.amount}</th>
                        <th className="px-3 sm:px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.description}</th>
                        <th className="px-3 sm:px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.date}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {pointTransactions.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-4 py-12 text-center">
                            <BarChart3 className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                            <p className="text-sm font-medium text-slate-400">{t.noData}</p>
                          </td>
                        </tr>
                      ) : (
                        pointTransactions.map((transaction) => (
                          <tr key={transaction.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                ['earn', 'earned', 'bonus', 'admin_add', 'reward'].includes(transaction.transaction_type)
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : ['spend', 'spent', 'admin_subtract'].includes(transaction.transaction_type)
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {getTransactionTypeText(transaction.transaction_type)}
                              </span>
                            </td>
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                              <span className={`text-sm font-bold ${transaction.amount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()}P
                              </span>
                            </td>
                            <td className="px-3 sm:px-4 py-3">
                              <div className="text-xs text-slate-500 max-w-xs truncate">{transaction.description || '--'}</div>
                            </td>
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                              {new Date(transaction.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl ring-1 ring-slate-200/60 overflow-hidden">
                <div className="flex items-center gap-2 px-5 sm:px-6 py-4 border-b border-slate-100">
                  <Settings className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-base font-bold text-slate-900">{t.accountSettings}</h2>
                </div>
                <div className="p-5 sm:p-6 space-y-6">
                  {/* Danger Zone */}
                  <div className="rounded-xl ring-1 ring-red-200 bg-red-50/50 p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-red-900">{t.accountDeletion}</h3>
                        <p className="mt-1 text-xs text-red-700/80">{t.deleteAccountWarning}</p>
                        <p className="mt-1 text-xs text-red-700/80">{t.deleteAccountDescription}</p>
                        <button
                          onClick={() => setShowWithdrawalModal(true)}
                          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-sm transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {t.deleteAccount}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Withdrawal Request Modal */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm overflow-y-auto h-full w-full z-[9999] flex items-start justify-center pt-16 sm:pt-24">
            <div className="mx-4 w-full max-w-md bg-white rounded-2xl shadow-2xl ring-1 ring-slate-200/60 overflow-hidden">
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{t.withdrawRequestTitle}</h3>
                  </div>
                  <button onClick={() => setShowWithdrawModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-50 rounded-xl ring-1 ring-red-200 text-xs font-medium text-red-700">{error}</div>
                )}
                {success && (
                  <div className="mb-4 p-3 bg-emerald-50 rounded-xl ring-1 ring-emerald-200 text-xs font-medium text-emerald-700">{success}</div>
                )}

                {/* Point value guide */}
                <div className="mb-5 p-3 bg-indigo-50 rounded-xl ring-1 ring-indigo-200/60">
                  <p className="text-xs font-bold text-indigo-900">1 Point = $1.00 USD</p>
                  <p className="text-[10px] text-indigo-600 mt-0.5">Withdrawals are processed via PayPal in USD</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t.withdrawAmount} *</label>
                    <input type="number" value={withdrawForm.amount} onChange={(e) => setWithdrawForm({...withdrawForm, amount: e.target.value})}
                      placeholder="Enter points to withdraw"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      max={profile?.points || 0} />
                    <p className="text-xs text-slate-400 mt-1.5">
                      Available: <span className="font-bold text-slate-600">{(profile?.points || 0).toLocaleString()}P</span>
                      {withdrawForm.amount && <span className="ml-2 font-bold text-emerald-600">(= ${parseInt(withdrawForm.amount || 0).toLocaleString()} USD)</span>}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t.paypalEmail} *</label>
                    <input type="email" value={withdrawForm.paypalEmail} onChange={(e) => setWithdrawForm({...withdrawForm, paypalEmail: e.target.value})}
                      placeholder="your-paypal@email.com"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t.paypalName} *</label>
                    <input type="text" value={withdrawForm.paypalName} onChange={(e) => setWithdrawForm({...withdrawForm, paypalName: e.target.value})}
                      placeholder="Your full name as registered on PayPal"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t.withdrawReason}</label>
                    <textarea value={withdrawForm.reason} onChange={(e) => setWithdrawForm({...withdrawForm, reason: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Reason for withdrawal (optional)" />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button onClick={() => setShowWithdrawModal(false)}
                    className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                    {t.cancel}
                  </button>
                  <button onClick={handleWithdrawSubmit} disabled={processing}
                    className="px-4 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 disabled:opacity-50 shadow-sm transition-colors">
                    {processing ? t.processing : t.submitWithdrawRequest}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Account Deletion Modal */}
        {showWithdrawalModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-16 sm:pt-24">
            <div className="mx-4 w-full max-w-md bg-white rounded-2xl shadow-2xl ring-1 ring-slate-200/60 overflow-hidden">
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{t.accountDeletion}</h3>
                  </div>
                  <button onClick={() => setShowWithdrawalModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t.withdrawalReason} *</label>
                    <select value={withdrawalReason} onChange={(e) => setWithdrawalReason(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent">
                      <option value="">Select a reason</option>
                      <option value="service">{t.reasons.service}</option>
                      <option value="privacy">{t.reasons.privacy}</option>
                      <option value="unused">{t.reasons.unused}</option>
                      <option value="other">{t.reasons.other}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t.withdrawalDetails}</label>
                    <textarea value={withdrawalDetails} onChange={(e) => setWithdrawalDetails(e.target.value)} rows={2}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Additional details (optional)" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t.confirmDeletion} *</label>
                    <p className="text-xs text-slate-500 mb-2">{t.confirmText}</p>
                    <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder={t.confirmPlaceholder}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-red-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button onClick={() => setShowWithdrawalModal(false)}
                    className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                    {t.cancel}
                  </button>
                  <button onClick={handleWithdrawalSubmit} disabled={processing}
                    className="px-4 py-2.5 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-500 disabled:opacity-50 shadow-sm transition-colors">
                    {processing ? t.processing : t.submitWithdrawal}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Video Upload Modal (inline - legacy, only shows when no campaign selected) */}
        {showVideoUploadModal && !selectedCampaign && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-10 sm:pt-20">
            <div className="mx-4 w-full max-w-md bg-white rounded-2xl shadow-2xl ring-1 ring-slate-200/60 overflow-hidden">
              <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <Camera className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {selectedApplication?.campaigns?.campaign_type === '4week_challenge' ? 'Upload Weekly Video' : 'Upload Video'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {selectedApplication?.campaigns?.campaign_type === '4week_challenge' ? '4-Week Challenge' : 'Standard Campaign'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowVideoUploadModal(false); setVideoFile(null); setSelectedWeekNumber(1); setUploadProgress(0) }}
                  disabled={uploadingVideo}
                  className="text-slate-400 hover:text-slate-600 disabled:opacity-50 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 rounded-xl ring-1 ring-red-200 text-xs font-medium text-red-700">{error}</div>
              )}

              <div className="space-y-4">
                {/* Week Selection for 4-Week Challenge */}
                {selectedApplication?.campaigns?.campaign_type === '4week_challenge' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Select Week *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map(week => {
                        const existingVideo = selectedApplication?.[`week${week}_url`]
                        const deadline = selectedApplication?.custom_deadlines?.[`week${week}_deadline`] || selectedApplication?.campaigns?.[`week${week}_deadline`]
                        const isSelected = selectedWeekNumber === week
                        return (
                          <button key={week} type="button" onClick={() => setSelectedWeekNumber(week)} disabled={uploadingVideo}
                            className={`p-3 rounded-xl text-center transition-all ring-1 ${
                              isSelected ? 'ring-2 ring-indigo-500 bg-indigo-50' : existingVideo ? 'ring-emerald-300 bg-emerald-50' : 'ring-slate-200 hover:ring-slate-300'
                            } disabled:opacity-50`}>
                            <div className="font-bold text-sm text-slate-900">Week {week}</div>
                            {deadline && <div className="text-[10px] text-slate-400 mt-0.5">{new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>}
                            {existingVideo && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mx-auto mt-1" />}
                          </button>
                        )
                      })}
                    </div>
                    {selectedApplication?.[`week${selectedWeekNumber}_url`] && (
                      <p className="mt-2 text-[10px] text-amber-600 font-medium">Week {selectedWeekNumber} already has a video. Uploading will replace it.</p>
                    )}
                  </div>
                )}

                {/* File Upload */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Video File *</label>
                  <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoFileSelect} className="hidden" disabled={uploadingVideo} />
                  {!videoFile ? (
                    <button type="button" onClick={() => videoInputRef.current?.click()} disabled={uploadingVideo}
                      className="w-full border-2 border-dashed border-slate-200 rounded-xl p-6 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all disabled:opacity-50 group">
                      <div className="flex flex-col items-center">
                        <Camera className="w-10 h-10 text-slate-300 group-hover:text-indigo-400 mb-2 transition-colors" />
                        <p className="text-sm font-semibold text-slate-600">Click to select video</p>
                        <p className="text-[10px] text-slate-400 mt-1">All video formats (max 2GB)</p>
                      </div>
                    </button>
                  ) : (
                    <div className="bg-emerald-50 rounded-xl p-4 ring-1 ring-emerald-200/60">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 truncate max-w-[200px]">{videoFile.name}</p>
                            <p className="text-[10px] text-slate-400">{formatFileSize(videoFile.size)}</p>
                          </div>
                        </div>
                        <button type="button" onClick={() => setVideoFile(null)} disabled={uploadingVideo} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Upload Progress */}
                {uploadingVideo && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Uploading...</span>
                      <span className="text-indigo-600 font-bold">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}

                {/* Tips */}
                <div className="p-3 bg-slate-50 rounded-xl ring-1 ring-slate-200/60">
                  <h4 className="text-xs font-bold text-slate-600 mb-1">Tips</h4>
                  <ul className="text-[10px] text-slate-400 space-y-0.5">
                    <li>Upload video in the highest quality possible</li>
                    <li>Supported: All video formats (max 2GB)</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => { setShowVideoUploadModal(false); setVideoFile(null); setUploadProgress(0) }}
                    disabled={uploadingVideo} className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleVideoSubmit} disabled={uploadingVideo || !videoFile}
                    className="px-4 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 disabled:opacity-50 shadow-sm flex items-center gap-2 transition-colors">
                    {uploadingVideo ? (<><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>) : (<><Camera className="w-4 h-4" /> Upload Video</>)}
                  </button>
                </div>
              </div>
              </div>
            </div>
          </div>
        )}

        {/* SNS Upload & Point Request Modal */}
        {showSnsUploadModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-16 sm:pt-24">
            <div className="mx-4 w-full max-w-md bg-white rounded-2xl shadow-2xl ring-1 ring-slate-200/60 overflow-hidden">
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{t.pointRequestTitle}</h3>
                  </div>
                  <button onClick={() => setShowSnsUploadModal(false)} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-5 h-5" /></button>
                </div>

                <div className="mb-5 p-3 bg-indigo-50 rounded-xl ring-1 ring-indigo-200/60">
                  <p className="text-xs text-indigo-700">{t.snsUploadDescription}</p>
                  {selectedApplication && (
                    <p className="text-xs text-indigo-900 mt-1.5 font-bold">Campaign: {selectedApplication.campaign_title}</p>
                  )}
                </div>

                {error && <div className="mb-4 p-3 bg-red-50 rounded-xl ring-1 ring-red-200 text-xs font-medium text-red-700">{error}</div>}
                {success && <div className="mb-4 p-3 bg-emerald-50 rounded-xl ring-1 ring-emerald-200 text-xs font-medium text-emerald-700">{success}</div>}

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t.snsUploadUrl} *</label>
                    <input type="url" value={snsUploadForm.sns_upload_url}
                      onChange={(e) => setSnsUploadForm({...snsUploadForm, sns_upload_url: e.target.value})}
                      placeholder="https://instagram.com/p/..."
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                    <p className="mt-1 text-[10px] text-slate-400">Instagram, TikTok, or YouTube post URL</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t.additionalNotes}</label>
                    <textarea value={snsUploadForm.notes}
                      onChange={(e) => setSnsUploadForm({...snsUploadForm, notes: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Additional information (optional)" />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button onClick={() => setShowSnsUploadModal(false)}
                    className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                    {t.cancel}
                  </button>
                  <button onClick={handleSnsUploadSubmit}
                    disabled={processing || !snsUploadForm.sns_upload_url || typeof snsUploadForm.sns_upload_url !== 'string' || !snsUploadForm.sns_upload_url.trim()}
                    className="px-4 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 disabled:opacity-50 shadow-sm transition-colors">
                    {processing ? t.processing : t.submitPointRequest}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New Shooting Guide Modal */}
        <ShootingGuideModal
          isOpen={showShootingGuideModal}
          onClose={() => setShowShootingGuideModal(false)}
          campaign={selectedCampaign}
          application={selectedApplication}
        />

        {/* New Revision Requests Modal */}
        <RevisionRequestsModal
          isOpen={showRevisionModal}
          onClose={() => setShowRevisionModal(false)}
          application={selectedApplication}
          onReupload={() => {
            setShowRevisionModal(false)
            handleUploadVideo(selectedApplication, selectedCampaign)
          }}
        />

        {/* New Video Upload Modal (from mypage components) */}
        <VideoUploadModal
          isOpen={showVideoUploadModal && selectedCampaign}
          onClose={() => {
            setShowVideoUploadModal(false)
            setSelectedCampaign(null)
          }}
          application={selectedApplication}
          campaign={selectedCampaign}
          onSubmit={handleNewVideoSubmit}
        />

        {/* New SNS Submit Modal */}
        <SNSSubmitModal
          isOpen={showSNSSubmitModal}
          onClose={() => setShowSNSSubmitModal(false)}
          application={selectedApplication}
          campaign={selectedCampaign}
          onSubmit={handleNewSNSSubmit}
        />
      </main>
    </div>
  )
}

export default MyPageWithWithdrawal
