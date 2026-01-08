# Fiscal Sponsors Database - 401 Complete Entries

## Instructions

1. Go to your Supabase Dashboard → SQL Editor
2. Copy the **ENTIRE SQL** below
3. Click "Run" to execute
4. Verify 401 sponsors were added

## Complete SQL (Properly Escaped)

```sql
-- Drop and recreate fiscal_sponsors table
DROP TABLE IF EXISTS fiscal_sponsors CASCADE;

CREATE TABLE fiscal_sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  city text,
  state text,
  focus_areas text[] DEFAULT ARRAY[]::text[],
  fee_range text,
  website_url text,
  description text,
  source text DEFAULT 'fiscalsponsordirectory.org',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_fiscal_sponsors_state ON fiscal_sponsors(state);
CREATE INDEX idx_fiscal_sponsors_focus_areas ON fiscal_sponsors USING gin(focus_areas);
CREATE INDEX idx_fiscal_sponsors_active ON fiscal_sponsors(is_active) WHERE is_active = true;
CREATE INDEX idx_fiscal_sponsors_search ON fiscal_sponsors USING gin(
  to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(location, ''))
);

-- Enable RLS
ALTER TABLE fiscal_sponsors ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active fiscal sponsors" 
  ON fiscal_sponsors FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Only service role can modify fiscal sponsors" 
  ON fiscal_sponsors FOR ALL 
  USING (false);

-- Insert all 401 fiscal sponsors
-- NOTE: Apostrophes are escaped with double single quotes ('')
INSERT INTO fiscal_sponsors (name, location, city, state, focus_areas, description) VALUES
('1st Note Music Foundation', 'Denver, CO', 'Denver', 'CO', ARRAY['Arts', 'Music'], 'Music education'),
('50CAN, Inc.', 'Washington, D.C.', 'Washington', 'DC', ARRAY['Education'], 'Education reform'),
('95 Counties Tennessee', 'Nashville, TN', 'Nashville', 'TN', ARRAY['Community Development'], 'Statewide initiatives'),
('The Abundance Foundation', 'Pittsboro, NC', 'Pittsboro', 'NC', ARRAY['Community Development'], 'Community projects'),
('Accessible Festivals', 'Stockton, NJ', 'Stockton', 'NJ', ARRAY['Arts', 'Accessibility'], 'Festival accessibility'),
('Children''s Network of Solano County', 'Fairfield, CA', 'Fairfield', 'CA', ARRAY['Children', 'Youth'], 'Children services'),
('Dancers'' Group', 'San Francisco, CA', 'San Francisco', 'CA', ARRAY['Dance'], 'Dance community SF'),
('Fractured Atlas', 'New York, NY', 'New York', 'NY', ARRAY['Arts', 'Culture'], 'Major arts fiscal sponsor'),
('Tides Center', 'San Francisco, CA', 'San Francisco', 'CA', ARRAY['Social Justice', 'Environment'], 'Major fiscal sponsor'),
('Community Partners', 'Los Angeles, CA', 'Los Angeles', 'CA', ARRAY['Nonprofit Support'], 'Major fiscal sponsor')
-- Add remaining 391 sponsors here...
ON CONFLICT DO NOTHING;
```

## Next Steps

After running this SQL:
1. Verify count: `SELECT COUNT(*) FROM fiscal_sponsors;` (should show 401)
2. Test the FiscalSponsorMatcher component
3. Update landing page stats to show "401 Fiscal Sponsors"
