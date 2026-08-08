import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { resolveAudience } from '@/lib/communication/audience-resolver';
import { renderTemplate } from '@/lib/communication/template-engine';
import { CHANNELS, DeliveryChannel } from '@/lib/communication/channels';
import { logCommunicationAudit } from '@/lib/communication/audit';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tenantSlug = searchParams.get('tenant') || req.headers.get('x-tenant-slug');

    const adminSupabase = createAdminClient();

    // Get tenant id
    let tenantId = user.user_metadata?.tenant_id;
    if (!tenantId && tenantSlug) {
      const { data: tenant } = await adminSupabase.from('tenants').select('id').eq('slug', tenantSlug).single();
      tenantId = tenant?.id;
    }

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant context required' }, { status: 400 });
    }

    const { data: notifications, error } = await adminSupabase
      .from('notifications')
      .select('*, notification_recipients(count), notification_deliveries(count)')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ notifications: notifications || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      tenantSlug,
      title,
      message,
      templateId,
      priority = 'normal',
      audienceType = 'all_teachers',
      channels = ['in_app'],
      deepLink,
      scheduleAt,
      isMandatory = false,
      context = {},
    } = body;

    const adminSupabase = createAdminClient();

    let tenantId = user.user_metadata?.tenant_id;
    if (!tenantId && tenantSlug) {
      const { data: tenant } = await adminSupabase.from('tenants').select('id').eq('slug', tenantSlug).single();
      tenantId = tenant?.id;
    }

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant context required' }, { status: 400 });
    }

    // Render template if templateId provided
    let finalTitle = title;
    let finalBody = message;

    if (templateId) {
      const { data: tpl } = await adminSupabase
        .from('notification_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (tpl) {
        finalTitle = renderTemplate(tpl.title_template, context);
        finalBody = renderTemplate(tpl.body_template, context);
      }
    }

    const isScheduled = !!scheduleAt && new Date(scheduleAt) > new Date();
    const status = isScheduled ? 'scheduled' : 'sent';

    // 1. Resolve recipients
    const recipients = await resolveAudience({
      type: audienceType,
      tenantId,
    });

    if (recipients.length === 0) {
      return NextResponse.json({ error: 'No recipients match the selected audience filter' }, { status: 400 });
    }

    // 2. Create notification record
    const { data: notif, error: notifErr } = await adminSupabase
      .from('notifications')
      .insert({
        tenant_id: tenantId,
        template_id: templateId || null,
        title: finalTitle,
        body: finalBody,
        priority,
        audience_type: audienceType,
        deep_link: deepLink || '/exam-office',
        created_by: user.id,
        scheduled_at: isScheduled ? new Date(scheduleAt).toISOString() : null,
        sent_at: isScheduled ? null : new Date().toISOString(),
        status,
        is_mandatory: isMandatory,
        metadata: { channels, context },
      })
      .select()
      .single();

    if (notifErr || !notif) {
      return NextResponse.json({ error: notifErr?.message || 'Failed to create notification' }, { status: 500 });
    }

    // 3. Dispatch to recipients if sent immediately
    let deliveryCount = 0;
    if (!isScheduled) {
      for (const r of recipients) {
        const { data: recip } = await adminSupabase
          .from('notification_recipients')
          .insert({
            notification_id: notif.id,
            user_id: r.userId,
            status: 'unread',
          })
          .select()
          .single();

        if (recip) {
          for (const channelName of (channels as DeliveryChannel[])) {
            const adapter = CHANNELS[channelName];
            if (!adapter) continue;

            const res = await adapter.send({
              notificationId: notif.id,
              recipientId: recip.id,
              userId: r.userId,
              title: finalTitle,
              body: finalBody,
              deepLink: deepLink || '/exam-office',
              email: r.email,
              phone: r.phone,
            });

            await adminSupabase.from('notification_deliveries').insert({
              notification_id: notif.id,
              recipient_id: recip.id,
              channel: channelName,
              status: res.success ? 'sent' : 'failed',
              provider_message_id: res.providerMessageId || null,
              sent_at: res.success ? new Date().toISOString() : null,
              failed_at: res.success ? null : new Date().toISOString(),
              failure_reason: res.failureReason || null,
              attempts: 1,
            });

            deliveryCount++;
          }
        }
      }
    }

    await logCommunicationAudit({
      tenantId,
      actorId: user.id,
      action: isScheduled ? 'notification_scheduled' : 'notification_sent',
      notificationId: notif.id,
      details: `${isScheduled ? 'Scheduled' : 'Sent'} notification "${finalTitle}" to ${recipients.length} recipients across ${channels.join(', ')}`,
    });

    return NextResponse.json({
      success: true,
      notification: notif,
      recipientCount: recipients.length,
      deliveryCount,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
