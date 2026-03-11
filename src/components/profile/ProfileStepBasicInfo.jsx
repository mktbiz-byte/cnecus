import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Camera, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { GENDERS, AGE_RANGES } from './profileConstants'

const ProfileStepBasicInfo = ({ data, onChange, user }) => {
  const [uploadingImage, setUploadingImage] = React.useState(false)
  const [uploadError, setUploadError] = React.useState('')

  const update = (field, value) => {
    onChange({ ...data, [field]: value })
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be less than 5MB')
      return
    }

    try {
      setUploadingImage(true)
      setUploadError('')

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `profiles/${fileName}`

      const { error: uploadErr } = await supabase.storage
        .from('campaign-images')
        .upload(filePath, file, { upsert: true })

      if (uploadErr) {
        setUploadError('Image upload failed. Please try again.')
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('campaign-images')
        .getPublicUrl(filePath)

      update('profile_image_url', publicUrl)
    } catch {
      setUploadError('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Profile Photo */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center overflow-hidden ${
            data.profile_image_url
              ? 'bg-gray-200'
              : 'bg-gradient-to-br from-purple-400 to-pink-400 ring-2 ring-purple-500 ring-offset-2'
          }`}>
            {data.profile_image_url ? (
              <img src={data.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <Camera className="h-8 w-8 text-white" />
            )}
          </div>
          <label className="absolute bottom-0 right-0 w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-700 transition-colors">
            {uploadingImage ? (
              <Loader2 className="h-4 w-4 text-white animate-spin" />
            ) : (
              <Camera className="h-4 w-4 text-white" />
            )}
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
          </label>
        </div>
        <div>
          <p className="font-medium text-gray-800">{data.name || 'Your Name'}</p>
          <p className="text-sm text-gray-500">{data.email}</p>
          {!data.profile_image_url && (
            <p className="text-xs text-red-500 mt-1 font-medium">Profile photo required</p>
          )}
          {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
        </div>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label className="text-sm text-gray-700">Name *</Label>
        <Input
          value={data.name || ''}
          onChange={(e) => update('name', e.target.value)}
          placeholder="Your full name"
        />
      </div>

      {/* Email (readonly) */}
      <div className="space-y-2">
        <Label className="text-sm text-gray-700">Email</Label>
        <Input value={data.email || ''} disabled className="bg-gray-50" />
        <p className="text-xs text-gray-500">Email cannot be changed</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Gender */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-700">Gender</Label>
          <Select value={data.gender || ''} onValueChange={(val) => update('gender', val)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {GENDERS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Age */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-700">Age Range</Label>
          <Select value={data.age || ''} onValueChange={(val) => update('age', val)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {AGE_RANGES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Region */}
      <div className="space-y-2">
        <Label className="text-sm text-gray-700">Location / Region</Label>
        <Input
          value={data.region || ''}
          onChange={(e) => update('region', e.target.value)}
          placeholder="e.g. Los Angeles, CA"
        />
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label className="text-sm text-gray-700">Bio</Label>
        <Textarea
          value={data.bio || ''}
          onChange={(e) => update('bio', e.target.value)}
          placeholder="Tell brands about yourself..."
          rows={3}
        />
      </div>
    </div>
  )
}

export default ProfileStepBasicInfo
