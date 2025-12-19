# How to Sync Grants to Your Database

You now have a Grants.gov sync function that will populate your database with real federal grants!

## Method 1: Run the Supabase Edge Function (Easiest)

### Step 1: Deploy the Function
```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the function
supabase functions deploy sync-grants-gov
```

### Step 2: Invoke the Function
Go to your Supabase Dashboard:
1. Click **Edge Functions** in the sidebar
2. Find **sync-grants-gov**
3. Click **Invoke**
4. Wait for it to complete (may take 5-10 minutes for all grants)

### Step 3: Check Your Database
```sql
-- Run this in your Supabase SQL Editor
SELECT COUNT(*) as total_grants FROM grants;
SELECT state, COUNT(*) as count FROM grants GROUP BY state ORDER BY count DESC;
```

## Method 2: Use Sample Grants (Quick Test)

If you just want to test the app quickly:

1. Go to your Supabase SQL Editor
2. Run the SQL in `supabase/seed_grants.sql`
3. This adds 15 sample grants instantly

## What the Sync Does

The **sync-grants-gov** function:
- ✅ Fetches ALL active federal grants from Grants.gov API
- ✅ No API key required (it's a free public API)
- ✅ Automatically handles pagination
- ✅ Prevents duplicates (updates existing grants)
- ✅ Includes grant details:
  - Title, description
  - Funding amounts
  - Deadlines
  - Eligible organization types
  - Application URLs
- ✅ Marks grants as nationwide (state=null)

## Grant Matching Logic

Once grants are in your database, they're matched to users based on:

1. **State**: User's state OR null (federal/nationwide grants)
2. **Org Type**: User's primary field matches grant's org_types

### Example:
If user profile says:
- State: California (CA)
- Org Type: Arts & Culture

They'll see:
- All grants where state = 'CA'
- All grants where state = null (federal)
- Filtered by org_types containing 'Arts & Culture'

## Database Schema

Your grants table should have:
```sql
CREATE TABLE grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT, -- 'grants_gov', 'sample', etc.
  source_id TEXT, -- unique ID from source
  title TEXT NOT NULL,
  description TEXT,
  amount INTEGER, -- in dollars
  deadline TIMESTAMPTZ,
  state TEXT, -- 2-letter code or NULL for federal
  org_types TEXT[], -- array of eligible types
  url TEXT, -- application URL
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source, source_id)
);
```

## Troubleshooting

### "No grants showing up after sync"
1. Check if grants were inserted:
   ```sql
   SELECT COUNT(*) FROM grants;
   ```
2. Check if your user completed the questionnaire:
   ```sql
   SELECT state, org_type FROM profiles WHERE id = 'YOUR_USER_ID';
   ```
3. Try a manual query:
   ```sql
   SELECT * FROM grants 
   WHERE (state = 'CA' OR state IS NULL)
   LIMIT 10;
   ```

### "Function fails to deploy"
- Make sure Supabase CLI is installed and updated
- Check that you're linked to the correct project
- Verify your Supabase project has Edge Functions enabled

### "Sync is slow"
- Grants.gov has thousands of opportunities
- First sync takes 5-10 minutes (normal)
- Subsequent syncs are faster (only updates changed grants)

## Next Steps

Want to add more grant sources?

1. **State Portals**: Copy `sync-state-portals` from granthustle repo
2. **Foundation Grants**: Integrate Candid API (requires API key)
3. **Research Grants**: Add GrantForward or Instrumentl

See the granthustle repo for working examples of all these integrations!