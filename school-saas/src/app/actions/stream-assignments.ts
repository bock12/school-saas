'use server';

import { revalidatePath } from 'next/cache';
import { getPgPool } from '@/lib/db/pg-fallback';
import { createClient } from '@/lib/supabase/server';
import {
  StudentStreamAssignmentRecord,
  AssignStudentStreamPayload,
  BatchAssignStreamPayload,
  StreamAssignmentFilters,
  StudentEnrolledSubjectDetail
} from '@/lib/types/curriculum';

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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: getStudentStreamAssignments
// ─────────────────────────────────────────────────────────────

export async function getStudentStreamAssignments(
  tenantSlug: string,
  filters: StreamAssignmentFilters = {}
): Promise<{
  success: boolean;
  data: StudentStreamAssignmentRecord[];
  totalCount: number;
  assignedCount: number;
  unassignedCount: number;
  error?: string;
}> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) return { success: false, data: [], totalCount: 0, assignedCount: 0, unassignedCount: 0, error: 'Tenant not found.' };

    const pool = getPgPool();
    if (!pool) return { success: false, data: [], totalCount: 0, assignedCount: 0, unassignedCount: 0, error: 'Database unavailable.' };

    // Resolve academic year if not provided
    let yearId = filters.academic_year_id;
    if (!yearId) {
      const curYear = await pool.query(
        `SELECT id FROM academic_years WHERE tenant_id = $1 AND is_current = true LIMIT 1`,
        [tenantId]
      );
      if (curYear.rows.length > 0) {
        yearId = curYear.rows[0].id;
      } else {
        const anyYear = await pool.query(
          `SELECT id FROM academic_years WHERE tenant_id = $1 ORDER BY start_date DESC LIMIT 1`,
          [tenantId]
        );
        yearId = anyYear.rows[0]?.id;
      }
    }

    if (!yearId) {
      return { success: true, data: [], totalCount: 0, assignedCount: 0, unassignedCount: 0 };
    }

    const conditions = ['s.tenant_id = $1', 's.is_active = true'];
    const params: unknown[] = [tenantId, yearId];
    let p = 3;

    if (filters.stream_id) {
      if (filters.stream_id === 'unassigned') {
        conditions.push(`ssa.id IS NULL`);
      } else {
        conditions.push(`ssa.stream_id = $${p++}`);
        params.push(filters.stream_id);
      }
    }

    if (filters.class_id) {
      conditions.push(`cl.id = $${p++}`);
      params.push(filters.class_id);
    }

    if (filters.section_id) {
      conditions.push(`sec.id = $${p++}`);
      params.push(filters.section_id);
    }

    if (filters.elective_status) {
      if (filters.elective_status === 'locked') {
        conditions.push(`ssa.electives_locked = true`);
      } else if (filters.elective_status === 'approved') {
        conditions.push(`ssa.electives_approved = true`);
      } else if (filters.elective_status === 'submitted') {
        conditions.push(`ssa.electives_submitted = true AND ssa.electives_approved = false`);
      } else if (filters.elective_status === 'not_started') {
        conditions.push(`(ssa.electives_submitted = false OR ssa.id IS NULL)`);
      }
    }

    if (filters.search) {
      conditions.push(
        `(s.first_name ILIKE $${p} OR s.last_name ILIKE $${p} OR s.admission_number ILIKE $${p})`
      );
      params.push(`%${filters.search}%`);
      p++;
    }

    const query = `
      SELECT
        s.id AS student_id,
        (s.first_name || ' ' || s.last_name) AS student_name,
        s.admission_number,
        s.gender,
        s.tenant_id,
        ce.section_id,
        sec.name AS section_name,
        cl.name AS class_name,
        ssa.id AS id,
        ssa.stream_id,
        cs.name AS stream_name,
        cs.code AS stream_code,
        cs.level AS stream_level,
        $2::uuid AS academic_year_id,
        ay.name AS academic_year_name,
        ssa.assigned_at,
        ssa.assigned_by,
        COALESCE(ssa.status, 'active') AS status,
        ssa.previous_stream_id,
        pcs.name AS previous_stream_name,
        ssa.change_reason,
        COALESCE(ssa.electives_submitted, false) AS electives_submitted,
        COALESCE(ssa.electives_approved, false) AS electives_approved,
        COALESCE(ssa.electives_locked, false) AS electives_locked,
        COALESCE((
          SELECT COUNT(*)
          FROM student_subject_enrollments sse
          JOIN subject_offerings so ON so.id = sse.offering_id
          WHERE sse.student_id = s.id
            AND sse.tenant_id = s.tenant_id
            AND so.academic_year_id = $2
            AND sse.enrollment_type = 'stream_core'
            AND sse.status = 'active'
        ), 0)::int AS core_subjects_count,
        COALESCE((
          SELECT COUNT(*)
          FROM student_subject_enrollments sse
          JOIN subject_offerings so ON so.id = sse.offering_id
          WHERE sse.student_id = s.id
            AND sse.tenant_id = s.tenant_id
            AND so.academic_year_id = $2
            AND sse.enrollment_type = 'elective'
            AND sse.status = 'active'
        ), 0)::int AS elective_subjects_count
      FROM students s
      LEFT JOIN class_enrollments ce ON ce.student_id = s.id AND ce.academic_year_id = $2
      LEFT JOIN sections sec ON sec.id = ce.section_id
      LEFT JOIN classes cl ON cl.id = sec.class_id
      LEFT JOIN student_stream_assignments ssa ON ssa.student_id = s.id AND ssa.academic_year_id = $2 AND ssa.status = 'active'
      LEFT JOIN curriculum_streams cs ON cs.id = ssa.stream_id
      LEFT JOIN curriculum_streams pcs ON pcs.id = ssa.previous_stream_id
      LEFT JOIN academic_years ay ON ay.id = $2
      WHERE ${conditions.join(' AND ')}
      ORDER BY cl.sort_order NULLS LAST, sec.name NULLS LAST, s.last_name, s.first_name
    `;

    const res = await pool.query(query, params);
    const rows: StudentStreamAssignmentRecord[] = res.rows;

    const totalCount = rows.length;
    const assignedCount = rows.filter(r => !!r.stream_id).length;
    const unassignedCount = totalCount - assignedCount;

    return {
      success: true,
      data: rows,
      totalCount,
      assignedCount,
      unassignedCount
    };
  } catch (err: any) {
    return { success: false, data: [], totalCount: 0, assignedCount: 0, unassignedCount: 0, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: assignStudentToStream
// ─────────────────────────────────────────────────────────────

export async function assignStudentToStream(
  tenantSlug: string,
  payload: AssignStudentStreamPayload
): Promise<{ success: boolean; assignmentId?: string; coreEnrolledCount?: number; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    const userId = await resolveUserId();
    if (!tenantId) return { success: false, error: 'Tenant not found.' };

    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database unavailable.' };

    // 1. Resolve section_id if not provided
    let sectionId = payload.section_id;
    if (!sectionId) {
      const ce = await pool.query(
        `SELECT section_id FROM class_enrollments WHERE student_id = $1 AND academic_year_id = $2 LIMIT 1`,
        [payload.student_id, payload.academic_year_id]
      );
      if (ce.rows.length > 0) sectionId = ce.rows[0].section_id;
    }

    // 2. Perform UPSERT on student_stream_assignments
    // This executes PostgreSQL trigger trg_auto_core_enrollments!
    const upsertRes = await pool.query(
      `INSERT INTO student_stream_assignments (
         tenant_id, student_id, stream_id, academic_year_id, section_id,
         assigned_by, change_reason, previous_stream_id, status,
         electives_submitted, electives_approved, electives_locked
       )
       VALUES (
         $1, $2, $3, $4, $5,
         $6, $7,
         (SELECT stream_id FROM student_stream_assignments WHERE student_id = $2 AND academic_year_id = $4 LIMIT 1),
         'active',
         false, false, false
       )
       ON CONFLICT (student_id, academic_year_id) DO UPDATE SET
         previous_stream_id = CASE
           WHEN student_stream_assignments.stream_id IS DISTINCT FROM EXCLUDED.stream_id
           THEN student_stream_assignments.stream_id
           ELSE student_stream_assignments.previous_stream_id
         END,
         stream_id = EXCLUDED.stream_id,
         section_id = COALESCE(EXCLUDED.section_id, student_stream_assignments.section_id),
         change_reason = EXCLUDED.change_reason,
         assigned_by = EXCLUDED.assigned_by,
         assigned_at = NOW(),
         status = 'active'
       RETURNING id, stream_id`,
      [
        tenantId,
        payload.student_id,
        payload.stream_id,
        payload.academic_year_id,
        sectionId || null,
        userId,
        payload.change_reason || null
      ]
    );

    const assignmentId = upsertRes.rows[0]?.id;

    // 3. Query the number of core subjects auto-enrolled by the trigger
    const coreCountRes = await pool.query(
      `SELECT COUNT(*)
       FROM student_subject_enrollments sse
       JOIN subject_offerings so ON so.id = sse.offering_id
       WHERE sse.student_id = $1
         AND so.academic_year_id = $2
         AND sse.enrollment_type = 'stream_core'
         AND sse.status = 'active'`,
      [payload.student_id, payload.academic_year_id]
    );
    const coreCount = parseInt(coreCountRes.rows[0]?.count || '0');

    // 4. Log to academic_audit_logs
    await pool.query(
      `INSERT INTO academic_audit_logs (tenant_id, actor_id, action, entity, entity_id, new_values)
       VALUES ($1, $2, 'stream.assigned', 'student_stream_assignment', $3, $4)`,
      [tenantId, userId, assignmentId, JSON.stringify({ ...payload, core_enrolled: coreCount })]
    );

    revalidatePath(`/${tenantSlug}/admin/academics/stream-assignments`);
    revalidatePath(`/${tenantSlug}/admin/academics/offerings`);

    return {
      success: true,
      assignmentId,
      coreEnrolledCount: coreCount
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: batchAssignStudentsToStream
// ─────────────────────────────────────────────────────────────

export async function batchAssignStudentsToStream(
  tenantSlug: string,
  payload: BatchAssignStreamPayload
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    if (!payload.student_ids || payload.student_ids.length === 0) {
      return { success: false, count: 0, error: 'No students selected for stream assignment.' };
    }

    let successCount = 0;
    for (const studentId of payload.student_ids) {
      const res = await assignStudentToStream(tenantSlug, {
        student_id: studentId,
        stream_id: payload.stream_id,
        academic_year_id: payload.academic_year_id,
        section_id: payload.section_id,
        change_reason: payload.change_reason || 'Batch stream assignment',
      });
      if (res.success) successCount++;
    }

    revalidatePath(`/${tenantSlug}/admin/academics/stream-assignments`);
    return { success: true, count: successCount };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: getStudentSubjectEnrollments
// ─────────────────────────────────────────────────────────────

export async function getStudentSubjectEnrollments(
  tenantSlug: string,
  studentId: string,
  academicYearId: string
): Promise<{ success: boolean; data: StudentEnrolledSubjectDetail[]; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) return { success: false, data: [], error: 'Tenant not found.' };

    const pool = getPgPool();
    if (!pool) return { success: false, data: [], error: 'Database unavailable.' };

    const query = `
      SELECT
        sse.id AS enrollment_id,
        s.id AS subject_id,
        s.name AS subject_name,
        s.code AS subject_code,
        so.id AS offering_id,
        sse.enrollment_type,
        sse.approval_status,
        sse.elective_group,
        so.periods_per_week,
        (t.first_name || ' ' || t.last_name) AS teacher_name,
        sse.enrolled_at
      FROM student_subject_enrollments sse
      JOIN subject_offerings so ON so.id = sse.offering_id
      JOIN subjects s ON s.id = so.subject_id
      LEFT JOIN teachers t ON t.id = so.teacher_id
      WHERE sse.tenant_id = $1
        AND sse.student_id = $2
        AND so.academic_year_id = $3
        AND sse.status = 'active'
      ORDER BY sse.enrollment_type, s.name
    `;

    const res = await pool.query(query, [tenantId, studentId, academicYearId]);
    return { success: true, data: res.rows };
  } catch (err: any) {
    return { success: false, data: [], error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: updateElectiveStatus
// ─────────────────────────────────────────────────────────────

export async function updateElectiveStatus(
  tenantSlug: string,
  assignmentId: string,
  payload: {
    electives_submitted?: boolean;
    electives_approved?: boolean;
    electives_locked?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    const userId = await resolveUserId();
    if (!tenantId) return { success: false, error: 'Tenant not found.' };

    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database unavailable.' };

    const sets: string[] = [];
    const params: unknown[] = [assignmentId, tenantId];
    let p = 3;

    if (payload.electives_submitted !== undefined) {
      sets.push(`electives_submitted = $${p++}`);
      params.push(payload.electives_submitted);
    }
    if (payload.electives_approved !== undefined) {
      sets.push(`electives_approved = $${p++}`);
      params.push(payload.electives_approved);
    }
    if (payload.electives_locked !== undefined) {
      sets.push(`electives_locked = $${p++}`);
      params.push(payload.electives_locked);
    }

    if (sets.length === 0) return { success: true };

    await pool.query(
      `UPDATE student_stream_assignments SET ${sets.join(', ')} WHERE id = $1 AND tenant_id = $2`,
      params
    );

    await pool.query(
      `INSERT INTO academic_audit_logs (tenant_id, actor_id, action, entity, entity_id, new_values)
       VALUES ($1, $2, 'stream.electives_status_updated', 'student_stream_assignment', $3, $4)`,
      [tenantId, userId, assignmentId, JSON.stringify(payload)]
    );

    revalidatePath(`/${tenantSlug}/admin/academics/stream-assignments`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: syncStreamCoreEnrollments
// ─────────────────────────────────────────────────────────────

export async function syncStreamCoreEnrollments(
  tenantSlug: string,
  academicYearId: string,
  streamId?: string
): Promise<{ success: boolean; enrolledCount: number; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) return { success: false, enrolledCount: 0, error: 'Tenant not found.' };

    const pool = getPgPool();
    if (!pool) return { success: false, enrolledCount: 0, error: 'Database unavailable.' };

    const conditions = ['ssa.tenant_id = $1', 'ssa.academic_year_id = $2', "ssa.status = 'active'"];
    const params: unknown[] = [tenantId, academicYearId];

    if (streamId) {
      conditions.push('ssa.stream_id = $3');
      params.push(streamId);
    }

    // Match each assigned student with core stream rules and corresponding subject offerings
    const query = `
      INSERT INTO student_subject_enrollments (
        tenant_id, student_id, offering_id,
        status, enrollment_type, approval_status,
        stream_assignment_id, enrolled_at
      )
      SELECT DISTINCT
        ssa.tenant_id,
        ssa.student_id,
        so.id AS offering_id,
        'active'::enrollment_status,
        'stream_core',
        'approved',
        ssa.id AS stream_assignment_id,
        NOW()
      FROM student_stream_assignments ssa
      JOIN stream_subject_rules ssr ON ssr.stream_id = ssa.stream_id AND ssr.rule_type = 'core' AND ssr.is_active = true
      JOIN subject_offerings so ON so.subject_id = ssr.subject_id
                                AND so.academic_year_id = ssa.academic_year_id
                                AND so.tenant_id = ssa.tenant_id
                                AND (ssa.section_id IS NULL OR so.section_id = ssa.section_id)
                                AND so.status = 'active'
      WHERE ${conditions.join(' AND ')}
      ON CONFLICT (student_id, offering_id) DO NOTHING
    `;

    const res = await pool.query(query, params);
    const count = res.rowCount ?? 0;

    revalidatePath(`/${tenantSlug}/admin/academics/stream-assignments`);
    return { success: true, enrolledCount: count };
  } catch (err: any) {
    return { success: false, enrolledCount: 0, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: seedSampleStudentsAndStreams
// ─────────────────────────────────────────────────────────────

export async function seedSampleStudentsAndStreams(
  tenantSlug: string
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) return { success: false, message: '', error: 'Tenant not found.' };

    const pool = getPgPool();
    if (!pool) return { success: false, message: '', error: 'Database unavailable.' };

    // Check if students already exist
    const existCheck = await pool.query(`SELECT COUNT(*) FROM students WHERE tenant_id = $1`, [tenantId]);
    if (parseInt(existCheck.rows[0].count) > 0) {
      return { success: true, message: 'Students already present in tenant.' };
    }

    // 1. Get current academic year
    const yrRes = await pool.query(
      `SELECT id FROM academic_years WHERE tenant_id = $1 AND is_current = true LIMIT 1`,
      [tenantId]
    );
    if (yrRes.rows.length === 0) return { success: false, message: '', error: 'No active academic year found.' };
    const academicYearId = yrRes.rows[0].id;

    // 2. Create SSS Classes
    const sss1 = await pool.query(
      `INSERT INTO classes (tenant_id, name, short_name, sort_order, capacity)
       VALUES ($1, 'Senior Secondary 1', 'SSS 1', 10, 120)
       ON CONFLICT (tenant_id, name) DO UPDATE SET short_name = EXCLUDED.short_name
       RETURNING id`,
      [tenantId]
    );
    const classId = sss1.rows[0].id;

    // 3. Create Sections (SSS 1 Science, SSS 1 Arts, SSS 1 Commercial)
    const secSci = await pool.query(
      `INSERT INTO sections (tenant_id, class_id, name, capacity)
       VALUES ($1, $2, 'SSS 1 Science', 40)
       ON CONFLICT (class_id, name) DO UPDATE SET capacity = EXCLUDED.capacity
       RETURNING id`,
      [tenantId, classId]
    );
    const secArt = await pool.query(
      `INSERT INTO sections (tenant_id, class_id, name, capacity)
       VALUES ($1, $2, 'SSS 1 Arts', 40)
       ON CONFLICT (class_id, name) DO UPDATE SET capacity = EXCLUDED.capacity
       RETURNING id`,
      [tenantId, classId]
    );
    const secCom = await pool.query(
      `INSERT INTO sections (tenant_id, class_id, name, capacity)
       VALUES ($1, $2, 'SSS 1 Commercial', 40)
       ON CONFLICT (class_id, name) DO UPDATE SET capacity = EXCLUDED.capacity
       RETURNING id`,
      [tenantId, classId]
    );

    const sectionSciId = secSci.rows[0].id;
    const sectionArtId = secArt.rows[0].id;
    const sectionComId = secCom.rows[0].id;

    // 4. Resolve stream IDs
    const sciStream = await pool.query(
      `SELECT id FROM curriculum_streams WHERE tenant_id = $1 AND code = 'SCI_TECH' LIMIT 1`,
      [tenantId]
    );
    const langStream = await pool.query(
      `SELECT id FROM curriculum_streams WHERE tenant_id = $1 AND code = 'LANG_LIT' LIMIT 1`,
      [tenantId]
    );
    const comStream = await pool.query(
      `SELECT id FROM curriculum_streams WHERE tenant_id = $1 AND code = 'ECON_BUS' LIMIT 1`,
      [tenantId]
    );

    const sciStreamId = sciStream.rows[0]?.id;
    const langStreamId = langStream.rows[0]?.id;
    const comStreamId = comStream.rows[0]?.id;

    // 5. Seed Core Subjects if not present
    const defaultSubjects = [
      { code: 'MTH-01', name: 'General Mathematics', examinable: true },
      { code: 'ENG-01', name: 'English Language', examinable: true },
      { code: 'BIO-01', name: 'Biology', examinable: true },
      { code: 'CHM-01', name: 'Chemistry', examinable: true },
      { code: 'PHY-01', name: 'Physics', examinable: true },
      { code: 'LIT-01', name: 'Literature in English', examinable: true },
      { code: 'GOV-01', name: 'Government', examinable: true },
      { code: 'ACC-01', name: 'Financial Accounting', examinable: true },
      { code: 'ECN-01', name: 'Economics', examinable: true },
    ];

    const subjectMap: Record<string, string> = {};
    for (const s of defaultSubjects) {
      const ins = await pool.query(
        `INSERT INTO subjects (tenant_id, code, name, is_examinable, is_active)
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [tenantId, s.code, s.name, s.examinable]
      );
      subjectMap[s.code] = ins.rows[0].id;
    }

    // Helper to configure stream core rules & offerings
    const configureStream = async (streamId: string | undefined, codes: string[], sectionId: string) => {
      if (!streamId || !sectionId) return;
      for (const code of codes) {
        const subjId = subjectMap[code];
        if (!subjId) continue;
        await pool.query(
          `INSERT INTO stream_subject_rules (tenant_id, stream_id, subject_id, rule_type, min_selections, max_selections, is_active)
           VALUES ($1, $2, $3, 'core', 1, 1, true)
           ON CONFLICT DO NOTHING`,
          [tenantId, streamId, subjId]
        );
        await pool.query(
          `INSERT INTO subject_offerings (tenant_id, academic_year_id, subject_id, section_id, periods_per_week, duration_minutes, status, is_compulsory, requirement_type)
           SELECT $1, $2, $3, $4, 5, 40, 'active', true, 'core'
           WHERE NOT EXISTS (
             SELECT 1 FROM subject_offerings
             WHERE academic_year_id = $2 AND subject_id = $3 AND section_id = $4 AND term_id IS NULL
           )`,
          [tenantId, academicYearId, subjId, sectionId]
        );
      }
    };

    await configureStream(sciStreamId, ['MTH-01', 'ENG-01', 'BIO-01', 'CHM-01', 'PHY-01'], sectionSciId);
    await configureStream(langStreamId, ['MTH-01', 'ENG-01', 'LIT-01', 'GOV-01'], sectionArtId);
    await configureStream(comStreamId, ['MTH-01', 'ENG-01', 'ACC-01', 'ECN-01'], sectionComId);

    // 6. Seed Sample Students
    const sampleStudents = [
      { first: 'Mohamed', last: 'Kamara', adm: 'AA-2026-001', gender: 'male', sectionId: sectionSciId, streamId: sciStreamId },
      { first: 'Fatmata', last: 'Sesay', adm: 'AA-2026-002', gender: 'female', sectionId: sectionSciId, streamId: sciStreamId },
      { first: 'Ibrahim', last: 'Bangura', adm: 'AA-2026-003', gender: 'male', sectionId: sectionSciId, streamId: sciStreamId },
      { first: 'Aminata', last: 'Kallon', adm: 'AA-2026-004', gender: 'female', sectionId: sectionSciId, streamId: sciStreamId },
      { first: 'Sahr', last: 'Musa', adm: 'AA-2026-005', gender: 'male', sectionId: sectionSciId, streamId: sciStreamId },

      { first: 'Mariama', last: 'Conteh', adm: 'AA-2026-006', gender: 'female', sectionId: sectionArtId, streamId: langStreamId },
      { first: 'Alhaji', last: 'Turay', adm: 'AA-2026-007', gender: 'male', sectionId: sectionArtId, streamId: langStreamId },
      { first: 'Zainab', last: 'Mansaray', adm: 'AA-2026-008', gender: 'female', sectionId: sectionArtId, streamId: langStreamId },
      { first: 'Alpha', last: 'Jalloh', adm: 'AA-2026-009', gender: 'male', sectionId: sectionArtId, streamId: langStreamId },

      { first: 'Hawa', last: 'Koroma', adm: 'AA-2026-010', gender: 'female', sectionId: sectionComId, streamId: comStreamId },
      { first: 'Samuel', last: 'Cole', adm: 'AA-2026-011', gender: 'male', sectionId: sectionComId, streamId: comStreamId },
      { first: 'Kadiatu', last: 'Tarawally', adm: 'AA-2026-012', gender: 'female', sectionId: sectionComId, streamId: null }, // unassigned
      { first: 'Abu Bakarr', last: 'Fofanah', adm: 'AA-2026-013', gender: 'male', sectionId: sectionComId, streamId: null }, // unassigned
    ];

    for (const st of sampleStudents) {
      const inserted = await pool.query(
        `INSERT INTO students (tenant_id, admission_number, first_name, last_name, gender, is_active)
         VALUES ($1, $2, $3, $4, $5, true)
         ON CONFLICT (tenant_id, admission_number) DO UPDATE SET first_name = EXCLUDED.first_name
         RETURNING id`,
        [tenantId, st.adm, st.first, st.last, st.gender]
      );
      const studentId = inserted.rows[0].id;

      // Enroll into section
      await pool.query(
        `INSERT INTO class_enrollments (tenant_id, student_id, section_id, academic_year_id)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (student_id, section_id, academic_year_id) DO NOTHING`,
        [tenantId, studentId, st.sectionId, academicYearId]
      );

      // If streamId provided, assign stream (triggers trg_auto_core_enrollments!)
      if (st.streamId) {
        await assignStudentToStream(tenantSlug, {
          student_id: studentId,
          stream_id: st.streamId,
          academic_year_id: academicYearId,
          section_id: st.sectionId,
          change_reason: 'Initial secondary stream enrollment'
        });
      }
    }

    revalidatePath(`/${tenantSlug}/admin/academics/stream-assignments`);
    return { success: true, message: `Successfully seeded classes, sections, and ${sampleStudents.length} secondary students.` };
  } catch (err: any) {
    return { success: false, message: '', error: err.message };
  }
}
