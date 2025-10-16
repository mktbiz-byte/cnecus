# Email Signup Fix Guide

## Overview
This guide explains the fixes applied to the email signup functionality in the CNEC US platform.

## Problems Identified

### 1. Parameter Mismatch in signUpWithEmail Function

**Before (AuthContext.jsx)**:
```javascript
const signUpWithEmail = async (email, password, name) => {
  // Expected a string 'name' as third parameter
}
```

**SignupPageUS.jsx was calling**:
```javascript
await signUpWithEmail(formData.email, formData.password, {
  full_name: formData.fullName,
  platform_region: 'us',
  country_code: 'US'
})
// Passing an object, but function expected a string
```

### 2. Missing User Metadata Fields

The original function only stored `name` in user_metadata, but we need:
- `full_name` or `name`
- `platform_region` (for data separation)
- `country_code` (for regional settings)

### 3. Incomplete Profile Creation

When creating user_profiles record, the function didn't include:
- `platform_region`
- `country_code`
- `role` (should default to 'creator')

## Solutions Applied

### 1. Updated signUpWithEmail Function

**File**: `/home/ubuntu/cnecus/src/contexts/AuthContext.jsx`

```javascript
const signUpWithEmail = async (email, password, metadata = {}) => {
  try {
    // metadata can be either a string (name) or an object with user data
    const userData = typeof metadata === 'string' 
      ? { name: metadata }
      : {
          name: metadata.full_name || metadata.name || email.split('@')[0],
          full_name: metadata.full_name || metadata.name || email.split('@')[0],
          platform_region: metadata.platform_region || 'us',
          country_code: metadata.country_code || 'US'
        };
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) {
      console.error("Email sign up error:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Sign up error:", error);
    throw error;
  }
};
```

**Key Changes**:
- Third parameter renamed from `name` to `metadata`
- Supports both string (backward compatible) and object
- Automatically extracts name from email if not provided
- Includes `platform_region` and `country_code` in user_metadata
- Added `emailRedirectTo` for email confirmation flow

### 2. Updated Profile Creation

**File**: `/home/ubuntu/cnecus/src/contexts/AuthContext.jsx`

```javascript
if (profileError && profileError.code === 'PGRST116') {
  // Create profile if it doesn't exist
  const { error: insertError } = await supabase
    .from('user_profiles')
    .insert({
      user_id: session.user.id,
      email: session.user.email,
      name: session.user.user_metadata?.full_name || 
            session.user.user_metadata?.name || 
            session.user.email.split('@')[0],
      platform_region: session.user.user_metadata?.platform_region || 'us',
      country_code: session.user.user_metadata?.country_code || 'US',
      role: 'creator'
    });
  
  if (insertError) {
    console.error("Error creating profile:", insertError);
  } else {
    console.log("Profile created successfully");
    loadUserProfile(session.user.id);
  }
}
```

**Key Changes**:
- Added `platform_region` field (defaults to 'us')
- Added `country_code` field (defaults to 'US')
- Added `role` field (defaults to 'creator')
- Improved name fallback logic

## How Email Signup Works Now

### Step 1: User Fills Form
- Email address
- Password (min 6 characters)
- Confirm password
- Full name

### Step 2: Form Validation
```javascript
if (!formData.email || !formData.password || !formData.fullName) {
  setError('Please fill in all required fields.')
  return
}

if (formData.password.length < 6) {
  setError('Password must be at least 6 characters long.')
  return
}

if (formData.password !== formData.confirmPassword) {
  setError('Passwords do not match.')
  return
}
```

### Step 3: Call signUpWithEmail
```javascript
await signUpWithEmail(formData.email, formData.password, {
  full_name: formData.fullName,
  platform_region: 'us',
  country_code: 'US'
})
```

### Step 4: Supabase Creates Auth User
- User record created in `auth.users` table
- User metadata stored:
  - `name`
  - `full_name`
  - `platform_region`
  - `country_code`
- Confirmation email sent (if enabled in Supabase)

### Step 5: User Confirms Email
- User clicks link in confirmation email
- Redirected to `/auth/callback`
- AuthCallbackSafe component handles the callback

### Step 6: Profile Auto-Creation
- On first sign-in, AuthContext checks for user_profile
- If not found, creates profile with:
  - `user_id` (from auth.users)
  - `email`
  - `name`
  - `platform_region` = 'us'
  - `country_code` = 'US'
  - `role` = 'creator'

### Step 7: Success Screen
```javascript
if (success) {
  return (
    <Card>
      <CheckCircle /> // Green checkmark
      <h2>Check Your Email!</h2>
      <p>We've sent a confirmation link to {formData.email}</p>
      <p>Please click the link to verify your account.</p>
    </Card>
  )
}
```

## Email Confirmation Settings

### Supabase Dashboard Settings

1. Go to **Authentication** → **Email Templates**
2. Ensure "Confirm signup" template is enabled
3. Template should include: `{{ .ConfirmationURL }}`

### Redirect URL Configuration

1. Go to **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   - `http://localhost:5173/auth/callback` (development)
   - `https://your-domain.com/auth/callback` (production)

### Disable Email Confirmation (Optional)

If you want to skip email confirmation for testing:

1. Go to **Authentication** → **Providers** → **Email**
2. Uncheck "Enable email confirmations"
3. Users will be immediately active after signup

**Note**: Not recommended for production!

## Error Handling

### Common Errors and Solutions

#### "User already registered"
```javascript
if (error.message.includes('already registered')) {
  errorMessage = 'This email is already registered. Please sign in instead.'
}
```

#### "Invalid email"
```javascript
if (error.message.includes('Invalid email')) {
  errorMessage = 'Please enter a valid email address.'
}
```

#### "Password too short"
```javascript
if (formData.password.length < 6) {
  setError('Password must be at least 6 characters long.')
  return
}
```

#### "Passwords don't match"
```javascript
if (formData.password !== formData.confirmPassword) {
  setError('Passwords do not match.')
  return
}
```

## Testing Checklist

After applying these fixes:

- [ ] Email signup form accepts all fields
- [ ] Password validation works (min 6 chars)
- [ ] Password confirmation validation works
- [ ] Confirmation email is sent
- [ ] Email confirmation link works
- [ ] User is redirected to /auth/callback
- [ ] User profile is created automatically
- [ ] platform_region is set to 'us'
- [ ] country_code is set to 'US'
- [ ] role is set to 'creator'
- [ ] User can sign in after confirmation
- [ ] Error messages display correctly

## Files Modified

- `/home/ubuntu/cnecus/src/contexts/AuthContext.jsx` (UPDATED)
  - signUpWithEmail function
  - Profile creation logic

- `/home/ubuntu/cnecus/src/components/SignupPageUS.jsx` (NO CHANGES NEEDED)
  - Already calling with correct parameters

- `/home/ubuntu/cnecus/EMAIL_SIGNUP_FIX_GUIDE.md` (NEW)

## Backward Compatibility

The updated `signUpWithEmail` function maintains backward compatibility:

```javascript
// Old way (still works)
await signUpWithEmail(email, password, 'John Doe')

// New way (recommended)
await signUpWithEmail(email, password, {
  full_name: 'John Doe',
  platform_region: 'us',
  country_code: 'US'
})
```

## Next Steps

1. Test email signup flow end-to-end
2. Verify confirmation email delivery
3. Check user_profiles table for correct data
4. Test with different email providers (Gmail, Outlook, etc.)
5. Monitor Supabase logs for any errors

## Notes

- Email confirmation is required by default in Supabase
- Users cannot sign in until email is confirmed
- Confirmation links expire after 24 hours (default)
- Resend confirmation email feature should be added in future

