# Grant Geenie - Task Progress Tracker

**Last Updated**: December 20, 2025

## 📋 Overview

This document tracks all remaining work to complete Grant Geenie and reach competitive parity with Instrumentl, GrantWatch, and Candid.

---

## 🔧 SUPABASE MIGRATIONS (SQL Editor Tasks)

### ✅ Task #1: Deploy Deadline Reminder Cron Job
**Status**: Code ready, needs deployment

**Files Created**:
- ✅ [`supabase/functions/send-deadline-reminders/index.ts`](https://github.com/El-apuesto/grant-geenie/blob/main/supabase/functions/send-deadline-reminders/index.ts) - Edge function code
- ✅ [`supabase/migrations/20231221_add_deadline_reminders_cron.sql`](https://github.com/El-apuesto/grant-geenie/blob/main/supabase/migrations/20231221_add_deadline_reminders_cron.sql) - Cron schedule SQL

**What It Does**:
- Sends email reminders at 7, 3, and 1 day before grant deadlines
- Runs daily at 9 AM UTC (4 AM EST)
- Only notifies Pro users with saved grants
- Beautiful HTML emails with urgency indicators

**How to Deploy**:
1. Open [Supabase Dashboard](https://supabase.com/dashboard) → SQL Editor
2. Paste contents of `20231221_add_deadline_reminders_cron.sql`
3. Click **Run**
4. Verify: Check for "Success" message

**Prerequisites**:
- Resend API key configured in Supabase secrets
- Edge function deployed (see alternative deployment below)

**Alternative - Deploy Edge Function**:
```bash
cd grant-geenie
supabase functions deploy send-deadline-reminders
```

---

### ✅ Task #2: Run Application Tracker Migration
**Status**: Code ready, needs deployment

**File Created**:
- ✅ [`supabase/migrations/20231221_create_applications_table.sql`](https://github.com/El-apuesto/grant-geenie/blob/main/supabase/migrations/20231221_create_applications_table.sql)

**What It Creates**:
- `applications` table for tracking LOIs and full applications
- Status tracking: Draft → In Progress → Submitted → Under Review → Awarded/Declined
- Financial tracking: amount requested vs awarded
- Date tracking: due date, submitted date, decision date
- Row Level Security (RLS) enabled
- Automatic `updated_at` timestamp trigger
- Performance indexes on user_id, status, due_date, grant_id

**How to Deploy**:
1. Open [Supabase Dashboard](https://supabase.com/dashboard) → SQL Editor
2. Paste the entire SQL from the file
3. Click **Run**
4. Verify: Query `SELECT * FROM applications` should work

**Unlocks**:
- Application Tracker Kanban board
- Analytics Dashboard (Task #3)
- Win rate calculations
- Funding trend charts

---

## 📊 ANALYTICS DASHBOARD (Completed!)

### ✅ Task #3: Analytics Dashboard
**Status**: ✅ **COMPLETED**

**Files Created**:
- ✅ [`src/components/AnalyticsDashboard.tsx`](https://github.com/El-apuesto/grant-geenie/blob/main/src/components/AnalyticsDashboard.tsx) - Main analytics component
- ✅ [`src/components/AnalyticsPage.tsx`](https://github.com/El-apuesto/grant-geenie/blob/main/src/components/AnalyticsPage.tsx) - Page wrapper
- ✅ [`ANALYTICS_INTEGRATION.md`](https://github.com/El-apuesto/grant-geenie/blob/main/ANALYTICS_INTEGRATION.md) - Integration guide

**Features**:
- **Win Rate Tracking**: % of awarded vs submitted applications
- **Total Awarded**: Lifetime funding secured
- **Average Award Size**: Mean award per successful application
- **Total Requested**: All-time funding requested
- **Success Rate by Type**: Bar charts for LOI, Full Application, etc.
- **Monthly Funding Trends**: 6-month visualization of requested vs awarded
- **Application Status Grid**: Total, submitted, awarded, declined counts
- **Smart Insights**: Auto-generated key findings

**Technology**:
- Pure CSS/Tailwind - no charting library dependencies
- Responsive design
- Real-time Supabase queries
- Loading and empty states

**Integration Status**:
- 🟡 Ready to add to Dashboard.tsx (see ANALYTICS_INTEGRATION.md for steps)

**Competitive Advantage**:
✅ Instrumentl ($179/mo) - No visual analytics  
✅ GrantWatch ($49-299/mo) - No win rate tracking  
✅ Candid ($200/yr) - Data only, no tracking tools  

**You have**: Full visual analytics with charts, trends, and insights!

---

## 📄 REMAINING NON-TERMINAL TASKS

### ⏳ Task #4: Document Upload/Storage
**Status**: Not started
**Priority**: High (next up)

**What's Needed**:
- File upload component for applications
- Supabase Storage bucket configuration
- Link files to `applications` table via `attachments` jsonb field
- File preview/download functionality
- Support: PDF, DOC, DOCX

**Technical Approach**:
```typescript
// Pseudocode
1. Create storage bucket: grant-geenie-documents
2. Add RLS policies: users can only access their files
3. Upload component:
   - Use Supabase Storage uploadFile()
   - Store file metadata in applications.attachments
4. Display component:
   - List files with download links
   - Preview PDFs in-browser
```

**Competitive Advantage**:
- Instrumentl charges **$199/mo** for document storage
- You can include it **FREE** in Pro ($29/mo)

**Estimated Time**: 4-6 hours

---

### ⏳ Task #5: Export Reports (CSV/Excel)
**Status**: Not started
**Priority**: Medium

**What's Needed**:
- Export saved grants to CSV
- Export applications to CSV/Excel
- Monthly report emails (Pro feature)
- Format: Name, Funder, Amount, Deadline, Status, etc.

**Technical Approach**:
```typescript
// Client-side CSV generation
import { parse } from 'json2csv';

const exportToCSV = (data, filename) => {
  const csv = parse(data);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  // Trigger download
};
```

**Why It Matters**:
- Grant writers need to report to clients/boards
- Easy export = huge time saver
- Professional monthly summaries

**Estimated Time**: 3-4 hours

---

### ⏳ Task #6: Calendar Integration (iCal Export)
**Status**: Basic calendar exists, needs export
**Priority**: Medium

**What's Needed**:
- Export to Google Calendar
- Export to Outlook
- .ics file download
- Sync calendar reminders

**Current Status**:
- ✅ Calendar view component exists
- ❌ iCal/ICS export not implemented

**Technical Approach**:
```typescript
// Generate ICS file
const generateICS = (grants) => {
  let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\n';
  grants.forEach(grant => {
    ics += `BEGIN:VEVENT\n`;
    ics += `SUMMARY:${grant.title}\n`;
    ics += `DTSTART:${formatDate(grant.deadline)}\n`;
    ics += `END:VEVENT\n`;
  });
  ics += 'END:VCALENDAR';
  return ics;
};
```

**Estimated Time**: 2-3 hours

---

## 🚀 FUTURE FEATURES (3-6 Months)

### ⏳ Task #7: Team Collaboration
**Status**: Future feature
**Priority**: High for Team plan ($79/mo)

**Features Needed**:
- Share grants with team members
- Assign applications to users
- Comments/notes on grants
- Activity feed
- Team analytics

**Competitive Pricing**:
- Instrumentl Team: **$349/mo**
- Your Team Plan: **$79/mo** (77% savings!)

---

### ⏳ Task #8: Funder Research Profiles
**Status**: Future feature
**Priority**: Medium

**Features Needed**:
- Funder history (past grants awarded)
- Average award amounts
- Acceptance rate
- Application tips
- Success patterns

**Data Sources**:
- Candid/Foundation Directory API
- Grants.gov historical data
- User-submitted success stories

**Competitive Pricing**:
- Candid/Foundation Directory: **$200+/year** for just data
- You: Included in Pro at **$29/mo**

---

### ⏳ Task #9: Budget Builder Tool
**Status**: Future feature
**Priority**: Low

**Features Needed**:
- Line item budget templates
- Auto-calculate totals
- Export to Excel
- Save/reuse budgets

---

### ⏳ Task #10: Mobile App
**Status**: Future (6+ months)
**Priority**: Low

**Approach**:
- React Native
- Reuse existing Supabase backend
- Push notifications for deadlines

---

## 💰 PRICING STRATEGY

### Your Competitive Advantage

| Feature | Instrumentl | GrantWatch | Candid | **Grant Geenie** |
|---------|-------------|------------|--------|------------------|
| Grant Search | ✅ $179/mo | ✅ $49/mo | ✅ $200/yr | ✅ **$29/mo** |
| Application Tracking | ✅ $179/mo | ❌ | ❌ | ✅ **$29/mo** |
| Analytics Dashboard | ❌ | ❌ | ❌ | ✅ **$29/mo** |
| Document Storage | ✅ $199/mo | ❌ | ❌ | ✅ **$29/mo** |
| LOI Generator | ❌ | ❌ | ❌ | ✅ **$29/mo** |
| Fiscal Sponsors | ❌ | ❌ | ❌ | ✅ **$29/mo** |
| Team Features | ✅ $349/mo | ✅ $299/mo | ❌ | ✅ **$79/mo** |

### Recommended Pricing

**Free Tier**:
- 5 grants per month
- Basic search
- No tracking/analytics

**Pro - $29/month** (✅ **77% cheaper than Instrumentl**):
- Unlimited grants
- Application tracking
- Analytics dashboard
- Document storage
- LOI generator
- Fiscal sponsor database
- Deadline reminders
- Export reports

**Team - $79/month** (✅ **77% cheaper than Instrumentl Team**):
- Everything in Pro
- 5 team members
- Shared grants
- Team analytics
- Assign applications
- Activity feed

---

## ✅ COMPLETED FEATURES

### Core Platform
- ✅ User authentication (Supabase Auth)
- ✅ Profile questionnaire
- ✅ Grant matching by state + org type
- ✅ Smart filtering (amount, deadline, funder type)
- ✅ Save grants
- ✅ Application tracker (Kanban board)
- ✅ LOI generator
- ✅ Application templates (Federal, Foundation, Corporate, Arts)
- ✅ Fiscal sponsor database (265+ sponsors)
- ✅ Calendar view
- ✅ Subscription management (Stripe)
- ✅ Free tier limits
- ✅ Product tour
- ✅ Analytics dashboard ✅ **NEW!**

### Infrastructure
- ✅ Supabase backend
- ✅ Row Level Security (RLS)
- ✅ TypeScript + React
- ✅ Tailwind CSS
- ✅ Responsive design
- ✅ Error handling
- ✅ Loading states

---

## 🎯 NEXT IMMEDIATE ACTIONS

### This Weekend (Dec 20-22, 2025)

1. **Deploy Migrations** (30 minutes)
   - [ ] Run Task #1 SQL (deadline reminders cron)
   - [ ] Run Task #2 SQL (applications table)
   - [ ] Test: Insert sample application
   - [ ] Verify: Check analytics dashboard shows data

2. **Integrate Analytics** (1 hour)
   - [ ] Follow `ANALYTICS_INTEGRATION.md`
   - [ ] Add analytics section to Dashboard.tsx
   - [ ] Test with sample data
   - [ ] Fix any styling issues

3. **Test End-to-End** (30 minutes)
   - [ ] Create application in tracker
   - [ ] Mark as "Submitted"
   - [ ] Mark as "Awarded" with amount
   - [ ] View analytics - should show win rate

**Total Time: ~2 hours**

### Next 2 Weeks (Dec 23 - Jan 5)

4. **Document Upload** (Task #4) - 6 hours
5. **Export Reports** (Task #5) - 4 hours
6. **Calendar Export** (Task #6) - 3 hours

**Total Time: ~13 hours**

### January 2026

7. **Launch Beta** - Invite 10 beta testers
8. **Collect Feedback** - Survey + interviews
9. **Fix Bugs** - Address top 3 issues
10. **Plan Team Features** - Scope Task #7

---

## 📊 SUCCESS METRICS

**MVP Launch Criteria** (Ready for public beta):
- ✅ Migrations deployed
- ✅ Analytics integrated
- ✅ Document upload working
- ✅ Export to CSV working
- ✅ Calendar iCal export working
- ✅ No critical bugs
- ✅ Mobile responsive
- ✅ Payment processing tested

**Target Launch Date**: January 15, 2026

---

## 📧 QUESTIONS?

If you need help with:
- **Migrations**: Check Supabase Dashboard → SQL Editor for errors
- **Analytics**: Review `ANALYTICS_INTEGRATION.md`
- **Code Issues**: Check browser console (F12)
- **Deployment**: See `DEPLOYMENT.md`

---

**Updated by**: Perplexity AI  
**Next Review**: After Tasks #1 & #2 are deployed
