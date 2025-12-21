# Analytics Dashboard - Prerequisites & Setup Checklist

**Before the Analytics Dashboard can function, you need to complete these steps:**

---

## ✅ CHECKLIST: What's Already Done

### ✅ Code & Dependencies
- ✅ **React & TypeScript** - Already installed
- ✅ **Supabase Client** - Configured in `src/lib/supabase.ts`
- ✅ **Tailwind CSS** - Installed and working
- ✅ **Lucide React Icons** - Already in package.json
- ✅ **Application Type** - Defined in `src/types/index.ts`
- ✅ **Auth Context** - User authentication working
- ✅ **Analytics Component** - Created in `src/components/AnalyticsDashboard.tsx`

---

## ⚠️ REQUIRED: What Must Be Done

### 🔴 CRITICAL #1: Run Database Migration

**Status**: ❌ Not deployed yet

**What**: Create the `applications` table in Supabase

**Why**: The Analytics Dashboard queries the `applications` table. Without it, the component will error or show "No Analytics Yet"

**How to Fix**:

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your `grant-geenie` project
3. Click **SQL Editor** in left sidebar
4. Click **New Query**
5. Copy and paste this SQL:

```sql
-- Create applications table for tracking LOIs and grant applications
create table if not exists public.applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  grant_id uuid references public.grants(id) on delete set null,
  
  -- Basic info
  grant_title text not null,
  funder_name text not null,
  application_type text not null check (application_type in ('LOI', 'Full Application', 'Letter of Intent', 'Proposal')),
  
  -- Status tracking
  status text not null default 'Draft' check (status in ('Draft', 'In Progress', 'Submitted', 'Under Review', 'Awarded', 'Declined', 'Withdrawn')),
  
  -- Dates
  due_date date,
  submitted_date date,
  decision_date date,
  
  -- Financial
  amount_requested numeric(12, 2),
  amount_awarded numeric(12, 2),
  
  -- Additional info
  notes text,
  attachments jsonb default '[]'::jsonb,
  
  -- Metadata
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table public.applications enable row level security;

-- Users can only see their own applications
create policy "Users can view own applications"
  on public.applications for select
  using (auth.uid() = user_id);

-- Users can insert their own applications
create policy "Users can insert own applications"
  on public.applications for insert
  with check (auth.uid() = user_id);

-- Users can update their own applications
create policy "Users can update own applications"
  on public.applications for update
  using (auth.uid() = user_id);

-- Users can delete their own applications
create policy "Users can delete own applications"
  on public.applications for delete
  using (auth.uid() = user_id);

-- Create indexes for performance
create index applications_user_id_idx on public.applications(user_id);
create index applications_status_idx on public.applications(status);
create index applications_due_date_idx on public.applications(due_date);
create index applications_grant_id_idx on public.applications(grant_id);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_applications_updated_at
  before update on public.applications
  for each row
  execute procedure public.handle_updated_at();
```

6. Click **Run** (or press Ctrl+Enter)
7. Wait for "Success. No rows returned" message

**Verify it worked**:
```sql
-- Run this to confirm table exists:
SELECT * FROM applications LIMIT 1;
```

Should return "Success" (even if 0 rows).

---

### 🟡 CRITICAL #2: Integrate Analytics Into Dashboard

**Status**: ❌ Not integrated yet

**What**: Add the Analytics section to your main Dashboard component

**Why**: Right now the component exists but isn't visible anywhere in the app

**How to Fix** (Option 1 - Recommended):

