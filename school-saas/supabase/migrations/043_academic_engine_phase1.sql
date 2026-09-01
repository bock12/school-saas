-- ============================================================
-- Migration 043: Academic Engine Phase 1 — Hybrid Offering Model
-- Extends the curriculum system established in 041 with:
--   1. Extended columns on subjects & curriculum_versions
--   2. curriculum_workflow_log       (full audit trail for cv workflow)
--   3. stream_subject_rules          (structured elective group rules)
--   4. student_stream_assignments    (which stream a student belongs to per year)
--   5. term_offerings                (per-term operational record — the "bridge")
-- ============================================================

-- ============================================================
-- 1. ENUMS (new)
-- ============================================================

DO $$ BEGIN
  CREATE TYPE cv_workflow_status AS ENUM (
    'draft', 'submitted', 'in_review', 'changes_requested',
    'approved', 'published', 'superseded', 'archived'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE cv_source AS ENUM (
    'school', 'district', 'ministry', 'waec', 'bece', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE stream_rule_type AS ENUM (
    'core', 'elective'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE stream_assignment_status AS ENUM (
    'active', 'changed', 'withdrawn'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE term_offering_status AS ENUM (
    'pending', 'active', 'suspended', 'completed', 'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE timetable_status AS ENUM (
    'pending', 'scheduled', 'active', 'completed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 2. EXTEND: subjects table
--    Add: is_examinable, exam_board_code, default_periods_per_week,
--         default_period_duration_mins, max_class_size
-- ============================================================

ALTER TABLE public.subjects
  ADD COLUMN IF NOT EXISTS is_examinable           BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS exam_board_code          TEXT,        -- WAEC / BECE / SLSSL official code
  ADD COLUMN IF NOT EXISTS default_periods_per_week INTEGER NOT NULL DEFAULT 4,
  ADD COLUMN IF NOT EXISTS default_period_duration  INTEGER NOT NULL DEFAULT 40, -- minutes
  ADD COLUMN IF NOT EXISTS max_class_size           INTEGER;     -- advisory; NULL = no limit

-- ============================================================
-- 3. EXTEND: curriculum_versions table
--    Add: version_label, source, is_national_curriculum,
--         superseded_by, review_notes, rejection_reason,
--         reviewed_by, reviewed_at
-- ============================================================

ALTER TABLE public.curriculum_versions
  ADD COLUMN IF NOT EXISTS version_label              TEXT,            -- e.g. "v2026.1"
  ADD COLUMN IF NOT EXISTS source                     cv_source NOT NULL DEFAULT 'school',
  ADD COLUMN IF NOT EXISTS is_national_curriculum     BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS superseded_by              UUID REFERENCES public.curriculum_versions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS review_notes               TEXT,
  ADD COLUMN IF NOT EXISTS rejection_reason           TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_by               UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at               TIMESTAMPTZ;

-- Auto-generate version_label for existing rows that have none
UPDATE public.curriculum_versions
SET version_label = 'v' || EXTRACT(YEAR FROM created_at) || '.' || version
WHERE version_label IS NULL;

-- ============================================================
-- 4. EXTEND: subject_offerings table
--    Add: requirement_type, elective_group, overload_flag
--    NOTE: This table already has the year-level fields from 041.
--    We are retrofitting it to be the true "year-level contract"
--    by adding elective group classification.
-- ============================================================

ALTER TABLE public.subject_offerings
  ADD COLUMN IF NOT EXISTS requirement_type   TEXT NOT NULL DEFAULT 'core'
    CHECK (requirement_type IN ('core', 'elective', 'optional')),
  ADD COLUMN IF NOT EXISTS elective_group     TEXT,       -- e.g. 'Group A', 'Group B'
  ADD COLUMN IF NOT EXISTS overload_flag      BOOLEAN NOT NULL DEFAULT false;

-- ============================================================
-- 5. CURRICULUM WORKFLOW LOG
--    Full audit trail for every status transition on a cv.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.curriculum_workflow_log (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculum_version_id   UUID NOT NULL REFERENCES public.curriculum_versions(id) ON DELETE CASCADE,
  from_status             TEXT,
  to_status               TEXT NOT NULL,
  actioned_by             UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  comment                 TEXT,
  actioned_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cwl_version ON public.curriculum_workflow_log(curriculum_version_id);
CREATE INDEX IF NOT EXISTS idx_cwl_actor   ON public.curriculum_workflow_log(actioned_by);

-- ============================================================
-- 6. STREAM SUBJECT RULES
--    Defines which subjects belong to a stream, whether they are
--    core or elective, and the selection constraints per elective group.
--
--    Replaces the simpler subject_selection_rules for stream-level logic.
--    subject_selection_rules is kept for cross-subject rules (prerequisites, etc.)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.stream_subject_rules (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  stream_id           UUID NOT NULL REFERENCES public.curriculum_streams(id) ON DELETE CASCADE,
  subject_id          UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  academic_year_id    UUID REFERENCES public.academic_years(id) ON DELETE CASCADE,  -- NULL = all years
  rule_type           stream_rule_type NOT NULL DEFAULT 'core',
  elective_group      TEXT,           -- e.g. 'Group A', 'Group B' — only for elective rule_type
  min_selections      INTEGER NOT NULL DEFAULT 1,  -- min picks from this elective group
  max_selections      INTEGER NOT NULL DEFAULT 1,  -- max picks from this elective group
  sort_order          INTEGER NOT NULL DEFAULT 0,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (stream_id, subject_id, COALESCE(academic_year_id, '00000000-0000-0000-0000-000000000000'::uuid))
);

CREATE INDEX IF NOT EXISTS idx_ssr_tenant  ON public.stream_subject_rules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ssr_stream  ON public.stream_subject_rules(stream_id);
CREATE INDEX IF NOT EXISTS idx_ssr_subject ON public.stream_subject_rules(subject_id);
CREATE INDEX IF NOT EXISTS idx_ssr_year    ON public.stream_subject_rules(academic_year_id);

-- ============================================================
-- 7. STUDENT STREAM ASSIGNMENTS
--    Records which stream a student is assigned to per academic year.
--    When assigned, the system auto-creates core subject enrollments.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.student_stream_assignments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  student_id            UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  stream_id             UUID NOT NULL REFERENCES public.curriculum_streams(id) ON DELETE RESTRICT,
  academic_year_id      UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  section_id            UUID REFERENCES public.sections(id) ON DELETE SET NULL,
  assigned_by           UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status                stream_assignment_status NOT NULL DEFAULT 'active',
  previous_stream_id    UUID REFERENCES public.curriculum_streams(id) ON DELETE SET NULL,
  change_reason         TEXT,
  -- Elective selections status
  electives_submitted   BOOLEAN NOT NULL DEFAULT false,
  electives_approved    BOOLEAN NOT NULL DEFAULT false,
  electives_locked      BOOLEAN NOT NULL DEFAULT false,  -- true after enrollment deadline
  UNIQUE (student_id, academic_year_id)   -- one stream per student per year
);

CREATE INDEX IF NOT EXISTS idx_ssa_tenant   ON public.student_stream_assignments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ssa_student  ON public.student_stream_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_ssa_stream   ON public.student_stream_assignments(stream_id);
CREATE INDEX IF NOT EXISTS idx_ssa_year     ON public.student_stream_assignments(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_ssa_section  ON public.student_stream_assignments(section_id);

-- ============================================================
-- 8. TERM OFFERINGS
--    The per-term operational record for each subject_offering.
--    Inherits from the year-level subject_offering but allows
--    per-term overrides for teacher, curriculum version, and
--    timetabling data.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.term_offerings (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                   UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  offering_id                 UUID NOT NULL REFERENCES public.subject_offerings(id) ON DELETE CASCADE,
  term_id                     UUID NOT NULL REFERENCES public.terms(id) ON DELETE CASCADE,

  -- Per-term overrides (NULL = inherit from parent subject_offering)
  teacher_override_id         UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  curriculum_version_override UUID REFERENCES public.curriculum_versions(id) ON DELETE SET NULL,

  -- Per-term operational fields
  periods_per_week            INTEGER NOT NULL DEFAULT 4,
  period_duration_mins        INTEGER NOT NULL DEFAULT 40,
  timetable_status            timetable_status NOT NULL DEFAULT 'pending',
  status                      term_offering_status NOT NULL DEFAULT 'pending',

  -- Computed aggregates (updated by triggers/background jobs)
  lesson_count                INTEGER NOT NULL DEFAULT 0,
  attendance_rate             NUMERIC(5,2),   -- 0.00–100.00

  notes                       TEXT,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (offering_id, term_id)   -- one term_offering per offering per term
);

CREATE INDEX IF NOT EXISTS idx_to_tenant   ON public.term_offerings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_to_offering ON public.term_offerings(offering_id);
CREATE INDEX IF NOT EXISTS idx_to_term     ON public.term_offerings(term_id);
CREATE INDEX IF NOT EXISTS idx_to_teacher  ON public.term_offerings(teacher_override_id);
CREATE INDEX IF NOT EXISTS idx_to_status   ON public.term_offerings(status);

-- ============================================================
-- 9. EXTEND: student_subject_enrollments
--    Add: enrollment_type, waitlist_position
--    (to support the stream-based auto-enrollment workflow)
-- ============================================================

ALTER TABLE public.student_subject_enrollments
  ADD COLUMN IF NOT EXISTS enrollment_type    TEXT NOT NULL DEFAULT 'standard'
    CHECK (enrollment_type IN ('stream_core', 'stream_elective', 'standard', 'transfer', 'repeat', 'exempt')),
  ADD COLUMN IF NOT EXISTS elective_group     TEXT,
  ADD COLUMN IF NOT EXISTS approval_status    TEXT NOT NULL DEFAULT 'approved'
    CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS approved_by        UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS waitlist_position  INTEGER,    -- NULL = not on waitlist
  ADD COLUMN IF NOT EXISTS stream_assignment_id UUID REFERENCES public.student_stream_assignments(id) ON DELETE SET NULL;

-- ============================================================
-- 10. UPDATED_AT TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS set_updated_at_stream_subject_rules ON public.stream_subject_rules;
CREATE TRIGGER set_updated_at_stream_subject_rules
  BEFORE UPDATE ON public.stream_subject_rules
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_term_offerings ON public.term_offerings;
CREATE TRIGGER set_updated_at_term_offerings
  BEFORE UPDATE ON public.term_offerings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 11. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.curriculum_workflow_log    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_subject_rules       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_stream_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.term_offerings             ENABLE ROW LEVEL SECURITY;

-- CURRICULUM WORKFLOW LOG (read-only; server writes via service role)
CREATE POLICY "Tenant users view curriculum_workflow_log"
  ON public.curriculum_workflow_log FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.curriculum_versions cv
      WHERE cv.id = curriculum_version_id AND cv.tenant_id = public.get_user_tenant_id()
    )
  );

CREATE POLICY "School admins insert curriculum_workflow_log"
  ON public.curriculum_workflow_log FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.curriculum_versions cv
      WHERE cv.id = curriculum_version_id AND cv.tenant_id = public.get_user_tenant_id()
        AND public.is_school_admin()
    )
  );

-- STREAM SUBJECT RULES
CREATE POLICY "Super admins manage stream_subject_rules"
  ON public.stream_subject_rules FOR ALL TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "Tenant users view stream_subject_rules"
  ON public.stream_subject_rules FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "School admins manage stream_subject_rules"
  ON public.stream_subject_rules FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id() AND public.is_school_admin());

-- STUDENT STREAM ASSIGNMENTS
CREATE POLICY "Super admins manage student_stream_assignments"
  ON public.student_stream_assignments FOR ALL TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "Tenant users view student_stream_assignments"
  ON public.student_stream_assignments FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "School admins manage student_stream_assignments"
  ON public.student_stream_assignments FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id() AND public.is_school_admin());

