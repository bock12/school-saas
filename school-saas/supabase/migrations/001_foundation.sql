-- ============================================================
-- FOUNDATION MIGRATION: Multi-Tenant School SaaS
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('super_admin', 'school_admin', 'teacher', 'student', 'parent');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE tenant_status AS ENUM ('active', 'suspended', 'past_due', 'trial', 'deleted');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE plan_interval AS ENUM ('monthly', 'yearly');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- GLOBAL TABLES (No tenant_id — Platform-level)
-- ============================================================

-- 3. Subscription Plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    price_monthly NUMERIC(10,2) NOT NULL DEFAULT 0,
    price_yearly NUMERIC(10,2),
    max_students INTEGER NOT NULL DEFAULT 100,
    max_teachers INTEGER NOT NULL DEFAULT 20,
    max_storage_gb INTEGER NOT NULL DEFAULT 5,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Tenants (Schools)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    domain TEXT UNIQUE,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#6366f1',
    plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
    status tenant_status DEFAULT 'trial' NOT NULL,
    subscription_start TIMESTAMPTZ,
    subscription_end TIMESTAMPTZ,
    trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    city TEXT,
    country TEXT,
    timezone TEXT DEFAULT 'UTC',
    max_students INTEGER DEFAULT 100,
    max_teachers INTEGER DEFAULT 20,
    student_count INTEGER DEFAULT 0,
    teacher_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. User Profiles (Multi-tenant)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'student',
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Audit Logs (Global — tracks all major platform events)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Global Broadcasts (Super Admin → All Tenants)
CREATE TABLE IF NOT EXISTS public.broadcasts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'critical', 'maintenance')),
    is_active BOOLEAN DEFAULT true,
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    ends_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. Coupons / Promotions
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_percent INTEGER CHECK (discount_percent BETWEEN 1 AND 100),
    discount_amount NUMERIC(10,2),
    max_uses INTEGER DEFAULT 1,
    times_used INTEGER DEFAULT 0,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON public.profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON public.tenants(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON public.audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Check if current user is a Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql;

-- Get current user's tenant_id
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN (
        SELECT tenant_id FROM public.profiles
        WHERE id = auth.uid()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS set_updated_at_subscription_plans ON public.subscription_plans;
CREATE TRIGGER set_updated_at_subscription_plans
    BEFORE UPDATE ON public.subscription_plans
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_tenants ON public.tenants;
CREATE TRIGGER set_updated_at_tenants
    BEFORE UPDATE ON public.tenants
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- SUBSCRIPTION PLANS
CREATE POLICY "Super admins manage subscription plans"
    ON public.subscription_plans FOR ALL TO authenticated
    USING (public.is_super_admin());

CREATE POLICY "Anyone can view active plans"
    ON public.subscription_plans FOR SELECT TO authenticated
    USING (is_active = true);

-- TENANTS
CREATE POLICY "Super admins manage all tenants"
    ON public.tenants FOR ALL TO authenticated
    USING (public.is_super_admin());

CREATE POLICY "Users can view their own tenant"
    ON public.tenants FOR SELECT TO authenticated
    USING (id = public.get_user_tenant_id());

-- PROFILES
CREATE POLICY "Super admins manage all profiles"
    ON public.profiles FOR ALL TO authenticated
    USING (public.is_super_admin());

CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT TO authenticated
    USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE TO authenticated
    USING (id = auth.uid());

CREATE POLICY "School admins can view tenant profiles"
    ON public.profiles FOR SELECT TO authenticated
    USING (
        tenant_id = public.get_user_tenant_id()
        AND EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'school_admin'
        )
    );

-- AUDIT LOGS
CREATE POLICY "Super admins can view all audit logs"
    ON public.audit_logs FOR SELECT TO authenticated
    USING (public.is_super_admin());

CREATE POLICY "School admins can view own tenant audit logs"
    ON public.audit_logs FOR SELECT TO authenticated
    USING (
        tenant_id = public.get_user_tenant_id()
        AND EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'school_admin'
        )
    );

CREATE POLICY "Authenticated users can insert audit logs"
    ON public.audit_logs FOR INSERT TO authenticated
    WITH CHECK (true);

-- BROADCASTS
CREATE POLICY "Super admins manage broadcasts"
    ON public.broadcasts FOR ALL TO authenticated
    USING (public.is_super_admin());

CREATE POLICY "All users can view active broadcasts"
    ON public.broadcasts FOR SELECT TO authenticated
    USING (is_active = true AND starts_at <= NOW() AND (ends_at IS NULL OR ends_at >= NOW()));

-- COUPONS
CREATE POLICY "Super admins manage coupons"
    ON public.coupons FOR ALL TO authenticated
    USING (public.is_super_admin());

-- ============================================================
-- SEED DATA: Default Subscription Plans
-- ============================================================
INSERT INTO public.subscription_plans (name, description, price_monthly, price_yearly, max_students, max_teachers, max_storage_gb, features, sort_order) VALUES
('Starter', 'Perfect for small schools getting started', 29.00, 290.00, 100, 10, 2, '["Basic Reports", "Email Support", "1 Admin"]'::jsonb, 1),
('Professional', 'For growing schools needing more power', 79.00, 790.00, 500, 50, 10, '["Advanced Reports", "Priority Support", "5 Admins", "SMS Notifications", "Custom Branding"]'::jsonb, 2),
('Enterprise', 'Full-featured solution for large institutions', 199.00, 1990.00, 5000, 500, 100, '["All Features", "Dedicated Support", "Unlimited Admins", "API Access", "Custom Domain", "SLA Guarantee"]'::jsonb, 3)
ON CONFLICT (name) DO NOTHING;
