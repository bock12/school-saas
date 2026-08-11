import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET: Admin API fetching synchronized examination overview data
export async function GET(req: NextRequest) {
  try {
    const { data: sessions, error } = await supabase
      .from('exam_sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const { data: approvals } = await supabase
      .from('exam_results_approval')
      .select('*');

    const { data: malpractices } = await supabase
      .from('exam_malpractices')
      .select('*');

    return NextResponse.json({
      success: true,
      data: {
        sessions: sessions || [],
        totalSessions: sessions?.length || 0,
        activeSessions: sessions?.filter(s => s.status === 'Ongoing' || s.status === 'Timetabled' || s.status === 'Upcoming') || [],
        approvalsCount: approvals?.length || 0,
        malpracticeCount: malpractices?.length || 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH: Admin action to approve or update exam status across system
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, approved_by } = body;

    const { data: updated, error } = await supabase
      .from('exam_sessions')
      .update({
        status: status || 'Approved',
        approved_by: approved_by || 'Admin',
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
