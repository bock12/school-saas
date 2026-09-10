import { NextRequest, NextResponse } from 'next/server';
import { authorizeApiRequest, apiError } from '@/lib/auth/api-guard';
import { validateTemplate } from '@/lib/communication/template-engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedTenantSlug =
      searchParams.get('tenantSlug') || searchParams.get('tenant') || undefined;

    const auth = await authorizeApiRequest(req, {
      permission: 'communications.templates.manage',
      scope: 'tenant',
      requestedTenantSlug,
    });

    if (!auth.ok) {
      return auth.response;
    }

    const adminSupabase = auth.adminClient();
    const tenantId = auth.tenantId!;

    const { data: templates, error } = await adminSupabase
      .from('notification_templates')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) return apiError(error.message, 'DATABASE_ERROR', 500);

    return NextResponse.json({ templates: templates || [] });
  } catch (err: any) {
    return apiError(err.message || 'Server error', 'INTERNAL_ERROR', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      name,
      eventType,
      titleTemplate,
      bodyTemplate,
      emailSubjectTemplate,
      defaultPriority = 'normal',
      isMandatory = false,
      tenantSlug,
    } = body;

    const { searchParams } = new URL(req.url);
    const requestedTenantSlug =
      searchParams.get('tenantSlug') || searchParams.get('tenant') || tenantSlug || undefined;

    const auth = await authorizeApiRequest(req, {
      permission: 'communications.templates.manage',
      scope: 'tenant',
      requestedTenantSlug,
    });

    if (!auth.ok) {
      return auth.response;
    }

    const validationTitle = validateTemplate(titleTemplate || '');
    const validationBody = validateTemplate(bodyTemplate || '');

    if (!validationTitle.valid || !validationBody.valid) {
      const invalid = [...validationTitle.invalidVars, ...validationBody.invalidVars];
      return apiError(`Invalid variable placeholders referenced: ${invalid.join(', ')}`, 'INVALID_REQUEST', 400);
    }

    const adminSupabase = auth.adminClient();
    const tenantId = auth.tenantId!;

    const { data: template, error } = await adminSupabase
      .from('notification_templates')
      .insert({
        tenant_id: tenantId,
        name,
        event_type: eventType,
        title_template: titleTemplate,
        body_template: bodyTemplate,
        email_subject_template: emailSubjectTemplate || null,
        default_priority: defaultPriority,
        is_mandatory: isMandatory,
        created_by: auth.user.id,
      })
      .select()
      .single();

    if (error) return apiError(error.message, 'DATABASE_ERROR', 500);

    return NextResponse.json({ template });
  } catch (err: any) {
    return apiError(err.message || 'Server error', 'INTERNAL_ERROR', 500);
  }
}
