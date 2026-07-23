-- 020_applicant_assessment_enhancements.sql
ALTER TABLE public.applicants 
ADD COLUMN IF NOT EXISTS assessment_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS assessment_location TEXT,
ADD COLUMN IF NOT EXISTS assessment_details JSONB;
