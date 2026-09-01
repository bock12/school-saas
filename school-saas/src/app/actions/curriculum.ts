'use server';

import { getPgPool } from '@/lib/db/pg-fallback';
import { revalidatePath } from 'next/cache';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type CurriculumStatus =
  | 'draft' | 'pending_review' | 'changes_requested'
  | 'approved' | 'published' | 'archived';

export interface CurriculumVersionRecord {
  id: string;
  tenant_id: string;
  subject_id: string;
  subject_name?: string;
  academic_year_id: string;
  academic_year_name?: string;
  grade_level: string;
  version: number;
  status: CurriculumStatus;
  effective_from?: string;
  effective_to?: string;
  notes?: string;
  submitted_by?: string;
  submitted_at?: string;
  approved_by?: string;
  approved_at?: string;
  published_by?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  topic_count?: number;
  outcome_count?: number;
}

export interface CurriculumTopicRecord {
  id: string;
  curriculum_version_id: string;
  parent_topic_id?: string;
  title: string;
  description?: string;
  sequence: number;
  term?: number;
  estimated_periods: number;
  created_at: string;
  updated_at: string;
  children?: CurriculumTopicRecord[];
  outcomes?: LearningOutcomeRecord[];
  progress?: string; // from coverage_log
}

export interface LearningOutcomeRecord {
  id: string;
  curriculum_version_id: string;
  topic_id?: string;
  code?: string;
  description: string;
  cognitive_level?: string;
  sequence: number;
  created_at: string;
}

export interface CoverageStats {
  total_topics: number;
  planned: number;
  started: number;
  completed: number;
  deferred: number;
  skipped: number;
  coverage_percent: number;
}

// ─────────────────────────────────────────────────────────────
// Helper: resolve tenant UUID
// ─────────────────────────────────────────────────────────────

function formatDateStr(d: any): string | undefined {
  if (!d) return undefined;
  if (typeof d === 'string') return d.split('T')[0];
  if (d instanceof Date) return d.toISOString().split('T')[0];
  return String(d);
}

function formatIsoStr(d: any): string | undefined {
  if (!d) return undefined;
  if (d instanceof Date) return d.toISOString();
  return String(d);
}

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
// ACTION: getCurriculumVersions
// ─────────────────────────────────────────────────────────────

