import { NextRequest, NextResponse } from 'next/server';
import { authorizeApiRequest, apiError } from '@/lib/auth/api-guard';

export async function GET(req: NextRequest) {
  try {
    const auth = await authorizeApiRequest(req, {
      permission: 'platform.leads.manage',
      scope: 'platform',
      requireTenant: false,
    });

    if (!auth.ok) {
      return auth.response;
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const adminClient = auth.adminClient();

    let query = adminClient
      .from('demo_requests')
      .select('*, tenants:provisioned_tenant_id (name, slug)')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      query = query.or(
        `institution_name.ilike.${term},contact_name.ilike.${term},email.ilike.${term},phone.ilike.${term},region.ilike.${term}`
      );
    }

    const { data: rows, error } = await query;
    if (error) {
      return apiError(error.message, 'DATABASE_ERROR', 500);
    }

    // Flatten joined tenant info for frontend schema compatibility
    const leads = (rows || []).map((r: any) => ({
      ...r,
      tenant_name: r.tenants?.name || null,
      tenant_slug: r.tenants?.slug || null,
    }));

    // Status count statistics
    const { data: allStats } = await adminClient
      .from('demo_requests')
      .select('status');

    const total = allStats?.length || 0;
    const pending = allStats?.filter((r: any) => r.status === 'pending').length || 0;
    const in_progress =
      allStats?.filter((r: any) => r.status === 'contacted' || r.status === 'scheduled').length || 0;
    const provisioned = allStats?.filter((r: any) => r.status === 'provisioned').length || 0;

    return NextResponse.json({
      leads,
      stats: { total, pending, in_progress, provisioned },
    });
  } catch (err: any) {
    console.error('Super Admin Leads GET error:', err);
    return apiError(err.message || 'Failed to fetch leads', 'INTERNAL_ERROR', 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await authorizeApiRequest(req, {
      permission: 'platform.leads.manage',
      scope: 'platform',
      requireTenant: false,
    });

    if (!auth.ok) {
      return auth.response;
    }

    const body = await req.json().catch(() => ({}));
    const { id, status, notes, scheduledAt, provisionedTenantId } = body;

    if (!id || typeof id !== 'string') {
      return apiError('Lead ID is required', 'INVALID_REQUEST', 400);
    }

    const adminClient = auth.adminClient();

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (status !== undefined) updates.status = status;
    if (notes !== undefined) updates.notes = notes;
    if (scheduledAt !== undefined) updates.scheduled_at = scheduledAt;
    if (provisionedTenantId !== undefined) updates.provisioned_tenant_id = provisionedTenantId;

    const { data: updated, error } = await adminClient
      .from('demo_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      return apiError(error.message, 'DATABASE_ERROR', 500);
    }

    if (!updated) {
      return apiError('Lead not found', 'NOT_FOUND', 404);
    }

    return NextResponse.json({ success: true, lead: updated });
  } catch (err: any) {
    console.error('Super Admin Leads PATCH error:', err);
    return apiError(err.message || 'Failed to update lead', 'INTERNAL_ERROR', 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await authorizeApiRequest(req, {
      permission: 'platform.leads.manage',
      scope: 'platform',
      requireTenant: false,
    });

    if (!auth.ok) {
      return auth.response;
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || typeof id !== 'string') {
      return apiError('Lead ID is required', 'INVALID_REQUEST', 400);
    }

    const adminClient = auth.adminClient();

    const { data: existing, error: findErr } = await adminClient
      .from('demo_requests')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (findErr) {
      return apiError(findErr.message, 'DATABASE_ERROR', 500);
    }

    if (!existing) {
      return apiError('Lead not found', 'NOT_FOUND', 404);
    }

    const { error: delErr } = await adminClient
      .from('demo_requests')
      .delete()
      .eq('id', id);

    if (delErr) {
      return apiError(delErr.message, 'DATABASE_ERROR', 500);
    }

    return NextResponse.json({ success: true, message: 'Lead deleted successfully' });
  } catch (err: any) {
    console.error('Super Admin Leads DELETE error:', err);
    return apiError(err.message || 'Failed to delete lead', 'INTERNAL_ERROR', 500);
  }
}
