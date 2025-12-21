# Complete App Requirements - What's Needed to Function

**Last Updated**: December 20, 2025

## 🎯 TL;DR - Critical Requirements

For Grant Geenie to function completely, you need:

### ✅ Already Working
- ✅ User authentication
- ✅ Profile questionnaire
- ✅ Grant search and filtering
- ✅ Save grants feature
- ✅ LOI Generator
- ✅ Fiscal Sponsors database
- ✅ Calendar view
- ✅ Stripe subscription management

### 🔴 CRITICAL - Must Deploy (30 minutes)
1. **Applications Table Migration** (5 min) - Required for Application Tracker & Analytics
2. **Integrate Analytics Dashboard** (15 min) - Add component to Dashboard.tsx
3. *Optional: Deadline Reminder Cron* (10 min) - Email reminders for Pro users

### 🟢 NICE TO HAVE - Future Enhancements
- Document upload/storage
- CSV export
- Calendar iCal export
- Team collaboration

---

## 📋 DETAILED BREAKDOWN

### 1️⃣ Database Tables (Supabase)

#### ✅ Tables That Already Exist

Based on your working features, these tables are already created:

- ✅ **`auth.users`** - User authentication (Supabase Auth)
- ✅ **`profiles`** - User profiles, subscription status, questionnaire data
- ✅ **`grants`** - Grant opportunities (federal + state)
- ✅ **`saved_grants`** - User's saved grants
- ✅ **`fiscal_sponsors`** - 265+ fiscal sponsor database

#### 🔴 Table That MUST Be Created

**`applications`** - Application tracking table

**Why it's critical**:
- ❌ Without it: Application Tracker won't work (crashes)
- ❌ Without it: Analytics Dashboard won't work (shows error)
- ❌ Without it: Win rate calculations fail
- ❌ Without it: "Wins & Records" section shows 0s

**What depends on it**:
1. `ApplicationTracker.tsx` - Kanban board for tracking applications
2. `AnalyticsDashboard.tsx` - Win rate, funding trends, success metrics
3. `Dashboard.tsx` - Stats display (submitted, awarded, declined counts)
4. Deadline reminders - Email notifications for application due dates

**How to create it**:
```sql
-- Paste this in Supabase Dashboard → SQL Editor → Run
-- (Full SQL in supabase/migrations/20231221_create_applications_table.sql)

create table if not exists public.applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  grant_id uuid references public.grants(id) on delete set null,
  grant_title text not null,
  funder_name text not null,
  application_type text not null,
  status text not null default 'Draft',
  due_date date,
  submitted_date date,
  decision_date date,
  amount_requested numeric(12, 2),
  amount_awarded numeric(12, 2),
  notes text,
  attachments jsonb default '[]'::jsonb,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable RLS and create policies
-- (See full migration file for complete setup)
```

**Time to deploy**: 5 minutes

---

### 2️⃣ Component Integration

#### ✅ Components Already Integrated

These are already connected and working in Dashboard.tsx:

- ✅ Grant search and filtering
- ✅ Save grants functionality
- ✅ LOI Generator
- ✅ Application Tracker (displays, but needs `applications` table)
- ✅ Calendar view
- ✅ Fiscal Sponsors matcher
- ✅ Application templates
- ✅ Settings page
- ✅ Subscription management

#### 🔴 Component That MUST Be Integrated

**AnalyticsDashboard.tsx** - Visual analytics component

**Why it's critical**:
- ✅ Code is written and working
- ❌ Not connected to Dashboard.tsx yet
- ❌ Users can't access it
- ❌ "View Analytics" button doesn't exist

**What needs to be done**:
1. Add import to Dashboard.tsx
2. Add state variable (`showAnalytics`)
3. Add conditional render for analytics page
4. Add "Analytics & Insights" section with button

**Time to integrate**: 15 minutes  
**Instructions**: See `ANALYTICS_INTEGRATION.md`

---

### 3️⃣ Edge Functions (Supabase)

#### 🟢 Optional But Recommended

**Deadline Reminder Function** (`send-deadline-reminders`)

**What it does**:
- Sends email reminders 7, 3, and 1 day before grant deadlines
- Only for Pro users with saved grants
- Runs automatically daily at 9 AM UTC

**Current status**:
- ✅ Code written (`supabase/functions/send-deadline-reminders/index.ts`)
- ✅ Cron schedule SQL written
- ❌ Not deployed yet

**Why it's optional for MVP**:
- App works fine without it
- Users can check deadlines manually in Calendar
- Nice-to-have feature, not critical

**How to deploy** (if you want it):

