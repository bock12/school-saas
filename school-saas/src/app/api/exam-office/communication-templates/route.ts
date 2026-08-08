import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateTemplate } from '@/lib/communication/template-engine';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const adminSupabase = createAdminClient();
    const tenantId = user.user_metadata?.tenant_id;

    let query = adminSupabase.from('notification_templates').select('*').order('created_at', { ascending: false });

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    const { data: templates, error } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ templates: templates || [] });
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
    const { name, eventType, titleTemplate, bodyTemplate, emailSubjectTemplate, defaultPriority = 'normal', isMandatory = false } = body;

    const validationTitle = validateTemplate(titleTemplate || '');
    const validationBody = validateTemplate(bodyTemplate || '');

    if (!validationTitle.valid || !validationBody.valid) {
      const invalid = [...validationTitle.invalidVars, ...validationBody.invalidVars];
      return NextResponse.json({ error: `Invalid variable placeholders referenced: ${invalid.join(', ')}` }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const tenantId = user.user_metadata?.tenant_id;

    const { data: template, error } = await adminSupabase
      .from('notification_templates')
      .insert({
        tenant_id: tenantId || null,
        name,
        event_type: eventType,
        title_template: titleTemplate,
        body_template: bodyTemplate,
        email_subject_template: emailSubjectTemplate || null,
        default_priority: defaultPriority,
        is_mandatory: isMandatory,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ template });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
