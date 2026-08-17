-- Run this entire block in your Supabase SQL Editor
-- It resets all permissions cleanly

-- Drop all existing policies on applications
DROP POLICY IF EXISTS "Allow public insert" ON applications;
DROP POLICY IF EXISTS "Allow admin select" ON applications;
DROP POLICY IF EXISTS "Allow admin update" ON applications;

-- Make sure RLS is enabled
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (candidates submitting applications)
CREATE POLICY "Allow public insert"
  ON applications FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to read all
CREATE POLICY "Allow admin select"
  ON applications FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to update
CREATE POLICY "Allow admin update"
  ON applications FOR UPDATE
  TO authenticated
  USING (true);

-- Grant explicit permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON applications TO anon;
GRANT ALL ON applications TO authenticated;
