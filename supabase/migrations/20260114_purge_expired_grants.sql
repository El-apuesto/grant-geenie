-- Function to mark expired grants as inactive
CREATE OR REPLACE FUNCTION purge_expired_grants()
RETURNS TABLE (
  purged_count INTEGER,
  purged_ids UUID[]
) AS $$
DECLARE
  expired_ids UUID[];
  updated_count INTEGER;
BEGIN
  -- Find all expired grants (deadline passed and not rolling)
  SELECT ARRAY_AGG(id) INTO expired_ids
  FROM grants
  WHERE is_active = true
    AND is_rolling = false
    AND deadline IS NOT NULL
    AND deadline < CURRENT_DATE;

  -- Update them to inactive
  UPDATE grants
  SET is_active = false,
      updated_at = NOW()
  WHERE id = ANY(expired_ids);

  GET DIAGNOSTICS updated_count = ROW_COUNT;

  -- Return results
  RETURN QUERY SELECT updated_count, COALESCE(expired_ids, ARRAY[]::UUID[]);
END;
$$ LANGUAGE plpgsql;

-- Schedule this to run daily at 2 AM UTC
-- (You'll set this up in Supabase Dashboard -> Database -> Cron Jobs)
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'purge-expired-grants-daily',
  '0 2 * * *', -- Run at 2 AM UTC every day
  $$SELECT purge_expired_grants();$$
);