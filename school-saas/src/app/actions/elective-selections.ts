'use server';

import { revalidatePath } from 'next/cache';
import { getPgPool } from '@/lib/db/pg-fallback';
import { createClient } from '@/lib/supabase/server';
import {
  StudentElectivePackage,
  SubmitElectivesPayload,
  ElectiveSubmissionAdminRow,
  ReviewStudentElectivesPayload,
  StreamElectiveGroupOption,
  ElectiveSubjectOption,
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
// ACTION: getStudentElectivePackage
// ─────────────────────────────────────────────────────────────

export async function getStudentElectivePackage(
  tenantSlug: string,
  studentId?: string,
  academicYearId?: string
): Promise<{ success: boolean; data?: StudentElectivePackage; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) return { success: false, error: 'Tenant not found.' };

    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database unavailable.' };

    // Resolve academic year if not provided
    let yearId = academicYearId;
    if (!yearId) {
      const yrRes = await pool.query(
        `SELECT id FROM academic_years WHERE tenant_id = $1 AND is_current = true LIMIT 1`,
        [tenantId]
      );
      yearId = yrRes.rows[0]?.id;
    }

    if (!yearId) return { success: false, error: 'No active academic year found.' };

    // Resolve studentId: if not passed, pick the first student in the tenant with a stream
    let targetStudentId = studentId;
    if (!targetStudentId) {
      const firstStudent = await pool.query(
        `SELECT ssa.student_id
         FROM student_stream_assignments ssa
         WHERE ssa.tenant_id = $1 AND ssa.academic_year_id = $2 AND ssa.status = 'active'
         ORDER BY ssa.assigned_at DESC LIMIT 1`,
        [tenantId, yearId]
      );
      targetStudentId = firstStudent.rows[0]?.student_id;
    }

    if (!targetStudentId) {
      return { success: false, error: 'No stream-assigned student found.' };
    }

    // 1. Fetch Student & Stream Assignment details
    const studentQuery = `
      SELECT
        s.id AS student_id,
        (s.first_name || ' ' || s.last_name) AS student_name,
        s.admission_number,
        cl.name AS class_name,
        sec.name AS section_name,
        sec.id AS section_id,
        ssa.id AS assignment_id,
        ssa.stream_id,
        cs.name AS stream_name,
        cs.code AS stream_code,
        $2::uuid AS academic_year_id,
        ay.name AS academic_year_name,
        COALESCE(ssa.electives_submitted, false) AS electives_submitted,
        COALESCE(ssa.electives_approved, false) AS electives_approved,
        COALESCE(ssa.electives_locked, false) AS electives_locked
      FROM students s
      JOIN student_stream_assignments ssa ON ssa.student_id = s.id AND ssa.academic_year_id = $2 AND ssa.status = 'active'
      JOIN curriculum_streams cs ON cs.id = ssa.stream_id
      LEFT JOIN sections sec ON sec.id = ssa.section_id
      LEFT JOIN classes cl ON cl.id = sec.class_id
      LEFT JOIN academic_years ay ON ay.id = $2
      WHERE s.tenant_id = $1 AND s.id = $3
      LIMIT 1
    `;
    const studentRes = await pool.query(studentQuery, [tenantId, yearId, targetStudentId]);
    if (studentRes.rows.length === 0) {
      return { success: false, error: 'Student stream assignment not found for this academic year.' };
    }
    const studentInfo = studentRes.rows[0];

    // 2. Fetch Active Core Subjects (Tier 1 auto-enrolled)
    const coreQuery = `
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
        sse.enrolled_at,
        sse.waitlist_position
      FROM student_subject_enrollments sse
      JOIN subject_offerings so ON so.id = sse.offering_id
      JOIN subjects s ON s.id = so.subject_id
      LEFT JOIN teachers t ON t.id = so.teacher_id
      WHERE sse.tenant_id = $1
        AND sse.student_id = $2
        AND so.academic_year_id = $3
        AND sse.enrollment_type = 'stream_core'
        AND sse.status = 'active'
      ORDER BY s.name
    `;
    const coreRes = await pool.query(coreQuery, [tenantId, targetStudentId, yearId]);
    const coreSubjects: StudentEnrolledSubjectDetail[] = coreRes.rows;

    // 3. Fetch Currently Enrolled Electives
    const existingElectivesRes = await pool.query(
      `SELECT sse.offering_id, sse.approval_status, sse.elective_group
       FROM student_subject_enrollments sse
       JOIN subject_offerings so ON so.id = sse.offering_id
       WHERE sse.tenant_id = $1
         AND sse.student_id = $2
         AND so.academic_year_id = $3
         AND sse.enrollment_type = 'stream_elective'
         AND sse.status = 'active'`,
      [tenantId, targetStudentId, yearId]
    );
    const selectedOfferingIds = existingElectivesRes.rows.map(r => r.offering_id);

    // 4. Fetch Stream Elective Rules and Subject Offerings for each group
    const rulesQuery = `
      SELECT
        ssr.id AS rule_id,
        ssr.stream_id,
        ssr.subject_id,
        ssr.elective_group,
        ssr.min_selections,
        ssr.max_selections,
        s.name AS subject_name,
        s.code AS subject_code,
        so.id AS offering_id,
        COALESCE(so.periods_per_week, 4) AS periods_per_week,
        COALESCE(so.duration_minutes, 40) AS duration_minutes,
        (t.first_name || ' ' || t.last_name) AS teacher_name,
        COALESCE(sec.capacity, 35) AS capacity,
        COALESCE((
          SELECT COUNT(*)
          FROM student_subject_enrollments sse_count
          WHERE sse_count.offering_id = so.id
            AND sse_count.status = 'active'
            AND sse_count.waitlist_position IS NULL
        ), 0)::int AS enrolled_count
      FROM stream_subject_rules ssr
      JOIN subjects s ON s.id = ssr.subject_id
      JOIN subject_offerings so ON so.subject_id = s.id
                                AND so.academic_year_id = $2
                                AND so.tenant_id = $1
                                AND (so.section_id = $4 OR so.section_id IS NULL)
                                AND so.status = 'active'
      LEFT JOIN sections sec ON sec.id = so.section_id
      LEFT JOIN teachers t ON t.id = so.teacher_id
      WHERE ssr.tenant_id = $1
        AND ssr.stream_id = $3
        AND ssr.rule_type = 'elective'
        AND ssr.is_active = true
      ORDER BY ssr.elective_group, s.name
    `;

    const rulesRes = await pool.query(rulesQuery, [
      tenantId,
      yearId,
      studentInfo.stream_id,
      studentInfo.section_id || '00000000-0000-0000-0000-000000000000'
    ]);

    // Group rules by elective_group
    const groupsMap = new Map<string, StreamElectiveGroupOption>();
    for (const row of rulesRes.rows) {
      const gName = row.elective_group || 'Electives';
      if (!groupsMap.has(gName)) {
        groupsMap.set(gName, {
          elective_group: gName,
          min_selections: row.min_selections,
          max_selections: row.max_selections,
          options: []
        });
      }

      const grp = groupsMap.get(gName)!;
      const isFull = row.enrolled_count >= row.capacity;

      // Avoid duplicate offering options in the same group
      if (!grp.options.some(o => o.offering_id === row.offering_id)) {
        grp.options.push({
          offering_id: row.offering_id,
          subject_id: row.subject_id,
          subject_name: row.subject_name,
          subject_code: row.subject_code,
          periods_per_week: row.periods_per_week,
          duration_minutes: row.duration_minutes,
          teacher_name: row.teacher_name || undefined,
          capacity: row.capacity,
          enrolled_count: row.enrolled_count,
          is_full: isFull
        });
      }
    }

    const electiveGroups = Array.from(groupsMap.values());

    return {
      success: true,
      data: {
        student_id: studentInfo.student_id,
        student_name: studentInfo.student_name,
        admission_number: studentInfo.admission_number,
        class_name: studentInfo.class_name,
        section_name: studentInfo.section_name,
        stream_id: studentInfo.stream_id,
        stream_name: studentInfo.stream_name,
        stream_code: studentInfo.stream_code,
        academic_year_id: yearId,
        academic_year_name: studentInfo.academic_year_name,
        core_subjects: coreSubjects,
        elective_groups: electiveGroups,
        selected_offering_ids: selectedOfferingIds,
        electives_submitted: studentInfo.electives_submitted,
        electives_approved: studentInfo.electives_approved,
        electives_locked: studentInfo.electives_locked
      }
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: submitStudentElectives
// ─────────────────────────────────────────────────────────────

export async function submitStudentElectives(
  tenantSlug: string,
  payload: SubmitElectivesPayload
): Promise<{ success: boolean; message?: string; waitlistCount?: number; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    const userId = await resolveUserId();
    if (!tenantId) return { success: false, error: 'Tenant not found.' };

    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database unavailable.' };

    // 1. Check if student stream assignment is locked
    const ssaRes = await pool.query(
      `SELECT id, stream_id, electives_locked
       FROM student_stream_assignments
       WHERE tenant_id = $1 AND student_id = $2 AND academic_year_id = $3 AND status = 'active'
       LIMIT 1`,
      [tenantId, payload.student_id, payload.academic_year_id]
    );

    if (ssaRes.rows.length === 0) {
      return { success: false, error: 'Student stream assignment not found.' };
    }

    const assignment = ssaRes.rows[0];
    if (assignment.electives_locked) {
      return { success: false, error: 'Elective selections have been locked by the school administration.' };
    }

    // 2. Validate selection counts against stream_subject_rules
    const rulesRes = await pool.query(
      `SELECT elective_group, min_selections, max_selections
       FROM stream_subject_rules
       WHERE tenant_id = $1 AND stream_id = $2 AND rule_type = 'elective' AND is_active = true
       GROUP BY elective_group, min_selections, max_selections`,
      [tenantId, assignment.stream_id]
    );

    for (const rule of rulesRes.rows) {
      const gName = rule.elective_group;
      const countInGroup = payload.selections.filter(s => s.elective_group === gName).length;
      if (countInGroup < rule.min_selections) {
        return {
          success: false,
          error: `Please select at least ${rule.min_selections} subject(s) in ${gName}. Currently selected: ${countInGroup}.`
        };
      }
      if (countInGroup > rule.max_selections) {
        return {
          success: false,
          error: `You may select at most ${rule.max_selections} subject(s) in ${gName}. Currently selected: ${countInGroup}.`
        };
      }
    }

    // 3. Begin Transaction / Enrollment Updates
    // Deactivate previous active elective enrollments
    await pool.query(
      `UPDATE student_subject_enrollments
       SET status = 'dropped', dropped_at = NOW()
       WHERE tenant_id = $1
         AND student_id = $2
         AND enrollment_type = 'stream_elective'
         AND status = 'active'`,
      [tenantId, payload.student_id]
    );

    let waitlistCount = 0;

    // 4. Insert each chosen elective with capacity and waitlist checking
    for (const sel of payload.selections) {
      // Check offering capacity
      const capRes = await pool.query(
        `SELECT so.id, COALESCE(sec.capacity, 35) AS capacity,
                COUNT(sse.id)::int AS current_active
         FROM subject_offerings so
         LEFT JOIN sections sec ON sec.id = so.section_id
         LEFT JOIN student_subject_enrollments sse ON sse.offering_id = so.id AND sse.status = 'active' AND sse.waitlist_position IS NULL
         WHERE so.id = $1
         GROUP BY so.id, sec.capacity`,
        [sel.offering_id]
      );

      let waitlistPos: number | null = null;
      if (capRes.rows.length > 0) {
        const { capacity, current_active } = capRes.rows[0];
        if (current_active >= capacity) {
          // Offering is full, assign next waitlist position
          const wlRes = await pool.query(
            `SELECT COALESCE(MAX(waitlist_position), 0) + 1 AS next_pos
             FROM student_subject_enrollments
             WHERE offering_id = $1 AND status = 'active'`,
            [sel.offering_id]
          );
          waitlistPos = wlRes.rows[0]?.next_pos || 1;
          waitlistCount++;
        }
      }

      await pool.query(
        `INSERT INTO student_subject_enrollments (
           tenant_id, student_id, offering_id,
           status, enrollment_type, elective_group,
           approval_status, waitlist_position, stream_assignment_id,
           enrolled_at
         ) VALUES (
           $1, $2, $3,
           'active', 'stream_elective', $4,
           'pending', $5, $6,
           NOW()
         )
         ON CONFLICT (student_id, offering_id) DO UPDATE SET
           status = 'active',
           enrollment_type = 'stream_elective',
           elective_group = EXCLUDED.elective_group,
           approval_status = 'pending',
           waitlist_position = EXCLUDED.waitlist_position,
           stream_assignment_id = EXCLUDED.stream_assignment_id,
           dropped_at = NULL,
           enrolled_at = NOW()`,
        [
          tenantId,
          payload.student_id,
          sel.offering_id,
          sel.elective_group,
          waitlistPos,
          assignment.id
        ]
      );
    }

    // 5. Update assignment state
    await pool.query(
      `UPDATE student_stream_assignments
       SET electives_submitted = true, electives_approved = false
       WHERE id = $1`,
      [assignment.id]
    );

    // 6. Audit log
    await pool.query(
      `INSERT INTO academic_audit_logs (tenant_id, actor_id, action, entity, entity_id, new_values)
       VALUES ($1, $2, 'student.electives_submitted', 'student_stream_assignment', $3, $4)`,
      [tenantId, userId, assignment.id, JSON.stringify({ selections_count: payload.selections.length, waitlist_count: waitlistCount })]
    );

    revalidatePath(`/${tenantSlug}/student/electives`);
    revalidatePath(`/${tenantSlug}/admin/academics/electives`);
    revalidatePath(`/${tenantSlug}/admin/academics/stream-assignments`);

    const message = waitlistCount > 0
      ? `Electives submitted successfully. Note: ${waitlistCount} subject(s) are at full capacity and placed on the waitlist.`
      : 'Electives submitted successfully. Awaiting administration review.';

    return { success: true, message, waitlistCount };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: getAdminElectiveSubmissions
// ─────────────────────────────────────────────────────────────

export async function getAdminElectiveSubmissions(
  tenantSlug: string,
  filters: {
    academic_year_id?: string;
    stream_id?: string;
    class_id?: string;
    section_id?: string;
    status?: 'all' | 'pending' | 'approved' | 'rejected' | 'not_submitted' | 'locked';
    search?: string;
  } = {}
): Promise<{
  success: boolean;
  data: ElectiveSubmissionAdminRow[];
  totalStudents: number;
  submittedCount: number;
  pendingCount: number;
  approvedCount: number;
  lockedCount: number;
  error?: string;
}> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) return { success: false, data: [], totalStudents: 0, submittedCount: 0, pendingCount: 0, approvedCount: 0, lockedCount: 0, error: 'Tenant not found.' };

    const pool = getPgPool();
    if (!pool) return { success: false, data: [], totalStudents: 0, submittedCount: 0, pendingCount: 0, approvedCount: 0, lockedCount: 0, error: 'Database unavailable.' };

    let yearId = filters.academic_year_id;
    if (!yearId) {
      const curYear = await pool.query(
        `SELECT id FROM academic_years WHERE tenant_id = $1 AND is_current = true LIMIT 1`,
        [tenantId]
      );
      yearId = curYear.rows[0]?.id;
    }

    if (!yearId) {
      return { success: true, data: [], totalStudents: 0, submittedCount: 0, pendingCount: 0, approvedCount: 0, lockedCount: 0 };
    }

    const conditions = ['s.tenant_id = $1', 's.is_active = true', 'ssa.academic_year_id = $2', "ssa.status = 'active'"];
    const params: unknown[] = [tenantId, yearId];
    let p = 3;

    if (filters.stream_id) {
      conditions.push(`ssa.stream_id = $${p++}`);
      params.push(filters.stream_id);
    }
    if (filters.class_id) {
      conditions.push(`cl.id = $${p++}`);
      params.push(filters.class_id);
    }
    if (filters.section_id) {
      conditions.push(`sec.id = $${p++}`);
      params.push(filters.section_id);
    }
    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'locked') {
        conditions.push(`ssa.electives_locked = true`);
      } else if (filters.status === 'approved') {
        conditions.push(`ssa.electives_approved = true`);
      } else if (filters.status === 'pending') {
        conditions.push(`ssa.electives_submitted = true AND ssa.electives_approved = false`);
      } else if (filters.status === 'not_submitted') {
        conditions.push(`ssa.electives_submitted = false`);
      }
    }
    if (filters.search) {
      conditions.push(`(s.first_name ILIKE $${p} OR s.last_name ILIKE $${p} OR s.admission_number ILIKE $${p})`);
      params.push(`%${filters.search}%`);
      p++;
    }

    const query = `
      SELECT
        ssa.id AS assignment_id,
        s.id AS student_id,
        (s.first_name || ' ' || s.last_name) AS student_name,
        s.admission_number,
        cl.name AS class_name,
        sec.name AS section_name,
        cs.name AS stream_name,
        cs.code AS stream_code,
        COALESCE(ssa.electives_submitted, false) AS electives_submitted,
        COALESCE(ssa.electives_approved, false) AS electives_approved,
        COALESCE(ssa.electives_locked, false) AS electives_locked,
        ssa.assigned_at AS submitted_at,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'enrollment_id', sse.id,
                'subject_name', sub.name,
                'subject_code', sub.code,
                'elective_group', sse.elective_group,
                'approval_status', sse.approval_status,
                'waitlist_position', sse.waitlist_position
              )
            )
            FROM student_subject_enrollments sse
            JOIN subject_offerings so ON so.id = sse.offering_id
            JOIN subjects sub ON sub.id = so.subject_id
            WHERE sse.student_id = s.id
              AND sse.tenant_id = s.tenant_id
              AND so.academic_year_id = $2
              AND sse.enrollment_type = 'stream_elective'
              AND sse.status = 'active'
          ),
          '[]'::json
        ) AS chosen_electives
      FROM student_stream_assignments ssa
      JOIN students s ON s.id = ssa.student_id
      JOIN curriculum_streams cs ON cs.id = ssa.stream_id
      LEFT JOIN sections sec ON sec.id = ssa.section_id
      LEFT JOIN classes cl ON cl.id = sec.class_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY cl.sort_order NULLS LAST, sec.name, s.last_name, s.first_name
    `;

    const res = await pool.query(query, params);
    const rows: ElectiveSubmissionAdminRow[] = res.rows;

    const totalStudents = rows.length;
    const submittedCount = rows.filter(r => r.electives_submitted).length;
    const pendingCount = rows.filter(r => r.electives_submitted && !r.electives_approved).length;
    const approvedCount = rows.filter(r => r.electives_approved).length;
    const lockedCount = rows.filter(r => r.electives_locked).length;

    return {
      success: true,
      data: rows,
      totalStudents,
      submittedCount,
      pendingCount,
      approvedCount,
      lockedCount
    };
  } catch (err: any) {
    return {
      success: false,
      data: [],
      totalStudents: 0,
      submittedCount: 0,
      pendingCount: 0,
      approvedCount: 0,
      lockedCount: 0,
      error: err.message
    };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: reviewStudentElectives
// ─────────────────────────────────────────────────────────────

export async function reviewStudentElectives(
  tenantSlug: string,
  payload: ReviewStudentElectivesPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    const userId = await resolveUserId();
    if (!tenantId) return { success: false, error: 'Tenant not found.' };

    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database unavailable.' };

    const isApprove = payload.action === 'approve';
    const newApprovalStatus = isApprove ? 'approved' : 'rejected';

    // 1. Update elective enrollments for this student
    await pool.query(
      `UPDATE student_subject_enrollments
       SET approval_status = $1,
           approved_by = $2,
           approved_at = NOW()
       WHERE tenant_id = $3
         AND student_id = $4
         AND enrollment_type = 'stream_elective'
         AND status = 'active'`,
      [newApprovalStatus, userId, tenantId, payload.student_id]
    );

    // 2. Update stream assignment state
    if (isApprove) {
      await pool.query(
        `UPDATE student_stream_assignments
         SET electives_approved = true
         WHERE id = $1 AND tenant_id = $2`,
        [payload.assignment_id, tenantId]
      );
    } else {
      // If rejected, allow student to resubmit
      await pool.query(
        `UPDATE student_stream_assignments
         SET electives_approved = false,
             electives_submitted = false
         WHERE id = $1 AND tenant_id = $2`,
        [payload.assignment_id, tenantId]
      );
    }

    // 3. Audit log
    await pool.query(
      `INSERT INTO academic_audit_logs (tenant_id, actor_id, action, entity, entity_id, new_values)
       VALUES ($1, $2, $3, 'student_stream_assignment', $4, $5)`,
      [
        tenantId,
        userId,
        isApprove ? 'electives.approved' : 'electives.rejected',
        payload.assignment_id,
        JSON.stringify({ action: payload.action, comment: payload.review_comment })
      ]
    );

    revalidatePath(`/${tenantSlug}/admin/academics/electives`);
    revalidatePath(`/${tenantSlug}/student/electives`);
    revalidatePath(`/${tenantSlug}/admin/academics/stream-assignments`);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: batchReviewCohortElectives
// ─────────────────────────────────────────────────────────────

export async function batchReviewCohortElectives(
  tenantSlug: string,
  assignmentIds: string[],
  action: 'approve' | 'reject'
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    if (!assignmentIds || assignmentIds.length === 0) {
      return { success: false, count: 0, error: 'No student submissions selected.' };
    }

    const tenantId = await resolveTenantId(tenantSlug);
    const userId = await resolveUserId();
    if (!tenantId) return { success: false, count: 0, error: 'Tenant not found.' };

    const pool = getPgPool();
    if (!pool) return { success: false, count: 0, error: 'Database unavailable.' };

    const isApprove = action === 'approve';
    const newApprovalStatus = isApprove ? 'approved' : 'rejected';

    // 1. Update enrollments
    await pool.query(
      `UPDATE student_subject_enrollments
       SET approval_status = $1, approved_by = $2, approved_at = NOW()
       WHERE tenant_id = $3
         AND enrollment_type = 'stream_elective'
         AND status = 'active'
         AND stream_assignment_id = ANY($4::uuid[])`,
      [newApprovalStatus, userId, tenantId, assignmentIds]
    );

    // 2. Update assignments
    if (isApprove) {
      await pool.query(
        `UPDATE student_stream_assignments
         SET electives_approved = true
         WHERE id = ANY($1::uuid[]) AND tenant_id = $2`,
        [assignmentIds, tenantId]
      );
    } else {
      await pool.query(
        `UPDATE student_stream_assignments
         SET electives_approved = false, electives_submitted = false
         WHERE id = ANY($1::uuid[]) AND tenant_id = $2`,
        [assignmentIds, tenantId]
      );
    }

    revalidatePath(`/${tenantSlug}/admin/academics/electives`);
    revalidatePath(`/${tenantSlug}/student/electives`);
    revalidatePath(`/${tenantSlug}/admin/academics/stream-assignments`);

    return { success: true, count: assignmentIds.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: ensureElectiveRulesAndOfferingsSeeded
// ─────────────────────────────────────────────────────────────

export async function ensureElectiveRulesAndOfferingsSeeded(
  tenantSlug: string
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) return { success: false, message: '', error: 'Tenant not found.' };

    const pool = getPgPool();
    if (!pool) return { success: false, message: '', error: 'Database unavailable.' };

    const yrRes = await pool.query(
      `SELECT id FROM academic_years WHERE tenant_id = $1 AND is_current = true LIMIT 1`,
      [tenantId]
    );
    if (yrRes.rows.length === 0) return { success: false, message: '', error: 'No active academic year found.' };
    const academicYearId = yrRes.rows[0].id;

    // 1. Seed Elective Subjects
    const electiveSubjects = [
      { code: 'FMT-01', name: 'Further Mathematics' },
      { code: 'TDR-01', name: 'Technical Drawing' },
      { code: 'AGR-01', name: 'Agricultural Science' },
      { code: 'CSC-01', name: 'Computer Studies' },
      { code: 'FRE-01', name: 'French Language' },
      { code: 'CRS-01', name: 'Christian Religious Studies' },
      { code: 'IRS-01', name: 'Islamic Religious Studies' },
      { code: 'CAC-01', name: 'Cost Accounting' },
      { code: 'BMG-01', name: 'Business Management' },
    ];

    const subjectMap: Record<string, string> = {};
    for (const s of electiveSubjects) {
      const ins = await pool.query(
        `INSERT INTO subjects (tenant_id, code, name, is_examinable, is_active)
         VALUES ($1, $2, $3, true, true)
         ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [tenantId, s.code, s.name]
      );
      subjectMap[s.code] = ins.rows[0].id;
    }

    // 2. Resolve Sections & Streams
    const secSci = (await pool.query(`SELECT id FROM sections WHERE tenant_id = $1 AND name = 'SSS 1 Science' LIMIT 1`, [tenantId])).rows[0]?.id;
    const secArt = (await pool.query(`SELECT id FROM sections WHERE tenant_id = $1 AND name = 'SSS 1 Arts' LIMIT 1`, [tenantId])).rows[0]?.id;
    const secCom = (await pool.query(`SELECT id FROM sections WHERE tenant_id = $1 AND name = 'SSS 1 Commercial' LIMIT 1`, [tenantId])).rows[0]?.id;

    const sciStream = (await pool.query(`SELECT id FROM curriculum_streams WHERE tenant_id = $1 AND code = 'SCI_TECH' LIMIT 1`, [tenantId])).rows[0]?.id;
    const langStream = (await pool.query(`SELECT id FROM curriculum_streams WHERE tenant_id = $1 AND code = 'LANG_LIT' LIMIT 1`, [tenantId])).rows[0]?.id;
    const comStream = (await pool.query(`SELECT id FROM curriculum_streams WHERE tenant_id = $1 AND code = 'ECON_BUS' LIMIT 1`, [tenantId])).rows[0]?.id;

    // Helper to seed elective rules and offerings
    const seedGroup = async (
      streamId: string | undefined,
      groupName: string,
      codes: string[],
      minPicks: number,
      maxPicks: number,
      sectionId?: string
    ) => {
      if (!streamId) return;
      for (const code of codes) {
        const subjId = subjectMap[code];
        if (!subjId) continue;

        await pool.query(
          `INSERT INTO stream_subject_rules (tenant_id, stream_id, subject_id, rule_type, elective_group, min_selections, max_selections, is_active)
           VALUES ($1, $2, $3, 'elective', $4, $5, $6, true)
           ON CONFLICT DO NOTHING`,
          [tenantId, streamId, subjId, groupName, minPicks, maxPicks]
        );

        if (sectionId) {
          await pool.query(
            `INSERT INTO subject_offerings (tenant_id, academic_year_id, subject_id, section_id, periods_per_week, duration_minutes, status, is_compulsory, requirement_type, elective_group)
             SELECT $1, $2, $3, $4, 4, 40, 'active', false, 'elective', $5
             WHERE NOT EXISTS (
               SELECT 1 FROM subject_offerings
               WHERE academic_year_id = $2 AND subject_id = $3 AND section_id = $4 AND term_id IS NULL
             )`,
            [tenantId, academicYearId, subjId, sectionId, groupName]
          );
        }
      }
    };

    // Configure Science Electives: Group A (pick 1: FMT, TDR) and Group B (pick 1: AGR, CSC, FRE)
    await seedGroup(sciStream, 'Group A (Science Electives)', ['FMT-01', 'TDR-01'], 1, 1, secSci);
    await seedGroup(sciStream, 'Group B (Applied Electives)', ['AGR-01', 'CSC-01', 'FRE-01'], 1, 1, secSci);

    // Configure Arts Electives: Group A (pick 1: CRS, IRS) and Group B (pick 1: FRE, CSC)
    await seedGroup(langStream, 'Group A (Humanities Electives)', ['CRS-01', 'IRS-01'], 1, 1, secArt);
    await seedGroup(langStream, 'Group B (Languages & Skills)', ['FRE-01', 'CSC-01'], 1, 1, secArt);

    // Configure Commercial Electives: Group A (pick 1: CAC, BMG) and Group B (pick 1: CSC, AGR)
    await seedGroup(comStream, 'Group A (Business Electives)', ['CAC-01', 'BMG-01'], 1, 1, secCom);
    await seedGroup(comStream, 'Group B (Applied Skills)', ['CSC-01', 'AGR-01'], 1, 1, secCom);

    revalidatePath(`/${tenantSlug}/student/electives`);
    revalidatePath(`/${tenantSlug}/admin/academics/electives`);
    return { success: true, message: 'Elective groups and offerings initialized successfully.' };
  } catch (err: any) {
    return { success: false, message: '', error: err.message };
  }
}
