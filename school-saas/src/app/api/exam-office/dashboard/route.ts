import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    // 1. Fetch active exam sessions from database
    const { data: sessions } = await supabase
      .from('exam_sessions')
      .select('*')
      .order('created_at', { ascending: false });

    // 2. Fetch pending approvals
    const { data: approvals } = await supabase
      .from('exam_results_approval')
      .select('*')
      .order('submitted_at', { ascending: false });

    // 3. Fetch malpractice incidents
    const { data: malpractices } = await supabase
      .from('exam_malpractices')
      .select('*')
      .order('reported_at', { ascending: false });

    // 4. Fetch appeals
    const { data: appeals } = await supabase
      .from('exam_appeals')
      .select('*')
      .order('created_at', { ascending: false });

    // 5. Fetch student spotlights
    const { data: spotlights } = await supabase
      .from('exam_student_spotlights')
      .select('*')
      .order('created_at', { ascending: true });

    // 6. Fetch grade distributions
    const { data: gradeDistributions } = await supabase
      .from('exam_grade_distributions')
      .select('*')
      .order('grade_name', { ascending: true });

    // 7. Fetch student details
    const { data: studentDetails } = await supabase
      .from('exam_student_details')
      .select('*')
      .order('created_at', { ascending: true });

    // 8. Fetch subject results
    const { data: subjectResults } = await supabase
      .from('exam_subject_results')
      .select('*')
      .order('created_at', { ascending: true });

    // 9. Fetch subject averages
    const { data: subjectAverages } = await supabase
      .from('exam_subject_averages')
      .select('*')
      .order('created_at', { ascending: true });

    // 10. Fetch class x gender drill-down matrix
    const { data: classGenderMatrix } = await supabase
      .from('exam_class_gender_counts')
      .select('*')
      .order('class_arm', { ascending: true });

    // Summary KPIs
    const activeExams = sessions?.filter(s => s.status === 'Ongoing' || s.status === 'Timetabled' || s.status === 'Upcoming') || [];
    const completedExams = sessions?.filter(s => s.status === 'Completed' || s.status === 'Published' || s.status === 'Approved') || [];
    const pendingModerations = approvals?.filter(a => !a.hod_approved) || [];
    const pendingApprovals = approvals?.filter(a => a.hod_approved && !a.principal_approved) || [];

    // Map spotlights to frontend props if database returned records
    const formattedSpotlights = spotlights?.map(s => ({
      category: s.category,
      score: s.score,
      name: s.name,
      grade: s.grade,
      gpa: Number(s.gpa),
      secondaryMetricLabel: s.secondary_metric_label,
      secondaryMetricValue: s.secondary_metric_value,
      avatarEmoji: s.avatar_emoji,
      avatarBg: s.avatar_bg,
      badgeColor: s.badge_color,
    }));

    // Map grade distribution to frontend props including categoryType
    const formattedGradeDist = gradeDistributions?.map(g => ({
      name: g.grade_name,
      percentage: Number(g.percentage),
      count: g.student_count,
      color: g.color,
      categoryType: g.category_type || 'grade',
    }));

    // Map class x gender matrix
    const formattedClassGenderMatrix = classGenderMatrix?.map(c => ({
      classArm: c.class_arm,
      level: c.level,
      stream: c.stream,
      totalStudents: c.total_students,
      maleCount: c.male_count,
      femaleCount: c.female_count,
      malePercentage: Number(c.male_percentage),
      femalePercentage: Number(c.female_percentage),
    }));

    // Map student details
    const formattedStudentDetails = studentDetails?.map(sd => ({
      id: sd.id,
      name: sd.name,
      gender: sd.gender,
      avatarEmoji: sd.avatar_emoji,
      marks: sd.marks,
      gpa: Number(sd.gpa),
      attendance: sd.attendance,
      grade: sd.grade,
      level: sd.level || 'SSS 1',
      stream: sd.stream || 'Science',
      classArm: sd.class_arm || 'SSS 1 Science',
      rank: sd.rank || 1,
      avatarBg: sd.avatar_bg,
    }));

    // Map subject results
    const formattedSubjectResults = subjectResults?.map(sr => ({
      subject: sr.subject,
      Pass: sr.pass_count,
      Average: sr.average_count,
      Fail: sr.fail_count,
      highlightBadge: sr.highlight_badge,
    }));

    // Map subject averages
    const formattedSubjectAverages = subjectAverages?.map(sa => ({
      subject: sa.subject,
      score: Number(sa.score),
      color: sa.color,
      gradientFrom: sa.gradient_from,
      gradientTo: sa.gradient_to,
    }));

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
        spotlights: formattedSpotlights || [],
        gradeDistribution: formattedGradeDist || [],
        classGenderMatrix: formattedClassGenderMatrix || [],
        studentDetails: formattedStudentDetails || [],
        subjectResults: formattedSubjectResults || [],
        subjectAverages: formattedSubjectAverages || [],
        approvals: approvals || [],
        malpractices: malpractices || [],
        appeals: appeals || [],
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, academic_year, term, type, mode, weightage, start_date, end_date, status, classes_count, candidates_count } = body;

    const parseDate = (d: string | null | undefined, fallbackDays: number) => {
      if (d && typeof d === 'string' && d.trim() !== '') {
        const dateObj = new Date(d);
        if (!isNaN(dateObj.getTime())) return dateObj.toISOString();
      }
      return new Date(Date.now() + fallbackDays * 86400000).toISOString();
    };

    const { data: newSession, error } = await supabase
      .from('exam_sessions')
      .insert({
        name,
        academic_year: academic_year || '2025-26',
        term: term || '3rd Term',
        type: type || 'EXAM',
        mode: mode || 'ONLINE',
        weightage: weightage || '-',
        start_date: parseDate(start_date, 0),
        end_date: parseDate(end_date, 14),
        status: status || 'Upcoming',
        classes_count: Number(classes_count) || 12,
        candidates_count: Number(candidates_count) || 1248,
      })
      .select()
      .single();

    if (error) {
      console.error('Database POST Insert Error:', error);
      throw error;
    }

    return NextResponse.json({ success: true, data: newSession });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('POST Handler Catch Error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, approved_by, name, mark_deadline, clearance_required } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Session ID is required' }, { status: 400 });
    }

    const updatePayload: Record<string, string | boolean | undefined> = { updated_at: new Date().toISOString() };
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Session ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('exam_sessions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
