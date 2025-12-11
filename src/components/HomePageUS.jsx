import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { database } from '../lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Loader2, Play, Users, Target, Shield,
  Instagram, Youtube, Hash, Twitter, ExternalLink,
  Star, Award, Calendar, DollarSign, Eye, ArrowRight,
  CheckCircle, Clock, MapPin, Phone, Mail, User, Zap,
  Menu, X, Sparkles, TrendingUp, Video, Upload, Wallet
} from 'lucide-react'

const HomePageUS = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  
  const [campaigns, setCampaigns] = useState([])
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalCreators: 0,
    totalApplications: 0,
    totalRewards: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [detailModal, setDetailModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    loadPageData()
  }, [])

  const loadPageData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        loadCampaigns(),
        loadStats()
      ])
    } catch (error) {
      console.error('Page data load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCampaigns = async () => {
    try {
      const campaignsData = await database.campaigns.getAll()
      const activeCampaigns = campaignsData?.filter(campaign => 
        campaign.status === 'active' && campaign.platform_region === 'us'
      ) || []
      setCampaigns(activeCampaigns)
    } catch (error) {
      console.error('Load campaigns error:', error)
      setCampaigns([])
    }
  }

  const loadStats = async () => {
    try {
      const [campaignsData, applicationsData, usersData] = await Promise.all([
        database.campaigns.getAll(),
        database.applications.getAll(),
        database.userProfiles.getAll()
      ])
      
      const allCampaigns = campaignsData?.filter(c => c.platform_region === 'us') || []
      const applications = applicationsData || []
      const users = usersData?.filter(u => u.platform_region === 'us') || []
      
      const campaignMultiplier = import.meta.env.VITE_STATS_CAMPAIGN_MULTIPLIER || 50
      const creatorMultiplier = import.meta.env.VITE_STATS_CREATOR_MULTIPLIER || 500
      const applicationMultiplier = import.meta.env.VITE_STATS_APPLICATION_MULTIPLIER || 1000
      const rewardMultiplier = import.meta.env.VITE_STATS_REWARD_MULTIPLIER || 100
      
      const baseCampaigns = Math.max(allCampaigns.length, 1)
      const baseCreators = Math.max(users.length, 1)
      const baseApplications = Math.max(applications.length, 1)
      const baseRewards = Math.max(allCampaigns.reduce((sum, campaign) => sum + (campaign.reward_amount || 0), 0), 1000)
      
      setStats({
        totalCampaigns: baseCampaigns * parseInt(campaignMultiplier),
        totalCreators: baseCreators * parseInt(creatorMultiplier),
        totalApplications: baseApplications * parseInt(applicationMultiplier),
        totalRewards: baseRewards * parseInt(rewardMultiplier)
      })
    } catch (error) {
      console.error('Load stats error:', error)
      setStats({
        totalCampaigns: 50,
        totalCreators: 2500,
        totalApplications: 5000,
        totalRewards: 250000
      })
    }
  }

  const handleCampaignClick = (campaign) => {
    setSelectedCampaign(campaign)
    setDetailModal(true)
  }

  const handleApply = (campaignId) => {
    if (!user) {
      navigate('/login')
      return
    }
    navigate(`/campaign-application?campaign_id=${campaignId}`)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'instagram':
        return <Instagram className="h-4 w-4" />
      case 'tiktok':
        return <Hash className="h-4 w-4" />
      case 'youtube':
        return <Youtube className="h-4 w-4" />
      case 'twitter':
        return <Twitter className="h-4 w-4" />
      default:
        return <Target className="h-4 w-4" />
    }
  }

  const getPlatformColor = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'instagram':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
      case 'tiktok':
        return 'bg-black text-white'
      case 'youtube':
        return 'bg-red-600 text-white'
      case 'twitter':
        return 'bg-blue-400 text-white'
      default:
        return 'bg-gray-600 text-white'
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🇺🇸</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CNEC USA</h1>
                <p className="text-xs text-gray-600">K-Beauty Creator Network</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-3">
              <Button variant="ghost" className="text-gray-700">
                <a href="#campaigns">Campaigns</a>
              </Button>
              <Button variant="ghost" className="text-gray-700">
                <a href="#how-it-works">How It Works</a>
              </Button>
              {user ? (
                <>
                  <Button variant="outline">
                    <Link to="/mypage">Dashboard</Link>
                  </Button>
                  <Button variant="ghost" onClick={signOut}>Sign Out</Button>
                </>
              ) : (
                <>
                  <Button variant="outline">
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Link to="/signup">Start Earning</Link>
                  </Button>
                </>
              )}
            </nav>

            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t pt-4">
              <div className="flex flex-col space-y-2">
                <Button variant="ghost" className="justify-start">
                  <a href="#campaigns">Campaigns</a>
                </Button>
                <Button variant="ghost" className="justify-start">
                  <a href="#how-it-works">How It Works</a>
                </Button>
                {user ? (
                  <>
                    <Button variant="outline" className="justify-start">
                      <Link to="/mypage">Dashboard</Link>
                    </Button>
                    <Button variant="ghost" className="justify-start" onClick={signOut}>
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="justify-start">
                      <Link to="/login">Sign In</Link>
                    </Button>
                    <Button className="justify-start bg-blue-600 text-white">
                      <Link to="/signup">Start Earning</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - NEW */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            {/* Trust Badge */}
            <Badge className="mb-6 bg-green-100 text-green-800 px-4 py-2 text-sm border-0">
              <CheckCircle className="h-4 w-4 mr-2 inline" />
              Direct Payment · No Middleman · Weekly Payouts
            </Badge>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
              Get Paid Fast for<br />Your Content
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
              Create short-form videos for K-beauty brands and receive <span className="font-semibold text-blue-600">weekly payments directly to your bank account</span>. No delays, no hassle.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6">
                <Link to="/signup" className="flex items-center">
                  Start Earning Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                <a href="#how-it-works">See How It Works</a>
              </Button>
            </div>

            {/* Social Proof Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              <div>
                <div className="text-3xl font-bold text-gray-900">{stats.totalCreators.toLocaleString()}+</div>
                <div className="text-sm text-gray-600">Active Creators</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalRewards)}</div>
                <div className="text-sm text-gray-600">Paid Out</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{stats.totalCampaigns}+</div>
                <div className="text-sm text-gray-600">Campaigns</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">4.8★</div>
                <div className="text-sm text-gray-600">Creator Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - NEW */}
      <section id="how-it-works" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">How It Works</h2>
            <p className="text-xl text-gray-600">Four simple steps to start earning</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-sm font-semibold text-blue-600 mb-2">STEP 1</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Apply</h3>
              <p className="text-gray-600">Browse campaigns and apply to brands you love</p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-sm font-semibold text-purple-600 mb-2">STEP 2</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Create</h3>
              <p className="text-gray-600">Film authentic short-form content following brand guidelines</p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-pink-600" />
              </div>
              <div className="text-sm font-semibold text-pink-600 mb-2">STEP 3</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Upload</h3>
              <p className="text-gray-600">Post to your social media and submit proof</p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-sm font-semibold text-green-600 mb-2">STEP 4</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Get Paid</h3>
              <p className="text-gray-600">Receive weekly payments directly to your account</p>
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Payouts Section - NEW */}
      <section className="py-20 px-4 bg-gradient-to-br from-green-50 to-white">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-green-100 text-green-800 border-0">
                  <CheckCircle className="h-4 w-4 mr-2 inline" />
                  Reliable Weekly Payments
                </Badge>
                <h2 className="text-4xl font-bold mb-6 text-gray-900">
                  Consistent Income<br />Every Week
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Get paid every week like clockwork. No waiting months for payment. No hidden fees. No middleman taking a cut.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-gray-900">Direct Bank Transfer</div>
                      <div className="text-gray-600">Money goes straight to your account</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-gray-900">Transparent Tracking</div>
                      <div className="text-gray-600">See your earnings in real-time</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-gray-900">No Minimum Payout</div>
                      <div className="text-gray-600">Get paid regardless of amount</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-xl p-8">
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-gray-900 mb-2">$500-$2,000</div>
                  <div className="text-gray-600">Average monthly earnings</div>
                </div>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4 flex justify-between items-center">
                    <span className="text-gray-600">Week 1</span>
                    <span className="font-semibold text-gray-900">$350</span>
                  </div>
                  <div className="bg-white rounded-lg p-4 flex justify-between items-center">
                    <span className="text-gray-600">Week 2</span>
                    <span className="font-semibold text-gray-900">$420</span>
                  </div>
                  <div className="bg-white rounded-lg p-4 flex justify-between items-center">
                    <span className="text-gray-600">Week 3</span>
                    <span className="font-semibold text-gray-900">$380</span>
                  </div>
                  <div className="bg-white rounded-lg p-4 flex justify-between items-center">
                    <span className="text-gray-600">Week 4</span>
                    <span className="font-semibold text-gray-900">$450</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Active Campaigns Section */}
      <section id="campaigns" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Active Campaigns</h2>
            <p className="text-xl text-gray-600">Start earning with these K-beauty brands</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-20">
              <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600 mb-4">No active campaigns at the moment</p>
              <p className="text-gray-500">Check back soon for new opportunities!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-lg transition-shadow cursor-pointer border-2" onClick={() => handleCampaignClick(campaign)}>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={`${getPlatformColor(campaign.platform_type)} flex items-center gap-1`}>
                        {getPlatformIcon(campaign.platform_type)}
                        {campaign.platform_type}
                      </Badge>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {formatCurrency(campaign.reward_amount)}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{campaign.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{campaign.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        Apply by {formatDate(campaign.deadline)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        {campaign.slots_filled || 0} / {campaign.total_slots} spots filled
                      </div>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={(e) => {
                        e.stopPropagation()
                        handleApply(campaign.id)
                      }}>
                        Apply Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Earning?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of creators who are already making money with K-beauty brands
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
            <Link to="/signup" className="flex items-center">
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <Dialog open={detailModal} onOpenChange={setDetailModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedCampaign.title}</DialogTitle>
              <DialogDescription>
                <Badge className={`${getPlatformColor(selectedCampaign.platform_type)} mt-2`}>
                  {getPlatformIcon(selectedCampaign.platform_type)}
                  <span className="ml-1">{selectedCampaign.platform_type}</span>
                </Badge>
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Reward</div>
                  <div className="text-2xl font-bold text-green-700">{formatCurrency(selectedCampaign.reward_amount)}</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Spots Available</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {(selectedCampaign.total_slots - (selectedCampaign.slots_filled || 0))} / {selectedCampaign.total_slots}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Campaign Description
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedCampaign.description}</p>
              </div>

              {selectedCampaign.requirements && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Requirements
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedCampaign.requirements}</p>
                </div>
              )}

              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                Application Deadline: {formatDate(selectedCampaign.deadline)}
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="lg" onClick={() => {
                setDetailModal(false)
                handleApply(selectedCampaign.id)
              }}>
                Apply to This Campaign
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default HomePageUS
