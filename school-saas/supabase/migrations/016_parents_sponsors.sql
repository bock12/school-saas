-- ============================================================
-- Migration 016: Parents & Sponsors Module
-- ============================================================

-- 1. Create Parents table
CREATE TABLE IF NOT EXISTS public.parents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    occupation TEXT,
    address TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Create student_parents junction table
CREATE TABLE IF NOT EXISTS public.student_parents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES public.parents(id) ON DELETE CASCADE,
    relationship TEXT NOT NULL, -- e.g., 'Father', 'Mother', 'Guardian', 'Sponsor'
    is_primary BOOLEAN DEFAULT false,
    is_emergency_contact BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(student_id, parent_id)
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_parents_tenant_id ON public.parents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_student_parents_tenant_id ON public.student_parents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_student_parents_student_id ON public.student_parents(student_id);
CREATE INDEX IF NOT EXISTS idx_student_parents_parent_id ON public.student_parents(parent_id);

-- 4. Triggers
DROP TRIGGER IF EXISTS set_updated_at_parents ON public.parents;
CREATE TRIGGER set_updated_at_parents
    BEFORE UPDATE ON public.parents
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. RLS Policies
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_parents ENABLE ROW LEVEL SECURITY;

-- Parents RLS
CREATE POLICY "Users can view parents for their tenant" ON public.parents
    FOR SELECT USING (
        tenant_id = public.get_user_tenant_id() OR (
            public.is_org_admin() AND tenant_id IN (
                SELECT id FROM public.tenants WHERE parent_id = public.get_user_tenant_id()
            )
        )
    );

CREATE POLICY "Users can insert parents for their tenant" ON public.parents
    FOR INSERT WITH CHECK (
        tenant_id = public.get_user_tenant_id() OR (
            public.is_org_admin() AND tenant_id IN (
                SELECT id FROM public.tenants WHERE parent_id = public.get_user_tenant_id()
            )
        )
    );

CREATE POLICY "Users can update parents for their tenant" ON public.parents
    FOR UPDATE USING (
        tenant_id = public.get_user_tenant_id() OR (
            public.is_org_admin() AND tenant_id IN (
                SELECT id FROM public.tenants WHERE parent_id = public.get_user_tenant_id()
            )
        )
    );

CREATE POLICY "Users can delete parents for their tenant" ON public.parents
    FOR DELETE USING (
        tenant_id = public.get_user_tenant_id() OR (
            public.is_org_admin() AND tenant_id IN (
                SELECT id FROM public.tenants WHERE parent_id = public.get_user_tenant_id()
            )
        )
    );

-- Student Parents RLS
CREATE POLICY "Users can view student_parents for their tenant" ON public.student_parents
    FOR SELECT USING (
        tenant_id = public.get_user_tenant_id() OR (
            public.is_org_admin() AND tenant_id IN (
                SELECT id FROM public.tenants WHERE parent_id = public.get_user_tenant_id()
            )
        )
    );

CREATE POLICY "Users can insert student_parents for their tenant" ON public.student_parents
    FOR INSERT WITH CHECK (
        tenant_id = public.get_user_tenant_id() OR (
            public.is_org_admin() AND tenant_id IN (
                SELECT id FROM public.tenants WHERE parent_id = public.get_user_tenant_id()
            )
        )
    );

CREATE POLICY "Users can update student_parents for their tenant" ON public.student_parents
    FOR UPDATE USING (
        tenant_id = public.get_user_tenant_id() OR (
            public.is_org_admin() AND tenant_id IN (
                SELECT id FROM public.tenants WHERE parent_id = public.get_user_tenant_id()
            )
        )
    );

CREATE POLICY "Users can delete student_parents for their tenant" ON public.student_parents
    FOR DELETE USING (
        tenant_id = public.get_user_tenant_id() OR (
            public.is_org_admin() AND tenant_id IN (
                SELECT id FROM public.tenants WHERE parent_id = public.get_user_tenant_id()
            )
        )
    );
