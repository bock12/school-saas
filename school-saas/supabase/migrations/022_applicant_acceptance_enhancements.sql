-- 022_applicant_acceptance_enhancements.sql
ALTER TABLE public.applicants 
ADD COLUMN IF NOT EXISTS offer_expiration_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS fee_breakdown JSONB,
ADD COLUMN IF NOT EXISTS policy_agreements JSONB;
