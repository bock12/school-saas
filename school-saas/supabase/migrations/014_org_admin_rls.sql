-- Migration: Add org_admin RLS policies
-- Org admins need to see their own tenant and child schools, as well as profiles in their tenant and child schools.

-- 1. Function to check if current user is an org_admin
CREATE OR REPLACE FUNCTION public.is_org_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'org_admin'
    );
$$;

-- 2. Tenant policies
-- Org admins can view all tenants (their org + child schools) where their tenant_id is the id or the parent_id
CREATE POLICY "Org admins can view their org and child schools"
    ON public.tenants FOR SELECT TO authenticated
    USING (
        public.is_org_admin() AND 
        (id = public.get_user_tenant_id() OR parent_id = public.get_user_tenant_id())
    );

-- 3. Profile policies
-- Org admins can view profiles that belong to their org or any of its child schools
CREATE POLICY "Org admins can view tenant and child school profiles"
    ON public.profiles FOR SELECT TO authenticated
    USING (
        public.is_org_admin() AND (
            tenant_id = public.get_user_tenant_id() OR
            tenant_id IN (
                SELECT id FROM public.tenants WHERE parent_id = public.get_user_tenant_id()
            )
        )
    );
