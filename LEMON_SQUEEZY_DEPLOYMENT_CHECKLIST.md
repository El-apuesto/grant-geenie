# Lemon Squeezy Deployment Checklist

## ✅ Complete (Already Pushed to GitHub)

### Code Changes
- ✅ PricingPage.tsx updated with Lemon Squeezy variant IDs
- ✅ UpgradeButton.tsx updated with:
  - Store slug: `icap.io`
  - User ID passed in checkout URL
  - Success redirect: `/billing/success`
  - Cancel redirect: `/billing/cancel`
- ✅ Webhook handler created: `supabase/functions/lemonsqueezy-webhook/index.ts`
- ✅ useSubscription hook created for checking subscription status
- ✅ .env.example updated with store slug

## 🔧 Manual Steps Required

### 1. Local Environment Setup

```bash
# Pull latest changes
git pull origin main

# Add to your .env file
echo "VITE_LEMON_SQUEEZY_STORE_SLUG=icap.io" >> .env
```

### 2. Supabase Configuration

```bash
# Set webhook secret in Supabase
supabase secrets set LEMON_SQUEEZY_WEBHOOK_SECRET=a55212feelabb561d22250f8f

# Deploy webhook function
supabase functions deploy lemonsqueezy-webhook
```

**Get your webhook URL after deployment:**
```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/lemonsqueezy-webhook
```

### 3. Lemon Squeezy Dashboard Configuration

#### A. Configure Webhook
1. Go to: https://app.lemonsqueezy.com/settings/webhooks
2. Click "+ New Webhook"
3. **Callback URL**: `https://YOUR_PROJECT_ID.supabase.co/functions/v1/lemonsqueezy-webhook`
4. **Signing Secret**: `a55212feelabb561d22250f8f`
5. **Select Events**:
   - ✅ subscription_created
   - ✅ subscription_updated
   - ✅ subscription_cancelled
   - ✅ subscription_expired
   - ✅ subscription_payment_success
   - ✅ subscription_payment_failed
   - ✅ subscription_resumed
   - ✅ subscription_paused
6. Click "Save"

#### B. Set Default Redirect URLs (Optional but Recommended)
1. Go to: https://app.lemonsqueezy.com/settings/stores
2. Select your "icap" store
3. Go to "Checkout" settings
4. Set:
   - **Success URL**: `https://yourdomain.com/billing/success`
   - **Cancel URL**: `https://yourdomain.com/billing/cancel`

### 4. Testing

#### Test Mode Testing
```bash
# Ensure Lemon Squeezy is in Test Mode
# Use test card: 4242 4242 4242 4242
# Any future expiry date
# Any CVV

# Monitor webhook calls
supabase functions logs lemonsqueezy-webhook --follow
```

**Test Flow:**
1. Click upgrade button in your app
2. Complete checkout with test card
3. Verify redirect to `/billing/success`
4. Check Supabase logs for webhook events
5. Query profiles table to verify subscription status updated

```sql
-- Check subscription was created
SELECT 
  id,
  email,
  subscription_status,
  subscription_tier,
  lemon_squeezy_subscription_id
FROM profiles
WHERE email = 'your-test-email@example.com';
```

#### Go Live
1. Switch Lemon Squeezy to **Live Mode**
2. Create new API key in Live Mode (if needed for future features)
3. Update webhook to **Live Mode** in Lemon Squeezy dashboard
4. Update redirect URLs to production domain
5. Test with real card (small amount)

## 📊 Using the Subscription Hook

```typescript
import { useSubscription } from '../hooks/useSubscription';
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user } = useAuth();
  const { subscription, loading, isSubscribed, isPro } = useSubscription(user?.id);

  if (loading) return <div>Loading...</div>;

  if (isPro) {
    return <div>Welcome Pro User!</div>;
  }

  return <div>Upgrade to Pro</div>;
}
```

## 🔍 Troubleshooting

### Webhook Not Receiving Events
- ✅ Check webhook URL is publicly accessible
- ✅ Verify signing secret matches in both places
- ✅ Check Supabase function logs: `supabase functions logs lemonsqueezy-webhook`
- ✅ Test webhook in Lemon Squeezy dashboard (Send Test Event)

### Checkout Not Working
- ✅ Verify `VITE_LEMON_SQUEEZY_STORE_SLUG=icap.io` in .env
- ✅ Check browser console for errors
- ✅ Verify user is authenticated before clicking upgrade
- ✅ Check Network tab to see checkout URL being generated

### Subscription Not Updating
- ✅ Check profiles table has required columns:
  - subscription_status
  - subscription_tier
  - lemon_squeezy_subscription_id
  - lemon_squeezy_variant_id
  - subscription_ends_at
- ✅ Verify user_id is in webhook payload custom data
- ✅ Check Supabase function logs for errors

## 📝 Database Schema Reference

Your `profiles` table should have these columns:

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  subscription_status TEXT DEFAULT 'inactive',
  subscription_tier TEXT DEFAULT 'free',
  lemon_squeezy_subscription_id TEXT,
  lemon_squeezy_variant_id TEXT,
  subscription_ends_at TIMESTAMPTZ,
  questionnaire_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🚀 Deployment Order

1. ✅ **Code** - Already done, just pull
2. 🔧 **Environment variables** - Add to .env
3. 🔧 **Supabase secrets** - Set webhook secret
4. 🔧 **Deploy function** - `supabase functions deploy`
5. 🔧 **Configure webhook** - In Lemon Squeezy dashboard
6. 🧪 **Test in Test Mode**
7. 🎯 **Go Live**

## ✨ Next Steps After Deployment

- Add subscription status badge to dashboard
- Implement usage limits for free tier
- Add "Manage Subscription" button (links to Lemon Squeezy customer portal)
- Set up email notifications for subscription events
- Add analytics tracking for conversions