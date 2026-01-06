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
  DollarSign, ArrowRight, CheckCircle, Menu, X,
  Shield, Star, Clock, Zap, Heart, Home, Search, User
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
      await Promise.all([loadCampaigns(), loadStats()])
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
      const now = new Date()
      const activeCampaigns = campaignsData?.filter(campaign => {
        // Check if campaign is active and belongs to US region
        if (campaign.status !== 'active' || campaign.platform_region !== 'us') {
          return false
        }
        // Check if application deadline has not passed (prioritize application_deadline field)
        const applicationDeadline = campaign.application_deadline || campaign.deadline || campaign.end_date
        if (applicationDeadline) {
          const deadlineDate = new Date(applicationDeadline)
          if (deadlineDate < now) {
            return false // Application deadline has passed, hide this campaign
          }
        }
        return true
      }) || []
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
      const [campaignsData, applicationsData, usersData] = await Promise.all([
        database.campaigns.getAll(),
        database.applications.getAll(),
        database.userProfiles.getAll()
      ])
      const usCampaigns = campaignsData?.filter(c => c.platform_region === 'us') || []
      const usUsers = usersData?.filter(u => u.platform_region === 'us') || []
      const totalRewards = usCampaigns.reduce((sum, c) => sum + (c.reward_amount || 0), 0)
      setStats({
        totalCampaigns: usCampaigns.length,
        totalUsers: usUsers.length,
        totalApplications: applicationsData?.length || 0,
        totalRewards: totalRewards
      })
    } catch (error) {
      console.error('Load stats error:', error)
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
      month: 'short',
      day: 'numeric'
    })
  }

  // Calculate days until deadline
  const getDaysRemaining = (deadline) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Get D-day urgency badge (only show for 3 days or less before deadline)
  const getUrgencyBadge = (deadline) => {
    if (!deadline) return null
    const days = getDaysRemaining(deadline)
    // Only show D-day badge for 3 days or less (D-3, D-2, D-1, D-Day)
    if (days <= 3 && days > 0) {
      return (
        <Badge className="bg-red-500 text-white animate-pulse font-bold shadow-lg">
          <Clock className="w-3 h-3 mr-1" />
          D-{days}
        </Badge>
      )
    } else if (days === 0) {
      return (
        <Badge className="bg-red-600 text-white animate-pulse font-bold shadow-lg">
          <Clock className="w-3 h-3 mr-1" />
          D-Day
        </Badge>
      )
    }
    return null
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
      case 'instagram': return <Instagram className="h-4 w-4" />
      case 'tiktok': return <Hash className="h-4 w-4" />
      case 'youtube': return <Youtube className="h-4 w-4" />
      case 'twitter': return <Twitter className="h-4 w-4" />
      default: return <Target className="h-4 w-4" />
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
      <Badge key={platform} variant="secondary" className={platformStyles[platform?.toLowerCase()] || 'bg-gray-100 text-gray-800'}>
        {getPlatformIcon(platform)}
        <span className="ml-1 capitalize">{platform}</span>
      </Badge>
    )
  }

  const getActivePlatforms = (targetPlatforms) => {
    if (!targetPlatforms || typeof targetPlatforms !== 'object') return ['instagram']
    const platforms = []
    if (targetPlatforms.instagram) platforms.push('instagram')
    if (targetPlatforms.tiktok) platforms.push('tiktok')
    if (targetPlatforms.youtube) platforms.push('youtube')
    return platforms.length > 0 ? platforms : ['instagram']
  }

  // Testimonials data
  const testimonials = [
    {
      name: "Sarah M.",
      role: "Beauty Creator",
      followers: "125K",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      text: "CNEC changed my career! I've worked with 10+ K-Beauty brands and earned over $5,000 in just 3 months.",
      rating: 5
    },
    {
      name: "Emily C.",
      role: "Skincare Influencer",
      followers: "89K",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      text: "The best platform for K-Beauty collaborations. Fast payments, great brands, and amazing support team!",
      rating: 5
    },
    {
      name: "Jessica L.",
      role: "TikTok Creator",
      followers: "250K",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
      text: "Finally a platform that understands short-form content! PayPal payments are so convenient.",
      rating: 5
    }
  ]

  // Partner brands
  const partnerBrands = [
    "COSRX", "innisfree", "Laneige", "ETUDE", "Missha", "Some By Mi", "Torriden", "Anua"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pb-16 md:pb-0">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🎬</div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">CNEC</h1>
                <p className="text-xs text-gray-600">K-Beauty Creator Platform</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-6">
              <a href="#campaigns" className="text-gray-600 hover:text-purple-600 transition-colors">Campaigns</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-purple-600 transition-colors">How It Works</a>
              <a href="#testimonials" className="text-gray-600 hover:text-purple-600 transition-colors">Reviews</a>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">{user.email}</span>
                  <Link to="/mypage">
                    <Button variant="outline" size="sm">My Page</Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={signOut}>Sign Out</Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <Button variant="outline" size="sm">Sign In</Button>
                  </Link>
                  <Link to="/signup">
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>

            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t pt-4">
              <div className="flex flex-col space-y-2">
                <a href="#campaigns" className="text-gray-600 hover:text-purple-600 py-2">Campaigns</a>
                <a href="#how-it-works" className="text-gray-600 hover:text-purple-600 py-2">How It Works</a>
                <a href="#testimonials" className="text-gray-600 hover:text-purple-600 py-2">Reviews</a>
                {user ? (
                  <>
                    <Link to="/mypage"><Button variant="outline" className="w-full justify-start">My Page</Button></Link>
                    <Button variant="outline" className="w-full justify-start" onClick={signOut}>Sign Out</Button>
                  </>
                ) : (
                  <>
                    <Link to="/login"><Button variant="outline" className="w-full justify-start">Sign In</Button></Link>
                    <Link to="/signup"><Button className="w-full justify-start bg-purple-600 hover:bg-purple-700">Sign Up</Button></Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - Compact */}
      <section className="py-10 md:py-16 text-center relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          {/* Social Proof Badge */}
          <div className="inline-flex items-center bg-white/90 rounded-full px-4 py-2 shadow-md mb-4">
            <div className="flex -space-x-2 mr-3">
              {[1,2,3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 border-2 border-white" />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-700">
              <span className="text-purple-600 font-bold">2,500+</span> creators
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
            K-Beauty <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Collaborations</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
            Create content with top Korean beauty brands & get paid via PayPal
          </p>

          {/* Trust Badges - Inline */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <div className="flex items-center text-xs text-gray-600 bg-white/80 rounded-full px-3 py-1.5">
              <Shield className="h-3 w-3 text-green-600 mr-1" />
              Secure
            </div>
            <div className="flex items-center text-xs text-gray-600 bg-white/80 rounded-full px-3 py-1.5">
              <Zap className="h-3 w-3 text-yellow-600 mr-1" />
              Fast Approval
            </div>
            <div className="flex items-center text-xs text-gray-600 bg-white/80 rounded-full px-3 py-1.5">
              <DollarSign className="h-3 w-3 text-green-600 mr-1" />
              PayPal
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 px-6">
                Start Earning
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Campaigns Section - MOVED UP & COMPACT CARDS */}
      <section id="campaigns" className="py-8 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">Active Campaigns</h2>
              <p className="text-sm text-gray-600">Apply to K-Beauty campaigns</p>
            </div>
            <Badge variant="outline" className="text-purple-600 border-purple-200">
              {campaigns.length} open
            </Badge>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-purple-600" />
              <p className="text-sm text-gray-600">Loading...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-400 text-4xl mb-2">⚠️</div>
              <p className="text-sm text-red-600 mb-2">Failed to load</p>
              <Button onClick={loadPageData} variant="outline" size="sm">Retry</Button>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-2">📋</div>
              <p className="text-sm text-gray-600">No active campaigns</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {campaigns.map((campaign) => (
                <Card
                  key={campaign.id}
                  className="hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 border-0 shadow-md cursor-pointer overflow-hidden group"
                  onClick={() => handleCampaignClick(campaign)}
                >
                  {/* Compact Image */}
                  <div className="relative">
                    {campaign.image_url ? (
                      <div className="w-full aspect-square overflow-hidden bg-gray-100">
                        <img
                          src={campaign.image_url}
                          alt={campaign.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="w-full aspect-square bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                        <span className="text-4xl">✨</span>
                      </div>
                    )}

                    {/* D-day Urgency Badge - Top Left (only shown for 3 days or less) */}
                    <div className="absolute top-2 left-2">
                      {getUrgencyBadge(campaign.application_deadline || campaign.deadline || campaign.end_date)}
                    </div>

                    {/* Reward Badge - Top Right */}
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-purple-600 text-white text-xs font-bold">
                        {formatCurrency(campaign.reward_amount)}
                      </Badge>
                    </div>
                  </div>

                  {/* Compact Content */}
                  <div className="p-3">
                    <div className="flex items-center gap-1 mb-1">
                      <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs px-1.5 py-0">
                        <Zap className="w-2.5 h-2.5" />
                      </Badge>
                      <span className="text-xs text-purple-600 font-medium truncate">{campaign.brand}</span>
                    </div>

                    <h3 className="font-semibold text-sm text-gray-800 line-clamp-2 mb-2 leading-tight">
                      {campaign.title}
                    </h3>

                    <div className="flex items-center justify-between mb-2">
                      <div className="flex gap-0.5">
                        {getActivePlatforms(campaign.target_platforms).slice(0, 2).map((platform) => (
                          <span key={platform} className="text-gray-400">
                            {getPlatformIcon(platform)}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Users className="w-3 h-3 mr-0.5" />
                        {campaign.max_participants || 10}
                      </div>
                    </div>

                    {/* Application Deadline Display */}
                    {(campaign.application_deadline || campaign.deadline || campaign.end_date) && (
                      <div className="flex items-center text-xs text-gray-500 border-t pt-2 mt-1">
                        <Calendar className="w-3 h-3 mr-1 text-purple-500" />
                        <span className="text-gray-600">
                          Deadline: {formatDate(campaign.application_deadline || campaign.deadline || campaign.end_date)}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* View All Button */}
          {campaigns.length > 0 && (
            <div className="text-center mt-6">
              <Link to="/signup">
                <Button variant="outline" className="text-purple-600 border-purple-200 hover:bg-purple-50">
                  Sign up to apply
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Partner Brands Section */}
      <section className="py-6 bg-white/50 border-y border-gray-100">
        <div className="container mx-auto px-4">
          <p className="text-center text-xs text-gray-500 mb-4">TRUSTED BY TOP K-BEAUTY BRANDS</p>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
            {partnerBrands.map((brand) => (
              <span key={brand} className="text-lg font-semibold text-gray-400 hover:text-gray-600 transition-colors">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - Compact */}
      <section className="py-10 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-4 gap-2 md:gap-4">
            <Card className="text-center border-0 shadow-md bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="py-4 px-2">
                <div className="text-xl md:text-2xl font-bold mb-0.5">{stats.totalCampaigns || '50'}+</div>
                <div className="text-purple-100 text-xs">Campaigns</div>
              </CardContent>
            </Card>
            <Card className="text-center border-0 shadow-md bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="py-4 px-2">
                <div className="text-xl md:text-2xl font-bold mb-0.5">{stats.totalUsers || '2.5'}K</div>
                <div className="text-blue-100 text-xs">Creators</div>
              </CardContent>
            </Card>
            <Card className="text-center border-0 shadow-md bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="py-4 px-2">
                <div className="text-xl md:text-2xl font-bold mb-0.5">{stats.totalApplications || '10'}K</div>
                <div className="text-green-100 text-xs">Collabs</div>
              </CardContent>
            </Card>
            <Card className="text-center border-0 shadow-md bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent className="py-4 px-2">
                <div className="text-xl md:text-2xl font-bold mb-0.5">$500K</div>
                <div className="text-orange-100 text-xs">Paid Out</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section - Compact */}
      <section id="how-it-works" className="py-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">How It Works</h2>
            <p className="text-sm text-gray-600">Start earning in 4 simple steps</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { step: 1, icon: "📝", title: "Sign Up", desc: "Create free account" },
              { step: 2, icon: "🎯", title: "Apply", desc: "Choose campaigns" },
              { step: 3, icon: "📱", title: "Create", desc: "Make great content" },
              { step: 4, icon: "💰", title: "Get Paid", desc: "Earn via PayPal" }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="relative inline-block mb-3">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
                    {item.icon}
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 text-white rounded-full text-xs flex items-center justify-center font-bold">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-sm font-semibold mb-1">{item.title}</h3>
                <p className="text-gray-600 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Loved by Creators</h2>
            <p className="text-gray-600">See what our community is saying</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.role} • {testimonial.followers} followers</div>
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 italic">"{testimonial.text}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Earning?</h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of creators who are already collaborating with K-Beauty brands
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8">
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="text-2xl">🎬</div>
                <div className="text-xl font-bold">CNEC</div>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                The leading platform connecting K-Beauty brands with content creators worldwide.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white"><Instagram className="h-5 w-5" /></a>
                <a href="#" className="text-gray-400 hover:text-white"><Twitter className="h-5 w-5" /></a>
                <a href="#" className="text-gray-400 hover:text-white"><Youtube className="h-5 w-5" /></a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Creators</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#campaigns" className="hover:text-white transition-colors">Browse Campaigns</a></li>
                <li><Link to="/signup" className="hover:text-white transition-colors">Join as Creator</Link></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>support@cnec-us.com</li>
                <li>Los Angeles, CA</li>
              </ul>
              <div className="mt-4 flex items-center text-sm text-gray-400">
                <Shield className="h-4 w-4 mr-2 text-green-500" />
                SSL Secured
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
            <p>© 2025 CNEC Inc. All rights reserved.</p>
            <p className="mt-2 md:mt-0">Made with ❤️ for K-Beauty creators</p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around items-center py-2">
          <a href="#" className="flex flex-col items-center py-2 px-4 text-purple-600">
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </a>
          <a href="#campaigns" className="flex flex-col items-center py-2 px-4 text-gray-500 hover:text-purple-600">
            <Search className="h-5 w-5" />
            <span className="text-xs mt-1">Campaigns</span>
          </a>
          <Link to={user ? "/mypage" : "/login"} className="flex flex-col items-center py-2 px-4 text-gray-500 hover:text-purple-600">
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">{user ? "My Page" : "Sign In"}</span>
          </Link>
        </div>
      </nav>

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
                  <img src={selectedCampaign.image_url} alt={selectedCampaign.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Reward</div>
                  <div className="text-2xl font-bold text-purple-700">{formatCurrency(selectedCampaign.reward_amount)}</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Spots Available</div>
                  <div className="text-2xl font-bold text-blue-700">{selectedCampaign.max_participants || 'Open'}</div>
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
                  <span key={platform}>{getPlatformBadge(platform)}</span>
                ))}
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                Application Deadline: {formatDate(selectedCampaign.application_deadline || selectedCampaign.deadline || selectedCampaign.end_date)}
              </div>

              <Button
                className="w-full bg-purple-600 hover:bg-purple-700"
                size="lg"
                onClick={() => { setDetailModal(false); handleApply(selectedCampaign.id) }}
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
