-- ============================================================
-- MIGRATION 047: RBAC DATABASE FOUNDATION
-- TASK-0007 Phase 2 | Branch: ai-eos/task-0007-rbac-phase-2-foundation
-- ============================================================
-- SECTION 1: ENUMS (Idempotent)
-- ============================================================
DO $body$ BEGIN
    CREATE TYPE public.assignment_status AS ENUM ('pending','active','suspended','expired','revoked');
EXCEPTION WHEN duplicate_object THEN NULL;
END $body$;

DO $body$ BEGIN
    CREATE TYPE public.staff_assignment_type AS ENUM ('vice_principal','exam_officer','hod','form_master','subject_teacher','assistant_teacher');
EXCEPTION WHEN duplicate_object THEN NULL;
END $body$;

DO $body$ BEGIN
    CREATE TYPE public.canonical_scope AS ENUM ('platform','org','school','department','class','offering','self');
EXCEPTION WHEN duplicate_object THEN NULL;
END $body$;

DO $body$ BEGIN
    CREATE TYPE public.permission_status AS ENUM ('active','deprecated','disabled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $body$;

-- ============================================================
-- SECTION 2: PERMISSIONS CATALOG
-- ============================================================
CREATE TABLE IF NOT EXISTS public.permissions_catalog (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_key TEXT UNIQUE NOT NULL,
    module         TEXT NOT NULL,
    resource       TEXT NOT NULL,
    action         TEXT NOT NULL,
    description    TEXT NOT NULL,
    scope          public.canonical_scope NOT NULL,
    status         public.permission_status NOT NULL DEFAULT 'active',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pc_module ON public.permissions_catalog (module);
CREATE INDEX IF NOT EXISTS idx_pc_scope  ON public.permissions_catalog (scope);
CREATE INDEX IF NOT EXISTS idx_pc_status ON public.permissions_catalog (status);

INSERT INTO public.permissions_catalog (permission_key, module, resource, action, description, scope) VALUES
    ('admissions.applicants.view',    'admissions','applicants','view',   'View admission applicant records',                        'school'),
    ('admissions.applicants.create',  'admissions','applicants','create', 'Submit or register new admission applications',            'school'),
    ('admissions.applicants.approve', 'admissions','applicants','approve','Formally approve or reject admission applications',        'school'),
    ('students.records.view',         'students',  'records',   'view',   'View student academic and personal records',               'offering'),
    ('students.records.manage',       'students',  'records',   'manage', 'Create, update, and archive student records',              'school'),
    ('students.welfare.manage',       'students',  'welfare',   'manage', 'Record and manage student welfare and pastoral notes',     'school'),
    ('attendance.sessions.mark',      'attendance','sessions',  'mark',   'Record attendance for a session or class',                 'class'),
    ('attendance.sessions.approve',   'attendance','sessions',  'approve','Approve or lock attendance records for a session',         'class'),
    ('attendance.records.view',       'attendance','records',   'view',   'View attendance records and reports',                      'offering'),
    ('curriculum.version.create',     'curriculum','version',   'create', 'Create new curriculum scheme of work versions',            'offering'),
    ('curriculum.version.review',     'curriculum','version',   'review', 'Review and annotate submitted curriculum versions',        'school'),
    ('curriculum.version.approve',    'curriculum','version',   'approve','Formally approve curriculum versions for delivery',        'school'),
    ('curriculum.version.publish',    'curriculum','version',   'publish','Publish approved curriculum versions platform-wide',       'platform'),
    ('curriculum.coverage.log',       'curriculum','coverage',  'log',    'Log curriculum coverage progress against a scheme',        'offering'),
    ('exams.sessions.manage',         'exams',     'sessions',  'manage', 'Create, update, and manage examination sessions',          'school'),
    ('exams.schedules.manage',        'exams',     'schedules', 'manage', 'Create and publish examination timetable schedules',       'school'),
    ('exams.results.enter',           'exams',     'results',   'enter',  'Enter raw marks for an assigned subject offering',         'offering'),
    ('exams.results.moderate',        'exams',     'results',   'moderate','Scrutinize and adjust marks prior to formal approval',    'school'),
    ('exams.results.approve',         'exams',     'results',   'approve','Formally certify and approve finalized examination results','school'),
    ('exams.results.publish',         'exams',     'results',   'publish','Release approved results to students and parents',         'school'),
    ('exams.results.view',            'exams',     'results',   'view',   'View examination results within authorized scope',          'offering'),
    ('exams.malpractice.manage',      'exams',     'malpractice','manage','Record, update, and resolve examination malpractice cases','school'),
    ('exams.appeals.submit',          'exams',     'appeals',   'submit', 'Submit a result appeal on own behalf',                     'self'),
    ('exams.appeals.resolve',         'exams',     'appeals',   'resolve','Review and resolve submitted result appeals',              'school'),
    ('exams.cass.export',             'exams',     'cass',      'export', 'Generate official CASS export batches for external bodies','school'),
    ('finance.invoices.view',         'finance',   'invoices',  'view',   'View own fee invoices and payment history',                'self'),
    ('finance.invoices.manage',       'finance',   'invoices',  'manage', 'Create, update, and void fee invoices',                   'school'),
    ('finance.waivers.approve',       'finance',   'waivers',   'approve','Approve fee waiver or scholarship requests',               'school'),
    ('staff.directory.view',          'staff',     'directory', 'view',   'View the school staff directory and profiles',             'school'),
    ('staff.allocations.manage',      'staff',     'allocations','manage','Manage teaching and subject allocation assignments',       'school'),
    ('staff.accounts.manage',         'staff',     'accounts',  'manage', 'Create, activate, suspend, and deactivate staff accounts', 'school'),
    ('platform.tenants.manage',       'platform',  'tenants',   'manage', 'Create, configure, and suspend tenant schools',            'platform'),
    ('platform.billing.manage',       'platform',  'billing',   'manage', 'Manage platform subscription plans and billing records',   'platform')
ON CONFLICT (permission_key) DO NOTHING;

-- ============================================================
-- SECTION 3: SCHOOL STAFF ASSIGNMENTS TABLE
-- NOTE: No school_id column. All school-level scoping uses tenant_id (verified schema).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.school_staff_assignments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    teacher_id          UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    assignment_type     public.staff_assignment_type NOT NULL,
    academic_year_id    UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    department_id       UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    section_id          UUID REFERENCES public.sections(id) ON DELETE CASCADE,
    subject_offering_id UUID REFERENCES public.subject_offerings(id) ON DELETE CASCADE,
    status              public.assignment_status NOT NULL DEFAULT 'active',
    is_active           BOOLEAN NOT NULL DEFAULT true,
    effective_from      DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_until     DATE,
    appointed_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    appointed_by        UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by          UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_by          UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    revoked_at          TIMESTAMPTZ,
    revoked_by          UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    revocation_reason   TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT check_date_range
        CHECK (effective_until IS NULL OR effective_until >= effective_from),
    CONSTRAINT check_lifecycle_consistency
        CHECK ((status = 'active' AND is_active = true) OR (status != 'active' AND is_active = false)),
    CONSTRAINT check_revocation_consistency
        CHECK ((status = 'revoked' AND revoked_at IS NOT NULL) OR (status != 'revoked' AND revoked_at IS NULL)),
    CONSTRAINT check_hod_dept
        CHECK (assignment_type != 'hod' OR department_id IS NOT NULL),
    CONSTRAINT check_form_master_section
        CHECK (assignment_type != 'form_master' OR section_id IS NOT NULL),
    CONSTRAINT check_offering_assignment
        CHECK (assignment_type NOT IN ('subject_teacher','assistant_teacher') OR subject_offering_id IS NOT NULL),
    CONSTRAINT check_school_scope_assignment
        CHECK (assignment_type NOT IN ('vice_principal','exam_officer') OR
               (department_id IS NULL AND section_id IS NULL AND subject_offering_id IS NULL))
);

-- ============================================================
-- SECTION 4: PARTIAL UNIQUE INDEXES
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_hod_per_dept_year
    ON public.school_staff_assignments (tenant_id, department_id, academic_year_id)
    WHERE assignment_type = 'hod' AND status = 'active' AND is_active = true;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_form_master_per_section_year
    ON public.school_staff_assignments (tenant_id, section_id, academic_year_id)
    WHERE assignment_type = 'form_master' AND status = 'active' AND is_active = true;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_vp_per_school_year
    ON public.school_staff_assignments (tenant_id, academic_year_id)
    WHERE assignment_type = 'vice_principal' AND status = 'active' AND is_active = true;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_exam_officer_per_school_year
    ON public.school_staff_assignments (tenant_id, academic_year_id)
    WHERE assignment_type = 'exam_officer' AND status = 'active' AND is_active = true;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_offering_assignment
    ON public.school_staff_assignments (tenant_id, teacher_id, assignment_type, academic_year_id, subject_offering_id)
    WHERE assignment_type IN ('subject_teacher','assistant_teacher') AND status = 'active' AND is_active = true;

-- ============================================================
-- SECTION 5: AUTHORIZATION HELPER FUNCTIONS
-- All: STABLE SECURITY DEFINER, search_path=public pg_catalog, row_security=off
-- Two predicates:
--   A) is_staff_assignment_active: row validity only (no caller, no year)
--   B) is_hod/is_form_master/is_exam_officer/is_vice_principal: caller + CURRENT year
--      "Current year" = academic_years WHERE tenant_id=caller_tenant AND is_current=true
-- ============================================================

