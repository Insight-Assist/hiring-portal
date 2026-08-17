-- ============================================================
-- Insight Assist Hiring Portal – Supabase Schema
-- Run this in your Supabase SQL Editor to set up the project
-- ============================================================

-- 1. APPLICATIONS TABLE
-- ---------------------------------------------------------------
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  submitted_at timestamptz default now(),

  -- Contact
  full_name text,
  email text,
  phone text,
  country text,
  city_timezone text,
  linkedin_url text,

  -- Eligibility
  can_work_pacific text,
  english_proficiency text,

  -- Experience
  exp_scribing text,
  exp_insurance text,
  exp_billing text,
  exp_admin text,

  -- Short answers
  why_interested text,
  why_good_fit text,

  -- Files
  resume_path text,

  -- Trial task
  trial_task_responses jsonb,
  task_scores jsonb,

  -- Personality assessment
  assessment_answers jsonb,
  personality_dominant text,
  personality_secondary text,
  personality_scores jsonb,

  -- Admin fields
  status text default 'New',
  internal_notes text,
  recommendation text
);

-- 2. ROW LEVEL SECURITY
-- ---------------------------------------------------------------
alter table applications enable row level security;

-- Allow anyone (candidates) to INSERT new applications
create policy "Allow public insert"
  on applications for insert
  to anon
  with check (true);

-- Allow authenticated users (admin) to SELECT all
create policy "Allow admin select"
  on applications for select
  to authenticated
  using (true);

-- Allow authenticated users (admin) to UPDATE
create policy "Allow admin update"
  on applications for update
  to authenticated
  using (true);

-- 3. RESUME STORAGE BUCKET
-- ---------------------------------------------------------------
-- Run this to create the storage bucket:
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', true)
on conflict do nothing;

-- Allow anyone to upload resumes
create policy "Allow public resume upload"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'resumes');

-- Allow authenticated users to read resumes
create policy "Allow admin resume read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'resumes');

-- Also allow public read (for direct URL access)
create policy "Allow public resume read"
  on storage.objects for select
  to anon
  using (bucket_id = 'resumes');
