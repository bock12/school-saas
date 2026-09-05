-- ============================================================
-- MIGRATION 046: Fix RLS Boundaries, Tenant Isolation & Exam Security
-- Remediates permissive policies, enables table-specific RLS,
-- protects user profiles, and enforces active-status checks.
-- ============================================================

-- 1. HARDEN SECURITY HELPER FUNCTIONS WITH ACTIVE-STATUS VERIFICATION
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
BEGIN
    RETURN (
        SELECT tenant_id FROM public.profiles
        WHERE id = auth.uid() AND is_active = true
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql;

REVOKE EXECUTE ON FUNCTION public.get_user_tenant_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_tenant_id() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'super_admin' AND is_active = true
    );
END;
$$ LANGUAGE plpgsql;

REVOKE EXECUTE ON FUNCTION public.is_super_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.is_school_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'school_admin' AND is_active = true
    );
END;
$$ LANGUAGE plpgsql;

REVOKE EXECUTE ON FUNCTION public.is_school_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_school_admin() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.is_org_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'org_admin' AND is_active = true
    );
END;
$$ LANGUAGE plpgsql;

REVOKE EXECUTE ON FUNCTION public.is_org_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_org_admin() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'teacher' AND is_active = true
    );
END;
$$ LANGUAGE plpgsql;

REVOKE EXECUTE ON FUNCTION public.is_teacher() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_teacher() TO authenticated, service_role;

-- 2. REMEDIATE PUBLIC.TENANTS RLS
-- ------------------------------------------------------------
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Prototype allow all" ON public.tenants;

-- 3. PROFILE PROTECTION: TRIGGER & RLS
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Allow service_role, direct database administration (auth.uid() IS NULL), or super_admin
    IF auth.role() = 'service_role' OR auth.uid() IS NULL OR public.is_super_admin() THEN
        RETURN NEW;
    END IF;

    -- Ordinary authenticated users cannot modify role, tenant_id, or is_active
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        RAISE EXCEPTION 'Unauthorized: cannot change user role' USING ERRCODE = '42501';
    END IF;

    IF NEW.tenant_id IS DISTINCT FROM OLD.tenant_id THEN
        RAISE EXCEPTION 'Unauthorized: cannot change tenant_id' USING ERRCODE = '42501';
    END IF;

    IF NEW.is_active IS DISTINCT FROM OLD.is_active THEN
        RAISE EXCEPTION 'Unauthorized: cannot change is_active status' USING ERRCODE = '42501';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_profile_mutations ON public.profiles;
CREATE TRIGGER trg_protect_profile_mutations
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_profile_fields();

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE TO authenticated
    USING (id = auth.uid() AND is_active = true)
    WITH CHECK (
        id = auth.uid()
        AND (tenant_id = public.get_user_tenant_id() OR tenant_id IS NULL)
    );

-- 4. HARDEN APPLICANTS RLS
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Users can update applicants for their tenant" ON public.applicants;
CREATE POLICY "Users can update applicants for their tenant" ON public.applicants
    FOR UPDATE TO authenticated
    USING (
        tenant_id = public.get_user_tenant_id() OR (
            public.is_org_admin() AND tenant_id IN (
                SELECT id FROM public.tenants WHERE parent_id = public.get_user_tenant_id()
            )
        )
    )
    WITH CHECK (
        tenant_id = public.get_user_tenant_id() OR (
            public.is_org_admin() AND tenant_id IN (
                SELECT id FROM public.tenants WHERE parent_id = public.get_user_tenant_id()
            )
        )
    );

-- 5. REMEDIATE EXAM CORE SYSTEM TABLES
-- ------------------------------------------------------------
ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results_approval ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_malpractices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_appeals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated access to exam_sessions" ON public.exam_sessions;
DROP POLICY IF EXISTS "Allow authenticated access to exam_schedules" ON public.exam_schedules;
DROP POLICY IF EXISTS "Allow authenticated access to exam_results_approval" ON public.exam_results_approval;
DROP POLICY IF EXISTS "Allow authenticated access to exam_malpractices" ON public.exam_malpractices;
DROP POLICY IF EXISTS "Allow authenticated access to exam_appeals" ON public.exam_appeals;

