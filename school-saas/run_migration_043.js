const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.yhrvmppfwjxninvbblrt:vV648%40a56R8S%25%232@aws-0-eu-west-1.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('Connected to DB!');

  // Run each block separately to isolate the error
  const steps = [
    {
      name: 'Create cv_workflow_status enum',
      sql: `DO $$ BEGIN CREATE TYPE cv_workflow_status AS ENUM ('draft','submitted','in_review','changes_requested','approved','published','superseded','archived'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`
    },
    {
      name: 'Create cv_source enum',
      sql: `DO $$ BEGIN CREATE TYPE cv_source AS ENUM ('school','district','ministry','waec','bece','other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`
    },
    {
      name: 'Create stream_rule_type enum',
      sql: `DO $$ BEGIN CREATE TYPE stream_rule_type AS ENUM ('core','elective'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`
    },
    {
      name: 'Create stream_assignment_status enum',
      sql: `DO $$ BEGIN CREATE TYPE stream_assignment_status AS ENUM ('active','changed','withdrawn'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`
    },
    {
      name: 'Create term_offering_status enum',
      sql: `DO $$ BEGIN CREATE TYPE term_offering_status AS ENUM ('pending','active','suspended','completed','cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`
    },
    {
      name: 'Create timetable_status enum',
      sql: `DO $$ BEGIN CREATE TYPE timetable_status AS ENUM ('pending','scheduled','active','completed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`
    },
    {
      name: 'Extend subjects',
      sql: `ALTER TABLE public.subjects
        ADD COLUMN IF NOT EXISTS is_examinable           BOOLEAN NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS exam_board_code          TEXT,
        ADD COLUMN IF NOT EXISTS default_periods_per_week INTEGER NOT NULL DEFAULT 4,
        ADD COLUMN IF NOT EXISTS default_period_duration  INTEGER NOT NULL DEFAULT 40,
        ADD COLUMN IF NOT EXISTS max_class_size           INTEGER`
    },
    {
      name: 'Extend curriculum_versions',
      sql: `ALTER TABLE public.curriculum_versions
        ADD COLUMN IF NOT EXISTS version_label          TEXT,
        ADD COLUMN IF NOT EXISTS source                 TEXT NOT NULL DEFAULT 'school',
        ADD COLUMN IF NOT EXISTS is_national_curriculum BOOLEAN NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS superseded_by          UUID REFERENCES public.curriculum_versions(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS review_notes           TEXT,
        ADD COLUMN IF NOT EXISTS rejection_reason       TEXT,
        ADD COLUMN IF NOT EXISTS reviewed_by            UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS reviewed_at            TIMESTAMPTZ`
    },
    {
      name: 'Auto-generate version_labels',
      sql: `UPDATE public.curriculum_versions SET version_label = 'v' || EXTRACT(YEAR FROM created_at)::text || '.' || version::text WHERE version_label IS NULL`
    },
    {
      name: 'Extend subject_offerings - requirement_type',
      sql: `ALTER TABLE public.subject_offerings ADD COLUMN IF NOT EXISTS requirement_type TEXT NOT NULL DEFAULT 'core'`
    },
    {
      name: 'Extend subject_offerings - elective_group',
      sql: `ALTER TABLE public.subject_offerings ADD COLUMN IF NOT EXISTS elective_group TEXT`
    },
    {
      name: 'Extend subject_offerings - overload_flag',
      sql: `ALTER TABLE public.subject_offerings ADD COLUMN IF NOT EXISTS overload_flag BOOLEAN NOT NULL DEFAULT false`
    },
    {
      name: 'Create curriculum_workflow_log',
      sql: `CREATE TABLE IF NOT EXISTS public.curriculum_workflow_log (
        id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        curriculum_version_id UUID NOT NULL REFERENCES public.curriculum_versions(id) ON DELETE CASCADE,
        from_status           TEXT,
        to_status             TEXT NOT NULL,
        actioned_by           UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
        comment               TEXT,
        actioned_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`
    },
    {
      name: 'Index curriculum_workflow_log',
      sql: `CREATE INDEX IF NOT EXISTS idx_cwl_version ON public.curriculum_workflow_log(curriculum_version_id);
            CREATE INDEX IF NOT EXISTS idx_cwl_actor ON public.curriculum_workflow_log(actioned_by)`
    },
    {
      name: 'Create stream_subject_rules',
      sql: `CREATE TABLE IF NOT EXISTS public.stream_subject_rules (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id        UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
        stream_id        UUID NOT NULL REFERENCES public.curriculum_streams(id) ON DELETE CASCADE,
        subject_id       UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
        academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE,
        rule_type        TEXT NOT NULL DEFAULT 'core',
        elective_group   TEXT,
        min_selections   INTEGER NOT NULL DEFAULT 1,
        max_selections   INTEGER NOT NULL DEFAULT 1,
        sort_order       INTEGER NOT NULL DEFAULT 0,
        is_active        BOOLEAN NOT NULL DEFAULT true,
        created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`
    },
    {
      name: 'Unique index stream_subject_rules',
      sql: `CREATE UNIQUE INDEX IF NOT EXISTS uq_stream_subject_rule
        ON public.stream_subject_rules (stream_id, subject_id, COALESCE(academic_year_id::text, 'ALL'))`
    },
    {
      name: 'Indexes stream_subject_rules',
      sql: `CREATE INDEX IF NOT EXISTS idx_ssr_tenant  ON public.stream_subject_rules(tenant_id);
            CREATE INDEX IF NOT EXISTS idx_ssr_stream  ON public.stream_subject_rules(stream_id);
            CREATE INDEX IF NOT EXISTS idx_ssr_subject ON public.stream_subject_rules(subject_id);
            CREATE INDEX IF NOT EXISTS idx_ssr_year    ON public.stream_subject_rules(academic_year_id)`
    },
    {
      name: 'Create student_stream_assignments',
      sql: `CREATE TABLE IF NOT EXISTS public.student_stream_assignments (
        id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id           UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
        student_id          UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
        stream_id           UUID NOT NULL REFERENCES public.curriculum_streams(id) ON DELETE RESTRICT,
        academic_year_id    UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
        section_id          UUID REFERENCES public.sections(id) ON DELETE SET NULL,
        assigned_by         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
        assigned_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        status              TEXT NOT NULL DEFAULT 'active',
        previous_stream_id  UUID REFERENCES public.curriculum_streams(id) ON DELETE SET NULL,
        change_reason       TEXT,
        electives_submitted BOOLEAN NOT NULL DEFAULT false,
        electives_approved  BOOLEAN NOT NULL DEFAULT false,
        electives_locked    BOOLEAN NOT NULL DEFAULT false,
        UNIQUE (student_id, academic_year_id)
      )`
    },
    {
      name: 'Indexes student_stream_assignments',
      sql: `CREATE INDEX IF NOT EXISTS idx_ssa_tenant  ON public.student_stream_assignments(tenant_id);
            CREATE INDEX IF NOT EXISTS idx_ssa_student ON public.student_stream_assignments(student_id);
            CREATE INDEX IF NOT EXISTS idx_ssa_stream  ON public.student_stream_assignments(stream_id);
            CREATE INDEX IF NOT EXISTS idx_ssa_year    ON public.student_stream_assignments(academic_year_id);
            CREATE INDEX IF NOT EXISTS idx_ssa_section ON public.student_stream_assignments(section_id)`
    },
    {
      name: 'Create term_offerings',
      sql: `CREATE TABLE IF NOT EXISTS public.term_offerings (
        id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id                   UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
        offering_id                 UUID NOT NULL REFERENCES public.subject_offerings(id) ON DELETE CASCADE,
        term_id                     UUID NOT NULL REFERENCES public.terms(id) ON DELETE CASCADE,
        teacher_override_id         UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
        curriculum_version_override UUID REFERENCES public.curriculum_versions(id) ON DELETE SET NULL,
        periods_per_week            INTEGER NOT NULL DEFAULT 4,
        period_duration_mins        INTEGER NOT NULL DEFAULT 40,
        timetable_status            TEXT NOT NULL DEFAULT 'pending',
        status                      TEXT NOT NULL DEFAULT 'pending',
        lesson_count                INTEGER NOT NULL DEFAULT 0,
        attendance_rate             NUMERIC(5,2),
        notes                       TEXT,
        created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (offering_id, term_id)
      )`
    },
    {
      name: 'Indexes term_offerings',
      sql: `CREATE INDEX IF NOT EXISTS idx_to_tenant   ON public.term_offerings(tenant_id);
            CREATE INDEX IF NOT EXISTS idx_to_offering ON public.term_offerings(offering_id);
            CREATE INDEX IF NOT EXISTS idx_to_term     ON public.term_offerings(term_id);
            CREATE INDEX IF NOT EXISTS idx_to_teacher  ON public.term_offerings(teacher_override_id);
            CREATE INDEX IF NOT EXISTS idx_to_status   ON public.term_offerings(status)`
    },
    {
      name: 'Extend student_subject_enrollments',
      sql: `ALTER TABLE public.student_subject_enrollments
        ADD COLUMN IF NOT EXISTS enrollment_type      TEXT NOT NULL DEFAULT 'standard',
        ADD COLUMN IF NOT EXISTS elective_group       TEXT,
        ADD COLUMN IF NOT EXISTS approval_status      TEXT NOT NULL DEFAULT 'approved',
        ADD COLUMN IF NOT EXISTS approved_by          UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS approved_at          TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS waitlist_position    INTEGER,
        ADD COLUMN IF NOT EXISTS stream_assignment_id UUID REFERENCES public.student_stream_assignments(id) ON DELETE SET NULL`
    },
    {
      name: 'Updated_at trigger for stream_subject_rules',
      sql: `DROP TRIGGER IF EXISTS set_updated_at_stream_subject_rules ON public.stream_subject_rules;
            CREATE TRIGGER set_updated_at_stream_subject_rules BEFORE UPDATE ON public.stream_subject_rules FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()`
    },
    {
      name: 'Updated_at trigger for term_offerings',
      sql: `DROP TRIGGER IF EXISTS set_updated_at_term_offerings ON public.term_offerings;
            CREATE TRIGGER set_updated_at_term_offerings BEFORE UPDATE ON public.term_offerings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()`
    },
    {
      name: 'RLS enable curriculum_workflow_log',
      sql: `ALTER TABLE public.curriculum_workflow_log ENABLE ROW LEVEL SECURITY`
    },
    {
      name: 'RLS enable stream_subject_rules',
      sql: `ALTER TABLE public.stream_subject_rules ENABLE ROW LEVEL SECURITY`
    },
    {
      name: 'RLS enable student_stream_assignments',
      sql: `ALTER TABLE public.student_stream_assignments ENABLE ROW LEVEL SECURITY`
    },
    {
      name: 'RLS enable term_offerings',
      sql: `ALTER TABLE public.term_offerings ENABLE ROW LEVEL SECURITY`
    },
    {
      name: 'RLS policies curriculum_workflow_log',
      sql: `DO $$ BEGIN
        CREATE POLICY "Tenant users view curriculum_workflow_log" ON public.curriculum_workflow_log FOR SELECT TO authenticated
          USING (EXISTS (SELECT 1 FROM public.curriculum_versions cv WHERE cv.id = curriculum_version_id AND cv.tenant_id = public.get_user_tenant_id()));
        EXCEPTION WHEN duplicate_object THEN NULL; END $$`
    },
    {
      name: 'RLS policies stream_subject_rules',
      sql: `DO $$ BEGIN
        CREATE POLICY "Tenant users view stream_subject_rules" ON public.stream_subject_rules FOR SELECT TO authenticated USING (tenant_id = public.get_user_tenant_id());
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
        DO $$ BEGIN
        CREATE POLICY "School admins manage stream_subject_rules" ON public.stream_subject_rules FOR ALL TO authenticated USING (tenant_id = public.get_user_tenant_id() AND public.is_school_admin());
        EXCEPTION WHEN duplicate_object THEN NULL; END $$`
    },
    {
      name: 'RLS policies student_stream_assignments',
      sql: `DO $$ BEGIN
        CREATE POLICY "Tenant users view student_stream_assignments" ON public.student_stream_assignments FOR SELECT TO authenticated USING (tenant_id = public.get_user_tenant_id());
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
        DO $$ BEGIN
        CREATE POLICY "School admins manage student_stream_assignments" ON public.student_stream_assignments FOR ALL TO authenticated USING (tenant_id = public.get_user_tenant_id() AND public.is_school_admin());
        EXCEPTION WHEN duplicate_object THEN NULL; END $$`
    },
    {
      name: 'RLS policies term_offerings',
      sql: `DO $$ BEGIN
        CREATE POLICY "Tenant users view term_offerings" ON public.term_offerings FOR SELECT TO authenticated USING (tenant_id = public.get_user_tenant_id());
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
        DO $$ BEGIN
        CREATE POLICY "School admins manage term_offerings" ON public.term_offerings FOR ALL TO authenticated USING (tenant_id = public.get_user_tenant_id() AND public.is_school_admin());
        EXCEPTION WHEN duplicate_object THEN NULL; END $$`
    },
    {
      name: 'Create teacher_workload_summary view',
      sql: `CREATE OR REPLACE VIEW public.teacher_workload_summary AS
        SELECT
          COALESCE(to2.teacher_override_id, so.teacher_id) AS teacher_id,
          so.academic_year_id,
          to2.term_id,
          COUNT(DISTINCT to2.id)::INTEGER AS offering_count,
          COALESCE(SUM(to2.periods_per_week),0)::INTEGER AS total_periods_week,
          COALESCE(SUM(to2.periods_per_week * to2.period_duration_mins),0)::INTEGER AS total_teaching_mins_week,
          BOOL_OR(so.overload_flag) AS has_overload_flag
        FROM public.term_offerings to2
        JOIN public.subject_offerings so ON so.id = to2.offering_id
        WHERE to2.status <> 'cancelled' AND so.status <> 'cancelled'
        GROUP BY COALESCE(to2.teacher_override_id, so.teacher_id), so.academic_year_id, to2.term_id`
    },
    {
      name: 'Create stream_enrollment_summary view',
      sql: `CREATE OR REPLACE VIEW public.stream_enrollment_summary AS
        SELECT
          ssa.stream_id,
          ssa.academic_year_id,
          ssa.tenant_id,
          COUNT(*) AS total_students,
          COUNT(*) FILTER (WHERE ssa.electives_approved) AS electives_approved_count,
          COUNT(*) FILTER (WHERE ssa.electives_submitted AND NOT ssa.electives_approved) AS pending_approval_count,
          COUNT(*) FILTER (WHERE NOT ssa.electives_submitted) AS not_submitted_count
        FROM public.student_stream_assignments ssa
        WHERE ssa.status = 'active'
        GROUP BY ssa.stream_id, ssa.academic_year_id, ssa.tenant_id`
    },
    {
      name: 'Create get_teacher_term_workload function',
      sql: `CREATE OR REPLACE FUNCTION public.get_teacher_term_workload(
          p_teacher_id    UUID,
          p_term_id       UUID,
          p_exclude_to_id UUID DEFAULT NULL
        )
        RETURNS TABLE (
          total_periods    INTEGER,
          offering_count   INTEGER,
          would_exceed_max BOOLEAN,
          max_periods      INTEGER
        ) AS $$
        DECLARE v_school_max INTEGER := 30;
        BEGIN
          RETURN QUERY
          SELECT
            COALESCE(SUM(to2.periods_per_week), 0)::INTEGER,
            COUNT(to2.id)::INTEGER,
            COALESCE(SUM(to2.periods_per_week), 0) > v_school_max,
            v_school_max
          FROM public.term_offerings to2
          JOIN public.subject_offerings so ON so.id = to2.offering_id
          WHERE COALESCE(to2.teacher_override_id, so.teacher_id) = p_teacher_id
            AND to2.term_id = p_term_id
            AND to2.status <> 'cancelled'
            AND (p_exclude_to_id IS NULL OR to2.id <> p_exclude_to_id);
        END; $$ LANGUAGE plpgsql SECURITY DEFINER`
    },
    {
      name: 'Create auto_create_core_enrollments function',
      sql: `CREATE OR REPLACE FUNCTION public.auto_create_core_enrollments()
        RETURNS TRIGGER AS $$
        DECLARE
          rule     RECORD;
          off_id   UUID;
        BEGIN
          IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.stream_id IS DISTINCT FROM OLD.stream_id) THEN
            IF TG_OP = 'UPDATE' AND OLD.stream_id IS NOT NULL THEN
              UPDATE public.student_subject_enrollments
              SET status = 'dropped', dropped_at = NOW()
              WHERE student_id = NEW.student_id
                AND enrollment_type = 'stream_core'
                AND stream_assignment_id = NEW.id
                AND status = 'active';
            END IF;
            FOR rule IN
              SELECT ssr.*
              FROM public.stream_subject_rules ssr
              WHERE ssr.stream_id = NEW.stream_id
                AND ssr.rule_type = 'core'
                AND ssr.is_active = true
                AND (ssr.academic_year_id IS NULL OR ssr.academic_year_id = NEW.academic_year_id)
            LOOP
              SELECT so.id INTO off_id
              FROM public.subject_offerings so
              WHERE so.subject_id = rule.subject_id
                AND so.academic_year_id = NEW.academic_year_id
                AND so.tenant_id = NEW.tenant_id
                AND (NEW.section_id IS NULL OR so.section_id = NEW.section_id)
                AND so.status = 'active'
              LIMIT 1;
              IF off_id IS NOT NULL THEN
                INSERT INTO public.student_subject_enrollments
                  (tenant_id, student_id, offering_id, status, enrollment_type, approval_status, stream_assignment_id, enrolled_at)
                VALUES
                  (NEW.tenant_id, NEW.student_id, off_id, 'active', 'stream_core', 'approved', NEW.id, NOW())
                ON CONFLICT (student_id, offering_id) DO NOTHING;
              END IF;
            END LOOP;
          END IF;
          RETURN NEW;
        END; $$ LANGUAGE plpgsql SECURITY DEFINER`
    },
    {
      name: 'Create auto_create_core_enrollments trigger',
      sql: `DROP TRIGGER IF EXISTS trg_auto_core_enrollments ON public.student_stream_assignments;
            CREATE TRIGGER trg_auto_core_enrollments
              AFTER INSERT OR UPDATE OF stream_id ON public.student_stream_assignments
              FOR EACH ROW EXECUTE FUNCTION public.auto_create_core_enrollments()`
    },
  ];

  let passed = 0;
  let failed = 0;
  for (const step of steps) {
    try {
      await client.query(step.sql);
      console.log(`  ✅ ${step.name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ ${step.name}: ${err.message}`);
      failed++;
    }
  }

  await client.end();
  console.log(`\n📊 Done: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

run().catch(err => { console.error(err.message); process.exit(1); });
