import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { database } from '../lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowLeft, User, Mail, Instagram, Youtube, Hash, Calendar, Palette } from 'lucide-react'

const CampaignApplicationPage = () => {
  const { user, userProfile } = useAuth()
  const { language, t } = useLanguage()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  const campaignId = searchParams.get('campaign_id')
  
  const [campaign, setCampaign] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    skin_type: '',
    age: '',
    instagram_url: '',
    instagram_followers: '',
    tiktok_url: '',
    tiktok_followers: '',
    youtube_url: '',
    youtube_followers: '',
    answers: {}
  })

  useEffect(() => {
    if (!user) {
      navigate('/login', { 
        state: { from: { pathname: `/campaign-application?campaign_id=${campaignId}` } }
      })
      return
    }

    if (!campaignId) {
      navigate('/')
      return
    }

    loadCampaign()
  }, [campaignId, user, navigate])

  useEffect(() => {
    // 사용자 정보로 폼 초기화
    if (user && userProfile) {
      setFormData(prev => ({
        ...prev,
        user_name: userProfile.name || user.user_metadata?.name || '',
        user_email: user.email || '',
        skin_type: userProfile.skin_type || '',
        age: userProfile.age || '',
        instagram_url: userProfile.instagram_url || '',
        instagram_followers: userProfile.instagram_followers || '',
        tiktok_url: userProfile.tiktok_url || '',
        tiktok_followers: userProfile.tiktok_followers || '',
        youtube_url: userProfile.youtube_url || '',
        youtube_followers: userProfile.youtube_followers || ''
      }))
    }
  }, [user, userProfile])

  const loadCampaign = async () => {
    try {
      setLoading(true)
      setError('')
      
      const campaignData = await database.campaigns.getById(campaignId)
      setCampaign(campaignData)
      
      // 캠페인 질문들로 answers 초기화 (개별 질문 필드 사용)
      const initialAnswers = {}
      if (campaignData.question1) initialAnswers['1'] = ''
      if (campaignData.question2) initialAnswers['2'] = ''
      if (campaignData.question3) initialAnswers['3'] = ''
      if (campaignData.question4) initialAnswers['4'] = ''
      
      setFormData(prev => ({
        ...prev,
        answers: initialAnswers
      }))
    } catch (error) {
      console.error('Load campaign error:', error)
      setError('Unable to load campaign information.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAnswerChange = (questionId, value) => {
    setFormData(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: value
      }
    }))
  }

  const validateForm = () => {
    const required = ['user_name', 'user_email', 'skin_type', 'age']
    
    for (const field of required) {
      if (!formData[field]) {
        return 'Please fill in all required fields.'
      }
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.user_email)) {
      return 'Please enter a valid email address.'
    }

    // 나이 검증
    const age = parseInt(formData.age)
    if (isNaN(age) || age < 13 || age > 100) {
      return 'Please enter a valid age (13-100 years old).'
    }

    // 캠페인 질문 답변 검증 (개별 질문 필드 사용)
    for (let i = 1; i <= 4; i++) {
      const question = campaign?.[`question${i}`]
      const answer = formData.answers[i.toString()]
      
      if (question && !answer) {
        return 'Please answer all required questions.'
      }
    }

    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const applicationData = {
        campaign_id: parseInt(campaignId),
        user_id: user.id,
        user_name: formData.user_name,
        user_email: formData.user_email,
        skin_type: formData.skin_type,
        age: parseInt(formData.age),
        instagram_url: formData.instagram_url || null,
        instagram_followers: formData.instagram_followers ? parseInt(formData.instagram_followers) : null,
        tiktok_url: formData.tiktok_url || null,
        tiktok_followers: formData.tiktok_followers ? parseInt(formData.tiktok_followers) : null,
        youtube_url: formData.youtube_url || null,
        youtube_followers: formData.youtube_followers ? parseInt(formData.youtube_followers) : null,
        answers: formData.answers,
        status: 'pending'
      }

      await database.applications.create(applicationData)
      
      setSuccess(true)
      
      // 3초 후 마이페이지로 이동
      setTimeout(() => {
        navigate('/mypage')
      }, 3000)
      
    } catch (error) {
      console.error('Submit application error:', error)
      setError('An error occurred while submitting. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const getPlatformBadge = (platform) => {
    const platformStyles = {
      instagram: 'bg-pink-100 text-pink-800',
      tiktok: 'bg-purple-100 text-purple-800',
      youtube: 'bg-red-100 text-red-800',
      twitter: 'bg-blue-100 text-blue-800'
    }
    
    return (
      <Badge className={platformStyles[platform] || 'bg-gray-100 text-gray-800'}>
        {platform.charAt(0).toUpperCase() + platform.slice(1)}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto text-center shadow-xl border-0">
          <CardContent className="pt-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Application Submitted!
            </h2>
            <p className="text-gray-600 mb-6">
              Your campaign application has been successfully submitted. We will contact you after review.
              
            </p>
            <Button onClick={() => navigate('/mypage')} className="bg-purple-600 hover:bg-purple-700">
              Go to My Page
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto text-center shadow-xl border-0">
          <CardContent className="pt-8">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Campaign Not Found
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => navigate('/')} className="bg-purple-600 hover:bg-purple-700">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 뒤로가기 버튼 */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Button>
        </div>

        {/* 캠페인 정보 */}
        <Card className="mb-8 shadow-xl border-0">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{campaign.title}</CardTitle>
                <CardDescription className="text-lg text-purple-600 font-medium mb-4">
                  {campaign.brand}
                </CardDescription>
                
                {campaign.platforms && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {campaign.platforms.map((platform) => (
                      <span key={platform}>
                        {getPlatformBadge(platform)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="text-right ml-6">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {formatCurrency(campaign.reward_amount)}
                </div>
                <div className="text-sm text-gray-500">
                  Reward
                </div>
                <Badge className="bg-green-100 text-green-800 mt-2">
                  Recruiting
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 신청 폼 */}
        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-xl">
              Campaign Application
            </CardTitle>
            <CardDescription>
              Please enter the information below accurately.
              
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 기본 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
                  <User className="h-5 w-5 mr-2" />
                  Basic Information
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="user_name">
                      Name *
                    </Label>
                    <Input
                      id="user_name"
                      name="user_name"
                      value={formData.user_name}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="user_email">
                      Email *
                    </Label>
                    <Input
                      id="user_email"
                      name="user_email"
                      type="email"
                      value={formData.user_email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="skin_type">
                      Skin Type *
                    </Label>
                    <Select value={formData.skin_type} onValueChange={(value) => handleSelectChange('skin_type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select skin type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dry">Dry</SelectItem>
                        <SelectItem value="oily">Oily</SelectItem>
                        <SelectItem value="combination">Combination</SelectItem>
                        <SelectItem value="sensitive">Sensitive</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="age">
                      Age *
                    </Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      min="13"
                      max="100"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="Enter your age"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SNS 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
                  <Instagram className="h-5 w-5 mr-2" />
                  SNS Information
                </h3>                
                {/* Instagram */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="instagram_url">Instagram URL</Label>
                    <Input
                      id="instagram_url"
                      name="instagram_url"
                      value={formData.instagram_url}
                      onChange={handleInputChange}
                      placeholder="https://instagram.com/username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram_followers">
                      Instagram Followers
                    </Label>
                    <Input
                      id="instagram_followers"
                      name="instagram_followers"
                      type="number"
                      min="0"
                      value={formData.instagram_followers}
                      onChange={handleInputChange}
                      placeholder="1000"
                    />
                  </div>
                </div>
                
                {/* TikTok */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tiktok_url">TikTok URL</Label>
                    <Input
                      id="tiktok_url"
                      name="tiktok_url"
                      value={formData.tiktok_url}
                      onChange={handleInputChange}
                      placeholder="https://tiktok.com/@username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tiktok_followers">
                      TikTok Followers
                    </Label>
                    <Input
                      id="tiktok_followers"
                      name="tiktok_followers"
                      type="number"
                      min="0"
                      value={formData.tiktok_followers}
                      onChange={handleInputChange}
                      placeholder="1000"
                    />
                  </div>
                </div>
                
                {/* YouTube */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="youtube_url">YouTube URL</Label>
                    <Input
                      id="youtube_url"
                      name="youtube_url"
                      value={formData.youtube_url}
                      onChange={handleInputChange}
                      placeholder="https://youtube.com/@username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtube_followers">
                      YouTube Subscribers
                    </Label>
                    <Input
                      id="youtube_followers"
                      name="youtube_followers"
                      type="number"
                      min="0"
                      value={formData.youtube_followers}
                      onChange={handleInputChange}
                      placeholder="1000"
                    />
                  </div>
                </div>
              </div>

              {/* 캠페인 질문 */}
              {(campaign.question1 || campaign.question2 || campaign.question3 || campaign.question4) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Campaign Questions
                  </h3>
                  
                  {[1, 2, 3, 4].map((num) => {
                    const question = campaign[`question${num}`]
                    const questionType = campaign[`question${num}_type`] || 'short'
                    const questionOptions = campaign[`question${num}_options`]
                    
                    if (!question) return null
                    
                    return (
                      <div key={num} className="space-y-2">
                        <Label htmlFor={`question_${num}`}>
                          {num}. {question} *
                        </Label>
                        
                        {questionType === 'long' ? (
                          <Textarea
                            id={`question_${num}`}
                            value={formData.answers[num.toString()] || ''}
                            onChange={(e) => handleAnswerChange(num.toString(), e.target.value)}
                            placeholder="Enter your answer"
                            required
                          />
                        ) : questionType === 'checkbox' && questionOptions ? (
                          <div className="space-y-2">
                            {questionOptions.split(',').map((option, optionIndex) => (
                              <label key={optionIndex} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  value={option.trim()}
                                  checked={(formData.answers[num.toString()] || '').includes(option.trim())}
                                  onChange={(e) => {
                                    const currentAnswers = formData.answers[num.toString()] || ''
                                    const answerArray = currentAnswers ? currentAnswers.split(', ') : []
                                    
                                    if (e.target.checked) {
                                      answerArray.push(option.trim())
                                    } else {
                                      const index = answerArray.indexOf(option.trim())
                                      if (index > -1) answerArray.splice(index, 1)
                                    }
                                    
                                    handleAnswerChange(num.toString(), answerArray.join(', '))
                                  }}
                                  className="rounded border-gray-300"
                                />
                                <span className="text-sm">{option.trim()}</span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <Input
                            id={`question_${num}`}
                            value={formData.answers[num.toString()] || ''}
                            onChange={(e) => handleAnswerChange(num.toString(), e.target.value)}
                            placeholder="Enter your answer"
                            required
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Submit Application
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CampaignApplicationPage
