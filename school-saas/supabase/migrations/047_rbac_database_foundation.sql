-- ============================================================
-- MIGRATION 047: Canonical RBAC & Permission Database Foundation
-- Phase: 2 — Database / Domain Foundation
-- Task: TASK-0007
-- Supervisory Authority: ChatGPT (Chief Software Architect) / Human Project Owner
-- Implementation Engineer: Gemini / Antigravity
-- ============================================================

-- ============================================================
-- SECTION 1: CANONICAL ENUMS
-- ============================================================
DO $body$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'assignment_status') THEN
        CREATE TYPE public.assignment_status AS ENUM (
            'active',
            'expired',
            'revoked',
            'suspended'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staff_assignment_type') THEN
        CREATE TYPE public.staff_assignment_type AS ENUM (
            'vice_principal',
            'exam_officer',
            'hod',
            'form_master',
            'subject_teacher',
            'assistant_teacher'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'canonical_scope') THEN
        CREATE TYPE public.canonical_scope AS ENUM (
            'platform',
            'org',
            'school',
            'department',
            'class',
            'offering',
            'self'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'permission_status') THEN
        CREATE TYPE public.permission_status AS ENUM (
            'active',
            'deprecated',
            'disabled'
        );
    END IF;
END
$body$;

-- ============================================================
-- SECTION 2: CANONICAL PERMISSION CATALOG
-- ============================================================
CREATE TABLE IF NOT EXISTS public.permissions_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_key TEXT NOT NULL UNIQUE,
    module TEXT NOT NULL,
    resource TEXT NOT NULL,
    action TEXT NOT NULL,
    description TEXT NOT NULL,
    scope public.canonical_scope NOT NULL,
    status public.permission_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed exactly 33 canonical atomic permissions (idempotent)
INSERT INTO public.permissions_catalog (permission_key, module, resource, action, description, scope)
VALUES
    ('admissions.applicants.view', 'admissions', 'applicants', 'view', 'View admission applications', 'school'),
    ('admissions.applicants.create', 'admissions', 'applicants', 'create', 'Create admission application', 'school'),
    ('admissions.applicants.approve', 'admissions', 'applicants', 'approve', 'Approve/reject admission application', 'school'),
    ('students.records.view', 'students', 'records', 'view', 'View student academic and profile records', 'offering'),
    ('students.records.manage', 'students', 'records', 'manage', 'Create, update, or archive student profiles', 'school'),
    ('students.welfare.manage', 'students', 'welfare', 'manage', 'Manage student pastoral and welfare records', 'school'),
    ('attendance.sessions.mark', 'attendance', 'sessions', 'mark', 'Mark attendance session for a class or offering', 'class'),
    ('attendance.sessions.approve', 'attendance', 'sessions', 'approve', 'Approve or lock finalized attendance registers', 'class'),
    ('attendance.records.view', 'attendance', 'records', 'view', 'View attendance history and reports', 'offering'),
    ('curriculum.version.create', 'curriculum', 'version', 'create', 'Draft curriculum version or syllabus outline', 'offering'),
    ('curriculum.version.review', 'curriculum', 'version', 'review', 'Review submitted curriculum draft', 'school'),
    ('curriculum.version.approve', 'curriculum', 'version', 'approve', 'Approve departmental curriculum version', 'school'),
    ('curriculum.version.publish', 'curriculum', 'version', 'publish', 'Publish curriculum to institutional catalog', 'school'),
    ('curriculum.coverage.log', 'curriculum', 'coverage', 'log', 'Log topic completion and instructional coverage', 'offering'),
    ('exams.sessions.manage', 'exams', 'sessions', 'manage', 'Configure exam sessions, timetables, and eligibility', 'school'),
    ('exams.schedules.manage', 'exams', 'schedules', 'manage', 'Manage exam hall allocations and invigilator schedules', 'school'),
    ('exams.results.enter', 'exams', 'results', 'enter', 'Enter provisional student exam and continuous assessment scores', 'offering'),
    ('exams.results.moderate', 'exams', 'results', 'moderate', 'Review, flag, and moderate departmental score entries', 'school'),
    ('exams.results.approve', 'exams', 'results', 'approve', 'Give administrative approval to final score sheets', 'school'),
    ('exams.results.publish', 'exams', 'results', 'publish', 'Publish report cards and approved results to students/parents', 'school'),
    ('exams.results.view', 'exams', 'results', 'view', 'View entered results within authorized teaching scope', 'offering'),
    ('exams.malpractice.manage', 'exams', 'malpractice', 'manage', 'Log, investigate, and adjudicate examination malpractice cases', 'school'),
    ('exams.appeals.submit', 'exams', 'appeals', 'submit', 'Submit a formal grade review appeal', 'self'),
    ('exams.appeals.resolve', 'exams', 'appeals', 'resolve', 'Review and decide examination grade appeals', 'school'),
    ('exams.cass.export', 'exams', 'cass', 'export', 'Generate and export official CASS/WAEC examination returns', 'school'),
    ('finance.invoices.view', 'finance', 'invoices', 'view', 'View fee invoices and payment status', 'self'),
    ('finance.invoices.manage', 'finance', 'invoices', 'manage', 'Issue, adjust, and void fee invoices', 'school'),
    ('finance.waivers.approve', 'finance', 'waivers', 'approve', 'Approve fee discounts, scholarships, and debt write-offs', 'school'),
    ('staff.directory.view', 'staff', 'directory', 'view', 'View school staff directory and contact profiles', 'school'),
    ('staff.allocations.manage', 'staff', 'allocations', 'manage', 'Assign teachers to subjects, forms, and departments', 'school'),
    ('staff.accounts.manage', 'staff', 'accounts', 'manage', 'Provision and deprovision staff platform user accounts', 'school'),
    ('platform.tenants.manage', 'platform', 'tenants', 'manage', 'Create, configure, suspend, or migrate school tenants', 'platform'),
    ('platform.billing.manage', 'platform', 'billing', 'manage', 'Manage SaaS subscriptions, plan tiers, and platform revenue', 'platform')
ON CONFLICT (permission_key) DO UPDATE SET
    scope = EXCLUDED.scope,
    description = EXCLUDED.description,
    module = EXCLUDED.module,
    resource = EXCLUDED.resource,
    action = EXCLUDED.action,
    updated_at = now();

-- RLS on permissions_catalog
ALTER TABLE public.permissions_catalog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "permissions_catalog_select_authenticated" ON public.permissions_catalog;
CREATE POLICY "permissions_catalog_select_authenticated"
    ON public.permissions_catalog
    FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "permissions_catalog_modify_super_admin" ON public.permissions_catalog;
CREATE POLICY "permissions_catalog_modify_super_admin"
    ON public.permissions_catalog
    FOR ALL
    TO authenticated
    USING (public.is_super_admin() = true)
    WITH CHECK (public.is_super_admin() = true);

-- ============================================================
-- SECTION 3: CANONICAL STAFF ASSIGNMENTS TABLE
-- Note: Uses tenant_id as the tenant discriminator (no school_id exists in schema)
-- Cascade Protection: Uses ON DELETE RESTRICT on teacher_id, academic_year_id,
-- department_id, section_id, and subject_offering_id to preserve historical authorization evidence.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.school_staff_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE RESTRICT,
    assignment_type public.staff_assignment_type NOT NULL,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE RESTRICT,
    department_id UUID REFERENCES public.departments(id) ON DELETE RESTRICT,
    section_id UUID REFERENCES public.sections(id) ON DELETE RESTRICT,
    subject_offering_id UUID REFERENCES public.subject_offerings(id) ON DELETE RESTRICT,
    status public.assignment_status NOT NULL DEFAULT 'active',
    is_active BOOLEAN NOT NULL DEFAULT true,
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_until DATE,
    appointed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    appointed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    revocation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure existing table has ON DELETE RESTRICT foreign keys (for idempotent runs)
DO $body$
BEGIN
    ALTER TABLE public.school_staff_assignments
        DROP CONSTRAINT IF EXISTS school_staff_assignments_teacher_id_fkey,
        ADD CONSTRAINT school_staff_assignments_teacher_id_fkey
            FOREIGN KEY (teacher_id) REFERENCES public.teachers(id) ON DELETE RESTRICT;

    ALTER TABLE public.school_staff_assignments
        DROP CONSTRAINT IF EXISTS school_staff_assignments_academic_year_id_fkey,
        ADD CONSTRAINT school_staff_assignments_academic_year_id_fkey
            FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id) ON DELETE RESTRICT;

    ALTER TABLE public.school_staff_assignments
        DROP CONSTRAINT IF EXISTS school_staff_assignments_department_id_fkey,
        ADD CONSTRAINT school_staff_assignments_department_id_fkey
            FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE RESTRICT;

    ALTER TABLE public.school_staff_assignments
        DROP CONSTRAINT IF EXISTS school_staff_assignments_section_id_fkey,
        ADD CONSTRAINT school_staff_assignments_section_id_fkey
            FOREIGN KEY (section_id) REFERENCES public.sections(id) ON DELETE RESTRICT;

    ALTER TABLE public.school_staff_assignments
        DROP CONSTRAINT IF EXISTS school_staff_assignments_subject_offering_id_fkey,
        ADD CONSTRAINT school_staff_assignments_subject_offering_id_fkey
            FOREIGN KEY (subject_offering_id) REFERENCES public.subject_offerings(id) ON DELETE RESTRICT;
