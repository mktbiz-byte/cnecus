import React from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import MultiSelectField from '@/components/shared/MultiSelectField'
import {
  SKIN_TYPES, SKIN_SHADES, PERSONAL_COLORS, HAIR_TYPES,
  SKIN_CONCERNS, HAIR_CONCERNS, ETHNICITIES
} from './profileConstants'

const ProfileStepBeautyProfile = ({ data, onChange }) => {
  const update = (field, value) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Skin Type */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-700">Skin Type *</Label>
          <Select value={data.skin_type || ''} onValueChange={(val) => update('skin_type', val)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {SKIN_TYPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Skin Shade */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-700">Skin Shade</Label>
          <Select value={data.skin_shade || ''} onValueChange={(val) => update('skin_shade', val)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {SKIN_SHADES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Personal Color */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-700">Personal Color</Label>
          <Select value={data.personal_color || ''} onValueChange={(val) => update('personal_color', val)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {PERSONAL_COLORS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Hair Type */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-700">Hair Type</Label>
          <Select value={data.hair_type || ''} onValueChange={(val) => update('hair_type', val)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {HAIR_TYPES.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Skin Concerns */}
      <MultiSelectField
        label="Skin Concerns (select all that apply)"
        options={SKIN_CONCERNS}
        value={data.skin_concerns}
        onChange={(val) => update('skin_concerns', val)}
      />

      {/* Hair Concerns */}
      <MultiSelectField
        label="Hair Concerns (select all that apply)"
        options={HAIR_CONCERNS}
        value={data.hair_concerns}
        onChange={(val) => update('hair_concerns', val)}
        columns={4}
      />

      {/* Ethnicity */}
      <div className="space-y-2">
        <Label className="text-sm text-gray-700">Ethnicity</Label>
        <Select value={data.ethnicity || ''} onValueChange={(val) => update('ethnicity', val)}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            {ETHNICITIES.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default ProfileStepBeautyProfile
