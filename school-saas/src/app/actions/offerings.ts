'use server';

import { getPgPool } from '@/lib/db/pg-fallback';
import { revalidatePath } from 'next/cache';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface SubjectOfferingRecord {
  id: string;
  tenant_id: string;
  academic_year_id: string;
  academic_year_name?: string;
  term_id?: string;
  term_name?: string;
  subject_id: string;
  subject_name?: string;
  subject_code?: string;
  section_id: string;
  section_name?: string;
  class_name?: string;
  stream_id?: string;
  stream_name?: string;
  teacher_id?: string;
  teacher_name?: string;
  assistant_teacher_id?: string;
  assistant_teacher_name?: string;
  curriculum_version_id?: string;
  periods_per_week: number;
  duration_minutes: number;
  enrollment_capacity?: number;
  current_enrollment?: number;
  is_compulsory: boolean;
  requirement_type?: 'core' | 'elective';
  elective_group?: string;
  overload_flag?: boolean;
  status: string;
  created_at: string;
}

export interface TermOfferingRecord {
  id: string;
  tenant_id: string;
  subject_offering_id: string;
  term_id: string;
  term_name?: string;
  subject_id?: string;
  subject_name?: string;
  subject_code?: string;
  class_name?: string;
  section_name?: string;
  teacher_id?: string;
  teacher_name?: string;
  assistant_teacher_id?: string;
  assistant_teacher_name?: string;
  periods_per_week: number;
  duration_minutes: number;
  timetable_status: 'draft' | 'scheduled' | 'active' | 'cancelled';
  status: 'active' | 'completed' | 'suspended';
  overload_flag: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OfferingMutationResult {
  success: boolean;
  offering?: SubjectOfferingRecord;
  error?: string;
  overload_warning?: boolean;
  current_periods?: number;
  projected_periods?: number;
  max_periods?: number;
  teacher_name?: string;
  overloaded?: boolean;
}

export interface TeacherWorkloadRecord {
  teacher_id: string;
  teacher_name: string;
  department_name?: string;
  total_periods: number;
  offering_count: number;
  overload_flag?: boolean;
  offerings: {
    offering_id: string;
    subject_name: string;
    section_name: string;
    class_name: string;
    periods_per_week: number;
    overload_flag?: boolean;
  }[];
}

export interface AllocationMatrixRow {
  teacher_id: string;
  teacher_name: string;
  employee_id?: string;
  department_name?: string;
  total_periods: number;
  max_periods: number;
  is_overloaded?: boolean;
  assignments: {
    section_id: string;
    section_name: string;
    class_name: string;
    offering_id?: string;
    subject_id?: string;
    subject_name?: string;
    subject_code?: string;
    periods_per_week?: number;
    is_form_tutor?: boolean;
    overload_flag?: boolean;
  }[];
}

// ─────────────────────────────────────────────────────────────
// Helper: resolve tenant UUID
// ─────────────────────────────────────────────────────────────

async function resolveTenantId(slugOrId: string): Promise<string | null> {
  const pool = getPgPool();
  if (!pool) return null;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
  if (isUuid) return slugOrId;
  const res = await pool.query('SELECT id FROM tenants WHERE slug = $1 LIMIT 1', [slugOrId.toLowerCase().trim()]);
  return res.rows[0]?.id || null;
}

async function resolveUserId(): Promise<string | null> {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: getSubjectOfferings
// ─────────────────────────────────────────────────────────────

export async function getSubjectOfferings(
  tenantSlug: string,
  filters: {
    academic_year_id?: string;
    term_id?: string;
    subject_id?: string;
    teacher_id?: string;
    section_id?: string;
    status?: string;
  } = {}
): Promise<{ success: boolean; data: SubjectOfferingRecord[]; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) return { success: false, data: [], error: 'Tenant not found.' };

    const pool = getPgPool();
    if (!pool) return { success: false, data: [], error: 'Database unavailable.' };

    const conditions = ['so.tenant_id = $1'];
    const params: unknown[] = [tenantId];
    let p = 2;

    if (filters.academic_year_id) { conditions.push(`so.academic_year_id = $${p++}`); params.push(filters.academic_year_id); }
    if (filters.term_id)           { conditions.push(`so.term_id = $${p++}`);           params.push(filters.term_id); }
    if (filters.subject_id)        { conditions.push(`so.subject_id = $${p++}`);        params.push(filters.subject_id); }
    if (filters.teacher_id)        { conditions.push(`so.teacher_id = $${p++}`);        params.push(filters.teacher_id); }
    if (filters.section_id)        { conditions.push(`so.section_id = $${p++}`);        params.push(filters.section_id); }
    if (filters.status)            { conditions.push(`so.status = $${p++}`);            params.push(filters.status); }

    const res = await pool.query(
      `SELECT
          so.*,
          s.name AS subject_name, s.code AS subject_code,
          sec.name AS section_name,
          cl.name AS class_name,
          ay.name AS academic_year_name,
          t.name AS term_name,
          cs.name AS stream_name,
          (te.first_name || ' ' || te.last_name) AS teacher_name,
          (ate.first_name || ' ' || ate.last_name) AS assistant_teacher_name,
          (SELECT COUNT(*) FROM student_subject_enrollments sse
            WHERE sse.offering_id = so.id AND sse.status = 'active') AS current_enrollment
        FROM subject_offerings so
        JOIN subjects s ON s.id = so.subject_id
        JOIN sections sec ON sec.id = so.section_id
        JOIN classes cl ON cl.id = sec.class_id
        JOIN academic_years ay ON ay.id = so.academic_year_id
        LEFT JOIN terms t ON t.id = so.term_id
        LEFT JOIN curriculum_streams cs ON cs.id = so.stream_id
        LEFT JOIN teachers te ON te.id = so.teacher_id
        LEFT JOIN teachers ate ON ate.id = so.assistant_teacher_id
        WHERE ${conditions.join(' AND ')}
        ORDER BY cl.sort_order, sec.name, s.name`,
      params
    );

    return { success: true, data: res.rows };
  } catch (err: any) {
    return { success: false, data: [], error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: createSubjectOffering
// ─────────────────────────────────────────────────────────────

export async function createSubjectOffering(
  tenantSlug: string,
  payload: {
    academic_year_id: string;
    term_id?: string;
    subject_id: string;
    section_id: string;
    stream_id?: string;
    teacher_id?: string;
    assistant_teacher_id?: string;
    curriculum_version_id?: string;
    periods_per_week?: number;
    duration_minutes?: number;
    enrollment_capacity?: number;
    is_compulsory?: boolean;
    requirement_type?: 'core' | 'elective';
    elective_group?: string;
    override_overload?: boolean;
  }
): Promise<OfferingMutationResult> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    const userId = await resolveUserId();
    if (!tenantId) return { success: false, error: 'Tenant not found.' };

    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database unavailable.' };

    let isOverloaded = false;

    // Validate teacher workload if teacher is assigned (Option B: Warn but allow)
    if (payload.teacher_id) {
      const workload = await getTeacherWorkload(tenantSlug, payload.teacher_id, payload.academic_year_id);
      if (workload.success && workload.data) {
        const addedPeriods = payload.periods_per_week || 4;
        const projectedPeriods = workload.data.total_periods + addedPeriods;
        const maxPeriods = 30; // configurable standard threshold

        if (projectedPeriods > maxPeriods) {
          isOverloaded = true;
          if (!payload.override_overload) {
            const tRes = await pool.query('SELECT first_name, last_name FROM teachers WHERE id = $1', [payload.teacher_id]);
            const teacherName = tRes.rows[0] ? `${tRes.rows[0].first_name} ${tRes.rows[0].last_name}` : 'Teacher';
            return {
              success: false,
              overload_warning: true,
              current_periods: workload.data.total_periods,
              projected_periods: projectedPeriods,
              max_periods: maxPeriods,
              teacher_name: teacherName,
              error: `Assigning this offering will give ${teacherName} ${projectedPeriods} periods/week, exceeding the standard threshold of ${maxPeriods} periods/week.`
            };
          }
        }
      }
    }

    const res = await pool.query(
      `INSERT INTO subject_offerings (
          tenant_id, academic_year_id, term_id, subject_id, section_id, stream_id,
          teacher_id, assistant_teacher_id, curriculum_version_id,
          periods_per_week, duration_minutes, enrollment_capacity,
          is_compulsory, requirement_type, elective_group, overload_flag, status, created_by
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'active',$17)
        RETURNING id`,
      [
        tenantId,
        payload.academic_year_id,
        payload.term_id || null,
        payload.subject_id,
        payload.section_id,
        payload.stream_id || null,
        payload.teacher_id || null,
        payload.assistant_teacher_id || null,
        payload.curriculum_version_id || null,
        payload.periods_per_week || 4,
        payload.duration_minutes || 40,
        payload.enrollment_capacity || null,
        payload.is_compulsory ?? true,
        payload.requirement_type || 'core',
        payload.elective_group || null,
        isOverloaded,
        userId,
      ]
    );

    const offeringId = res.rows[0].id;

    await pool.query(
      `INSERT INTO academic_audit_logs (tenant_id, actor_id, action, entity, entity_id, new_values)
       VALUES ($1, $2, $3, 'subject_offering', $4, $5)`,
      [
        tenantId,
        userId,
        isOverloaded ? 'offering.created_with_overload_override' : 'offering.created',
        offeringId,
        JSON.stringify({
          subject_id: payload.subject_id,
          section_id: payload.section_id,
          teacher_id: payload.teacher_id,
          overload_flag: isOverloaded,
        })
      ]
    );

    revalidatePath(`/${tenantSlug}/admin/academics/teacher-allocation`);
    revalidatePath(`/${tenantSlug}/admin/academics/subjects`);
    revalidatePath(`/${tenantSlug}/admin/academics/offerings`);
    return { success: true, overloaded: isOverloaded };
  } catch (err: any) {
    if (err.code === '23505') {
      return { success: false, error: 'This subject is already assigned to this class for the selected year/term.' };
    }
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: updateSubjectOffering
// ─────────────────────────────────────────────────────────────

export async function updateSubjectOffering(
  tenantSlug: string,
  offeringId: string,
  payload: {
    teacher_id?: string | null;
    assistant_teacher_id?: string | null;
    periods_per_week?: number;
    enrollment_capacity?: number | null;
    status?: string;
    curriculum_version_id?: string | null;
    override_overload?: boolean;
  }
): Promise<OfferingMutationResult> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    const userId = await resolveUserId();
    if (!tenantId) return { success: false, error: 'Tenant not found.' };

    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database unavailable.' };

    let isOverloaded = false;

    // Re-validate workload if changing teacher or changing periods
    if (payload.teacher_id !== undefined && payload.teacher_id !== null) {
      const current = await pool.query(
        `SELECT academic_year_id, periods_per_week, teacher_id FROM subject_offerings WHERE id = $1`,
        [offeringId]
      );
      if (current.rows.length > 0) {
        const workload = await getTeacherWorkload(tenantSlug, payload.teacher_id, current.rows[0].academic_year_id);
        if (workload.success && workload.data) {
          const periodsForThisOffering = payload.periods_per_week ?? current.rows[0].periods_per_week;
          // If the teacher was already assigned to this offering, subtract current periods to get net added
          const alreadyAssigned = current.rows[0].teacher_id === payload.teacher_id;
          const netTotal = alreadyAssigned
            ? (workload.data.total_periods - current.rows[0].periods_per_week + periodsForThisOffering)
            : (workload.data.total_periods + periodsForThisOffering);

          const maxPeriods = 30;
          if (netTotal > maxPeriods) {
            isOverloaded = true;
            if (!payload.override_overload) {
              const tRes = await pool.query('SELECT first_name, last_name FROM teachers WHERE id = $1', [payload.teacher_id]);
              const teacherName = tRes.rows[0] ? `${tRes.rows[0].first_name} ${tRes.rows[0].last_name}` : 'Teacher';
              return {
                success: false,
                overload_warning: true,
                current_periods: workload.data.total_periods,
                projected_periods: netTotal,
                max_periods: maxPeriods,
                teacher_name: teacherName,
                error: `Assigning this offering will give ${teacherName} ${netTotal} periods/week, exceeding the standard threshold of ${maxPeriods} periods/week.`
              };
            }
          }
        }
      }
    }

    const sets: string[] = ['updated_at = NOW()'];
    const params: unknown[] = [];
    let p = 1;

    if (payload.teacher_id !== undefined)            { sets.push(`teacher_id = $${p++}`);            params.push(payload.teacher_id); }
    if (payload.assistant_teacher_id !== undefined)  { sets.push(`assistant_teacher_id = $${p++}`);  params.push(payload.assistant_teacher_id); }
    if (payload.periods_per_week !== undefined)      { sets.push(`periods_per_week = $${p++}`);      params.push(payload.periods_per_week); }
    if (payload.enrollment_capacity !== undefined)   { sets.push(`enrollment_capacity = $${p++}`);   params.push(payload.enrollment_capacity); }
    if (payload.status !== undefined)                { sets.push(`status = $${p++}`);                params.push(payload.status); }
    if (payload.curriculum_version_id !== undefined) { sets.push(`curriculum_version_id = $${p++}`); params.push(payload.curriculum_version_id); }
    if (isOverloaded || payload.override_overload !== undefined) {
      sets.push(`overload_flag = $${p++}`);
      params.push(isOverloaded);
    }

    params.push(offeringId, tenantId);
    await pool.query(
      `UPDATE subject_offerings SET ${sets.join(', ')}
       WHERE id = $${p} AND tenant_id = $${p + 1}`,
      params
    );

    await pool.query(
      `INSERT INTO academic_audit_logs (tenant_id, actor_id, action, entity, entity_id, new_values)
       VALUES ($1, $2, 'offering.updated', 'subject_offering', $3, $4)`,
      [tenantId, userId, offeringId, JSON.stringify({ ...payload, overload_flag: isOverloaded })]
    );

    revalidatePath(`/${tenantSlug}/admin/academics/teacher-allocation`);
    revalidatePath(`/${tenantSlug}/admin/academics/offerings`);
    return { success: true, overloaded: isOverloaded };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: deleteSubjectOffering
// ─────────────────────────────────────────────────────────────

export async function deleteSubjectOffering(
  tenantSlug: string,
  offeringId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) return { success: false, error: 'Tenant not found.' };

    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database unavailable.' };

    const enrollmentCheck = await pool.query(
      `SELECT COUNT(*) FROM student_subject_enrollments WHERE offering_id = $1 AND status = 'active'`,
      [offeringId]
    );
    if (parseInt(enrollmentCheck.rows[0].count) > 0) {
      return { success: false, error: 'Cannot remove offering with active student enrollments.' };
    }

    await pool.query(
      `DELETE FROM subject_offerings WHERE id = $1 AND tenant_id = $2`,
      [offeringId, tenantId]
    );

    revalidatePath(`/${tenantSlug}/admin/academics/teacher-allocation`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: getTeacherWorkload
// ─────────────────────────────────────────────────────────────

export async function getTeacherWorkload(
  tenantSlug: string,
  teacherId: string,
  academicYearId: string
): Promise<{ success: boolean; data?: { total_periods: number; offering_count: number }; error?: string }> {
  try {
    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database unavailable.' };

    const res = await pool.query(
      `SELECT
          COALESCE(SUM(periods_per_week), 0) AS total_periods,
          COUNT(*) AS offering_count
        FROM subject_offerings
        WHERE teacher_id = $1 AND academic_year_id = $2 AND status = 'active'`,
      [teacherId, academicYearId]
    );

    return {
      success: true,
      data: {
        total_periods: parseInt(res.rows[0].total_periods),
        offering_count: parseInt(res.rows[0].offering_count),
      }
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: getAllocationMatrix
// ─────────────────────────────────────────────────────────────

export async function getAllocationMatrix(
  tenantSlug: string,
  academicYearId: string,
  termId?: string
): Promise<{ success: boolean; data: AllocationMatrixRow[]; sections: { id: string; name: string; class_name: string }[]; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) return { success: false, data: [], sections: [], error: 'Tenant not found.' };

    const pool = getPgPool();
    if (!pool) return { success: false, data: [], sections: [], error: 'Database unavailable.' };

    // Get all sections for this tenant/year
    const sectionsRes = await pool.query(
      `SELECT sec.id, sec.name, cl.name AS class_name
       FROM sections sec
       JOIN classes cl ON cl.id = sec.class_id
       WHERE sec.tenant_id = $1
       ORDER BY cl.sort_order, sec.name`,
      [tenantId]
    );
    const sections = sectionsRes.rows;

    // Get all teachers
    const teachersRes = await pool.query(
      `SELECT t.id, (t.first_name || ' ' || t.last_name) AS teacher_name,
              t.employee_id, d.name AS department_name
       FROM teachers t
       LEFT JOIN departments d ON d.id = t.department_id
       WHERE t.tenant_id = $1 AND t.is_active = true
       ORDER BY t.first_name, t.last_name`,
      [tenantId]
    );

    // Get all offerings for this year
    const offeringsConditions = ['so.tenant_id = $1', 'so.academic_year_id = $2'];
    const offeringsParams: unknown[] = [tenantId, academicYearId];
    if (termId) {
      offeringsConditions.push('so.term_id = $3');
      offeringsParams.push(termId);
    }

    const offeringsRes = await pool.query(
      `SELECT so.id, so.teacher_id, so.section_id, so.subject_id, so.periods_per_week,
              so.overload_flag,
              s.name AS subject_name, s.code AS subject_code,
              sec.name AS section_name, cl.name AS class_name
       FROM subject_offerings so
       JOIN subjects s ON s.id = so.subject_id
       JOIN sections sec ON sec.id = so.section_id
       JOIN classes cl ON cl.id = sec.class_id
       WHERE ${offeringsConditions.join(' AND ')} AND so.status = 'active'`,
      offeringsParams
    );

    // Get form tutor assignments
    const tutorsRes = await pool.query(
      `SELECT class_teacher_id AS teacher_id, id AS section_id
       FROM sections WHERE tenant_id = $1 AND class_teacher_id IS NOT NULL`,
      [tenantId]
    );

    const offeringsByTeacher = new Map<string, typeof offeringsRes.rows>();
    for (const o of offeringsRes.rows) {
      if (!o.teacher_id) continue;
      if (!offeringsByTeacher.has(o.teacher_id)) offeringsByTeacher.set(o.teacher_id, []);
      offeringsByTeacher.get(o.teacher_id)!.push(o);
    }

    const tutorsBySectionTeacher = new Map<string, boolean>();
    for (const t of tutorsRes.rows) {
      tutorsBySectionTeacher.set(`${t.teacher_id}:${t.section_id}`, true);
    }

    const matrixRows: AllocationMatrixRow[] = teachersRes.rows.map(teacher => {
      const teacherOfferings = offeringsByTeacher.get(teacher.id) || [];
      const totalPeriods = teacherOfferings.reduce((sum, o) => sum + (o.periods_per_week || 0), 0);

      const assignments = sections.map(section => {
        const offering = teacherOfferings.find(o => o.section_id === section.id);
        const isFormTutor = tutorsBySectionTeacher.has(`${teacher.id}:${section.id}`);
        return {
          section_id: section.id,
          section_name: section.name,
          class_name: section.class_name,
          offering_id: offering?.id,
          subject_id: offering?.subject_id,
          subject_name: offering?.subject_name,
          subject_code: offering?.subject_code,
          periods_per_week: offering?.periods_per_week,
          is_form_tutor: isFormTutor,
          overload_flag: offering?.overload_flag || false,
        };
      });

      return {
        teacher_id: teacher.id,
        teacher_name: teacher.teacher_name,
        employee_id: teacher.employee_id,
        department_name: teacher.department_name,
        total_periods: totalPeriods,
        max_periods: 30,
        is_overloaded: totalPeriods > 30 || teacherOfferings.some(o => o.overload_flag),
        assignments,
      };
    });

    return { success: true, data: matrixRows, sections };
  } catch (err: any) {
    return { success: false, data: [], sections: [], error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: getTeacherQualifications
// ─────────────────────────────────────────────────────────────

export async function getTeacherQualifications(
  tenantSlug: string,
  teacherId: string
): Promise<{ success: boolean; data: { subject_id: string; subject_name: string; qualification_level?: string; is_primary: boolean }[]; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) return { success: false, data: [], error: 'Tenant not found.' };

    const pool = getPgPool();
    if (!pool) return { success: false, data: [], error: 'Database unavailable.' };

    const res = await pool.query(
      `SELECT tsq.subject_id, s.name AS subject_name, tsq.qualification_level, tsq.is_primary
       FROM teacher_subject_qualifications tsq
       JOIN subjects s ON s.id = tsq.subject_id
       WHERE tsq.teacher_id = $1 AND tsq.tenant_id = $2
       ORDER BY tsq.is_primary DESC, s.name`,
      [teacherId, tenantId]
    );

    return { success: true, data: res.rows };
  } catch (err: any) {
    return { success: false, data: [], error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: upsertTeacherQualification
// ─────────────────────────────────────────────────────────────

export async function upsertTeacherQualification(
  tenantSlug: string,
  teacherId: string,
  subjectId: string,
  payload: { qualification_level?: string; is_primary?: boolean }
): Promise<{ success: boolean; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) return { success: false, error: 'Tenant not found.' };

    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database unavailable.' };

    await pool.query(
      `INSERT INTO teacher_subject_qualifications (tenant_id, teacher_id, subject_id, qualification_level, is_primary)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (teacher_id, subject_id) DO UPDATE
         SET qualification_level = EXCLUDED.qualification_level,
             is_primary = EXCLUDED.is_primary,
             updated_at = NOW()`,
      [tenantId, teacherId, subjectId, payload.qualification_level || null, payload.is_primary ?? false]
    );

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: getUnassignedSubjects (alert helper)
// ─────────────────────────────────────────────────────────────

export async function getUnassignedSubjects(
  tenantSlug: string,
  academicYearId: string
): Promise<{ success: boolean; data: { subject_id: string; subject_name: string; subject_code?: string }[]; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) return { success: false, data: [], error: 'Tenant not found.' };

    const pool = getPgPool();
    if (!pool) return { success: false, data: [], error: 'Database unavailable.' };

    const res = await pool.query(
      `SELECT s.id AS subject_id, s.name AS subject_name, s.code AS subject_code
       FROM subjects s
       WHERE s.tenant_id = $1 AND s.is_active = true
         AND NOT EXISTS (
           SELECT 1 FROM subject_offerings so
           WHERE so.subject_id = s.id
             AND so.academic_year_id = $2
             AND so.teacher_id IS NOT NULL
             AND so.status = 'active'
         )
       ORDER BY s.name`,
      [tenantId, academicYearId]
    );

    return { success: true, data: res.rows };
  } catch (err: any) {
    return { success: false, data: [], error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: generateTermOfferingsFromYear (Operational Bridge)
// ─────────────────────────────────────────────────────────────

export async function generateTermOfferingsFromYear(
  tenantSlug: string,
  academicYearId: string,
  termId: string
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) return { success: false, error: 'Tenant not found.' };

    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database unavailable.' };

    // Batch insert term offerings for all active subject offerings of the year that do not yet exist
    const res = await pool.query(
      `INSERT INTO term_offerings (
         tenant_id, subject_offering_id, term_id, term_teacher_id, assistant_teacher_id,
         periods_per_week, duration_minutes, timetable_status, status, overload_flag
       )
       SELECT
         so.tenant_id,
         so.id AS subject_offering_id,
         $1 AS term_id,
         so.teacher_id AS term_teacher_id,
         so.assistant_teacher_id,
         so.periods_per_week,
         so.duration_minutes,
         'scheduled'::timetable_status,
         'active'::term_offering_status,
         so.overload_flag
       FROM subject_offerings so
       WHERE so.tenant_id = $2
         AND so.academic_year_id = $3
         AND so.status = 'active'
       ON CONFLICT (subject_offering_id, term_id) DO NOTHING
       RETURNING id`,
      [termId, tenantId, academicYearId]
    );

    revalidatePath(`/${tenantSlug}/admin/academics/offerings`);
    return { success: true, count: res.rowCount ?? 0 };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: getTermOfferings
// ─────────────────────────────────────────────────────────────

export async function getTermOfferings(
  tenantSlug: string,
  filters: {
    term_id?: string;
    academic_year_id?: string;
    subject_id?: string;
    teacher_id?: string;
    section_id?: string;
    timetable_status?: string;
    status?: string;
  } = {}
): Promise<{ success: boolean; data: TermOfferingRecord[]; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) return { success: false, data: [], error: 'Tenant not found.' };

    const pool = getPgPool();
    if (!pool) return { success: false, data: [], error: 'Database unavailable.' };

    const conditions = ['tro.tenant_id = $1'];
    const params: unknown[] = [tenantId];
    let p = 2;

    if (filters.term_id)          { conditions.push(`tro.term_id = $${p++}`);          params.push(filters.term_id); }
    if (filters.academic_year_id) { conditions.push(`so.academic_year_id = $${p++}`);  params.push(filters.academic_year_id); }
    if (filters.subject_id)       { conditions.push(`so.subject_id = $${p++}`);        params.push(filters.subject_id); }
    if (filters.teacher_id)       { conditions.push(`(tro.term_teacher_id = $${p} OR (tro.term_teacher_id IS NULL AND so.teacher_id = $${p}))`); params.push(filters.teacher_id); p++; }
    if (filters.section_id)       { conditions.push(`so.section_id = $${p++}`);        params.push(filters.section_id); }
    if (filters.timetable_status) { conditions.push(`tro.timetable_status = $${p++}`); params.push(filters.timetable_status); }
    if (filters.status)           { conditions.push(`tro.status = $${p++}`);           params.push(filters.status); }

    const res = await pool.query(
      `SELECT
         tro.*,
         t.name AS term_name,
         s.id AS subject_id, s.name AS subject_name, s.code AS subject_code,
         sec.name AS section_name, cl.name AS class_name,
         COALESCE(te.first_name || ' ' || te.last_name, ste.first_name || ' ' || ste.last_name) AS teacher_name,
         COALESCE(tro.term_teacher_id, so.teacher_id) AS effective_teacher_id,
         (ate.first_name || ' ' || ate.last_name) AS assistant_teacher_name
       FROM term_offerings tro
       JOIN subject_offerings so ON so.id = tro.subject_offering_id
       JOIN subjects s ON s.id = so.subject_id
       JOIN sections sec ON sec.id = so.section_id
       JOIN classes cl ON cl.id = sec.class_id
       JOIN terms t ON t.id = tro.term_id
       LEFT JOIN teachers te ON te.id = tro.term_teacher_id
       LEFT JOIN teachers ste ON ste.id = so.teacher_id
       LEFT JOIN teachers ate ON ate.id = tro.assistant_teacher_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY cl.sort_order, sec.name, s.name`,
      params
    );

    return { success: true, data: res.rows };
  } catch (err: any) {
    return { success: false, data: [], error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: updateTermOffering
// ─────────────────────────────────────────────────────────────

export async function updateTermOffering(
  tenantSlug: string,
  termOfferingId: string,
  payload: {
    term_teacher_id?: string | null;
    assistant_teacher_id?: string | null;
    periods_per_week?: number;
    duration_minutes?: number;
    timetable_status?: 'draft' | 'scheduled' | 'active' | 'cancelled';
    status?: 'active' | 'completed' | 'suspended';
    notes?: string | null;
    override_overload?: boolean;
  }
): Promise<OfferingMutationResult> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    const userId = await resolveUserId();
    if (!tenantId) return { success: false, error: 'Tenant not found.' };

    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database unavailable.' };

    let isOverloaded = false;

    // Check term teacher workload if updating teacher
    if (payload.term_teacher_id) {
      const current = await pool.query(
        `SELECT term_id, periods_per_week, term_teacher_id FROM term_offerings WHERE id = $1`,
        [termOfferingId]
      );
      if (current.rows.length > 0) {
        const termId = current.rows[0].term_id;
        const wkRes = await pool.query(
          `SELECT total_periods, is_overloaded FROM get_teacher_term_workload($1, $2, $3)`,
          [payload.term_teacher_id, termId, termOfferingId]
        );
        const currentLoad = parseInt(wkRes.rows[0]?.total_periods || '0');
        const added = payload.periods_per_week ?? current.rows[0].periods_per_week;
        const projected = currentLoad + added;
        const maxPeriods = 30;

        if (projected > maxPeriods) {
          isOverloaded = true;
          if (!payload.override_overload) {
            const tRes = await pool.query('SELECT first_name, last_name FROM teachers WHERE id = $1', [payload.term_teacher_id]);
            const teacherName = tRes.rows[0] ? `${tRes.rows[0].first_name} ${tRes.rows[0].last_name}` : 'Teacher';
            return {
              success: false,
              overload_warning: true,
              current_periods: currentLoad,
              projected_periods: projected,
              max_periods: maxPeriods,
              teacher_name: teacherName,
              error: `Term allocation will give ${teacherName} ${projected} periods/week, exceeding standard limit of ${maxPeriods}.`
            };
          }
        }
      }
    }

    const sets: string[] = ['updated_at = NOW()'];
    const params: unknown[] = [];
    let p = 1;

    if (payload.term_teacher_id !== undefined)      { sets.push(`term_teacher_id = $${p++}`);      params.push(payload.term_teacher_id); }
    if (payload.assistant_teacher_id !== undefined) { sets.push(`assistant_teacher_id = $${p++}`); params.push(payload.assistant_teacher_id); }
    if (payload.periods_per_week !== undefined)     { sets.push(`periods_per_week = $${p++}`);     params.push(payload.periods_per_week); }
    if (payload.duration_minutes !== undefined)     { sets.push(`duration_minutes = $${p++}`);     params.push(payload.duration_minutes); }
    if (payload.timetable_status !== undefined)     { sets.push(`timetable_status = $${p++}`);     params.push(payload.timetable_status); }
    if (payload.status !== undefined)               { sets.push(`status = $${p++}`);               params.push(payload.status); }
    if (payload.notes !== undefined)                { sets.push(`notes = $${p++}`);                params.push(payload.notes); }
    if (isOverloaded || payload.override_overload !== undefined) {
      sets.push(`overload_flag = $${p++}`);
      params.push(isOverloaded);
    }

    params.push(termOfferingId, tenantId);
    await pool.query(
      `UPDATE term_offerings SET ${sets.join(', ')} WHERE id = $${p} AND tenant_id = $${p + 1}`,
      params
    );

    await pool.query(
      `INSERT INTO academic_audit_logs (tenant_id, actor_id, action, entity, entity_id, new_values)
       VALUES ($1, $2, 'term_offering.updated', 'term_offering', $3, $4)`,
      [tenantId, userId, termOfferingId, JSON.stringify({ ...payload, overload_flag: isOverloaded })]
    );

    revalidatePath(`/${tenantSlug}/admin/academics/offerings`);
    return { success: true, overloaded: isOverloaded };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: getTeacherTermWorkloadDetailed
// ─────────────────────────────────────────────────────────────

export async function getTeacherTermWorkloadDetailed(
  tenantSlug: string,
  teacherId: string,
  termId: string
): Promise<{ success: boolean; data?: { total_periods: number; offering_count: number; is_overloaded: boolean }; error?: string }> {
  try {
    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database unavailable.' };

    const res = await pool.query(
      `SELECT total_periods, offering_count, is_overloaded
       FROM get_teacher_term_workload($1, $2, NULL)`,
      [teacherId, termId]
    );

    if (res.rows.length === 0) {
      return { success: true, data: { total_periods: 0, offering_count: 0, is_overloaded: false } };
    }

    const row = res.rows[0];
    return {
      success: true,
      data: {
        total_periods: parseInt(row.total_periods || '0'),
        offering_count: parseInt(row.offering_count || '0'),
        is_overloaded: row.is_overloaded ?? false,
      }
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
