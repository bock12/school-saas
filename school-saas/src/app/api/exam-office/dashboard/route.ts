import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantSlug = searchParams.get('tenantSlug');

    // 1. Fetch active exam sessions from database
    const { data: sessions, error: sessionsErr } = await supabase
      .from('exam_sessions')
      .select('*')
      .order('created_at', { ascending: false });

    // 2. Fetch pending approvals
    const { data: approvals, error: appErr } = await supabase
      .from('exam_results_approval')
      .select('*')
      .order('submitted_at', { ascending: false });

    // 3. Fetch malpractice incidents
    const { data: malpractices, error: malErr } = await supabase
      .from('exam_malpractices')
      .select('*')
      .order('reported_at', { ascending: false });

    // 4. Fetch appeals
    const { data: appeals, error: applsErr } = await supabase
      .from('exam_appeals')
      .select('*')
      .order('created_at', { ascending: false });

    // Summary KPIs
    const activeExams = sessions?.filter(s => s.status === 'Ongoing' || s.status === 'Timetabled' || s.status === 'Upcoming') || [];
    const completedExams = sessions?.filter(s => s.status === 'Completed' || s.status === 'Published' || s.status === 'Approved') || [];
    const pendingModerations = approvals?.filter(a => !a.hod_approved) || [];
    const pendingApprovals = approvals?.filter(a => a.hod_approved && !a.principal_approved) || [];

    return NextResponse.json({
      success: true,
      data: {
        sessions: sessions || [],
        summary: {
          totalSessions: sessions?.length || 0,
          activeCount: activeExams.length,
          completedCount: completedExams.length,
          pendingModerationCount: pendingModerations.length,
          pendingApprovalCount: pendingApprovals.length,
          malpracticeCount: malpractices?.length || 0,
          appealsCount: appeals?.length || 0,
        },
        approvals: approvals || [],
        malpractices: malpractices || [],
        appeals: appeals || [],
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, academic_year, term, type, mode, weightage, start_date, end_date, status, classes_count, candidates_count } = body;

    const { data: newSession, error } = await supabase
      .from('exam_sessions')
      .insert({
        name,
        academic_year: academic_year || '2025-26',
        term: term || '3rd Term',
        type: type || 'EXAM',
        mode: mode || 'ONLINE',
        weightage: weightage || '-',
        start_date,
        end_date,
        status: status || 'Upcoming',
        classes_count: classes_count || 12,
        candidates_count: candidates_count || 1248,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: newSession });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, approved_by, name, mark_deadline, clearance_required } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Session ID is required' }, { status: 400 });
    }

    const updatePayload: Record<string, any> = { updated_at: new Date().toISOString() };
    if (status) updatePayload.status = status;
    if (name) updatePayload.name = name;
    if (mark_deadline !== undefined) updatePayload.mark_deadline = mark_deadline;
    if (clearance_required !== undefined) updatePayload.clearance_required = clearance_required;
    if (approved_by) {
      updatePayload.approved_by = approved_by;
      updatePayload.approved_at = new Date().toISOString();
    }

    const { data: updated, error } = await supabase
      .from('exam_sessions')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
