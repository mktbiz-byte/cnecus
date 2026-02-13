import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import {
  ArrowLeft, Search, UserCheck, Video, ClipboardCheck,
  Send, DollarSign, BookOpen, ChevronRight, Camera,
  Package, Upload, RefreshCw, CheckCircle, AlertTriangle,
  Mail, Wallet, Instagram, Youtube, Smartphone, FileText,
  Star, Eye, MessageSquare, Clock
} from 'lucide-react'

const journeySteps = [
  { num: 1, icon: Search, label: 'Apply', color: 'from-purple-500 to-purple-600' },
  { num: 2, icon: UserCheck, label: 'Get Selected', color: 'from-blue-500 to-blue-600' },
  { num: 3, icon: Video, label: 'Create Content', color: 'from-amber-500 to-amber-600' },
  { num: 4, icon: ClipboardCheck, label: 'Review', color: 'from-orange-500 to-orange-600' },
  { num: 5, icon: Send, label: 'Post on SNS', color: 'from-green-500 to-green-600' },
  { num: 6, icon: DollarSign, label: 'Get Paid', color: 'from-emerald-500 to-emerald-600' },
]

const tocItems = [
  { id: 'journey-overview', label: 'Journey Overview' },
  { id: 'phase-1', label: 'Discovery & Application' },
  { id: 'phase-2', label: 'Selection & Preparation' },
  { id: 'phase-3', label: 'Content Creation' },
  { id: 'phase-4', label: 'Review & Revision' },
  { id: 'phase-5', label: 'Final Deliverables' },
  { id: 'phase-6', label: 'Points & Withdrawal' },
  { id: 'campaign-types', label: 'Campaign Types' },
  { id: 'rewards', label: 'Reward Tiers' },
  { id: 'faq', label: 'FAQ' },
]

const rewardTiers = [
  { tier: 'Junior', standard: '$130', challenge: '$265' },
  { tier: 'Intermediate', standard: '$175', challenge: '$310' },
  { tier: 'Senior', standard: '$220', challenge: '$355' },
  { tier: 'Premium', standard: '$265', challenge: '$400' },
]

const faqItems = [
  {
    q: 'How long does it take to get selected?',
    a: 'Selection typically happens within 3–5 business days after the application deadline closes. You will receive an email notification when selected.',
  },
  {
    q: 'Can I apply to multiple campaigns at once?',
    a: 'Yes! You can apply to as many campaigns as you like. However, make sure you can meet all deadlines for each campaign you are accepted into.',
  },
  {
    q: 'What happens if I miss a deadline?',
    a: 'Missing deadlines may result in removal from the campaign and forfeiture of rewards. If you anticipate any issues, please contact our support team as early as possible.',
  },
  {
    q: 'How do I get paid?',
    a: 'Payments are made via PayPal. Once your campaign is marked as completed, points are added to your account. You can then request a withdrawal from your My Page.',
  },
  {
    q: 'What is a "clean video"?',
    a: 'A clean video is a version of your content without any background music (BGM) or subtitles. Some campaigns require this so the brand can use it in their own ads.',
  },
  {
    q: 'What is an Ad Partnership Code?',
    a: 'Some campaigns require a Meta (Instagram) ad partnership code so the brand can run paid promotions using your content. You generate this from your Instagram Professional Dashboard under "Branded Content" settings.',
  },
  {
    q: 'How does the 4-Week Challenge work?',
    a: 'You submit one video per week for 4 consecutive weeks, each with its own deadline and shooting guide. Weekly progress is tracked on your My Page. You receive a higher reward for completing all 4 weeks.',
  },
  {
    q: 'What is the minimum withdrawal amount?',
    a: 'The minimum withdrawal is 10 Points ($10 USD). Processing typically takes 1–3 business days via PayPal.',
  },
  {
    q: 'Can I re-upload my video after submitting?',
    a: 'You can only re-upload when the admin requests a revision. If your video is under review, please wait for feedback before making changes.',
  },
]