-- A) ROW-LEVEL VALIDITY
CREATE OR REPLACE FUNCTION public.is_staff_assignment_active(p_assignment_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_catalog SET row_security = off AS $func$
    SELECT EXISTS (
        SELECT 1 FROM public.school_staff_assignments
        WHERE id = p_assignment_id AND status = 'active' AND is_active = true
          AND effective_from <= CURRENT_DATE
          AND (effective_until IS NULL OR effective_until >= CURRENT_DATE)
    );
$func$;
REVOKE EXECUTE ON FUNCTION public.is_staff_assignment_active(UUID) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.is_staff_assignment_active(UUID) TO authenticated, service_role;

-- B1) HEAD OF DEPARTMENT
CREATE OR REPLACE FUNCTION public.is_hod(p_department_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_catalog SET row_security = off AS $func$
    SELECT EXISTS (
        SELECT 1
        FROM public.school_staff_assignments sa
        JOIN public.teachers t ON t.id = sa.teacher_id
        JOIN public.profiles p ON p.id = t.profile_id
        JOIN public.academic_years ay
          ON ay.id = sa.academic_year_id AND ay.tenant_id = sa.tenant_id AND ay.is_current = true
        WHERE p.id = auth.uid() AND p.is_active = true
          AND sa.tenant_id = public.get_user_tenant_id()
          AND sa.department_id = p_department_id
          AND sa.assignment_type = 'hod'
          AND sa.status = 'active' AND sa.is_active = true
          AND sa.effective_from <= CURRENT_DATE
          AND (sa.effective_until IS NULL OR sa.effective_until >= CURRENT_DATE)
    );
$func$;
REVOKE EXECUTE ON FUNCTION public.is_hod(UUID) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.is_hod(UUID) TO authenticated, service_role;

-- B2) FORM MASTER
CREATE OR REPLACE FUNCTION public.is_form_master(p_section_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_catalog SET row_security = off AS $func$
    SELECT EXISTS (
        SELECT 1
        FROM public.school_staff_assignments sa
        JOIN public.teachers t ON t.id = sa.teacher_id
        JOIN public.profiles p ON p.id = t.profile_id
        JOIN public.academic_years ay
          ON ay.id = sa.academic_year_id AND ay.tenant_id = sa.tenant_id AND ay.is_current = true
        WHERE p.id = auth.uid() AND p.is_active = true
          AND sa.tenant_id = public.get_user_tenant_id()
          AND sa.section_id = p_section_id
          AND sa.assignment_type = 'form_master'
          AND sa.status = 'active' AND sa.is_active = true
          AND sa.effective_from <= CURRENT_DATE
          AND (sa.effective_until IS NULL OR sa.effective_until >= CURRENT_DATE)
    );
$func$;
REVOKE EXECUTE ON FUNCTION public.is_form_master(UUID) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.is_form_master(UUID) TO authenticated, service_role;

-- B3) EXAM OFFICER
CREATE OR REPLACE FUNCTION public.is_exam_officer(p_tenant_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_catalog SET row_security = off AS $func$
    SELECT EXISTS (
        SELECT 1
        FROM public.school_staff_assignments sa
        JOIN public.teachers t ON t.id = sa.teacher_id
        JOIN public.profiles p ON p.id = t.profile_id
        JOIN public.academic_years ay
          ON ay.id = sa.academic_year_id AND ay.tenant_id = sa.tenant_id AND ay.is_current = true
        WHERE p.id = auth.uid() AND p.is_active = true
          AND sa.tenant_id = p_tenant_id AND sa.tenant_id = public.get_user_tenant_id()
          AND sa.assignment_type = 'exam_officer'
          AND sa.status = 'active' AND sa.is_active = true
          AND sa.effective_from <= CURRENT_DATE
          AND (sa.effective_until IS NULL OR sa.effective_until >= CURRENT_DATE)
    );
$func$;
REVOKE EXECUTE ON FUNCTION public.is_exam_officer(UUID) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.is_exam_officer(UUID) TO authenticated, service_role;

-- B4) VICE PRINCIPAL
CREATE OR REPLACE FUNCTION public.is_vice_principal(p_tenant_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_catalog SET row_security = off AS $func$
    SELECT EXISTS (
        SELECT 1
        FROM public.school_staff_assignments sa
        JOIN public.teachers t ON t.id = sa.teacher_id
        JOIN public.profiles p ON p.id = t.profile_id
        JOIN public.academic_years ay
          ON ay.id = sa.academic_year_id AND ay.tenant_id = sa.tenant_id AND ay.is_current = true
        WHERE p.id = auth.uid() AND p.is_active = true
          AND sa.tenant_id = p_tenant_id AND sa.tenant_id = public.get_user_tenant_id()
          AND sa.assignment_type = 'vice_principal'
          AND sa.status = 'active' AND sa.is_active = true
          AND sa.effective_from <= CURRENT_DATE
          AND (sa.effective_until IS NULL OR sa.effective_until >= CURRENT_DATE)
    );
$func$;
REVOKE EXECUTE ON FUNCTION public.is_vice_principal(UUID) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.is_vice_principal(UUID) TO authenticated, service_role;

-- C) ORG ADMIN SUBTREE RESOLVER (depth-1, matches live migration 046 pattern)
CREATE OR REPLACE FUNCTION public.get_org_subtenant_ids(p_org_tenant_id UUID)
RETURNS SETOF UUID LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_catalog SET row_security = off AS $func$
    SELECT id FROM public.tenants WHERE parent_id = p_org_tenant_id;
