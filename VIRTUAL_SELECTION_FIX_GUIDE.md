# Virtual Selection Feature Fix Guide

## Overview
This guide explains how to fix the virtual selection feature in the CNEC US platform admin panel.

## Problem Identified

### Database Schema Issue
The `campaign_applications` table's status constraint only allows:
- `pending`
- `approved`
- `rejected`
- `completed`

But the code tries to use `virtual_selected` status, which causes errors.

### Missing Column
The `virtual_selected_at` timestamp column is missing from the base schema.

## Solution

### Step 1: Update Database Schema

Execute the SQL script `FIX_VIRTUAL_SELECTION.sql` in Supabase SQL Editor:

```sql
-- This script will:
-- 1. Add virtual_selected_at column
-- 2. Update status constraint to include 'virtual_selected'
-- 3. Create indexes for better performance
```

**Location**: `/home/ubuntu/cnecus/FIX_VIRTUAL_SELECTION.sql`

### Step 2: Frontend Updates

The following files have been updated with English translations:

#### ApplicationsReportSimple.jsx
- ✅ Added English (en) translations for all UI text
- ✅ Virtual selection button labels translated
- ✅ Confirmation messages translated
- ✅ Status labels translated

**Key Features**:
- Virtual Select button (for pending applications)
- Cancel Virtual Selection button (for virtually selected applications)
- Approve/Reject buttons work with all statuses
- Timestamp tracking for virtual_selected_at

### Step 3: How Virtual Selection Works

1. **Pending → Virtual Selected**
   - Admin clicks "Virtual Select" button
   - Status changes to `virtual_selected`
   - `virtual_selected_at` timestamp is set

2. **Virtual Selected → Pending**
   - Admin clicks "Cancel Virtual Selection" button
   - Status changes back to `pending`
   - `virtual_selected_at` timestamp remains (for history)

3. **Virtual Selected → Approved**
   - Admin clicks "Approve" button
   - Status changes to `approved`
   - `approved_at` timestamp is set

4. **Virtual Selected → Rejected**
   - Admin clicks "Reject" button
   - Status changes to `rejected`
   - `rejected_at` timestamp is set

## Status Flow Diagram

```
pending
  ├─→ virtual_selected
  │     ├─→ approved
  │     ├─→ rejected
  │     └─→ pending (cancel)
  ├─→ approved
  └─→ rejected
```

## Database Changes Required

### 1. Add Column
```sql
ALTER TABLE campaign_applications 
ADD COLUMN virtual_selected_at TIMESTAMP WITH TIME ZONE;
```

### 2. Update Constraint
```sql
ALTER TABLE campaign_applications 
DROP CONSTRAINT campaign_applications_status_check;

ALTER TABLE campaign_applications 
ADD CONSTRAINT campaign_applications_status_check 
CHECK (status IN ('pending', 'virtual_selected', 'approved', 'rejected', 'completed'));
```

### 3. Add Indexes
```sql
CREATE INDEX idx_campaign_applications_virtual_selected_at 
ON campaign_applications(virtual_selected_at) 
WHERE virtual_selected_at IS NOT NULL;

CREATE INDEX idx_campaign_applications_status 
ON campaign_applications(status);
```

## Testing Checklist

After applying the database fix:

- [ ] Pending application can be virtually selected
- [ ] Virtual selected application shows correct status badge
- [ ] Virtual selected application can be approved
- [ ] Virtual selected application can be rejected
- [ ] Virtual selected application can be cancelled back to pending
- [ ] Virtual selected timestamp is recorded correctly
- [ ] Filter by "Virtual Selected" status works
- [ ] Statistics count virtual selected applications correctly
- [ ] Excel export includes virtual selected status

## UI Components Updated

### ApplicationsReportSimple.jsx
- Status filter dropdown includes "Virtual Selected"
- Status badge displays purple color for virtual selected
- Action buttons show/hide based on current status
- Detail modal shows virtual_selected_at timestamp

### Status Badge Colors
- Pending: Yellow (bg-yellow-100 text-yellow-800)
- Virtual Selected: Purple (bg-purple-100 text-purple-800)
- Approved: Green (bg-green-100 text-green-800)
- Rejected: Red (bg-red-100 text-red-800)

## Language Support

### Korean (ko)
- virtualSelected: '가상 선택'
- virtualSelect: '가상 선택'
- cancelVirtualSelect: '가상 선택 취소'
- confirmVirtualSelect: '이 신청자를 가상 선택하시겠습니까?'
- confirmCancelVirtualSelect: '가상 선택을 취소하시겠습니까?'
- virtualSelectedAt: '가상 선택일'

### Japanese (ja)
- virtualSelected: '仮選択'
- virtualSelect: '仮選択'
- cancelVirtualSelect: '仮選択取消'
- confirmVirtualSelect: 'この申請者を仮選択しますか？'
- confirmCancelVirtualSelect: '仮選択を取り消しますか？'
- virtualSelectedAt: '仮選択日'

### English (en)
- virtualSelected: 'Virtual Selected'
- virtualSelect: 'Virtual Select'
- cancelVirtualSelect: 'Cancel Virtual Selection'
- confirmVirtualSelect: 'Are you sure you want to virtually select this applicant?'
- confirmCancelVirtualSelect: 'Are you sure you want to cancel virtual selection?'
- virtualSelectedAt: 'Virtual Selected At'

## Next Steps

1. Execute `FIX_VIRTUAL_SELECTION.sql` in Supabase
2. Verify database changes
3. Test virtual selection feature in admin panel
4. Check all status transitions work correctly
5. Verify timestamps are recorded properly

## Files Modified

- `/home/ubuntu/cnecus/FIX_VIRTUAL_SELECTION.sql` (NEW)
- `/home/ubuntu/cnecus/src/components/admin/ApplicationsReportSimple.jsx` (UPDATED)
- `/home/ubuntu/cnecus/VIRTUAL_SELECTION_FIX_GUIDE.md` (NEW)

## Notes

- The virtual selection feature is primarily used in the Japanese version (cnec.jp)
- It allows admins to pre-select candidates before final approval
- This is useful for managing large numbers of applications
- The US version inherits this feature for consistency

