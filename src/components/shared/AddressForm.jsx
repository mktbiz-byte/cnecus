import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { COUNTRIES, US_STATES, JP_PREFECTURES, KR_PROVINCES, countryCodeToFlag } from './countryData'

const AddressForm = ({ value = {}, onChange, showRecipientName = true }) => {
  const country = value.shipping_country || 'US'

  const update = (field, val) => {
    onChange({ ...value, [field]: val })
  }

  const getStateOptions = () => {
    switch (country) {
      case 'US': return US_STATES
      case 'JP': return JP_PREFECTURES
      case 'KR': return KR_PROVINCES
      default: return null
    }
  }

  const getStateLabel = () => {
    switch (country) {
      case 'US': return 'State'
      case 'JP': return 'Prefecture'
      case 'KR': return 'Province'
      default: return 'State / Province'
    }
  }

  const getZipLabel = () => {
    switch (country) {
      case 'US': return 'ZIP Code'
      case 'JP': return 'Postal Code (XXX-XXXX)'
      case 'KR': return 'Postal Code'
      default: return 'Postal / ZIP Code'
    }
  }

  const getCityLabel = () => {
    switch (country) {
      case 'JP': return 'City / Ward'
      default: return 'City'
    }
  }

  const stateOptions = getStateOptions()

  return (
    <div className="space-y-4">
      {/* Country */}
      <div className="space-y-2">
        <Label className="text-sm text-gray-700">Country *</Label>
        <Select
          value={country}
          onValueChange={(val) => update('shipping_country', val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {COUNTRIES.map(c => (
              <SelectItem key={c.code} value={c.code}>
                {countryCodeToFlag(c.code)} {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Recipient Name */}
      {showRecipientName && (
        <div className="space-y-2">
          <Label className="text-sm text-gray-700">Recipient Name *</Label>
          <Input
            value={value.shipping_recipient_name || ''}
            onChange={(e) => update('shipping_recipient_name', e.target.value)}
            placeholder="Full name of the recipient"
          />
        </div>
      )}

      {/* Address Line 1 */}
      <div className="space-y-2">
        <Label className="text-sm text-gray-700">Address Line 1 *</Label>
        <Input
          value={value.shipping_address_line1 || value.shipping_address || ''}
          onChange={(e) => {
            update('shipping_address_line1', e.target.value)
            update('shipping_address', e.target.value)
          }}
          placeholder="Street address"
        />
      </div>

      {/* Address Line 2 */}
      <div className="space-y-2">
        <Label className="text-sm text-gray-700">Address Line 2</Label>
        <Input
          value={value.shipping_address_line2 || value.detail_address || ''}
          onChange={(e) => {
            update('shipping_address_line2', e.target.value)
            update('detail_address', e.target.value)
          }}
          placeholder="Apt, suite, unit, etc. (optional)"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* City */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-700">{getCityLabel()} *</Label>
          <Input
            value={value.shipping_city || ''}
            onChange={(e) => update('shipping_city', e.target.value)}
            placeholder={getCityLabel()}
          />
        </div>

        {/* State / Prefecture / Province */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-700">{getStateLabel()} *</Label>
          {stateOptions ? (
            <Select
              value={value.shipping_state || ''}
              onValueChange={(val) => update('shipping_state', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${getStateLabel().toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {stateOptions.map(s => (
                  <SelectItem key={s.code} value={s.code}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              value={value.shipping_state || ''}
              onChange={(e) => update('shipping_state', e.target.value)}
              placeholder={getStateLabel()}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* ZIP / Postal Code */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-700">{getZipLabel()} *</Label>
          <Input
            value={value.shipping_zip || value.postal_code || ''}
            onChange={(e) => {
              update('shipping_zip', e.target.value)
              update('postal_code', e.target.value)
            }}
            placeholder={getZipLabel()}
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-700">Phone *</Label>
          <Input
            value={value.shipping_phone || ''}
            onChange={(e) => update('shipping_phone', e.target.value)}
            placeholder="Including country code"
          />
        </div>
      </div>
    </div>
  )
}

export default AddressForm
