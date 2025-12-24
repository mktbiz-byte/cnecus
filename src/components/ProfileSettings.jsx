import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { database, supabase } from '../lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  Loader2, Save, User, Lock, 
  Instagram, Youtube, Hash, Globe, CheckCircle,
  AlertCircle, Home, ArrowLeft
} from 'lucide-react'
import { Link } from 'react-router-dom'

const ProfileSettings = () => {
  const { user } = useAuth()
  const { language } = useLanguage()
  
  // Profile fields including shipping info
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    age: '',
    skin_type: '',
    phone_number: '',
    postal_code: '',
    address: '',
    instagram_url: '',
    youtube_url: '',
    tiktok_url: '',
    bio: ''
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Multi-language texts
  const texts = {
    en: {
      title: 'Profile Settings',
      subtitle: 'Manage your personal information and account settings',
      personalInfo: 'Personal Information',
      shippingInfo: 'Shipping Information',
      accountSettings: 'Account Settings',
      name: 'Full Name',
      email: 'Email',
      age: 'Age',
      skinType: 'Skin Type',
      phoneNumber: 'Phone Number',
      postalCode: 'Postal Code',
      address: 'Shipping Address',
      socialMedia: 'Social Media',
      instagramUrl: 'Instagram URL',
      youtubeUrl: 'YouTube URL',
      tiktokUrl: 'TikTok URL',
      bio: 'Bio',
      changePassword: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      save: 'Save Changes',
      saving: 'Saving...',
      backToHome: 'Back to Home',
      emailNote: 'Email cannot be changed',
      shippingNote: 'Used for product deliveries in campaigns',
      phonePlaceholder: 'e.g., 555-123-4567',
      postalPlaceholder: 'e.g., 90210',
      addressPlaceholder: 'Enter your full shipping address',
      skinTypes: {
        dry: 'Dry',
        oily: 'Oily',
        combination: 'Combination',
        sensitive: 'Sensitive',
        normal: 'Normal'
      },
      errors: {
        nameRequired: 'Please enter your name',
        loadError: 'Failed to load profile',
        saveError: 'Failed to save profile',
        passwordFields: 'Please fill in all password fields',
        passwordMismatch: 'New passwords do not match',
        passwordLength: 'Password must be at least 6 characters'
      },
      success: {
        profileSaved: 'Profile saved successfully!',
        passwordChanged: 'Password changed successfully!'
      }
    },
    ko: {
      title: '프로필 설정',
      subtitle: '개인정보 및 계정 설정을 관리하세요',
      personalInfo: '개인정보',
      shippingInfo: '배송 정보',
      accountSettings: '계정 설정',
      name: '이름',
      email: '이메일',
      age: '나이',
      skinType: '피부 타입',
      phoneNumber: '연락처',
      postalCode: '우편번호',
      address: '배송 주소',
      socialMedia: '소셜 미디어',
      instagramUrl: '인스타그램 URL',
      youtubeUrl: '유튜브 URL',
      tiktokUrl: '틱톡 URL',
      bio: '자기소개',
      changePassword: '비밀번호 변경',
      currentPassword: '현재 비밀번호',
      newPassword: '새 비밀번호',
      confirmPassword: '비밀번호 확인',
      save: '저장',
      saving: '저장 중...',
      backToHome: '홈으로 돌아가기',
      emailNote: '이메일은 변경할 수 없습니다',
      shippingNote: '캠페인 제품 배송에 사용됩니다',
      phonePlaceholder: '예: 010-1234-5678',
      postalPlaceholder: '예: 12345',
      addressPlaceholder: '상세 주소를 입력하세요',
      skinTypes: {
        dry: '건성',
        oily: '지성',
        combination: '복합성',
        sensitive: '민감성',
        normal: '보통'
      },
      errors: {
        nameRequired: '이름을 입력해주세요',
        loadError: '프로필을 불러오는데 실패했습니다',
        saveError: '프로필 저장에 실패했습니다',
        passwordFields: '모든 비밀번호 필드를 입력해주세요',
        passwordMismatch: '새 비밀번호가 일치하지 않습니다',
        passwordLength: '비밀번호는 최소 6자 이상이어야 합니다'
      },
      success: {
        profileSaved: '프로필이 저장되었습니다!',
        passwordChanged: '비밀번호가 변경되었습니다!'
      }
    }
  }

  const t = texts[language] || texts.en

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      setLoading(true)
      console.log('프로필 로드 시작, 사용자 ID:', user?.id)
      
      const profileData = await database.userProfiles.get(user.id)
      console.log('로드된 프로필 데이터:', profileData)
      
      if (profileData) {
        setProfile({
          name: profileData.name || '',
          email: profileData.email || user.email || '',
          age: profileData.age || '',
          skin_type: profileData.skin_type || '',
          phone_number: profileData.phone_number || '',
          postal_code: profileData.postal_code || '',
          address: profileData.address || '',
          instagram_url: profileData.instagram_url || '',
          youtube_url: profileData.youtube_url || '',
          tiktok_url: profileData.tiktok_url || '',
          bio: profileData.bio || ''
        })
      } else {
        setProfile(prev => ({
          ...prev,
          email: user.email || ''
        }))
      }
    } catch (error) {
      console.error('프로필 로드 오류:', error)
      setError('프로필을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      if (!profile.name.trim()) {
        setError('이름을 입력해주세요.')
        return
      }

      console.log('프로필 저장 시작:', profile)

      // Profile data including shipping info
      const profileData = {
        user_id: user.id,
        name: profile.name.trim(),
        email: profile.email.trim(),
        age: profile.age ? parseInt(profile.age) : null,
        skin_type: profile.skin_type || null,
        phone_number: profile.phone_number?.trim() || null,
        postal_code: profile.postal_code?.trim() || null,
        address: profile.address?.trim() || null,
        instagram_url: profile.instagram_url.trim() || null,
        youtube_url: profile.youtube_url.trim() || null,
        tiktok_url: profile.tiktok_url.trim() || null,
        bio: profile.bio.trim() || null
      }

      console.log('저장할 프로필 데이터:', profileData)

      const result = await database.userProfiles.upsert(profileData)
      console.log('프로필 저장 결과:', result)

      setSuccess('프로필이 성공적으로 저장되었습니다.')
      
      // 성공 메시지를 3초 후에 자동으로 숨김
      setTimeout(() => {
        setSuccess('')
      }, 3000)

    } catch (error) {
      console.error('프로필 저장 오류:', error)
      setError(`프로필 저장에 실패했습니다: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        setError('모든 비밀번호 필드를 입력해주세요.')
        return
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('새 비밀번호가 일치하지 않습니다.')
        return
      }

      if (passwordData.newPassword.length < 6) {
        setError('새 비밀번호는 최소 6자 이상이어야 합니다.')
        return
      }

      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      setSuccess('비밀번호가 성공적으로 변경되었습니다.')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })

      // 성공 메시지를 3초 후에 자동으로 숨김
      setTimeout(() => {
        setSuccess('')
      }, 3000)

    } catch (error) {
      console.error('비밀번호 변경 오류:', error)
      setError(`비밀번호 변경에 실패했습니다: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link 
              to="/" 
              className="flex items-center text-purple-600 hover:text-purple-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              {t.backToHome}
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-600 mt-2">{t.subtitle}</p>
        </div>

        {/* Success/Error Messages */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Info Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                {t.personalInfo}
              </CardTitle>
              <CardDescription>
                {t.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 이름 */}
              <div className="space-y-2">
                <Label htmlFor="name">{t.name}</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t.name}
                />
              </div>

              {/* 이메일 */}
              <div className="space-y-2">
                <Label htmlFor="email">{t.email}</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  placeholder={t.email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-sm text-gray-500">
                  {t.emailNote}
                </p>
              </div>

              {/* 나이 */}
              <div className="space-y-2">
                <Label htmlFor="age">{t.age}</Label>
                <Input
                  id="age"
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile(prev => ({ ...prev, age: e.target.value }))}
                  placeholder={t.age}
                  min="1"
                  max="120"
                />
              </div>

              {/* 피부 타입 */}
              <div className="space-y-2">
                <Label htmlFor="skin_type">{t.skinType}</Label>
                <Select
                  value={profile.skin_type}
                  onValueChange={(value) => setProfile(prev => ({ ...prev, skin_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t.skinType} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dry">{t.skinTypes.dry}</SelectItem>
                    <SelectItem value="oily">{t.skinTypes.oily}</SelectItem>
                    <SelectItem value="combination">{t.skinTypes.combination}</SelectItem>
                    <SelectItem value="sensitive">{t.skinTypes.sensitive}</SelectItem>
                    <SelectItem value="normal">{t.skinTypes.normal}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Shipping Information */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium flex items-center">
                    <Home className="h-5 w-5 mr-2" />
                    {t.shippingInfo}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{t.shippingNote}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">{t.phoneNumber}</Label>
                    <Input
                      id="phone_number"
                      type="tel"
                      value={profile.phone_number}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone_number: e.target.value }))}
                      placeholder={t.phonePlaceholder}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postal_code">{t.postalCode}</Label>
                    <Input
                      id="postal_code"
                      value={profile.postal_code}
                      onChange={(e) => setProfile(prev => ({ ...prev, postal_code: e.target.value }))}
                      placeholder={t.postalPlaceholder}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">{t.address}</Label>
                  <Textarea
                    id="address"
                    value={profile.address}
                    onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                    placeholder={t.addressPlaceholder}
                    rows={2}
                  />
                </div>
              </div>

              <Separator />

              {/* Social Media */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  {t.socialMedia}
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="instagram_url" className="flex items-center">
                    <Instagram className="h-4 w-4 mr-2" />
                    {t.instagramUrl}
                  </Label>
                  <Input
                    id="instagram_url"
                    value={profile.instagram_url}
                    onChange={(e) => setProfile(prev => ({ ...prev, instagram_url: e.target.value }))}
                    placeholder="https://instagram.com/username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtube_url" className="flex items-center">
                    <Youtube className="h-4 w-4 mr-2" />
                    {t.youtubeUrl}
                  </Label>
                  <Input
                    id="youtube_url"
                    value={profile.youtube_url}
                    onChange={(e) => setProfile(prev => ({ ...prev, youtube_url: e.target.value }))}
                    placeholder="https://youtube.com/@username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiktok_url" className="flex items-center">
                    <Hash className="h-4 w-4 mr-2" />
                    {t.tiktokUrl}
                  </Label>
                  <Input
                    id="tiktok_url"
                    value={profile.tiktok_url}
                    onChange={(e) => setProfile(prev => ({ ...prev, tiktok_url: e.target.value }))}
                    placeholder="https://tiktok.com/@username"
                  />
                </div>
              </div>

              <Separator />

              {/* 자기소개 */}
              <div className="space-y-2">
                <Label htmlFor="bio">{t.bio}</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder={t.bio}
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t.saving}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t.save}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Account Settings Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                {t.accountSettings}
              </CardTitle>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{t.changePassword}</h3>

                <div className="space-y-2">
                  <Label htmlFor="currentPassword">{t.currentPassword}</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder={t.currentPassword}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t.newPassword}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder={t.newPassword}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder={t.confirmPassword}
                  />
                </div>

                <Button 
                  onClick={handleChangePassword}
                  disabled={saving}
                  variant="outline"
                  className="w-full"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {t.saving}
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      {t.changePassword}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ProfileSettings
