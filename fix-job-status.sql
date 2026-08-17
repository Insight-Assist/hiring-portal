-- Run this in your Supabase SQL Editor to fix the close/open position feature

-- Create the job_status table if it doesn't exist
CREATE TABLE IF NOT EXISTS job_status (
  role text PRIMARY KEY,
  is_open boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- Seed with both roles open (won't overwrite existing values)
INSERT INTO job_status (role, is_open) VALUES
  ('scribe', true),
  ('optical-technician', true)
ON CONFLICT (role) DO NOTHING;

-- Enable RLS
ALTER TABLE job_status ENABLE ROW LEVEL SECURITY;

-- Drop any old policies and recreate cleanly
DROP POLICY IF EXISTS "Allow public read job_status" ON job_status;
DROP POLICY IF EXISTS "Allow admin update job_status" ON job_status;

-- Anyone can read (so job pages know if they're open)
CREATE POLICY "Allow public read job_status"
  ON job_status FOR SELECT
  TO anon
  USING (true);

-- Authenticated users (admin) can do everything
CREATE POLICY "Allow admin all job_status"
  ON job_status FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON job_status TO anon;
GRANT ALL ON job_status TO authenticated;