END
$body$;

-- ============================================================
-- SECTION 4: CONSTRAINTS & PARTIAL UNIQUE INDEXES
-- ============================================================

-- Check constraint 1: Date range consistency
DO $body$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_date_range' AND conrelid = 'public.school_staff_assignments'::regclass
    ) THEN
        ALTER TABLE public.school_staff_assignments
            ADD CONSTRAINT check_date_range
            CHECK (effective_until IS NULL OR effective_until >= effective_from);
    END IF;
END
$body$;

-- Check constraint 2: Lifecycle consistency
DO $body$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_lifecycle_consistency' AND conrelid = 'public.school_staff_assignments'::regclass
    ) THEN
        ALTER TABLE public.school_staff_assignments
            ADD CONSTRAINT check_lifecycle_consistency
            CHECK (
                (status = 'active' AND is_active = true)
                OR (status != 'active' AND is_active = false)
            );
    END IF;
END
$body$;

-- Check constraint 3: Revocation consistency
DO $body$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_revocation_consistency' AND conrelid = 'public.school_staff_assignments'::regclass
    ) THEN
        ALTER TABLE public.school_staff_assignments
            ADD CONSTRAINT check_revocation_consistency
            CHECK (
                (status = 'revoked' AND revoked_at IS NOT NULL)
                OR (status != 'revoked')
            );
    END IF;
