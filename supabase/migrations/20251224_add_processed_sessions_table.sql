-- Create table to track processed checkout sessions for idempotency
CREATE TABLE IF NOT EXISTS processed_checkout_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_processed_sessions_session_id ON processed_checkout_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_processed_sessions_user_id ON processed_checkout_sessions(user_id);

-- Add RLS policies
ALTER TABLE processed_checkout_sessions ENABLE ROW LEVEL SECURITY;

-- Only allow service role to access this table (webhook only)
CREATE POLICY "Service role can manage processed sessions"
  ON processed_checkout_sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add subscription_tier column to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='profiles' AND column_name='subscription_tier') THEN
    ALTER TABLE profiles ADD COLUMN subscription_tier TEXT DEFAULT 'free';
  END IF;
END $$;

-- Create index on subscription_tier for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);