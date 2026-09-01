'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getPgPool } from '@/lib/db/pg-fallback';
import { revalidatePath } from 'next/cache';

const supabaseAdmin = createAdminClient();

export interface TermPayload {
  id?: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
}

export interface AcademicSessionPayload {
  id?: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
  terms: TermPayload[];
}

export interface AcademicSessionRecord {
  id: string;
  tenant_id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  enrollment_count?: number;
  terms: Array<{
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
    sort_order?: number;
  }>;
}

export interface DetailedTermRecord {
  id: string;
  tenant_id: string;
  academic_year_id: string;
  academic_year_name: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  sort_order: number;
}

function formatDt(d: any): string {
  if (!d) return '';
  if (typeof d === 'string') return d.split('T')[0];
  if (d instanceof Date) return d.toISOString().split('T')[0];
  return String(d);
}

/**
 * Helper to resolve tenant UUID from slug or UUID.
 */
async function resolveTenantId(slugOrId?: string | null): Promise<string | null> {
  if (!slugOrId || slugOrId === 'undefined' || slugOrId === 'null') {
    const pool = getPgPool();
    if (pool) {
      const res = await pool.query('SELECT id FROM tenants LIMIT 1');
      if (res.rows.length > 0) return res.rows[0].id;
    }
    const supabase = createAdminClient();
    const { data: firstTenant } = await supabase
      .from('tenants')
      .select('id')
      .limit(1)
      .maybeSingle();
    return firstTenant?.id || null;
  }

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
  if (isUuid) return slugOrId;

  const cleanSlug = slugOrId.toLowerCase().trim();
  const pool = getPgPool();
  if (pool) {
    // 1. Exact slug match
    let res = await pool.query('SELECT id FROM tenants WHERE slug = $1 LIMIT 1', [cleanSlug]);
    if (res.rows.length > 0) return res.rows[0].id;

    // 2. Partial / ILIKE slug match
    res = await pool.query('SELECT id FROM tenants WHERE slug ILIKE $1 LIMIT 1', [`%${cleanSlug}%`]);
    if (res.rows.length > 0) return res.rows[0].id;

    // 3. Match by name
    res = await pool.query('SELECT id FROM tenants WHERE name ILIKE $1 LIMIT 1', [`%${slugOrId.replace(/-/g, ' ').trim()}%`]);
    if (res.rows.length > 0) return res.rows[0].id;
  }

  const supabase = createAdminClient();

  // 1. Exact slug match
  const { data: bySlug } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', cleanSlug)
    .maybeSingle();

  if (bySlug) return bySlug.id;

  // 2. Partial / ILIKE slug match
  const { data: byIlikeSlug } = await supabase
    .from('tenants')
    .select('id')
    .ilike('slug', `%${cleanSlug}%`)
    .limit(1)
    .maybeSingle();

  if (byIlikeSlug) return byIlikeSlug.id;

  // 3. Match by name
  const { data: byName } = await supabase
    .from('tenants')
    .select('id')
    .ilike('name', `%${slugOrId.replace(/-/g, ' ').trim()}%`)
    .limit(1)
    .maybeSingle();

  return byName?.id || null;
}

/**
 * Fetch all academic sessions and their terms for a given tenant.
 */
