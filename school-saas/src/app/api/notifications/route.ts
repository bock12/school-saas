import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = createAdminClient();

    // Query recipient records for current user
    const { data: items, error } = await adminSupabase
      .from('notification_recipients')
      .select('id, status, read_at, created_at, notifications(id, title, body, priority, deep_link, notification_type, is_mandatory, created_at)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const unreadCount = (items || []).filter((i: any) => i.status === 'unread').length;

    return NextResponse.json({
      notifications: items || [],
      unreadCount,
    });
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
    const { recipientId, markAllRead } = body;

    const adminSupabase = createAdminClient();

    if (markAllRead) {
      await adminSupabase
        .from('notification_recipients')
        .update({ status: 'read', read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('status', 'unread');

      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (recipientId) {
      await adminSupabase
        .from('notification_recipients')
        .update({ status: 'read', read_at: new Date().toISOString() })
        .eq('id', recipientId)
        .eq('user_id', user.id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
