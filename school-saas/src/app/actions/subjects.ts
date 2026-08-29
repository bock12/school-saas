'use server';

import { getPgPool } from '@/lib/db/pg-fallback';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type SubjectCategory =
  | 'science' | 'mathematics' | 'language' | 'social_science'
  | 'business' | 'technology' | 'vocational' | 'creative_arts'
  | 'physical_education' | 'general' | 'other';

export type SubjectTypeVal = 'academic' | 'vocational' | 'co_curricular';

export interface SubjectRecord {
  id: string;
  tenant_id: string;
  name: string;
  short_name?: string;
  code?: string;
  national_code?: string;
  description?: string;
  category: SubjectCategory;
  subject_type: SubjectTypeVal;
  department_id?: string;
  department_name?: string;
  is_elective: boolean;
  is_active: boolean;
  archived_at?: string;
  created_at: string;
  updated_at: string;
  streams?: { stream_id: string; stream_name: string; stream_code: string; is_core: boolean }[];
}

export interface SubjectPayload {
  name: string;
  short_name?: string;
  code?: string;
  national_code?: string;
  description?: string;
  category?: SubjectCategory;
  subject_type?: SubjectTypeVal;
  department_id?: string;
  is_elective?: boolean;
  stream_ids?: string[];  // curriculum_streams ids
}

export interface CurriculumStreamRecord {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  description?: string;
  level?: string;
  sort_order: number;
  is_active: boolean;
}

export interface SubjectFilters {
  search?: string;
  department_id?: string;
  category?: string;
  is_active?: boolean;
  stream_id?: string;
  limit?: number;
  offset?: number;
}

// ─────────────────────────────────────────────────────────────
// Helper: resolve tenant UUID from slug or UUID
// ─────────────────────────────────────────────────────────────

async function resolveTenantId(slugOrId: string): Promise<string | null> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
  if (isUuid) return slugOrId;

  const pool = getPgPool();
  if (pool) {
    const res = await pool.query(
      'SELECT id FROM tenants WHERE slug = $1 LIMIT 1',
      [slugOrId.toLowerCase().trim()]
    );
    if (res.rows.length > 0) return res.rows[0].id;
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from('tenants')
    .select('id')
    .eq('slug', slugOrId.toLowerCase().trim())
    .maybeSingle();
  return data?.id || null;
}

// ─────────────────────────────────────────────────────────────
// Helper: generate subject code from name
// ─────────────────────────────────────────────────────────────

function generateCode(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].slice(0, 3).toUpperCase();
  }
  return words
    .slice(0, 3)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

