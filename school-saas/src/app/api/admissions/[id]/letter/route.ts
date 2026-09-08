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

    // 1. Authorize using canonical admissions.letters.dispatch and authoritative applicant resolution
    const auth = await authorizeApiRequest(req, {
      permission: 'admissions.letters.dispatch',
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

    // 2. Lifecycle validation: applicant must be active and in Offer or Allocation stage
    if (currentStatus === 'rejected') {
      return apiError('Cannot dispatch admission letter for a rejected applicant', 'INVALID_REQUEST', 400);
    }

    const DISPATCHABLE_STAGES = new Set(['Offer', 'Allocation']);
    if (!DISPATCHABLE_STAGES.has(currentStage)) {
      return apiError(
        `Cannot dispatch admission letter for applicant in stage '${currentStage}'. Applicant must be in Offer or Allocation stage.`,
        'INVALID_REQUEST',
        400
      );
    }

    const { comment } = body;

    // 3. Perform mutation: mark admission_letter_sent = true
    const adminClient = auth.adminClient();
    const tenantId = auth.tenantId!;
    const now = new Date().toISOString();

    const { data: applicant, error: updateError } = await adminClient
      .from('applicants')
      .update({
        admission_letter_sent: true,
        admission_letter_sent_at: now,
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
      comment: comment || 'Official admission letter dispatched to applicant/parent',
      createdBy: auth.user.id,
    });

    return NextResponse.json({
      success: true,
      data: { applicant },
      message: 'Admission letter dispatched successfully.',
    });
  } catch (err: any) {
    console.error('[Admissions Letter POST]', err);
    return apiError(err.message || 'Failed to dispatch admission letter', 'INTERNAL_ERROR', 500);
  }
}
