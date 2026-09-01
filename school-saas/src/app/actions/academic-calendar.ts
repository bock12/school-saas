'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getPgPool } from '@/lib/db/pg-fallback';
import { revalidatePath } from 'next/cache';
import { getAcademicSessions } from './academic-sessions';

const supabaseAdmin = createAdminClient();

export interface AcademicCalendarEvent {
  id: string;
  tenant_id: string;
  academic_year_id?: string | null;
  academic_year_name?: string;
  term_id?: string | null;
  term_name?: string;
  title: string;
  description?: string;
  category: 'Academic' | 'Holiday' | 'Examinations' | 'Meeting' | 'Sports' | 'Administrative';
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  is_all_day: boolean;
  location?: string;
  audience: 'all' | 'students' | 'teachers' | 'parents' | 'staff';
  is_published: boolean;
  color?: string;
  created_at?: string;
}

export interface CalendarEventPayload {
  id?: string;
  academicYearId?: string;
  termId?: string;
  title: string;
  description?: string;
  category: 'Academic' | 'Holiday' | 'Holidays' | 'Examinations' | 'Meeting' | 'Sports' | 'Co-Curricular' | 'Administrative';
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  isAllDay?: boolean;
  location?: string;
  audience?: 'all' | 'students' | 'teachers' | 'parents' | 'staff';
  isPublished?: boolean;
  color?: string;
}

function formatDateStr(d: any): string {
  if (!d) return '';
  if (typeof d === 'string') return d.split('T')[0];
  if (d instanceof Date) return d.toISOString().split('T')[0];
  return String(d);
}

function formatIsoStr(d: any): string {
  if (!d) return '';
  if (d instanceof Date) return d.toISOString();
  return String(d);
}

async function resolveTenantId(slugOrId?: string | null): Promise<string | null> {
  const supabase = createAdminClient();

  if (!slugOrId || slugOrId === 'undefined' || slugOrId === 'null') {
    const { data: firstTenant } = await supabase
      .from('tenants')
      .select('id')
      .limit(1)
      .maybeSingle();
    return firstTenant?.id || null;
  }

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
  if (isUuid) return slugOrId;

  // 1. Exact slug match
  const { data: bySlug } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', slugOrId.toLowerCase().trim())
    .maybeSingle();

  if (bySlug) return bySlug.id;

  // 2. Partial / ILIKE slug match
  const { data: byIlikeSlug } = await supabase
    .from('tenants')
    .select('id')
    .ilike('slug', `%${slugOrId.trim()}%`)
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

  if (byName) return byName.id;

  // 4. Try PG Pool directly
  const pool = getPgPool();
  if (pool) {
    try {
      const pgRes = await pool.query(
        `SELECT id FROM tenants 
         WHERE slug = $1 OR slug ILIKE $2 OR name ILIKE $3 
         LIMIT 1`,
        [slugOrId.toLowerCase().trim(), `%${slugOrId.trim()}%`, `%${slugOrId.replace(/-/g, ' ').trim()}%`]
      );
      if (pgRes.rows.length > 0) return pgRes.rows[0].id;
      const anyTenant = await pool.query('SELECT id FROM tenants LIMIT 1');
      if (anyTenant.rows.length > 0) return anyTenant.rows[0].id;
    } catch {
      // ignore
    }
  }

  // 5. Fallback to first available tenant
  const { data: fallbackTenant } = await supabase
    .from('tenants')
    .select('id')
    .limit(1)
    .maybeSingle();

  return fallbackTenant?.id || null;
}

function cleanUuid(id?: string | null): string | null {
  if (!id || typeof id !== 'string') return null;
  const trimmed = id.trim();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed);
  return isUuid ? trimmed : null;
}

/**
 * Fetch calendar events with optional filtering.
 */
