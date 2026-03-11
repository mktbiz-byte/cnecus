import React from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import MultiSelectField from '@/components/shared/MultiSelectField'
import {
  PRIMARY_INTERESTS, EXPERIENCE_LEVELS, CONTENT_FORMATS,
  VIDEO_STYLES, VIDEO_LENGTH_STYLES, SHORTFORM_TEMPOS,
  EDITING_LEVELS, SHOOTING_LEVELS, UPLOAD_FREQUENCIES,
  COLLABORATION_PREFERENCES
} from './profileConstants'

const ProfileStepContentStyle = ({ data, onChange }) => {
  const update = (field, value) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Primary Interest */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-700">Primary Interest *</Label>
          <Select value={data.primary_interest || ''} onValueChange={(val) => update('primary_interest', val)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {PRIMARY_INTERESTS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Experience Level */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-700">Experience Level</Label>
          <Select value={data.experience_level || ''} onValueChange={(val) => update('experience_level', val)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {EXPERIENCE_LEVELS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content Formats */}
      <MultiSelectField
        label="Content Formats (select all that apply)"
        options={CONTENT_FORMATS}
        value={data.content_formats}
        onChange={(val) => update('content_formats', val)}
        columns={2}
      />

      {/* Video Styles */}
      <MultiSelectField
        label="Video Styles"
        options={VIDEO_STYLES}
        value={data.video_styles}
        onChange={(val) => update('video_styles', val)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Video Length */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-700">Preferred Video Length</Label>
          <Select value={data.video_length_style || ''} onValueChange={(val) => update('video_length_style', val)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {VIDEO_LENGTH_STYLES.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Shortform Tempo */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-700">Short-form Tempo</Label>
          <Select value={data.shortform_tempo || ''} onValueChange={(val) => update('shortform_tempo', val)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {SHORTFORM_TEMPOS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Editing Level */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-700">Editing Level</Label>
          <Select value={data.editing_level || ''} onValueChange={(val) => update('editing_level', val)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {EDITING_LEVELS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Shooting Level */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-700">Shooting Setup</Label>
          <Select value={data.shooting_level || ''} onValueChange={(val) => update('shooting_level', val)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {SHOOTING_LEVELS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Upload Frequency */}
      <div className="space-y-2">
        <Label className="text-sm text-gray-700">Upload Frequency</Label>
        <Select value={data.upload_frequency || ''} onValueChange={(val) => update('upload_frequency', val)}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            {UPLOAD_FREQUENCIES.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Collaboration Preferences */}
      <MultiSelectField
        label="Collaboration Preferences"
        options={COLLABORATION_PREFERENCES}
        value={data.collaboration_preferences}
        onChange={(val) => update('collaboration_preferences', val)}
        columns={2}
      />
    </div>
  )
}

export default ProfileStepContentStyle
