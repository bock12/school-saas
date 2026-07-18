-- ============================================================
-- Add max_schools to subscription_plans
-- ============================================================

-- 1. Add the max_schools column with a default of 1
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS max_schools INTEGER NOT NULL DEFAULT 1;

-- 2. Update default plans with reasonable limits
UPDATE public.subscription_plans SET max_schools = 1 WHERE name = 'Starter';
UPDATE public.subscription_plans SET max_schools = 3 WHERE name = 'Standard';
UPDATE public.subscription_plans SET max_schools = 10 WHERE name = 'Professional';
UPDATE public.subscription_plans SET max_schools = 50 WHERE name = 'Enterprise';
UPDATE public.subscription_plans SET max_schools = 250 WHERE name = 'Enterprise Plus';

-- Notify postgrest to reload the schema cache
NOTIFY pgrst, 'reload schema';
