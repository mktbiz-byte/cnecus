import React, { useState } from 'react'
import {
  X, FileText, ExternalLink, Calendar, Camera, Hash,
  MessageSquare, Film, Palette, Clock, Music, CheckCircle2,
  AlertTriangle, ChevronDown, ChevronUp, Layers, Package,
  StickyNote, Sparkles
} from 'lucide-react'

const ShootingGuideModal = ({ isOpen, onClose, campaign, application }) => {
  if (!isOpen || !campaign) return null

  const is4Week = campaign.campaign_type === '4week_challenge'
  const [expandedWeek, setExpandedWeek] = useState(1)

  // Guide document URLs from application (admin sets these)
  const driveUrl = application?.google_drive_url
  const slidesUrl = application?.google_slides_url
  const hasGuideLinks = driveUrl || slidesUrl

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

  // Check if there's any guide content at all
  const hasProductInfo = campaign.brand_name_en || campaign.product_name_en || campaign.product_description_en
  const hasDialogues = campaign.required_dialogues_en?.length > 0
  const hasScenes = campaign.required_scenes_en?.length > 0
  const hasHashtags = campaign.required_hashtags_en?.length > 0
  const hasVideoSpecs = campaign.video_duration_en || campaign.video_tempo_en || campaign.video_tone_en
  const hasShootingScenes = activeSceneChecks.length > 0 || campaign.shooting_scenes_en?.length > 0
  const hasNotes = campaign.additional_details_en || campaign.additional_shooting_requests_en
  const hasSpecialReqs = campaign.requires_ad_code || campaign.meta_ad_code_requested || campaign.requires_clean_video

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 p-5 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Campaign Guide
            </h2>
            <p className="text-sm text-purple-200 mt-1">{campaign.title_en || campaign.title}</p>
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
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* ========== GUIDE DOCUMENTS (PDF / SLIDES) ========== */}
          <div className={`rounded-xl p-5 border-2 ${
            hasGuideLinks
              ? 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-300'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2 text-base">
              <FileText className="w-5 h-5" />
              Guide Documents
            </h3>

            {hasGuideLinks ? (
              <div className="space-y-3">
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
                      <p className="font-bold text-purple-800 text-sm">PDF Guide (Google Drive)</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{driveUrl}</p>
                    </div>
                    <div className="flex-shrink-0 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium group-hover:bg-purple-700 transition-colors flex items-center gap-1">
                      Open
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </a>
                )}

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
                      <p className="font-bold text-indigo-800 text-sm">AI Guide (Google Slides)</p>
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
              <div className="text-center py-6">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No guide documents uploaded yet.</p>
                <p className="text-xs text-gray-400 mt-1">The team will provide your guide documents soon.</p>
              </div>
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
                    const videoSubmitted = !!application?.[`week${week}_video_url`]
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
                <div className="grid grid-cols-2 gap-4">
                  {campaign.video_deadline && (
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Film className="w-5 h-5 text-blue-600" />
                        <span className="text-xs font-bold text-blue-700 uppercase">Video Deadline</span>
                      </div>
                      <p className="text-lg font-bold text-gray-800">{formatDate(campaign.video_deadline)}</p>
                      {(() => {
                        const days = getDaysLeft(campaign.video_deadline)
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
                  {campaign.sns_deadline && (
                    <div className="bg-pink-50 rounded-xl p-4 border border-pink-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Hash className="w-5 h-5 text-pink-600" />
                        <span className="text-xs font-bold text-pink-700 uppercase">SNS Deadline</span>
                      </div>
                      <p className="text-lg font-bold text-gray-800">{formatDate(campaign.sns_deadline)}</p>
                      {(() => {
                        const days = getDaysLeft(campaign.sns_deadline)
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
                {campaign.brand_name_en && (
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 w-20 flex-shrink-0">Brand:</span>
                    <span className="font-semibold text-gray-800">{campaign.brand_name_en}</span>
                  </div>
                )}
                {campaign.product_name_en && (
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 w-20 flex-shrink-0">Product:</span>
                    <span className="font-semibold text-gray-800">{campaign.product_name_en}</span>
                  </div>
                )}
                {campaign.product_description_en && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">{campaign.product_description_en}</p>
                  </div>
                )}
                {campaign.product_features_en?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-bold text-gray-600 uppercase mb-2">Key Features</p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {campaign.product_features_en.map((feature, i) => (
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
                <div className="grid grid-cols-3 gap-3">
                  {campaign.video_duration_en && (
                    <div className="bg-indigo-50 p-4 rounded-xl text-center border border-indigo-200">
                      <Clock className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                      <div className="text-xs text-gray-500 font-medium">Duration</div>
                      <div className="text-sm font-bold text-gray-800 mt-1">{campaign.video_duration_en}</div>
                    </div>
                  )}
                  {campaign.video_tempo_en && (
                    <div className="bg-indigo-50 p-4 rounded-xl text-center border border-indigo-200">
                      <Music className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                      <div className="text-xs text-gray-500 font-medium">Tempo</div>
                      <div className="text-sm font-bold text-gray-800 mt-1">{campaign.video_tempo_en}</div>
                    </div>
                  )}
                  {campaign.video_tone_en && (
                    <div className="bg-indigo-50 p-4 rounded-xl text-center border border-indigo-200">
                      <Palette className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                      <div className="text-xs text-gray-500 font-medium">Tone</div>
                      <div className="text-sm font-bold text-gray-800 mt-1">{campaign.video_tone_en}</div>
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
                    {campaign.required_dialogues_en.length}
                  </span>
                </h3>
                <p className="text-xs text-amber-600 mt-1">You must say these lines in your video</p>
              </div>
              <div className="p-4 space-y-2">
                {campaign.required_dialogues_en.map((line, i) => (
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
                    {campaign.required_scenes_en.length}
                  </span>
                </h3>
                <p className="text-xs text-blue-600 mt-1">Your video must include these scenes</p>
              </div>
              <div className="p-4 space-y-2">
                {campaign.required_scenes_en.map((scene, i) => (
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
                      const Icon = scene.icon
                      return (
                        <div key={i} className="flex items-center gap-2 text-sm bg-green-50 p-2.5 rounded-lg border border-green-200">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{scene.label}</span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {campaign.shooting_scenes_en?.length > 0 && (
                  <div className={activeSceneChecks.length > 0 ? 'mt-3 pt-3 border-t border-green-200' : ''}>
                    <p className="text-xs font-bold text-green-700 uppercase mb-2">Additional Required Scenes</p>
                    <div className="space-y-1.5">
                      {campaign.shooting_scenes_en.map((scene, i) => (
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
                    {campaign.required_hashtags_en.length}
                  </span>
                </h3>
                <p className="text-xs text-purple-600 mt-1">Include these hashtags in your post</p>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {campaign.required_hashtags_en.map((tag, i) => (
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
                {campaign.additional_details_en && (
                  <p className="text-sm text-gray-700 leading-relaxed">{campaign.additional_details_en}</p>
                )}
                {campaign.additional_shooting_requests_en && (
                  <div className={campaign.additional_details_en ? 'pt-3 border-t border-gray-100' : ''}>
                    <p className="text-xs font-bold text-gray-600 uppercase mb-1">Shooting Requests</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{campaign.additional_shooting_requests_en}</p>
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
                        Submit a version WITHOUT background music and subtitles (needed for ad usage).
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
