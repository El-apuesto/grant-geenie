# Grant Genie 🧞‍♂️

**Find the perfect grants for your nonprofit, artist, or solopreneur.**

Grant Genie matches you with grants based on your location, organization type, and needs. Discover federal grants + state-specific opportunities in minutes.

## Features

✨ **Smart Matching** - Answer a questionnaire, get matched with relevant grants  
📍 **Location-Based** - See grants for your state + federal opportunities  
💰 **Real Opportunities** - Access to thousands of actual grant opportunities  
🚀 **Production Ready** - Built with React, TypeScript, and Supabase  

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Backend**: Supabase (Auth, Database, Real-time)
- **Payment**: Stripe (subscription management)
- **Deployment**: Vercel

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- Stripe account
- Vercel account

### Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/El-apuesto/grant-geenie.git
   cd grant-geenie
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env.local`** (copy from `.env.example`)
   ```bash
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Environment Setup

### Supabase

1. Create a Supabase project
2. Create these tables:
   - `profiles` (state, org_type, questionnaire_completed, has_coupon_code)
   - `grants` (title, description, amount, deadline, state, org_types, url)

3. Add environment variables to `.env.local`:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### Stripe

1. Get your Stripe API keys
2. Create pricing tiers in Stripe Dashboard
3. Add Stripe keys to your backend (if using Edge Functions)

## Deployment to Vercel

1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel settings
4. Deploy!

## Project Structure

```
src/
├── components/       # React components
├── contexts/         # React Context (Auth)
├── lib/              # Utilities (Supabase, states)
├── types/            # TypeScript types
├── App.tsx           # Main app component
└── main.tsx          # Entry point
```

## Features to Build Next

- [ ] Grant search/filter
- [ ] Save favorite grants
- [ ] Application templates
- [ ] Deadline reminders
- [ ] Admin dashboard
- [ ] Analytics

## Troubleshooting

### "Supabase environment variables not found"
Make sure you have `.env.local` with your Supabase credentials.

### Build errors
Run `npm install` and ensure Node 18+ is installed.

## Support

Have questions? Open an issue or contact the team.

---

**Made with ❤️ for nonprofits, artists, and solopreneurs.**