export async function getAcademicCalendarEvents(
  tenantSlug: string,
  filters?: {
    academicYearId?: string;
    category?: string;
    month?: number;
    year?: number;
  }
): Promise<{ success: boolean; data: AcademicCalendarEvent[]; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) {
      return { success: false, data: [], error: 'Tenant not found.' };
    }

    const sessRes = await getAcademicSessions(tenantSlug);
    const activeSession = sessRes.data?.find((s) => s.is_current) || sessRes.data?.[0];

    const pool = getPgPool();
    if (pool) {
      let queryStr = `
        SELECT e.*, ay.name as academic_year_name, t.name as term_name
        FROM academic_calendar_events e
        LEFT JOIN academic_years ay ON e.academic_year_id = ay.id
        LEFT JOIN terms t ON e.term_id = t.id
        WHERE e.tenant_id = $1
      `;
      const params: any[] = [tenantId];
      let pIdx = 2;

      const cleanedYearId = cleanUuid(filters?.academicYearId);
      if (cleanedYearId) {
        queryStr += ` AND e.academic_year_id = $${pIdx++}`;
        params.push(cleanedYearId);
      }
      if (filters?.category && filters.category !== 'all') {
        queryStr += ` AND e.category = $${pIdx++}`;
        params.push(filters.category);
      }

      queryStr += ' ORDER BY e.start_date ASC';

      try {
        const pgRes = await pool.query(queryStr, params);
        if (pgRes.rows.length > 0) {
          const formatted: AcademicCalendarEvent[] = pgRes.rows.map((e: any) => ({
            id: e.id,
            tenant_id: e.tenant_id,
            academic_year_id: e.academic_year_id,
            academic_year_name: e.academic_year_name || 'All Sessions',
            term_id: e.term_id,
            term_name: e.term_name,
            title: e.title,
            description: e.description,
            category: e.category,
            start_date: formatDateStr(e.start_date),
            end_date: formatDateStr(e.end_date),
            start_time: e.start_time,
            end_time: e.end_time,
            is_all_day: !!e.is_all_day,
            location: e.location,
            audience: e.audience,
            is_published: !!e.is_published,
            color: e.color,
            created_at: formatIsoStr(e.created_at),
          }));
          return { success: true, data: formatted };
        }
      } catch (qErr) {
        console.warn('Direct PG query on academic_calendar_events returned:', qErr);
      }
    }

    let query = supabaseAdmin
      .from('academic_calendar_events')
      .select('*, academic_years(name), terms(name)')
      .eq('tenant_id', tenantId);

    const cleanedYearId = cleanUuid(filters?.academicYearId);
    if (cleanedYearId) {
      query = query.eq('academic_year_id', cleanedYearId);
    }
    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    const { data: events, error } = await query.order('start_date', { ascending: true });

    if (!events || events.length === 0) {
      // Seed default institutional events for active year
      const yearName = activeSession?.name || '2026/2027';
      const startYear = parseInt(yearName.split('/')[0]) || 2026;
      const endYear = parseInt(yearName.split('/')[1]) || startYear + 1;

      const defaultEvents = [
        {
          tenant_id: tenantId,
          academic_year_id: activeSession?.id || null,
          title: 'First Term Resumption & Staff Briefing',
          description: 'Official academic resumption for all primary and secondary grade cohorts. General staff alignment meeting.',
          category: 'Academic',
          start_date: `${startYear}-09-01`,
          end_date: `${startYear}-09-01`,
          is_all_day: true,
          location: 'Main School Auditorium',
          audience: 'all',
          is_published: true,
          color: 'blue',
        },
        {
          tenant_id: tenantId,
          academic_year_id: activeSession?.id || null,
          title: 'Mid-Term Break & Teacher Continuous Training',
          description: 'Students recess period. Professional teacher development and continuous assessment score audit.',
          category: 'Holiday',
          start_date: `${startYear}-10-15`,
          end_date: `${startYear}-10-18`,
          is_all_day: true,
          location: 'Campus Wide',
          audience: 'all',
          is_published: true,
          color: 'rose',
        },
        {
          tenant_id: tenantId,
          academic_year_id: activeSession?.id || null,
          title: 'Parent-Teacher Association (PTA) General Assembly',
          description: 'Term 1 progress report review, student welfare updates, and infrastructure expansion discussions.',
          category: 'Meeting',
          start_date: `${startYear}-11-20`,
          end_date: `${startYear}-11-20`,
          start_time: '14:00',
          end_time: '17:30',
          is_all_day: false,
          location: 'Assembly Hall / Online Stream',
          audience: 'parents',
          is_published: true,
          color: 'purple',
        },
        {
          tenant_id: tenantId,
          academic_year_id: activeSession?.id || null,
          title: 'First Term Terminal Examinations',
          description: 'Comprehensive examinations for JSS and SSS streams across all core subjects and electives.',
          category: 'Examinations',
          start_date: `${startYear}-12-07`,
          end_date: `${startYear}-12-18`,
          is_all_day: true,
          location: 'Examination Halls',
          audience: 'students',
          is_published: true,
          color: 'amber',
        },
        {
          tenant_id: tenantId,
          academic_year_id: activeSession?.id || null,
          title: 'Second Term Resumption',
          description: 'Opening of the second academic term. Distribution of first term broadsheets and report cards.',
          category: 'Academic',
          start_date: `${endYear}-01-05`,
          end_date: `${endYear}-01-05`,
          is_all_day: true,
          location: 'Campus Wide',
          audience: 'all',
          is_published: true,
          color: 'blue',
        },
      ];

      if (pool) {
        for (const e of defaultEvents) {
          await pool.query(
            `INSERT INTO academic_calendar_events 
             (tenant_id, academic_year_id, title, description, category, start_date, end_date, start_time, end_time, is_all_day, location, audience, is_published, color)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
            [e.tenant_id, e.academic_year_id, e.title, e.description, e.category, e.start_date, e.end_date, (e as any).start_time || null, (e as any).end_time || null, e.is_all_day, e.location, e.audience, e.is_published, e.color]
          );
        }
        return getAcademicCalendarEvents(tenantSlug, filters);
      }
    }

    const formatted: AcademicCalendarEvent[] = (events || []).map((e: any) => ({
      id: e.id,
      tenant_id: e.tenant_id,
      academic_year_id: e.academic_year_id,
      academic_year_name: e.academic_years?.name || 'All Sessions',
      term_id: e.term_id,
      term_name: e.terms?.name,
      title: e.title,
      description: e.description,
      category: e.category,
      start_date: formatDateStr(e.start_date),
      end_date: formatDateStr(e.end_date),
      start_time: e.start_time,
      end_time: e.end_time,
      is_all_day: !!e.is_all_day,
      location: e.location,
      audience: e.audience,
      is_published: !!e.is_published,
      color: e.color,
      created_at: formatIsoStr(e.created_at),
    }));

    return { success: true, data: formatted };
  } catch (err: any) {
    console.error('getAcademicCalendarEvents error:', err);
    return { success: false, data: [], error: err.message };
  }
}

/**
 * Create a new calendar event with PG fallback.
 */
export async function createCalendarEvent(
  tenantSlug: string,
  payload: CalendarEventPayload
): Promise<{ success: boolean; event?: AcademicCalendarEvent; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) {
      return { success: false, error: 'Tenant not found.' };
    }

    const pool = getPgPool();
    if (pool) {
      const res = await pool.query(
        `INSERT INTO academic_calendar_events 
         (tenant_id, academic_year_id, term_id, title, description, category, start_date, end_date, start_time, end_time, is_all_day, location, audience, is_published, color)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         RETURNING *`,
        [
          tenantId,
          cleanUuid(payload.academicYearId),
          cleanUuid(payload.termId),
          payload.title.trim(),
          payload.description || null,
          payload.category,
          payload.startDate,
          payload.endDate || payload.startDate,
          payload.startTime || null,
          payload.endTime || null,
          payload.isAllDay !== false,
          payload.location || null,
          payload.audience || 'all',
          payload.isPublished !== false,
          payload.color || 'blue',
        ]
      );

      revalidatePath(`/${tenantSlug}/admin/academics/calendar`);
      revalidatePath(`/${tenantSlug}/admin/academics`);

      return { success: true, event: res.rows[0] };
    }

    const { data: created, error } = await supabaseAdmin
      .from('academic_calendar_events')
      .insert({
        tenant_id: tenantId,
        academic_year_id: cleanUuid(payload.academicYearId),
        term_id: cleanUuid(payload.termId),
        title: payload.title.trim(),
        description: payload.description,
        category: payload.category,
        start_date: payload.startDate,
        end_date: payload.endDate || payload.startDate,
        start_time: payload.startTime || null,
        end_time: payload.endTime || null,
        is_all_day: payload.isAllDay !== false,
        location: payload.location,
        audience: payload.audience || 'all',
        is_published: payload.isPublished !== false,
        color: payload.color || 'blue',
      })
      .select('*')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/${tenantSlug}/admin/academics/calendar`);
    revalidatePath(`/${tenantSlug}/admin/academics`);

    return { success: true, event: created };
  } catch (err: any) {
    console.error('createCalendarEvent error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Update an existing calendar event with PG fallback.
 */
export async function updateCalendarEvent(
  tenantSlug: string,
  eventId: string,
  payload: CalendarEventPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) {
      return { success: false, error: 'Tenant not found.' };
    }

    const pool = getPgPool();
    if (pool) {
      await pool.query(
        `UPDATE academic_calendar_events
         SET academic_year_id = $1, term_id = $2, title = $3, description = $4, category = $5,
             start_date = $6, end_date = $7, start_time = $8, end_time = $9, is_all_day = $10,
             location = $11, audience = $12, is_published = $13, color = $14, updated_at = NOW()
         WHERE id = $15 AND tenant_id = $16`,
        [
          cleanUuid(payload.academicYearId),
          cleanUuid(payload.termId),
          payload.title.trim(),
          payload.description || null,
          payload.category,
          payload.startDate,
          payload.endDate || payload.startDate,
          payload.startTime || null,
          payload.endTime || null,
          payload.isAllDay !== false,
          payload.location || null,
          payload.audience || 'all',
          payload.isPublished !== false,
          payload.color || 'blue',
          eventId,
          tenantId,
        ]
      );

      revalidatePath(`/${tenantSlug}/admin/academics/calendar`);
      revalidatePath(`/${tenantSlug}/admin/academics`);

      return { success: true };
    }

    const { error } = await supabaseAdmin
      .from('academic_calendar_events')
      .update({
        academic_year_id: cleanUuid(payload.academicYearId),
        term_id: cleanUuid(payload.termId),
        title: payload.title.trim(),
        description: payload.description,
        category: payload.category,
        start_date: payload.startDate,
        end_date: payload.endDate || payload.startDate,
        start_time: payload.startTime || null,
        end_time: payload.endTime || null,
        is_all_day: payload.isAllDay !== false,
        location: payload.location,
        audience: payload.audience || 'all',
        is_published: payload.isPublished !== false,
        color: payload.color || 'blue',
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId)
      .eq('tenant_id', tenantId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/${tenantSlug}/admin/academics/calendar`);
    revalidatePath(`/${tenantSlug}/admin/academics`);

    return { success: true };
  } catch (err: any) {
    console.error('updateCalendarEvent error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Delete a calendar event.
 */
export async function deleteCalendarEvent(
  tenantSlug: string,
  eventId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) {
      return { success: false, error: 'Tenant not found.' };
    }

    const pool = getPgPool();
    if (pool) {
      await pool.query('DELETE FROM academic_calendar_events WHERE id = $1 AND tenant_id = $2', [eventId, tenantId]);
      revalidatePath(`/${tenantSlug}/admin/academics/calendar`);
      revalidatePath(`/${tenantSlug}/admin/academics`);
      return { success: true };
    }

    const { error } = await supabaseAdmin
      .from('academic_calendar_events')
      .delete()
      .eq('id', eventId)
      .eq('tenant_id', tenantId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/${tenantSlug}/admin/academics/calendar`);
    revalidatePath(`/${tenantSlug}/admin/academics`);

    return { success: true };
  } catch (err: any) {
    console.error('deleteCalendarEvent error:', err);
    return { success: false, error: err.message };
  }
}