async function ensureUniqueCode(pool: ReturnType<typeof getPgPool>, tenantId: string, base: string): Promise<string> {
  if (!pool) return base;
  let candidate = base;
  let suffix = 1;
  while (true) {
    const res = await pool.query(
      'SELECT id FROM subjects WHERE tenant_id = $1 AND code = $2 LIMIT 1',
      [tenantId, candidate]
    );
    if (res.rows.length === 0) return candidate;
    candidate = `${base}${String(suffix).padStart(3, '0')}`;
    suffix++;
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: getSubjects
// ─────────────────────────────────────────────────────────────

export async function getSubjects(
  tenantSlug: string,
  filters: SubjectFilters = {}
): Promise<{ success: boolean; data: SubjectRecord[]; total: number; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) return { success: false, data: [], total: 0, error: 'Tenant not found.' };

    const pool = getPgPool();
    if (pool) {
      const conditions: string[] = ['s.tenant_id = $1'];
      const params: unknown[] = [tenantId];
      let pIdx = 2;

      if (filters.search) {
        conditions.push(`(s.name ILIKE $${pIdx} OR s.code ILIKE $${pIdx} OR s.short_name ILIKE $${pIdx})`);
        params.push(`%${filters.search}%`);
        pIdx++;
      }
      if (filters.department_id) {
        conditions.push(`s.department_id = $${pIdx}`);
        params.push(filters.department_id);
        pIdx++;
      }
      if (filters.category) {
        conditions.push(`s.category = $${pIdx}`);
        params.push(filters.category);
        pIdx++;
      }
      if (filters.is_active !== undefined) {
        conditions.push(`s.is_active = $${pIdx}`);
        params.push(filters.is_active);
        pIdx++;
      }
      if (filters.stream_id) {
        conditions.push(`EXISTS (SELECT 1 FROM subject_streams ss WHERE ss.subject_id = s.id AND ss.stream_id = $${pIdx})`);
        params.push(filters.stream_id);
        pIdx++;
      }

      const where = conditions.join(' AND ');
      const limit = filters.limit ?? 50;
      const offset = filters.offset ?? 0;

      const countRes = await pool.query(
        `SELECT COUNT(*) FROM subjects s WHERE ${where}`,
        params
      );
      const total = parseInt(countRes.rows[0].count);

      const dataRes = await pool.query(
        `SELECT
            s.*,
            d.name AS department_name,
            s.subject_type_col AS subject_type,
            COALESCE(
              json_agg(
                json_build_object(
                  'stream_id', cs.id,
                  'stream_name', cs.name,
                  'stream_code', cs.code,
                  'is_core', ss2.is_core
                )
              ) FILTER (WHERE cs.id IS NOT NULL),
              '[]'
            ) AS streams
          FROM subjects s
          LEFT JOIN departments d ON d.id = s.department_id
          LEFT JOIN subject_streams ss2 ON ss2.subject_id = s.id
          LEFT JOIN curriculum_streams cs ON cs.id = ss2.stream_id
          WHERE ${where}
          GROUP BY s.id, d.name
          ORDER BY s.name ASC
          LIMIT $${pIdx} OFFSET $${pIdx + 1}`,
        [...params, limit, offset]
      );

      return { success: true, data: dataRes.rows, total };
    }

    // Supabase fallback
    let query = createAdminClient()
      .from('subjects')
      .select(`*, departments(name), subject_streams(stream_id, is_core, curriculum_streams(id, name, code))`, { count: 'exact' })
      .eq('tenant_id', tenantId)
      .order('name');

    if (filters.search) query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`);
    if (filters.department_id) query = query.eq('department_id', filters.department_id);
    if (filters.category) query = query.eq('category', filters.category);
    if (filters.is_active !== undefined) query = query.eq('is_active', filters.is_active);
    if (filters.limit) query = query.limit(filters.limit);

    const { data, count, error } = await query;
    if (error) throw error;
    return { success: true, data: (data || []) as any, total: count || 0 };
  } catch (err: any) {
    console.error('getSubjects error:', err);
    return { success: false, data: [], total: 0, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: getSubjectById
// ─────────────────────────────────────────────────────────────

export async function getSubjectById(
  tenantSlug: string,
  subjectId: string
): Promise<{ success: boolean; data?: SubjectRecord; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) return { success: false, error: 'Tenant not found.' };

    const pool = getPgPool();
    if (pool) {
      const res = await pool.query(
        `SELECT s.*, d.name AS department_name, s.subject_type_col AS subject_type,
            COALESCE(
              json_agg(
                json_build_object('stream_id', cs.id, 'stream_name', cs.name, 'stream_code', cs.code, 'is_core', ss2.is_core)
              ) FILTER (WHERE cs.id IS NOT NULL), '[]'
            ) AS streams
          FROM subjects s
          LEFT JOIN departments d ON d.id = s.department_id
          LEFT JOIN subject_streams ss2 ON ss2.subject_id = s.id
          LEFT JOIN curriculum_streams cs ON cs.id = ss2.stream_id
          WHERE s.id = $1 AND s.tenant_id = $2
          GROUP BY s.id, d.name`,
        [subjectId, tenantId]
      );
      if (res.rows.length === 0) return { success: false, error: 'Subject not found.' };
      return { success: true, data: res.rows[0] };
    }

    const { data, error } = await createAdminClient()
      .from('subjects')
      .select('*, departments(name), subject_streams(stream_id, is_core, curriculum_streams(id, name, code))')
      .eq('id', subjectId)
      .eq('tenant_id', tenantId)
      .single();
    if (error) throw error;
    return { success: true, data: data as any };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: createSubject
// ─────────────────────────────────────────────────────────────

export async function createSubject(
  tenantSlug: string,
  payload: SubjectPayload
): Promise<{ success: boolean; subject?: SubjectRecord; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) return { success: false, error: 'Tenant not found.' };

    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database connection unavailable.' };

    // Generate code if not provided
    const baseCode = (payload.code?.trim().toUpperCase()) || generateCode(payload.name);
    const code = await ensureUniqueCode(pool, tenantId, baseCode);

    const res = await pool.query(
      `INSERT INTO subjects (
          tenant_id, name, short_name, code, national_code, description,
          category, subject_type_col, department_id, is_elective, is_active
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true)
        RETURNING *`,
      [
        tenantId,
        payload.name.trim(),
        payload.short_name?.trim() || null,
        code,
        payload.national_code?.trim() || null,
        payload.description?.trim() || null,
        payload.category || 'general',
        payload.subject_type || 'academic',
        payload.department_id || null,
        payload.is_elective ?? false,
      ]
    );

    const subject = res.rows[0];

    // Assign streams
    if (payload.stream_ids && payload.stream_ids.length > 0) {
      for (const streamId of payload.stream_ids) {
        await pool.query(
          `INSERT INTO subject_streams (subject_id, stream_id)
           VALUES ($1, $2) ON CONFLICT (subject_id, stream_id) DO NOTHING`,
          [subject.id, streamId]
        );
      }
    }

    // Audit log
    await pool.query(
      `INSERT INTO academic_audit_logs (tenant_id, action, entity, entity_id, new_values)
       VALUES ($1, 'subject.created', 'subject', $2, $3)`,
      [tenantId, subject.id, JSON.stringify({ name: subject.name, code: subject.code })]
    );

    revalidatePath(`/${tenantSlug}/admin/academics/subjects`);
    revalidatePath(`/${tenantSlug}/admin/academics`);

    return { success: true, subject };
  } catch (err: any) {
    console.error('createSubject error:', err);
    if (err.code === '23505') {
      return { success: false, error: `A subject with code "${payload.code || ''}" already exists in this school.` };
    }
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: updateSubject
// ─────────────────────────────────────────────────────────────

export async function updateSubject(
  tenantSlug: string,
  subjectId: string,
  payload: Partial<SubjectPayload>
): Promise<{ success: boolean; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) return { success: false, error: 'Tenant not found.' };

    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database connection unavailable.' };

    const sets: string[] = ['updated_at = NOW()'];
    const params: unknown[] = [];
    let pIdx = 1;

    if (payload.name !== undefined)        { sets.push(`name = $${pIdx++}`);            params.push(payload.name.trim()); }
    if (payload.short_name !== undefined)   { sets.push(`short_name = $${pIdx++}`);      params.push(payload.short_name?.trim() || null); }
    if (payload.code !== undefined)         { sets.push(`code = $${pIdx++}`);            params.push(payload.code.trim().toUpperCase()); }
    if (payload.national_code !== undefined){ sets.push(`national_code = $${pIdx++}`);   params.push(payload.national_code?.trim() || null); }
    if (payload.description !== undefined)  { sets.push(`description = $${pIdx++}`);     params.push(payload.description?.trim() || null); }
    if (payload.category !== undefined)     { sets.push(`category = $${pIdx++}`);        params.push(payload.category); }
    if (payload.subject_type !== undefined) { sets.push(`subject_type_col = $${pIdx++}`);params.push(payload.subject_type); }
    if (payload.department_id !== undefined){ sets.push(`department_id = $${pIdx++}`);   params.push(payload.department_id || null); }
    if (payload.is_elective !== undefined)  { sets.push(`is_elective = $${pIdx++}`);     params.push(payload.is_elective); }

    params.push(subjectId, tenantId);
    await pool.query(
      `UPDATE subjects SET ${sets.join(', ')} WHERE id = $${pIdx} AND tenant_id = $${pIdx + 1}`,
      params
    );

    // Update stream memberships if provided
    if (payload.stream_ids !== undefined) {
      await pool.query('DELETE FROM subject_streams WHERE subject_id = $1', [subjectId]);
      for (const streamId of payload.stream_ids) {
        await pool.query(
          `INSERT INTO subject_streams (subject_id, stream_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [subjectId, streamId]
        );
      }
    }

    await pool.query(
      `INSERT INTO academic_audit_logs (tenant_id, action, entity, entity_id, new_values)
       VALUES ($1, 'subject.updated', 'subject', $2, $3)`,
      [tenantId, subjectId, JSON.stringify(payload)]
    );

    revalidatePath(`/${tenantSlug}/admin/academics/subjects`);
    return { success: true };
  } catch (err: any) {
    if (err.code === '23505') return { success: false, error: 'A subject with that code already exists.' };
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: archiveSubject (soft delete)
// ─────────────────────────────────────────────────────────────

export async function archiveSubject(
  tenantSlug: string,
  subjectId: string
): Promise<{ success: boolean; blocked?: boolean; reason?: string; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) return { success: false, error: 'Tenant not found.' };

    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database connection unavailable.' };

    // Check for active enrollments or offerings
    const checkRes = await pool.query(
      `SELECT
          (SELECT COUNT(*) FROM student_subject_enrollments sse
            JOIN subject_offerings so ON so.id = sse.offering_id
            WHERE so.subject_id = $1 AND sse.status = 'active') AS active_enrollments,
          (SELECT COUNT(*) FROM subject_offerings WHERE subject_id = $1 AND status = 'active') AS active_offerings,
          (SELECT COUNT(*) FROM grades WHERE subject_id = $1) AS grade_records`,
      [subjectId]
    );

    const { active_enrollments, active_offerings, grade_records } = checkRes.rows[0];

    if (parseInt(active_enrollments) > 0 || parseInt(active_offerings) > 0) {
      return {
        success: false,
        blocked: true,
        reason: `This subject has ${active_offerings} active offering(s) and ${active_enrollments} enrolled student(s). Remove all active offerings before archiving.`,
      };
    }

    await pool.query(
      `UPDATE subjects SET is_active = false, archived_at = NOW() WHERE id = $1 AND tenant_id = $2`,
      [subjectId, tenantId]
    );

    await pool.query(
      `INSERT INTO academic_audit_logs (tenant_id, action, entity, entity_id, new_values)
       VALUES ($1, 'subject.archived', 'subject', $2, $3)`,
      [tenantId, subjectId, JSON.stringify({ grade_records, archived_at: new Date().toISOString() })]
    );

    revalidatePath(`/${tenantSlug}/admin/academics/subjects`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: restoreSubject
// ─────────────────────────────────────────────────────────────

export async function restoreSubject(
  tenantSlug: string,
  subjectId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) return { success: false, error: 'Tenant not found.' };

    const pool = getPgPool();
    if (!pool) return { success: false, error: 'Database connection unavailable.' };

    await pool.query(
      `UPDATE subjects SET is_active = true, archived_at = NULL, archived_by = NULL
       WHERE id = $1 AND tenant_id = $2`,
      [subjectId, tenantId]
    );

    await pool.query(
      `INSERT INTO academic_audit_logs (tenant_id, action, entity, entity_id)
       VALUES ($1, 'subject.restored', 'subject', $2)`,
      [tenantId, subjectId]
    );

    revalidatePath(`/${tenantSlug}/admin/academics/subjects`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: bulkCreateSubjects
// ─────────────────────────────────────────────────────────────

export async function bulkCreateSubjects(
  tenantSlug: string,
  rows: SubjectPayload[]
): Promise<{ success: boolean; created: number; errors: { row: number; error: string }[] }> {
  const errors: { row: number; error: string }[] = [];
  let created = 0;

  const tenantId = await resolveTenantId(tenantSlug);
  if (!tenantId) return { success: false, created: 0, errors: [{ row: 0, error: 'Tenant not found.' }] };

  const pool = getPgPool();
  if (!pool) return { success: false, created: 0, errors: [{ row: 0, error: 'Database unavailable.' }] };

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (let i = 0; i < rows.length; i++) {
      const payload = rows[i];
      try {
        const baseCode = (payload.code?.trim().toUpperCase()) || generateCode(payload.name);
        const code = await ensureUniqueCode(pool, tenantId, baseCode);

        const res = await client.query(
          `INSERT INTO subjects (
              tenant_id, name, short_name, code, national_code, description,
              category, subject_type_col, department_id, is_elective, is_active
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true)
            ON CONFLICT (tenant_id, code) DO UPDATE SET updated_at = NOW()
            RETURNING id`,
          [
            tenantId,
            payload.name.trim(),
            payload.short_name?.trim() || null,
            code,
            payload.national_code?.trim() || null,
            payload.description?.trim() || null,
            payload.category || 'general',
            payload.subject_type || 'academic',
            payload.department_id || null,
            payload.is_elective ?? false,
          ]
        );

        const subjectId = res.rows[0].id;

        if (payload.stream_ids?.length) {
          for (const streamId of payload.stream_ids) {
            await client.query(
              `INSERT INTO subject_streams (subject_id, stream_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
              [subjectId, streamId]
            );
          }
        }

        created++;
      } catch (rowErr: any) {
        errors.push({ row: i + 1, error: rowErr.message });
      }
    }

    if (errors.length === 0) {
      await client.query('COMMIT');
    } else if (errors.length === rows.length) {
      await client.query('ROLLBACK');
    } else {
      // Partial success — commit what worked
      await client.query('COMMIT');
    }

    revalidatePath(`/${tenantSlug}/admin/academics/subjects`);
    return { success: errors.length < rows.length, created, errors };
  } catch (err: any) {
    await client.query('ROLLBACK');
    return { success: false, created: 0, errors: [{ row: 0, error: err.message }] };
  } finally {
    client.release();
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: getCurriculumStreams
// ─────────────────────────────────────────────────────────────

export async function getCurriculumStreams(
  tenantSlug: string
): Promise<{ success: boolean; data: CurriculumStreamRecord[]; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) return { success: false, data: [], error: 'Tenant not found.' };

    const pool = getPgPool();
    if (pool) {
      const res = await pool.query(
        `SELECT * FROM curriculum_streams
         WHERE tenant_id = $1 AND is_active = true
         ORDER BY sort_order ASC`,
        [tenantId]
      );
      return { success: true, data: res.rows };
    }

    const { data, error } = await createAdminClient()
      .from('curriculum_streams')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('sort_order');
    if (error) throw error;
    return { success: true, data: (data || []) as any };
  } catch (err: any) {
    return { success: false, data: [], error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// ACTION: getDepartments (convenience for subject forms)
// ─────────────────────────────────────────────────────────────

export async function getDepartments(
  tenantSlug: string
): Promise<{ success: boolean; data: { id: string; name: string }[]; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) return { success: false, data: [], error: 'Tenant not found.' };

    const pool = getPgPool();
    if (pool) {
      const res = await pool.query(
        'SELECT id, name FROM departments WHERE tenant_id = $1 ORDER BY name ASC',
        [tenantId]
      );
      return { success: true, data: res.rows };
    }

    const { data, error } = await createAdminClient()
      .from('departments')
      .select('id, name')
      .eq('tenant_id', tenantId)
      .order('name');
    if (error) throw error;
    return { success: true, data: (data || []) as any };
  } catch (err: any) {
    return { success: false, data: [], error: err.message };
  }
}
