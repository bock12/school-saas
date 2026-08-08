/**
 * Exam Communication Center — Security & Action Audit Service
 * Records immutable audit logs for all communication dispatches and setting updates.
 */

import { createAdminClient } from '@/lib/supabase/admin';

export type CommunicationAuditAction =
  | 'notification_created'
  | 'notification_scheduled'
  | 'notification_sent'
  | 'notification_cancelled'
  | 'template_created'
  | 'template_updated'
  | 'rule_created'
  | 'rule_updated'
  | 'delivery_failed'
  | 'delivery_retried'
  | 'recipient_read';

export interface AuditRecord {
  tenantId: string;
  actorId?: string;
  action: CommunicationAuditAction;
  notificationId?: string;
  details: string;
  metadata?: Record<string, unknown>;
}

export async function logCommunicationAudit(record: AuditRecord): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from('notification_events').insert({
      tenant_id: record.tenantId,
      event_type: record.action,
      entity_type: 'notification',
      entity_id: record.notificationId || null,
      payload: {
        actor_id: record.actorId,
        details: record.details,
        metadata: record.metadata || {},
        timestamp: new Date().toISOString(),
      },
      processed_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