-- EXAM SESSIONS
DROP POLICY IF EXISTS "Tenant users view exam_sessions" ON public.exam_sessions;
CREATE POLICY "Tenant users view exam_sessions" ON public.exam_sessions
    FOR SELECT TO authenticated
    USING (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS "Admins manage exam_sessions" ON public.exam_sessions;
CREATE POLICY "Admins manage exam_sessions" ON public.exam_sessions
    FOR ALL TO authenticated
    USING (
        tenant_id = public.get_user_tenant_id()
        AND (public.is_school_admin() OR public.is_org_admin() OR public.is_super_admin())
    )
    WITH CHECK (
        tenant_id = public.get_user_tenant_id()
        AND (public.is_school_admin() OR public.is_org_admin() OR public.is_super_admin())
    );

-- EXAM SCHEDULES
DROP POLICY IF EXISTS "Tenant users view exam_schedules" ON public.exam_schedules;
CREATE POLICY "Tenant users view exam_schedules" ON public.exam_schedules
    FOR SELECT TO authenticated
    USING (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS "Admins manage exam_schedules" ON public.exam_schedules;
CREATE POLICY "Admins manage exam_schedules" ON public.exam_schedules
    FOR ALL TO authenticated
    USING (
        tenant_id = public.get_user_tenant_id()
        AND (public.is_school_admin() OR public.is_org_admin() OR public.is_super_admin())
    )
    WITH CHECK (
        tenant_id = public.get_user_tenant_id()
        AND (public.is_school_admin() OR public.is_org_admin() OR public.is_super_admin())
    );

-- EXAM RESULTS APPROVAL (Privileged examination workflow data)
DROP POLICY IF EXISTS "Staff view exam_results_approval" ON public.exam_results_approval;
CREATE POLICY "Staff view exam_results_approval" ON public.exam_results_approval
    FOR SELECT TO authenticated
    USING (
        tenant_id = public.get_user_tenant_id()
        AND (public.is_school_admin() OR public.is_org_admin() OR public.is_super_admin() OR public.is_teacher())
    );

DROP POLICY IF EXISTS "Teachers and admins insert exam_results_approval" ON public.exam_results_approval;
CREATE POLICY "Teachers and admins insert exam_results_approval" ON public.exam_results_approval
    FOR INSERT TO authenticated
    WITH CHECK (
        tenant_id = public.get_user_tenant_id()
        AND (public.is_school_admin() OR public.is_org_admin() OR public.is_super_admin() OR public.is_teacher())
    );

DROP POLICY IF EXISTS "Admins update exam_results_approval" ON public.exam_results_approval;
CREATE POLICY "Admins update exam_results_approval" ON public.exam_results_approval
    FOR UPDATE TO authenticated
    USING (
        tenant_id = public.get_user_tenant_id()
        AND (public.is_school_admin() OR public.is_org_admin() OR public.is_super_admin())
    )
    WITH CHECK (
        tenant_id = public.get_user_tenant_id()
        AND (public.is_school_admin() OR public.is_org_admin() OR public.is_super_admin())
    );

DROP POLICY IF EXISTS "Admins delete exam_results_approval" ON public.exam_results_approval;
CREATE POLICY "Admins delete exam_results_approval" ON public.exam_results_approval
    FOR DELETE TO authenticated
    USING (
        tenant_id = public.get_user_tenant_id()
        AND (public.is_school_admin() OR public.is_org_admin() OR public.is_super_admin())
    );

-- EXAM MALPRACTICES (Sensitive disciplinary data)
DROP POLICY IF EXISTS "Staff view exam_malpractices" ON public.exam_malpractices;
CREATE POLICY "Staff view exam_malpractices" ON public.exam_malpractices
    FOR SELECT TO authenticated
    USING (
        tenant_id = public.get_user_tenant_id()
        AND (public.is_school_admin() OR public.is_org_admin() OR public.is_super_admin() OR public.is_teacher())
    );

DROP POLICY IF EXISTS "Staff insert exam_malpractices" ON public.exam_malpractices;
CREATE POLICY "Staff insert exam_malpractices" ON public.exam_malpractices
    FOR INSERT TO authenticated
    WITH CHECK (
        tenant_id = public.get_user_tenant_id()
        AND (public.is_school_admin() OR public.is_org_admin() OR public.is_super_admin() OR public.is_teacher())
    );

DROP POLICY IF EXISTS "Admins manage exam_malpractices" ON public.exam_malpractices;
CREATE POLICY "Admins manage exam_malpractices" ON public.exam_malpractices
    FOR ALL TO authenticated
    USING (
        tenant_id = public.get_user_tenant_id()
        AND (public.is_school_admin() OR public.is_org_admin() OR public.is_super_admin())
    )
    WITH CHECK (
        tenant_id = public.get_user_tenant_id()
        AND (public.is_school_admin() OR public.is_org_admin() OR public.is_super_admin())
    );

-- EXAM APPEALS (Student dispute / administrative review workflow)
DROP POLICY IF EXISTS "Staff view exam_appeals" ON public.exam_appeals;
CREATE POLICY "Staff view exam_appeals" ON public.exam_appeals
    FOR SELECT TO authenticated
    USING (
        tenant_id = public.get_user_tenant_id()
        AND (public.is_school_admin() OR public.is_org_admin() OR public.is_super_admin() OR public.is_teacher())
    );

DROP POLICY IF EXISTS "Tenant users insert exam_appeals" ON public.exam_appeals;
CREATE POLICY "Tenant users insert exam_appeals" ON public.exam_appeals
    FOR INSERT TO authenticated
    WITH CHECK (
        tenant_id = public.get_user_tenant_id()
    );

DROP POLICY IF EXISTS "Admins manage exam_appeals" ON public.exam_appeals;
CREATE POLICY "Admins manage exam_appeals" ON public.exam_appeals
    FOR UPDATE TO authenticated
    USING (
        tenant_id = public.get_user_tenant_id()
        AND (public.is_school_admin() OR public.is_org_admin() OR public.is_super_admin())
    )
    WITH CHECK (
        tenant_id = public.get_user_tenant_id()
        AND (public.is_school_admin() OR public.is_org_admin() OR public.is_super_admin())
    );

DROP POLICY IF EXISTS "Admins delete exam_appeals" ON public.exam_appeals;
CREATE POLICY "Admins delete exam_appeals" ON public.exam_appeals
    FOR DELETE TO authenticated
    USING (
        tenant_id = public.get_user_tenant_id()
        AND (public.is_school_admin() OR public.is_org_admin() OR public.is_super_admin())
    );

-- 6. REMEDIATE EXAM ANALYTICS DASHBOARD TABLES (DERIVED SNAPSHOTS: READ-ONLY TO TENANT USERS)
-- ------------------------------------------------------------
ALTER TABLE public.exam_student_spotlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_grade_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_student_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_subject_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_subject_averages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_class_gender_counts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated access to exam_student_spotlights" ON public.exam_student_spotlights;
DROP POLICY IF EXISTS "Allow authenticated access to exam_grade_distributions" ON public.exam_grade_distributions;
DROP POLICY IF EXISTS "Allow authenticated access to exam_student_details" ON public.exam_student_details;
DROP POLICY IF EXISTS "Allow authenticated access to exam_subject_results" ON public.exam_subject_results;
DROP POLICY IF EXISTS "Allow authenticated access to exam_subject_averages" ON public.exam_subject_averages;
DROP POLICY IF EXISTS "Allow authenticated access to exam_class_gender_counts" ON public.exam_class_gender_counts;

-- READ-ONLY POLICIES FOR TENANT USERS
DROP POLICY IF EXISTS "Tenant users view exam_student_spotlights" ON public.exam_student_spotlights;
CREATE POLICY "Tenant users view exam_student_spotlights" ON public.exam_student_spotlights
    FOR SELECT TO authenticated USING (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS "Tenant users view exam_grade_distributions" ON public.exam_grade_distributions;
CREATE POLICY "Tenant users view exam_grade_distributions" ON public.exam_grade_distributions
    FOR SELECT TO authenticated USING (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS "Tenant users view exam_student_details" ON public.exam_student_details;
CREATE POLICY "Tenant users view exam_student_details" ON public.exam_student_details
    FOR SELECT TO authenticated USING (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS "Tenant users view exam_subject_results" ON public.exam_subject_results;
CREATE POLICY "Tenant users view exam_subject_results" ON public.exam_subject_results
    FOR SELECT TO authenticated USING (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS "Tenant users view exam_subject_averages" ON public.exam_subject_averages;
CREATE POLICY "Tenant users view exam_subject_averages" ON public.exam_subject_averages
    FOR SELECT TO authenticated USING (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS "Tenant users view exam_class_gender_counts" ON public.exam_class_gender_counts;
CREATE POLICY "Tenant users view exam_class_gender_counts" ON public.exam_class_gender_counts
    FOR SELECT TO authenticated USING (tenant_id = public.get_user_tenant_id());

-- SUPER ADMIN / SERVICE ROLE MANAGEMENT OF DERIVED SNAPSHOTS
DROP POLICY IF EXISTS "Super admins manage exam_student_spotlights" ON public.exam_student_spotlights;
CREATE POLICY "Super admins manage exam_student_spotlights" ON public.exam_student_spotlights
    FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "Super admins manage exam_grade_distributions" ON public.exam_grade_distributions;
CREATE POLICY "Super admins manage exam_grade_distributions" ON public.exam_grade_distributions
    FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "Super admins manage exam_student_details" ON public.exam_student_details;
CREATE POLICY "Super admins manage exam_student_details" ON public.exam_student_details
    FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "Super admins manage exam_subject_results" ON public.exam_subject_results;
CREATE POLICY "Super admins manage exam_subject_results" ON public.exam_subject_results
    FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "Super admins manage exam_subject_averages" ON public.exam_subject_averages;
CREATE POLICY "Super admins manage exam_subject_averages" ON public.exam_subject_averages
    FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "Super admins manage exam_class_gender_counts" ON public.exam_class_gender_counts;
CREATE POLICY "Super admins manage exam_class_gender_counts" ON public.exam_class_gender_counts
    FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- 7. REMEDIATE NOTIFICATION / COMMUNICATION TABLES WITH RECIPIENT-OWNERSHIP
-- ------------------------------------------------------------
-- Non-recursive helper to fetch recipient notification IDs with row_security = off
CREATE OR REPLACE FUNCTION public.get_user_recipient_notification_ids()
RETURNS SETOF UUID
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
BEGIN
    RETURN QUERY
    SELECT notification_id FROM public.notification_recipients
    WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql;

REVOKE EXECUTE ON FUNCTION public.get_user_recipient_notification_ids() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_recipient_notification_ids() TO authenticated, service_role;

ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_events ENABLE ROW LEVEL SECURITY;

-- NOTIFICATION TEMPLATES
DROP POLICY IF EXISTS "Tenant users view notification_templates" ON public.notification_templates;
CREATE POLICY "Tenant users view notification_templates" ON public.notification_templates
    FOR SELECT TO authenticated
    USING (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS "Admins manage notification_templates" ON public.notification_templates;
CREATE POLICY "Admins manage notification_templates" ON public.notification_templates
    FOR ALL TO authenticated
    USING (
        tenant_id = public.get_user_tenant_id()
        AND (public.is_school_admin() OR public.is_org_admin() OR public.is_super_admin())
    )
    WITH CHECK (
        tenant_id = public.get_user_tenant_id()
        AND (public.is_school_admin() OR public.is_org_admin() OR public.is_super_admin())
    );

-- NOTIFICATIONS (Master records)
DROP POLICY IF EXISTS "Users view relevant notifications" ON public.notifications;
CREATE POLICY "Users view relevant notifications" ON public.notifications
    FOR SELECT TO authenticated
    USING (
        tenant_id = public.get_user_tenant_id()
        AND (
            public.is_school_admin()
            OR public.is_org_admin()
            OR public.is_super_admin()
            OR id IN (SELECT public.get_user_recipient_notification_ids())
        )
    );

DROP POLICY IF EXISTS "Admins manage notifications" ON public.notifications;
CREATE POLICY "Admins manage notifications" ON public.notifications
    FOR ALL TO authenticated
    USING (
        tenant_id = public.get_user_tenant_id()
        AND (public.is_school_admin() OR public.is_org_admin() OR public.is_super_admin())
    )
    WITH CHECK (
        tenant_id = public.get_user_tenant_id()
        AND (public.is_school_admin() OR public.is_org_admin() OR public.is_super_admin())
    );

-- NOTIFICATION RECIPIENTS (Recipient Ownership)
DROP POLICY IF EXISTS "Recipients and admins view notification_recipients" ON public.notification_recipients;
CREATE POLICY "Recipients and admins view notification_recipients" ON public.notification_recipients
    FOR SELECT TO authenticated
    USING (
        user_id = auth.uid()
        OR (
            (public.is_school_admin() OR public.is_org_admin() OR public.is_super_admin())
            AND EXISTS (
                SELECT 1 FROM public.notifications n
                WHERE n.id = notification_recipients.notification_id
                AND n.tenant_id = public.get_user_tenant_id()
            )
        )
    );

DROP POLICY IF EXISTS "Recipients update own recipient status" ON public.notification_recipients;
CREATE POLICY "Recipients update own recipient status" ON public.notification_recipients
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage notification_recipients" ON public.notification_recipients;
CREATE POLICY "Admins manage notification_recipients" ON public.notification_recipients
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.notifications n
            WHERE n.id = notification_recipients.notification_id
            AND n.tenant_id = public.get_user_tenant_id()
            AND (public.is_school_admin() OR public.is_org_admin() OR public.is_super_admin())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.notifications n
            WHERE n.id = notification_recipients.notification_id
            AND n.tenant_id = public.get_user_tenant_id()
            AND (public.is_school_admin() OR public.is_org_admin() OR public.is_super_admin())
        )
    );

-- NOTIFICATION RULES
DROP POLICY IF EXISTS "Admins manage notification_rules" ON public.notification_rules;
CREATE POLICY "Admins manage notification_rules" ON public.notification_rules
    FOR ALL TO authenticated
    USING (
        tenant_id = public.get_user_tenant_id()
        AND (public.is_school_admin() OR public.is_org_admin() OR public.is_super_admin())
    )
    WITH CHECK (
        tenant_id = public.get_user_tenant_id()
        AND (public.is_school_admin() OR public.is_org_admin() OR public.is_super_admin())
    );

-- NOTIFICATION DELIVERIES (Multi-channel logs)
DROP POLICY IF EXISTS "Admins view notification_deliveries" ON public.notification_deliveries;
CREATE POLICY "Admins view notification_deliveries" ON public.notification_deliveries
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.notifications n
            WHERE n.id = notification_deliveries.notification_id
            AND n.tenant_id = public.get_user_tenant_id()
            AND (public.is_school_admin() OR public.is_org_admin() OR public.is_super_admin())
        )
    );

-- NOTIFICATION EVENTS (Audit log)
DROP POLICY IF EXISTS "Admins view notification_events" ON public.notification_events;
CREATE POLICY "Admins view notification_events" ON public.notification_events
    FOR SELECT TO authenticated
    USING (
        tenant_id = public.get_user_tenant_id()
        AND (public.is_school_admin() OR public.is_org_admin() OR public.is_super_admin())
    );
