import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { database, supabase } from '../lib/supabase'
import {
  User, Mail, Phone, MapPin, Calendar, Award,
  CreditCard, Download, Settings, LogOut,
  AlertTriangle, Trash2, Shield, Eye, EyeOff, X,
  Camera, Loader2
} from 'lucide-react'

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

      // 🚀 모든 데이터를 병렬로 로딩 (속도 대폭 향상)
      const [profileData, applicationsData, pointTransactionsResult] = await Promise.all([
        // 1. 프로필 정보
        database.userProfiles.get(user.id),
        // 2. 신청 내역
        database.applications.getByUser(user.id),
        // 3. 포인트 거래 내역 (출금 + 전체)
        supabase
          .from('point_transactions')
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

      // 신청 내역 설정
      setApplications(applicationsData || [])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
              <p className="mt-2 text-gray-600">
{`${profile?.name || user?.email}'s Account Information`}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => window.location.href = '/'}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {t.goHome}
              </button>
              <button
                onClick={signOut}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t.logout}
              </button>
            </div>
          </div>
        </div>

        {/* 알림 메시지 */}
        {error && error !== t.messages?.error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <Shield className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'profile', label: t.profile, icon: User },
                { id: 'applications', label: t.applications, icon: Award },
                { id: 'withdrawals', label: t.withdrawals, icon: CreditCard },
                { id: 'points', label: t.points, icon: Download },
                { id: 'settings', label: t.accountSettings, icon: Settings }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2 inline" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'profile' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">{t.personalInfo}</h2>
                <button
                  onClick={() => {
                    if (isEditing) {
                      handleProfileSave()
                    } else {
                      setIsEditing(true)
                    }
                  }}
                  disabled={processing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {processing ? t.processing : (isEditing ? t.save : t.edit)}
                </button>
              </div>
              
              {/* 성공/오류 메시지 */}
              {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-800">{success}</p>
                </div>
              )}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {/* Profile Photo Section */}
              <div className="mb-6 flex items-center gap-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                    {(editForm.profile_image_url || profile?.profile_image_url) ? (
                      <img
                        src={editForm.profile_image_url || profile?.profile_image_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-3xl font-bold">
                        {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-md">
                    {uploadingImage ? (
                      <Loader2 className="h-4 w-4 text-white animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4 text-white" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{profile?.name || 'Your Name'}</p>
                  <p className="text-sm text-gray-500">{profile?.email || user?.email}</p>
                  <p className="text-xs text-gray-400 mt-1">Click camera icon to upload photo</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.name}</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{profile?.name || 'Not Set'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.email}</label>
                    <p className="mt-1 text-sm text-gray-900">{profile?.email || user?.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t.phone}
                      <span className="text-xs text-gray-500 ml-1">(Optional)</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="(555) 123-4567"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{profile?.phone || 'Not Registered'}</p>
                    )}
                  </div>
                  
                  {/* 주소 필드는 데이터베이스 스키마 적용 후 활성화 */}
                  {/* 
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t.address}
                      <span className="text-xs text-gray-500 ml-1">(Optional)</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.address || ''}
                        onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={language === 'ja' ? '東京都渋谷区...' : '서울특별시 강남구...'}
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{profile?.address || '未登録'}</p>
                    )}
                  </div>
                  */}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.skinType}</label>
                    {isEditing ? (
                      <select
                        value={editForm.skin_type}
                        onChange={(e) => setEditForm({...editForm, skin_type: e.target.value})}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select</option>
                        <option value="Dry">Dry</option>
                        <option value="Oily">Oily</option>
                        <option value="Combination">Combination</option>
                        <option value="Sensitive">Sensitive</option>
                        <option value="Normal">Normal</option>
                      </select>
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{profile?.skin_type || 'Not Set'}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t.age}
                      <span className="text-xs text-gray-500 ml-1">(Optional)</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.age || ''}
                        onChange={(e) => setEditForm({...editForm, age: e.target.value})}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="25"
                        min="1"
                        max="100"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{profile?.age || 'Not Set'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t.region}
                      <span className="text-xs text-gray-500 ml-1">(Optional)</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.region || ''}
                        onChange={(e) => setEditForm({...editForm, region: e.target.value})}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="New York"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{profile?.region || 'Not Set'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t.bio}
                      <span className="text-xs text-gray-500 ml-1">(Optional)</span>
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editForm.bio || ''}
                        onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="2"
                        placeholder="Enter your bio..."
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{profile?.bio || 'Not Set'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.joinDate}</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.userRole}</label>
                    <div className="mt-1">{getRoleBadge(profile?.user_role)}</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.currentPoints}</label>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-lg font-semibold text-purple-600">
                        {profile?.points?.toLocaleString() || 0}P
                      </p>
                      <button
                        onClick={() => setShowWithdrawModal(true)}
                        className="ml-4 px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                      >
                        {t.withdrawRequest}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* SNS 주소 섹션 */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {'SNS Information'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Instagram</label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={editForm.instagram_url}
                        onChange={(e) => setEditForm({...editForm, instagram_url: e.target.value})}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://instagram.com/username"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">
                        {profile?.instagram_url ? (
                          <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {profile.instagram_url}
                          </a>
                        ) : 'Not Registered'}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">TikTok</label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={editForm.tiktok_url}
                        onChange={(e) => setEditForm({...editForm, tiktok_url: e.target.value})}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://tiktok.com/@username"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">
                        {profile?.tiktok_url ? (
                          <a href={profile.tiktok_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {profile.tiktok_url}
                          </a>
                        ) : 'Not Registered'}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">YouTube</label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={editForm.youtube_url}
                        onChange={(e) => setEditForm({...editForm, youtube_url: e.target.value})}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://youtube.com/@username"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">
                        {profile?.youtube_url ? (
                          <a href={profile.youtube_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {profile.youtube_url}
                          </a>
                        ) : 'Not Registered'}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Other SNS</label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={editForm.other_sns_url}
                        onChange={(e) => setEditForm({...editForm, other_sns_url: e.target.value})}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://other-sns.com/username"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">
                        {profile?.other_sns_url ? (
                          <a href={profile.other_sns_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {profile.other_sns_url}
                          </a>
                        ) : 'Not Registered'}
                      </p>
                    )}
                  </div>
                </div>
              </div>



              {/* SNS 팔로워 수 섹션 */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {'SNS Followers'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.instagramFollowers}</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.instagram_followers}
                        onChange={(e) => setEditForm({...editForm, instagram_followers: e.target.value})}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="1000"
                        min="0"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">
                        {profile?.instagram_followers ? profile.instagram_followers.toLocaleString() : 'Not Set'}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.tiktokFollowers}</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.tiktok_followers}
                        onChange={(e) => setEditForm({...editForm, tiktok_followers: e.target.value})}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="1000"
                        min="0"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">
                        {profile?.tiktok_followers ? profile.tiktok_followers.toLocaleString() : 'Not Set'}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.youtubeSubscribers}</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.youtube_subscribers}
                        onChange={(e) => setEditForm({...editForm, youtube_subscribers: e.target.value})}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="1000"
                        min="0"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">
                        {profile?.youtube_subscribers ? profile.youtube_subscribers.toLocaleString() : 'Not Set'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">{t.campaignApplications}</h2>
              
              {/* 신청 통계 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Award className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">{t.totalApplications}</p>
                      <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Shield className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">{t.approvedApplications}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {applications.filter(a => a.status === 'approved').length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Download className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">{t.completedCampaigns}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {applications.filter(a => a.submission_status === 'submitted').length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 신청 목록 */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {'キャンペーン'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {'ステータス'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {'応募日'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {'資料'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {applications.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                          {t.noData}
                        </td>
                      </tr>
                    ) : (
                      applications.map((application) => (
                        <tr key={application.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {application.campaign_title || ('キャンペーン情報なし')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              application.status === 'approved' ? 'bg-green-100 text-green-800' :
                              application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {application.status === 'approved' ? ('Approved') :
                               application.status === 'rejected' ? ('Rejected') :
                               ('Pending')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(application.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {application.status === 'approved' ? (
                              <div className="space-y-2">
                                <div className="flex flex-wrap gap-2">
                                  {application.google_drive_url && (
                                    <a
                                      href={application.google_drive_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                                    >
                                      📁 {'Google Drive'}
                                    </a>
                                  )}
                                  {application.google_slides_url && (
                                    <a
                                      href={application.google_slides_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                                    >
                                      📊 {'Google Slides'}
                                    </a>
                                  )}
                                </div>
                                
                                {/* SNS 업로드 및 포인트 신청 버튼 */}
                                <div className="mt-2">
                                  {/* video_links가 있고 point_transactions에 승인된 기록이 있으면 완료 상태 */}
                                  {application.video_links && pointTransactions.some(pt => 
                                    pt.application_id === application.id && pt.transaction_type === 'reward'
                                  ) ? (
                                    <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                                      ✅ {t.pointRequestApproved}
                                    </span>
                                  ) : application.video_links && pointTransactions.some(pt => 
                                    pt.application_id === application.id && pt.transaction_type === 'pending'
                                  ) ? (
                                    <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                                      ⏳ {t.pointRequestPending}
                                    </span>
                                  ) : (
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        openSnsUploadModal(application)
                                      }}
                                      type="button"
                                      className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                                    >
                                      📱 {t.snsUpload}
                                    </button>
                                  )}
                                </div>
                                
                                {(!application.google_drive_url && !application.google_slides_url) && (
                                  <span className="text-xs text-gray-400">
                                    {'資料準備中'}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* SNS 업로드 경고 메시지 */}
              {applications.some(app => app.status === 'approved') && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium mb-1">
                        {'⚠️ SNS Posting Guidelines'}
                      </p>
                      <p>
                        Please upload to SNS only after your video has been reviewed and approved. Do not post immediately without approval.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'withdrawals' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">{t.withdrawalHistory}</h2>
              
              {withdrawals.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4">{t.noData}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {'出金方法'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {'金額'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {'ステータス'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {'申請日'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {'処理日'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {withdrawals.map((withdrawal) => (
                        <tr key={withdrawal.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            PayPal
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${withdrawal.amount?.toLocaleString() || '0'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              withdrawal.status === 'completed' ? 'bg-green-100 text-green-800' :
                              withdrawal.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                              withdrawal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {withdrawal.status === 'completed' ? ('Completed') :
                               withdrawal.status === 'approved' ? ('Approved') :
                               withdrawal.status === 'rejected' ? ('Rejected') :
                               ('Pending')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(withdrawal.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {withdrawal.processed_at ?
                              new Date(withdrawal.processed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) :
                              '-'
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'points' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">{t.pointHistory}</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t.transactionType}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t.amount}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t.description}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t.date}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pointTransactions.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                          {t.noData}
                        </td>
                      </tr>
                    ) : (
                      pointTransactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${getTransactionTypeColor(transaction.transaction_type)}`}>
                              {getTransactionTypeText(transaction.transaction_type)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${
                              transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()}P
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {transaction.description || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(transaction.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* SNS 업로드 경고 메시지 */}
              {applications.some(app => app.status === 'approved') && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium mb-1">
                        {'⚠️ SNS Posting Guidelines'}
                      </p>
                      <p>
                        Please upload to SNS only after your video has been reviewed and approved. Do not post immediately without approval.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">{t.accountSettings}</h2>
              
              <div className="space-y-6">
                {/* 계정 삭제 섹션 */}
                <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                  <div className="flex items-start">
                    <AlertTriangle className="h-6 w-6 text-red-600 mt-1" />
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-medium text-red-900">{t.accountDeletion}</h3>
                      <p className="mt-2 text-sm text-red-700">
                        {t.deleteAccountWarning}
                      </p>
                      <p className="mt-2 text-sm text-red-700">
                        {t.deleteAccountDescription}
                      </p>
                      <div className="mt-4">
                        <button
                          onClick={() => setShowWithdrawalModal(true)}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
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

        {/* 출금 신청 모달 */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[9999]">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{t.withdrawRequestTitle}</h3>
                  <button
                    onClick={() => setShowWithdrawModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    {success}
                  </div>
                )}
                
                {/* Point value guide */}
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">
                    💰 1 Point = $1.00 USD
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Withdrawals are processed via PayPal in USD
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.withdrawAmount} *
                    </label>
                    <input
                      type="number"
                      value={withdrawForm.amount}
                      onChange={(e) => setWithdrawForm({...withdrawForm, amount: e.target.value})}
                      placeholder="Enter points to withdraw"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      max={profile?.points || 0}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Available Points: {profile?.points?.toLocaleString() || 0}P
                      {withdrawForm.amount && (
                        <span className="ml-2 text-green-600 font-medium">
                          (≈ ${parseInt(withdrawForm.amount || 0).toLocaleString()} USD)
                        </span>
                      )}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.paypalEmail} *
                    </label>
                    <input
                      type="email"
                      value={withdrawForm.paypalEmail}
                      onChange={(e) => setWithdrawForm({...withdrawForm, paypalEmail: e.target.value})}
                      placeholder="your-paypal@email.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.paypalName} *
                    </label>
                    <input
                      type="text"
                      value={withdrawForm.paypalName}
                      onChange={(e) => setWithdrawForm({...withdrawForm, paypalName: e.target.value})}
                      placeholder="Your full name as registered on PayPal"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.withdrawReason}
                    </label>
                    <textarea
                      value={withdrawForm.reason}
                      onChange={(e) => setWithdrawForm({...withdrawForm, reason: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Reason for withdrawal (optional)"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowWithdrawModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={handleWithdrawSubmit}
                    disabled={processing}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {processing ? t.processing : t.submitWithdrawRequest}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 회원 탈퇴 모달 */}
        {showWithdrawalModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{t.accountDeletion}</h3>
                  <button
                    onClick={() => setShowWithdrawalModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.withdrawalReason} *
                    </label>
                    <select
                      value={withdrawalReason}
                      onChange={(e) => setWithdrawalReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">사유를 선택하세요</option>
                      <option value="service">{t.reasons.service}</option>
                      <option value="privacy">{t.reasons.privacy}</option>
                      <option value="unused">{t.reasons.unused}</option>
                      <option value="other">{t.reasons.other}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.withdrawalDetails}
                    </label>
                    <textarea
                      value={withdrawalDetails}
                      onChange={(e) => setWithdrawalDetails(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="추가 설명이 있으시면 입력해주세요"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.confirmDeletion} *
                    </label>
                    <p className="text-sm text-gray-600 mb-2">{t.confirmText}</p>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder={t.confirmPlaceholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowWithdrawalModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={handleWithdrawalSubmit}
                    disabled={processing}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {processing ? t.processing : t.submitWithdrawal}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SNS 업로드 및 포인트 신청 모달 */}
        {showSnsUploadModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{t.pointRequestTitle}</h3>
                  <button
                    onClick={() => setShowSnsUploadModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    {t.snsUploadDescription}
                  </p>
                  {selectedApplication && (
                    <p className="text-sm text-blue-600 mt-2 font-medium">
                      캠페인: {selectedApplication.campaign_title}
                    </p>
                  )}
                </div>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}
                
                {success && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800">{success}</p>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.snsUploadUrl} *
                    </label>
                    <input
                      type="url"
                      value={snsUploadForm.sns_upload_url}
                      onChange={(e) => setSnsUploadForm({...snsUploadForm, sns_upload_url: e.target.value})}
                      placeholder="https://instagram.com/p/... or https://tiktok.com/@.../video/..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Enter the URL of your Instagram, TikTok, or YouTube post
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.additionalNotes}
                    </label>
                    <textarea
                      value={snsUploadForm.notes}
                      onChange={(e) => setSnsUploadForm({...snsUploadForm, notes: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter any additional information (optional)"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowSnsUploadModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={handleSnsUploadSubmit}
                    disabled={processing || !snsUploadForm.sns_upload_url || typeof snsUploadForm.sns_upload_url !== 'string' || !snsUploadForm.sns_upload_url.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {processing ? t.processing : t.submitPointRequest}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyPageWithWithdrawal
