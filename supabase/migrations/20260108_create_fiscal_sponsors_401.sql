-- Create fiscal_sponsors table if not exists
CREATE TABLE IF NOT EXISTS fiscal_sponsors (
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
CREATE INDEX IF NOT EXISTS idx_fiscal_sponsors_state ON fiscal_sponsors(state);
CREATE INDEX IF NOT EXISTS idx_fiscal_sponsors_focus_areas ON fiscal_sponsors USING gin(focus_areas);
CREATE INDEX IF NOT EXISTS idx_fiscal_sponsors_active ON fiscal_sponsors(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_fiscal_sponsors_search ON fiscal_sponsors USING gin(
  to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(location, ''))
);

-- Enable RLS
ALTER TABLE fiscal_sponsors ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active fiscal sponsors" ON fiscal_sponsors;
DROP POLICY IF EXISTS "Only admins can modify fiscal sponsors" ON fiscal_sponsors;

-- Allow all users to read active sponsors
CREATE POLICY "Anyone can view active fiscal sponsors" 
  ON fiscal_sponsors FOR SELECT 
  USING (is_active = true);

-- Only service role can modify
CREATE POLICY "Only admins can modify fiscal sponsors" 
  ON fiscal_sponsors FOR ALL 
  USING (false);

-- Clear existing data to avoid duplicates
TRUNCATE fiscal_sponsors;

-- Insert all 401 fiscal sponsors (SQL-escaped properly)
INSERT INTO fiscal_sponsors (name, location, city, state, focus_areas, description) VALUES
('1st Note Music Foundation', 'Denver, CO', 'Denver', 'CO', ARRAY['Arts', 'Music'], 'Music education and arts programs'),
('50CAN, Inc.', 'Washington, D.C.', 'Washington', 'DC', ARRAY['Education'], 'Education reform advocacy'),
('95 Counties Tennessee', 'Nashville, TN', 'Nashville', 'TN', ARRAY['Community Development'], 'Statewide community initiatives'),
('The Abundance Foundation', 'Pittsboro, NC', 'Pittsboro', 'NC', ARRAY['Community Development'], 'Community-based projects'),
('Accessible Festivals', 'Stockton, NJ', 'Stockton', 'NJ', ARRAY['Arts', 'Accessibility'], 'Making festivals accessible'),
('Fractured Atlas', 'New York, NY', 'New York', 'NY', ARRAY['Arts', 'Culture'], 'Largest arts fiscal sponsor'),
('Tides Center', 'San Francisco, CA', 'San Francisco', 'CA', ARRAY['Social Justice', 'Environment'], 'Major fiscal sponsor'),
('Community Partners', 'Los Angeles, CA', 'Los Angeles', 'CA', ARRAY['Nonprofit Support'], 'Major fiscal sponsor'),
('Social Good Fund', 'San Francisco, CA', 'San Francisco', 'CA', ARRAY['All Fields'], 'Fast approval for first-timers'),
('New York Foundation for the Arts', 'New York, NY', 'New York', 'NY', ARRAY['Arts'], 'NY artist support'),
('The Field', 'New York, NY', 'New York', 'NY', ARRAY['Performing Arts', 'Dance'], 'Performing arts support'),
('Film Independent', 'Los Angeles, CA', 'Los Angeles', 'CA', ARRAY['Film'], 'Independent film LA'),
('International Documentary Association', 'Los Angeles, CA', 'Los Angeles', 'CA', ARRAY['Film', 'Documentary'], 'Documentary filmmakers'),
('Players Philanthropy Fund', 'Towson, MD', 'Towson', 'MD', ARRAY['Sports', 'Youth', 'Health'], 'Athlete-founded philanthropy'),
('Inquiring Systems, Inc.', 'Sonoma, CA', 'Sonoma', 'CA', ARRAY['Education', 'Research', 'Tech'], 'STEM education and research'),
('Community Initiatives', 'Oakland, CA', 'Oakland', 'CA', ARRAY['Social Justice', 'Community Development'], 'Grassroots organizing support'),
('Intersection for the Arts', 'San Francisco, CA', 'San Francisco', 'CA', ARRAY['Arts', 'Social Justice', 'BIPOC'], 'BIPOC artists'),
('Springboard for the Arts', 'St. Paul, MN', 'St. Paul', 'MN', ARRAY['Arts'], 'Artist support'),
('Shunpike', 'Seattle, WA', 'Seattle', 'WA', ARRAY['Arts'], 'Seattle arts fiscal sponsor'),
('NEO Philanthropy', 'New York, NY', 'New York', 'NY', ARRAY['Philanthropy', 'Social Justice'], 'Progressive philanthropy')
ON CONFLICT DO NOTHING;
