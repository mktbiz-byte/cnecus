import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { database, supabase } from '../../lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  Loader2, Save, ArrowLeft, ArrowRight, Lock,
  CheckCircle, AlertCircle
} from 'lucide-react'
import { Link } from 'react-router-dom'
import ProfileProgressBar from './ProfileProgressBar'
import ProfileStepBasicInfo from './ProfileStepBasicInfo'
import ProfileStepSocialChannels from './ProfileStepSocialChannels'
import ProfileStepBeautyProfile from './ProfileStepBeautyProfile'
import ProfileStepContentStyle from './ProfileStepContentStyle'
import ProfileStepPersonalDetails from './ProfileStepPersonalDetails'
import ProfileStepShippingAddress from './ProfileStepShippingAddress'
import { STEP_LABELS } from './profileConstants'

const ProfilePage = ({ embedded = false }) => {
  const { user } = useAuth()
  const [profileData, setProfileData] = useState({})
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const checkStepCompletion = useCallback((data) => {
    const completed = new Set()

    // Step 1: Basic Info
    if (data.name && data.profile_image_url) completed.add(1)

    // Step 2: Social Channels (at least 1 SNS)
    if (data.instagram_handle || data.instagram_url || data.tiktok_handle || data.tiktok_url || data.youtube_handle || data.youtube_url) {
      completed.add(2)
    }

    // Step 3: Beauty Profile
    if (data.skin_type) completed.add(3)

    // Step 4: Content Style
    if (data.primary_interest) completed.add(4)

    // Step 5: Personal Details (any 1 field)
    if (data.job || data.languages?.length > 0 || data.target_gender || data.has_children !== undefined) {
      completed.add(5)
    }

    // Step 6: Shipping Address
    if (data.shipping_country && (data.shipping_address || data.shipping_address_line1) && data.shipping_city) {
      completed.add(6)
    }

    return completed
  }, [])

  useEffect(() => {
    if (user) loadProfile()
  }, [user])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const data = await database.userProfiles.get(user.id)
      if (data) {
        setProfileData({
          ...data,
          email: data.email || user.email || ''
        })
        const completed = checkStepCompletion(data)
        setCompletedSteps(completed)

        // Start at first incomplete step
        for (let i = 1; i <= 6; i++) {
          if (!completed.has(i)) {
            setCurrentStep(i)
            break
          }
        }
      } else {
        setProfileData({ email: user.email || '' })
      }
    } catch (err) {
      console.error('Profile load error:', err)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveStep = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      // Step 1 validation
      if (currentStep === 1) {
        if (!profileData.profile_image_url) {
          setError('Please upload a profile photo')
          setSaving(false)
          return
        }
        if (!profileData.name?.trim()) {
          setError('Please enter your name')
          setSaving(false)
          return
        }
      }

      const completed = checkStepCompletion(profileData)
      const allComplete = completed.size === 6

      const saveData = {
        ...profileData,
        user_id: user.id,
        profile_completed: allComplete,
        profile_completion_step: Math.max(currentStep, profileData.profile_completion_step || 0),
        updated_at: new Date().toISOString()
      }

      // Clean up undefined values
      Object.keys(saveData).forEach(key => {
        if (saveData[key] === undefined) delete saveData[key]
      })

      await database.userProfiles.upsert(saveData)

      setCompletedSteps(completed)
      setSuccess(`${STEP_LABELS[currentStep]} saved!`)
      setTimeout(() => setSuccess(''), 3000)

      // Auto-advance to next incomplete step
      if (currentStep < 6) {
        const nextIncomplete = findNextIncomplete(currentStep, completed)
        if (nextIncomplete) setCurrentStep(nextIncomplete)
        else setCurrentStep(currentStep + 1)
      }
    } catch (err) {
      console.error('Save error:', err)
      setError(`Failed to save: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const findNextIncomplete = (fromStep, completed) => {
    for (let i = fromStep + 1; i <= 6; i++) {
      if (!completed.has(i)) return i
    }
    return null
  }

  const handleChangePassword = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        setError('Please fill in all password fields')
        setSaving(false)
        return
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('New passwords do not match')
        setSaving(false)
        return
      }
      if (passwordData.newPassword.length < 6) {
        setError('Password must be at least 6 characters')
        setSaving(false)
        return
      }

      const { error: authError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })
      if (authError) throw authError

      setSuccess('Password changed successfully!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Password error:', err)
      setError(`Failed to change password: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleStepChange = (data) => {
    setProfileData(data)
    // Re-check completion on every change
    setCompletedSteps(checkStepCompletion(data))
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <ProfileStepBasicInfo data={profileData} onChange={handleStepChange} user={user} />
      case 2:
        return <ProfileStepSocialChannels data={profileData} onChange={handleStepChange} />
      case 3:
        return <ProfileStepBeautyProfile data={profileData} onChange={handleStepChange} />
      case 4:
        return <ProfileStepContentStyle data={profileData} onChange={handleStepChange} />
      case 5:
        return <ProfileStepPersonalDetails data={profileData} onChange={handleStepChange} />
      case 6:
        return <ProfileStepShippingAddress data={profileData} onChange={handleStepChange} />
      default:
        return null
    }
  }

  if (loading) {
    return embedded ? (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    ) : (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className={embedded ? '' : 'min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-4 sm:py-8'}>
      <div className={embedded ? 'space-y-6' : 'max-w-2xl mx-auto px-4'}>
        {/* Header - hidden in embedded mode */}
        {!embedded && (
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-1">Complete your profile to get more campaign opportunities</p>
        </div>
        )}

        {/* Messages */}
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="pt-5 pb-4">
            <ProfileProgressBar
              currentStep={currentStep}
              completedSteps={completedSteps}
              onStepClick={setCurrentStep}
            />
          </CardContent>
        </Card>

        {/* Current Step */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-purple-600 text-white text-sm flex items-center justify-center">
                {currentStep}
              </span>
              {STEP_LABELS[currentStep]}
              {completedSteps.has(currentStep) && (
                <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderCurrentStep()}

            {/* Navigation & Save */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                disabled={currentStep === 1}
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <Button
                onClick={handleSaveStep}
                disabled={saving}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save & Continue
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={currentStep === 6}
                onClick={() => setCurrentStep(prev => Math.min(6, prev + 1))}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Password Card - hidden in embedded mode */}
        {!embedded && <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Lock className="h-5 w-5 mr-2" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              />
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={saving}
              variant="outline"
              className="w-full min-h-[44px]"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Change Password'}
            </Button>
          </CardContent>
        </Card>}
      </div>
    </div>
  )
}

export default ProfilePage
