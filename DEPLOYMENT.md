# Grant Geenie - Deployment Guide

## 🚀 Getting Started

This guide will help you deploy Grant Geenie to production on Vercel.

## Prerequisites

- Node.js 18+
- Git account (GitHub, GitLab, or Bitbucket)
- Supabase account
- Stripe account
- Vercel account

## Step 1: Clone & Local Setup

```bash
git clone https://github.com/El-apuesto/grant-geenie.git
cd grant-geenie
npm install
```

## Step 2: Setup Supabase

### Create Tables

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create these tables:

#### `profiles`
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  org_type TEXT,
  state TEXT,
  questionnaire_completed BOOLEAN DEFAULT false,
  has_coupon_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

#### `grants`
```sql
CREATE TABLE grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC,
  deadline TIMESTAMP WITH TIME ZONE,
  state TEXT, -- NULL for federal
  org_types TEXT[] DEFAULT '{}',
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE grants ENABLE ROW LEVEL SECURITY;
```

### Set Row Level Security Policies

```sql
-- Allow users to read their own profile
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Allow users to insert their profile
CREATE POLICY "Users can insert their profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Allow users to update their profile
CREATE POLICY "Users can update their profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Allow everyone to read grants
CREATE POLICY "Anyone can read grants"
ON grants FOR SELECT
USING (true);
```

## Step 3: Create .env.local

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Local Development

```bash
npm run dev
```

Visit `http://localhost:5173`

## Step 5: Deploy to Vercel

### Option A: Via GitHub (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "New Project"
4. Select your GitHub repository
5. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click "Deploy"

### Option B: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

Follow the prompts to deploy.

## Step 6: Setup Stripe Checkout

The pricing page uses direct Stripe checkout links:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create pricing tiers:
   - **Intro**: $9.99/month (first month), then $27.99/month
   - **Season**: $79.99 one-time
   - **Annual**: $149.99 one-time
3. Get the Stripe Checkout URLs
4. Update these in `src/components/PricingPage.tsx`:
   ```html
   <a href="your-stripe-checkout-link" target="_blank">
   ```

## Step 7: Early User Coupons (Optional)

To give the first 2000 users a discount:

1. Create a coupon in Stripe Dashboard
2. Share the coupon code in your marketing
3. Users apply the coupon at checkout

## Testing

### Test Stripe Checkout

1. Use Stripe test mode cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
2. Test on pricing page
3. Verify checkout redirects correctly

## Environment Variables Reference

| Variable | Where to Find | Required |
|----------|---------------|----------|
| `VITE_SUPABASE_URL` | Supabase > Settings > API | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase > Settings > API | Yes |

## Monitoring

### Vercel Dashboard
- Visit https://vercel.com/dashboard
- Monitor deployments, errors, and analytics

### Supabase Dashboard
- Monitor database queries and performance
- Check user authentication logs

## Troubleshooting

### "Supabase variables not found"
Make sure environment variables are set in Vercel settings.

### "Stripe checkout not working"
Verify Stripe checkout links are correct and test mode is enabled.

### "Build fails on Vercel"
Run `npm run build` locally to debug.

## Production Checklist

- [ ] Supabase tables created with RLS policies
- [ ] Environment variables in Vercel settings
- [ ] Stripe checkout links updated
- [ ] Domain configured (if using custom domain)
- [ ] Analytics setup
- [ ] Error monitoring (Sentry optional)
- [ ] Tested full user flow (landing → auth → questionnaire → dashboard → pricing)

## Support

Need help? Check the README.md or open an issue on GitHub.

---

**You're all set! 🚀 Grant Geenie is ready for launch!**