-- Students can view their own stream assignment
CREATE POLICY "Students view own stream_assignment"
  ON public.student_stream_assignments FOR SELECT TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = student_id AND s.profile_id = auth.uid()
    )
  );

-- TERM OFFERINGS
CREATE POLICY "Super admins manage term_offerings"
  ON public.term_offerings FOR ALL TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "Tenant users view term_offerings"
  ON public.term_offerings FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "School admins manage term_offerings"
  ON public.term_offerings FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id() AND public.is_school_admin());

CREATE POLICY "Teachers view their own term_offerings"
  ON public.term_offerings FOR SELECT TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id()
    AND (
      EXISTS (
        SELECT 1 FROM public.subject_offerings so
        JOIN public.teachers t ON t.profile_id = auth.uid()
        WHERE so.id = offering_id AND (so.teacher_id = t.id OR term_offerings.teacher_override_id = t.id)
      )
    )
  );

-- ============================================================
-- 12. HELPER VIEW: teacher_workload_summary
--     Real-time workload computed from term_offerings + subject_offerings.
--     Used by the workload warning system (Q1: Warn but allow).
-- ============================================================

CREATE OR REPLACE VIEW public.teacher_workload_summary AS
SELECT
  COALESCE(to_.teacher_override_id, so.teacher_id) AS teacher_id,
  so.academic_year_id,
  to_.term_id,
  COUNT(DISTINCT to_.id)              AS offering_count,
  SUM(to_.periods_per_week)           AS total_periods_week,
  SUM(to_.periods_per_week * to_.period_duration_mins) AS total_teaching_mins_week,
  BOOL_OR(so.overload_flag)           AS has_overload_flag,
  json_agg(json_build_object(
    'term_offering_id',  to_.id,
    'offering_id',       to_.offering_id,
    'subject_id',        so.subject_id,
    'section_id',        so.section_id,
    'periods_per_week',  to_.periods_per_week
  ) ORDER BY to_.id)                  AS offering_details
