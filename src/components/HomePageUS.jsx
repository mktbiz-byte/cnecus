import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { database } from '../lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Loader2, Users, Target, Award, TrendingUp,
  Instagram, Youtube, Hash, Twitter, Calendar,
  DollarSign, ArrowRight, CheckCircle, Menu, X
} from 'lucide-react'

const HomePageUS = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [campaigns, setCampaigns] = useState([])
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalUsers: 0,
    totalApplications: 0,
    totalRewards: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [detailModal, setDetailModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    loadPageData()
  }, [])

  const loadPageData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [campaignsData, statsData] = await Promise.all([
        loadCampaigns(),
        loadStats()
      ])
    } catch (error) {
      console.error('Load page data error:', error)
      setError(error.message)
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
      return activeCampaigns
    } catch (error) {
      console.error('Load campaigns error:', error)
      setCampaigns([])
      return []
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await database.stats.getOverall()
      setStats(statsData || {
        totalCampaigns: 0,
        totalUsers: 0,
        totalApplications: 0,
        totalRewards: 0
      })
      return statsData
    } catch (error) {
      console.error('Load stats error:', error)
      setStats({
        totalCampaigns: 0,
        totalUsers: 0,
        totalApplications: 0,
        totalRewards: 0
      })
      return {}
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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

  const getPlatformBadge = (platform) => {
    const platformStyles = {
      instagram: 'bg-pink-100 text-pink-800',
      tiktok: 'bg-purple-100 text-purple-800',
      youtube: 'bg-red-100 text-red-800',
      twitter: 'bg-blue-100 text-blue-800'
    }

    return (
      <Badge className={platformStyles[platform?.toLowerCase()] || 'bg-gray-100 text-gray-800'}>
        {platform?.charAt(0).toUpperCase() + platform?.slice(1)}
      </Badge>
    )
  }

  const getActivePlatforms = (targetPlatforms) => {
    if (!targetPlatforms) return ['instagram']
    const platforms = []
    if (targetPlatforms.instagram) platforms.push('instagram')
    if (targetPlatforms.tiktok) platforms.push('tiktok')
    if (targetPlatforms.youtube) platforms.push('youtube')
    return platforms.length > 0 ? platforms : ['instagram']
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🎬</div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">CNEC</h1>
                <p className="text-xs text-gray-600">K-Beauty × Short-Form Video</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-6">
              <a href="#campaigns" className="text-gray-600 hover:text-purple-600 transition-colors">
                Campaigns
              </a>
              <a href="#about" className="text-gray-600 hover:text-purple-600 transition-colors">
                About
              </a>
              <a href="#contact" className="text-gray-600 hover:text-purple-600 transition-colors">
                Contact
              </a>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">{user.email}</span>
                  <Link to="/mypage">
                    <Button variant="outline" size="sm">
                      My Page
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={signOut}>
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <Button variant="outline" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t pt-4">
              <div className="flex flex-col space-y-2">
                <a href="#campaigns" className="text-gray-600 hover:text-purple-600 py-2">Campaigns</a>
                <a href="#about" className="text-gray-600 hover:text-purple-600 py-2">About</a>
                <a href="#contact" className="text-gray-600 hover:text-purple-600 py-2">Contact</a>
                {user ? (
                  <>
                    <Link to="/mypage">
                      <Button variant="outline" className="w-full justify-start">My Page</Button>
                    </Link>
                    <Button variant="outline" className="w-full justify-start" onClick={signOut}>
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login">
                      <Button variant="outline" className="w-full justify-start">Sign In</Button>
                    </Link>
                    <Link to="/signup">
                      <Button className="w-full justify-start bg-purple-600 hover:bg-purple-700">Sign Up</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
            K-Beauty × Short-Form Video<br />
            <span className="text-purple-600">Creator Platform</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with top K-Beauty brands and create authentic content that earns you real money
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                Join as Creator
              </Button>
            </Link>
            <Button variant="outline" size="lg" onClick={() => document.getElementById('campaigns')?.scrollIntoView({ behavior: 'smooth' })}>
              View Campaigns
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="pt-6">
                <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {stats.totalCampaigns || 0}
                </div>
                <div className="text-gray-600">Total Campaigns</div>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardContent className="pt-6">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {stats.totalUsers || 0}
                </div>
                <div className="text-gray-600">Total Creators</div>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardContent className="pt-6">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {stats.totalApplications || 0}
                </div>
                <div className="text-gray-600">Total Applications</div>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardContent className="pt-6">
                <Award className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {formatCurrency(stats.totalRewards)}
                </div>
                <div className="text-gray-600">Total Rewards</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Campaigns Section */}
      <section id="campaigns" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Active Campaigns
            </h2>
            <p className="text-gray-600">
              Apply to the latest K-Beauty brand campaigns and start earning
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-400 text-6xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-red-600 mb-2">Failed to load campaigns</h3>
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={loadPageData} variant="outline">
                Try Again
              </Button>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No active campaigns at the moment
              </h3>
              <p className="text-gray-500">
                Check back soon for new opportunities!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {campaigns.map((campaign) => (
                <Card
                  key={campaign.id}
                  className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg cursor-pointer overflow-hidden"
                  onClick={() => handleCampaignClick(campaign)}
                >
                  {campaign.image_url && (
                    <div className="w-full h-48 overflow-hidden bg-gray-100">
                      <img
                        src={campaign.image_url}
                        alt={campaign.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Recruiting
                      </Badge>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(campaign.reward_amount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Reward
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{campaign.title}</CardTitle>
                    <CardDescription className="text-purple-600 font-medium">
                      {campaign.brand}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {campaign.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {getActivePlatforms(campaign.target_platforms).map((platform) => (
                        <span key={platform}>
                          {getPlatformBadge(platform)}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Calendar className="h-4 w-4 mr-2" />
                      Deadline: {formatDate(campaign.deadline || campaign.end_date)}
                    </div>

                    <Button
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleApply(campaign.id)
                      }}
                    >
                      Apply Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              What is CNEC?
            </h2>
            <p className="text-gray-600">
              A specialized platform connecting K-Beauty brands with content creators
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="pt-8">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold mb-2">
                  Specialized Marketing
                </h3>
                <p className="text-gray-600">
                  Focused exclusively on K-Beauty for effective brand promotions
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardContent className="pt-8">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-xl font-semibold mb-2">
                  Short-Form Video Focus
                </h3>
                <p className="text-gray-600">
                  Optimized for TikTok, Instagram Reels, and YouTube Shorts
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardContent className="pt-8">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="text-xl font-semibold mb-2">
                  Reliable Support
                </h3>
                <p className="text-gray-600">
                  Full service support for both brands and creators
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Contact Us
          </h2>
          <p className="text-gray-600 mb-8">
            Have questions or need help? We're here for you
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700" asChild>
              <a href="mailto:support@cnec-us.com">
                Email Us
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="tel:+1-800-CNEC-USA">
                Call Us
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="text-2xl">🎬</div>
                <div className="text-xl font-bold">CNEC</div>
              </div>
              <p className="text-gray-400">
                K-Beauty × Short-Form Video Creator Platform
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#campaigns" className="hover:text-white transition-colors">Campaigns</a></li>
                <li><Link to="/signup" className="hover:text-white transition-colors">
                  Creator Registration
                </Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Email: support@cnec-us.com</li>
                <li>Tel: +1-800-CNEC-USA</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 CNEC. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <Dialog open={detailModal} onOpenChange={setDetailModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedCampaign.title}</DialogTitle>
              <DialogDescription className="text-purple-600 font-medium">
                {selectedCampaign.brand}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {selectedCampaign.image_url && (
                <div className="w-full h-48 overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={selectedCampaign.image_url}
                    alt={selectedCampaign.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Reward</div>
                  <div className="text-2xl font-bold text-purple-700">
                    {formatCurrency(selectedCampaign.reward_amount)}
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Spots Available</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {selectedCampaign.max_participants || selectedCampaign.total_slots || 'Open'}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-purple-600" />
                  Campaign Description
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedCampaign.description}</p>
              </div>

              {selectedCampaign.requirements && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    Requirements
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedCampaign.requirements}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {getActivePlatforms(selectedCampaign.target_platforms).map((platform) => (
                  <span key={platform}>
                    {getPlatformBadge(platform)}
                  </span>
                ))}
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                Application Deadline: {formatDate(selectedCampaign.deadline || selectedCampaign.end_date)}
              </div>

              <Button
                className="w-full bg-purple-600 hover:bg-purple-700"
                size="lg"
                onClick={() => {
                  setDetailModal(false)
                  handleApply(selectedCampaign.id)
                }}
              >
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
