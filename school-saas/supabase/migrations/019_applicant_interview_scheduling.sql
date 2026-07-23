-- 019_applicant_interview_scheduling.sql
ALTER TABLE public.applicants 
ADD COLUMN IF NOT EXISTS interview_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS interview_location TEXT;