FROM public.term_offerings to_
JOIN public.subject_offerings so ON so.id = to_.offering_id
WHERE to_.status NOT IN ('cancelled')
  AND so.status NOT IN ('cancelled')
GROUP BY
  COALESCE(to_.teacher_override_id, so.teacher_id),
  so.academic_year_id,
  to_.term_id;

-- ============================================================
-- 13. HELPER VIEW: stream_enrollment_summary
--     Aggregates per-stream enrollment counts for the enrollment portal.
-- ============================================================

CREATE OR REPLACE VIEW public.stream_enrollment_summary AS
SELECT
  ssa.stream_id,
  ssa.academic_year_id,
  ssa.tenant_id,
  COUNT(*)                                        AS total_students,
  COUNT(*) FILTER (WHERE ssa.electives_approved)  AS electives_approved_count,
  COUNT(*) FILTER (WHERE ssa.electives_submitted AND NOT ssa.electives_approved) AS pending_approval_count,
  COUNT(*) FILTER (WHERE NOT ssa.electives_submitted) AS not_submitted_count
FROM public.student_stream_assignments ssa
WHERE ssa.status = 'active'
GROUP BY ssa.stream_id, ssa.academic_year_id, ssa.tenant_id;

-- ============================================================
-- 14. FUNCTION: auto_create_core_enrollments
--     Called after a student is assigned to a stream.
--     Automatically creates enrollment records for all
--     stream_subject_rules WHERE rule_type = 'core'.
-- ============================================================

