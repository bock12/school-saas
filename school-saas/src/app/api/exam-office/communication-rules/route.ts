import { NextRequest, NextResponse } from 'next/server';
import { authorizeApiRequest, apiError } from '@/lib/auth/api-guard';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedTenantSlug =
      searchParams.get('tenantSlug') || searchParams.get('tenant') || undefined;

    const auth = await authorizeApiRequest(req, {
      permission: 'communications.rules.manage',
      scope: 'tenant',
      requestedTenantSlug,
    });

    if (!auth.ok) {
      return auth.response;
    }

    const adminSupabase = auth.adminClient();
    const tenantId = auth.tenantId!;

    const { data: rules, error } = await adminSupabase
      .from('notification_rules')
      .select('*, notification_templates(*)')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) return apiError(error.message, 'DATABASE_ERROR', 500);

    return NextResponse.json({ rules: rules || [] });
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
      templateId,
      audienceDefinition,
      channelConfiguration = ['in_app'],
      conditions = {},
      delaySeconds = 0,
      active = true,
      tenantSlug,
    } = body;

    const { searchParams } = new URL(req.url);
    const requestedTenantSlug =
      searchParams.get('tenantSlug') || searchParams.get('tenant') || tenantSlug || undefined;

    const auth = await authorizeApiRequest(req, {
      permission: 'communications.rules.manage',
      scope: 'tenant',
      requestedTenantSlug,
    });

    if (!auth.ok) {
      return auth.response;
    }

    const adminSupabase = auth.adminClient();
    const tenantId = auth.tenantId!;

    const { data: rule, error } = await adminSupabase
      .from('notification_rules')
      .insert({
        tenant_id: tenantId,
        name,
        event_type: eventType,
        template_id: templateId,
        audience_definition: audienceDefinition || { type: 'all_teachers' },
        channel_configuration: channelConfiguration,
        conditions,
        delay_seconds: delaySeconds,
        active,
        created_by: auth.user.id,
      })
      .select()
      .single();

    if (error) return apiError(error.message, 'DATABASE_ERROR', 500);

    return NextResponse.json({ rule });
  } catch (err: any) {
    return apiError(err.message || 'Server error', 'INTERNAL_ERROR', 500);
  }
}
