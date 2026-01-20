# Lemon Squeezy Integration Setup Guide

This guide will help you complete the Lemon Squeezy integration for Grant Geenie.

## Prerequisites

1. Lemon Squeezy account created at [lemonsqueezy.com](https://www.lemonsqueezy.com)
2. Products and variants created in your Lemon Squeezy dashboard
3. API key generated from Settings → API

## Step 1: Configure Environment Variables

### Frontend Variables (.env.local)

Create a `.env.local` file in your project root with:

```bash
VITE_LEMON_SQUEEZY_STORE_ID=your_store_id
VITE_LEMON_SQUEEZY_VARIANT_ID=your_variant_id
```

**How to find these values:**
- **Store ID**: Go to Settings → Stores in Lemon Squeezy dashboard, click on your store name in the URL (e.g., `stores/12345`)
- **Variant ID**: Go to Products, click on your product, then click on the variant. The ID is in the URL (e.g., `variants/67890`)

### Backend Variables (Supabase Dashboard)

Go to your Supabase Dashboard → Settings → Edge Functions → Secrets and add:

```bash
LEMON_SQUEEZY_API_KEY=your_api_key_here
LEMON_SQUEEZY_WEBHOOK_SECRET=your_webhook_secret_here
```

## Step 2: Using the Checkout Component

Import and use the `LemonSqueezyCheckout` component anywhere in your app:

```tsx
import LemonSqueezyCheckout from './components/LemonSqueezyCheckout';

function PricingPage() {
  return (
    <div>
      <h1>Subscribe to Grant Geenie</h1>
      <LemonSqueezyCheckout 
        buttonText="Subscribe Now"
        className="btn btn-primary"
      />
    </div>
  );
}
```

### Component Props

- `variantId` (optional): Override the default variant from env vars
- `buttonText` (optional): Custom button text (default: "Subscribe Now")
- `className` (optional): Additional CSS classes for styling

## Step 3: Deploy the Webhook Handler

Deploy the webhook Edge Function to Supabase:

```bash
supabase functions deploy lemon-squeezy-webhook
```

Get the function URL:
```bash
supabase functions list
```

It will be something like:
```
https://[PROJECT_REF].supabase.co/functions/v1/lemon-squeezy-webhook
```

## Step 4: Configure Webhook in Lemon Squeezy

1. Go to Lemon Squeezy Dashboard → Settings → Webhooks
2. Click "+ Create Webhook"
3. Set the URL to your Supabase function URL
4. Select these events:
   - `subscription_created`
   - `subscription_updated`
   - `subscription_cancelled`
   - `subscription_expired`
   - `order_created`
5. Copy the "Signing Secret" and add it as `LEMON_SQUEEZY_WEBHOOK_SECRET` in Supabase

## Step 5: Create Database Table

Run this SQL in your Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lemon_squeezy_subscription_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL,
  customer_email TEXT,
  renews_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_ls_id ON user_subscriptions(lemon_squeezy_subscription_id);

-- Enable Row Level Security
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON user_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);
```

## Step 6: Pass User ID to Checkout

Update the `LemonSqueezyCheckout.tsx` component to pass the actual user ID:

```tsx
import { useAuth } from '../contexts/AuthContext'; // Adjust import based on your auth setup

export default function LemonSqueezyCheckout({ ... }) {
  const { user } = useAuth(); // Get current user
  
  useEffect(() => {
    if (storeId && variantId && user) {
      const url = `https://store.lemonsqueezy.com/checkout/buy/${variantId}?checkout[custom][user_id]=${user.id}`;
      setCheckoutUrl(url);
    }
  }, [storeId, variantId, user]);
  
  // ... rest of component
}
```

## Step 7: Test the Integration

### Test Mode

1. In Lemon Squeezy, ensure you're in Test Mode
2. Click your checkout button
3. Use test card: `4242 4242 4242 4242`
4. Check Supabase logs: `supabase functions logs lemon-squeezy-webhook`
5. Verify subscription appears in `user_subscriptions` table

### Go Live

1. Switch Lemon Squeezy to Live Mode
2. Create new API key in Live Mode
3. Update environment variables with live credentials
4. Update webhook to live mode in Lemon Squeezy dashboard

## Checking Subscription Status

Create a hook to check subscription status:

```tsx
// src/hooks/useSubscription.ts
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useSubscription(userId: string) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubscription() {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (!error) setSubscription(data);
      setLoading(false);
    }

    if (userId) fetchSubscription();
  }, [userId]);

  return { subscription, loading, isSubscribed: !!subscription };
}
```

## Troubleshooting

### Webhook not receiving events
- Check webhook URL is correct and publicly accessible
- Verify `LEMON_SQUEEZY_WEBHOOK_SECRET` matches in both places
- Check Supabase function logs for errors

### Checkout button not working
- Verify environment variables are set correctly
- Check browser console for errors
- Ensure Lemon.js script is loading

### Subscription not updating
- Check `user_subscriptions` table exists
- Verify user_id is being passed correctly in checkout URL
- Check Supabase Edge Function logs

## Additional Resources

- [Lemon Squeezy Docs](https://docs.lemonsqueezy.com)
- [Lemon Squeezy API Reference](https://docs.lemonsqueezy.com/api)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
