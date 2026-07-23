-- 021_applicant_acceptance_fields.sql
ALTER TABLE public.applicants 
ADD COLUMN IF NOT EXISTS offer_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS parent_signature TEXT;
