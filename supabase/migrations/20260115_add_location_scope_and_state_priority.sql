-- Adds location scope fields for grants + profiles, and seeds population-order state priority.

-- 1) Grants: separate federal/state/local + national/state/county/city scope
ALTER TABLE grants
  ADD COLUMN IF NOT EXISTS jurisdiction_level text,  -- 'federal' | 'state' | 'local'
  ADD COLUMN IF NOT EXISTS scope_level text,         -- 'national' | 'state' | 'county' | 'city'
  ADD COLUMN IF NOT EXISTS states text[],
  ADD COLUMN IF NOT EXISTS county_fips text[],
  ADD COLUMN IF NOT EXISTS place_fips text[],
  ADD COLUMN IF NOT EXISTS coverage_note text;

-- Indexes for fast filtering
CREATE INDEX IF NOT EXISTS grants_states_gin
  ON grants USING GIN (states);

CREATE INDEX IF NOT EXISTS grants_county_fips_gin
  ON grants USING GIN (county_fips);

CREATE INDEX IF NOT EXISTS grants_place_fips_gin
  ON grants USING GIN (place_fips);

-- 2) Profiles: user's county/city (incorporated only for now)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS county_fips text,
  ADD COLUMN IF NOT EXISTS place_fips text;

-- 3) Priority table: drives ingestion order
CREATE TABLE IF NOT EXISTS states_priority (
  state_code text PRIMARY KEY,
  priority int UNIQUE NOT NULL,
  state_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Seed (population-ordered; includes DC since your UI includes it)
INSERT INTO states_priority (state_code, priority, state_name) VALUES
('CA',  1, 'California'),
('TX',  2, 'Texas'),
('FL',  3, 'Florida'),
('NY',  4, 'New York'),
('PA',  5, 'Pennsylvania'),
('IL',  6, 'Illinois'),
('OH',  7, 'Ohio'),
('GA',  8, 'Georgia'),
('NC',  9, 'North Carolina'),
('MI', 10, 'Michigan'),
('NJ', 11, 'New Jersey'),
('VA', 12, 'Virginia'),
('WA', 13, 'Washington'),
('AZ', 14, 'Arizona'),
('TN', 15, 'Tennessee'),
('MA', 16, 'Massachusetts'),
('IN', 17, 'Indiana'),
('MO', 18, 'Missouri'),
('MD', 19, 'Maryland'),
('WI', 20, 'Wisconsin'),
('CO', 21, 'Colorado'),
('MN', 22, 'Minnesota'),
('SC', 23, 'South Carolina'),
('AL', 24, 'Alabama'),
('LA', 25, 'Louisiana'),
('KY', 26, 'Kentucky'),
('OR', 27, 'Oregon'),
('OK', 28, 'Oklahoma'),
('CT', 29, 'Connecticut'),
('UT', 30, 'Utah'),
('IA', 31, 'Iowa'),
('NV', 32, 'Nevada'),
('AR', 33, 'Arkansas'),
('MS', 34, 'Mississippi'),
('KS', 35, 'Kansas'),
('NM', 36, 'New Mexico'),
('NE', 37, 'Nebraska'),
('ID', 38, 'Idaho'),
('WV', 39, 'West Virginia'),
('HI', 40, 'Hawaii'),
('NH', 41, 'New Hampshire'),
('ME', 42, 'Maine'),
('MT', 43, 'Montana'),
('RI', 44, 'Rhode Island'),
('DE', 45, 'Delaware'),
('SD', 46, 'South Dakota'),
('ND', 47, 'North Dakota'),
('AK', 48, 'Alaska'),
('VT', 49, 'Vermont'),
('WY', 50, 'Wyoming'),
('DC', 51, 'District of Columbia')
ON CONFLICT (state_code) DO NOTHING;