$func$;
REVOKE EXECUTE ON FUNCTION public.get_org_subtenant_ids(UUID) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_org_subtenant_ids(UUID) TO authenticated, service_role;

-- ============================================================
-- SECTION 6: ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.permissions_catalog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users view permissions catalog" ON public.permissions_catalog;
CREATE POLICY "Authenticated users view permissions catalog"
    ON public.permissions_catalog FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Service role full access to permissions catalog" ON public.permissions_catalog;
CREATE POLICY "Service role full access to permissions catalog"
    ON public.permissions_catalog FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Super admin mutates permissions catalog" ON public.permissions_catalog;
CREATE POLICY "Super admin mutates permissions catalog"
    ON public.permissions_catalog FOR ALL TO authenticated
    USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

ALTER TABLE public.school_staff_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View assignments within tenant or subtree" ON public.school_staff_assignments;
CREATE POLICY "View assignments within tenant or subtree"
    ON public.school_staff_assignments FOR SELECT TO authenticated
    USING (
        tenant_id = public.get_user_tenant_id()
        OR public.is_super_admin()
        OR (public.is_org_admin() AND tenant_id IN (
            SELECT public.get_org_subtenant_ids(public.get_user_tenant_id())
        ))
    );

DROP POLICY IF EXISTS "Admins manage staff assignments" ON public.school_staff_assignments;
CREATE POLICY "Admins manage staff assignments"
    ON public.school_staff_assignments FOR ALL TO authenticated
    USING (
        (public.is_school_admin() AND tenant_id = public.get_user_tenant_id())
        OR (public.is_org_admin() AND tenant_id IN (
            SELECT public.get_org_subtenant_ids(public.get_user_tenant_id())
        ))
        OR public.is_super_admin()
    )
    WITH CHECK (
        (public.is_school_admin() AND tenant_id = public.get_user_tenant_id())
        OR (public.is_org_admin() AND tenant_id IN (
            SELECT public.get_org_subtenant_ids(public.get_user_tenant_id())
        ))
        OR public.is_super_admin()
    );

