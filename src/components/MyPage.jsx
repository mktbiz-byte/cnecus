import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { database, supabase } from '../lib/supabase'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  User, Settings, Award, AlertCircle, Loader2, CheckCircle2, Palette, Mail, Phone,
  ArrowLeft, Edit, Save, X, FileText, Instagram, DollarSign, Video, BookOpen,
  ChevronDown, ChevronUp, Upload, ExternalLink, AlertTriangle, Camera, MessageSquare, Lightbulb, Clock
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import WithdrawalModal from './WithdrawalModal'
import WithdrawalHistory from './WithdrawalHistory'

const MyPage = () => {
  const { user, userProfile, signOut } = useAuth()
  const navigate = useNavigate()

  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false)

  // Guide modal state
  const [guideModal, setGuideModal] = useState(false)
  const [selectedGuide, setSelectedGuide] = useState(null)
  const [selectedApplication, setSelectedApplication] = useState(null)

  // Video upload state
  const [videoUploadModal, setVideoUploadModal] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [uploadingVideo, setUploadingVideo] = useState(false)

  // Expanded guides state
  const [expandedGuides, setExpandedGuides] = useState({})

  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    skin_type: '',
    age: '',
    bio: '',
    instagram_url: '',
    instagram_followers: '',
    tiktok_url: '',
    tiktok_followers: '',
    youtube_url: '',
    youtube_followers: ''
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    loadPageData()
  }, [user, navigate])

  useEffect(() => {
    if (userProfile) {
      setProfileData({
        name: userProfile.name || user?.user_metadata?.name || '',
        phone: userProfile.phone || '',
        skin_type: userProfile.skin_type || '',
        age: userProfile.age || '',
        bio: userProfile.bio || '',
        instagram_url: userProfile.instagram_url || '',
        instagram_followers: userProfile.instagram_followers || '',
        tiktok_url: userProfile.tiktok_url || '',
        tiktok_followers: userProfile.tiktok_followers || '',
        youtube_url: userProfile.youtube_url || '',
        youtube_followers: userProfile.youtube_followers || ''
      })
    }
  }, [userProfile, user])

  const loadPageData = async () => {
    try {
      setLoading(true)
      setError('')

      // Get applications with campaign data including shooting_guide
      const { data: applicationsData, error: appError } = await supabase
        .from('applications')
        .select(`
          *,
          campaigns (
            id,
            title,
            brand,
            reward_amount,
            shooting_guide
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (appError) {
        console.error('Load applications error:', appError)
      }

      setApplications(applicationsData || [])
    } catch (error) {
      console.error('Load page data error:', error)
      setError('Failed to load data.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name, value) => {
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveProfile = async () => {
    try {
      setUpdating(true)
      setError('')
      setSuccess('')

      await database.userProfiles.update(user.id, profileData)

      setSuccess('Profile updated successfully.')
      setEditMode(false)

      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Update profile error:', error)
      setError('Failed to update profile.')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Under Review' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completed' }
    }

    const style = statusStyles[status] || statusStyles.pending

    return (
      <Badge className={`${style.bg} ${style.text}`}>
        {style.label}
      </Badge>
    )
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const openGuideModal = (application) => {
    setSelectedApplication(application)
    setSelectedGuide(application.campaigns?.shooting_guide)
    setGuideModal(true)
  }

  const openVideoUploadModal = (application) => {
    setSelectedApplication(application)
    setVideoUrl(application.video_submission_url || '')
    setVideoUploadModal(true)
  }

  const handleVideoSubmit = async () => {
    if (!videoUrl.trim()) {
      setError('Please enter a video URL.')
      return
    }

    try {
      setUploadingVideo(true)
      setError('')

      const { error: updateError } = await supabase
        .from('applications')
        .update({
          video_submission_url: videoUrl,
          video_submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedApplication.id)

      if (updateError) throw updateError

      setSuccess('Video submitted successfully!')
      setVideoUploadModal(false)
      loadPageData()

      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Video submit error:', error)
      setError('Failed to submit video.')
    } finally {
      setUploadingVideo(false)
    }
  }

  const toggleGuideExpand = (applicationId) => {
    setExpandedGuides(prev => ({
      ...prev,
      [applicationId]: !prev[applicationId]
    }))
  }

  const hasGuide = (application) => {
    return application.campaigns?.shooting_guide?.scenes?.length > 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Home
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Page</h1>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>

          <Button variant="outline" onClick={signOut}>
            Sign Out
          </Button>
        </div>

        {/* Alert Messages */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>My Campaigns</span>
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center space-x-2">
              <Award className="h-4 w-4" />
              <span>Rewards</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="shadow-xl border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Profile Information</span>
                    </CardTitle>
                    <CardDescription>
                      This information will be used for campaign applications.
                    </CardDescription>
                  </div>

                  <div className="flex space-x-2">
                    {editMode ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => setEditMode(false)}
                          disabled={updating}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveProfile}
                          disabled={updating}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {updating ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Save
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => setEditMode(true)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      {editMode ? (
                        <Input
                          id="name"
                          name="name"
                          value={profileData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your name"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-md">
                          {profileData.name || 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="p-3 bg-gray-50 rounded-md text-gray-600">
                        {user?.email}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      {editMode ? (
                        <Input
                          id="phone"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleInputChange}
                          placeholder="Enter your phone number"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-md">
                          {profileData.phone || 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      {editMode ? (
                        <Input
                          id="age"
                          name="age"
                          type="number"
                          min="13"
                          max="100"
                          value={profileData.age}
                          onChange={handleInputChange}
                          placeholder="Enter your age"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-md">
                          {profileData.age ? `${profileData.age} years old` : 'Not provided'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skin_type">Skin Type</Label>
                    {editMode ? (
                      <Select value={profileData.skin_type} onValueChange={(value) => handleSelectChange('skin_type', value)}>
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
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-md">
                        {profileData.skin_type ? (
                          {
                            dry: 'Dry',
                            oily: 'Oily',
                            combination: 'Combination',
                            sensitive: 'Sensitive',
                            normal: 'Normal'
                          }[profileData.skin_type]
                        ) : 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    {editMode ? (
                      <Textarea
                        id="bio"
                        name="bio"
                        value={profileData.bio}
                        onChange={handleInputChange}
                        placeholder="Tell us about yourself"
                        rows={3}
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-md min-h-[80px]">
                        {profileData.bio || 'Not provided'}
                      </div>
                    )}
                  </div>
                </div>

                {/* SNS Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Instagram className="h-5 w-5 mr-2" />
                    Social Media
                  </h3>

                  {/* Instagram */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="instagram_url">Instagram URL</Label>
                      {editMode ? (
                        <Input
                          id="instagram_url"
                          name="instagram_url"
                          value={profileData.instagram_url}
                          onChange={handleInputChange}
                          placeholder="https://instagram.com/username"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-md">
                          {profileData.instagram_url ? (
                            <a href={profileData.instagram_url} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                              {profileData.instagram_url}
                            </a>
                          ) : 'Not provided'}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagram_followers">Instagram Followers</Label>
                      {editMode ? (
                        <Input
                          id="instagram_followers"
                          name="instagram_followers"
                          type="number"
                          min="0"
                          value={profileData.instagram_followers}
                          onChange={handleInputChange}
                          placeholder="1000"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-md">
                          {profileData.instagram_followers ? profileData.instagram_followers.toLocaleString() : 'Not provided'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* TikTok */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tiktok_url">TikTok URL</Label>
                      {editMode ? (
                        <Input
                          id="tiktok_url"
                          name="tiktok_url"
                          value={profileData.tiktok_url}
                          onChange={handleInputChange}
                          placeholder="https://tiktok.com/@username"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-md">
                          {profileData.tiktok_url ? (
                            <a href={profileData.tiktok_url} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                              {profileData.tiktok_url}
                            </a>
                          ) : 'Not provided'}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tiktok_followers">TikTok Followers</Label>
                      {editMode ? (
                        <Input
                          id="tiktok_followers"
                          name="tiktok_followers"
                          type="number"
                          min="0"
                          value={profileData.tiktok_followers}
                          onChange={handleInputChange}
                          placeholder="1000"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-md">
                          {profileData.tiktok_followers ? profileData.tiktok_followers.toLocaleString() : 'Not provided'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* YouTube */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="youtube_url">YouTube URL</Label>
                      {editMode ? (
                        <Input
                          id="youtube_url"
                          name="youtube_url"
                          value={profileData.youtube_url}
                          onChange={handleInputChange}
                          placeholder="https://youtube.com/@username"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-md">
                          {profileData.youtube_url ? (
                            <a href={profileData.youtube_url} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                              {profileData.youtube_url}
                            </a>
                          ) : 'Not provided'}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="youtube_followers">YouTube Subscribers</Label>
                      {editMode ? (
                        <Input
                          id="youtube_followers"
                          name="youtube_followers"
                          type="number"
                          min="0"
                          value={profileData.youtube_followers}
                          onChange={handleInputChange}
                          placeholder="1000"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-md">
                          {profileData.youtube_followers ? profileData.youtube_followers.toLocaleString() : 'Not provided'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications">
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>My Campaign Applications</span>
                </CardTitle>
                <CardDescription>
                  View your campaign applications and access shooting guides.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {applications.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📋</div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      No applications yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Apply to campaigns and start creating!
                    </p>
                    <Link to="/">
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        Browse Campaigns
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {applications.map((application) => (
                      <Card key={application.id} className="border border-gray-200 overflow-hidden">
                        <CardContent className="p-0">
                          {/* Campaign Header */}
                          <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-gray-800 mb-1">
                                  {application.campaigns?.title}
                                </h4>
                                <p className="text-purple-600 font-medium mb-2">
                                  {application.campaigns?.brand}
                                </p>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <span>Applied: {formatDate(application.created_at)}</span>
                                  <span>Reward: {formatCurrency(application.campaigns?.reward_amount)}</span>
                                </div>
                              </div>

                              <div className="text-right">
                                {getStatusBadge(application.status)}
                              </div>
                            </div>
                          </div>

                          {/* Approved Campaign Actions */}
                          {(application.status === 'approved' || application.status === 'completed') && (
                            <div className="p-6 border-t border-gray-100">
                              {/* SNS Upload Warning */}
                              <Alert className="mb-4 border-orange-200 bg-orange-50">
                                <AlertTriangle className="h-4 w-4 text-orange-600" />
                                <AlertDescription className="text-orange-800">
                                  <strong>Important:</strong> Before uploading to your SNS, please ensure your video has been reviewed and approved for any revision requests. Do not post until the final version is confirmed.
                                </AlertDescription>
                              </Alert>

                              {/* Action Buttons */}
                              <div className="flex flex-wrap gap-3 mb-4">
                                {hasGuide(application) && (
                                  <Button
                                    variant="outline"
                                    onClick={() => toggleGuideExpand(application.id)}
                                    className="flex items-center"
                                  >
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    Shooting Guide
                                    {expandedGuides[application.id] ? (
                                      <ChevronUp className="h-4 w-4 ml-2" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4 ml-2" />
                                    )}
                                  </Button>
                                )}

                                <Button
                                  onClick={() => openVideoUploadModal(application)}
                                  className="bg-purple-600 hover:bg-purple-700"
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  {application.video_submission_url ? 'Update Video' : 'Submit Video'}
                                </Button>

                                {application.video_submission_url && (
                                  <a href={application.video_submission_url} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline">
                                      <ExternalLink className="h-4 w-4 mr-2" />
                                      View Submitted Video
                                    </Button>
                                  </a>
                                )}
                              </div>

                              {/* Video Submission Status */}
                              {application.video_submission_url && (
                                <div className="flex items-center text-sm text-green-600 mb-4">
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Video submitted on {formatDate(application.video_submitted_at)}
                                </div>
                              )}

                              {/* Revision Request Alert */}
                              {application.revision_requested && (
                                <Alert className="mb-4 border-red-200 bg-red-50">
                                  <AlertCircle className="h-4 w-4 text-red-600" />
                                  <AlertDescription className="text-red-800">
                                    <strong>Revision Requested:</strong> {application.revision_notes || 'Please check with the brand for revision details.'}
                                  </AlertDescription>
                                </Alert>
                              )}

                              {/* Expandable Shooting Guide */}
                              {expandedGuides[application.id] && hasGuide(application) && (
                                <div className="mt-4 border-t pt-4">
                                  <h5 className="font-semibold text-gray-800 mb-4 flex items-center">
                                    <BookOpen className="h-5 w-5 mr-2 text-purple-600" />
                                    Shooting Guide
                                  </h5>

                                  {/* General Tips */}
                                  {application.campaigns?.shooting_guide?.general_tips_en && (
                                    <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                                      <h6 className="font-medium text-purple-800 mb-2 flex items-center">
                                        <Lightbulb className="h-4 w-4 mr-2" />
                                        General Tips
                                      </h6>
                                      <p className="text-purple-700 text-sm">
                                        {application.campaigns.shooting_guide.general_tips_en}
                                      </p>
                                    </div>
                                  )}

                                  {/* Scenes */}
                                  <div className="space-y-4">
                                    {application.campaigns?.shooting_guide?.scenes?.map((scene, index) => (
                                      <div key={index} className="border rounded-lg overflow-hidden">
                                        <div className="bg-gray-100 px-4 py-3 flex items-center justify-between">
                                          <h6 className="font-semibold text-gray-800">
                                            Scene {scene.scene_number || index + 1}: {scene.title_en || scene.title}
                                          </h6>
                                          {scene.duration && (
                                            <Badge variant="secondary" className="flex items-center">
                                              <Clock className="h-3 w-3 mr-1" />
                                              {scene.duration}
                                            </Badge>
                                          )}
                                        </div>
                                        <div className="p-4 space-y-4">
                                          {/* Scene Description */}
                                          {(scene.description_en || scene.description) && (
                                            <div>
                                              <h6 className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                                                <Camera className="h-4 w-4 mr-2 text-blue-600" />
                                                What to Film
                                              </h6>
                                              <p className="text-gray-600 text-sm pl-6">
                                                {scene.description_en || scene.description}
                                              </p>
                                            </div>
                                          )}

                                          {/* Script */}
                                          {(scene.script_en || scene.script) && (
                                            <div>
                                              <h6 className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                                                <MessageSquare className="h-4 w-4 mr-2 text-green-600" />
                                                Script / What to Say
                                              </h6>
                                              <div className="bg-green-50 p-3 rounded-md pl-6">
                                                <p className="text-gray-700 text-sm italic">
                                                  "{scene.script_en || scene.script}"
                                                </p>
                                              </div>
                                            </div>
                                          )}

                                          {/* Tips */}
                                          {(scene.tips_en || scene.tips) && (
                                            <div>
                                              <h6 className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                                                <Lightbulb className="h-4 w-4 mr-2 text-yellow-600" />
                                                Tips
                                              </h6>
                                              <p className="text-gray-600 text-sm pl-6">
                                                {scene.tips_en || scene.tips}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* No Guide Available */}
                              {!hasGuide(application) && (
                                <div className="text-sm text-gray-500 italic">
                                  Shooting guide will be available soon. Please check back later.
                                </div>
                              )}
                            </div>
                          )}

                          {/* Pending/Rejected Status Info */}
                          {application.status === 'pending' && (
                            <div className="p-6 border-t border-gray-100">
                              <div className="flex items-center text-sm text-gray-600">
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Your application is being reviewed. We'll notify you once a decision is made.
                              </div>
                            </div>
                          )}

                          {application.status === 'rejected' && (
                            <div className="p-6 border-t border-gray-100">
                              <div className="flex items-center text-sm text-gray-600">
                                <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                                Unfortunately, your application was not selected for this campaign.
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards">
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Rewards & Points</span>
                </CardTitle>
                <CardDescription>
                  Your earnings from campaign participation and withdrawal history.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Available Balance</p>
                      <p className="text-3xl font-bold text-purple-600">{formatCurrency(userProfile?.points || 0)}</p>
                    </div>
                    <Button
                      onClick={() => setWithdrawalModalOpen(true)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Withdraw
                    </Button>
                  </div>
                </div>

                <Separator />

                <WithdrawalHistory userId={user?.id} />
              </CardContent>
            </Card>

            {/* Withdrawal Modal */}
            <WithdrawalModal
              isOpen={withdrawalModalOpen}
              onClose={() => setWithdrawalModalOpen(false)}
              userId={user?.id}
              availablePoints={userProfile?.points || 0}
              onSuccess={() => {
                setSuccess('Withdrawal request submitted. Processing takes 3-5 business days.')
                setTimeout(() => setSuccess(''), 5000)
                loadPageData()
              }}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Video Upload Modal */}
      <Dialog open={videoUploadModal} onOpenChange={setVideoUploadModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Video className="h-5 w-5 mr-2" />
              Submit Your Video
            </DialogTitle>
            <DialogDescription>
              Enter the URL of your video (Google Drive, YouTube, Dropbox, etc.)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video URL</Label>
              <Input
                id="videoUrl"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
              />
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-sm">
                Make sure your video link is accessible (set sharing permissions to "Anyone with the link").
              </AlertDescription>
            </Alert>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setVideoUploadModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleVideoSubmit}
              disabled={uploadingVideo || !videoUrl.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {uploadingVideo ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Submit Video
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default MyPage
