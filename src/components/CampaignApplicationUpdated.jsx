import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { database } from '../lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import {
  Loader2, ArrowLeft, Users, Calendar,
  CheckCircle, AlertCircle, User, Shield, Sparkles,
  Instagram, Youtube, Hash
} from 'lucide-react'

const CampaignApplicationUpdated = () => {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const campaignId = id || searchParams.get('campaign_id')

  const [campaign, setCampaign] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [existingApplication, setExistingApplication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showProfileModal, setShowProfileModal] = useState(false)

  // Full form with SNS info (stored in applications table)
  const [formData, setFormData] = useState({
    age_range: '',
    skin_type: '',
    // SNS URLs and follower counts
    instagram_url: '',
    instagram_followers: '',
    youtube_url: '',
    youtube_subscribers: '',
    tiktok_url: '',
    tiktok_followers: '',
    // Campaign questions
    answer_1: '',
    answer_2: '',
    answer_3: '',
    answer_4: '',
    additional_info: '',
    content_agreement: false
  })

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    if (!campaignId) {
      setError('Campaign not found')
      setLoading(false)
      return
    }
    loadData()
  }, [user, campaignId])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      const campaignData = await database.campaigns.getById(campaignId)
      if (!campaignData) {
        throw new Error('Campaign not found')
      }
      setCampaign(campaignData)

      const profileData = await database.userProfiles.get(user.id)
      setUserProfile(profileData)

      // Check existing application
      const existingApp = await database.applications.getByUserAndCampaign(user.id, campaignId)
      setExistingApplication(existingApp)

      if (existingApp) {
        setFormData(prev => ({
          ...prev,
          age_range: existingApp.age_range || '',
          skin_type: existingApp.skin_type || '',
          instagram_url: existingApp.instagram_url || '',
          instagram_followers: existingApp.instagram_followers || '',
          youtube_url: existingApp.youtube_url || '',
          youtube_subscribers: existingApp.youtube_subscribers || '',
          tiktok_url: existingApp.tiktok_url || '',
          tiktok_followers: existingApp.tiktok_followers || '',
          answer_1: existingApp.answer_1 || '',
          answer_2: existingApp.answer_2 || '',
          answer_3: existingApp.answer_3 || '',
          answer_4: existingApp.answer_4 || '',
          additional_info: existingApp.additional_info || '',
          content_agreement: existingApp.portrait_rights_consent || false
        }))
      }

      // Check if profile is complete (has name)
      if (!profileData?.name) {
        setShowProfileModal(true)
      }

    } catch (error) {
      console.error('Load error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    // Must have at least one SNS account
    if (!formData.instagram_url && !formData.youtube_url && !formData.tiktok_url) {
      return 'Please add at least one SNS account'
    }

    // Age range required
    if (!formData.age_range) {
      return 'Please select your age range'
    }

    // Content agreement required
    if (!formData.content_agreement) {
      return 'Please agree to the content terms'
    }

    // Check required questions
    if (campaign?.question1 && !formData.answer_1?.trim()) {
      return 'Please answer all required questions'
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

      // Submission data - DB 스키마 업데이트 완료로 모든 필드 저장 가능
      const submissionData = {
        user_id: user.id,
        campaign_id: campaignId,
        applicant_name: userProfile?.name || '',
        email: userProfile?.email || '',
        // Profile photo (cnecbiz 연동용)
        profile_photo_url: userProfile?.profile_image_url || userProfile?.profile_image || null,
        // Profile data
        age_range: formData.age_range || null,
        skin_type: formData.skin_type || null,
        // SNS URLs
        instagram_url: formData.instagram_url || null,
        youtube_url: formData.youtube_url || null,
        tiktok_url: formData.tiktok_url || null,
        // SNS Followers
        instagram_followers: formData.instagram_followers ? parseInt(formData.instagram_followers) : null,
        youtube_subscribers: formData.youtube_subscribers ? parseInt(formData.youtube_subscribers) : null,
        tiktok_followers: formData.tiktok_followers ? parseInt(formData.tiktok_followers) : null,
        // Answers
        answer_1: formData.answer_1 || null,
        answer_2: formData.answer_2 || null,
        answer_3: formData.answer_3 || null,
        answer_4: formData.answer_4 || null,
        additional_info: formData.additional_info || null,
        portrait_rights_consent: formData.content_agreement,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      if (existingApplication) {
        await database.applications.update(existingApplication.id, submissionData)
      } else {
        await database.applications.create(submissionData)
      }

      setSuccess(true)
      setTimeout(() => navigate('/'), 2000)

    } catch (error) {
      console.error('Submit error:', error)
      setError('Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    return `$${(amount || 0).toLocaleString()}`
  }

  // Calculate creator reward based on package_type and campaign_type
  const calculateCreatorReward = (campaign) => {
    if (campaign?.reward_amount) {
      return campaign.reward_amount
    }

    const rewardMap = {
      'junior_regular': 130,
      'junior_4week_challenge': 265,
      'intermediate_regular': 175,
      'intermediate_4week_challenge': 310,
      'senior_regular': 220,
      'senior_4week_challenge': 355,
      'premium_regular': 265,
      'premium_4week_challenge': 400
    }

    const packageType = campaign?.package_type || 'junior'
    const campaignType = campaign?.campaign_type || 'regular'
    const key = `${packageType}_${campaignType}`

    return rewardMap[key] || 130
  }

  // Get campaign type display label
  const getCampaignTypeLabel = (campaignType) => {
    switch (campaignType) {
      case '4week_challenge':
        return '4-Week Challenge'
      case 'regular':
      default:
        return 'Standard'
    }
  }

  // Get campaign type badge style
  const getCampaignTypeBadgeStyle = (campaignType) => {
    switch (campaignType) {
      case '4week_challenge':
        return 'bg-orange-100 text-orange-700'
      case 'regular':
      default:
        return 'bg-blue-100 text-blue-700'
    }
  }

  const getActivePlatforms = (targetPlatforms) => {
    if (!targetPlatforms || typeof targetPlatforms !== 'object') return ['Instagram']
    const platforms = []
    if (targetPlatforms.instagram) platforms.push('Instagram')
    if (targetPlatforms.youtube) platforms.push('YouTube')
    if (targetPlatforms.tiktok) platforms.push('TikTok')
    return platforms.length > 0 ? platforms : ['Instagram']
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-sm w-full text-center">
          <CardContent className="pt-8 pb-6">
            <User className="h-12 w-12 text-purple-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Sign in to apply</h2>
            <p className="text-sm text-gray-500 mb-4">Create an account to start collaborating with K-Beauty brands</p>
            <Link to="/login">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error
  if (error && !campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-sm w-full text-center">
          <CardContent className="pt-8 pb-6">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-600 mb-4">{error}</h2>
            <Button onClick={() => navigate('/')} variant="outline">Go Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-sm w-full text-center">
          <CardContent className="pt-8 pb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-green-700 mb-2">Application Submitted!</h2>
            <p className="text-sm text-gray-500">We'll notify you once the brand reviews your application.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pb-8">
      {/* Profile Completion Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-purple-600" />
              Complete Your Profile
            </DialogTitle>
            <DialogDescription>
              Please set up your profile before applying to campaigns. This helps brands get to know you better.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Link to="/profile">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Go to Profile Settings
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => setShowProfileModal(false)}
              className="w-full"
            >
              I'll do it later
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Header */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-4 text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>

        {/* Campaign Card */}
        {campaign && (
          <Card className="mb-6 overflow-hidden shadow-lg">
            <div className="relative h-40">
              {campaign.image_url ? (
                <img
                  src={campaign.image_url}
                  alt={campaign.title_en || campaign.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                  <Sparkles className="h-12 w-12 text-white/50" />
                </div>
              )}
              <div className="absolute bottom-3 left-3">
                <Badge className="bg-white text-purple-700 font-bold shadow-md">
                  {formatCurrency(calculateCreatorReward(campaign))}
                </Badge>
              </div>
              {/* Campaign Type Badge */}
              <div className="absolute top-3 left-3">
                <Badge className={`${getCampaignTypeBadgeStyle(campaign.campaign_type)} font-medium shadow-md`}>
                  {getCampaignTypeLabel(campaign.campaign_type)}
                </Badge>
              </div>
            </div>

            <CardContent className="pt-4 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-purple-600 font-medium">{campaign.brand_en || campaign.brand}</span>
                <span className="text-gray-300">•</span>
                <span className="text-xs text-gray-500">{campaign.max_participants} spots</span>
              </div>
              <h2 className="font-semibold text-gray-800 text-lg leading-snug mb-3">
                {campaign.title_en || campaign.title}
              </h2>

              {/* Description Preview */}
              {(campaign.description_en || campaign.description) && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {campaign.description_en || campaign.description}
                </p>
              )}

              <div className="flex items-center justify-between text-sm mb-3">
                <div className="flex gap-1">
                  {getActivePlatforms(campaign.target_platforms).map(p => (
                    <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                  ))}
                </div>
              </div>

              {/* Deadlines Section */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Application Due:</span>
                  <span className="font-medium">{formatDate(campaign.application_deadline || campaign.deadline)}</span>
                </div>

                {/* Regular Campaign Deadlines */}
                {(campaign.campaign_type === 'regular' || !campaign.campaign_type) && (
                  <>
                    {campaign.video_deadline && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Video Submission:</span>
                        <span className="font-medium">{formatDate(campaign.video_deadline)}</span>
                      </div>
                    )}
                    {campaign.sns_deadline && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">SNS Upload:</span>
                        <span className="font-medium">{formatDate(campaign.sns_deadline)}</span>
                      </div>
                    )}
                  </>
                )}

                {/* 4-Week Challenge Deadlines */}
                {campaign.campaign_type === '4week_challenge' && (
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2 font-medium">Weekly Deadlines:</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[1, 2, 3, 4].map(week => {
                        const deadline = campaign[`week${week}_deadline`]
                        return deadline ? (
                          <div key={week} className="text-xs bg-white p-1.5 rounded border flex justify-between">
                            <span className="text-orange-600 font-medium">W{week}:</span>
                            <span>{formatDate(deadline)}</span>
                          </div>
                        ) : null
                      })}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Campaign Details Expandable Section */}
        {campaign && (
          <div className="mb-5 space-y-3">
            {/* Special Requirements Badges */}
            {(campaign.requires_ad_code || campaign.requires_clean_video) && (
              <div className="flex flex-wrap gap-2">
                {campaign.requires_ad_code && (
                  <Badge className="bg-amber-100 text-amber-700 border border-amber-200 text-xs">
                    📊 Meta Ad Code Required
                  </Badge>
                )}
                {campaign.requires_clean_video && (
                  <Badge className="bg-teal-100 text-teal-700 border border-teal-200 text-xs">
                    🎬 Clean Video Required
                  </Badge>
                )}
              </div>
            )}

            {/* Product Information */}
            {(campaign.brand_name_en || campaign.product_name_en || campaign.product_description_en) && (
              <Card className="border-pink-100">
                <CardContent className="pt-4 pb-4">
                  <h3 className="font-semibold mb-3 flex items-center text-pink-700 text-sm">
                    🎁 Product Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    {campaign.brand_name_en && (
                      <div className="flex items-start">
                        <span className="text-gray-500 w-16 flex-shrink-0">Brand:</span>
                        <span className="font-medium text-gray-800">{campaign.brand_name_en}</span>
                      </div>
                    )}
                    {campaign.product_name_en && (
                      <div className="flex items-start">
                        <span className="text-gray-500 w-16 flex-shrink-0">Product:</span>
                        <span className="font-medium text-gray-800">{campaign.product_name_en}</span>
                      </div>
                    )}
                    {campaign.product_description_en && (
                      <p className="text-gray-700 mt-2">{campaign.product_description_en}</p>
                    )}
                    {campaign.product_features_en?.length > 0 && (
                      <div className="mt-2">
                        <span className="text-gray-500 text-xs">Key Features:</span>
                        <ul className="mt-1 space-y-0.5">
                          {campaign.product_features_en.map((feature, idx) => (
                            <li key={idx} className="text-gray-700 flex items-start text-xs">
                              <span className="text-pink-500 mr-2">•</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Video Specifications */}
            {(campaign.video_duration_en || campaign.video_tempo_en || campaign.video_tone_en) && (
              <Card className="border-blue-100">
                <CardContent className="pt-4 pb-4">
                  <h3 className="font-semibold mb-3 flex items-center text-blue-700 text-sm">
                    🎥 Video Specifications
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {campaign.video_duration_en && (
                      <div className="bg-blue-50 p-2 rounded text-center">
                        <div className="text-xs text-gray-500">Duration</div>
                        <div className="text-xs font-medium">{campaign.video_duration_en}</div>
                      </div>
                    )}
                    {campaign.video_tempo_en && (
                      <div className="bg-blue-50 p-2 rounded text-center">
                        <div className="text-xs text-gray-500">Tempo</div>
                        <div className="text-xs font-medium">{campaign.video_tempo_en}</div>
                      </div>
                    )}
                    {campaign.video_tone_en && (
                      <div className="bg-blue-50 p-2 rounded text-center">
                        <div className="text-xs text-gray-500">Tone</div>
                        <div className="text-xs font-medium">{campaign.video_tone_en}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Creator Guide */}
            {(campaign.required_dialogues_en?.length > 0 ||
              campaign.required_scenes_en?.length > 0 ||
              campaign.required_hashtags_en?.length > 0 ||
              campaign.shooting_scenes_en?.length > 0) && (
              <Card className="border-amber-100">
                <CardContent className="pt-4 pb-4">
                  <h3 className="font-semibold mb-3 flex items-center text-amber-700 text-sm">
                    📋 Creator Guide
                  </h3>
                  <div className="space-y-3">
                    {/* Required Lines */}
                    {campaign.required_dialogues_en?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-amber-800 mb-1">💬 Required Lines</h4>
                        <ul className="space-y-1">
                          {campaign.required_dialogues_en.map((line, idx) => (
                            <li key={idx} className="text-xs bg-amber-50 p-1.5 rounded border border-amber-100 italic text-gray-700">
                              "{line}"
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Required Scenes */}
                    {campaign.required_scenes_en?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-amber-800 mb-1">🎬 Required Scenes</h4>
                        <ul className="space-y-0.5">
                          {campaign.required_scenes_en.map((scene, idx) => (
                            <li key={idx} className="text-xs text-gray-700 flex items-start">
                              <span className="text-amber-500 mr-1">✓</span>
                              {scene}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Shooting Scenes */}
                    {campaign.shooting_scenes_en?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-amber-800 mb-1">📸 Shooting Scenes</h4>
                        <ul className="space-y-0.5">
                          {campaign.shooting_scenes_en.map((scene, idx) => (
                            <li key={idx} className="text-xs text-gray-700 flex items-start">
                              <span className="text-amber-500 mr-1">{idx + 1}.</span>
                              {scene}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Required Hashtags */}
                    {campaign.required_hashtags_en?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-amber-800 mb-1"># Required Hashtags</h4>
                        <div className="flex flex-wrap gap-1">
                          {campaign.required_hashtags_en.map((tag, idx) => (
                            <span key={idx} className="text-xs bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200 text-amber-700">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Details */}
            {(campaign.additional_details_en || campaign.additional_shooting_requests_en) && (
              <Card className="border-gray-200">
                <CardContent className="pt-4 pb-4">
                  <h3 className="font-semibold mb-2 flex items-center text-gray-700 text-sm">
                    📝 Additional Notes
                  </h3>
                  {campaign.additional_details_en && (
                    <p className="text-xs text-gray-700">{campaign.additional_details_en}</p>
                  )}
                  {campaign.additional_shooting_requests_en && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500">Shooting Requests:</span>
                      <p className="text-xs text-gray-700 mt-0.5">{campaign.additional_shooting_requests_en}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Product Shipping Date */}
            {campaign.product_shipping_date && (
              <div className="text-xs text-gray-600 flex items-center bg-gray-50 p-2 rounded">
                📦 Product shipping expected: <span className="font-medium ml-1">{formatDate(campaign.product_shipping_date)}</span>
              </div>
            )}
          </div>
        )}

        {/* Already Applied */}
        {existingApplication && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-5 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <span className="text-sm text-blue-700">You've already applied. Update below if needed.</span>
          </div>
        )}

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Basic Info */}
          <Card>
            <CardContent className="pt-5 pb-4">
              <h3 className="font-medium text-gray-800 mb-4">About You</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Age Range *</Label>
                  <Select
                    value={formData.age_range}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, age_range: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="18-24">18-24</SelectItem>
                      <SelectItem value="25-34">25-34</SelectItem>
                      <SelectItem value="35-44">35-44</SelectItem>
                      <SelectItem value="45+">45+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Skin Type</Label>
                  <Select
                    value={formData.skin_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, skin_type: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select" />
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
              </div>
            </CardContent>
          </Card>

          {/* SNS Information - REQUIRED */}
          <Card className="border-2 border-purple-200">
            <CardContent className="pt-5 pb-4">
              <h3 className="font-medium text-gray-800 mb-1">SNS Information *</h3>
              <p className="text-xs text-gray-500 mb-4">Add at least one SNS account</p>

              {/* Instagram */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-pink-500">
                  <Instagram className="h-4 w-4" />
                  <span className="text-sm font-medium">Instagram</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="@username or URL"
                    value={formData.instagram_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, instagram_url: e.target.value }))}
                  />
                  <Input
                    type="number"
                    placeholder="Followers"
                    value={formData.instagram_followers}
                    onChange={(e) => setFormData(prev => ({ ...prev, instagram_followers: e.target.value }))}
                  />
                </div>
              </div>

              {/* YouTube */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-red-500">
                  <Youtube className="h-4 w-4" />
                  <span className="text-sm font-medium">YouTube</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Channel URL"
                    value={formData.youtube_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, youtube_url: e.target.value }))}
                  />
                  <Input
                    type="number"
                    placeholder="Subscribers"
                    value={formData.youtube_subscribers}
                    onChange={(e) => setFormData(prev => ({ ...prev, youtube_subscribers: e.target.value }))}
                  />
                </div>
              </div>

              {/* TikTok */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-800">
                  <Hash className="h-4 w-4" />
                  <span className="text-sm font-medium">TikTok</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="@username or URL"
                    value={formData.tiktok_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, tiktok_url: e.target.value }))}
                  />
                  <Input
                    type="number"
                    placeholder="Followers"
                    value={formData.tiktok_followers}
                    onChange={(e) => setFormData(prev => ({ ...prev, tiktok_followers: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Campaign Questions */}
          {(campaign?.question1 || campaign?.question2 || campaign?.question3 || campaign?.question4) && (
            <Card>
              <CardContent className="pt-5 pb-4">
                <h3 className="font-medium text-gray-800 mb-4">Campaign Questions</h3>
                <div className="space-y-4">
                  {campaign?.question1 && (
                    <div>
                      <Label className="text-sm text-gray-700">
                        {campaign.question1} <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        value={formData.answer_1}
                        onChange={(e) => setFormData(prev => ({ ...prev, answer_1: e.target.value }))}
                        rows={2}
                        className="mt-1.5"
                        placeholder="Your answer..."
                      />
                    </div>
                  )}
                  {campaign?.question2 && (
                    <div>
                      <Label className="text-sm text-gray-700">
                        {campaign.question2} <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        value={formData.answer_2}
                        onChange={(e) => setFormData(prev => ({ ...prev, answer_2: e.target.value }))}
                        rows={2}
                        className="mt-1.5"
                        placeholder="Your answer..."
                      />
                    </div>
                  )}
                  {campaign?.question3 && (
                    <div>
                      <Label className="text-sm text-gray-700">
                        {campaign.question3} <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        value={formData.answer_3}
                        onChange={(e) => setFormData(prev => ({ ...prev, answer_3: e.target.value }))}
                        rows={2}
                        className="mt-1.5"
                        placeholder="Your answer..."
                      />
                    </div>
                  )}
                  {campaign?.question4 && (
                    <div>
                      <Label className="text-sm text-gray-700">
                        {campaign.question4} <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        value={formData.answer_4}
                        onChange={(e) => setFormData(prev => ({ ...prev, answer_4: e.target.value }))}
                        rows={2}
                        className="mt-1.5"
                        placeholder="Your answer..."
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Info */}
          <Card>
            <CardContent className="pt-5 pb-4">
              <Label className="text-sm text-gray-600">Anything else? (Optional)</Label>
              <Textarea
                value={formData.additional_info}
                onChange={(e) => setFormData(prev => ({ ...prev, additional_info: e.target.value }))}
                rows={2}
                className="mt-1.5"
                placeholder="Why would you be great for this campaign?"
              />
            </CardContent>
          </Card>

          {/* Agreement */}
          <div className="bg-white rounded-xl p-4 border">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.content_agreement}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  content_agreement: e.target.checked
                }))}
                className="mt-0.5 h-4 w-4 text-purple-600 rounded border-gray-300"
              />
              <span className="text-sm text-gray-600 leading-relaxed">
                I agree that content I create may be used by the brand for up to 1 year. <span className="text-red-500">*</span>
              </span>
            </label>
          </div>

          {/* Trust Note */}
          <div className="flex items-start gap-2 text-xs text-gray-400 px-1">
            <Shield className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            <span>Shipping address will only be requested if you're selected.</span>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-purple-600 hover:bg-purple-700 py-6 text-base font-medium"
          >
            {submitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : existingApplication ? (
              'Update Application'
            ) : (
              'Submit Application'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default CampaignApplicationUpdated