CREATE OR REPLACE FUNCTION public.auto_create_core_enrollments()
RETURNS TRIGGER AS $$
DECLARE
  rule RECORD;
  offering RECORD;
BEGIN
  -- Only run on INSERT or when stream changes on UPDATE
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.stream_id IS DISTINCT FROM OLD.stream_id) THEN

    -- If stream changed on update, deactivate old core enrollments
    IF TG_OP = 'UPDATE' AND OLD.stream_id IS NOT NULL THEN
      UPDATE public.student_subject_enrollments sse
      SET status = 'dropped', dropped_at = NOW()
      WHERE sse.student_id = NEW.student_id
        AND sse.enrollment_type = 'stream_core'
        AND sse.stream_assignment_id = NEW.id
        AND sse.status = 'active';
    END IF;

    -- Create enrollments for all core subjects in the new stream
    FOR rule IN
      SELECT ssr.*
      FROM public.stream_subject_rules ssr
      WHERE ssr.stream_id = NEW.stream_id
        AND ssr.rule_type = 'core'
        AND ssr.is_active = true
        AND (ssr.academic_year_id IS NULL OR ssr.academic_year_id = NEW.academic_year_id)
    LOOP
      -- Find the matching subject_offering for this academic year + section
      SELECT so.id INTO offering
      FROM public.subject_offerings so
      WHERE so.subject_id = rule.subject_id
        AND so.academic_year_id = NEW.academic_year_id
        AND so.tenant_id = NEW.tenant_id
        AND (NEW.section_id IS NULL OR so.section_id = NEW.section_id)
        AND so.status = 'active'
      LIMIT 1;

      -- Only enroll if an offering exists; otherwise enrollment is deferred
      IF offering.id IS NOT NULL THEN
        INSERT INTO public.student_subject_enrollments (
          tenant_id, student_id, offering_id,
          status, enrollment_type, approval_status,
          stream_assignment_id, enrolled_at
        ) VALUES (
          NEW.tenant_id, NEW.student_id, offering.id,
          'active', 'stream_core', 'approved',
          NEW.id, NOW()
        )
        ON CONFLICT (student_id, offering_id) DO NOTHING;
      END IF;
    END LOOP;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_auto_core_enrollments ON public.student_stream_assignments;
