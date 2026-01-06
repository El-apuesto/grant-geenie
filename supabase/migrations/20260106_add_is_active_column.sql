-- Add is_active column if it doesn't exist
ALTER TABLE grants ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Set is_active based on deadline
-- Active if: rolling OR deadline is in the future OR deadline is NULL
UPDATE grants
SET is_active = (
  is_rolling = true 
  OR deadline IS NULL 
  OR deadline > NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_grants_is_active ON grants(is_active);

-- Optional: Create a function to auto-update is_active
-- This keeps expired grants automatically marked as inactive
CREATE OR REPLACE FUNCTION update_grant_active_status()
RETURNS void AS $$
BEGIN
  UPDATE grants
  SET is_active = (
    is_rolling = true 
    OR deadline IS NULL 
    OR deadline > NOW()
  )
  WHERE is_active != (
    is_rolling = true 
    OR deadline IS NULL 
    OR deadline > NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Verify the update
-- SELECT is_active, COUNT(*) FROM grants GROUP BY is_active;