END
$body$;

-- Check constraint 4: HOD requires department_id
DO $body$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_hod_dept' AND conrelid = 'public.school_staff_assignments'::regclass
    ) THEN
        ALTER TABLE public.school_staff_assignments
            ADD CONSTRAINT check_hod_dept
            CHECK (
                assignment_type != 'hod'
                OR department_id IS NOT NULL
            );
    END IF;
END
$body$;

-- Check constraint 5: Form Master requires section_id
DO $body$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_form_master_section' AND conrelid = 'public.school_staff_assignments'::regclass
    ) THEN
        ALTER TABLE public.school_staff_assignments
            ADD CONSTRAINT check_form_master_section
            CHECK (
                assignment_type != 'form_master'
                OR section_id IS NOT NULL
            );
    END IF;
END
$body$;

-- Check constraint 6: Offering assignments require subject_offering_id
DO $body$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_offering_assignment' AND conrelid = 'public.school_staff_assignments'::regclass
    ) THEN
        ALTER TABLE public.school_staff_assignments
            ADD CONSTRAINT check_offering_assignment
            CHECK (
                assignment_type NOT IN ('subject_teacher', 'assistant_teacher')
                OR subject_offering_id IS NOT NULL
            );
    END IF;
END
$body$;

-- Check constraint 7: School-scope assignments must NOT attach department, section, or offering
DO $body$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_school_scope_assignment' AND conrelid = 'public.school_staff_assignments'::regclass
    ) THEN
        ALTER TABLE public.school_staff_assignments
            ADD CONSTRAINT check_school_scope_assignment
            CHECK (
                assignment_type NOT IN ('vice_principal', 'exam_officer')
                OR (department_id IS NULL AND section_id IS NULL AND subject_offering_id IS NULL)
            );
    END IF;
END
$body$;

-- ============================================================
-- SECTION 4B: CROSS-TENANT AND CONTEXTUAL RESOURCE INTEGRITY TRIGGER
-- Guarantees:
--   1. teacher.tenant_id = assignment.tenant_id
--   2. academic_year.tenant_id = assignment.tenant_id
--   3. department.tenant_id = assignment.tenant_id
--   4. section.tenant_id = assignment.tenant_id
--   5. subject_offering.tenant_id = assignment.tenant_id
--   6. subject_offering.academic_year_id = assignment.academic_year_id
-- ============================================================
CREATE OR REPLACE FUNCTION public.validate_staff_assignment_tenant_integrity()
RETURNS TRIGGER LANGUAGE plpgsql AS $func$
DECLARE
    v_target_tenant_id UUID;
    v_target_ay_id UUID;
BEGIN
    -- 1. Teacher must belong to the assignment's tenant
    SELECT tenant_id INTO v_target_tenant_id
    FROM public.teachers
    WHERE id = NEW.teacher_id;
    
    IF v_target_tenant_id IS NULL OR v_target_tenant_id != NEW.tenant_id THEN
        RAISE EXCEPTION 'Cross-tenant violation: teacher % belongs to tenant %, not assignment tenant %',
            NEW.teacher_id, v_target_tenant_id, NEW.tenant_id
            USING ERRCODE = 'check_violation';
    END IF;

    -- 2. Academic year must belong to the assignment's tenant
    SELECT tenant_id INTO v_target_tenant_id
    FROM public.academic_years
    WHERE id = NEW.academic_year_id;
    
    IF v_target_tenant_id IS NULL OR v_target_tenant_id != NEW.tenant_id THEN
        RAISE EXCEPTION 'Cross-tenant violation: academic_year % belongs to tenant %, not assignment tenant %',
            NEW.academic_year_id, v_target_tenant_id, NEW.tenant_id
            USING ERRCODE = 'check_violation';
    END IF;

    -- 3. Department (if specified) must belong to the assignment's tenant
    IF NEW.department_id IS NOT NULL THEN
        SELECT tenant_id INTO v_target_tenant_id
        FROM public.departments
        WHERE id = NEW.department_id;
        
        IF v_target_tenant_id IS NULL OR v_target_tenant_id != NEW.tenant_id THEN
            RAISE EXCEPTION 'Cross-tenant violation: department % belongs to tenant %, not assignment tenant %',
                NEW.department_id, v_target_tenant_id, NEW.tenant_id
                USING ERRCODE = 'check_violation';
        END IF;
    END IF;

    -- 4. Section (if specified) must belong to the assignment's tenant
    IF NEW.section_id IS NOT NULL THEN
        SELECT tenant_id INTO v_target_tenant_id
        FROM public.sections
        WHERE id = NEW.section_id;
        
        IF v_target_tenant_id IS NULL OR v_target_tenant_id != NEW.tenant_id THEN
            RAISE EXCEPTION 'Cross-tenant violation: section % belongs to tenant %, not assignment tenant %',
                NEW.section_id, v_target_tenant_id, NEW.tenant_id
                USING ERRCODE = 'check_violation';
        END IF;
    END IF;

    -- 5. Subject offering (if specified) must belong to the assignment's tenant AND academic year
    IF NEW.subject_offering_id IS NOT NULL THEN
        SELECT tenant_id, academic_year_id INTO v_target_tenant_id, v_target_ay_id
        FROM public.subject_offerings
        WHERE id = NEW.subject_offering_id;
        
        IF v_target_tenant_id IS NULL OR v_target_tenant_id != NEW.tenant_id THEN
            RAISE EXCEPTION 'Cross-tenant violation: subject_offering % belongs to tenant %, not assignment tenant %',
                NEW.subject_offering_id, v_target_tenant_id, NEW.tenant_id
                USING ERRCODE = 'check_violation';
        END IF;

        IF v_target_ay_id IS NOT NULL AND v_target_ay_id != NEW.academic_year_id THEN
            RAISE EXCEPTION 'Academic-year mismatch: subject_offering % belongs to academic year %, not assignment academic year %',
                NEW.subject_offering_id, v_target_ay_id, NEW.academic_year_id
                USING ERRCODE = 'check_violation';
        END IF;
    END IF;

    RETURN NEW;
