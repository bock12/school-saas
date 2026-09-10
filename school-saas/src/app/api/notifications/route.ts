import { NextRequest, NextResponse } from 'next/server';
import { authorizeApiRequest, apiError } from '@/lib/auth/api-guard';

export async function GET(req: NextRequest) {
  try {
    const auth = await authorizeApiRequest(req, {
      permission: 'notifications.self.view',
      scope: 'platform',
      requireTenant: false,
    });

    if (!auth.ok) {
      return auth.response;
    }

    const adminSupabase = auth.adminClient();

    // Query recipient records strictly for the authenticated actor
    const { data: items, error } = await adminSupabase
      .from('notification_recipients')
      .select('id, status, read_at, created_at, notifications(id, title, body, priority, deep_link, notification_type, is_mandatory, created_at)')
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      return apiError(error.message, 'DATABASE_ERROR', 500);
    }

    const unreadCount = (items || []).filter((i: any) => i.status === 'unread').length;

    return NextResponse.json({
      notifications: items || [],
      unreadCount,
    });
  } catch (err: any) {
    return apiError(err.message || 'Server error', 'INTERNAL_ERROR', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authorizeApiRequest(req, {
      permission: 'notifications.self.manage',
      scope: 'platform',
      requireTenant: false,
    });

    if (!auth.ok) {
      return auth.response;
    }

    const body = await req.json().catch(() => ({}));
    const { recipientId, markAllRead } = body;

    if (!markAllRead && (!recipientId || typeof recipientId !== 'string')) {
      return apiError('Invalid request parameters: recipientId or markAllRead required.', 'INVALID_REQUEST', 400);
    }

    const adminSupabase = auth.adminClient();

    if (markAllRead) {
      const { error } = await adminSupabase
        .from('notification_recipients')
        .update({ status: 'read', read_at: new Date().toISOString() })
        .eq('user_id', auth.user.id)
        .eq('status', 'unread');

      if (error) return apiError(error.message, 'DATABASE_ERROR', 500);

      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (recipientId) {
      const { data, error } = await adminSupabase
        .from('notification_recipients')
        .update({ status: 'read', read_at: new Date().toISOString() })
        .eq('id', recipientId)
        .eq('user_id', auth.user.id)
        .select()
        .maybeSingle();

      if (error) return apiError(error.message, 'DATABASE_ERROR', 500);
      if (!data) return apiError('Notification not found or access denied', 'NOT_FOUND', 404);

      return NextResponse.json({ success: true });
    }

    return apiError('Invalid request parameters', 'INVALID_REQUEST', 400);
  } catch (err: any) {
    return apiError(err.message || 'Server error', 'INTERNAL_ERROR', 500);
  }
}
