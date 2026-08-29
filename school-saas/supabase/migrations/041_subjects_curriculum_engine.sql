-- ============================================================
-- Migration 041: Production Subjects & Curriculum Engine
-- Extends subjects table and adds the full curriculum domain:
--   curriculum_streams, subject_streams, curriculum_versions,
--   curriculum_topics, learning_outcomes, curriculum_resources,
--   subject_offerings, teacher_subject_qualifications,
--   student_subject_enrollments, subject_selection_rules,
--   curriculum_coverage_log, ai_usage_logs, academic_audit_logs
-- ============================================================

-- ============================================================
-- 0. ENUMS
-- ============================================================

DO $$ BEGIN
  CREATE TYPE subject_category AS ENUM (
    'science', 'mathematics', 'language', 'social_science',
    'business', 'technology', 'vocational', 'creative_arts',
    'physical_education', 'general', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE subject_type AS ENUM ('academic', 'vocational', 'co_curricular');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE curriculum_status AS ENUM (
    'draft', 'pending_review', 'changes_requested', 'approved', 'published', 'archived'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE offering_status AS ENUM ('active', 'inactive', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE enrollment_status AS ENUM ('active', 'dropped', 'transferred', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE topic_progress AS ENUM ('planned', 'started', 'completed', 'deferred', 'skipped', 'revised');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE resource_type AS ENUM (
    'textbook', 'teacher_guide', 'syllabus', 'pdf', 'document',
    'video', 'url', 'handout', 'learning_material', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE cognitive_level AS ENUM (
    'remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 1. EXTEND SUBJECTS TABLE
-- ============================================================

-- Add new columns (safe — all nullable or with defaults)
ALTER TABLE public.subjects
  ADD COLUMN IF NOT EXISTS short_name         TEXT,
  ADD COLUMN IF NOT EXISTS category           subject_category NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS subject_type_col   subject_type     NOT NULL DEFAULT 'academic',
  ADD COLUMN IF NOT EXISTS national_code      TEXT,
  ADD COLUMN IF NOT EXISTS is_active          BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS archived_at        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_by        UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Deduplicate codes within a tenant before adding unique constraint
-- Mark duplicates with a suffix so constraint can be added safely
DO $$
DECLARE
  dup RECORD;
  counter INTEGER;
BEGIN
  FOR dup IN
    SELECT tenant_id, code, array_agg(id ORDER BY created_at) AS ids
    FROM public.subjects
    WHERE code IS NOT NULL AND code != ''
    GROUP BY tenant_id, code
    HAVING COUNT(*) > 1
  LOOP
    counter := 1;
    FOR i IN 2..array_length(dup.ids, 1) LOOP
      UPDATE public.subjects
        SET code = code || '-DUP' || counter
        WHERE id = dup.ids[i];
      counter := counter + 1;
    END LOOP;
  END LOOP;
END $$;

-- Now safely add unique constraint on (tenant_id, code) for non-null codes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'subjects_tenant_id_code_key'
  ) THEN
    ALTER TABLE public.subjects
      ADD CONSTRAINT subjects_tenant_id_code_key
      UNIQUE (tenant_id, code);
  END IF;
END $$;

-- ============================================================
-- 2. CURRICULUM STREAMS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.curriculum_streams (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  code            TEXT NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  level           TEXT,                      -- 'SSS', 'JSS', 'ALL'
  sort_order      INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, code)
);

-- ============================================================
-- 3. SUBJECT → STREAM MAPPING
-- ============================================================

CREATE TABLE IF NOT EXISTS public.subject_streams (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id  UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  stream_id   UUID NOT NULL REFERENCES public.curriculum_streams(id) ON DELETE CASCADE,
  is_core     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (subject_id, stream_id)
);

-- ============================================================
-- 4. CURRICULUM VERSIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.curriculum_versions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  subject_id        UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  academic_year_id  UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  grade_level       TEXT NOT NULL,
  version           INTEGER NOT NULL DEFAULT 1,
  status            curriculum_status NOT NULL DEFAULT 'draft',
  effective_from    DATE,
  effective_to      DATE,
  notes             TEXT,
  submitted_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  submitted_at      TIMESTAMPTZ,
  approved_by       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at       TIMESTAMPTZ,
  published_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  published_at      TIMESTAMPTZ,
  archived_by       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  archived_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (subject_id, academic_year_id, grade_level, version)
);

-- ============================================================
-- 5. CURRICULUM TOPICS (nested syllabus tree)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.curriculum_topics (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculum_version_id   UUID NOT NULL REFERENCES public.curriculum_versions(id) ON DELETE CASCADE,
  parent_topic_id         UUID REFERENCES public.curriculum_topics(id) ON DELETE CASCADE,
  title                   TEXT NOT NULL,
  description             TEXT,
  sequence                INTEGER NOT NULL DEFAULT 0,
  term                    INTEGER,           -- 1, 2, 3
  estimated_periods       INTEGER DEFAULT 1,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. LEARNING OUTCOMES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.learning_outcomes (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculum_version_id   UUID NOT NULL REFERENCES public.curriculum_versions(id) ON DELETE CASCADE,
  topic_id                UUID REFERENCES public.curriculum_topics(id) ON DELETE CASCADE,
  code                    TEXT,
  description             TEXT NOT NULL,
  cognitive_level         cognitive_level,
  sequence                INTEGER NOT NULL DEFAULT 0,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 7. CURRICULUM RESOURCES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.curriculum_resources (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  subject_id              UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  curriculum_version_id   UUID REFERENCES public.curriculum_versions(id) ON DELETE SET NULL,
  topic_id                UUID REFERENCES public.curriculum_topics(id) ON DELETE SET NULL,
  resource_type           resource_type NOT NULL DEFAULT 'document',
  title                   TEXT NOT NULL,
  description             TEXT,
  url                     TEXT,
  file_path               TEXT,
  author                  TEXT,
  publisher               TEXT,
  edition                 TEXT,
  isbn                    TEXT,
  is_primary              BOOLEAN NOT NULL DEFAULT false,
  created_by              UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 8. SUBJECT OFFERINGS
--    (replaces the limited teacher_assignments semantics)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.subject_offerings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  academic_year_id      UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  term_id               UUID REFERENCES public.terms(id) ON DELETE SET NULL,
  subject_id            UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  section_id            UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  stream_id             UUID REFERENCES public.curriculum_streams(id) ON DELETE SET NULL,
  teacher_id            UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  assistant_teacher_id  UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  curriculum_version_id UUID REFERENCES public.curriculum_versions(id) ON DELETE SET NULL,
  periods_per_week      INTEGER NOT NULL DEFAULT 4,
  duration_minutes      INTEGER NOT NULL DEFAULT 40,
  enrollment_capacity   INTEGER,
  is_compulsory         BOOLEAN NOT NULL DEFAULT true,
  status                offering_status NOT NULL DEFAULT 'active',
  created_by            UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prevent duplicate offerings at the DB level
CREATE UNIQUE INDEX IF NOT EXISTS uq_subject_offering
  ON public.subject_offerings (
    academic_year_id,
    subject_id,
    section_id,
    COALESCE(term_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );

-- ============================================================
-- 9. TEACHER SUBJECT QUALIFICATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.teacher_subject_qualifications (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  teacher_id            UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  subject_id            UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  qualification_level   TEXT,   -- 'degree', 'diploma', 'certified', 'experienced'
  is_primary            BOOLEAN NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (teacher_id, subject_id)
);

-- ============================================================
-- 10. STUDENT SUBJECT ENROLLMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.student_subject_enrollments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  student_id          UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  offering_id         UUID NOT NULL REFERENCES public.subject_offerings(id) ON DELETE CASCADE,
  status              enrollment_status NOT NULL DEFAULT 'active',
  enrolled_by         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  enrolled_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dropped_at          TIMESTAMPTZ,
  dropped_by          UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  UNIQUE (student_id, offering_id)
);

-- ============================================================
-- 11. SUBJECT SELECTION RULES (elective constraints)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.subject_selection_rules (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  grade_level   TEXT,                   -- NULL = applies to all
  stream_id     UUID REFERENCES public.curriculum_streams(id) ON DELETE SET NULL,
  rule_type     TEXT NOT NULL,          -- 'mandatory', 'min_electives', 'max_electives',
                                        --   'prerequisite', 'incompatible', 'stream_restriction'
  subject_id    UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  target_subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  numeric_value INTEGER,                -- for min/max_electives
  description   TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 12. CURRICULUM COVERAGE LOG
-- ============================================================

CREATE TABLE IF NOT EXISTS public.curriculum_coverage_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offering_id     UUID NOT NULL REFERENCES public.subject_offerings(id) ON DELETE CASCADE,
  topic_id        UUID NOT NULL REFERENCES public.curriculum_topics(id) ON DELETE CASCADE,
  outcome_id      UUID REFERENCES public.learning_outcomes(id) ON DELETE CASCADE,
  status          topic_progress NOT NULL DEFAULT 'planned',
  logged_by       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  logged_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes           TEXT,
  UNIQUE (offering_id, topic_id)
);

-- ============================================================
-- 13. AI USAGE LOGS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  feature         TEXT NOT NULL,         -- 'lesson_plan', 'unit_plan', 'assessment', etc.
  model           TEXT,
  subject_id      UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  curriculum_version_id UUID REFERENCES public.curriculum_versions(id) ON DELETE SET NULL,
  input_tokens    INTEGER DEFAULT 0,
  output_tokens   INTEGER DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'success', -- 'success', 'error', 'rate_limited'
  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 14. ACADEMIC AUDIT LOGS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.academic_audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  actor_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,             -- 'subject.created', 'curriculum.published', etc.
  entity      TEXT NOT NULL,             -- 'subject', 'curriculum_version', 'offering', etc.
  entity_id   UUID,
  old_values  JSONB,
  new_values  JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 15. INDEXES
-- ============================================================

-- Subjects
CREATE INDEX IF NOT EXISTS idx_subjects_tenant       ON public.subjects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subjects_dept         ON public.subjects(department_id);
CREATE INDEX IF NOT EXISTS idx_subjects_category     ON public.subjects(category);
CREATE INDEX IF NOT EXISTS idx_subjects_active       ON public.subjects(tenant_id, is_active);

-- Curriculum streams
CREATE INDEX IF NOT EXISTS idx_curriculum_streams_tenant ON public.curriculum_streams(tenant_id);

-- Subject streams
CREATE INDEX IF NOT EXISTS idx_subject_streams_subject ON public.subject_streams(subject_id);
CREATE INDEX IF NOT EXISTS idx_subject_streams_stream  ON public.subject_streams(stream_id);

-- Curriculum versions
CREATE INDEX IF NOT EXISTS idx_cv_tenant      ON public.curriculum_versions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cv_subject     ON public.curriculum_versions(subject_id);
CREATE INDEX IF NOT EXISTS idx_cv_year        ON public.curriculum_versions(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_cv_status      ON public.curriculum_versions(status);

-- Curriculum topics
CREATE INDEX IF NOT EXISTS idx_topics_version ON public.curriculum_topics(curriculum_version_id);
CREATE INDEX IF NOT EXISTS idx_topics_parent  ON public.curriculum_topics(parent_topic_id);

-- Learning outcomes
CREATE INDEX IF NOT EXISTS idx_outcomes_version ON public.learning_outcomes(curriculum_version_id);
CREATE INDEX IF NOT EXISTS idx_outcomes_topic   ON public.learning_outcomes(topic_id);

-- Curriculum resources
CREATE INDEX IF NOT EXISTS idx_resources_tenant  ON public.curriculum_resources(tenant_id);
CREATE INDEX IF NOT EXISTS idx_resources_subject ON public.curriculum_resources(subject_id);
CREATE INDEX IF NOT EXISTS idx_resources_version ON public.curriculum_resources(curriculum_version_id);

-- Subject offerings
CREATE INDEX IF NOT EXISTS idx_offerings_tenant  ON public.subject_offerings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_offerings_year    ON public.subject_offerings(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_offerings_subject ON public.subject_offerings(subject_id);
CREATE INDEX IF NOT EXISTS idx_offerings_section ON public.subject_offerings(section_id);
CREATE INDEX IF NOT EXISTS idx_offerings_teacher ON public.subject_offerings(teacher_id);

-- Teacher qualifications
CREATE INDEX IF NOT EXISTS idx_tq_tenant  ON public.teacher_subject_qualifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tq_teacher ON public.teacher_subject_qualifications(teacher_id);
CREATE INDEX IF NOT EXISTS idx_tq_subject ON public.teacher_subject_qualifications(subject_id);

-- Student enrollments
CREATE INDEX IF NOT EXISTS idx_sse_tenant   ON public.student_subject_enrollments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sse_student  ON public.student_subject_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_sse_offering ON public.student_subject_enrollments(offering_id);

-- Coverage log
CREATE INDEX IF NOT EXISTS idx_coverage_offering ON public.curriculum_coverage_log(offering_id);
CREATE INDEX IF NOT EXISTS idx_coverage_topic    ON public.curriculum_coverage_log(topic_id);

-- AI usage logs
CREATE INDEX IF NOT EXISTS idx_ai_logs_tenant ON public.ai_usage_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_user   ON public.ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_date   ON public.ai_usage_logs(created_at);

-- Audit logs
CREATE INDEX IF NOT EXISTS idx_audit_tenant ON public.academic_audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON public.academic_audit_logs(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor  ON public.academic_audit_logs(actor_id);

-- ============================================================
-- 16. UPDATED_AT TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS set_updated_at_curriculum_streams    ON public.curriculum_streams;
CREATE TRIGGER set_updated_at_curriculum_streams
  BEFORE UPDATE ON public.curriculum_streams
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_curriculum_versions   ON public.curriculum_versions;
CREATE TRIGGER set_updated_at_curriculum_versions
  BEFORE UPDATE ON public.curriculum_versions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_curriculum_topics     ON public.curriculum_topics;
CREATE TRIGGER set_updated_at_curriculum_topics
  BEFORE UPDATE ON public.curriculum_topics
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_learning_outcomes     ON public.learning_outcomes;
CREATE TRIGGER set_updated_at_learning_outcomes
  BEFORE UPDATE ON public.learning_outcomes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_curriculum_resources  ON public.curriculum_resources;
CREATE TRIGGER set_updated_at_curriculum_resources
  BEFORE UPDATE ON public.curriculum_resources
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_subject_offerings     ON public.subject_offerings;
CREATE TRIGGER set_updated_at_subject_offerings
  BEFORE UPDATE ON public.subject_offerings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_teacher_subject_quals ON public.teacher_subject_qualifications;
CREATE TRIGGER set_updated_at_teacher_subject_quals
  BEFORE UPDATE ON public.teacher_subject_qualifications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_subject_selection_rules ON public.subject_selection_rules;
CREATE TRIGGER set_updated_at_subject_selection_rules
  BEFORE UPDATE ON public.subject_selection_rules
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 17. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.curriculum_streams          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_streams             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_versions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_topics           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_outcomes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_resources        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_offerings           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_subject_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_subject_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_selection_rules     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_coverage_log     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_logs               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_audit_logs         ENABLE ROW LEVEL SECURITY;

-- CURRICULUM STREAMS
CREATE POLICY "Super admins manage curriculum_streams"
  ON public.curriculum_streams FOR ALL TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "Tenant users view curriculum_streams"
  ON public.curriculum_streams FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "School admins manage curriculum_streams"
  ON public.curriculum_streams FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id() AND public.is_school_admin());

-- SUBJECT STREAMS (join table — access via subject's tenant)
CREATE POLICY "Tenant users view subject_streams"
  ON public.subject_streams FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.subjects s
      WHERE s.id = subject_id AND s.tenant_id = public.get_user_tenant_id()
    )
  );

CREATE POLICY "School admins manage subject_streams"
  ON public.subject_streams FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.subjects s
      WHERE s.id = subject_id AND s.tenant_id = public.get_user_tenant_id()
        AND public.is_school_admin()
    )
  );

-- CURRICULUM VERSIONS
CREATE POLICY "Super admins manage curriculum_versions"
  ON public.curriculum_versions FOR ALL TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "Tenant users view curriculum_versions"
  ON public.curriculum_versions FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "School admins manage curriculum_versions"
  ON public.curriculum_versions FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id() AND public.is_school_admin());

-- CURRICULUM TOPICS
CREATE POLICY "Tenant users view curriculum_topics"
  ON public.curriculum_topics FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.curriculum_versions cv
      WHERE cv.id = curriculum_version_id AND cv.tenant_id = public.get_user_tenant_id()
    )
  );

CREATE POLICY "School admins manage curriculum_topics"
  ON public.curriculum_topics FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.curriculum_versions cv
      WHERE cv.id = curriculum_version_id AND cv.tenant_id = public.get_user_tenant_id()
        AND public.is_school_admin()
    )
  );

