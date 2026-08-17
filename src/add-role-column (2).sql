-- Run this in your Supabase SQL Editor
ALTER TABLE applications ADD COLUMN IF NOT EXISTS role text DEFAULT 'scribe';

-- Add job_status table to track open/closed per role
CREATE TABLE IF NOT EXISTS job_status (
  role text PRIMARY KEY,
  is_open boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- Seed with both roles as open
INSERT INTO job_status (role, is_open) VALUES
  ('scribe', true),
  ('optical-technician', true)
ON CONFLICT (role) DO NOTHING;

-- Allow admin to read and update job status
GRANT SELECT, UPDATE, INSERT ON job_status TO authenticated;
GRANT SELECT ON job_status TO anon;

CREATE POLICY "Allow public read job_status"
  ON job_status FOR SELECT TO anon USING (true);
CREATE POLICY "Allow admin update job_status"
  ON job_status FOR ALL TO authenticated USING (true);

ALTER TABLE job_status ENABLE ROW LEVEL SECURITY;
