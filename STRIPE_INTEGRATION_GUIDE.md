# Stripe Integration Guide - Fixed for Cash App Pay & Card Payments

## Problem Fixed

The previous implementation was manually setting `payment_method_data[type]` which caused the error:
```
Invalid payment_method_data[type]: must be one of acss_debit, affirm, ...
```

This happened because the code was trying to manually handle payment method collection instead of letting Stripe Checkout handle it automatically.

## Solution Implemented

### 1. New Checkout Session Function

Created `supabase/functions/create-checkout-session/index.ts` that:
- Uses Stripe Checkout in `mode: 'subscription'`
- Supports both `card` and `cashapp` payment methods via `payment_method_types: ['card', 'cashapp']`
- Removes ALL manual `payment_method_data` handling
- Returns a Checkout URL that customers visit to complete payment

### 2. Updated Subscription Schedule Function

Updated `supabase/functions/create-subscription-schedule/index.ts` to:
- Use Checkout instead of manual PaymentIntent creation
- Flag sessions with metadata so webhook can create schedules after successful payment
- Support both card and Cash App Pay

### 3. Enhanced Webhook Handler

Updated `supabase/functions/stripe-webhook/index.ts` to:
- Handle `checkout.session.completed` events
- Automatically create subscription schedules after successful payment
- Sync subscription status to Supabase database
- Handle subscription lifecycle events

## How to Use

### Frontend Integration

```typescript
// Call the edge function to create a checkout session
const { data, error } = await supabase.functions.invoke('create-checkout-session', {
  body: {
    userId: user.id,
    priceId: 'price_1dollar', // Your $1/month price ID
    successUrl: 'https://yourapp.com/success',
    cancelUrl: 'https://yourapp.com/cancel'
  }
});

if (data?.url) {
  // Redirect to Stripe Checkout
  window.location.href = data.url;
}
```

### Setup Required

1. **Create Stripe Prices**:
   ```bash
   # Create $1/month price
   stripe prices create \
     --unit-amount=100 \
     --currency=usd \
     --recurring[interval]=month \
     --product=prod_YOUR_PRODUCT_ID
   ```

2. **Enable Cash App Pay** in [Stripe Dashboard → Settings → Payment Methods](https://dashboard.stripe.com/settings/payment_methods)

3. **Set Environment Variables**:
   ```bash
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_ONE_DOLLAR_PRICE_ID=price_...
   ```

4. **Deploy Edge Functions**:
   ```bash
   supabase functions deploy create-checkout-session
   supabase functions deploy create-subscription-schedule  
   supabase functions deploy stripe-webhook
   ```

5. **Configure Webhook in Stripe**:
   - Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
   - Add endpoint: `https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`

## Testing

### Test with Card

1. Use test card: `4242 4242 4242 4242`
2. Any future expiry date
3. Any 3-digit CVC

### Test with Cash App Pay

1. In test mode, Stripe will show a "Test Mode" Cash App button
2. Click through the test flow
3. Minimum balance of $3 required (simulated in test mode)

### Verify in Stripe Dashboard

1. Go to [Stripe Dashboard → Developers → Logs](https://dashboard.stripe.com/test/logs)
2. Confirm NO requests contain `payment_method_data[type]`
3. Verify Checkout Sessions have `mode: 'subscription'`
4. Check that subscriptions are created successfully

## Key Changes Summary

✅ **REMOVED**: Manual `payment_method_data[type]` parameter  
✅ **ADDED**: Stripe Checkout with `payment_method_types: ['card', 'cashapp']`  
✅ **CHANGED**: From PaymentIntent to Checkout Session flow  
✅ **FIXED**: Error "Invalid payment_method_data[type]"  
✅ **ADDED**: Automatic PaymentMethod creation by Stripe  
✅ **ENHANCED**: Webhook handling for subscription lifecycle  

## Architecture Flow

```
User → Frontend → Supabase Edge Function (create-checkout-session)
                      ↓
                  Stripe Checkout Session Created
                      ↓
User Redirected → Stripe Checkout Page → User Enters Payment
                      ↓
                  Payment Processed by Stripe
                      ↓
                  Webhook Triggered (checkout.session.completed)
                      ↓
                  Supabase Edge Function (stripe-webhook)
                      ↓
                  Creates Subscription Schedule (if needed)
                      ↓
                  Updates Database
                      ↓
User Redirected → Success Page
```

## No More Errors! 🎉

By using Stripe Checkout, all payment method handling is done automatically by Stripe. You'll never see the `payment_method_data[type]` error again because your code no longer sends that parameter.
