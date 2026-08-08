/**
 * Exam Communication Center — Automated Event Engine
 * Listens to examination workflow events and evaluates active rules to trigger dispatches.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { renderTemplate, RenderContext } from './template-engine';
import { resolveAudience } from './audience-resolver';
import { CHANNELS, DeliveryChannel } from './channels';
import { logCommunicationAudit } from './audit';

export type ExamEventType =
  | 'examination_created'
  | 'examination_updated'
  | 'examination_cancelled'
  | 'examination_timetable_published'
  | 'examination_timetable_changed'
  | 'seating_plan_published'
  | 'examination_reminder'
  | 'student_marked_absent'
  | 'student_marked_late'
  | 'mark_entry_opened'
  | 'marks_deadline_approaching'
  | 'marks_overdue'
  | 'marks_submitted'
  | 'moderation_required'
  | 'moderation_completed'
  | 'results_processing_completed'
  | 'results_awaiting_approval'
  | 'results_approved'
  | 'results_published'
  | 'malpractice_reported'
  | 'appeal_submitted'
  | 'appeal_resolved';

export interface DispatchEventOptions {
  tenantId: string;
  eventType: ExamEventType;
  entityType: string;
  entityId: string;
  actorId?: string;
  context: RenderContext;
  deepLink?: string;
}

/**
 * Dispatches an automated examination event.
 * Checks for matching active rules, renders template, resolves audience, and delivers notifications.
 */
export async function dispatchExamEvent(options: DispatchEventOptions): Promise<{ triggered: number }> {
  const supabase = createAdminClient();
  const { tenantId, eventType, entityType, entityId, actorId, context, deepLink } = options;

  // 1. Check idempotency in notification_events table
  const { data: existingEvent } = await supabase
    .from('notification_events')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('event_type', eventType)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .single();

  if (existingEvent) {
    // Already processed this exact event
    return { triggered: 0 };
  }

  // Record event log
  await supabase.from('notification_events').insert({
    tenant_id: tenantId,
    event_type: eventType,
    entity_type: entityType,
    entity_id: entityId,
    payload: context,
    processed_at: new Date().toISOString(),
  });

  // 2. Query active rules for this event_type
  const { data: rules } = await supabase
    .from('notification_rules')
    .select('*, notification_templates(*)')
    .eq('tenant_id', tenantId)
    .eq('event_type', eventType)
    .eq('active', true);

  if (!rules || rules.length === 0) {
    return { triggered: 0 };
  }

  let triggeredCount = 0;

  for (const rule of rules) {
    const template = rule.notification_templates;
    if (!template) continue;

    const title = renderTemplate(template.title_template, context);
    const body = renderTemplate(template.body_template, context);
    const link = deepLink || context.result_link || context.timetable_link || '/exam-office';

    // Resolve audience
    const audienceDef = rule.audience_definition || { type: 'all_teachers', tenantId };
    const recipients = await resolveAudience({ ...audienceDef, tenantId });

    if (recipients.length === 0) continue;

    // Create Notification Record
    const { data: notif, error: notifErr } = await supabase
      .from('notifications')
      .insert({
        tenant_id: tenantId,
        template_id: template.id,
        title,
        body,
        notification_type: eventType,
        priority: template.default_priority || 'normal',
        audience_type: audienceDef.type || 'custom',
        deep_link: link,
        created_by: actorId || null,
        sent_at: new Date().toISOString(),
        status: 'sent',
        is_mandatory: template.is_mandatory || false,
        metadata: { event_type: eventType, entity_id: entityId },
      })
      .select('id')
      .single();

    if (notifErr || !notif) continue;

    // Insert Recipients & Deliveries
    const channels: DeliveryChannel[] = rule.channel_configuration || ['in_app'];

    for (const r of recipients) {
      const { data: recip } = await supabase
        .from('notification_recipients')
        .insert({
          notification_id: notif.id,
          user_id: r.userId,
          status: 'unread',
        })
        .select()
        .single();

      if (recip) {
        for (const channel of channels) {
          const adapter = CHANNELS[channel];
          const delRes = await adapter.send({
            notificationId: notif.id,
            recipientId: recip.id,
            userId: r.userId,
            title,
            body,
            deepLink: link,
            email: r.email,
            phone: r.phone,
          });

          await supabase.from('notification_deliveries').insert({
            notification_id: notif.id,
            recipient_id: recip.id,
            channel,
            status: delRes.success ? 'sent' : 'failed',
            provider_message_id: delRes.providerMessageId || null,
            sent_at: delRes.success ? new Date().toISOString() : null,
            failed_at: delRes.success ? null : new Date().toISOString(),
            failure_reason: delRes.failureReason || null,
            attempts: 1,
          });
        }
      }
    }

    triggeredCount++;

    await logCommunicationAudit({
      tenantId,
      actorId,
      action: 'notification_sent',
      notificationId: notif.id,
      details: `Automated notification triggered for event: ${eventType} (${recipients.length} recipients)`,
    });
  }

  return { triggered: triggeredCount };
}
