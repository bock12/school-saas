import { NextRequest, NextResponse } from 'next/server';
import { authorizeApiRequest, apiError } from '@/lib/auth/api-guard';
import { getPgPool } from '@/lib/db/pg-fallback';

export async function GET(req: NextRequest) {
  try {
    const auth = await authorizeApiRequest(req, {
      roles: ['super_admin'],
      scope: 'platform',
    });

    if (!auth.ok) {
      return auth.response;
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const dbPool = getPgPool();
    if (!dbPool) {
      return apiError('Database unavailable', 'DATABASE_UNAVAILABLE', 500);
    }

    let query = `
      SELECT dr.*, t.name as tenant_name, t.slug as tenant_slug
      FROM demo_requests dr
      LEFT JOIN tenants t ON dr.provisioned_tenant_id = t.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIdx = 1;

    if (status && status !== 'all') {
      query += ` AND dr.status = $${paramIdx++}`;
      params.push(status);
    }

    if (search && search.trim() !== '') {
      query += ` AND (
        dr.institution_name ILIKE $${paramIdx} OR
        dr.contact_name ILIKE $${paramIdx} OR
        dr.email ILIKE $${paramIdx} OR
        dr.phone ILIKE $${paramIdx} OR
        dr.region ILIKE $${paramIdx}
      )`;
      params.push(`%${search.trim()}%`);
      paramIdx++;
    }

    query += ` ORDER BY dr.created_at DESC`;

    const { rows } = await dbPool.query(query, params);

    // Also get status count statistics
    const statsRes = await dbPool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'contacted' OR status = 'scheduled') as in_progress,
        COUNT(*) FILTER (WHERE status = 'provisioned') as provisioned
      FROM demo_requests
    `);

    return NextResponse.json({
      leads: rows || [],
      stats: statsRes.rows[0] || { total: 0, pending: 0, in_progress: 0, provisioned: 0 },
    });
  } catch (err: any) {
    console.error('Super Admin Leads GET error:', err);
    return apiError(err.message || 'Failed to fetch leads', 'INTERNAL_ERROR', 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await authorizeApiRequest(req, {
      roles: ['super_admin'],
      scope: 'platform',
    });

    if (!auth.ok) {
      return auth.response;
    }

    const body = await req.json().catch(() => ({}));
    const { id, status, notes, scheduledAt, provisionedTenantId } = body;

    if (!id || typeof id !== 'string') {
      return apiError('Lead ID is required', 'INVALID_REQUEST', 400);
    }

    const dbPool = getPgPool();
    if (!dbPool) {
      return apiError('Database unavailable', 'DATABASE_UNAVAILABLE', 500);
    }

    const updates: string[] = ['updated_at = NOW()'];
    const params: any[] = [id];
    let paramIdx = 2;

    if (status !== undefined) {
      updates.push(`status = $${paramIdx++}`);
      params.push(status);
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramIdx++}`);
      params.push(notes);
    }
    if (scheduledAt !== undefined) {
      updates.push(`scheduled_at = $${paramIdx++}`);
      params.push(scheduledAt);
    }
    if (provisionedTenantId !== undefined) {
      updates.push(`provisioned_tenant_id = $${paramIdx++}`);
      params.push(provisionedTenantId);
    }

    const query = `
      UPDATE demo_requests
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *
    `;

    const { rows } = await dbPool.query(query, params);

    if (rows.length === 0) {
      return apiError('Lead not found', 'NOT_FOUND', 404);
    }

    return NextResponse.json({ success: true, lead: rows[0] });
  } catch (err: any) {
    console.error('Super Admin Leads PATCH error:', err);
    return apiError(err.message || 'Failed to update lead', 'INTERNAL_ERROR', 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await authorizeApiRequest(req, {
      roles: ['super_admin'],
      scope: 'platform',
    });

    if (!auth.ok) {
      return auth.response;
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return apiError('Lead ID is required', 'INVALID_REQUEST', 400);
    }

    const dbPool = getPgPool();
    if (!dbPool) {
      return apiError('Database unavailable', 'DATABASE_UNAVAILABLE', 500);
    }

    const res = await dbPool.query('DELETE FROM demo_requests WHERE id = $1', [id]);

    if (res.rowCount === 0) {
      return apiError('Lead not found', 'NOT_FOUND', 404);
    }

    return NextResponse.json({ success: true, message: 'Lead deleted successfully' });
  } catch (err: any) {
    console.error('Super Admin Leads DELETE error:', err);
    return apiError(err.message || 'Failed to delete lead', 'INTERNAL_ERROR', 500);
  }
}