Follow the detailed instructions in [`ANALYTICS_INTEGRATION.md`](https://github.com/El-apuesto/grant-geenie/blob/main/ANALYTICS_INTEGRATION.md)

**Quick Version**:

1. Open `src/components/Dashboard.tsx`

2. Add import at top:
```typescript
import AnalyticsDashboard from './AnalyticsDashboard';
import { BarChart3 } from 'lucide-react';
```

3. Add state variable (around line 20):
```typescript
const [showAnalytics, setShowAnalytics] = useState(false);
```

4. Add conditional render (after other page conditionals, around line 500):
```typescript
if (showAnalytics) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
          <button
            onClick={() => setShowAnalytics(false)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AnalyticsDashboard />
      </div>
    </div>
  );
}
```

5. Add Analytics section in main dashboard (after "Wins & Records" section):
```typescript
<section id="analytics-section" className="mb-12">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-2xl font-bold text-white">Analytics & Insights</h2>
  </div>
  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
    <div className="flex items-center justify-between mb-4">
      <p className="text-slate-400">Track your win rate, funding trends, and success patterns with visual analytics.</p>
      <button
        onClick={() => setShowAnalytics(true)}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-semibold"
      >
        <BarChart3 className="w-4 h-4" />
        View Analytics
      </button>
    </div>
  </div>
</section>
```

6. Save and restart your dev server (`npm run dev`)

---

## 🟢 OPTIONAL: Add Test Data

**Status**: Optional but recommended for testing

**What**: Insert sample applications to see analytics in action

**Why**: Without data, you'll see "No Analytics Yet" message

**How to Add Test Data**:

1. First, get your user ID:
```sql
-- In Supabase SQL Editor
SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL@example.com';
```

2. Copy your user ID, then run:
```sql
-- Replace YOUR_USER_ID_HERE with the actual UUID
INSERT INTO applications (user_id, grant_title, funder_name, application_type, status, amount_requested, amount_awarded, due_date, submitted_date, decision_date)
VALUES 
  ('YOUR_USER_ID_HERE', 'Community Arts Grant', 'National Endowment for the Arts', 'Full Application', 'Awarded', 50000, 45000, '2025-03-15', '2025-02-15', '2025-04-01'),
  ('YOUR_USER_ID_HERE', 'Youth Program Grant', 'Local Foundation', 'LOI', 'Awarded', 25000, 25000, '2025-02-01', '2025-01-15', '2025-03-01'),
  ('YOUR_USER_ID_HERE', 'Equipment Grant', 'Corporate Foundation', 'Full Application', 'Declined', 100000, NULL, '2025-01-30', '2025-01-10', '2025-02-20'),
  ('YOUR_USER_ID_HERE', 'Research Grant', 'Government', 'Full Application', 'Submitted', 75000, NULL, '2025-04-15', '2025-03-01', NULL),
  ('YOUR_USER_ID_HERE', 'Capacity Building', 'Foundation', 'LOI', 'Draft', 30000, NULL, '2025-05-01', NULL, NULL);
```

3. Refresh your Analytics Dashboard - you should see:
   - Win Rate: 50% (2 awarded / 4 submitted)
   - Total Awarded: $70,000
   - Average Award: $35,000
   - Total Requested: $280,000

---

## 🔍 TROUBLESHOOTING

### Issue: "Table 'applications' does not exist"

**Solution**: Run the migration SQL from Critical #1 above

### Issue: "No Analytics Yet" even with data

**Check**:
1. Are you logged in?
2. Do the applications belong to your user_id?
3. Open browser console (F12) - any errors?

**Test Query**:
```sql
-- Check if your applications exist
SELECT * FROM applications WHERE user_id = 'YOUR_USER_ID';
```

### Issue: Component not showing

**Check**:
1. Did you add the import to Dashboard.tsx?
2. Did you add the state variable?
3. Did you add the conditional render?
4. Did you add the Analytics section button?
5. Any console errors?

### Issue: Styling looks broken

**Check**:
1. Is Tailwind CSS configured properly?
2. Run `npm run dev` to rebuild
3. Clear browser cache (Ctrl+Shift+R)

### Issue: Icons not showing

**Check**:
1. Is `lucide-react` installed?
2. Run: `npm install lucide-react`
3. Restart dev server

---

## ✅ FINAL VERIFICATION

**Once everything is set up, verify it works:**

1. **Login** to your app
2. **Navigate** to Dashboard
3. **Look for** "Analytics & Insights" section
4. **Click** "View Analytics" button
5. **Should see**:
   - If no data: "No Analytics Yet" message
   - If data exists: 4 metric cards + charts + insights

**Success looks like**:
- ✅ Page loads without errors
- ✅ Metrics calculate correctly
- ✅ Charts display properly
- ✅ Refresh button works
- ✅ Back button returns to dashboard
- ✅ Responsive on mobile

---

## 📊 EXPECTED BEHAVIOR

### With No Data:
- Shows friendly "No Analytics Yet" message
- Suggests starting to track applications
- No errors

### With Data:
- **4 Metric Cards** show:
  - Win Rate percentage
  - Total Awarded (formatted as currency)
  - Average Award (formatted as currency)
  - Total Requested (formatted as currency)

- **Success Rate by Type** shows:
  - Horizontal bars for each application type
  - Percentage + count for each

- **Monthly Trends** shows:
  - Last 6 months of data
  - Requested vs Awarded comparison

- **Status Overview** shows:
  - Total applications
  - Submitted count
  - Awarded count
  - Declined count

- **Insights Section** shows:
  - 4 auto-generated insights based on your data
  - Smart commentary on performance

---

## 🚀 DEPLOYMENT ORDER

**Do these in order**:

1. ✅ Run applications table migration (Critical #1)
2. ✅ Integrate analytics into Dashboard (Critical #2)
3. 🟢 Add test data (Optional)
4. 🟢 Test end-to-end
5. 🟢 Deploy to production

**Estimated Time**: 30-45 minutes total

---

## 📝 SUMMARY

**Before Analytics Dashboard can function**:

| Requirement | Status | Time | Priority |
|-------------|--------|------|----------|
| ✅ Code written | DONE | - | - |
| ❌ Database migration | TODO | 5 min | CRITICAL |
| ❌ Dashboard integration | TODO | 15 min | CRITICAL |
| 🟢 Test data | Optional | 5 min | Nice to have |

**Total Setup Time**: 20-25 minutes

**Once complete**: You'll have visual analytics that competitors charge $179-349/mo for! 🎉

---

**Questions?** Check:
- [`ANALYTICS_INTEGRATION.md`](https://github.com/El-apuesto/grant-geenie/blob/main/ANALYTICS_INTEGRATION.md) - Detailed integration guide
- [`TASK_PROGRESS.md`](https://github.com/El-apuesto/grant-geenie/blob/main/TASK_PROGRESS.md) - Full task overview
- Browser console (F12) - Error messages
- Supabase Dashboard Logs - Database errors
