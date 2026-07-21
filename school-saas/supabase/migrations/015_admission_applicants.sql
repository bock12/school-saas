-- 015_admission_applicants.sql

-- 1. Applicants Table
CREATE TABLE IF NOT EXISTS public.applicants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    dob DATE NOT NULL,
    gender TEXT,
    blood_group TEXT,
    nin TEXT,
    email TEXT,
    phone TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    target_grade TEXT NOT NULL,
    previous_school TEXT,
    parent_name TEXT NOT NULL,
    parent_phone TEXT NOT NULL,
    parent_email TEXT NOT NULL,
    parent_relation TEXT NOT NULL,
    avatar_url TEXT,
    stage TEXT NOT NULL DEFAULT 'Application',
    docs_verified BOOLEAN DEFAULT FALSE,
    interview_score NUMERIC,
    assessment_score NUMERIC,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Admission History Table
CREATE TABLE IF NOT EXISTS public.admission_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES public.applicants(id) ON DELETE CASCADE,
    from_stage TEXT,
    to_stage TEXT NOT NULL,
    comment TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admission_history ENABLE ROW LEVEL SECURITY;

-- Applicants RLS
CREATE POLICY "Users can view applicants for their tenant" ON public.applicants
    FOR SELECT USING (
        tenant_id = public.get_user_tenant_id() OR (
            public.is_org_admin() AND tenant_id IN (
                SELECT id FROM public.tenants WHERE parent_id = public.get_user_tenant_id()
            )
        )
    );

CREATE POLICY "Users can insert applicants for their tenant" ON public.applicants
    FOR INSERT WITH CHECK (
        tenant_id = public.get_user_tenant_id() OR (
            public.is_org_admin() AND tenant_id IN (
                SELECT id FROM public.tenants WHERE parent_id = public.get_user_tenant_id()
            )
        )
    );

CREATE POLICY "Users can update applicants for their tenant" ON public.applicants
    FOR UPDATE USING (
        tenant_id = public.get_user_tenant_id() OR (
            public.is_org_admin() AND tenant_id IN (
                SELECT id FROM public.tenants WHERE parent_id = public.get_user_tenant_id()
            )
        )
    );

CREATE POLICY "Users can delete applicants for their tenant" ON public.applicants
    FOR DELETE USING (
        tenant_id = public.get_user_tenant_id() OR (
            public.is_org_admin() AND tenant_id IN (
                SELECT id FROM public.tenants WHERE parent_id = public.get_user_tenant_id()
            )
        )
    );

-- Admission History RLS
CREATE POLICY "Users can view admission_history for their tenant" ON public.admission_history
    FOR SELECT USING (
        tenant_id = public.get_user_tenant_id() OR (
            public.is_org_admin() AND tenant_id IN (
                SELECT id FROM public.tenants WHERE parent_id = public.get_user_tenant_id()
            )
        )
    );

CREATE POLICY "Users can insert admission_history for their tenant" ON public.admission_history
    FOR INSERT WITH CHECK (
        tenant_id = public.get_user_tenant_id() OR (
            public.is_org_admin() AND tenant_id IN (
                SELECT id FROM public.tenants WHERE parent_id = public.get_user_tenant_id()
            )
        )
    );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_applicants_tenant ON public.applicants(tenant_id);
CREATE INDEX IF NOT EXISTS idx_applicants_stage ON public.applicants(tenant_id, stage);
CREATE INDEX IF NOT EXISTS idx_admission_history_applicant ON public.admission_history(applicant_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger
DROP TRIGGER IF EXISTS update_applicants_updated_at ON public.applicants;
CREATE TRIGGER update_applicants_updated_at
BEFORE UPDATE ON public.applicants
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
