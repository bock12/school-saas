/**
 * Exam Communication Center — Delivery Channels Abstraction
 * Supports In-App, Email, SMS, and Push channels with configurable fallback.
 */

export type DeliveryChannel = 'in_app' | 'push' | 'email' | 'sms';
export type DeliveryStatus = 'queued' | 'processing' | 'sent' | 'delivered' | 'failed' | 'cancelled';

export interface DeliveryPayload {
  notificationId: string;
  recipientId: string;
  userId: string;
  title: string;
  body: string;
  deepLink?: string;
  email?: string;
  phone?: string;
  priority?: string;
  metadata?: Record<string, unknown>;
}

export interface DeliveryResult {
  success: boolean;
  channel: DeliveryChannel;
  providerMessageId?: string;
  failureReason?: string;
}

export interface NotificationChannelInterface {
  channel: DeliveryChannel;
  send(payload: DeliveryPayload): Promise<DeliveryResult>;
}

export class InAppNotificationChannel implements NotificationChannelInterface {
  channel: DeliveryChannel = 'in_app';
  async send(payload: DeliveryPayload): Promise<DeliveryResult> {
    // In-app delivery is handled via the notification_recipients table entry
    return {
      success: true,
      channel: 'in_app',
      providerMessageId: `inapp_${Date.now()}_${payload.userId.substring(0, 6)}`,
    };
  }
}

export class EmailNotificationChannel implements NotificationChannelInterface {
  channel: DeliveryChannel = 'email';
  async send(payload: DeliveryPayload): Promise<DeliveryResult> {
    if (!payload.email) {
      return {
        success: false,
        channel: 'email',
        failureReason: 'Missing recipient email address',
      };
    }
    // Simulation / SMTP Adapter dispatch
    return {
      success: true,
      channel: 'email',
      providerMessageId: `msg_email_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
  }
}

export class SmsNotificationChannel implements NotificationChannelInterface {
  channel: DeliveryChannel = 'sms';
  async send(payload: DeliveryPayload): Promise<DeliveryResult> {
    if (!payload.phone) {
      return {
        success: false,
        channel: 'sms',
        failureReason: 'Missing recipient phone number',
      };
    }
    // Simulation / Gateway SMS Adapter dispatch
    return {
      success: true,
      channel: 'sms',
      providerMessageId: `msg_sms_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
  }
}

export class PushNotificationChannel implements NotificationChannelInterface {
  channel: DeliveryChannel = 'push';
  async send(payload: DeliveryPayload): Promise<DeliveryResult> {
    // WebPush Adapter dispatch
    return {
      success: true,
      channel: 'push',
      providerMessageId: `msg_push_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
  }
}

export const CHANNELS: Record<DeliveryChannel, NotificationChannelInterface> = {
  in_app: new InAppNotificationChannel(),
  email: new EmailNotificationChannel(),
  sms: new SmsNotificationChannel(),
  push: new PushNotificationChannel(),
};

/**
 * Sends a notification delivery with fallback support.
 */
export async function sendWithFallback(
  primaryChannel: DeliveryChannel,
  fallbackChannel: DeliveryChannel | undefined,
  payload: DeliveryPayload
): Promise<DeliveryResult> {
  const primary = CHANNELS[primaryChannel];
  const res = await primary.send(payload);

  if (res.success || !fallbackChannel || fallbackChannel === primaryChannel) {
    return res;
  }

  // Execute fallback channel
  const fallback = CHANNELS[fallbackChannel];
  return fallback.send(payload);
}