-- LEARNING OUTCOMES
CREATE POLICY "Tenant users view learning_outcomes"
  ON public.learning_outcomes FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.curriculum_versions cv
      WHERE cv.id = curriculum_version_id AND cv.tenant_id = public.get_user_tenant_id()
    )
  );

CREATE POLICY "School admins manage learning_outcomes"
  ON public.learning_outcomes FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.curriculum_versions cv
      WHERE cv.id = curriculum_version_id AND cv.tenant_id = public.get_user_tenant_id()
        AND public.is_school_admin()
    )
  );

-- CURRICULUM RESOURCES
CREATE POLICY "Super admins manage curriculum_resources"
  ON public.curriculum_resources FOR ALL TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "Tenant users view curriculum_resources"
  ON public.curriculum_resources FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "School admins and teachers manage curriculum_resources"
  ON public.curriculum_resources FOR ALL TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id()
    AND (public.is_school_admin() OR public.is_teacher())
  );

-- SUBJECT OFFERINGS
CREATE POLICY "Super admins manage subject_offerings"
  ON public.subject_offerings FOR ALL TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "Tenant users view subject_offerings"
  ON public.subject_offerings FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "School admins manage subject_offerings"
  ON public.subject_offerings FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id() AND public.is_school_admin());

-- TEACHER SUBJECT QUALIFICATIONS
CREATE POLICY "Super admins manage teacher_subject_qualifications"
  ON public.teacher_subject_qualifications FOR ALL TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "Tenant users view teacher_subject_qualifications"
  ON public.teacher_subject_qualifications FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "School admins manage teacher_subject_qualifications"
  ON public.teacher_subject_qualifications FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id() AND public.is_school_admin());

