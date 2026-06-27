# Supabase API Key Format Issue - 401 Invalid API Key

## Problem

When attempting to send a magic link via `/auth/v1/otp`, you receive:
```
401 Unauthorized
Invalid API key
```

Even though:
- Environment variables are correctly loaded
- Supabase client initializes successfully
- The URL and key are being read from `process.env`

## Root Cause

Supabase has migrated to a new API key format for newer projects. The issue occurs when:

1. **Your Supabase project uses the new Publishable Key format** (`sb_publishable_...`)
2. **But your environment variables contain the old JWT format** (`eyJ...`)

The `@supabase/supabase-js` SDK version 2.x supports both formats, but your Supabase backend may be configured to reject the old JWT keys.

## Key Formats Explained

### Old Format (Legacy JWT)
- **Prefix**: `eyJ...` (starts with JWT encoding)
- **Used in**: Older Supabase projects
- **Status**: Deprecated for new projects

### New Format (Publishable Key)
- **Prefix**: `sb_publishable_...`
- **Used in**: Supabase projects created after ~2024
- **Status**: Current standard for all new projects

## How to Identify Which Format You Need

The updated diagnostics panel on the login page now shows:
```
KEY FORMAT: NEW FORMAT (sb_publishable_...)  ← GREEN if using new format
KEY FORMAT: OLD FORMAT (JWT eyJ...)          ← YELLOW if using old format
```

## How to Fix

### If diagnostics show "OLD FORMAT" but you're getting 401 errors:

1. **Go to your Supabase dashboard**
2. **Navigate to Settings → API**
3. **Look for the "Publishable Key" section** (separate from "Anon Key")
4. **Copy the key starting with `sb_publishable_`**
5. **In Vercel project settings:**
   - Update `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the new publishable key
   - Keep `NEXT_PUBLIC_SUPABASE_URL` unchanged
6. **Redeploy the application**

### If diagnostics show "NEW FORMAT" but still getting 401:

The issue is not the key format. It may be:
- **Email OTP not enabled** in Supabase authentication settings
- **Email provider not configured** (check Auth → Email Templates)
- **CORS/redirect URL issue** - verify redirect URL matches your deployment domain
- **Rate limiting** - check if you're hitting Supabase rate limits

## SDK Compatibility

- **@supabase/supabase-js v2.x** (current): Supports both old JWT and new publishable keys
- The SDK will work with either format, but the Supabase backend may reject old formats on newer projects

## Implementation Details

The `createClient()` function in `/lib/supabase.ts` accepts either key format:
```typescript
createClient(supabaseUrl, supabaseAnonKey)
```

Both formats work with the SDK, but Supabase backend validation may differ based on which format your project expects.

## Diagnostics Panel Alert

The login page now displays a critical alert:
```
CRITICAL: If 401 "Invalid API key" occurs and KEY FORMAT shows "OLD FORMAT (JWT eyJ...)", 
your Supabase project may require the NEW FORMAT (sb_publishable_...) key. 
Update NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel to use the publishable key starting with sb_publishable_
```

This alert appears automatically if an old-format key is detected.
