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
  Loader2, ArrowLeft, DollarSign, Users, Calendar,
  CheckCircle, AlertCircle, Instagram, Youtube, Hash,
  MapPin, Phone, User, Shield
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

  // Simplified form data - auto-filled from profile
  const [formData, setFormData] = useState({
    // Campaign questions
    answer_1: '',
    answer_2: '',
    answer_3: '',
    answer_4: '',
    additional_info: '',
    // Portrait rights consent
    portrait_rights_consent: false
  })

  // Texts
  const t = {
    title: 'Apply to Campaign',
    backToCampaigns: 'Back to Campaigns',
    reward: 'Reward',
    spots: 'Spots',
    deadline: 'Deadline',
    period: 'Campaign Period',
    requirements: 'Requirements',
    platforms: 'Target Platforms',
    yourInfo: 'Your Information',
    fromProfile: 'From your profile',
    editProfile: 'Edit Profile',
    questions: 'Campaign Questions',
    submit: 'Submit Application',
    submitting: 'Submitting...',
    success: 'Application submitted successfully!',
    redirecting: 'Redirecting to home...',
    loginRequired: 'Please sign in to apply',
    signIn: 'Sign In',
    campaignNotFound: 'Campaign not found',
    alreadyApplied: 'You have already applied to this campaign',
    updateApplication: 'Update Application',
    // Profile modal
    profileRequired: 'Complete Your Profile First',
    profileRequiredDesc: 'To apply for campaigns, please complete your profile with your SNS accounts and shipping information.',
    completeProfile: 'Complete Profile',
    // Portrait rights
    portraitRightsTitle: 'Content Usage Agreement',
    portraitRightsText: 'I agree that my content created for this campaign may be used by the brand and CNEC for marketing purposes for up to 1 year.',
    portraitRightsRequired: 'You must agree to continue',
    // Validation
    answerRequired: 'Please answer all required questions',
    consentRequired: 'Please agree to the content usage terms'
  }

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

      // Load campaign
      const campaignData = await database.campaigns.getById(campaignId)
      if (!campaignData) {
        throw new Error(t.campaignNotFound)
      }
      setCampaign(campaignData)

      // Load user profile
      const profileData = await database.userProfiles.get(user.id)
      setUserProfile(profileData)

      // Check if profile is complete (need at least Instagram and shipping address)
      const isProfileComplete = profileData &&
        profileData.instagram_url &&
        profileData.address &&
        profileData.phone_number

      if (!isProfileComplete) {
        setShowProfileModal(true)
      }

      // Check existing application
      const existingApp = await database.applications.getByUserAndCampaign(user.id, campaignId)
      setExistingApplication(existingApp)

      if (existingApp) {
        setFormData(prev => ({
          ...prev,
          answer_1: existingApp.answer_1 || '',
          answer_2: existingApp.answer_2 || '',
          answer_3: existingApp.answer_3 || '',
          answer_4: existingApp.answer_4 || '',
          additional_info: existingApp.additional_info || '',
          portrait_rights_consent: existingApp.portrait_rights_consent || false
        }))
      }

    } catch (error) {
      console.error('Load error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const errors = []

    // Check required questions
    if (campaign?.question1 && !formData.answer_1?.trim()) {
      errors.push(t.answerRequired)
    }
    if (campaign?.question2 && !formData.answer_2?.trim()) {
      errors.push(t.answerRequired)
    }
    if (campaign?.question3 && !formData.answer_3?.trim()) {
      errors.push(t.answerRequired)
    }
    if (campaign?.question4 && !formData.answer_4?.trim()) {
      errors.push(t.answerRequired)
    }

    // Check portrait rights consent
    if (!formData.portrait_rights_consent) {
      errors.push(t.consentRequired)
    }

    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setError(validationErrors[0])
      return
    }

    try {
      setSubmitting(true)
      setError('')

      // Build submission data from profile + form
      const submissionData = {
        user_id: user.id,
        campaign_id: campaignId,
        applicant_name: userProfile?.name || '',
        age: userProfile?.age || null,
        skin_type: userProfile?.skin_type || null,
        postal_code: userProfile?.postal_code || '',
        address: userProfile?.address || '',
        phone_number: userProfile?.phone_number || '',
        instagram_url: userProfile?.instagram_url || '',
        youtube_url: userProfile?.youtube_url || null,
        tiktok_url: userProfile?.tiktok_url || null,
        answer_1: formData.answer_1 || null,
        answer_2: formData.answer_2 || null,
        answer_3: formData.answer_3 || null,
        answer_4: formData.answer_4 || null,
        additional_info: formData.additional_info || null,
        portrait_rights_consent: formData.portrait_rights_consent,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      if (existingApplication) {
        await database.applications.update(existingApplication.id, submissionData)
      } else {
        await database.applications.create(submissionData)
      }

      setSuccess(t.success)

      setTimeout(() => {
        navigate('/')
      }, 2000)

    } catch (error) {
      console.error('Submit error:', error)
      setError('Failed to submit application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0)
  }

  const getActivePlatforms = (targetPlatforms) => {
    if (!targetPlatforms || typeof targetPlatforms !== 'object') return ['Instagram']
    const platforms = []
    if (targetPlatforms.instagram) platforms.push('Instagram')
    if (targetPlatforms.youtube) platforms.push('YouTube')
    if (targetPlatforms.tiktok) platforms.push('TikTok')
    return platforms.length > 0 ? platforms : ['Instagram']
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-purple-600" />
          <p className="text-gray-600">Loading campaign...</p>
        </div>
      </div>
    )
  }

  // Login required
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t.loginRequired}</h2>
            <Link to="/login">
              <Button className="mt-4 bg-purple-600 hover:bg-purple-700">
                {t.signIn}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error && !campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-600 mb-2">{error}</h2>
            <Button onClick={() => navigate('/')} variant="outline" className="mt-4">
              {t.backToCampaigns}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-green-600 mb-2">{success}</h2>
            <p className="text-gray-500">{t.redirecting}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Profile Completion Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-purple-600" />
              {t.profileRequired}
            </DialogTitle>
            <DialogDescription>
              {t.profileRequiredDesc}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Required information:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center gap-2">
                  <Instagram className="h-4 w-4" /> Instagram URL
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Shipping Address
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Phone Number
                </li>
              </ul>
            </div>
            <Link to="/profile-settings">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                {t.completeProfile}
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t.backToCampaigns}
        </button>

        <h1 className="text-2xl font-bold text-gray-800 mb-6">{t.title}</h1>

        {/* Campaign Card - Compact */}
        {campaign && (
          <Card className="mb-6 overflow-hidden">
            <div className="flex">
              {/* Campaign Image */}
              <div className="w-32 h-32 flex-shrink-0">
                {campaign.image_url ? (
                  <img
                    src={campaign.image_url}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <span className="text-3xl">✨</span>
                  </div>
                )}
              </div>

              {/* Campaign Info */}
              <CardContent className="flex-1 py-4">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-purple-100 text-purple-700 text-xs">
                    {campaign.brand}
                  </Badge>
                  <Badge className="bg-green-100 text-green-700 text-xs">
                    {formatCurrency(campaign.reward_amount)}
                  </Badge>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                  {campaign.title}
                </h3>
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {campaign.max_participants} spots
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Due {formatDate(campaign.application_deadline || campaign.deadline)}
                  </span>
                </div>
                <div className="flex gap-1 mt-2">
                  {getActivePlatforms(campaign.target_platforms).map(p => (
                    <Badge key={p} variant="outline" className="text-xs px-1.5 py-0">
                      {p}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </div>
          </Card>
        )}

        {/* Already Applied Notice */}
        {existingApplication && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-800 font-medium">{t.alreadyApplied}</p>
              <p className="text-blue-600 text-sm">You can update your application below.</p>
            </div>
          </div>
        )}

        {/* Your Profile Info - Read Only */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <User className="h-4 w-4" />
                {t.yourInfo}
              </h3>
              <Link to="/profile-settings">
                <Button variant="outline" size="sm" className="text-xs">
                  {t.editProfile}
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Name</span>
                <p className="font-medium">{userProfile?.name || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">Email</span>
                <p className="font-medium">{userProfile?.email || user?.email || '-'}</p>
              </div>
              <div className="flex items-center gap-2">
                <Instagram className="h-4 w-4 text-pink-500" />
                <span className="truncate">{userProfile?.instagram_url ? 'Connected' : 'Not set'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="truncate">{userProfile?.address ? 'Set' : 'Not set'}</span>
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
              <Shield className="h-3 w-3" />
              {t.fromProfile}
            </p>
          </CardContent>
        </Card>

        {/* Application Form */}
        <form onSubmit={handleSubmit}>
          {/* Campaign Questions */}
          {(campaign?.question1 || campaign?.question2 || campaign?.question3 || campaign?.question4) && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-gray-800 mb-4">{t.questions}</h3>
                <div className="space-y-4">
                  {campaign?.question1 && (
                    <div>
                      <Label className="text-sm">
                        {campaign.question1} <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        value={formData.answer_1}
                        onChange={(e) => setFormData(prev => ({ ...prev, answer_1: e.target.value }))}
                        rows={3}
                        className="mt-1"
                        placeholder="Your answer..."
                        required
                      />
                    </div>
                  )}
                  {campaign?.question2 && (
                    <div>
                      <Label className="text-sm">
                        {campaign.question2} <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        value={formData.answer_2}
                        onChange={(e) => setFormData(prev => ({ ...prev, answer_2: e.target.value }))}
                        rows={3}
                        className="mt-1"
                        placeholder="Your answer..."
                        required
                      />
                    </div>
                  )}
                  {campaign?.question3 && (
                    <div>
                      <Label className="text-sm">
                        {campaign.question3} <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        value={formData.answer_3}
                        onChange={(e) => setFormData(prev => ({ ...prev, answer_3: e.target.value }))}
                        rows={3}
                        className="mt-1"
                        placeholder="Your answer..."
                        required
                      />
                    </div>
                  )}
                  {campaign?.question4 && (
                    <div>
                      <Label className="text-sm">
                        {campaign.question4} <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        value={formData.answer_4}
                        onChange={(e) => setFormData(prev => ({ ...prev, answer_4: e.target.value }))}
                        rows={3}
                        className="mt-1"
                        placeholder="Your answer..."
                        required
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Info */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <Label className="text-sm">Additional Information (Optional)</Label>
              <Textarea
                value={formData.additional_info}
                onChange={(e) => setFormData(prev => ({ ...prev, additional_info: e.target.value }))}
                rows={3}
                className="mt-1"
                placeholder="Anything else you'd like to share with the brand..."
              />
            </CardContent>
          </Card>

          {/* Content Usage Agreement */}
          <Card className="mb-6 border-2 border-purple-200 bg-purple-50/50">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-600" />
                {t.portraitRightsTitle}
              </h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                {t.portraitRightsText}
              </p>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.portrait_rights_consent}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    portrait_rights_consent: e.target.checked
                  }))}
                  className="mt-1 h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                />
                <span className="text-sm">
                  I agree to the content usage terms <span className="text-red-500">*</span>
                </span>
              </label>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={submitting || showProfileModal}
            className="w-full bg-purple-600 hover:bg-purple-700 py-6 text-lg"
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                {t.submitting}
              </>
            ) : existingApplication ? (
              t.updateApplication
            ) : (
              t.submit
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default CampaignApplicationUpdated