export async function getCurriculumVersions(
  tenantSlug: string,
  filters: { subject_id?: string; academic_year_id?: string; grade_level?: string; status?: CurriculumStatus } = {}
): Promise<{ success: boolean; data: CurriculumVersionRecord[]; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) return { success: false, data: [], error: 'Tenant not found.' };

    const pool = getPgPool();
    if (!pool) return { success: false, data: [], error: 'Database unavailable.' };

    const conditions = ['cv.tenant_id = $1'];
    const params: unknown[] = [tenantId];
    let p = 2;

    if (filters.subject_id) { conditions.push(`cv.subject_id = $${p++}`); params.push(filters.subject_id); }
    if (filters.academic_year_id) { conditions.push(`cv.academic_year_id = $${p++}`); params.push(filters.academic_year_id); }
    if (filters.grade_level) { conditions.push(`cv.grade_level = $${p++}`); params.push(filters.grade_level); }
    if (filters.status) { conditions.push(`cv.status = $${p++}`); params.push(filters.status); }

    const res = await pool.query(
      `SELECT cv.*,
          s.name AS subject_name,
          ay.name AS academic_year_name,
          (SELECT COUNT(*) FROM curriculum_topics WHERE curriculum_version_id = cv.id) AS topic_count,
          (SELECT COUNT(*) FROM learning_outcomes WHERE curriculum_version_id = cv.id) AS outcome_count
        FROM curriculum_versions cv
        JOIN subjects s ON s.id = cv.subject_id
        JOIN academic_years ay ON ay.id = cv.academic_year_id
        WHERE ${conditions.join(' AND ')}
        ORDER BY s.name, ay.start_date DESC, cv.version DESC`,
      params
    );

    const formatted = res.rows.map((cv: any) => ({
      ...cv,
      effective_from: formatDateStr(cv.effective_from),
      effective_to: formatDateStr(cv.effective_to),
      submitted_at: formatIsoStr(cv.submitted_at),
      approved_at: formatIsoStr(cv.approved_at),
      published_at: formatIsoStr(cv.published_at),
      created_at: formatIsoStr(cv.created_at) || new Date().toISOString(),
      updated_at: formatIsoStr(cv.updated_at) || new Date().toISOString(),
    }));

    return { success: true, data: formatted };
  } catch (err: any) {
    return { success: false, data: [], error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: createCurriculumVersion
// ─────────────────────────────────────────────────────────────

export async function createCurriculumVersion(
  tenantSlug: string,
  payload: {
    subject_id: string;
    academic_year_id: string;
    grade_level: string;
    effective_from?: string;
    effective_to?: string;
    notes?: string;
  }
): Promise<{ success: boolean; version?: CurriculumVersionRecord; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) return { success: false, error: 'Tenant not found.' };

    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database unavailable.' };

    // Determine next version number
    const vRes = await pool.query(
      `SELECT COALESCE(MAX(version), 0) + 1 AS next_version
       FROM curriculum_versions
       WHERE subject_id = $1 AND academic_year_id = $2 AND grade_level = $3`,
      [payload.subject_id, payload.academic_year_id, payload.grade_level]
    );
    const nextVersion = vRes.rows[0].next_version;

    const res = await pool.query(
      `INSERT INTO curriculum_versions (
          tenant_id, subject_id, academic_year_id, grade_level, version,
          status, effective_from, effective_to, notes
        ) VALUES ($1,$2,$3,$4,$5,'draft',$6,$7,$8)
        RETURNING *`,
      [
        tenantId,
        payload.subject_id,
        payload.academic_year_id,
        payload.grade_level,
        nextVersion,
        payload.effective_from || null,
        payload.effective_to || null,
        payload.notes || null,
      ]
    );

    await pool.query(
      `INSERT INTO academic_audit_logs (tenant_id, action, entity, entity_id)
       VALUES ($1, 'curriculum.created', 'curriculum_version', $2)`,
      [tenantId, res.rows[0].id]
    );

    revalidatePath(`/${tenantSlug}/admin/academics/curriculum`);
    return { success: true, version: res.rows[0] };
  } catch (err: any) {
    if (err.code === '23505') return { success: false, error: 'A curriculum version with these parameters already exists.' };
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: updateCurriculumVersion (only allowed on non-published)
// ─────────────────────────────────────────────────────────────

export async function updateCurriculumVersion(
  tenantSlug: string,
  versionId: string,
  payload: { notes?: string; effective_from?: string; effective_to?: string; grade_level?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) return { success: false, error: 'Tenant not found.' };

    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database unavailable.' };

    // Guard: cannot update published curriculum
    const check = await pool.query(
      `SELECT status FROM curriculum_versions WHERE id = $1 AND tenant_id = $2`,
      [versionId, tenantId]
    );
    if (check.rows.length === 0) return { success: false, error: 'Curriculum version not found.' };
    if (check.rows[0].status === 'published') {
      return { success: false, error: 'Published curriculum cannot be edited. Create a new version instead.' };
    }

    await pool.query(
      `UPDATE curriculum_versions
       SET notes = COALESCE($1, notes),
           effective_from = COALESCE($2, effective_from),
           effective_to = COALESCE($3, effective_to),
           grade_level = COALESCE($4, grade_level),
           updated_at = NOW()
       WHERE id = $5 AND tenant_id = $6`,
      [payload.notes, payload.effective_from, payload.effective_to, payload.grade_level, versionId, tenantId]
    );

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: submitCurriculumForReview
// ─────────────────────────────────────────────────────────────

export async function submitCurriculumForReview(
  tenantSlug: string,
  versionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    const userId = await resolveUserId();
    if (!tenantId) return { success: false, error: 'Tenant not found.' };

    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database unavailable.' };

    const check = await pool.query(
      `SELECT status FROM curriculum_versions WHERE id = $1 AND tenant_id = $2`,
      [versionId, tenantId]
    );
    if (!check.rows[0]) return { success: false, error: 'Version not found.' };
    if (!['draft', 'changes_requested'].includes(check.rows[0].status)) {
      return { success: false, error: `Cannot submit a curriculum in "${check.rows[0].status}" status.` };
    }

    // Must have at least one topic with outcomes
    const topicCheck = await pool.query(
      `SELECT COUNT(*) FROM curriculum_topics WHERE curriculum_version_id = $1`,
      [versionId]
    );
    if (parseInt(topicCheck.rows[0].count) === 0) {
      return { success: false, error: 'Add at least one topic before submitting for review.' };
    }

    await pool.query(
      `UPDATE curriculum_versions
       SET status = 'pending_review', submitted_by = $1, submitted_at = NOW(), updated_at = NOW()
       WHERE id = $2 AND tenant_id = $3`,
      [userId, versionId, tenantId]
    );

    await pool.query(
      `INSERT INTO academic_audit_logs (tenant_id, actor_id, action, entity, entity_id)
       VALUES ($1, $2, 'curriculum.submitted', 'curriculum_version', $3)`,
      [tenantId, userId, versionId]
    );

    revalidatePath(`/${tenantSlug}/admin/academics/curriculum`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: approveCurriculum
// ─────────────────────────────────────────────────────────────

export async function approveCurriculum(
  tenantSlug: string,
  versionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    const userId = await resolveUserId();
    if (!tenantId) return { success: false, error: 'Tenant not found.' };

    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database unavailable.' };

    await pool.query(
      `UPDATE curriculum_versions
       SET status = 'approved', approved_by = $1, approved_at = NOW(), updated_at = NOW()
       WHERE id = $2 AND tenant_id = $3 AND status = 'pending_review'`,
      [userId, versionId, tenantId]
    );

    await pool.query(
      `INSERT INTO academic_audit_logs (tenant_id, actor_id, action, entity, entity_id)
       VALUES ($1, $2, 'curriculum.approved', 'curriculum_version', $3)`,
      [tenantId, userId, versionId]
    );

    revalidatePath(`/${tenantSlug}/admin/academics/curriculum`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: publishCurriculum (immutable after this)
// ─────────────────────────────────────────────────────────────

export async function publishCurriculum(
  tenantSlug: string,
  versionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    const userId = await resolveUserId();
    if (!tenantId) return { success: false, error: 'Tenant not found.' };

    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database unavailable.' };

    const check = await pool.query(
      `SELECT status FROM curriculum_versions WHERE id = $1 AND tenant_id = $2`,
      [versionId, tenantId]
    );
    if (check.rows[0]?.status !== 'approved') {
      return { success: false, error: 'Only approved curricula can be published.' };
    }

    await pool.query(
      `UPDATE curriculum_versions
       SET status = 'published', published_by = $1, published_at = NOW(), updated_at = NOW()
       WHERE id = $2 AND tenant_id = $3`,
      [userId, versionId, tenantId]
    );

    await pool.query(
      `INSERT INTO academic_audit_logs (tenant_id, actor_id, action, entity, entity_id)
       VALUES ($1, $2, 'curriculum.published', 'curriculum_version', $3)`,
      [tenantId, userId, versionId]
    );

    revalidatePath(`/${tenantSlug}/admin/academics/curriculum`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: getCurriculumTopics (nested tree)
// ─────────────────────────────────────────────────────────────

export async function getCurriculumTopics(
  tenantSlug: string,
  versionId: string
): Promise<{ success: boolean; data: CurriculumTopicRecord[]; error?: string }> {
  try {
    const pool = getPgPool();
    if (!pool) return { success: false, data: [], error: 'Database unavailable.' };

    const topicsRes = await pool.query(
      `SELECT t.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', lo.id, 'code', lo.code, 'description', lo.description,
                'cognitive_level', lo.cognitive_level, 'sequence', lo.sequence
              ) ORDER BY lo.sequence
            ) FILTER (WHERE lo.id IS NOT NULL), '[]'
          ) AS outcomes
        FROM curriculum_topics t
        LEFT JOIN learning_outcomes lo ON lo.topic_id = t.id
        WHERE t.curriculum_version_id = $1
        GROUP BY t.id
        ORDER BY t.sequence ASC`,
      [versionId]
    );

    // Build nested tree
    const flat = topicsRes.rows as CurriculumTopicRecord[];
    const byId = new Map(flat.map(t => [t.id, { ...t, children: [] as CurriculumTopicRecord[] }]));
    const roots: CurriculumTopicRecord[] = [];

    for (const topic of byId.values()) {
      if (topic.parent_topic_id && byId.has(topic.parent_topic_id)) {
        byId.get(topic.parent_topic_id)!.children!.push(topic);
      } else {
        roots.push(topic);
      }
    }

    return { success: true, data: roots };
  } catch (err: any) {
    return { success: false, data: [], error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: upsertCurriculumTopic
// ─────────────────────────────────────────────────────────────

export async function upsertCurriculumTopic(
  tenantSlug: string,
  versionId: string,
  payload: {
    id?: string;
    parent_topic_id?: string;
    title: string;
    description?: string;
    sequence: number;
    term?: number;
    estimated_periods?: number;
  }
): Promise<{ success: boolean; topic?: CurriculumTopicRecord; error?: string }> {
  try {
    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database unavailable.' };

    // Guard published status
    const check = await pool.query(
      `SELECT status FROM curriculum_versions WHERE id = $1`,
      [versionId]
    );
    if (check.rows[0]?.status === 'published') {
      return { success: false, error: 'Published curriculum is immutable. Create a new version.' };
    }

    let res;
    if (payload.id) {
      res = await pool.query(
        `UPDATE curriculum_topics
         SET title = $1, description = $2, sequence = $3, term = $4,
             estimated_periods = $5, parent_topic_id = $6, updated_at = NOW()
         WHERE id = $7 AND curriculum_version_id = $8
         RETURNING *`,
        [payload.title, payload.description || null, payload.sequence, payload.term || null,
         payload.estimated_periods || 1, payload.parent_topic_id || null, payload.id, versionId]
      );
    } else {
      res = await pool.query(
        `INSERT INTO curriculum_topics
           (curriculum_version_id, parent_topic_id, title, description, sequence, term, estimated_periods)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING *`,
        [versionId, payload.parent_topic_id || null, payload.title,
         payload.description || null, payload.sequence, payload.term || null, payload.estimated_periods || 1]
      );
    }

    return { success: true, topic: res.rows[0] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: deleteCurriculumTopic
// ─────────────────────────────────────────────────────────────

export async function deleteCurriculumTopic(
  tenantSlug: string,
  topicId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database unavailable.' };

    // Check if any progress has been logged
    const progressCheck = await pool.query(
      `SELECT COUNT(*) FROM curriculum_coverage_log WHERE topic_id = $1 AND status != 'planned'`,
      [topicId]
    );
    if (parseInt(progressCheck.rows[0].count) > 0) {
      return { success: false, error: 'Cannot delete a topic that has been started or completed. Mark it as skipped instead.' };
    }

    await pool.query('DELETE FROM curriculum_topics WHERE id = $1', [topicId]);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: upsertLearningOutcome
// ─────────────────────────────────────────────────────────────

export async function upsertLearningOutcome(
  tenantSlug: string,
  versionId: string,
  topicId: string,
  payload: {
    id?: string;
    code?: string;
    description: string;
    cognitive_level?: string;
    sequence: number;
  }
): Promise<{ success: boolean; outcome?: LearningOutcomeRecord; error?: string }> {
  try {
    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database unavailable.' };

    const check = await pool.query(
      `SELECT status FROM curriculum_versions WHERE id = $1`,
      [versionId]
    );
    if (check.rows[0]?.status === 'published') {
      return { success: false, error: 'Published curriculum is immutable.' };
    }

    let res;
    if (payload.id) {
      res = await pool.query(
        `UPDATE learning_outcomes
         SET code = $1, description = $2, cognitive_level = $3, sequence = $4, updated_at = NOW()
         WHERE id = $5 AND curriculum_version_id = $6
         RETURNING *`,
        [payload.code || null, payload.description, payload.cognitive_level || null,
         payload.sequence, payload.id, versionId]
      );
    } else {
      res = await pool.query(
        `INSERT INTO learning_outcomes (curriculum_version_id, topic_id, code, description, cognitive_level, sequence)
         VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING *`,
        [versionId, topicId, payload.code || null, payload.description,
         payload.cognitive_level || null, payload.sequence]
      );
    }

    return { success: true, outcome: res.rows[0] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: getCurriculumCoverage
// ─────────────────────────────────────────────────────────────

export async function getCurriculumCoverage(
  tenantSlug: string,
  offeringId: string
): Promise<{ success: boolean; data?: CoverageStats; error?: string }> {
  try {
    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database unavailable.' };

    const res = await pool.query(
      `SELECT
          COUNT(DISTINCT t.id) AS total_topics,
          COUNT(DISTINCT CASE WHEN cl.status = 'planned' THEN t.id END) AS planned,
          COUNT(DISTINCT CASE WHEN cl.status = 'started' THEN t.id END) AS started,
          COUNT(DISTINCT CASE WHEN cl.status = 'completed' THEN t.id END) AS completed,
          COUNT(DISTINCT CASE WHEN cl.status = 'deferred' THEN t.id END) AS deferred,
          COUNT(DISTINCT CASE WHEN cl.status = 'skipped' THEN t.id END) AS skipped
        FROM subject_offerings so
        JOIN curriculum_versions cv ON cv.id = so.curriculum_version_id
        JOIN curriculum_topics t ON t.curriculum_version_id = cv.id
        LEFT JOIN curriculum_coverage_log cl ON cl.offering_id = so.id AND cl.topic_id = t.id
        WHERE so.id = $1`,
      [offeringId]
    );

    const row = res.rows[0];
    const total = parseInt(row.total_topics);
    const completed = parseInt(row.completed);

    return {
      success: true,
      data: {
        total_topics: total,
        planned: parseInt(row.planned),
        started: parseInt(row.started),
        completed,
        deferred: parseInt(row.deferred),
        skipped: parseInt(row.skipped),
        coverage_percent: total > 0 ? Math.round((completed / total) * 100) : 0,
      }
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: logTopicProgress
// ─────────────────────────────────────────────────────────────

export async function logTopicProgress(
  tenantSlug: string,
  offeringId: string,
  topicId: string,
  status: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await resolveUserId();
    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database unavailable.' };

    await pool.query(
      `INSERT INTO curriculum_coverage_log (offering_id, topic_id, status, logged_by, logged_at, notes)
       VALUES ($1, $2, $3, $4, NOW(), $5)
       ON CONFLICT (offering_id, topic_id) DO UPDATE
         SET status = EXCLUDED.status, logged_by = EXCLUDED.logged_by,
             logged_at = EXCLUDED.logged_at, notes = EXCLUDED.notes`,
      [offeringId, topicId, status, userId, notes || null]
    );

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
