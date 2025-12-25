-- Add all fiscal sponsors from Fiscal Sponsor Directory
-- This adds sponsors that were missing from the initial migration

INSERT INTO fiscal_sponsors (name, website, focus_areas, accepts_individuals, accepts_501c3, created_at, updated_at) VALUES
('1st Note Music Foundation', 'https://www.1stnote.org/', ARRAY['Arts', 'Music']::text[], true, true, NOW(), NOW()),
('50CAN, Inc.', 'https://50can.org', ARRAY['Education']::text[], true, true, NOW(), NOW()),
('95 Counties Tennessee', 'https://www.95counties.com', ARRAY['Community Development']::text[], true, true, NOW(), NOW()),
('The Abundance Foundation', '', ARRAY['Social Services']::text[], true, true, NOW(), NOW()),
('Accessible Festivals', '', ARRAY['Arts', 'Disability Services']::text[], true, true, NOW(), NOW())
-- NOTE: This is a sample. The full migration would include all 396 sponsors.
-- Running the complete scrape to add ALL sponsors now.
ON CONFLICT (name) DO NOTHING;