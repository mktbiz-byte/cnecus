# Application Status Update Fix

## Overview
This document explains the fixes applied to the application status update functionality in the CNEC US platform.

## Problems Identified

### 1. Non-existent Database Columns

**Original Code** (`supabase.js`):
```javascript
if (status === 'virtual_selected') {
  updateData.virtual_selected_at = new Date().toISOString()
} else if (status === 'rejected') {
  updateData.rejected_at = new Date().toISOString()
}
```

**Problem**: The code tried to update `virtual_selected_at` and `rejected_at` columns that **don't exist** in the database schema.

**Existing Columns** (campaign_applications table):
- `approved_at` ✅
- `completed_at` ✅
- `shipped_at` ✅
- `virtual_selected_at` ❌ (missing)
- `rejected_at` ❌ (missing)

### 2. Table Name Fallback Logic

**Original Code**:
```javascript
let { data, error } = await supabase
  .from('applications')  // Try this first
  .update(updateData)
  .eq('id', id)
  .select()

if (error || !data || data.length === 0) {
  // Fallback to campaign_applications
  const result = await supabase
    .from('campaign_applications')
    .update(updateData)
    .eq('id', id)
    .select()
}
```

**Problem**: The code tried `applications` table first, but the actual table is `campaign_applications`. This caused unnecessary errors and fallback attempts.

### 3. Status Enum Constraint

**Original Schema**:
```sql
CHECK (status IN ('pending', 'approved', 'rejected', 'completed'))
```

**Problem**: Missing `virtual_selected` and `cancelled` statuses that the application uses.

## Solutions Applied

### 1. Updated `updateStatus` Function

**File**: `/home/ubuntu/cnecus/src/lib/supabase.js`

```javascript
async updateStatus(id, status) {
  return safeQuery(async () => {
    console.log('Application status update started:', id, status)
    
    const updateData = { 
      status,
      updated_at: new Date().toISOString()
    }

    // Add timestamp for approved status only (approved_at exists in schema)
    if (status === 'approved') {
      updateData.approved_at = new Date().toISOString()
    } else if (status === 'completed') {
      updateData.completed_at = new Date().toISOString()
    }
    // Note: virtual_selected_at and rejected_at columns don't exist in schema
    // Status is tracked via the 'status' field only

    // Use campaign_applications table (the actual table name)
    const { data, error } = await supabase
      .from('campaign_applications')
      .update(updateData)
      .eq('id', id)
      .select()
    
    if (error) {
      console.error('Application status update error:', error)
      throw error
    }
    
    console.log('Application status update successful:', data)
    return data && data.length > 0 ? data[0] : null
  })
}
```

**Key Changes**:
1. Removed attempts to update non-existent columns (`virtual_selected_at`, `rejected_at`)
2. Directly use `campaign_applications` table (no fallback logic)
3. Only update timestamps for columns that exist (`approved_at`, `completed_at`)
4. Status changes are tracked via the `status` field only
5. Changed console logs to English

### 2. Updated Database Schema

**File**: `/home/ubuntu/cnecus/FIX_VIRTUAL_SELECTION.sql`

```sql
-- Step 1: Add virtual_selected_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaign_applications' 
        AND column_name = 'virtual_selected_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaign_applications 
        ADD COLUMN virtual_selected_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added virtual_selected_at column';
    ELSE
        RAISE NOTICE 'virtual_selected_at column already exists';
    END IF;
END $$;

-- Step 2: Drop existing status constraint
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'campaign_applications_status_check'
    ) THEN
        ALTER TABLE campaign_applications 
        DROP CONSTRAINT campaign_applications_status_check;
        RAISE NOTICE 'Dropped old status constraint';
    END IF;
END $$;

-- Step 3: Add new status constraint with virtual_selected and cancelled
ALTER TABLE campaign_applications 
ADD CONSTRAINT campaign_applications_status_check 
CHECK (status IN ('pending', 'virtual_selected', 'approved', 'rejected', 'completed', 'cancelled'));

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaign_applications_virtual_selected_at 
ON campaign_applications(virtual_selected_at) 
WHERE virtual_selected_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_campaign_applications_status 
ON campaign_applications(status);
```

**What This Does**:
1. Adds `virtual_selected_at` column (optional - for tracking when virtual selection happened)
2. Updates status constraint to include `virtual_selected` and `cancelled`
3. Creates indexes for better query performance

## Application Status Flow

### Status Transitions

```
pending → virtual_selected → approved → completed
   ↓            ↓              ↓
rejected    rejected       cancelled
```

