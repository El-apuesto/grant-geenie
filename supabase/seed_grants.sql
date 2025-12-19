-- Sample Grants Data for Testing
-- Run this SQL in your Supabase SQL Editor to add test grants

-- Insert sample grants for different states and org types
INSERT INTO grants (title, description, amount, deadline, state, org_types, url) VALUES
  -- National Grants (state = null means available nationwide)
  (
    'National Endowment for the Arts - Art Works',
    'Supports artistically excellent projects that celebrate creativity and cultural heritage. Available to nonprofit organizations, units of state or local government, and federally recognized tribal communities.',
    50000,
    '2026-03-15',
    NULL,
    ARRAY['Arts & Culture', 'Nonprofit'],
    'https://www.arts.gov/grants/apply-grant/grants-organizations'
  ),
  (
    'Small Business Innovation Research (SBIR)',
    'Federal program encouraging small businesses to engage in research and development with commercialization potential. Supports technology innovation and economic growth.',
    150000,
    '2026-06-30',
    NULL,
    ARRAY['Technology', 'For-profit', 'Small Business'],
    'https://www.sbir.gov/'
  ),
  (
    'Creative Capital Artist Grant',
    'Supports innovative artists across all disciplines through funding and strategic guidance. Open to individual artists working in visual arts, performing arts, literature, film, and more.',
    75000,
    '2026-04-20',
    NULL,
    ARRAY['Arts & Culture', 'Individual'],
    'https://creative-capital.org/'
  ),
  
  -- California Grants
  (
    'California Arts Council - Artists in Communities',
    'Supports artist residencies in community settings throughout California. Funds projects that engage communities through artistic practice.',
    25000,
    '2026-02-28',
    'CA',
    ARRAY['Arts & Culture', 'Individual', 'Nonprofit'],
    'https://arts.ca.gov/grant_program/artists-in-communities/'
  ),
  (
    'California Clean Energy Fund',
    'Provides capital and strategic support to clean energy companies in California. Focus on environmental sustainability and green technology.',
    100000,
    '2026-05-15',
    'CA',
    ARRAY['Environment', 'Technology', 'For-profit'],
    'https://www.calcef.org/'
  ),
  
  -- New York Grants
  (
    'New York State Council on the Arts',
    'Operating support for arts and cultural organizations throughout New York State. Supports diverse artistic disciplines and community engagement.',
    35000,
    '2026-03-01',
    'NY',
    ARRAY['Arts & Culture', 'Nonprofit'],
    'https://arts.ny.gov/'
  ),
  (
    'NYC Small Business Recovery Grant',
    'Emergency funding for small businesses impacted by economic challenges. Available to businesses operating in New York City.',
    15000,
    '2026-01-31',
    'NY',
    ARRAY['Small Business', 'For-profit'],
    'https://www1.nyc.gov/site/sbs/businesses/covid19-business-financial-assistance.page'
  ),
  
  -- Texas Grants
  (
    'Texas Commission on the Arts - Young Masters',
    'Grants to support arts education programs for young people in Texas. Focus on developing artistic skills and cultural appreciation.',
    20000,
    '2026-04-10',
    'TX',
    ARRAY['Arts & Culture', 'Education', 'Nonprofit'],
    'https://www.arts.texas.gov/'
  ),
  (
    'Texas Enterprise Fund',
    'Deal-closing fund to attract businesses to Texas. Supports job creation and capital investment in the state.',
    200000,
    '2026-07-15',
    'TX',
    ARRAY['For-profit', 'Technology', 'Community Development'],
    'https://gov.texas.gov/business/page/texas-enterprise-fund'
  ),
  
  -- Florida Grants
  (
    'Florida Division of Arts and Culture',
    'General program support for cultural organizations in Florida. Encourages artistic excellence and public engagement with the arts.',
    30000,
    '2026-03-30',
    'FL',
    ARRAY['Arts & Culture', 'Nonprofit'],
    'https://dos.myflorida.com/cultural/grants/'
  ),
  
  -- Illinois Grants  
  (
    'Illinois Arts Council Agency - Project Support',
    'Funding for specific arts projects in Illinois. Supports diverse artistic disciplines and community-engaged work.',
    18000,
    '2026-02-15',
    'IL',
    ARRAY['Arts & Culture', 'Individual', 'Nonprofit'],
    'https://arts.illinois.gov/'
  ),
  
  -- More National Grants
  (
    'Environmental Protection Agency - Environmental Justice',
    'Grants to support communities affected by environmental issues. Focus on improving environmental and public health outcomes.',
    125000,
    '2026-05-01',
    NULL,
    ARRAY['Environment', 'Health', 'Nonprofit', 'Community Development'],
    'https://www.epa.gov/environmentaljustice/environmental-justice-grants'
  ),
  (
    'National Science Foundation - CAREER Awards',
    'Supports early-career faculty who exemplify teacher-scholars through outstanding research and education.',
    500000,
    '2026-07-30',
    NULL,
    ARRAY['Education', 'Technology', 'Research'],
    'https://www.nsf.gov/funding/pgm_summ.jsp?pims_id=503214'
  ),
  (
    'Robert Wood Johnson Foundation - Health Equity',
    'Funding to advance health equity and eliminate health disparities. Focus on systemic change and community-driven solutions.',
    85000,
    '2026-04-15',
    NULL,
    ARRAY['Health', 'Community Development', 'Nonprofit'],
    'https://www.rwjf.org/en/grants/active-funding-opportunities.html'
  ),
  (
    'Knight Foundation - Arts + Tech',
    'Supports innovative projects at the intersection of arts and technology. Focus on experimental and forward-thinking work.',
    60000,
    '2026-06-01',
    NULL,
    ARRAY['Arts & Culture', 'Technology', 'Innovation'],
    'https://knightfoundation.org/programs/arts/'
  );

-- Verify the data was inserted
SELECT COUNT(*) as total_grants FROM grants;
SELECT state, COUNT(*) as count FROM grants GROUP BY state ORDER BY state NULLS FIRST;