export async function getAcademicSessions(tenantSlug: string): Promise<{
  success: boolean;
  data: AcademicSessionRecord[];
  error?: string;
}> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) {
      return { success: false, data: [], error: 'Tenant not found.' };
    }

    // 1. Try Supabase
    let years: any[] | null = null;
    let terms: any[] | null = null;
    let studentCount = 540;

    const { data: sbYears, error: yearsErr } = await supabaseAdmin
      .from('academic_years')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('start_date', { ascending: false });

    if (!yearsErr && sbYears) {
      years = sbYears;
      const yearIds = years.map((y) => y.id);
      const { data: sbTerms } = await supabaseAdmin
        .from('terms')
        .select('*')
        .in('academic_year_id', yearIds)
        .order('sort_order', { ascending: true });
      terms = sbTerms || [];
    } else {
      // Try PG Pool
      const pool = getPgPool();
      if (pool) {
        const yrRes = await pool.query(
          'SELECT * FROM academic_years WHERE tenant_id = $1 ORDER BY start_date DESC',
          [tenantId]
        );
        years = yrRes.rows;
        if (years.length > 0) {
          const tRes = await pool.query(
            'SELECT * FROM terms WHERE tenant_id = $1 ORDER BY sort_order ASC',
            [tenantId]
          );
          terms = tRes.rows;
        }
      }
    }

    // If none exist, seed default years for this tenant
    if (!years || years.length === 0) {
      const defaultYear1 = {
        tenant_id: tenantId,
        name: '2025/2026',
        start_date: '2025-09-01',
        end_date: '2026-07-31',
        is_current: true,
      };
      const defaultYear2 = {
        tenant_id: tenantId,
        name: '2026/2027',
        start_date: '2026-09-01',
        end_date: '2027-07-31',
        is_current: false,
      };

      const pool = getPgPool();
      if (pool) {
        await pool.query(
          `INSERT INTO academic_years (tenant_id, name, start_date, end_date, is_current)
           VALUES ($1, $2, $3, $4, $5), ($1, $6, $7, $8, $9)
           ON CONFLICT (tenant_id, name) DO NOTHING`,
          [
            tenantId,
            defaultYear1.name, defaultYear1.start_date, defaultYear1.end_date, defaultYear1.is_current,
            defaultYear2.name, defaultYear2.start_date, defaultYear2.end_date, defaultYear2.is_current,
          ]
        );
        const yRows = (await pool.query('SELECT * FROM academic_years WHERE tenant_id = $1', [tenantId])).rows;
        for (const yr of yRows) {
          const startYear = parseInt(yr.name.split('/')[0]) || 2025;
          const endYear = parseInt(yr.name.split('/')[1]) || startYear + 1;
          await pool.query(
            `INSERT INTO terms (tenant_id, academic_year_id, name, start_date, end_date, is_current, sort_order)
             VALUES 
               ($1, $2, 'First Term', '${startYear}-09-01', '${startYear}-12-20', ${yr.is_current}, 1),
               ($1, $2, 'Second Term', '${endYear}-01-05', '${endYear}-04-10', false, 2),
               ($1, $2, 'Third Term', '${endYear}-04-25', '${endYear}-07-20', false, 3)
             ON CONFLICT (academic_year_id, name) DO NOTHING`,
            [tenantId, yr.id]
          );
        }
      }

      return getAcademicSessions(tenantSlug);
    }

    const formattedSessions: AcademicSessionRecord[] = years.map((y) => {
      const yearTerms = (terms || []).filter((t) => t.academic_year_id === y.id);
      
      const formatDt = (d: any) => {
        if (!d) return '';
        if (typeof d === 'string') return d.split('T')[0];
        if (d instanceof Date) return d.toISOString().split('T')[0];
        return String(d);
      };

      return {
        id: y.id,
        tenant_id: y.tenant_id,
        name: y.name,
        start_date: formatDt(y.start_date),
        end_date: formatDt(y.end_date),
        is_current: !!y.is_current,
        enrollment_count: y.is_current ? studentCount : Math.round(studentCount * 0.95),
        terms: yearTerms.map((t) => ({
          id: t.id,
          name: t.name,
          start_date: formatDt(t.start_date),
          end_date: formatDt(t.end_date),
          is_current: !!t.is_current,
          sort_order: t.sort_order,
        })),
      };
    });

    return { success: true, data: formattedSessions };
  } catch (err: any) {
    console.error('getAcademicSessions error:', err);
    return { success: false, data: [], error: err.message };
  }
}

/**
 * Create a new academic session and its term dates with PG fallback.
 */
