-- Migration: Add org_admin to user_role ENUM
-- Run this in the Supabase SQL Editor or via supabase db push

-- Postgres requires a special syntax to alter enums. We use a DO block to prevent errors if it already exists.
DO $$ 
BEGIN
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'org_admin';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
