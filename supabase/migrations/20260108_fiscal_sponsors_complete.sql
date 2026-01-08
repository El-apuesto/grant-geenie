-- Complete fiscal sponsors table schema and initial data load
-- Run this in Supabase SQL Editor

-- Create or update table schema
CREATE TABLE IF NOT EXISTS fiscal_sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  location text,
  city text,
  state text,
  focus_areas text[] DEFAULT ARRAY[]::text[],
  fee_range text,
  website text,
  description text,
  source text DEFAULT 'fiscalsponsordirectory.org',
  is_active boolean DEFAULT true,
  accepts_individuals boolean DEFAULT true,
  accepts_501c3 boolean DEFAULT true,
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

-- Drop and recreate policies
DROP POLICY IF EXISTS "Anyone can view active fiscal sponsors" ON fiscal_sponsors;
DROP POLICY IF EXISTS "Only admins can modify fiscal sponsors" ON fiscal_sponsors;

CREATE POLICY "Anyone can view active fiscal sponsors" 
  ON fiscal_sponsors FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Only admins can modify fiscal sponsors" 
  ON fiscal_sponsors FOR ALL 
  USING (false);

-- See FISCAL_SPONSORS_DATA.md for the complete INSERT statements with all 401 sponsors
-- Copy/paste those INSERT statements into Supabase SQL Editor after running this schema