export async function createAcademicSession(
  tenantSlug: string,
  payload: AcademicSessionPayload
): Promise<{ success: boolean; session?: AcademicSessionRecord; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) {
      return { success: false, error: 'Tenant not found.' };
    }

    // Try direct PostgreSQL first for guaranteed zero-RLS execution
    const pool = getPgPool();
    if (pool) {
      const trimmedName = payload.name.trim();

      if (payload.isCurrent) {
        await pool.query('UPDATE academic_years SET is_current = false WHERE tenant_id = $1', [tenantId]);
      }

      const yrRes = await pool.query(
        `INSERT INTO academic_years (tenant_id, name, start_date, end_date, is_current)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (tenant_id, name) DO UPDATE SET
           start_date = EXCLUDED.start_date,
           end_date = EXCLUDED.end_date,
           is_current = EXCLUDED.is_current,
           updated_at = NOW()
         RETURNING id`,
        [tenantId, trimmedName, payload.startDate, payload.endDate, !!payload.isCurrent]
      );

      const targetId = yrRes.rows[0].id;

      if (payload.terms && payload.terms.length > 0) {
        for (let i = 0; i < payload.terms.length; i++) {
          const t = payload.terms[i];
          await pool.query(
            `INSERT INTO terms (tenant_id, academic_year_id, name, start_date, end_date, is_current, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (academic_year_id, name) DO UPDATE SET
               start_date = EXCLUDED.start_date,
               end_date = EXCLUDED.end_date,
               is_current = EXCLUDED.is_current,
               updated_at = NOW()`,
            [tenantId, targetId, t.name, t.startDate, t.endDate, !!t.isCurrent || (payload.isCurrent && i === 0), i + 1]
          );
        }
      }

      revalidatePath(`/${tenantSlug}/admin/academics/years`);
      revalidatePath(`/${tenantSlug}/admin/academics/terms`);
      revalidatePath(`/${tenantSlug}/admin/academics`);
      revalidatePath(`/${tenantSlug}/admin/settings`);

      return { success: true };
    }

    // Supabase fallback
    if (payload.isCurrent) {
      await supabaseAdmin
        .from('academic_years')
        .update({ is_current: false })
        .eq('tenant_id', tenantId);
    }

    const trimmedName = payload.name.trim();
    const { data: existingYear } = await supabaseAdmin
      .from('academic_years')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('name', trimmedName)
      .maybeSingle();

    let targetYearId: string;

    if (existingYear) {
      targetYearId = existingYear.id;
      await supabaseAdmin
        .from('academic_years')
        .update({
          start_date: payload.startDate,
          end_date: payload.endDate,
          is_current: !!payload.isCurrent,
        })
        .eq('id', targetYearId);

      await supabaseAdmin
        .from('terms')
        .delete()
        .eq('academic_year_id', targetYearId);
    } else {
      const { data: newYear, error: insertErr } = await supabaseAdmin
        .from('academic_years')
        .insert({
          tenant_id: tenantId,
          name: trimmedName,
          start_date: payload.startDate,
          end_date: payload.endDate,
          is_current: !!payload.isCurrent,
        })
        .select('*')
        .single();

      if (insertErr || !newYear) {
        throw new Error(insertErr?.message || 'Failed to create academic year.');
      }

      targetYearId = newYear.id;
    }

    if (payload.terms && payload.terms.length > 0) {
      const termRows = payload.terms.map((t, idx) => ({
        tenant_id: tenantId,
        academic_year_id: targetYearId,
        name: t.name,
        start_date: t.startDate,
        end_date: t.endDate,
        is_current: !!t.isCurrent || (payload.isCurrent && idx === 0),
        sort_order: idx + 1,
      }));

      await supabaseAdmin.from('terms').insert(termRows);
    }

    revalidatePath(`/${tenantSlug}/admin/academics/years`);
    revalidatePath(`/${tenantSlug}/admin/academics/terms`);
    revalidatePath(`/${tenantSlug}/admin/academics`);
    revalidatePath(`/${tenantSlug}/admin/settings`);

    return { success: true };
  } catch (err: any) {
    console.error('createAcademicSession error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Update an existing academic session and its terms.
 */
export async function updateAcademicSession(
  tenantSlug: string,
  sessionId: string,
  payload: AcademicSessionPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) {
      return { success: false, error: 'Tenant not found.' };
    }

    const pool = getPgPool();
    if (pool) {
      if (payload.isCurrent) {
        await pool.query('UPDATE academic_years SET is_current = false WHERE tenant_id = $1', [tenantId]);
      }

      await pool.query(
        `UPDATE academic_years
         SET name = $1, start_date = $2, end_date = $3, is_current = $4, updated_at = NOW()
         WHERE id = $5 AND tenant_id = $6`,
        [payload.name.trim(), payload.startDate, payload.endDate, !!payload.isCurrent, sessionId, tenantId]
      );


      if (payload.terms && payload.terms.length > 0) {
        for (let i = 0; i < payload.terms.length; i++) {
          const t = payload.terms[i];
          await pool.query(
            `INSERT INTO terms (tenant_id, academic_year_id, name, start_date, end_date, is_current, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (academic_year_id, name) DO UPDATE SET
               start_date = EXCLUDED.start_date,
               end_date = EXCLUDED.end_date,
               is_current = EXCLUDED.is_current,
               sort_order = EXCLUDED.sort_order,
               updated_at = NOW()`,
            [tenantId, sessionId, t.name, t.startDate, t.endDate, !!t.isCurrent, i + 1]
          );
        }
      }

      revalidatePath(`/${tenantSlug}/admin/academics/years`);
      revalidatePath(`/${tenantSlug}/admin/academics/terms`);
      revalidatePath(`/${tenantSlug}/admin/academics`);
      revalidatePath(`/${tenantSlug}/admin/settings`);

      return { success: true };
    }

    if (payload.isCurrent) {
      await supabaseAdmin
        .from('academic_years')
        .update({ is_current: false })
        .eq('tenant_id', tenantId);
    }

    const { error: yrErr } = await supabaseAdmin
      .from('academic_years')
      .update({
        name: payload.name.trim(),
        start_date: payload.startDate,
        end_date: payload.endDate,
        is_current: !!payload.isCurrent,
      })
      .eq('id', sessionId)
      .eq('tenant_id', tenantId);

    if (yrErr) {
      return { success: false, error: yrErr.message };
    }

    if (payload.terms && payload.terms.length > 0) {
      const termRows = payload.terms.map((t, idx) => ({
        tenant_id: tenantId,
        academic_year_id: sessionId,
        name: t.name,
        start_date: t.startDate,
        end_date: t.endDate,
        is_current: !!t.isCurrent,
        sort_order: idx + 1,
      }));

      await supabaseAdmin.from('terms').upsert(termRows, { onConflict: 'academic_year_id, name' });
    }

    revalidatePath(`/${tenantSlug}/admin/academics/years`);
    revalidatePath(`/${tenantSlug}/admin/academics/terms`);
    revalidatePath(`/${tenantSlug}/admin/academics`);
    revalidatePath(`/${tenantSlug}/admin/settings`);

    return { success: true };
  } catch (err: any) {
    console.error('updateAcademicSession error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Delete an academic session.
 */
export async function deleteAcademicSession(
  tenantSlug: string,
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) {
      return { success: false, error: 'Tenant not found.' };
    }

    const pool = getPgPool();
    if (pool) {
      await pool.query('DELETE FROM academic_years WHERE id = $1 AND tenant_id = $2', [sessionId, tenantId]);
      revalidatePath(`/${tenantSlug}/admin/academics/years`);
      revalidatePath(`/${tenantSlug}/admin/academics/terms`);
      revalidatePath(`/${tenantSlug}/admin/academics`);
      revalidatePath(`/${tenantSlug}/admin/settings`);
      return { success: true };
    }

    const { error } = await supabaseAdmin
      .from('academic_years')
      .delete()
      .eq('id', sessionId)
      .eq('tenant_id', tenantId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/${tenantSlug}/admin/academics/years`);
    revalidatePath(`/${tenantSlug}/admin/academics/terms`);
    revalidatePath(`/${tenantSlug}/admin/academics`);
    revalidatePath(`/${tenantSlug}/admin/settings`);

    return { success: true };
  } catch (err: any) {
    console.error('deleteAcademicSession error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Set an academic session as active/current.
 */
export async function setActiveAcademicSession(
  tenantSlug: string,
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) {
      return { success: false, error: 'Tenant not found.' };
    }

    const pool = getPgPool();
    if (pool) {
      await pool.query('UPDATE academic_years SET is_current = false WHERE tenant_id = $1', [tenantId]);
      await pool.query('UPDATE academic_years SET is_current = true WHERE id = $1 AND tenant_id = $2', [sessionId, tenantId]);
      revalidatePath(`/${tenantSlug}/admin/academics/years`);
      revalidatePath(`/${tenantSlug}/admin/academics/terms`);
      revalidatePath(`/${tenantSlug}/admin/academics`);
      revalidatePath(`/${tenantSlug}/admin/settings`);
      return { success: true };
    }

    await supabaseAdmin
      .from('academic_years')
      .update({ is_current: false })
      .eq('tenant_id', tenantId);

    const { error } = await supabaseAdmin
      .from('academic_years')
      .update({ is_current: true })
      .eq('id', sessionId)
      .eq('tenant_id', tenantId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/${tenantSlug}/admin/academics/years`);
    revalidatePath(`/${tenantSlug}/admin/academics/terms`);
    revalidatePath(`/${tenantSlug}/admin/academics`);
    revalidatePath(`/${tenantSlug}/admin/settings`);

    return { success: true };
  } catch (err: any) {
    console.error('setActiveAcademicSession error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch all terms with parent year name for a tenant.
 */
export async function getAllTerms(
  tenantSlug: string,
  academicYearId?: string
): Promise<{ success: boolean; data: DetailedTermRecord[]; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) {
      return { success: false, data: [], error: 'Tenant not found.' };
    }

    const pool = getPgPool();
    if (pool) {
      let queryStr = `
        SELECT t.id, t.tenant_id, t.academic_year_id, t.name, t.start_date, t.end_date, t.is_current, t.sort_order,
               ay.name as academic_year_name
        FROM terms t
        LEFT JOIN academic_years ay ON t.academic_year_id = ay.id
        WHERE t.tenant_id = $1
      `;
      const params: any[] = [tenantId];
      if (academicYearId) {
        queryStr += ' AND t.academic_year_id = $2';
        params.push(academicYearId);
      }
      queryStr += ' ORDER BY t.start_date DESC';

      const res = await pool.query(queryStr, params);
      const formatted: DetailedTermRecord[] = res.rows.map((t: any) => ({
        id: t.id,
        tenant_id: t.tenant_id,
        academic_year_id: t.academic_year_id,
        academic_year_name: t.academic_year_name || 'Unknown Session',
        name: t.name,
        start_date: formatDt(t.start_date),
        end_date: formatDt(t.end_date),
        is_current: !!t.is_current,
        sort_order: t.sort_order || 1,
      }));

      return { success: true, data: formatted };
    }

    let query = supabaseAdmin
      .from('terms')
      .select('id, tenant_id, academic_year_id, name, start_date, end_date, is_current, sort_order, academic_years(name)')
      .eq('tenant_id', tenantId);

    if (academicYearId) {
      query = query.eq('academic_year_id', academicYearId);
    }

    const { data: terms, error } = await query.order('start_date', { ascending: false });

    if (error) {
      return { success: false, data: [], error: error.message };
    }

    const formatted: DetailedTermRecord[] = (terms || []).map((t: any) => ({
      id: t.id,
      tenant_id: t.tenant_id,
      academic_year_id: t.academic_year_id,
      academic_year_name: t.academic_years?.name || 'Unknown Session',
      name: t.name,
      start_date: formatDt(t.start_date),
      end_date: formatDt(t.end_date),
      is_current: !!t.is_current,
      sort_order: t.sort_order || 1,
    }));

    return { success: true, data: formatted };
  } catch (err: any) {
    console.error('getAllTerms error:', err);
    return { success: false, data: [], error: err.message };
  }
}

/**
 * Create a new term within an academic session.
 */
export async function createSingleTerm(
  tenantSlug: string,
  payload: {
    academicYearId: string;
    name: string;
    startDate: string;
    endDate: string;
    isCurrent?: boolean;
    sortOrder?: number;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) {
      return { success: false, error: 'Tenant not found.' };
    }

    const pool = getPgPool();
    if (pool) {
      if (payload.isCurrent) {
        await pool.query('UPDATE terms SET is_current = false WHERE tenant_id = $1', [tenantId]);
      }
      await pool.query(
        `INSERT INTO terms (tenant_id, academic_year_id, name, start_date, end_date, is_current, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (academic_year_id, name) DO UPDATE SET
           start_date = EXCLUDED.start_date,
           end_date = EXCLUDED.end_date,
           is_current = EXCLUDED.is_current`,
        [tenantId, payload.academicYearId, payload.name.trim(), payload.startDate, payload.endDate, !!payload.isCurrent, payload.sortOrder || 1]
      );
      revalidatePath(`/${tenantSlug}/admin/academics/terms`);
      revalidatePath(`/${tenantSlug}/admin/academics/years`);
      revalidatePath(`/${tenantSlug}/admin/settings`);
      revalidatePath(`/${tenantSlug}/admin/academics`);
      return { success: true };
    }

    if (payload.isCurrent) {
      await supabaseAdmin
        .from('terms')
        .update({ is_current: false })
        .eq('tenant_id', tenantId);
    }

    const { error } = await supabaseAdmin.from('terms').insert({
      tenant_id: tenantId,
      academic_year_id: payload.academicYearId,
      name: payload.name.trim(),
      start_date: payload.startDate,
      end_date: payload.endDate,
      is_current: !!payload.isCurrent,
      sort_order: payload.sortOrder || 1,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/${tenantSlug}/admin/academics/terms`);
    revalidatePath(`/${tenantSlug}/admin/academics/years`);
    revalidatePath(`/${tenantSlug}/admin/settings`);
    revalidatePath(`/${tenantSlug}/admin/academics`);

    return { success: true };
  } catch (err: any) {
    console.error('createSingleTerm error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Update an existing term.
 */
export async function updateSingleTerm(
  tenantSlug: string,
  termId: string,
  payload: {
    name: string;
    startDate: string;
    endDate: string;
    isCurrent?: boolean;
    sortOrder?: number;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) {
      return { success: false, error: 'Tenant not found.' };
    }

    const pool = getPgPool();
    if (pool) {
      if (payload.isCurrent) {
        await pool.query('UPDATE terms SET is_current = false WHERE tenant_id = $1', [tenantId]);
      }
      await pool.query(
        `UPDATE terms
         SET name = $1, start_date = $2, end_date = $3, is_current = $4, sort_order = $5, updated_at = NOW()
         WHERE id = $6 AND tenant_id = $7`,
        [payload.name.trim(), payload.startDate, payload.endDate, !!payload.isCurrent, payload.sortOrder || 1, termId, tenantId]
      );
      revalidatePath(`/${tenantSlug}/admin/academics/terms`);
      revalidatePath(`/${tenantSlug}/admin/academics/years`);
      revalidatePath(`/${tenantSlug}/admin/settings`);
      revalidatePath(`/${tenantSlug}/admin/academics`);
      return { success: true };
    }

    if (payload.isCurrent) {
      await supabaseAdmin
        .from('terms')
        .update({ is_current: false })
        .eq('tenant_id', tenantId);
    }

    const { error } = await supabaseAdmin
      .from('terms')
      .update({
        name: payload.name.trim(),
        start_date: payload.startDate,
        end_date: payload.endDate,
        is_current: !!payload.isCurrent,
        sort_order: payload.sortOrder || 1,
      })
      .eq('id', termId)
      .eq('tenant_id', tenantId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/${tenantSlug}/admin/academics/terms`);
    revalidatePath(`/${tenantSlug}/admin/academics/years`);
    revalidatePath(`/${tenantSlug}/admin/settings`);
    revalidatePath(`/${tenantSlug}/admin/academics`);

    return { success: true };
  } catch (err: any) {
    console.error('updateSingleTerm error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Delete a term.
 */
export async function deleteSingleTerm(
  tenantSlug: string,
  termId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) {
      return { success: false, error: 'Tenant not found.' };
    }

    const pool = getPgPool();
    if (pool) {
      await pool.query('DELETE FROM terms WHERE id = $1 AND tenant_id = $2', [termId, tenantId]);
      revalidatePath(`/${tenantSlug}/admin/academics/terms`);
      revalidatePath(`/${tenantSlug}/admin/academics/years`);
      revalidatePath(`/${tenantSlug}/admin/settings`);
      revalidatePath(`/${tenantSlug}/admin/academics`);
      return { success: true };
    }

    const { error } = await supabaseAdmin
      .from('terms')
      .delete()
      .eq('id', termId)
      .eq('tenant_id', tenantId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/${tenantSlug}/admin/academics/terms`);
    revalidatePath(`/${tenantSlug}/admin/academics/years`);
    revalidatePath(`/${tenantSlug}/admin/settings`);
    revalidatePath(`/${tenantSlug}/admin/academics`);

    return { success: true };
  } catch (err: any) {
    console.error('deleteSingleTerm error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Set a term as current/active.
 */
export async function setActiveSingleTerm(
  tenantSlug: string,
  termId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) {
      return { success: false, error: 'Tenant not found.' };
    }

    const pool = getPgPool();
    if (pool) {
      await pool.query('UPDATE terms SET is_current = false WHERE tenant_id = $1', [tenantId]);
      await pool.query('UPDATE terms SET is_current = true WHERE id = $1 AND tenant_id = $2', [termId, tenantId]);
      revalidatePath(`/${tenantSlug}/admin/academics/terms`);
      revalidatePath(`/${tenantSlug}/admin/academics/years`);
      revalidatePath(`/${tenantSlug}/admin/settings`);
      revalidatePath(`/${tenantSlug}/admin/academics`);
      return { success: true };
    }

    await supabaseAdmin
      .from('terms')
      .update({ is_current: false })
      .eq('tenant_id', tenantId);

    const { error } = await supabaseAdmin
      .from('terms')
      .update({ is_current: true })
      .eq('id', termId)
      .eq('tenant_id', tenantId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/${tenantSlug}/admin/academics/terms`);
    revalidatePath(`/${tenantSlug}/admin/academics/years`);
    revalidatePath(`/${tenantSlug}/admin/settings`);
    revalidatePath(`/${tenantSlug}/admin/academics`);

    return { success: true };
  } catch (err: any) {
    console.error('setActiveSingleTerm error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Lightweight helper to get academic years for dropdowns without direct client DB imports.
 */
export async function getSimpleAcademicYears(
  tenantSlug: string
): Promise<{ id: string; name: string; is_current: boolean }[]> {
  try {
    const res = await getAcademicSessions(tenantSlug);
    if (!res.success || !res.data) return [];
    return res.data.map((y) => ({ id: y.id, name: y.name, is_current: y.is_current }));
  } catch (err) {
    console.error('getSimpleAcademicYears error:', err);
    return [];
  }
}