-- STUDENT SUBJECT ENROLLMENTS
CREATE POLICY "Super admins manage student_subject_enrollments"
  ON public.student_subject_enrollments FOR ALL TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "Tenant users view student_subject_enrollments"
  ON public.student_subject_enrollments FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "School admins manage student_subject_enrollments"
  ON public.student_subject_enrollments FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id() AND public.is_school_admin());

-- SUBJECT SELECTION RULES
CREATE POLICY "Tenant users view subject_selection_rules"
  ON public.subject_selection_rules FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "School admins manage subject_selection_rules"
  ON public.subject_selection_rules FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id() AND public.is_school_admin());

-- CURRICULUM COVERAGE LOG
CREATE POLICY "Tenant users view curriculum_coverage_log"
  ON public.curriculum_coverage_log FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.subject_offerings so
      WHERE so.id = offering_id AND so.tenant_id = public.get_user_tenant_id()
    )
  );

CREATE POLICY "School admins and teachers manage curriculum_coverage_log"
  ON public.curriculum_coverage_log FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.subject_offerings so
      WHERE so.id = offering_id AND so.tenant_id = public.get_user_tenant_id()
        AND (public.is_school_admin() OR public.is_teacher())
    )
  );

-- AI USAGE LOGS (users can only see their own)
CREATE POLICY "Super admins view all ai_usage_logs"
  ON public.ai_usage_logs FOR SELECT TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "School admins view tenant ai_usage_logs"
  ON public.ai_usage_logs FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id() AND public.is_school_admin());

