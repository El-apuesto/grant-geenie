# Stripe Subscription Checkout Integration

## Overview

This implementation provides a drop-in Stripe subscription checkout flow using Vite + React + Supabase Edge Functions. No webhooks required.

## Files Created

### Backend (Supabase Edge Functions)
- `supabase/functions/create-checkout-session/index.ts` - Creates Stripe checkout session
- `supabase/functions/confirm-session/index.ts` - Confirms payment and updates database

### Frontend (React Components)
- `src/components/UpgradeButton.tsx` - Reusable upgrade button component
- `src/components/BillingSuccess.tsx` - Success page after payment
- `src/components/BillingCancel.tsx` - Cancel page if payment cancelled

## Setup Instructions

### 1. Environment Variables

Add these to your Supabase Edge Functions environment (via Supabase Dashboard > Edge Functions > Secrets):

```bash
STRIPE_SECRET_KEY=sk_test_...
FRONTEND_URL=https://your-app.vercel.app
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

### 2. Deploy Edge Functions

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy the functions
supabase functions deploy create-checkout-session
supabase functions deploy confirm-session
```

### 3. Update Database Schema

Ensure your `profiles` table has these columns (or update the `confirm-session` function to match your schema):

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
```

### 4. Add Routes to Your App

In your `src/App.tsx`, add these routes:

```typescript
import BillingSuccess from './components/BillingSuccess';
import BillingCancel from './components/BillingCancel';

// Add to your routes
<Route path="/billing/success" element={<BillingSuccess />} />
<Route path="/billing/cancel" element={<BillingCancel />} />
```

### 5. Create a Stripe Price

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/products)
2. Create a new Product
3. Add a recurring price
4. Copy the Price ID (starts with `price_`)

### 6. Use the UpgradeButton Component

```tsx
import UpgradeButton from './components/UpgradeButton';

// In your component
<UpgradeButton priceId="price_xxxxx">
  Subscribe to Pro - $9.99/month
</UpgradeButton>
```

## How It Works

1. User clicks the UpgradeButton
2. Frontend calls `create-checkout-session` Edge Function
3. User is redirected to Stripe Checkout
4. User completes payment
5. Stripe redirects back to `/billing/success?session_id=xxx`
6. Frontend calls `confirm-session` Edge Function
7. Backend verifies payment and updates user's subscription status in Supabase
8. User is redirected to dashboard

## Customization

### Change Table/Column Names

Edit `supabase/functions/confirm-session/index.ts`:

```typescript
const { error } = await supabase
  .from("your_table_name")  // Change this
  .update({
    your_tier_column: "pro",  // Change these
    your_status_column: "active",
    your_customer_id_column: session.customer,
    your_subscription_id_column: session.subscription,
  })
  .eq("id", userId);
```

### Styling

The components use Tailwind CSS classes. Update the className attributes to match your design system.

## Testing

1. Use Stripe test mode keys (starting with `sk_test_`)
2. Use test card: `4242 4242 4242 4242`
3. Any future expiry date and CVC

## Production Checklist

- [ ] Replace test keys with live keys (`sk_live_`)
- [ ] Update `FRONTEND_URL` to production URL
- [ ] Test the complete flow
- [ ] Set up Stripe webhooks for subscription updates (optional)
- [ ] Add error tracking (Sentry, etc.)
- [ ] Add analytics tracking

## Support

If you encounter issues:

1. Check Supabase Edge Function logs in the dashboard
2. Check browser console for errors
3. Verify all environment variables are set correctly
4. Ensure CORS is properly configured
