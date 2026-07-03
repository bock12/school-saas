-- ============================================================
-- Migration 003: Fix infinite recursion in profiles RLS
-- ============================================================
-- The "School admins can view tenant profiles" policy caused infinite
-- recursion because it both calls get_user_tenant_id() (which reads
-- profiles) AND has an inner EXISTS subquery that also reads profiles.
-- PostgreSQL resolves this by evaluating each policy on access to the
-- table — triggering the policy again — indefinitely.
--
-- Fix:
--   1. Recreate get_user_tenant_id() with SET row_security = OFF so it
--      reads profiles without triggering RLS recursion.
--   2. Drop the recursive EXISTS subquery from the school admin policy
--      and replace it with a simpler, non-recursive version using a
--      security-definer helper function.
-- ============================================================

-- Step 1: Recreate helper functions with row_security = OFF
-- so they can safely read profiles without triggering RLS.

CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
BEGIN
    RETURN (
        SELECT tenant_id FROM public.profiles
        WHERE id = auth.uid()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql;

-- New helper: check if current user is a school_admin (non-recursive)
CREATE OR REPLACE FUNCTION public.is_school_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'school_admin'
    );
END;
$$ LANGUAGE plpgsql;

-- Step 2: Drop the recursive school-admin profile policy and replace it
DROP POLICY IF EXISTS "School admins can view tenant profiles" ON public.profiles;

CREATE POLICY "School admins can view tenant profiles"
    ON public.profiles FOR SELECT TO authenticated
    USING (
        tenant_id = public.get_user_tenant_id()
        AND public.is_school_admin()
    );