**Option A: Deploy function via CLI**
```bash
cd grant-geenie
supabase functions deploy send-deadline-reminders
```

**Option B: Deploy via dashboard**
1. Go to Supabase Dashboard → Edge Functions
2. Upload `supabase/functions/send-deadline-reminders/index.ts`
3. Set environment variables: `RESEND_API_KEY`

**Then run the cron SQL**:
```sql
-- In Supabase SQL Editor
-- (Full SQL in supabase/migrations/20231221_add_deadline_reminders_cron.sql)

create extension if not exists pg_cron;

select cron.schedule(
  'send-deadline-reminders',
  '0 9 * * *', -- Every day at 9 AM UTC
  $$
  select net.http_post(
    url := 'YOUR_EDGE_FUNCTION_URL',
    headers := jsonb_build_object('Authorization', 'Bearer YOUR_KEY'),
    body := '{}'
  );
  $$
);
```

**Time to deploy**: 10 minutes (if you have Resend API key)

---

### 4️⃣ Environment Variables

#### ✅ Already Configured (Assumed)

- ✅ `VITE_SUPABASE_URL` - Supabase project URL
- ✅ `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- ✅ Stripe keys (for subscription management)

#### 🟢 Optional (Only if deploying deadline reminders)

- `RESEND_API_KEY` - For sending emails (Resend.com account needed)
- `SUPABASE_SERVICE_ROLE_KEY` - For Edge Functions

---

### 5️⃣ External Services

#### ✅ Already Setup (Assumed)

- ✅ **Supabase** - Database + auth + storage
- ✅ **Stripe** - Payment processing
- ✅ **Vercel/Netlify** - Frontend hosting (if deployed)

#### 🟢 Optional

- **Resend** - Email service for deadline reminders (only if you deploy that feature)

---

## 🚨 CRITICAL PATH: What Breaks Without These

### Without `applications` Table Migration:

**Features that break**:
- ❌ **Application Tracker** - Component crashes with database error
- ❌ **Analytics Dashboard** - Shows error or "No Analytics Yet" perpetually
- ❌ **Wins & Records section** - Shows 0 for all stats
- ❌ **Dashboard stats cards** - Submitted/Awarded/Declined all show 0

**Impact**: ~40% of Pro features don't work

**Solution**: Run migration (5 minutes)

---

### Without Analytics Integration:

**Features that break**:
- ❌ Users can't access analytics dashboard
- ❌ No "View Analytics" button exists
- ❌ Competitive advantage lost (this is your differentiator!)

**Impact**: Feature exists but hidden from users

**Solution**: Integrate component (15 minutes)

---

### Without Deadline Reminders:

**Features that break**:
- 🟡 No automatic email reminders
- ✅ Calendar still shows deadlines
- ✅ Users can manually check

**Impact**: Minor - nice-to-have feature

**Solution**: Deploy edge function (10 minutes, optional)

---

## ✅ VERIFICATION CHECKLIST

### Core App Functionality

Test these to ensure app works completely:

- [ ] **Login/Signup** - Users can create accounts
- [ ] **Questionnaire** - New users complete profile setup
- [ ] **Grant Search** - Shows matched grants for user's state/org
- [ ] **Save Grants** - Bookmark icon saves/unsaves grants
- [ ] **Application Tracker** - Can add/edit/delete applications
- [ ] **Analytics Dashboard** - Shows win rate, charts, insights
- [ ] **LOI Generator** - Creates LOIs with user data
- [ ] **Fiscal Sponsors** - Browse 265+ sponsors
- [ ] **Calendar** - Shows grant deadlines
- [ ] **Templates** - Access 4 application templates
- [ ] **Subscription** - Can upgrade to Pro via Stripe
- [ ] **Settings** - Can update profile, restart tour

### Pro Features Only

- [ ] **Unlimited Grants** - Pro users see all matched grants
- [ ] **Application Links** - Pro users can click "View Grant"
- [ ] **Track Applications** - Access to full tracker
- [ ] **Analytics Access** - Can view analytics dashboard
- [ ] **Save Grants** - Bookmark functionality works
- [ ] **Calendar Access** - Full calendar view
- [ ] **Fiscal Sponsors** - Full database access

### Free Tier Limits

- [ ] **5 Grants Max** - Free users see only 5 grants
- [ ] **Locked Features** - Application tracker, analytics, etc. show upgrade prompt
- [ ] **No Application Links** - "Upgrade to view" message

---

## 🎯 DEPLOYMENT ORDER (Critical Path)

**Do these in this exact order for fastest results:**

### Step 1: Deploy Applications Table (5 min) 🔴 CRITICAL

```bash
# In Supabase Dashboard → SQL Editor
# Paste contents of:
supabase/migrations/20231221_create_applications_table.sql
```

**Verify**:
```sql
SELECT * FROM applications LIMIT 1;
-- Should return success (even if 0 rows)
```

### Step 2: Integrate Analytics Dashboard (15 min) 🔴 CRITICAL

1. Follow `ANALYTICS_INTEGRATION.md`
2. Add code to `Dashboard.tsx`
3. Restart dev server: `npm run dev`

**Verify**:
- Login to app
- Look for "Analytics & Insights" section
- Click "View Analytics"
- Should see dashboard (or "No Analytics Yet" if no data)

### Step 3: Test End-to-End (10 min) ✅ RECOMMENDED

1. Go to Application Tracker
2. Add a test application:
   - Title: "Test Grant"
   - Funder: "Test Foundation"
   - Status: "Awarded"
   - Amount Requested: $50,000
   - Amount Awarded: $45,000
3. Go to Analytics Dashboard
4. Should see:
   - Win Rate: 100%
   - Total Awarded: $45,000
   - Average Award: $45,000

### Step 4: Deploy Deadline Reminders (10 min) 🟢 OPTIONAL

Only if you want automated email reminders:

1. Get Resend API key (resend.com)
2. Deploy edge function
3. Run cron SQL
4. Test: Should send emails daily at 9 AM UTC

---

## 📊 FEATURE DEPENDENCY MATRIX

| Feature | Depends On | Status | Priority |
|---------|------------|--------|----------|
| Login/Auth | Supabase Auth | ✅ Working | Core |
| Grant Search | `grants` table | ✅ Working | Core |
| Save Grants | `saved_grants` table | ✅ Working | Core |
| Application Tracker | `applications` table | ❌ **Needs Migration** | **CRITICAL** |
| Analytics Dashboard | `applications` table + integration | ❌ **Needs Both** | **CRITICAL** |
| LOI Generator | Profile data | ✅ Working | Pro |
| Fiscal Sponsors | `fiscal_sponsors` table | ✅ Working | Pro |
| Calendar | Saved grants + applications | ✅ Working | Pro |
| Deadline Reminders | Edge function + cron | 🟢 Optional | Nice-to-have |
| Document Upload | Storage bucket | 🔵 Future | Enhancement |
| CSV Export | Client-side code | 🔵 Future | Enhancement |

**Legend**:
- ✅ = Already working
- ❌ = Needs deployment (critical)
- 🟢 = Optional (works without it)
- 🔵 = Future enhancement

---

## 🚀 QUICK START SUMMARY

**To get Grant Geenie 100% functional:**

```bash
# Total Time: 20-30 minutes

