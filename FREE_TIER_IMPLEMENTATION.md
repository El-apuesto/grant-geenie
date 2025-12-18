# Free Tier & Pro Tier Implementation

This document outlines the strict free tier limitations and Pro-only features in Grant Hustle.

## Free Tier (Extremely Limited)

### What Free Users Get:
- **5 grant previews only**
  - Grant title
  - Funding amount
  - Lock icon with "Upgrade to see full details" message
- Sign out button
- Permanent upgrade banner at top
- "Free Tier" badge in header

### What Free Users CANNOT Access:
- ❌ Grant descriptions
- ❌ Grant deadlines
- ❌ Organization type tags
- ❌ "View Grant" / Apply buttons
- ❌ Fiscal Sponsor Partners section
- ❌ LOIs & Applications tracking
- ❌ Templates Library
- ❌ Wins & Records
- ❌ Calendar
- ❌ Product Tour (The Grant Genie)
- ❌ Help buttons
- ❌ Settings page
- ❌ Lamp icon (tour launcher)
- ❌ Settings icon

### Free User Experience:
1. Sign up without subscribing
2. Complete questionnaire
3. See dashboard with:
   - "Free Tier" badge
   - Big upgrade banner listing Pro benefits
   - 5 grant titles + amounts only (no other details)
   - Lock icons on grants
   - Big "Pro Features Locked" section below grants
   - Only Sign Out button in header
4. Must upgrade to access ANY features beyond basic grant list

---

## Pro Tier (Full Access)

### What Pro Users Get:
- ✅ Up to 20 full grant matches with:
  - Title, description, amount
  - Deadlines
  - Organization type tags
  - Direct "View Grant" / Apply buttons
- ✅ Fiscal Sponsor Partners section
- ✅ LOIs & Applications tracking
- ✅ Templates Library
- ✅ Wins & Records dashboard
- ✅ Calendar with deadlines
- ✅ Product Tour with The Grant Genie (8 steps)
- ✅ Help buttons on every section
- ✅ Settings page (edit profile, restart tour)
- ✅ Lamp icon (summon Genie anytime)
- ✅ Settings icon
- ✅ "Pro" badge with crown in header

### Pro User Experience:
1. Sign up and subscribe (or upgrade later)
2. Complete questionnaire
3. Receive welcome + matches emails
4. See full dashboard with:
   - "Pro" badge with crown
   - Lamp icon, Settings icon
   - Full grant details with apply buttons
   - All 6 dashboard sections
   - Help buttons
   - Product tour available
5. Can edit settings, restart tour anytime

---

## Technical Implementation

### Subscription Detection:
```typescript
const isPro = profile?.subscription_status === 'active';
```

### Grant Limit:
```typescript
const limit = isFree ? 5 : 20;
```

### Conditional Rendering:
- All Pro features wrapped in `{isPro && (...)}`
- Free users see locked state
- Settings/Tour completely hidden for free users

---

## Conversion Strategy

Free tier is intentionally very limited to encourage upgrades:

1. **Teaser**: Show grant titles & amounts to prove value
2. **Clear CTA**: Prominent upgrade banner at top
3. **Feature list**: Detailed list of what Pro unlocks
4. **Lock icons**: Visual reminder on each grant
5. **Big lock section**: Below grants showing all locked features
6. **No friction**: One-click upgrade to Stripe

---

## Files Modified

- `src/components/Dashboard.tsx` - Strict Pro-only feature gates
- `src/components/Settings.tsx` - Pro-only (free users redirected)
- `src/types/index.ts` - Subscription fields in Profile

---

## Testing

### Test Free Tier:
1. Create account without subscribing
2. ✅ Verify only title + amount shown
3. ✅ Verify NO description, deadline, apply button
4. ✅ Verify lock icons on grants
5. ✅ Verify upgrade banner at top
6. ✅ Verify NO lamp icon, settings icon
7. ✅ Verify NO help buttons
8. ✅ Verify "Pro Features Locked" section
9. ✅ Verify clicking Settings does nothing

### Test Pro Tier:
1. Subscribe to Pro
2. ✅ Verify full grant details
3. ✅ Verify apply buttons work
4. ✅ Verify all sections visible
5. ✅ Verify tour, settings, help all available
6. ✅ Verify "Pro" badge with crown

---

## Upgrade Flow

1. Free user clicks "Upgrade to Pro" button
2. Opens Stripe checkout in new tab
3. User completes payment
4. Stripe webhook updates `subscription_status` to 'active'
5. User refreshes dashboard
6. Sees "Pro" badge and all features unlock
7. Receives welcome email (if first subscription)
