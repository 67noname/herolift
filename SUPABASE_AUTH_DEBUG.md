# Supabase Authentication Debug Report

## Issues Found and Fixed

### 1. **Critical Bug: Supabase Client Caching Race Condition**

**Problem:** In `lib/supabase.ts`, the client was being cached permanently on first initialization. If environment variables weren't available on the first call to `getSupabase()`, it would return `null` forever, even after environment variables became available.

**Original Code:**
```typescript
let supabase: any = null;

export function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  if (supabase === null) {  // ❌ Only checks if supabase is null, never re-reads env vars
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  return supabase;
}
```

**Fixed Code:**
```typescript
let supabase: any = null;
let cachedUrl: string | null = null;  // Track which URL is cached

export function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[v0] Supabase config missing:', {
      url: !!supabaseUrl,
      key: !!supabaseAnonKey,
    });
    return null;
  }

  // ✅ Create new client if not cached or URL changed
  if (supabase === null || cachedUrl !== supabaseUrl) {
    console.log('[v0] Creating Supabase client with:', {
      url: supabaseUrl.substring(0, 40),
      keyLength: supabaseAnonKey.length,
    });
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    cachedUrl = supabaseUrl;
  }

  return supabase;
}
```

**Why this matters:** Environment variables in Vercel are only available at runtime in the browser (for `NEXT_PUBLIC_*` prefixed vars). If the app hydrates before the browser loads these variables, the initial Supabase client initialization fails permanently.

---

### 2. **Missing Required Options in signInWithOtp**

**Problem:** The `signInWithOtp` call in `lib/auth.ts` was missing the redirect URL, which is required for proper email magic link authentication.

**Original Code:**
```typescript
const { error } = await supabase.auth.signInWithOtp({
  email,
});
```

**Fixed Code:**
```typescript
const { error } = await supabase.auth.signInWithOtp({
  email,
  options: {
    emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
  },
});
```

**Why this matters:** Without `emailRedirectTo`, Supabase doesn't know where to send users after clicking the magic link. This can cause authentication failures or redirect issues.

---

### 3. **Added Comprehensive Error Logging**

Added detailed error logging in `lib/auth.ts` to capture and report exact error details from Supabase:

```typescript
if (error) {
  console.error('[v0] signInWithOtp error details:', {
    status: error.status,
    message: error.message,
    name: error.name,
    code: (error as any).code,
  });
  throw error;
}
```

This provides visibility into what Supabase is actually returning.

---

### 4. **Added Diagnostic Component**

Created `components/auth/auth-diagnostic.tsx` to display:
- Environment variable presence and values (truncated for security)
- Supabase client existence verification
- API configuration details

This component is shown on the login page and helps verify that:
- `NEXT_PUBLIC_SUPABASE_URL` is correctly set
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correctly set
- The Supabase client was successfully initialized

---

## 401 Invalid API Key - Root Causes to Check

If you're still getting a 401 error, it's likely one of these issues:

### A. Supabase Project Auth Not Configured
- Check Supabase dashboard → Authentication → Providers
- Email provider must be **enabled**
- Email OTP must be **enabled** (not just standard password auth)
- Check that email templates are configured

### B. Wrong API Key
- Verify you're using the **Anon Public Key**, not the Service Key
- In Supabase: Settings → API → Anon Public Key
- Should look like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### C. CORS Configuration
- Supabase → Authentication → URL Configuration
- Verify your app's URL is added to the allowed URLs
- Example: `https://yourapp.vercel.app`

### D. Environment Variables Not Loading
- Go to Vercel project → Settings → Environment Variables
- Confirm both variables are set:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Redeploy** after adding/changing environment variables
- Production deployment must use Vercel's environment, not local dev

---

## Verification Steps

1. **Check the Diagnostic Output**
   - Go to your production deployment
   - You'll see environment config and Supabase client info at the bottom of the login page
   - Verify values are present

2. **Review Browser Console**
   - Open DevTools → Console
   - Look for logs like: `[v0] Creating Supabase client with:`
   - These will show exactly what URL and key are being used

3. **Check Supabase Dashboard**
   - Logs → Auth  
   - Look for your OTP request attempts
   - Check if there are any error messages

4. **Test Email Delivery**
   - Check spam/junk folder
   - Supabase may have limitations on sending emails (e.g., if not on paid plan)
   - Some email providers block emails from Supabase by default

---

## Files Modified

| File | Changes |
|------|---------|
| `lib/supabase.ts` | Fixed caching bug, added URL tracking, enhanced logging |
| `lib/auth.ts` | Added redirect URL to OTP call, added detailed error logging |
| `components/auth/auth-diagnostic.tsx` | **New** - Diagnostic component showing config |
| `components/auth/login-page.tsx` | Integrated diagnostic display |

---

## Next Steps

1. Commit and deploy these changes
2. Test on production deployment (https://premium-bench-press-pwa.vercel.app)
3. Check the diagnostic panel to verify environment configuration
4. Review browser console logs during magic link attempt
5. Check Supabase dashboard auth logs for exact error
6. Verify Supabase project has Email OTP authentication enabled