CREATE POLICY "Users view own ai_usage_logs"
  ON public.ai_usage_logs FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Server inserts ai_usage_logs"
  ON public.ai_usage_logs FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.get_user_tenant_id() AND user_id = auth.uid());

-- ACADEMIC AUDIT LOGS (read-only for admins)
CREATE POLICY "Super admins view all audit_logs"
  ON public.academic_audit_logs FOR SELECT TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "School admins view tenant audit_logs"
  ON public.academic_audit_logs FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id() AND public.is_school_admin());

CREATE POLICY "Server inserts audit_logs"
  ON public.academic_audit_logs FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.get_user_tenant_id());

-- ============================================================
-- 18. SEED: Sierra Leone SSS Curriculum Streams
--     (These are reference streams; seeded into all tenants
--      with SL school levels. Schools can customise.)
-- ============================================================
-- Note: Streams are tenant-scoped, so this seeds them on
-- demand via a helper function called at school creation time.
-- For existing tenants, we insert via a manual seed below
-- using a DO block that iterates over existing tenants.
-- Each tenant gets the 6 MBSSE SSS streams.

DO $$
DECLARE
  t RECORD;
BEGIN
  FOR t IN SELECT id FROM public.tenants LOOP
    INSERT INTO public.curriculum_streams (tenant_id, code, name, description, level, sort_order)
    VALUES
      (t.id, 'SCI_TECH',   'Sciences & Technologies',              'Physics, Chemistry, Biology, ICT, Technical Drawing', 'SSS', 1),
      (t.id, 'MAT_NUM',    'Mathematics & Numeracies',             'Pure Mathematics, Further Maths, Statistics, Accounting', 'SSS', 2),
      (t.id, 'LANG_LIT',   'Languages & Literatures',              'English, Krio, French, Arabic, Literature', 'SSS', 3),
      (t.id, 'SOC_CULT',   'Social & Cultural Studies',            'History, Geography, Government, Religious Studies, Music', 'SSS', 4),
      (t.id, 'ECON_BUS',   'Economics, Business & Entrepreneurship','Economics, Commerce, Business Management, Accounting', 'SSS', 5),
      (t.id, 'TECH_VOC',   'Technical & Vocational',               'Technical subjects, vocational pathways', 'TVET', 6),
      (t.id, 'GENERAL',    'General (All Levels)',                  'Subjects applicable across all levels', 'ALL', 7)
    ON CONFLICT (tenant_id, code) DO NOTHING;
  END LOOP;
END $$;