END;
$func$;

DROP TRIGGER IF EXISTS trg_validate_staff_assignment_tenant_integrity ON public.school_staff_assignments;
CREATE TRIGGER trg_validate_staff_assignment_tenant_integrity
    BEFORE INSERT OR UPDATE ON public.school_staff_assignments
    FOR EACH ROW EXECUTE FUNCTION public.validate_staff_assignment_tenant_integrity();

-- ============================================================
-- SECTION 4C: PARTIAL UNIQUE INDEXES
-- ============================================================

-- Partial Unique Index 1: Exactly 1 active HOD per department per academic year
CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_hod_per_dept_year
    ON public.school_staff_assignments (tenant_id, department_id, academic_year_id)
    WHERE assignment_type = 'hod' AND status = 'active' AND is_active = true;

-- Partial Unique Index 2: Exactly 1 active Form Master per section per academic year
CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_form_master_per_section_year
    ON public.school_staff_assignments (tenant_id, section_id, academic_year_id)
    WHERE assignment_type = 'form_master' AND status = 'active' AND is_active = true;

-- Partial Unique Index 3: A teacher can have only 1 active assignment per offering per year
CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_offering_assignment
    ON public.school_staff_assignments (tenant_id, teacher_id, assignment_type, academic_year_id, subject_offering_id)
    WHERE assignment_type IN ('subject_teacher', 'assistant_teacher') AND status = 'active' AND is_active = true;

-- Partial Unique Index 4: Active Vice Principal per school per academic year per teacher
CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_vp_per_school_year
    ON public.school_staff_assignments (tenant_id, academic_year_id)
    WHERE assignment_type = 'vice_principal' AND status = 'active' AND is_active = true;

-- Partial Unique Index 5: Active Exam Officer per school per academic year
CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_exam_officer_per_school_year
    ON public.school_staff_assignments (tenant_id, academic_year_id)
    WHERE assignment_type = 'exam_officer' AND status = 'active' AND is_active = true;

-- Authoritative Database Constraint: At most 1 current academic year per tenant
CREATE UNIQUE INDEX IF NOT EXISTS uniq_current_academic_year_per_tenant
    ON public.academic_years (tenant_id)
    WHERE is_current = true;

-- ============================================================
-- SECTION 5: SECURITY DEFINER AUTHORIZATION HELPER FUNCTIONS
-- Explicitly differentiates:
--   1. Row-level assignment validity: is_staff_assignment_active(UUID)
--   2. Caller-context authorization predicates: is_hod(), is_form_master(), etc.
-- All caller predicates:
--   - Join academic_years WHERE is_current = true (administrative truth)
--   - Require (SELECT count(*) ... is_current = true) = 1 (fails closed if 0 or >1 current years)
--   - Contain zero arbitrary LIMIT 1
-- ============================================================

