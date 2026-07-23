-- 023_applicant_enrollment_enhancements.sql
ALTER TABLE public.applicants 
ADD COLUMN IF NOT EXISTS payment_cleared BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS receipt_number TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS payment_receipt_url TEXT;
