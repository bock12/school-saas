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

    // 1. Authorize using canonical admissions.applicants.evaluate and authoritative applicant resolution
    const auth = await authorizeApiRequest(req, {
      permission: 'admissions.applicants.evaluate',
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

    // 2. Lifecycle validation: must be active and in evaluate-eligible stage
    if (currentStatus === 'rejected') {
      return apiError('Cannot evaluate a rejected applicant', 'INVALID_REQUEST', 400);
    }

    const VALID_EVALUATION_STAGES = new Set(['Application', 'Assessment', 'Interview']);
    if (!VALID_EVALUATION_STAGES.has(currentStage)) {
      return apiError(
        `Applicant cannot be evaluated in stage '${currentStage}'. Evaluation is only allowed in Application, Assessment, or Interview stages.`,
        'INVALID_REQUEST',
        400
      );
    }

    const { interviewScore, assessmentScore, docsVerified, nextStage, comment } = body;

    if (interviewScore !== undefined && (typeof interviewScore !== 'number' || interviewScore < 0)) {
      return apiError('interviewScore must be a non-negative number', 'INVALID_REQUEST', 400);
    }
    if (assessmentScore !== undefined && (typeof assessmentScore !== 'number' || assessmentScore < 0)) {
      return apiError('assessmentScore must be a non-negative number', 'INVALID_REQUEST', 400);
    }

    if (nextStage !== undefined && !VALID_EVALUATION_STAGES.has(nextStage)) {
      return apiError(
        `Invalid nextStage: '${nextStage}'. Must be one of: Application, Assessment, Interview`,
        'INVALID_REQUEST',
        400
      );
    }

    // 3. Perform mutation using server-derived tenantId and actor
    const adminClient = auth.adminClient();
    const tenantId = auth.tenantId!;

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (interviewScore !== undefined) updatePayload.interview_score = interviewScore;
    if (assessmentScore !== undefined) updatePayload.assessment_score = assessmentScore;
    if (docsVerified !== undefined) updatePayload.docs_verified = Boolean(docsVerified);
    if (nextStage !== undefined) updatePayload.stage = nextStage;

    const { data: applicant, error: updateError } = await adminClient
      .from('applicants')
      .update(updatePayload)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (updateError) throw updateError;

    // 4. Audit trail
    const effectiveToStage = nextStage || currentStage;
    await recordAdmissionHistory(adminClient, {
      tenantId,
      applicantId: id,
      fromStage: currentStage,
      toStage: effectiveToStage,
      comment: comment || `Evaluated applicant scores (interview: ${interviewScore ?? 'unchanged'}, assessment: ${assessmentScore ?? 'unchanged'})`,
      createdBy: auth.user.id,
    });

    return NextResponse.json({
      success: true,
      data: { applicant },
      message: 'Applicant evaluation recorded successfully.',
    });
  } catch (err: any) {
    console.error('[Admissions Evaluate POST]', err);
    return apiError(err.message || 'Failed to evaluate applicant', 'INTERNAL_ERROR', 500);
  }
}
