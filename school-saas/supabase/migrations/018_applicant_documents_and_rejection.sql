-- 018_applicant_documents_and_rejection.sql
-- Add documents JSONB, status, and rejection_reason columns to applicants table

ALTER TABLE public.applicants
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
