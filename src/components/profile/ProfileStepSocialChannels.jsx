import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Instagram, Youtube, Hash, Globe } from 'lucide-react'

const ProfileStepSocialChannels = ({ data, onChange }) => {
  const update = (field, value) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-6">
      {/* Instagram */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-pink-500">
          <Instagram className="h-5 w-5" />
          <span className="font-medium">Instagram</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Handle / URL</Label>
            <Input
              value={data.instagram_handle || data.instagram_url || ''}
              onChange={(e) => {
                update('instagram_handle', e.target.value)
                update('instagram_url', e.target.value)
              }}
              placeholder="@username or URL"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Followers</Label>
            <Input
              type="number"
              value={data.instagram_followers || ''}
              onChange={(e) => update('instagram_followers', e.target.value ? parseInt(e.target.value) : '')}
              placeholder="e.g. 5000"
            />
          </div>
        </div>
      </div>

      {/* TikTok */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-gray-800">
          <Hash className="h-5 w-5" />
          <span className="font-medium">TikTok</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Handle / URL</Label>
            <Input
              value={data.tiktok_handle || data.tiktok_url || ''}
              onChange={(e) => {
                update('tiktok_handle', e.target.value)
                update('tiktok_url', e.target.value)
              }}
              placeholder="@username or URL"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Followers</Label>
            <Input
              type="number"
              value={data.tiktok_followers || ''}
              onChange={(e) => update('tiktok_followers', e.target.value ? parseInt(e.target.value) : '')}
              placeholder="e.g. 10000"
            />
          </div>
        </div>
      </div>

      {/* YouTube */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-red-500">
          <Youtube className="h-5 w-5" />
          <span className="font-medium">YouTube</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Channel URL</Label>
            <Input
              value={data.youtube_handle || data.youtube_url || ''}
              onChange={(e) => {
                update('youtube_handle', e.target.value)
                update('youtube_url', e.target.value)
              }}
              placeholder="Channel URL"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Subscribers</Label>
            <Input
              type="number"
              value={data.youtube_subscribers || ''}
              onChange={(e) => update('youtube_subscribers', e.target.value ? parseInt(e.target.value) : '')}
              placeholder="e.g. 1000"
            />
          </div>
        </div>
      </div>

      {/* Other SNS */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-blue-500">
          <Globe className="h-5 w-5" />
          <span className="font-medium">Other Social Media</span>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-gray-500">URL (optional)</Label>
          <Input
            value={data.other_sns_url || ''}
            onChange={(e) => update('other_sns_url', e.target.value)}
            placeholder="Blog, Twitter/X, etc."
          />
        </div>
      </div>
    </div>
  )
}

export default ProfileStepSocialChannels
