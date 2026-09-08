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

    // 1. Authorize using canonical admissions.applicants.approve and authoritative applicant resolution
    const auth = await authorizeApiRequest(req, {
      permission: 'admissions.applicants.approve',
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

    // 2. Lifecycle validation: must be active and in pre-offer stage
    if (currentStatus === 'rejected') {
      return apiError('Cannot approve a rejected applicant', 'INVALID_REQUEST', 400);
    }

    const APPROVABLE_STAGES = new Set(['Application', 'Assessment', 'Interview']);
    if (!APPROVABLE_STAGES.has(currentStage)) {
      return apiError(
        `Applicant cannot be approved in stage '${currentStage}'. Must be in Application, Assessment, or Interview stage.`,
        'INVALID_REQUEST',
        400
      );
    }

    const { comment } = body;

    // 3. Perform mutation: advance to Offer stage and mark docs_verified
    const adminClient = auth.adminClient();
    const tenantId = auth.tenantId!;
    const now = new Date().toISOString();

    const { data: applicant, error: updateError } = await adminClient
      .from('applicants')
      .update({
        stage: 'Offer',
        docs_verified: true,
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
      toStage: 'Offer',
      comment: comment || 'Application approved and offer issued',
      createdBy: auth.user.id,
    });

    return NextResponse.json({
      success: true,
      data: { applicant },
      message: 'Applicant approved successfully. Stage advanced to Offer.',
    });
  } catch (err: any) {
    console.error('[Admissions Approve POST]', err);
    return apiError(err.message || 'Failed to approve applicant', 'INTERNAL_ERROR', 500);
  }
}
