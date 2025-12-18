# Free Tier & Settings Implementation

This document outlines the free tier enforcement and settings features added to Grant Hustle.

## Features Implemented

### 1. Free Tier 5-Match Limit Enforcement

**What it does:**
- Free users (no active subscription) see maximum 5 grant matches
- Pro users (subscription_status = 'active') see up to 20 matches
- Automatically enforced in the database query

**How it works:**
```typescript
const isFree = !profile.subscription_status || profile.subscription_status !== 'active';
const limit = isFree ? 5 : 20;
```

**Visual indicators:**
- "Free Tier" badge in header for free users
- "Pro" badge with crown icon for paid users
- Grant count shows "Showing X of 5" for free users
- "(Free Tier)" label next to grant pool description

### 2. Upgrade Prompt at 5 Matches

**What it does:**
- Dismissible banner appears when free users hit their 5-match limit
- Explains the limitation and benefits of upgrading
- One-click upgrade to Stripe checkout

**When it appears:**
- Automatically shown when free user has 5 or more matches
- Can be dismissed by user
- Reappears on page reload (until they upgrade)

**Design:**
- Gradient emerald/blue background
- Crown icon
- "Upgrade to Pro" CTA button
- "Dismiss" option

### 3. Settings Page

**What it includes:**

#### Account Information
- Email address (read-only)
- Current plan (Free or Pro)
- Plan badge with match limit indicator

#### Profile Settings (Editable)
- Organization Type dropdown
- State dropdown
- Save Changes button
- Success/error messages

#### Dashboard Tour
- "Restart Dashboard Tour" button
- Launches The Grant Genie tour from Settings

**Navigation:**
- Settings icon (gear) in header next to Lamp icon
- Back button to return to Dashboard
- Settings state maintained separately from Dashboard

## Database Fields Used

The implementation relies on these `profiles` table fields:

```sql
subscription_status: string | null  -- 'active', 'past_due', 'canceled', etc.
subscription_current_period_end: string | null
subscription_cancel_at_period_end: boolean | null
```

These fields are automatically updated by the `stripe-webhook` Edge Function when subscription events occur.

## User Experience Flow

### Free User Experience:
1. Sign up → See "Free Tier" badge
2. Complete questionnaire → See 5 matches max
3. Upgrade prompt appears
4. Can edit settings, restart tour
5. Click "Upgrade to Pro" → Stripe checkout
6. After payment → "Pro" badge, unlimited matches

### Pro User Experience:
1. Sign up and subscribe → See "Pro" badge with crown
2. Complete questionnaire → See up to 20 matches
3. No upgrade prompts
4. Full access to all features
5. Can edit settings, restart tour

## Files Modified

### Created:
- `src/components/Settings.tsx` - Settings page component

### Modified:
- `src/components/Dashboard.tsx` - Added free tier logic, upgrade prompt, Settings integration
- `src/types/index.ts` - Added subscription fields to Profile interface

## Testing

### Test Free Tier:
1. Create account without subscribing
2. Complete questionnaire
3. Verify only 5 grants shown
4. Verify upgrade prompt appears
5. Verify "Free Tier" badge shown

### Test Pro Tier:
1. Subscribe to Pro plan
2. Complete questionnaire
3. Verify more than 5 grants shown
4. Verify no upgrade prompt
5. Verify "Pro" badge with crown shown

### Test Settings:
1. Click Settings icon in header
2. Verify current org type and state shown
3. Change values and save
4. Return to Dashboard
5. Verify changes reflected
6. Test "Restart Tour" button

## Future Enhancements

### Potential additions:
- Usage tracking (how many times viewed matches this month)
- Match history
- Email preferences
- Account deletion
- Billing portal link for Pro users
- Export data

## Notes

- Free tier limit is enforced at query time, not stored per-user
- Upgrade prompt can be dismissed but will reappear on reload
- Settings changes take effect immediately
- Tour restart from Settings properly closes Settings page first
- Subscription status comes from Stripe webhooks, not manual updates
