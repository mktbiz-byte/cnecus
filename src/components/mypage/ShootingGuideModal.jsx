import React from 'react'
import { X } from 'lucide-react'

const ShootingGuideModal = ({ isOpen, onClose, campaign }) => {
  if (!isOpen || !campaign) return null

  const is4Week = campaign.campaign_type === '4week_challenge'

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Shooting scenes boolean fields
  const shootingSceneChecks = [
    { key: 'shooting_scenes_ba_photo', label: 'Before & After shots' },
    { key: 'shooting_scenes_no_makeup', label: 'No makeup / bare face' },
    { key: 'shooting_scenes_closeup', label: 'Face closeup' },
    { key: 'shooting_scenes_product_closeup', label: 'Product closeup' },
    { key: 'shooting_scenes_product_texture', label: 'Product texture shot' },
    { key: 'shooting_scenes_outdoor', label: 'Outdoor shooting' },
    { key: 'shooting_scenes_couple', label: 'With partner/couple' },
    { key: 'shooting_scenes_child', label: 'With child' },
    { key: 'shooting_scenes_troubled_skin', label: 'Show skin concerns' },
    { key: 'shooting_scenes_wrinkles', label: 'Show wrinkles/fine lines' }
  ]

  const activeSceneChecks = shootingSceneChecks.filter(scene => campaign[scene.key])

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">📋 Shooting Guide</h2>
            <p className="text-sm text-purple-600">{campaign.title_en || campaign.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Campaign Type & Deadlines */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                is4Week ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {is4Week ? '4-Week Challenge' : 'Standard Campaign'}
              </span>
              <span className="text-lg font-bold text-green-600">
                ${campaign.reward_amount?.toLocaleString()}
              </span>
            </div>

            {/* Deadlines */}
            <div className="text-sm">
              <h4 className="font-semibold text-gray-700 mb-2">📅 Deadlines</h4>
              {is4Week ? (
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map(week => (
                    <div key={week} className="bg-white p-2 rounded border text-xs">
                      <div className="font-medium text-orange-600">Week {week}</div>
                      {campaign[`week${week}_deadline`] && (
                        <div>Video: {formatDate(campaign[`week${week}_deadline`])}</div>
                      )}
                      {campaign[`week${week}_sns_deadline`] && (
                        <div>SNS: {formatDate(campaign[`week${week}_sns_deadline`])}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {campaign.video_deadline && (
                    <div className="flex justify-between">
                      <span>🎬 Video Deadline:</span>
                      <span className="font-medium">{formatDate(campaign.video_deadline)}</span>
                    </div>
                  )}
                  {campaign.sns_deadline && (
                    <div className="flex justify-between">
                      <span>📱 SNS Deadline:</span>
                      <span className="font-medium">{formatDate(campaign.sns_deadline)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Product Information */}
          {(campaign.brand_name_en || campaign.product_name_en || campaign.product_description_en) && (
            <div className="bg-pink-50 rounded-xl p-4">
              <h3 className="font-semibold text-pink-700 mb-3">📦 Product Information</h3>
              <div className="space-y-2 text-sm">
                {campaign.brand_name_en && (
                  <div><span className="text-gray-500">Brand:</span> <span className="font-medium">{campaign.brand_name_en}</span></div>
                )}
                {campaign.product_name_en && (
                  <div><span className="text-gray-500">Product:</span> <span className="font-medium">{campaign.product_name_en}</span></div>
                )}
                {campaign.product_description_en && (
                  <p className="text-gray-700 mt-2">{campaign.product_description_en}</p>
                )}
                {campaign.product_features_en?.length > 0 && (
                  <div className="mt-2">
                    <span className="text-gray-500">Key Features:</span>
                    <ul className="mt-1 space-y-1">
                      {campaign.product_features_en.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-pink-500 mr-2">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Required Lines/Dialogues */}
          {campaign.required_dialogues_en?.length > 0 && (
            <div className="bg-amber-50 rounded-xl p-4">
              <h3 className="font-semibold text-amber-700 mb-2">💬 Required Lines</h3>
              <p className="text-xs text-amber-600 mb-3">You must say these lines in your video:</p>
              <div className="space-y-2">
                {campaign.required_dialogues_en.map((line, i) => (
                  <div key={i} className="bg-white p-3 rounded-lg border border-amber-200 italic text-gray-700">
                    "{line}"
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Required Scenes */}
          {campaign.required_scenes_en?.length > 0 && (
            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="font-semibold text-blue-700 mb-2">🎥 Required Scenes</h3>
              <p className="text-xs text-blue-600 mb-3">Your video must include these scenes:</p>
              <ol className="space-y-2 list-decimal list-inside">
                {campaign.required_scenes_en.map((scene, i) => (
                  <li key={i} className="text-sm text-gray-700">{scene}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Required Hashtags */}
          {campaign.required_hashtags_en?.length > 0 && (
            <div className="bg-purple-50 rounded-xl p-4">
              <h3 className="font-semibold text-purple-700 mb-2">#️⃣ Required Hashtags</h3>
              <p className="text-xs text-purple-600 mb-3">Include these hashtags in your post:</p>
              <div className="flex flex-wrap gap-2">
                {campaign.required_hashtags_en.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-white rounded-full border border-purple-200 text-purple-700 text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Video Specifications */}
          {(campaign.video_duration_en || campaign.video_tempo_en || campaign.video_tone_en) && (
            <div className="bg-indigo-50 rounded-xl p-4">
              <h3 className="font-semibold text-indigo-700 mb-3">🎬 Video Specifications</h3>
              <div className="grid grid-cols-3 gap-3">
                {campaign.video_duration_en && (
                  <div className="bg-white p-3 rounded-lg text-center">
                    <div className="text-2xl mb-1">⏱️</div>
                    <div className="text-xs text-gray-500">Duration</div>
                    <div className="text-sm font-medium">{campaign.video_duration_en}</div>
                  </div>
                )}
                {campaign.video_tempo_en && (
                  <div className="bg-white p-3 rounded-lg text-center">
                    <div className="text-2xl mb-1">🎵</div>
                    <div className="text-xs text-gray-500">Tempo</div>
                    <div className="text-sm font-medium">{campaign.video_tempo_en}</div>
                  </div>
                )}
                {campaign.video_tone_en && (
                  <div className="bg-white p-3 rounded-lg text-center">
                    <div className="text-2xl mb-1">🎨</div>
                    <div className="text-xs text-gray-500">Tone</div>
                    <div className="text-sm font-medium">{campaign.video_tone_en}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Required Shooting Scenes (checkboxes) */}
          {(activeSceneChecks.length > 0 || campaign.shooting_scenes_en?.length > 0) && (
            <div className="bg-green-50 rounded-xl p-4">
              <h3 className="font-semibold text-green-700 mb-3">📷 Required Shooting Scenes</h3>

              {activeSceneChecks.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {activeSceneChecks.map((scene, i) => (
                    <div key={i} className="flex items-center text-sm text-gray-700">
                      <span className="text-green-500 mr-2">✅</span>
                      {scene.label}
                    </div>
                  ))}
                </div>
              )}

              {campaign.shooting_scenes_en?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <h4 className="text-sm font-medium text-green-700 mb-2">Additional Required Scenes:</h4>
                  <ul className="space-y-1">
                    {campaign.shooting_scenes_en.map((scene, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start">
                        <span className="text-green-500 mr-2">{i + 1}.</span>
                        {scene}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Additional Notes */}
          {(campaign.additional_details_en || campaign.additional_shooting_requests_en) && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-700 mb-2">📝 Additional Notes</h3>
              {campaign.additional_details_en && (
                <p className="text-sm text-gray-700 mb-2">{campaign.additional_details_en}</p>
              )}
              {campaign.additional_shooting_requests_en && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Additional Shooting Requests:</p>
                  <p className="text-sm text-gray-700">{campaign.additional_shooting_requests_en}</p>
                </div>
              )}
            </div>
          )}

          {/* Special Requirements */}
          {(campaign.requires_ad_code || campaign.meta_ad_code_requested || campaign.requires_clean_video) && (
            <div className="bg-red-50 rounded-xl p-4">
              <h3 className="font-semibold text-red-700 mb-3">⚠️ Special Requirements</h3>
              <div className="space-y-3">
                {(campaign.requires_ad_code || campaign.meta_ad_code_requested) && (
                  <div className="bg-white p-3 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">📱</span>
                      <span className="font-medium text-red-700">Meta Partnership Code Required</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      You'll need to generate and submit a Meta partnership ad code from your Instagram
                      when posting your content.
                    </p>
                  </div>
                )}
                {campaign.requires_clean_video && (
                  <div className="bg-white p-3 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">🎞️</span>
                      <span className="font-medium text-red-700">Clean Video Required</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Please also submit a version of your video WITHOUT background music and subtitles.
                      This is needed for ad usage.
                    </p>
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
            className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  )
}

export default ShootingGuideModal
