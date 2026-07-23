-- ============================================================
-- Migration: Force Password Reset Flag
-- ============================================================

-- Add requires_password_change flag to public.profiles
DO $$ BEGIN
    ALTER TABLE public.profiles ADD COLUMN requires_password_change BOOLEAN DEFAULT FALSE;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
