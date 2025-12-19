-- Fiscal Sponsors Database
-- Source: https://fiscalsponsordirectory.org

-- Create table if not exists
CREATE TABLE IF NOT EXISTS fiscal_sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT,
  state TEXT,
  focus_areas TEXT[],
  website TEXT,
  fee_range TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert fiscal sponsors (sample from directory)
INSERT INTO fiscal_sponsors (name, city, state, focus_areas, fee_range, website) VALUES
-- Top National Sponsors
('Fractured Atlas', 'New York', 'NY', ARRAY['Arts', 'Film', 'Music', 'Theater', 'Visual Arts'], '6-8%', 'https://www.fracturedatlas.org'),
('Tides Center', 'San Francisco', 'CA', ARRAY['Social Justice', 'Environment', 'Community Development', 'Arts'], '8-12%', 'https://www.tidescenter.org'),
('Community Partners', 'Los Angeles', 'CA', ARRAY['Social Justice', 'Health', 'Education', 'Arts', 'Environment'], '8-10%', 'https://www.communitypartners.org'),
('New York Foundation for the Arts', 'New York', 'NY', ARRAY['Arts', 'Film', 'Visual Arts', 'Performing Arts'], '8%', 'https://www.nyfa.org'),
('Rockefeller Philanthropy Advisors', 'New York', 'NY', ARRAY['Philanthropy', 'Social Impact', 'International Development'], '7-10%', 'https://www.rockpa.org'),
('FJC', 'New York', 'NY', ARRAY['Jewish Community', 'Arts', 'Education', 'Social Services'], '6-9%', 'https://www.fjc.org'),

-- California Sponsors
('Community Initiatives', 'Oakland', 'CA', ARRAY['Social Justice', 'Community Development', 'Environment'], '8-10%', 'https://www.communityinitiatives.com'),
('Social & Environmental Entrepreneurs', 'Calabasas', 'CA', ARRAY['Environment', 'Conservation', 'Sustainability'], '7-12%', 'https://www.saveourplanet.org'),
('Fulcrum Arts', 'Pasadena', 'CA', ARRAY['Arts', 'Culture', 'Creative Projects'], '7%', 'https://www.fulcrumarts.org'),
('Earth Island Institute', 'Berkeley', 'CA', ARRAY['Environment', 'Conservation', 'Climate'], '10-12%', 'https://www.earthisland.org'),

-- Arts Focused
('Film Independent', 'Los Angeles', 'CA', ARRAY['Film', 'Documentary', 'Media'], '7-9%', 'https://www.filmindependent.org'),
('International Documentary Association', 'Los Angeles', 'CA', ARRAY['Documentary', 'Film', 'Media'], '7-10%', 'https://www.documentary.org'),
('The Field', 'New York', 'NY', ARRAY['Performing Arts', 'Dance', 'Theater'], '8%', 'https://www.thefield.org'),
('Bay Area Video Coalition', 'San Francisco', 'CA', ARRAY['Film', 'Media Arts', 'Video'], '8%', 'https://www.bavc.org'),

-- Regional/Community
('Allied Arts Foundation', 'Seattle', 'WA', ARRAY['Arts', 'Culture', 'Community'], '7-10%', NULL),
('Propel Nonprofits', 'Minneapolis', 'MN', ARRAY['Community Development', 'Social Services', 'General'], '6-9%', 'https://www.propelnonprofits.org'),
('Shunpike', 'Seattle', 'WA', ARRAY['Arts', 'Culture', 'Creative Projects'], '7-9%', 'https://www.shunpike.org'),
('Players Philanthropy Fund', 'Towson', 'MD', ARRAY['Sports', 'Youth Development', 'General'], '6-8%', 'https://www.playersphilanthropy.org'),

-- Social Justice Focused
('NEO Philanthropy', 'New York', 'NY', ARRAY['Social Justice', 'Equity', 'Progressive Causes'], '8-12%', 'https://www.neophilanthropy.org'),
('Movement Strategy Center', 'Oakland', 'CA', ARRAY['Social Justice', 'Movement Building', 'Organizing'], '10%', 'https://www.movementstrategy.org'),
('The Giving Back Fund', 'Boston', 'MA', ARRAY['Celebrity Giving', 'Athlete Foundations', 'General'], '7-10%', 'https://www.givingback.org'),

-- Environmental
('Rose Foundation for Communities and the Environment', 'Oakland', 'CA', ARRAY['Environment', 'Environmental Justice', 'Community'], '8-10%', 'https://www.rosefdn.org'),
('Trees Foundation', 'Redway', 'CA', ARRAY['Forestry', 'Conservation', 'Environment'], '8-12%', 'https://www.treesfoundation.org'),

-- Health & Social Services
('Public Health Institute', 'Oakland', 'CA', ARRAY['Public Health', 'Health Equity', 'Research'], '10-15%', 'https://www.phi.org'),
('Heluna Health', 'City of Industry', 'CA', ARRAY['Health', 'Research', 'Public Health'], '12-15%', 'https://www.helunahealth.org'),

-- Education
('Foundation for California Community Colleges', 'Sacramento', 'CA', ARRAY['Education', 'Community Colleges', 'Students'], '8-10%', 'https://www.foundationccc.org'),

-- Faith-Based
('Faith Based Nonprofit Resource Center', 'Elkton', 'MD', ARRAY['Faith-Based', 'Community Development', 'Social Services'], '6-9%', NULL),

-- Technology/Innovation
('Apereo Foundation', 'Beaverton', 'OR', ARRAY['Technology', 'Education Technology', 'Open Source'], '5-8%', 'https://www.apereo.org'),

-- Media
('Institute for Nonprofit News', 'Los Angeles', 'CA', ARRAY['Journalism', 'Media', 'Nonprofit News'], '8-10%', 'https://www.inn.org'),
('Alternative Newsweekly Foundation', 'Washington', 'D.C.', ARRAY['Journalism', 'Alternative Media'], '7-10%', NULL)

ON CONFLICT DO NOTHING;