# 1. Run Applications Migration (5 min)
#    → Supabase Dashboard → SQL Editor
#    → Paste: supabase/migrations/20231221_create_applications_table.sql
#    → Click Run

# 2. Integrate Analytics (15 min)
#    → Open: src/components/Dashboard.tsx
#    → Follow: ANALYTICS_INTEGRATION.md
#    → Add import, state, conditional render, section
#    → Save and restart: npm run dev

# 3. Test Everything (10 min)
#    → Login
#    → Add test application
#    → View analytics
#    → Verify stats show correctly

# DONE! ✅
# Your app is now 100% functional with all core features.
```

**Optional Step 4** (if you want email reminders):
```bash
# Deploy Deadline Reminders (10 min)
#    → Get Resend API key
#    → Deploy edge function
#    → Run cron SQL
```

---

## 🆘 TROUBLESHOOTING

### "Table applications does not exist"

**Problem**: Migration not run  
**Solution**: Run Step 1 above

### "Cannot find module AnalyticsDashboard"

**Problem**: Component not integrated  
**Solution**: Run Step 2 above, add import to Dashboard.tsx

### "Analytics shows 'No Analytics Yet' but I have data"

**Problem**: Data doesn't belong to logged-in user  
**Solution**: Check user_id matches in applications table

### "Application Tracker shows error"

**Problem**: `applications` table missing  
**Solution**: Run migration (Step 1)

### "Stats show 0 for everything"

**Problem**: No applications created yet  
**Solution**: Add test application in Application Tracker

---

## 📞 NEED HELP?

**Check these resources**:
1. `ANALYTICS_PREREQUISITES.md` - Setup requirements
2. `ANALYTICS_INTEGRATION.md` - Integration guide
3. `TASK_PROGRESS.md` - Full project status
4. Browser console (F12) - Error messages
5. Supabase Dashboard Logs - Database errors

---

**Bottom Line**: Run 1 SQL migration + integrate 1 component = fully functional app. Total time: ~20 minutes. 🎉
