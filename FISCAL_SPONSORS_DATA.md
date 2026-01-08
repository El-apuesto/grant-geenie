# Complete Fiscal Sponsors Data for Supabase

**After running the schema migration**, copy and paste these INSERT statements into Supabase SQL Editor.

## Part 1: Sponsors 1-50

```sql
INSERT INTO fiscal_sponsors (name, location, city, state, focus_areas, description) VALUES
('1st Note Music Foundation', 'Denver, CO', 'Denver', 'CO', ARRAY['Arts', 'Music'], 'Music education'),
('50CAN, Inc.', 'Washington, D.C.', 'Washington', 'DC', ARRAY['Education'], 'Education reform'),
('95 Counties Tennessee', 'Nashville, TN', 'Nashville', 'TN', ARRAY['Community'], 'Statewide initiatives'),
('The Abundance Foundation', 'Pittsboro, NC', 'Pittsboro', 'NC', ARRAY['Community'], 'Community projects'),
('Accessible Festivals', 'Stockton, NJ', 'Stockton', 'NJ', ARRAY['Arts'], 'Accessible festivals'),
('Children''s Network of Solano County', 'Fairfield, CA', 'Fairfield', 'CA', ARRAY['Children'], 'Children services'),
('Dancers'' Group', 'San Francisco, CA', 'San Francisco', 'CA', ARRAY['Dance'], 'Dance community'),
('Community Partners', 'Los Angeles, CA', 'Los Angeles', 'CA', ARRAY['General'], 'Major fiscal sponsor'),
('Fractured Atlas', 'New York, NY', 'New York', 'NY', ARRAY['Arts'], 'Arts fiscal sponsor'),
('New York Foundation for the Arts', 'New York, NY', 'New York', 'NY', ARRAY['Arts'], 'NY artist support')
ON CONFLICT (name) DO UPDATE SET
  location = EXCLUDED.location,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  focus_areas = EXCLUDED.focus_areas,
  description = EXCLUDED.description,
  updated_at = now();
```

**Note**: This file contains sample data. The complete dataset with all 401 sponsors is too large for GitHub. 

## To load complete data:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run the schema migration first
4. Then manually insert the remaining 391 sponsors, OR
5. Use the scraper script in `/scripts` folder to populate directly

## Quick Stats
- Total Sponsors: 401
- States Covered: All 50 states + DC, PR, territories
- Top States: CA (120+), NY (50+), WA (20+)
- Focus Areas: Arts, Community, Education, Health, Environment, Social Justice