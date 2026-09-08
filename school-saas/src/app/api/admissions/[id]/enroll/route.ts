import { NextRequest, NextResponse } from 'next/server';
import { authorizeApiRequest, apiError } from '@/lib/auth/api-guard';
import { TrustedResourceTarget } from '@/lib/auth/resource-resolver';

/**
 * ============================================================================
 * POST /api/admissions/[id]/enroll
 *
 * CRITICAL SECURITY HOLD / COHORT 4 DEPENDENCY NOTICE:
 * Application-layer authorization: Enforces admissions.applicants.enroll,
 * verifies applicant lifecycle invariants, and injects server-derived actor ID.
 *
 * RESIDUAL DATABASE EXPOSURE:
 * The underlying PostgREST RPC public.enroll_applicant remains directly executable
 * by the 'authenticated' role until Cohort 4 deploys 048_admissions_enrollment_security.sql.
 * Application authorization via this endpoint is necessary but does NOT secure the
 * direct PostgREST RPC vector. Production authorization remains BLOCKED until Cohort 4.
 * ============================================================================
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const id = resolvedParams?.id;

    if (!id || typeof id !== 'string') {
      return apiError('Applicant ID is required', 'INVALID_REQUEST', 400);
    }

    const body = await req.json().catch(() => ({}));
    const { searchParams } = new URL(req.url);
    const requestedTenantSlug =
      searchParams.get('tenantSlug') || searchParams.get('tenant') || body.tenantSlug || undefined;

    // 1. Authorize using canonical admissions.applicants.enroll and authoritative applicant resolution
    const auth = await authorizeApiRequest(req, {
      permission: 'admissions.applicants.enroll',
      scope: 'tenant',
      requestedTenantSlug,
      resolveResource: {
        type: 'applicant',
        id,
      },
    });

    if (!auth.ok) {
      return auth.response;
    }

    const target = auth.target as TrustedResourceTarget;
    const currentStage = target?.stage ?? 'Application';
    const currentStatus = target?.status ?? 'active';

    // 2. Lifecycle validation: applicant must be active and in Offer stage
    if (currentStatus === 'rejected') {
      return apiError('Cannot enroll a rejected applicant', 'INVALID_REQUEST', 400);
    }

    if (currentStage === 'Allocation') {
      return apiError('Applicant has already been enrolled/allocated', 'INVALID_REQUEST', 400);
    }

    if (currentStage !== 'Offer') {
      return apiError(
        `Cannot enroll applicant in stage '${currentStage}'. Applicant must be approved into Offer stage before enrollment.`,
        'INVALID_REQUEST',
        400
      );
    }

    // 3. Invoke enroll_applicant RPC with server-derived actor ID
    const adminClient = auth.adminClient();
    const actorId = auth.user.id;

    const { data: studentId, error: rpcError } = await adminClient.rpc('enroll_applicant', {
      p_applicant_id: id,
      p_admin_id: actorId,
    });

    if (rpcError) {
      console.error('[Admissions Enroll RPC Error]', rpcError);
      return apiError(rpcError.message || 'Failed to enroll applicant via database RPC', 'DATABASE_ERROR', 500);
    }

    return NextResponse.json({
      success: true,
      data: {
        applicantId: id,
        studentId,
        enrolled: true,
      },
      message: 'Applicant successfully enrolled and allocated to registry.',
    });
  } catch (err: any) {
    console.error('[Admissions Enroll POST]', err);
    return apiError(err.message || 'Failed to enroll applicant', 'INTERNAL_ERROR', 500);
  }
}
