import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const adminSupabase = createAdminClient();
    const tenantId = user.user_metadata?.tenant_id;

    let query = adminSupabase.from('notification_rules').select('*, notification_templates(*)').order('created_at', { ascending: false });

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    const { data: rules, error } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ rules: rules || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, eventType, templateId, audienceDefinition, channelConfiguration = ['in_app'], conditions = {}, delaySeconds = 0, active = true } = body;

    const adminSupabase = createAdminClient();
    const tenantId = user.user_metadata?.tenant_id;

    const { data: rule, error } = await adminSupabase
      .from('notification_rules')
      .insert({
        tenant_id: tenantId || null,
        name,
        event_type: eventType,
        template_id: templateId,
        audience_definition: audienceDefinition || { type: 'all_teachers' },
        channel_configuration: channelConfiguration,
        conditions,
        delay_seconds: delaySeconds,
        active,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ rule });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
