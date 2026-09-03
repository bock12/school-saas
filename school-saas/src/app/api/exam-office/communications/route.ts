import { NextRequest, NextResponse } from 'next/server';
import { authorizeApiRequest, apiError } from '@/lib/auth/api-guard';
import { resolveAudience } from '@/lib/communication/audience-resolver';
import { renderTemplate } from '@/lib/communication/template-engine';
import { CHANNELS, DeliveryChannel } from '@/lib/communication/channels';
import { logCommunicationAudit } from '@/lib/communication/audit';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetTenantSlug = searchParams.get('tenant') || undefined;

    const auth = await authorizeApiRequest(req, {
      roles: ['school_admin', 'exam_officer', 'super_admin'],
      requestedTenantSlug: targetTenantSlug,
      scope: 'tenant',
    });

    if (!auth.ok) {
      return auth.response;
    }

    const adminSupabase = auth.adminClient();
    const tenantId = auth.tenantId;

    const { data: notifications, error } = await adminSupabase
      .from('notifications')
      .select('*, notification_recipients(count), notification_deliveries(count)')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      return apiError(error.message, 'DATABASE_ERROR', 500);
    }

    return NextResponse.json({ notifications: notifications || [] });
  } catch (err: any) {
    return apiError(err.message || 'Server error', 'INTERNAL_ERROR', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
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

    const auth = await authorizeApiRequest(req, {
      roles: ['school_admin', 'exam_officer', 'super_admin'],
      requestedTenantSlug: tenantSlug || undefined,
      scope: 'tenant',
    });

    if (!auth.ok) {
      return auth.response;
    }

    const user = auth.user;
    const adminSupabase = auth.adminClient();
    const tenantId = auth.tenantId;

    // Render template if templateId provided
    let finalTitle = title;
    let finalBody = message;

    if (templateId) {
      const { data: tpl } = await adminSupabase
        .from('notification_templates')
        .select('*')
        .eq('id', templateId)
        .eq('tenant_id', tenantId)
        .maybeSingle();

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
      tenantId: tenantId!,
    });

    if (recipients.length === 0) {
      return apiError('No recipients match the selected audience filter', 'INVALID_AUDIENCE', 400);
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
      return apiError(notifErr?.message || 'Failed to create notification', 'DATABASE_ERROR', 500);
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
      tenantId: tenantId!,
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
    return apiError(err.message || 'Server error', 'INTERNAL_ERROR', 500);
  }
}
