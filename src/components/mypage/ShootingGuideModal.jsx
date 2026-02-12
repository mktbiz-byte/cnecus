import React, { useState, useMemo } from 'react'
import {
  X, FileText, ExternalLink, Calendar, Camera, Hash,
  MessageSquare, Film, Palette, Clock, Music, CheckCircle2,
  AlertTriangle, ChevronDown, ChevronUp, Layers, Package,
  StickyNote, Sparkles, Download
} from 'lucide-react'

const ShootingGuideModal = ({ isOpen, onClose, campaign, application }) => {
  if (!isOpen || !campaign) return null

  const is4Week = campaign.campaign_type === '4week_challenge'
  const [expandedWeek, setExpandedWeek] = useState(1)
  const [selectedGuideWeek, setSelectedGuideWeek] = useState(1)

  // Parse shooting_guide JSON if available (fallback for when _en fields are empty)
  const parsedGuide = useMemo(() => {
    if (!campaign.shooting_guide) return null
    try {
      if (typeof campaign.shooting_guide === 'string') {
        return JSON.parse(campaign.shooting_guide)
      }
      return campaign.shooting_guide
    } catch {
      return null
    }
  }, [campaign.shooting_guide])

  // Parse challenge_guide_data_en JSON if available (4-week)
  const parsedChallengeGuide = useMemo(() => {
    if (!campaign.challenge_guide_data_en) return null
    try {
      if (typeof campaign.challenge_guide_data_en === 'string') {
        return JSON.parse(campaign.challenge_guide_data_en)
      }
      return campaign.challenge_guide_data_en
    } catch {
      return null
    }
  }, [campaign.challenge_guide_data_en])

  // Helper to get guide value with fallback to parsed shooting_guide
  const getGuideValue = (enField, guideKey) => {
    if (campaign[enField]) return campaign[enField]
    if (parsedGuide && guideKey && parsedGuide[guideKey]) return parsedGuide[guideKey]
    return null
  }

  const getGuideArray = (enField, guideKey) => {
    const val = campaign[enField]
    if (Array.isArray(val) && val.length > 0) return val
    if (parsedGuide && guideKey) {
      const gVal = parsedGuide[guideKey]
      if (Array.isArray(gVal) && gVal.length > 0) return gVal
      if (typeof gVal === 'string' && gVal.trim()) return [gVal]
    }
    return []
  }

  // Guide document URLs - from CAMPAIGN (not application)
  // 4-week: week{N}_external_url (link), week{N}_external_file_url (uploaded file)
  // Standard: google_drive_url, google_slides_url
  const getWeekGuideUrls = (week) => {
    const externalUrl = campaign?.[`week${week}_external_url`]
    const fileUrl = campaign?.[`week${week}_external_file_url`]
    const fileName = campaign?.[`week${week}_external_file_name`]
    const title = campaign?.[`week${week}_external_title`]
    const guideMode = campaign?.[`week${week}_guide_mode`]
    return { externalUrl, fileUrl, fileName, title, guideMode, hasLinks: !!(externalUrl || fileUrl) }
  }

  // For standard campaigns, use campaign-level guide URLs
  const driveUrl = is4Week
    ? getWeekGuideUrls(selectedGuideWeek).fileUrl
    : campaign?.google_drive_url
  const slidesUrl = is4Week
    ? getWeekGuideUrls(selectedGuideWeek).externalUrl
    : campaign?.google_slides_url
  const weekGuideData = is4Week ? getWeekGuideUrls(selectedGuideWeek) : null
  const hasGuideLinks = driveUrl || slidesUrl

  // Check if any week has guides (for 4-week)
  const anyWeekHasGuide = is4Week
    ? [1, 2, 3, 4].some(w => getWeekGuideUrls(w).hasLinks)
    : hasGuideLinks

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getDaysLeft = (dateString) => {
    if (!dateString) return null
    const diff = Math.ceil((new Date(dateString) - new Date()) / (1000 * 60 * 60 * 24))
    return diff
  }

  // Shooting scenes boolean fields
  const shootingSceneChecks = [
    { key: 'shooting_scenes_ba_photo', label: 'Before & After shots', icon: Camera },
    { key: 'shooting_scenes_no_makeup', label: 'No makeup / bare face', icon: Sparkles },
    { key: 'shooting_scenes_closeup', label: 'Face closeup', icon: Camera },
    { key: 'shooting_scenes_product_closeup', label: 'Product closeup', icon: Package },
    { key: 'shooting_scenes_product_texture', label: 'Product texture shot', icon: Palette },
    { key: 'shooting_scenes_outdoor', label: 'Outdoor shooting', icon: Camera },
    { key: 'shooting_scenes_couple', label: 'With partner/couple', icon: Camera },
    { key: 'shooting_scenes_child', label: 'With child', icon: Camera },
    { key: 'shooting_scenes_troubled_skin', label: 'Show skin concerns', icon: Camera },
    { key: 'shooting_scenes_wrinkles', label: 'Show wrinkles/fine lines', icon: Camera }
  ]

  const activeSceneChecks = shootingSceneChecks.filter(scene => campaign[scene.key])

  // Check if there's any guide content at all (with fallback to shooting_guide JSON)
  const productBrand = getGuideValue('brand_name_en', 'brand_name')
  const productName = getGuideValue('product_name_en', 'product_name')
  const productDesc = getGuideValue('product_description_en', 'product_description')
  const productFeatures = getGuideArray('product_features_en', 'product_features')

  const hasProductInfo = productBrand || productName || productDesc
  const dialogues = getGuideArray('required_dialogues_en', 'required_dialogues')
  const hasDialogues = dialogues.length > 0
  const scenes = getGuideArray('required_scenes_en', 'required_scenes')
  const hasScenes = scenes.length > 0
  const hashtags = getGuideArray('required_hashtags_en', 'required_hashtags')
  const hasHashtags = hashtags.length > 0

  const videoDuration = getGuideValue('video_duration_en', 'video_duration')
  const videoTempo = getGuideValue('video_tempo_en', 'video_tempo')
  const videoTone = getGuideValue('video_tone_en', 'video_tone')
  const hasVideoSpecs = videoDuration || videoTempo || videoTone

  const shootingScenesExtra = getGuideArray('shooting_scenes_en', 'shooting_scenes')
  const hasShootingScenes = activeSceneChecks.length > 0 || shootingScenesExtra.length > 0

  const additionalDetails = getGuideValue('additional_details_en', 'additional_details')
  const additionalShooting = getGuideValue('additional_shooting_requests_en', 'additional_shooting_requests')
  const hasNotes = additionalDetails || additionalShooting

  const hasSpecialReqs = campaign.requires_ad_code || campaign.meta_ad_code_requested || campaign.requires_clean_video

  const hasAnyGuideContent = hasProductInfo || hasDialogues || hasScenes || hasHashtags || hasVideoSpecs || hasShootingScenes || hasNotes || hasSpecialReqs

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 p-3 sm:p-5 flex items-center justify-between z-10">
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              Campaign Guide
            </h2>
            <p className="text-xs sm:text-sm text-purple-200 mt-1 truncate">{campaign.title_en || campaign.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Campaign type badge bar */}
        <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${
              is4Week
                ? 'bg-orange-100 text-orange-700 border border-orange-300'
                : 'bg-blue-100 text-blue-700 border border-blue-300'
            }`}>
              {is4Week ? '4-Week Challenge' : 'Standard Campaign'}
            </span>
            <span className="text-base font-bold text-green-600">
              ${campaign.reward_amount?.toLocaleString()}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {campaign.brand_en || campaign.brand}
          </span>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 sm:space-y-5">

          {/* ========== GUIDE DOCUMENTS (PDF / SLIDES / DRIVE) ========== */}
          <div className={`rounded-xl p-5 border-2 ${
            anyWeekHasGuide
              ? 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-300'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2 text-base">
              <FileText className="w-5 h-5" />
              Guide Documents
            </h3>

            {/* Week selector tabs for 4-week campaigns */}
            {is4Week && (
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[1, 2, 3, 4].map(week => {
                  const weekGuide = getWeekGuideUrls(week)
                  const isSelected = selectedGuideWeek === week
                  return (
                    <button
                      key={week}
                      onClick={() => setSelectedGuideWeek(week)}
                      className={`p-2.5 rounded-lg border-2 text-center transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-100 shadow-sm'
                          : weekGuide.hasLinks
                          ? 'border-green-300 bg-green-50 hover:border-green-400'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className={`font-bold text-xs ${isSelected ? 'text-purple-700' : 'text-gray-700'}`}>
                        Week {week}
                      </div>
                      {weekGuide.hasLinks ? (
                        <div className="text-[10px] text-green-600 mt-0.5 font-medium">Guide Ready</div>
                      ) : (
                        <div className="text-[10px] text-gray-400 mt-0.5">No guide</div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {hasGuideLinks ? (
              <div className="space-y-3">
                {is4Week && (
                  <div className="text-xs text-purple-600 font-medium bg-purple-100 px-3 py-1.5 rounded-lg mb-2">
                    Showing: Week {selectedGuideWeek} Guide
                  </div>
                )}

                {/* Google Drive / File Link */}
                {driveUrl && (
                  <a
                    href={driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-md transition-all group"
                  >
                    <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition-colors">
                      <FileText className="w-7 h-7 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-purple-800 text-sm">
                        {is4Week ? (weekGuideData?.fileName || `Week ${selectedGuideWeek} Guide File`) : 'PDF Guide (Google Drive)'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{driveUrl}</p>
                    </div>
                    <div className="flex-shrink-0 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium group-hover:bg-purple-700 transition-colors flex items-center gap-1">
                      Open
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </a>
                )}

                {/* Google Slides Link */}
                {slidesUrl && (
                  <a
                    href={slidesUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-indigo-200 hover:border-indigo-400 hover:shadow-md transition-all group"
                  >
                    <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-200 transition-colors">
                      <Layers className="w-7 h-7 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-indigo-800 text-sm">
                        {is4Week ? `Week ${selectedGuideWeek} AI Guide` : 'AI Guide (Google Slides)'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{slidesUrl}</p>
                    </div>
                    <div className="flex-shrink-0 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium group-hover:bg-indigo-700 transition-colors flex items-center gap-1">
                      Open
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </a>
                )}
              </div>
            ) : (
              !hasAnyGuideContent && (
                <div className="text-center py-6">
                  <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    {is4Week
                      ? `No guide documents for Week ${selectedGuideWeek} yet.`
                      : 'No guide documents uploaded yet.'
                    }
                  </p>
                  <p className="text-xs text-gray-400 mt-1">The team will provide your guide documents soon.</p>
                </div>
              )
            )}
          </div>

          {/* ========== DEADLINES ========== */}
          <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                <Calendar className="w-5 h-5 text-gray-600" />
                Deadlines
              </h3>
            </div>
            <div className="p-4">
              {is4Week ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map(week => {
                    const videoDeadline = campaign[`week${week}_deadline`]
                    const snsDeadline = campaign[`week${week}_sns_deadline`]
                    const videoDays = getDaysLeft(videoDeadline)
                    const isExpanded = expandedWeek === week
                    const videoSubmitted = !!application?.[`week${week}_url`]
                    const snsSubmitted = !!application?.[`week${week}_sns_url`]

                    return (
                      <div
                        key={week}
                        className={`border-2 rounded-xl overflow-hidden transition-all ${
                          videoSubmitted && snsSubmitted
                            ? 'border-green-200 bg-green-50/50'
                            : videoDays !== null && videoDays <= 3 && videoDays >= 0
                            ? 'border-red-300 bg-red-50/50'
                            : 'border-orange-200 bg-orange-50/30'
                        }`}
                      >
                        <button
                          className="w-full flex items-center justify-between p-3 text-left"
                          onClick={() => setExpandedWeek(isExpanded ? null : week)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                              videoSubmitted && snsSubmitted
                                ? 'bg-green-500 text-white'
                                : 'bg-orange-500 text-white'
                            }`}>
                              W{week}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-800">Week {week}</p>
                              {videoDays !== null && !videoSubmitted && (
                                <p className={`text-xs font-medium ${
                                  videoDays <= 3 ? 'text-red-600' : videoDays <= 7 ? 'text-orange-600' : 'text-gray-500'
                                }`}>
                                  {videoDays > 0 ? `${videoDays} days left` : videoDays === 0 ? 'Due today!' : 'Overdue'}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {videoSubmitted && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Vid</span>}
                            {snsSubmitted && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">SNS</span>}
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                          </div>
                        </button>
                        {isExpanded && (
                          <div className="px-3 pb-3 border-t border-gray-100 pt-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Film className="w-4 h-4 text-blue-500" />
                                  <span className="text-xs font-semibold text-gray-600">Video Deadline</span>
                                </div>
                                <p className="text-sm font-bold text-gray-800">
                                  {videoDeadline ? formatDate(videoDeadline) : 'TBD'}
                                </p>
                                {videoSubmitted && (
                                  <span className="text-xs text-green-600 font-medium flex items-center gap-1 mt-1">
                                    <CheckCircle2 className="w-3 h-3" /> Submitted
                                  </span>
                                )}
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Hash className="w-4 h-4 text-pink-500" />
                                  <span className="text-xs font-semibold text-gray-600">SNS Deadline</span>
                                </div>
                                <p className="text-sm font-bold text-gray-800">
                                  {snsDeadline ? formatDate(snsDeadline) : 'TBD'}
                                </p>
                                {snsSubmitted && (
                                  <span className="text-xs text-green-600 font-medium flex items-center gap-1 mt-1">
                                    <CheckCircle2 className="w-3 h-3" /> Submitted
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                (() => {
                  // Fallback chain: video_deadline → posting_deadline → application_deadline
                  const effectiveVideoDeadline = campaign.video_deadline || campaign.posting_deadline || campaign.application_deadline
                  const effectiveSnsDeadline = campaign.sns_deadline || campaign.posting_deadline || campaign.application_deadline
                  return (
                    <div className="grid grid-cols-2 gap-4">
                      {effectiveVideoDeadline && (
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Film className="w-5 h-5 text-blue-600" />
                            <span className="text-xs font-bold text-blue-700 uppercase">Video Deadline</span>
                          </div>
                          <p className="text-lg font-bold text-gray-800">{formatDate(effectiveVideoDeadline)}</p>
                          {(() => {
                            const days = getDaysLeft(effectiveVideoDeadline)
                            if (days === null) return null
                            return (
                              <p className={`text-xs font-semibold mt-1 ${
                                days <= 3 ? 'text-red-600' : days <= 7 ? 'text-orange-600' : 'text-green-600'
                              }`}>
                                {days > 0 ? `${days} days left` : days === 0 ? 'Due today!' : `${Math.abs(days)} days overdue`}
                              </p>
                            )
                          })()}
                        </div>
                      )}
                      {effectiveSnsDeadline && (
                        <div className="bg-pink-50 rounded-xl p-4 border border-pink-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Hash className="w-5 h-5 text-pink-600" />
                            <span className="text-xs font-bold text-pink-700 uppercase">SNS Deadline</span>
                          </div>
                          <p className="text-lg font-bold text-gray-800">{formatDate(effectiveSnsDeadline)}</p>
                          {(() => {
                            const days = getDaysLeft(effectiveSnsDeadline)
                            if (days === null) return null
                            return (
                              <p className={`text-xs font-semibold mt-1 ${
                                days <= 3 ? 'text-red-600' : days <= 7 ? 'text-orange-600' : 'text-green-600'
                              }`}>
                                {days > 0 ? `${days} days left` : days === 0 ? 'Due today!' : `${Math.abs(days)} days overdue`}
                              </p>
                            )
                          })()}
                        </div>
                      )}
                    </div>
                  )
                })()
              )}
            </div>
          </div>

          {/* ========== PRODUCT INFORMATION ========== */}
          {hasProductInfo && (
            <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
              <div className="bg-pink-50 px-4 py-3 border-b border-pink-200">
                <h3 className="font-bold text-pink-800 flex items-center gap-2 text-sm">
                  <Package className="w-5 h-5 text-pink-600" />
                  Product Information
                </h3>
              </div>
              <div className="p-4 space-y-3 text-sm">
                {productBrand && (
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 w-20 flex-shrink-0">Brand:</span>
                    <span className="font-semibold text-gray-800">{productBrand}</span>
                  </div>
                )}
                {productName && (
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 w-20 flex-shrink-0">Product:</span>
                    <span className="font-semibold text-gray-800">{productName}</span>
                  </div>
                )}
                {productDesc && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">{productDesc}</p>
                  </div>
                )}
                {productFeatures.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-bold text-gray-600 uppercase mb-2">Key Features</p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {productFeatures.map((feature, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-pink-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========== VIDEO SPECIFICATIONS ========== */}
          {hasVideoSpecs && (
            <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
              <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-200">
                <h3 className="font-bold text-indigo-800 flex items-center gap-2 text-sm">
                  <Film className="w-5 h-5 text-indigo-600" />
                  Video Specifications
                </h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                  {videoDuration && (
                    <div className="bg-indigo-50 p-4 rounded-xl text-center border border-indigo-200">
                      <Clock className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                      <div className="text-xs text-gray-500 font-medium">Duration</div>
                      <div className="text-sm font-bold text-gray-800 mt-1">{videoDuration}</div>
                    </div>
                  )}
                  {videoTempo && (
                    <div className="bg-indigo-50 p-4 rounded-xl text-center border border-indigo-200">
                      <Music className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                      <div className="text-xs text-gray-500 font-medium">Tempo</div>
                      <div className="text-sm font-bold text-gray-800 mt-1">{videoTempo}</div>
                    </div>
                  )}
                  {videoTone && (
                    <div className="bg-indigo-50 p-4 rounded-xl text-center border border-indigo-200">
                      <Palette className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                      <div className="text-xs text-gray-500 font-medium">Tone</div>
                      <div className="text-sm font-bold text-gray-800 mt-1">{videoTone}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========== REQUIRED LINES ========== */}
          {hasDialogues && (
            <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
              <div className="bg-amber-50 px-4 py-3 border-b border-amber-200">
                <h3 className="font-bold text-amber-800 flex items-center gap-2 text-sm">
                  <MessageSquare className="w-5 h-5 text-amber-600" />
                  Required Lines
                  <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                    {dialogues.length}
                  </span>
                </h3>
                <p className="text-xs text-amber-600 mt-1">You must say these lines in your video</p>
              </div>
              <div className="p-4 space-y-2">
                {dialogues.map((line, i) => (
                  <div key={i} className="flex gap-3 items-start bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                    <div className="w-7 h-7 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-amber-800">
                      {i + 1}
                    </div>
                    <p className="text-sm text-gray-700 italic leading-relaxed pt-0.5">"{line}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========== REQUIRED SCENES ========== */}
          {hasScenes && (
            <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
              <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
                <h3 className="font-bold text-blue-800 flex items-center gap-2 text-sm">
                  <Film className="w-5 h-5 text-blue-600" />
                  Required Scenes
                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                    {scenes.length}
                  </span>
                </h3>
                <p className="text-xs text-blue-600 mt-1">Your video must include these scenes</p>
              </div>
              <div className="p-4 space-y-2">
                {scenes.map((scene, i) => (
                  <div key={i} className="flex gap-3 items-start p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                    <div className="w-7 h-7 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-blue-800">
                      {i + 1}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed pt-0.5">{scene}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========== SHOOTING SCENES (CHECKBOXES) ========== */}
          {hasShootingScenes && (
            <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
              <div className="bg-green-50 px-4 py-3 border-b border-green-200">
                <h3 className="font-bold text-green-800 flex items-center gap-2 text-sm">
                  <Camera className="w-5 h-5 text-green-600" />
                  Required Shooting Scenes
                </h3>
              </div>
              <div className="p-4">
                {activeSceneChecks.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {activeSceneChecks.map((scene, i) => {
                      return (
                        <div key={i} className="flex items-center gap-2 text-sm bg-green-50 p-2.5 rounded-lg border border-green-200">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{scene.label}</span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {shootingScenesExtra.length > 0 && (
                  <div className={activeSceneChecks.length > 0 ? 'mt-3 pt-3 border-t border-green-200' : ''}>
                    <p className="text-xs font-bold text-green-700 uppercase mb-2">Additional Required Scenes</p>
                    <div className="space-y-1.5">
                      {shootingScenesExtra.map((scene, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-green-500 font-bold flex-shrink-0">{i + 1}.</span>
                          <span className="text-gray-700">{scene}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========== REQUIRED HASHTAGS ========== */}
          {hasHashtags && (
            <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
              <div className="bg-purple-50 px-4 py-3 border-b border-purple-200">
                <h3 className="font-bold text-purple-800 flex items-center gap-2 text-sm">
                  <Hash className="w-5 h-5 text-purple-600" />
                  Required Hashtags
                  <span className="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full font-bold">
                    {hashtags.length}
                  </span>
                </h3>
                <p className="text-xs text-purple-600 mt-1">Include these hashtags in your post</p>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((tag, i) => (
                    <span key={i} className="px-3 py-1.5 bg-purple-100 rounded-full border border-purple-200 text-purple-700 text-sm font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========== ADDITIONAL NOTES ========== */}
          {hasNotes && (
            <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                  <StickyNote className="w-5 h-5 text-gray-600" />
                  Additional Notes
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {additionalDetails && (
                  <p className="text-sm text-gray-700 leading-relaxed">{additionalDetails}</p>
                )}
                {additionalShooting && (
                  <div className={additionalDetails ? 'pt-3 border-t border-gray-100' : ''}>
                    <p className="text-xs font-bold text-gray-600 uppercase mb-1">Shooting Requests</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{additionalShooting}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========== SPECIAL REQUIREMENTS ========== */}
          {hasSpecialReqs && (
            <div className="bg-white rounded-xl border-2 border-red-200 overflow-hidden">
              <div className="bg-red-50 px-4 py-3 border-b border-red-200">
                <h3 className="font-bold text-red-800 flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Special Requirements
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {(campaign.requires_ad_code || campaign.meta_ad_code_requested) && (
                  <div className="flex items-start gap-3 p-3 bg-red-50/50 rounded-lg border border-red-200">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Hash className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-bold text-red-800 text-sm">Meta Partnership Code</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Generate and submit a Meta partnership ad code from your Instagram when posting.
                      </p>
                    </div>
                  </div>
                )}
                {campaign.requires_clean_video && (
                  <div className="flex items-start gap-3 p-3 bg-red-50/50 rounded-lg border border-red-200">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Film className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-bold text-red-800 text-sm">Clean Video Required</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Submit a version WITHOUT background music and subtitles when uploading SNS (needed for ad usage).
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-sm text-sm"
          >
            I've reviewed the guide
          </button>
        </div>
      </div>
    </div>
  )
}

export default ShootingGuideModal
