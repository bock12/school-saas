import { NextRequest, NextResponse } from 'next/server';
import { authorizeApiRequest, apiError } from '@/lib/auth/api-guard';

// GET: Admin API fetching synchronized examination overview data for authorized tenant
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetTenantSlug = searchParams.get('tenant') || searchParams.get('tenantSlug') || undefined;

    const auth = await authorizeApiRequest(req, {
      roles: ['school_admin', 'exam_officer', 'super_admin'],
      targetTenantSlug,
      requireTenant: true,
    });

    if (!auth.ok) {
      return auth.response;
    }

    const adminClient = auth.adminClient();
    const tenantId = auth.tenantId;

    const { data: sessions, error: sessionsError } = await adminClient
      .from('exam_sessions')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (sessionsError) throw sessionsError;

    const { data: approvals } = await adminClient
      .from('exam_results_approval')
      .select('*')
      .eq('tenant_id', tenantId);

    const { data: malpractices } = await adminClient
      .from('exam_malpractices')
      .select('*')
      .eq('tenant_id', tenantId);

    return NextResponse.json({
      success: true,
      data: {
        sessions: sessions || [],
        totalSessions: sessions?.length || 0,
        activeSessions:
          sessions?.filter(
            (s: { status?: string }) =>
              s.status === 'Ongoing' || s.status === 'Timetabled' || s.status === 'Upcoming'
          ) || [],
        approvalsCount: approvals?.length || 0,
        malpracticeCount: malpractices?.length || 0,
      },
    });
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch examination data', 'INTERNAL_ERROR', 500);
  }
}

// PATCH: Admin action to approve or update exam status for authorized tenant
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id, status, approved_by } = body;

    if (!id || typeof id !== 'string') {
      return apiError('Exam session ID is required', 'INVALID_REQUEST', 400);
    }

    const { searchParams } = new URL(req.url);
    const targetTenantSlug = searchParams.get('tenant') || searchParams.get('tenantSlug') || undefined;

    const auth = await authorizeApiRequest(req, {
      roles: ['school_admin', 'exam_officer', 'super_admin'],
      targetTenantSlug,
      requireTenant: true,
      resource: {
        table: 'exam_sessions',
        id,
        tenantColumn: 'tenant_id',
      },
    });

    if (!auth.ok) {
      return auth.response;
    }

    const adminClient = auth.adminClient();
    const tenantId = auth.tenantId;

    const { data: updated, error } = await adminClient
      .from('exam_sessions')
      .update({
        status: status || 'Approved',
        approved_by: approved_by || auth.profile.full_name || 'Admin',
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return apiError(error.message || 'Failed to update examination session', 'INTERNAL_ERROR', 500);
  }
}
