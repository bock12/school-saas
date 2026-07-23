-- 024_applicant_payment_details_enhancements.sql
ALTER TABLE public.applicants 
ADD COLUMN IF NOT EXISTS payment_phone TEXT,
ADD COLUMN IF NOT EXISTS transaction_id TEXT;