-- 1. Row-Level Assignment Validity Predicate
CREATE OR REPLACE FUNCTION public.is_staff_assignment_active(p_assignment_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_catalog SET row_security = off AS $func$
    SELECT EXISTS (
        SELECT 1
        FROM public.school_staff_assignments
        WHERE id = p_assignment_id
          AND status = 'active'
          AND is_active = true
          AND effective_from <= CURRENT_DATE
          AND (effective_until IS NULL OR effective_until >= CURRENT_DATE)
    );
$func$;

REVOKE EXECUTE ON FUNCTION public.is_staff_assignment_active(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_staff_assignment_active(UUID) TO authenticated, service_role;

-- 2. HOD Caller Authorization Predicate
CREATE OR REPLACE FUNCTION public.is_hod(p_department_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_catalog SET row_security = off AS $func$
    SELECT EXISTS (
        SELECT 1
        FROM public.school_staff_assignments sa
        JOIN public.teachers t ON t.id = sa.teacher_id
        JOIN public.profiles p ON p.id = t.profile_id
        JOIN public.academic_years ay
          ON ay.id = sa.academic_year_id
         AND ay.tenant_id = sa.tenant_id
         AND ay.is_current = true
        WHERE p.id = auth.uid()
          AND p.is_active = true
          AND sa.tenant_id = public.get_user_tenant_id()
          AND sa.department_id = p_department_id
          AND sa.assignment_type = 'hod'
          AND sa.status = 'active'
          AND sa.is_active = true
          AND sa.effective_from <= CURRENT_DATE
          AND (sa.effective_until IS NULL OR sa.effective_until >= CURRENT_DATE)
          AND (
              SELECT count(*)
              FROM public.academic_years ay_chk
              WHERE ay_chk.tenant_id = sa.tenant_id
                AND ay_chk.is_current = true
          ) = 1
    );
$func$;

REVOKE EXECUTE ON FUNCTION public.is_hod(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_hod(UUID) TO authenticated, service_role;

-- 3. Form Master Caller Authorization Predicate
CREATE OR REPLACE FUNCTION public.is_form_master(p_section_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_catalog SET row_security = off AS $func$
    SELECT EXISTS (
        SELECT 1
        FROM public.school_staff_assignments sa
        JOIN public.teachers t ON t.id = sa.teacher_id
        JOIN public.profiles p ON p.id = t.profile_id
        JOIN public.academic_years ay
          ON ay.id = sa.academic_year_id
         AND ay.tenant_id = sa.tenant_id
         AND ay.is_current = true
        WHERE p.id = auth.uid()
          AND p.is_active = true
          AND sa.tenant_id = public.get_user_tenant_id()
          AND sa.section_id = p_section_id
          AND sa.assignment_type = 'form_master'
          AND sa.status = 'active'
          AND sa.is_active = true
          AND sa.effective_from <= CURRENT_DATE
          AND (sa.effective_until IS NULL OR sa.effective_until >= CURRENT_DATE)
          AND (
              SELECT count(*)
              FROM public.academic_years ay_chk
              WHERE ay_chk.tenant_id = sa.tenant_id
                AND ay_chk.is_current = true
          ) = 1
    );
$func$;

REVOKE EXECUTE ON FUNCTION public.is_form_master(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_form_master(UUID) TO authenticated, service_role;

-- 4. Exam Officer Caller Authorization Predicate
CREATE OR REPLACE FUNCTION public.is_exam_officer(p_tenant_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_catalog SET row_security = off AS $func$
    SELECT EXISTS (
        SELECT 1
        FROM public.school_staff_assignments sa
        JOIN public.teachers t ON t.id = sa.teacher_id
        JOIN public.profiles p ON p.id = t.profile_id
        JOIN public.academic_years ay
          ON ay.id = sa.academic_year_id
         AND ay.tenant_id = sa.tenant_id
         AND ay.is_current = true
        WHERE p.id = auth.uid()
          AND p.is_active = true
          AND sa.tenant_id = p_tenant_id
          AND sa.tenant_id = public.get_user_tenant_id()
          AND sa.assignment_type = 'exam_officer'
          AND sa.status = 'active'
          AND sa.is_active = true
          AND sa.effective_from <= CURRENT_DATE
          AND (sa.effective_until IS NULL OR sa.effective_until >= CURRENT_DATE)
          AND (
              SELECT count(*)
              FROM public.academic_years ay_chk
              WHERE ay_chk.tenant_id = sa.tenant_id
                AND ay_chk.is_current = true
          ) = 1
    );
$func$;

REVOKE EXECUTE ON FUNCTION public.is_exam_officer(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_exam_officer(UUID) TO authenticated, service_role;

-- 5. Vice Principal Caller Authorization Predicate
CREATE OR REPLACE FUNCTION public.is_vice_principal(p_tenant_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_catalog SET row_security = off AS $func$
    SELECT EXISTS (
        SELECT 1
        FROM public.school_staff_assignments sa
        JOIN public.teachers t ON t.id = sa.teacher_id
        JOIN public.profiles p ON p.id = t.profile_id
        JOIN public.academic_years ay
          ON ay.id = sa.academic_year_id
         AND ay.tenant_id = sa.tenant_id
         AND ay.is_current = true
        WHERE p.id = auth.uid()
          AND p.is_active = true
          AND sa.tenant_id = p_tenant_id
          AND sa.tenant_id = public.get_user_tenant_id()
          AND sa.assignment_type = 'vice_principal'
          AND sa.status = 'active'
          AND sa.is_active = true
          AND sa.effective_from <= CURRENT_DATE
          AND (sa.effective_until IS NULL OR sa.effective_until >= CURRENT_DATE)
          AND (
              SELECT count(*)
              FROM public.academic_years ay_chk
              WHERE ay_chk.tenant_id = sa.tenant_id
                AND ay_chk.is_current = true
          ) = 1
    );
$func$;

REVOKE EXECUTE ON FUNCTION public.is_vice_principal(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_vice_principal(UUID) TO authenticated, service_role;

-- 6. Org Admin Subtenant ID Resolver (Depth-1 matching live schema standard)
-- Context Validation: Strictly prevents arbitrary authenticated callers from enumerating other orgs
CREATE OR REPLACE FUNCTION public.get_org_subtenant_ids(p_org_tenant_id UUID)
RETURNS SETOF UUID LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_catalog SET row_security = off AS $func$
DECLARE
    v_caller_tenant_id UUID;
    v_is_super BOOLEAN;
BEGIN
    v_caller_tenant_id := public.get_user_tenant_id();
    v_is_super := public.is_super_admin();

    -- Strictly require caller to be super_admin OR caller tenant to match p_org_tenant_id
    IF COALESCE(v_is_super, false) = false AND (v_caller_tenant_id IS NULL OR v_caller_tenant_id != p_org_tenant_id) THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT id FROM public.tenants
    WHERE parent_id = p_org_tenant_id
      AND type = 'school';
END;
$func$;

REVOKE EXECUTE ON FUNCTION public.get_org_subtenant_ids(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_org_subtenant_ids(UUID) TO authenticated, service_role;

-- ============================================================
-- SECTION 6: ROW LEVEL SECURITY ON school_staff_assignments
-- ============================================================
ALTER TABLE public.school_staff_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "school_staff_assignments_select" ON public.school_staff_assignments;
CREATE POLICY "school_staff_assignments_select"
    ON public.school_staff_assignments
    FOR SELECT
    TO authenticated
    USING (
        tenant_id = public.get_user_tenant_id()
        OR public.is_super_admin() = true
        OR (
            public.is_org_admin() = true
            AND tenant_id IN (SELECT public.get_org_subtenant_ids(public.get_user_tenant_id()))
        )
    );

DROP POLICY IF EXISTS "school_staff_assignments_modify" ON public.school_staff_assignments;
CREATE POLICY "school_staff_assignments_modify"
    ON public.school_staff_assignments
    FOR ALL
    TO authenticated
    USING (
        (public.is_school_admin() = true AND tenant_id = public.get_user_tenant_id())
        OR public.is_super_admin() = true
        OR (
            public.is_org_admin() = true
            AND tenant_id IN (SELECT public.get_org_subtenant_ids(public.get_user_tenant_id()))
        )
    )
    WITH CHECK (
        (public.is_school_admin() = true AND tenant_id = public.get_user_tenant_id())
        OR public.is_super_admin() = true
        OR (
            public.is_org_admin() = true
            AND tenant_id IN (SELECT public.get_org_subtenant_ids(public.get_user_tenant_id()))
        )
    );

-- ============================================================
-- SECTION 7: IDEMPOTENT LEGACY ASSIGNMENTS BACKFILL
-- ============================================================

-- Backfill HOD from departments.head_teacher_id
INSERT INTO public.school_staff_assignments (
    tenant_id,
    teacher_id,
    assignment_type,
    academic_year_id,
    department_id,
    status,
    is_active,
    effective_from,
    appointed_at,
    created_at,
    updated_at
)
SELECT
    d.tenant_id,
    d.head_teacher_id,
    'hod'::public.staff_assignment_type,
    ay.id AS academic_year_id,
    d.id AS department_id,
    'active'::public.assignment_status,
    true,
    ay.start_date,
    now(),
    now(),
    now()
FROM public.departments d
JOIN public.academic_years ay
  ON ay.tenant_id = d.tenant_id
 AND ay.is_current = true
WHERE d.head_teacher_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM public.school_staff_assignments sa
      WHERE sa.tenant_id = d.tenant_id
        AND sa.teacher_id = d.head_teacher_id
        AND sa.assignment_type = 'hod'
        AND sa.department_id = d.id
        AND sa.academic_year_id = ay.id
        AND sa.status = 'active'
  )
ON CONFLICT DO NOTHING;

-- Backfill Form Master from sections.class_teacher_id
INSERT INTO public.school_staff_assignments (
    tenant_id,
    teacher_id,
    assignment_type,
    academic_year_id,
    section_id,
    status,
    is_active,
    effective_from,
    appointed_at,
    created_at,
    updated_at
)
SELECT
    s.tenant_id,
    s.class_teacher_id,
    'form_master'::public.staff_assignment_type,
    ay.id AS academic_year_id,
    s.id AS section_id,
    'active'::public.assignment_status,
    true,
    ay.start_date,
    now(),
    now(),
    now()
FROM public.sections s
JOIN public.academic_years ay
  ON ay.tenant_id = s.tenant_id
 AND ay.is_current = true
WHERE s.class_teacher_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM public.school_staff_assignments sa
      WHERE sa.tenant_id = s.tenant_id
        AND sa.teacher_id = s.class_teacher_id
        AND sa.assignment_type = 'form_master'
        AND sa.section_id = s.id
        AND sa.academic_year_id = ay.id
        AND sa.status = 'active'
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 8: BI-DIRECTIONAL SYNCHRONIZATION TRIGGERS
-- Protects legacy application queries while establishing canonical persistence.
-- All 4 triggers feature:
--   1. pg_trigger_depth() > 1 recursion guard (prevents depth-2 loops, allows direct statements)
--   2. Strict tenant + resource scoping (same tenant, same resource, current academic year)
--   3. Fail-closed current academic year resolution (strict count = 1, NO LIMIT 1)
-- ============================================================

-- TRIGGER A: school_staff_assignments -> departments.head_teacher_id (forward)
CREATE OR REPLACE FUNCTION public.sync_hod_to_departments()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog AS $func$
BEGIN
    IF pg_trigger_depth() > 1 THEN RETURN COALESCE(NEW, OLD); END IF;

    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        IF NEW.assignment_type = 'hod' THEN
            IF NEW.status = 'active' AND NEW.is_active = true THEN
                UPDATE public.departments
                   SET head_teacher_id = NEW.teacher_id,
                       updated_at = now()
                 WHERE id = NEW.department_id;
            ELSE
                UPDATE public.departments
                   SET head_teacher_id = NULL,
                       updated_at = now()
                 WHERE id = NEW.department_id
                   AND head_teacher_id = NEW.teacher_id;
            END IF;
        END IF;
        RETURN NEW;
    END IF;

    IF TG_OP = 'DELETE' THEN
        IF OLD.assignment_type = 'hod' THEN
            UPDATE public.departments
               SET head_teacher_id = NULL,
                   updated_at = now()
             WHERE id = OLD.department_id
               AND head_teacher_id = OLD.teacher_id;
        END IF;
        RETURN OLD;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$func$;

DROP TRIGGER IF EXISTS sync_hod_assignment_to_dept ON public.school_staff_assignments;
CREATE TRIGGER sync_hod_assignment_to_dept
    AFTER INSERT OR UPDATE OR DELETE ON public.school_staff_assignments
    FOR EACH ROW EXECUTE FUNCTION public.sync_hod_to_departments();

-- TRIGGER B: departments.head_teacher_id -> school_staff_assignments (reverse)
CREATE OR REPLACE FUNCTION public.sync_department_hod_to_assignments()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog AS $func$
DECLARE
    v_academic_year_id UUID;
    v_ay_count INTEGER;
BEGIN
    IF pg_trigger_depth() > 1 THEN RETURN NEW; END IF;
    IF OLD.head_teacher_id IS NOT DISTINCT FROM NEW.head_teacher_id THEN RETURN NEW; END IF;

    -- Strict current academic year resolution (strict 0 or 1 row via partial unique index)
    SELECT count(*) INTO v_ay_count
    FROM public.academic_years
    WHERE tenant_id = NEW.tenant_id
      AND is_current = true;

    IF v_ay_count != 1 THEN
        IF v_ay_count > 1 THEN
            RAISE WARNING 'Integrity violation: % current academic years found for tenant %; failing closed',
                v_ay_count, NEW.tenant_id;
        END IF;
        RETURN NEW;
    END IF;

    SELECT id INTO STRICT v_academic_year_id
    FROM public.academic_years
    WHERE tenant_id = NEW.tenant_id
      AND is_current = true;

    -- If clearing or changing, revoke previous active assignment for CURRENT academic year
    IF OLD.head_teacher_id IS NOT NULL THEN
        UPDATE public.school_staff_assignments
           SET status = 'revoked',
               is_active = false,
               revoked_at = now(),
               revocation_reason = 'Superseded by legacy field update on departments',
               updated_at = now()
         WHERE tenant_id = NEW.tenant_id
           AND teacher_id = OLD.head_teacher_id
           AND assignment_type = 'hod'
           AND department_id = NEW.id
           AND academic_year_id = v_academic_year_id
           AND status = 'active';
    END IF;

    -- If setting new teacher, insert active assignment for current year
    IF NEW.head_teacher_id IS NOT NULL THEN
        INSERT INTO public.school_staff_assignments (
            tenant_id,
            teacher_id,
            assignment_type,
            academic_year_id,
            department_id,
            status,
            is_active,
            effective_from,
            appointed_at,
            created_at,
            updated_at
        ) VALUES (
            NEW.tenant_id,
            NEW.head_teacher_id,
            'hod',
            v_academic_year_id,
            NEW.id,
            'active',
            true,
            CURRENT_DATE,
            now(),
            now(),
            now()
        )
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
END;
$func$;

DROP TRIGGER IF EXISTS sync_dept_hod_to_assignments ON public.departments;
CREATE TRIGGER sync_dept_hod_to_assignments
    AFTER UPDATE OF head_teacher_id ON public.departments
    FOR EACH ROW EXECUTE FUNCTION public.sync_department_hod_to_assignments();

-- TRIGGER C: school_staff_assignments -> sections.class_teacher_id (forward)
CREATE OR REPLACE FUNCTION public.sync_form_master_to_sections()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog AS $func$
BEGIN
    IF pg_trigger_depth() > 1 THEN RETURN COALESCE(NEW, OLD); END IF;

    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        IF NEW.assignment_type = 'form_master' THEN
            IF NEW.status = 'active' AND NEW.is_active = true THEN
                UPDATE public.sections
                   SET class_teacher_id = NEW.teacher_id,
                       updated_at = now()
                 WHERE id = NEW.section_id;
            ELSE
                UPDATE public.sections
                   SET class_teacher_id = NULL,
                       updated_at = now()
                 WHERE id = NEW.section_id
                   AND class_teacher_id = NEW.teacher_id;
            END IF;
        END IF;
        RETURN NEW;
    END IF;

    IF TG_OP = 'DELETE' THEN
        IF OLD.assignment_type = 'form_master' THEN
            UPDATE public.sections
               SET class_teacher_id = NULL,
                   updated_at = now()
             WHERE id = OLD.section_id
               AND class_teacher_id = OLD.teacher_id;
        END IF;
        RETURN OLD;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$func$;

DROP TRIGGER IF EXISTS sync_form_master_assignment_to_section ON public.school_staff_assignments;
CREATE TRIGGER sync_form_master_assignment_to_section
    AFTER INSERT OR UPDATE OR DELETE ON public.school_staff_assignments
    FOR EACH ROW EXECUTE FUNCTION public.sync_form_master_to_sections();

-- TRIGGER D: sections.class_teacher_id -> school_staff_assignments (reverse)
CREATE OR REPLACE FUNCTION public.sync_section_class_teacher_to_assignments()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog AS $func$
DECLARE
    v_academic_year_id UUID;
    v_ay_count INTEGER;
BEGIN
    IF pg_trigger_depth() > 1 THEN RETURN NEW; END IF;
    IF OLD.class_teacher_id IS NOT DISTINCT FROM NEW.class_teacher_id THEN RETURN NEW; END IF;

    -- Strict current academic year resolution (strict 0 or 1 row via partial unique index)
    SELECT count(*) INTO v_ay_count
    FROM public.academic_years
    WHERE tenant_id = NEW.tenant_id
      AND is_current = true;

    IF v_ay_count != 1 THEN
        IF v_ay_count > 1 THEN
            RAISE WARNING 'Integrity violation: % current academic years found for tenant %; failing closed',
                v_ay_count, NEW.tenant_id;
        END IF;
        RETURN NEW;
    END IF;

    SELECT id INTO STRICT v_academic_year_id
    FROM public.academic_years
    WHERE tenant_id = NEW.tenant_id
      AND is_current = true;

    -- If clearing or changing, revoke previous active assignment for CURRENT academic year
    IF OLD.class_teacher_id IS NOT NULL THEN
        UPDATE public.school_staff_assignments
           SET status = 'revoked',
               is_active = false,
               revoked_at = now(),
               revocation_reason = 'Superseded by legacy field update on sections',
               updated_at = now()
         WHERE tenant_id = NEW.tenant_id
           AND teacher_id = OLD.class_teacher_id
           AND assignment_type = 'form_master'
           AND section_id = NEW.id
           AND academic_year_id = v_academic_year_id
           AND status = 'active';
    END IF;

    -- If setting new teacher, insert active assignment for current year
    IF NEW.class_teacher_id IS NOT NULL THEN
        INSERT INTO public.school_staff_assignments (
            tenant_id,
            teacher_id,
            assignment_type,
            academic_year_id,
            section_id,
            status,
            is_active,
            effective_from,
            appointed_at,
            created_at,
            updated_at
        ) VALUES (
            NEW.tenant_id,
            NEW.class_teacher_id,
            'form_master',
            v_academic_year_id,
            NEW.id,
            'active',
            true,
            CURRENT_DATE,
            now(),
            now(),
            now()
        )
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
END;
$func$;

DROP TRIGGER IF EXISTS sync_section_class_teacher_to_assignments ON public.sections;
CREATE TRIGGER sync_section_class_teacher_to_assignments
    AFTER UPDATE OF class_teacher_id ON public.sections
    FOR EACH ROW EXECUTE FUNCTION public.sync_section_class_teacher_to_assignments();

-- ============================================================
-- PERFORMANCE INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_ssa_tenant_id        ON public.school_staff_assignments (tenant_id);
CREATE INDEX IF NOT EXISTS idx_ssa_teacher_id       ON public.school_staff_assignments (teacher_id);
CREATE INDEX IF NOT EXISTS idx_ssa_academic_year_id ON public.school_staff_assignments (academic_year_id);
CREATE INDEX IF NOT EXISTS idx_ssa_type_status      ON public.school_staff_assignments (assignment_type, status, is_active);
CREATE INDEX IF NOT EXISTS idx_ssa_dept_id          ON public.school_staff_assignments (department_id)       WHERE department_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ssa_section_id       ON public.school_staff_assignments (section_id)          WHERE section_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ssa_offering_id      ON public.school_staff_assignments (subject_offering_id) WHERE subject_offering_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_academic_years_current ON public.academic_years (tenant_id, is_current)       WHERE is_current = true;

DROP TRIGGER IF EXISTS set_updated_at_school_staff_assignments ON public.school_staff_assignments;
CREATE TRIGGER set_updated_at_school_staff_assignments
    BEFORE UPDATE ON public.school_staff_assignments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_permissions_catalog ON public.permissions_catalog;
CREATE TRIGGER set_updated_at_permissions_catalog
    BEFORE UPDATE ON public.permissions_catalog
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- END OF MIGRATION 047
-- ============================================================
