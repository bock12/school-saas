import { NextRequest, NextResponse } from 'next/server';
import { authorizeApiRequest, apiError } from '@/lib/auth/api-guard';
import { recordAdmissionHistory } from '@/lib/admissions/admission-history';
import { TrustedResourceTarget } from '@/lib/auth/resource-resolver';

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

    // 1. Authorize using canonical admissions.applicants.place and authoritative applicant resolution
    const auth = await authorizeApiRequest(req, {
      permission: 'admissions.applicants.place',
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

    // 2. Lifecycle validation: applicant must be active and not yet allocated/enrolled
    if (currentStatus === 'rejected') {
      return apiError('Cannot place stream for a rejected applicant', 'INVALID_REQUEST', 400);
    }

    if (currentStage === 'Allocation') {
      return apiError('Cannot place stream for an applicant who has already been allocated/enrolled', 'INVALID_REQUEST', 400);
    }

    const { stream, comment } = body;
    if (!stream || typeof stream !== 'string') {
      return apiError('stream is required and must be a non-empty string', 'INVALID_REQUEST', 400);
    }

    // 3. Perform mutation using server-derived tenantId and actor
    const adminClient = auth.adminClient();
    const tenantId = auth.tenantId!;
    const now = new Date().toISOString();

    const { data: applicant, error: updateError } = await adminClient
      .from('applicants')
      .update({
        target_stream: stream,
        stream_auto_placed: false,
        stream_placed_at: now,
        stream_placed_by: auth.user.id,
        updated_at: now,
      })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (updateError) throw updateError;

    // 4. Audit trail
    await recordAdmissionHistory(adminClient, {
      tenantId,
      applicantId: id,
      fromStage: currentStage,
      toStage: currentStage,
      comment: comment || `Manually placed into stream: ${stream}`,
      createdBy: auth.user.id,
    });

    return NextResponse.json({
      success: true,
      data: { applicant, stream },
      message: `Applicant placed into stream '${stream}' successfully.`,
    });
  } catch (err: any) {
    console.error('[Admissions Place POST]', err);
    return apiError(err.message || 'Failed to place applicant stream', 'INTERNAL_ERROR', 500);
  }
}
