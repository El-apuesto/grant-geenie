-- ============================================
-- FIX FOR ISSUE #3: RLS POLICIES
-- Questionnaire not saving & grants not displaying
-- ============================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Everyone can read grants" ON grants;
DROP POLICY IF EXISTS "Users can read own saved grants" ON saved_grants;
DROP POLICY IF EXISTS "Users can insert own saved grants" ON saved_grants;
DROP POLICY IF EXISTS "Users can delete own saved grants" ON saved_grants;

-- ============================================
-- PROFILES TABLE RLS POLICIES
-- ============================================

CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- ============================================
-- GRANTS TABLE RLS POLICIES
-- ============================================

CREATE POLICY "Everyone can read grants"
ON grants FOR SELECT
TO authenticated, anon
USING (true);

-- ============================================
-- SAVED_GRANTS TABLE RLS POLICIES
-- ============================================

CREATE POLICY "Users can read own saved grants"
ON saved_grants FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own saved grants"
ON saved_grants FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own saved grants"
ON saved_grants FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- ENSURE RLS IS ENABLED
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_grants ENABLE ROW LEVEL SECURITY;