CREATE TRIGGER trg_auto_core_enrollments
  AFTER INSERT OR UPDATE OF stream_id ON public.student_stream_assignments
  FOR EACH ROW EXECUTE FUNCTION public.auto_create_core_enrollments();

-- ============================================================
-- 15. FUNCTION: check_teacher_workload_warning
--     Returns workload data for a teacher + term so the server
--     action can decide whether to warn or block (Q1 decision: warn).
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_teacher_term_workload(
  p_teacher_id    UUID,
  p_term_id       UUID,
  p_exclude_to_id UUID DEFAULT NULL   -- exclude a specific term_offering (for updates)
)
RETURNS TABLE (
  total_periods     INTEGER,
  offering_count    INTEGER,
  would_exceed_max  BOOLEAN,
  max_periods       INTEGER
) AS $$
DECLARE
  v_school_max INTEGER := 30;  -- configurable per tenant in future
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(to_.periods_per_week), 0)::INTEGER AS total_periods,
    COUNT(to_.id)::INTEGER AS offering_count,
    COALESCE(SUM(to_.periods_per_week), 0) > v_school_max AS would_exceed_max,
    v_school_max AS max_periods
  FROM public.term_offerings to_
  JOIN public.subject_offerings so ON so.id = to_.offering_id
  WHERE
    COALESCE(to_.teacher_override_id, so.teacher_id) = p_teacher_id
    AND to_.term_id = p_term_id
    AND to_.status NOT IN ('cancelled')
    AND (p_exclude_to_id IS NULL OR to_.id != p_exclude_to_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- END OF MIGRATION 043
-- ============================================================
