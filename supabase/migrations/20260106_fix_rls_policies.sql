-- ============================================
-- FIX FOR ISSUE #3: RLS POLICIES
-- Questionnaire not saving & grants not displaying
-- ============================================

-- ============================================
-- FIX 1: PROFILES TABLE RLS POLICIES
-- ============================================

-- Allow users to read their own profile
CREATE POLICY IF NOT EXISTS "Users can read own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY IF NOT EXISTS "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY IF NOT EXISTS "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- ============================================
-- FIX 2: GRANTS TABLE RLS POLICIES
-- ============================================

-- Allow ALL users (even free/not logged in) to read active grants
CREATE POLICY IF NOT EXISTS "Everyone can read active grants"
ON grants FOR SELECT
TO authenticated, anon
USING (is_active = true);

-- ============================================
-- FIX 3: SAVED_GRANTS TABLE RLS POLICIES
-- ============================================

-- Allow users to read their own saved grants
CREATE POLICY IF NOT EXISTS "Users can read own saved grants"
ON saved_grants FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow users to insert their own saved grants
CREATE POLICY IF NOT EXISTS "Users can insert own saved grants"
ON saved_grants FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Allow users to delete their own saved grants
CREATE POLICY IF NOT EXISTS "Users can delete own saved grants"
ON saved_grants FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- FIX 4: ENSURE RLS IS ENABLED
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_grants ENABLE ROW LEVEL SECURITY;

-- ============================================
-- VERIFICATION QUERIES (Optional - for testing)
-- ============================================

-- Check that policies were created
-- SELECT tablename, policyname, roles, cmd FROM pg_policies WHERE tablename IN ('profiles', 'grants', 'saved_grants');

-- Check that RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename IN ('profiles', 'grants', 'saved_grants');