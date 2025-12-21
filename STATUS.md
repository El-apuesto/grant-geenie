# Grant Geenie - Development Status

## ✅ Completed Features

### Core Features
- [x] User authentication (Supabase Auth)
- [x] 9-question profile questionnaire
- [x] Smart grant matching based on:
  - State/location
  - Organization type
  - Funding amount needs
- [x] Grant pool with 8,000+ active grants
- [x] Save/bookmark grants
- [x] Pro/Free tier system with Stripe
- [x] Fiscal sponsor database (265+ sponsors)
- [x] LOI Generator with 4 templates
- [x] Application templates (Federal, Foundation, Corporate, Arts)
- [x] Calendar view for deadlines
- [x] Product tour with animated genie mascot
- [x] Help tooltips on all major sections

### Email Notifications
- [x] Welcome email (Resend)
- [x] Post-questionnaire matches email
- [x] **NEW: Deadline reminders** (7, 3, 1 day before)
  - Daily cron job at 9 AM UTC
  - Pro users only
  - Saved grants only

## 🚧 In Progress / Next Up

### High Priority
- [ ] Search bar & manual filters (funder type, amount, deadline)
- [ ] Application status tracking (Draft → Submitted → Awarded)
- [ ] Analytics dashboard (win rate, $ tracked)

### Medium Priority
- [ ] Document upload/storage
- [ ] Team collaboration features
- [ ] Weekly grant matches digest email

### Low Priority
- [ ] Budget builder tool
- [ ] Funder research profiles
- [ ] Mobile app
- [ ] Third-party integrations (Google Calendar, Slack)

## 📝 Technical Stack
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Edge Functions)
- **Payments:** Stripe
- **Email:** Resend
- **Hosting:** Netlify

## 🔧 Environment Variables Needed
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for Edge Functions)
- `RESEND_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## 📊 Database Schema
- `profiles` - User profiles with questionnaire data
- `grants` - 8,000+ grants with filtering fields
- `saved_grants` - User bookmarks
- `fiscal_sponsors` - 265+ sponsor organizations

## 🎯 Current Focus
Building out filtering UI and application tracking system to improve user workflow.
