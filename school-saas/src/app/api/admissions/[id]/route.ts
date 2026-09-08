import { NextRequest, NextResponse } from 'next/server';
import { authorizeApiRequest, apiError } from '@/lib/auth/api-guard';
import { validateAndBuildDemographicUpdates } from '@/lib/admissions/applicant-patch';

export async function PATCH(
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

    const auth = await authorizeApiRequest(req, {
      permission: 'admissions.applicants.manage',
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

    const validation = validateAndBuildDemographicUpdates(body);
    if (!validation.ok) {
      return validation.response;
    }

    const adminClient = auth.adminClient();
    const tenantId = auth.tenantId!;

    const { data: applicant, error } = await adminClient
      .from('applicants')
      .update(validation.dbFields)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: { applicant } });
  } catch (err: any) {
    console.error('[Admissions [id] PATCH]', err);
    return apiError(err.message || 'Failed to update applicant', 'INTERNAL_ERROR', 500);
  }
}
