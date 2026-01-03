# Analytics Troubleshooting Guide

## Is Analytics Working?

### Quick Check

1. **Visit your live site:** https://grant-geenie.vercel.app (or your domain)
2. **Open browser console** (F12 or right-click → Inspect → Console)
3. **Look for these signs:**
   - ✅ GOOD: No errors mentioning "gtag" or "analytics"
   - ✅ GOOD: Network tab shows requests to `google-analytics.com`
   - ❌ BAD: Console error: "analytics is not defined"
   - ❌ BAD: Console error: "VITE_GA_MEASUREMENT_ID is undefined"

### Verify in Google Analytics

1. Go to [Google Analytics](https://analytics.google.com)
2. Select your property with ID: **G-BSZ96GR6E0**
3. Click **Reports → Realtime**
4. Open your site in another tab
5. Within 5-10 seconds, you should see:
   - Active users increase by 1
   - Your page view appear in the event list

## Common Issues

### Issue 1: "Not seeing any data in GA4"

**Cause:** Environment variable not set in Vercel

**Fix:**
```bash
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Check if VITE_GA_MEASUREMENT_ID exists
3. Value should be: G-BSZ96GR6E0
4. If missing or wrong, add/update it
5. Redeploy your site (important!)
```

**Verify the fix:**
- Visit your site
- Open browser console
- Type: `console.log(window.gtag)`
- Should see: `function gtag() { ... }`
- If `undefined`, the variable is still not loaded

### Issue 2: "Analytics worked before, stopped working"

**Cause:** Recent deployment may have overwritten config

**Fix:**
1. Check your latest deployment logs in Vercel
2. Look for: `VITE_GA_MEASUREMENT_ID` in the build output
3. If not present, the env variable isn't being picked up
4. Go to Settings → Environment Variables
5. Make sure it's checked for **Production** environment
6. Click "Redeploy" (don't use cached build)

### Issue 3: "Seeing errors in console"

**Error:** `Uncaught ReferenceError: gtag is not defined`

**Cause:** Analytics script failed to load or initialized too late

**Fix:** This is usually a timing issue. The code handles this gracefully - analytics will initialize on next page view.

**Error:** `Failed to load resource: google-analytics.com`

**Cause:** Ad blocker or privacy extension blocking GA

**Fix:** This is expected for users with blockers. Test in incognito mode without extensions.

### Issue 4: "Data delayed or not real-time"

**This is normal!** Google Analytics may take:
- **Real-time reports:** 5-10 seconds
- **Standard reports:** 24-48 hours for full data processing
- **First-time setup:** Up to 24 hours to start showing data

## Manual Test

Add this to your browser console on your site:

```javascript
// Check if gtag is loaded
console.log('gtag loaded:', typeof window.gtag !== 'undefined');

// Check if dataLayer exists
console.log('dataLayer:', window.dataLayer);

// Manually trigger a test event
if (window.gtag) {
  window.gtag('event', 'test_event', {
    event_category: 'Test',
    event_label: 'Manual Console Test'
  });
  console.log('Test event sent!');
} else {
  console.error('gtag not available');
}
```

## Current Tracking Setup

### ✅ What's Already Being Tracked

1. **Page Views** - Every state change in your app:
   - Landing page
   - Auth/login page
   - Questionnaire
   - Dashboard home
   - Billing success/cancel
   - Terms of service

2. **User Events:**
   - Login/signup
   - Questionnaire completion

### 📊 What You Can Add

The analytics utility supports tracking:
- Grant interactions (view, favorite, search)
- Subscription events (start, cancel, upgrade)
- Search queries with result counts
- Custom events for any feature

## Vercel Environment Variables Checklist

- [ ] Variable name is exactly: `VITE_GA_MEASUREMENT_ID`
- [ ] Value is exactly: `G-BSZ96GR6E0`
- [ ] Environment is checked: **Production**
- [ ] Site has been redeployed AFTER adding the variable
- [ ] Build cache was NOT used in the deployment

## Still Not Working?

### Check Browser Network Tab

1. Open DevTools (F12)
2. Go to **Network** tab
3. Reload your site
4. Filter by "google"
5. Look for requests to:
   - `googletagmanager.com/gtag/js?id=G-BSZ96GR6E0`
   - `google-analytics.com/g/collect`

**If you see these requests = Analytics is working!**

GA4 may take 24 hours to start showing data for brand new properties.

### Verify Your GA4 Property

1. Make sure **G-BSZ96GR6E0** is the correct Measurement ID
2. Check if it's from a **GA4 property** (not Universal Analytics)
3. GA4 properties start with "G-" (Universal Analytics starts with "UA-")

## Contact Support

If none of this helps:

1. Check if your GA4 property is properly set up in Google Analytics
2. Verify you have access to the property with ID G-BSZ96GR6E0
3. Try creating a new test property and updating the env variable
4. Consider using an alternative like Plausible or Fathom Analytics

## Debug Mode

To enable verbose GA4 debugging:

```javascript
// Add this to browser console
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('config', 'G-BSZ96GR6E0', { 'debug_mode': true });
```

Then check the Network tab for detailed GA4 debug information.