const PhaseSection = ({ id, num, title, icon: Icon, children }) => (
  <section id={id} className="scroll-mt-20 mb-6">
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-white flex items-center justify-center text-sm font-bold shrink-0">
          {num}
        </div>
        <Icon className="h-5 w-5 text-purple-600 shrink-0" />
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">{title}</h2>
      </div>
      {children}
    </div>
  </section>
)

const InfoBox = ({ color, icon: Icon, children }) => {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    amber: 'bg-amber-50 border-amber-200 text-amber-800',
    red: 'bg-red-50 border-red-200 text-red-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
  }
  return (
    <div className={`flex items-start gap-3 rounded-lg border p-4 mt-4 ${colors[color]}`}>
      <Icon className="h-5 w-5 mt-0.5 shrink-0" />
      <p className="text-sm leading-relaxed">{children}</p>
    </div>
  )
}

const StepItem = ({ num, children }) => (
  <div className="flex items-start gap-3">
    <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
      {num}
    </span>
    <p className="text-sm text-gray-600 leading-relaxed">{children}</p>
  </div>
)

const CreatorGuidePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🎬</span>
              <span className="font-bold text-xl">CNEC</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6 sm:py-12 max-w-4xl">
        {/* Hero */}
        <div className="flex items-center mb-4 sm:mb-6">
          <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-purple-600 mr-3 sm:mr-4" />
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
              Creator Guide
            </h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">
              Everything you need to know about CNEC campaigns
            </p>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="bg-purple-50 rounded-lg border border-purple-200 p-4 sm:p-6 mb-8">
          <h2 className="font-semibold text-purple-800 mb-3">In This Guide</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {tocItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-purple-100 transition-colors text-sm text-purple-700"
              >
                <span>{item.label}</span>
                <ChevronRight className="h-3 w-3 ml-auto text-purple-400" />
              </a>
            ))}
          </div>
        </div>

        {/* Journey Overview */}
        <section id="journey-overview" className="scroll-mt-20 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-6">Your Campaign Journey</h2>
            {/* Desktop: horizontal */}
            <div className="hidden sm:flex items-start gap-0">
              {journeySteps.map((step, idx) => (
                <React.Fragment key={step.num}>
                  <div className="flex flex-col items-center text-center shrink-0">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${step.color} text-white flex items-center justify-center shadow-md`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <div className="mt-2 text-xs font-semibold text-gray-700">{step.label}</div>
                  </div>
                  {idx < journeySteps.length - 1 && (
                    <div className="flex flex-1 items-center px-1 mt-6">
                      <div className="h-0.5 w-full bg-gray-200 rounded-full" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            {/* Mobile: vertical */}
            <div className="sm:hidden space-y-3">
              {journeySteps.map((step, idx) => (
                <div key={step.num} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${step.color} text-white flex items-center justify-center shadow-md shrink-0`}>
                    <step.icon className="w-4 h-4" />
                  </div>
                  <div className="text-sm font-medium text-gray-700">{step.label}</div>
                  {idx < journeySteps.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-gray-300 ml-auto" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Phase 1: Discovery & Application */}
        <PhaseSection id="phase-1" num={1} title="Campaign Discovery & Application" icon={Search}>
          <div className="space-y-3">
            <StepItem num={1}>
              <strong>Browse campaigns</strong> on the homepage. Active campaigns for the US region are displayed with product images, reward amounts, and application deadlines.
            </StepItem>
            <StepItem num={2}>
              <strong>View campaign details</strong> to learn about the product, video specifications (duration, tempo, tone), required scenes, and reward amount before applying.
            </StepItem>
            <StepItem num={3}>
              <strong>Submit your application</strong> with the following information:
            </StepItem>
          </div>

          <div className="ml-9 mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { icon: Instagram, text: 'SNS URLs & follower counts' },
              { icon: Star, text: 'Age range & skin type' },
              { icon: MessageSquare, text: 'Answers to campaign questions' },
              { icon: FileText, text: 'Portrait rights consent' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600">
                <item.icon className="h-4 w-4 text-gray-400 shrink-0" />
                {item.text}
              </div>
            ))}
          </div>

          <InfoBox color="amber" icon={Star}>
            <strong>Tip:</strong> Make sure your SNS profile is set to <strong>Public</strong> before applying. Brands review your content and engagement before selection.
          </InfoBox>
        </PhaseSection>

        {/* Phase 2: Selection & Preparation */}
        <PhaseSection id="phase-2" num={2} title="Selection & Preparation" icon={UserCheck}>
          <div className="space-y-3">
            <StepItem num={1}>
              Our team reviews all applications and selects creators that best match the campaign goals. You'll receive an <strong>email notification</strong> when selected.
            </StepItem>
            <StepItem num={2}>
              Once selected, submit your <strong>contact details</strong> (shipping address) so the brand can send you the product.
            </StepItem>
            <StepItem num={3}>
              <strong>Product ships</strong> to your address. You'll receive a tracking number via email or on your My Page.
            </StepItem>
          </div>

          {/* Status flow */}
          <div className="flex items-center gap-2 mt-5 justify-center">
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Selected</Badge>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Product Shipped</Badge>
          </div>

          <InfoBox color="blue" icon={Mail}>
            Check your inbox (and spam folder) regularly after applying. Selection emails are sent within 3–5 business days after the deadline.
          </InfoBox>
        </PhaseSection>

        {/* Phase 3: Content Creation */}
        <PhaseSection id="phase-3" num={3} title="Content Creation" icon={Video}>
          {/* Shooting Guide */}
          <h3 className="text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Eye className="h-4 w-4 text-purple-500" />
            Review Your Shooting Guide
          </h3>
          <p className="text-sm text-gray-600 mb-3 leading-relaxed">
            Once selected, access your shooting guide from the <strong>"View Shooting Guide"</strong> button on your My Page. The guide includes product details, required scenes, dialogue scripts, hashtags, and video specifications.
          </p>

          {/* Standard vs 4-Week guide difference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            <div className="border border-blue-200 bg-blue-50/50 rounded-lg p-3">
              <Badge className="bg-blue-100 text-blue-700 border border-blue-200 mb-2 text-xs">Standard</Badge>
              <p className="text-sm text-gray-600">Single shooting guide (PDF + AI Slides) for the entire campaign.</p>
            </div>
            <div className="border border-orange-200 bg-orange-50/50 rounded-lg p-3">
              <Badge className="bg-orange-100 text-orange-700 border border-orange-200 mb-2 text-xs">4-Week Challenge</Badge>
              <p className="text-sm text-gray-600">Separate guide for each week (W1–W4), with different themes or focus areas per week.</p>
            </div>
          </div>

          {/* Video Upload */}
          <h3 className="text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Upload className="h-4 w-4 text-purple-500" />
            Upload Your Video
          </h3>
          <div className="space-y-3">
            <StepItem num={1}>
              Shoot your video following the guide requirements (scenes, duration, tone).
            </StepItem>
            <StepItem num={2}>
              Go to <strong>My Page → Your Campaign</strong> and click <strong>"Upload Video"</strong>.
            </StepItem>
            <StepItem num={3}>
              Select your video file (MP4, MOV, AVI, WebM — max 500MB).
            </StepItem>
            <StepItem num={4}>
              For <strong>4-Week Challenges</strong>, choose which week (W1–W4) you're submitting for.
            </StepItem>
          </div>

          {/* 4-Week weekly grid illustration */}
          <div className="mt-5 border border-orange-200 rounded-lg p-4 bg-orange-50/30">
            <p className="text-sm font-semibold text-orange-700 mb-3">4-Week Challenge Progress Tracker</p>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[1, 2, 3, 4].map(w => (
                <div key={w} className="space-y-1.5">
                  <div className="text-xs font-bold text-gray-500">Week {w}</div>
                  <div className="bg-white rounded border border-gray-200 px-2 py-1 text-xs text-gray-500 flex items-center justify-center gap-1">
                    <Camera className="h-3 w-3" /> Video
                  </div>
                  <div className="bg-white rounded border border-gray-200 px-2 py-1 text-xs text-gray-500 flex items-center justify-center gap-1">
                    <Send className="h-3 w-3" /> SNS
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Each week has its own video upload and SNS post deadline.
            </p>
          </div>
        </PhaseSection>

        {/* Phase 4: Review & Revision */}
        <PhaseSection id="phase-4" num={4} title="Review & Revision" icon={ClipboardCheck}>
          <p className="text-sm text-gray-600 mb-3 leading-relaxed">
            After you upload your video, our team will review it to ensure it meets the campaign requirements. This typically takes <strong>1–3 business days</strong>.
          </p>

          {/* Status flow */}
          <div className="flex flex-wrap items-center gap-2 mb-4 justify-center">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Video Submitted</Badge>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Under Review</Badge>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <div className="flex flex-col items-center gap-1">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>
              <span className="text-xs text-gray-400">or</span>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Revision Requested</Badge>
            </div>
          </div>

          <InfoBox color="red" icon={AlertTriangle}>
            <strong>Important:</strong> Do NOT post your video on social media until it is officially approved. Posting before approval may require you to delete and re-post.
          </InfoBox>

          <h3 className="text-base font-semibold text-gray-700 mt-5 mb-2 flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-amber-500" />
            If Revision Is Requested
          </h3>
          <div className="space-y-3">
            <StepItem num={1}>
              Check the detailed feedback by clicking <strong>"View Details"</strong> on your campaign card.
            </StepItem>
            <StepItem num={2}>
              Make the requested changes to your video.
            </StepItem>
            <StepItem num={3}>
              Click <strong>"Re-upload Video"</strong> to submit the revised version.
            </StepItem>
            <StepItem num={4}>
              The review cycle repeats until your video is approved.
            </StepItem>
          </div>
        </PhaseSection>

        {/* Phase 5: Final Deliverables */}
        <PhaseSection id="phase-5" num={5} title="Final Deliverables (SNS Post)" icon={Send}>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            Once your video is <strong>approved</strong>, it's time to post it on your social media and submit the final deliverables.
          </p>

          <div className="space-y-3">
            {/* SNS URL */}
            <div className="border border-green-200 rounded-lg p-4 bg-green-50/30">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="h-4 w-4 text-green-600" />
                <p className="text-sm font-semibold text-gray-700">SNS Post URL</p>
                <Badge className="bg-green-100 text-green-700 border border-green-200 text-xs ml-auto">Required</Badge>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Post your approved video on Instagram Reels, TikTok, or YouTube, then paste the post URL in the submission form.
              </p>
            </div>

            {/* Clean Video */}
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/30">
              <div className="flex items-center gap-2 mb-2">
                <Video className="h-4 w-4 text-blue-600" />
                <p className="text-sm font-semibold text-gray-700">Clean Video URL</p>
                <Badge className="bg-blue-100 text-blue-700 border border-blue-200 text-xs ml-auto">If Required</Badge>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                A version of your video <strong>without background music or subtitles</strong>. The brand uses this for their own advertisements. You can upload it to Google Drive or similar and share the link.
              </p>
            </div>

            {/* Partnership Code */}
            <div className="border border-purple-200 rounded-lg p-4 bg-purple-50/30">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-purple-600" />
                <p className="text-sm font-semibold text-gray-700">Ad Partnership Code</p>
                <Badge className="bg-purple-100 text-purple-700 border border-purple-200 text-xs ml-auto">If Required</Badge>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                A Meta/Instagram partnership code that allows the brand to run paid ads using your content. Generate this from your Instagram Professional Dashboard → Branded Content settings.
              </p>
            </div>
          </div>

          {/* Status flow */}
          <div className="flex flex-wrap items-center gap-2 mt-5 justify-center">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">SNS Uploaded</Badge>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Completed</Badge>
          </div>
        </PhaseSection>

        {/* Phase 6: Points & Withdrawal */}
        <PhaseSection id="phase-6" num={6} title="Points & Withdrawal" icon={DollarSign}>
          <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg mb-4">
            <Wallet className="h-6 w-6 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">1 Point = $1.00 USD</p>
              <p className="text-xs text-emerald-700 mt-0.5">Points are awarded automatically when your campaign is marked as completed.</p>
            </div>
          </div>

          <h3 className="text-base font-semibold text-gray-700 mb-2">How to Withdraw</h3>
          <div className="space-y-3">
            <StepItem num={1}>Go to <strong>My Page</strong> and navigate to the <strong>Withdrawals</strong> tab.</StepItem>
            <StepItem num={2}>Click <strong>"Request Withdrawal"</strong> and enter the amount.</StepItem>
            <StepItem num={3}>Enter your <strong>PayPal email</strong> and <strong>account name</strong>.</StepItem>
            <StepItem num={4}>Submit your request. Our team will process it within <strong>1–3 business days</strong>.</StepItem>
          </div>

          {/* Status flow */}
          <div className="flex flex-wrap items-center gap-2 mt-5 justify-center">
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Approved</Badge>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed (Paid)</Badge>
          </div>

          <InfoBox color="green" icon={CheckCircle}>
            Minimum withdrawal: <strong>10 Points ($10 USD)</strong>. Payments are processed via PayPal only.
          </InfoBox>
        </PhaseSection>

        {/* Campaign Types Comparison */}
        <section id="campaign-types" className="scroll-mt-20 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-6">Campaign Types</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Standard */}
              <div className="border-2 border-blue-200 rounded-xl p-5">
                <Badge className="bg-blue-100 text-blue-700 border border-blue-200 mb-3">Standard Campaign</Badge>
                <ul className="space-y-2.5 text-sm text-gray-600 mt-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    <span>Single video submission per campaign</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    <span>Two deadlines: video upload + SNS post</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    <span>One shooting guide (PDF + AI Slides)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    <span>Reward: <strong>$130 – $265</strong> based on tier</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    <span>Shorter commitment (usually 2–3 weeks total)</span>
                  </li>
                </ul>
              </div>

              {/* 4-Week Challenge */}
              <div className="border-2 border-orange-200 rounded-xl p-5">
                <Badge className="bg-orange-100 text-orange-700 border border-orange-200 mb-3">4-Week Challenge</Badge>
                <ul className="space-y-2.5 text-sm text-gray-600 mt-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                    <span>4 weekly video submissions (Week 1–4)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                    <span>Per-week deadlines: video + SNS each week</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                    <span>Separate guide per week (different focus each week)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                    <span>Reward: <strong>$265 – $400</strong> based on tier</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                    <span>Longer commitment (~5–6 weeks total)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Reward Tiers */}
        <section id="rewards" className="scroll-mt-20 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Reward Tiers</h2>
            <p className="text-sm text-gray-500 mb-6">Rewards vary by your creator tier and the campaign type.</p>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Creator Tier</th>
                    <th className="text-center py-3 px-4 font-semibold text-blue-700">Standard</th>
                    <th className="text-center py-3 px-4 font-semibold text-orange-700">4-Week Challenge</th>
                  </tr>
                </thead>
                <tbody>
                  {rewardTiers.map((row) => (
                    <tr key={row.tier} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-gray-800">{row.tier}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge className="bg-blue-100 text-blue-700 border border-blue-200">{row.standard}</Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge className="bg-orange-100 text-orange-700 border border-orange-200">{row.challenge}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {rewardTiers.map((row) => (
                <div key={row.tier} className="border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                  <span className="font-medium text-gray-800 text-sm">{row.tier}</span>
                  <div className="flex gap-2">
                    <Badge className="bg-blue-100 text-blue-700 border border-blue-200 text-xs">{row.standard}</Badge>
                    <Badge className="bg-orange-100 text-orange-700 border border-orange-200 text-xs">{row.challenge}</Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Point Conversion:</strong> 1 Point = $1.00 USD, paid via PayPal
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, idx) => (
                <AccordionItem key={idx} value={`faq-${idx}`}>
                  <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-600 leading-relaxed">{item.a}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Need Help CTA */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 sm:p-8 text-center text-white mt-2 mb-2">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Still Have Questions?</h2>
          <p className="text-purple-200 text-sm sm:text-base mb-4">
            Our support team is here to help you succeed.
          </p>
          <Link to="/creator-contact">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              Contact Support
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">&copy; 2025 CNEC Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default CreatorGuidePage
