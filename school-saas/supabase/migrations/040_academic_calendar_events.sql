-- ============================================================
-- 040_academic_calendar_events.sql
-- Academic Calendar Events Table & Indexes
-- ============================================================

CREATE TABLE IF NOT EXISTS public.academic_calendar_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
    term_id UUID REFERENCES public.terms(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'Academic', -- 'Academic', 'Holiday', 'Examinations', 'Meeting', 'Sports', 'Administrative'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    is_all_day BOOLEAN DEFAULT true,
    location TEXT,
    audience TEXT DEFAULT 'all', -- 'all', 'students', 'teachers', 'parents', 'staff'
    is_published BOOLEAN DEFAULT true,
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_tenant ON public.academic_calendar_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_year ON public.academic_calendar_events(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_dates ON public.academic_calendar_events(start_date, end_date);

ALTER TABLE public.academic_calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage calendar events" ON public.academic_calendar_events
    FOR ALL TO authenticated USING (public.is_super_admin());

CREATE POLICY "Tenant users view calendar events" ON public.academic_calendar_events
    FOR SELECT TO authenticated USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "School admins manage calendar events" ON public.academic_calendar_events
    FOR ALL TO authenticated USING (
        tenant_id = public.get_user_tenant_id() AND
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() AND r.name IN ('school_admin', 'super_admin', 'org_admin')
        )
    );
