-- Dynamic jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Basic info
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  client text,
  location text,
  job_type text DEFAULT 'Full Time',
  is_remote boolean DEFAULT false,
  compensation text,
  schedule jsonb DEFAULT '[]',

  -- Content
  overview text,
  description text,
  responsibilities jsonb DEFAULT '[]',
  qualifications jsonb DEFAULT '[]',
  success_markers jsonb DEFAULT '[]',
  benefits jsonb DEFAULT '[]',

  -- Trial task (AI generated)
  trial_task_scenario text,
  trial_task_encounter text,
  trial_task_questions jsonb DEFAULT '[]',

  -- Interview guide
  interview_discussion_points jsonb DEFAULT '[]',
  interview_star_questions jsonb DEFAULT '[]',

  -- Status
  is_open boolean DEFAULT true,
  template_source text -- 'scribe', 'optical', or another job id
);

-- RLS
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;

-- Allow admin full access
GRANT ALL ON jobs TO authenticated;
GRANT SELECT ON jobs TO anon;
