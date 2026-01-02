# Analytics Setup Complete

## Google Analytics 4 Integration

Your Grant Geenie site now has Google Analytics 4 fully integrated and ready to track user behavior.

### Your GA4 Measurement ID
```
G-BSZ96GR6E0
```

## Quick Start

### For Local Development

Add to your `.env` file:
```bash
VITE_GA_MEASUREMENT_ID=G-BSZ96GR6E0
```

### For Production (Vercel)

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add:
   - **Name:** `VITE_GA_MEASUREMENT_ID`
   - **Value:** `G-BSZ96GR6E0`
   - **Environment:** Production (and optionally Preview/Development)
4. Redeploy your site

## What's Being Tracked

### Automatic Tracking
- **Page Views:** All state transitions (landing, auth, questionnaire, dashboard, billing pages, terms)
- **User Authentication:** Login, signup, and logout events
- **Questionnaire Completion:** When users finish onboarding

### Available Custom Events

You can track additional events using the analytics utility:

```typescript
import { analytics } from './lib/analytics';

// Grant interactions
analytics.trackGrantAction('view', grantId);
analytics.trackGrantAction('favorite', grantId);
analytics.trackGrantAction('unfavorite', grantId);
analytics.trackGrantAction('search');

// Search tracking
analytics.trackSearch(searchQuery, resultCount);

// Subscription events
analytics.trackSubscription('start', 'premium');
analytics.trackSubscription('cancel');
analytics.trackSubscription('upgrade', 'enterprise');

// Custom events
analytics.trackEvent({
  category: 'Feature',
  action: 'feature_used',
  label: 'feature_name',
  value: 1
});
```

## Viewing Your Analytics

1. Go to [Google Analytics](https://analytics.google.com)
2. Select your Grant Geenie property
3. View real-time data in **Reports → Realtime**
4. View historical data in **Reports → Life cycle**

## Files Modified

- ✅ `src/lib/analytics.ts` - Analytics utility with GA4 integration
- ✅ `src/App.tsx` - Integrated page view and event tracking
- ✅ `.env.example` - Added GA4 measurement ID variable

## Next Steps

1. **Set up your environment variable** (see Quick Start above)
2. **Deploy to production** - Analytics will start tracking immediately
3. **Monitor your data** in Google Analytics dashboard
4. **Add custom tracking** to components like grant cards, search bars, and subscription buttons

## Privacy Considerations

- Analytics only tracks anonymous usage patterns
- No personally identifiable information (PII) is sent to Google Analytics
- All tracking complies with privacy best practices
- Consider adding a cookie consent banner if required by your jurisdiction