-- ============================================================
-- SECTION 7: IDEMPOTENT LEGACY BACKFILL
-- effective_from = ay.start_date (not CURRENT_DATE)
-- Skips tenants with no is_current=true academic year
-- ============================================================
INSERT INTO public.school_staff_assignments (
    tenant_id, teacher_id, assignment_type, academic_year_id, department_id,
    status, is_active, effective_from, appointed_at, created_at, updated_at
)
SELECT d.tenant_id, d.head_teacher_id, 'hod'::public.staff_assignment_type,
       ay.id, d.id, 'active'::public.assignment_status, true, ay.start_date,
       now(), now(), now()
FROM public.departments d
JOIN public.academic_years ay ON ay.tenant_id = d.tenant_id AND ay.is_current = true
WHERE d.head_teacher_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM public.school_staff_assignments e
      WHERE e.tenant_id = d.tenant_id AND e.teacher_id = d.head_teacher_id
        AND e.assignment_type = 'hod' AND e.department_id = d.id
        AND e.academic_year_id = ay.id AND e.status = 'active'
  )
ON CONFLICT DO NOTHING;

INSERT INTO public.school_staff_assignments (
    tenant_id, teacher_id, assignment_type, academic_year_id, section_id,
    status, is_active, effective_from, appointed_at, created_at, updated_at
)
SELECT s.tenant_id, s.class_teacher_id, 'form_master'::public.staff_assignment_type,
       ay.id, s.id, 'active'::public.assignment_status, true, ay.start_date,
       now(), now(), now()