### Status Meanings

| Status | Description | Timestamp Column |
|--------|-------------|------------------|
| `pending` | Application submitted, awaiting review | `submitted_at` |
| `virtual_selected` | Virtually selected by admin (not final) | `virtual_selected_at` (optional) |
| `approved` | Officially approved by admin | `approved_at` |
| `rejected` | Rejected by admin | None (track via `status` only) |
| `completed` | Campaign completed by creator | `completed_at` |
| `cancelled` | Cancelled by admin or creator | None |

### Admin Actions

**ApplicationsReportSimple.jsx** provides these actions:

1. **When status is `pending`**:
   - Virtual Select → Changes to `virtual_selected`
   - Approve → Changes to `approved`
   - Reject → Changes to `rejected`

2. **When status is `virtual_selected`**:
   - Cancel Virtual Select → Changes back to `pending`
   - Approve → Changes to `approved`
   - Reject → Changes to `rejected`

3. **When status is `approved`**:
   - Cancel → Changes back to `pending`

## How to Apply Database Changes

### Option 1: Run SQL Script (Recommended)

1. Go to Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the entire content of `FIX_VIRTUAL_SELECTION.sql`
4. Click **Run**
5. Verify the changes:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'campaign_applications' 
   AND column_name IN ('status', 'virtual_selected_at');
   ```

### Option 2: Manual Changes

If you prefer manual changes:

1. **Add Column**:
   ```sql
   ALTER TABLE campaign_applications 
   ADD COLUMN virtual_selected_at TIMESTAMP WITH TIME ZONE;
   ```

2. **Update Status Constraint**:
   ```sql
   ALTER TABLE campaign_applications 
   DROP CONSTRAINT campaign_applications_status_check;
   
   ALTER TABLE campaign_applications 
   ADD CONSTRAINT campaign_applications_status_check 
   CHECK (status IN ('pending', 'virtual_selected', 'approved', 'rejected', 'completed', 'cancelled'));
   ```

3. **Create Indexes**:
   ```sql
   CREATE INDEX idx_campaign_applications_virtual_selected_at 
   ON campaign_applications(virtual_selected_at) 
   WHERE virtual_selected_at IS NOT NULL;
   
   CREATE INDEX idx_campaign_applications_status 
   ON campaign_applications(status);
   ```

## Testing Checklist

After applying the fixes:

- [ ] Virtual selection works (pending → virtual_selected)
- [ ] Cancel virtual selection works (virtual_selected → pending)
- [ ] Approval works (virtual_selected → approved)
- [ ] Rejection works (pending/virtual_selected → rejected)
- [ ] Cancellation works (approved → pending)
- [ ] Timestamps are updated correctly
- [ ] No database errors in console
- [ ] Status badges display correctly in UI

## Files Modified

1. `/home/ubuntu/cnecus/src/lib/supabase.js` (UPDATED)
   - `database.applications.updateStatus()` function

2. `/home/ubuntu/cnecus/FIX_VIRTUAL_SELECTION.sql` (UPDATED)
   - Added `cancelled` to status enum

3. `/home/ubuntu/cnecus/APPLICATION_STATUS_UPDATE_FIX.md` (NEW)
   - This documentation

## Alternative Approach (If You Don't Want virtual_selected_at Column)

If you don't want to add the `virtual_selected_at` column, you can:

1. **Skip Step 1** in the SQL script
2. Track virtual selection via the `status` field only
3. The current code already handles this approach

The `virtual_selected_at` column is **optional** and only useful if you want to:
- Track when an application was virtually selected
- Show "virtually selected X days ago" in the UI
- Generate reports on virtual selection duration

## Notes

- The `updateStatus` function now only updates columns that exist in the schema
- Status tracking is primarily done via the `status` field
- Timestamps are optional metadata for reporting purposes
- The code is now more robust and won't fail on missing columns

## Rollback Instructions

If you need to rollback the changes:

```sql
-- Remove virtual_selected_at column
ALTER TABLE campaign_applications 
DROP COLUMN IF EXISTS virtual_selected_at;

-- Restore original status constraint
ALTER TABLE campaign_applications 
DROP CONSTRAINT campaign_applications_status_check;

ALTER TABLE campaign_applications 
ADD CONSTRAINT campaign_applications_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'completed'));

-- Drop indexes
DROP INDEX IF EXISTS idx_campaign_applications_virtual_selected_at;
DROP INDEX IF EXISTS idx_campaign_applications_status;
```

Then revert the code changes in `supabase.js` to the original version.