FROM public.sections s
JOIN public.academic_years ay ON ay.tenant_id = s.tenant_id AND ay.is_current = true
WHERE s.class_teacher_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM public.school_staff_assignments e
      WHERE e.tenant_id = s.tenant_id AND e.teacher_id = s.class_teacher_id
        AND e.assignment_type = 'form_master' AND e.section_id = s.id
        AND e.academic_year_id = ay.id AND e.status = 'active'
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 8: BI-DIRECTIONAL SYNC TRIGGERS
-- All functions guard recursion with: IF pg_trigger_depth() > 0 THEN RETURN ...
-- ============================================================

-- TRIGGER A: school_staff_assignments -> departments.head_teacher_id (forward)
CREATE OR REPLACE FUNCTION public.sync_hod_to_departments()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog AS $func$
BEGIN
    IF pg_trigger_depth() > 0 THEN RETURN COALESCE(NEW, OLD); END IF;
    IF TG_OP IN ('INSERT','UPDATE') THEN
        IF NEW.assignment_type = 'hod' THEN
            IF NEW.status = 'active' AND NEW.is_active = true THEN
                UPDATE public.departments SET head_teacher_id = NEW.teacher_id, updated_at = now()
                 WHERE id = NEW.department_id;
            ELSE
                UPDATE public.departments SET head_teacher_id = NULL, updated_at = now()
                 WHERE id = NEW.department_id AND head_teacher_id = NEW.teacher_id;
            END IF;
        END IF;
        RETURN NEW;
    END IF;
    IF TG_OP = 'DELETE' THEN
        IF OLD.assignment_type = 'hod' THEN
            UPDATE public.departments SET head_teacher_id = NULL, updated_at = now()
             WHERE id = OLD.department_id AND head_teacher_id = OLD.teacher_id;
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
DECLARE v_academic_year_id UUID;
BEGIN
    IF pg_trigger_depth() > 0 THEN RETURN NEW; END IF;
    IF OLD.head_teacher_id IS NOT DISTINCT FROM NEW.head_teacher_id THEN RETURN NEW; END IF;
    SELECT id INTO v_academic_year_id FROM public.academic_years
    WHERE tenant_id = NEW.tenant_id AND is_current = true LIMIT 1;
    IF v_academic_year_id IS NULL THEN RETURN NEW; END IF;
    IF OLD.head_teacher_id IS NOT NULL THEN
        UPDATE public.school_staff_assignments
           SET status = 'revoked', is_active = false, revoked_at = now(),
               revocation_reason = 'Superseded by legacy field update on departments', updated_at = now()
         WHERE tenant_id = NEW.tenant_id AND teacher_id = OLD.head_teacher_id
           AND assignment_type = 'hod' AND department_id = NEW.id
           AND academic_year_id = v_academic_year_id AND status = 'active';
    END IF;
    IF NEW.head_teacher_id IS NOT NULL THEN
        INSERT INTO public.school_staff_assignments (
            tenant_id, teacher_id, assignment_type, academic_year_id, department_id,
            status, is_active, effective_from, appointed_at, created_at, updated_at
        ) VALUES (
            NEW.tenant_id, NEW.head_teacher_id, 'hod', v_academic_year_id, NEW.id,
            'active', true, CURRENT_DATE, now(), now(), now()
        ) ON CONFLICT DO NOTHING;
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
    IF pg_trigger_depth() > 0 THEN RETURN COALESCE(NEW, OLD); END IF;
    IF TG_OP IN ('INSERT','UPDATE') THEN
        IF NEW.assignment_type = 'form_master' THEN
            IF NEW.status = 'active' AND NEW.is_active = true THEN
                UPDATE public.sections SET class_teacher_id = NEW.teacher_id, updated_at = now()
                 WHERE id = NEW.section_id;
            ELSE
                UPDATE public.sections SET class_teacher_id = NULL, updated_at = now()
                 WHERE id = NEW.section_id AND class_teacher_id = NEW.teacher_id;
            END IF;
        END IF;
        RETURN NEW;
    END IF;
    IF TG_OP = 'DELETE' THEN
        IF OLD.assignment_type = 'form_master' THEN
            UPDATE public.sections SET class_teacher_id = NULL, updated_at = now()
             WHERE id = OLD.section_id AND class_teacher_id = OLD.teacher_id;
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
DECLARE v_academic_year_id UUID;
BEGIN
    IF pg_trigger_depth() > 0 THEN RETURN NEW; END IF;
    IF OLD.class_teacher_id IS NOT DISTINCT FROM NEW.class_teacher_id THEN RETURN NEW; END IF;
    SELECT id INTO v_academic_year_id FROM public.academic_years
    WHERE tenant_id = NEW.tenant_id AND is_current = true LIMIT 1;
    IF v_academic_year_id IS NULL THEN RETURN NEW; END IF;
    IF OLD.class_teacher_id IS NOT NULL THEN
        UPDATE public.school_staff_assignments
           SET status = 'revoked', is_active = false, revoked_at = now(),
               revocation_reason = 'Superseded by legacy field update on sections', updated_at = now()
         WHERE tenant_id = NEW.tenant_id AND teacher_id = OLD.class_teacher_id
           AND assignment_type = 'form_master' AND section_id = NEW.id
           AND academic_year_id = v_academic_year_id AND status = 'active';
    END IF;
    IF NEW.class_teacher_id IS NOT NULL THEN
        INSERT INTO public.school_staff_assignments (
            tenant_id, teacher_id, assignment_type, academic_year_id, section_id,
            status, is_active, effective_from, appointed_at, created_at, updated_at
        ) VALUES (
            NEW.tenant_id, NEW.class_teacher_id, 'form_master', v_academic_year_id, NEW.id,
            'active', true, CURRENT_DATE, now(), now(), now()
        ) ON CONFLICT DO NOTHING;
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
