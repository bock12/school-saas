import { NextRequest, NextResponse } from 'next/server';
import { authorizeApiRequest, apiError } from '@/lib/auth/api-guard';

// GET: Fetch active examination overview and strictly tenant-isolated analytics
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedTenantSlug =
      searchParams.get('tenantSlug') || searchParams.get('tenant') || undefined;

    const auth = await authorizeApiRequest(req, {
      roles: ['exam_officer', 'school_admin', 'org_admin', 'super_admin'],
      scope: 'tenant',
      requestedTenantSlug,
    });

    if (!auth.ok) {
      return auth.response;
    }

    const adminClient = auth.adminClient();
    const tenantId = auth.tenantId!;

    // Execute all 10 dashboard queries strictly constrained to authorized tenant
    const [
      { data: sessions, error: sessionsError },
      { data: approvals, error: approvalsError },
      { data: malpractices, error: malpracticesError },
      { data: appeals, error: appealsError },
      { data: spotlights, error: spotlightsError },
      { data: gradeDistributions, error: gradeDistributionsError },
      { data: studentDetails, error: studentDetailsError },
      { data: subjectResults, error: subjectResultsError },
      { data: subjectAverages, error: subjectAveragesError },
      { data: classGenderMatrix, error: classGenderMatrixError },
    ] = await Promise.all([
      adminClient
        .from('exam_sessions')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false }),
      adminClient
        .from('exam_results_approval')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('submitted_at', { ascending: false }),
      adminClient
        .from('exam_malpractices')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('reported_at', { ascending: false }),
      adminClient
        .from('exam_appeals')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false }),
      adminClient
        .from('exam_student_spotlights')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: true }),
      adminClient
        .from('exam_grade_distributions')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('grade_name', { ascending: true }),
      adminClient
        .from('exam_student_details')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: true }),
      adminClient
        .from('exam_subject_results')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: true }),
      adminClient
        .from('exam_subject_averages')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: true }),
      adminClient
        .from('exam_class_gender_counts')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('class_arm', { ascending: true }),
    ]);

    const queryError =
      sessionsError ||
      approvalsError ||
      malpracticesError ||
      appealsError ||
      spotlightsError ||
      gradeDistributionsError ||
      studentDetailsError ||
      subjectResultsError ||
      subjectAveragesError ||
      classGenderMatrixError;

    if (queryError) {
      console.error('[Exam Office Dashboard] Database query failure:', queryError);
      return apiError('Failed to fetch dashboard metrics due to database query error', 'DATABASE_ERROR', 500);
    }

    // Summary KPIs
    const activeExams =
      sessions?.filter(
        (s: any) => s.status === 'Ongoing' || s.status === 'Timetabled' || s.status === 'Upcoming'
      ) || [];
    const completedExams =
      sessions?.filter(
        (s: any) =>
          s.status === 'Completed' ||
          s.status === 'Published' ||
          s.status === 'Approved'
      ) || [];
    const pendingModerations = approvals?.filter((a: any) => !a.hod_approved) || [];
    const pendingApprovals = approvals?.filter((a: any) => a.hod_approved && !a.principal_approved) || [];

    // Map spotlights
    const formattedSpotlights = spotlights?.map((s: any) => ({
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

    // Map grade distributions
    const formattedGradeDist = gradeDistributions?.map((g: any) => ({
      name: g.grade_name,
      percentage: Number(g.percentage),
      count: g.student_count,
      color: g.color,
      categoryType: g.category_type || 'grade',
    }));

    // Map class x gender matrix
    const formattedClassGenderMatrix = classGenderMatrix?.map((c: any) => ({
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
    const formattedStudentDetails = studentDetails?.map((sd: any) => ({
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
    const formattedSubjectResults = subjectResults?.map((sr: any) => ({
      subject: sr.subject,
      Pass: sr.pass_count,
      Average: sr.average_count,
      Fail: sr.fail_count,
      highlightBadge: sr.highlight_badge,
    }));

    // Map subject averages
    const formattedSubjectAverages = subjectAverages?.map((sa: any) => ({
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
    return apiError(message, 'INTERNAL_ERROR', 500);
  }
}

// POST: Create a new exam session strictly bound to authorized tenant
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      tenantSlug,
      name,
      academic_year,
      term,
      type,
      mode,
      weightage,
      start_date,
      end_date,
      status,
      classes_count,
      candidates_count,
    } = body;

    const auth = await authorizeApiRequest(req, {
      roles: ['school_admin', 'exam_officer', 'org_admin', 'super_admin'],
      scope: 'tenant',
      requestedTenantSlug: tenantSlug || undefined,
    });

    if (!auth.ok) {
      return auth.response;
    }

    const adminClient = auth.adminClient();
    const tenantId = auth.tenantId!;

    const parseDate = (d: string | null | undefined, fallbackDays: number) => {
      if (d && typeof d === 'string' && d.trim() !== '') {
        const dateObj = new Date(d);
        if (!isNaN(dateObj.getTime())) return dateObj.toISOString();
      }
      return new Date(Date.now() + fallbackDays * 86400000).toISOString();
    };

    const { data: newSession, error } = await adminClient
      .from('exam_sessions')
      .insert({
        tenant_id: tenantId,
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

    if (error) throw error;

    return NextResponse.json({ success: true, data: newSession });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return apiError(message, 'INTERNAL_ERROR', 500);
  }
}

// PATCH: Update exam session with resource-level IDOR check
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id, status, approved_by, name, mark_deadline, clearance_required, tenantSlug } = body;

    if (!id || typeof id !== 'string') {
      return apiError('Session ID is required', 'INVALID_REQUEST', 400);
    }

    const { searchParams } = new URL(req.url);
    const requestedTenantSlug =
      searchParams.get('tenantSlug') || searchParams.get('tenant') || tenantSlug || undefined;

    const auth = await authorizeApiRequest(req, {
      roles: ['school_admin', 'exam_officer', 'org_admin', 'super_admin'],
      scope: 'tenant',
      requestedTenantSlug,
      resource: {
        table: 'exam_sessions',
        id,
        tenantColumn: 'tenant_id',
      },
    });

    if (!auth.ok) {
      return auth.response;
    }

    const adminClient = auth.adminClient();
    const tenantId = auth.tenantId!;

    const updatePayload: Record<string, string | boolean | undefined> = {
      updated_at: new Date().toISOString(),
    };
    if (status) updatePayload.status = status;
    if (name) updatePayload.name = name;
    if (mark_deadline !== undefined) updatePayload.mark_deadline = mark_deadline;
    if (clearance_required !== undefined) updatePayload.clearance_required = clearance_required;
    if (approved_by) {
      updatePayload.approved_by = approved_by;
      updatePayload.approved_at = new Date().toISOString();
    }

    const { data: updated, error } = await adminClient
      .from('exam_sessions')
      .update(updatePayload)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return apiError(message, 'INTERNAL_ERROR', 500);
  }
}

// DELETE: Delete exam session (restricted strictly to administrators; exam officers excluded)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || typeof id !== 'string') {
      return apiError('Session ID is required', 'INVALID_REQUEST', 400);
    }

    const requestedTenantSlug =
      searchParams.get('tenantSlug') || searchParams.get('tenant') || undefined;

    const auth = await authorizeApiRequest(req, {
      roles: ['school_admin', 'org_admin', 'super_admin'],
      scope: 'tenant',
      requestedTenantSlug,
      resource: {
        table: 'exam_sessions',
        id,
        tenantColumn: 'tenant_id',
      },
    });

    if (!auth.ok) {
      return auth.response;
    }

    const adminClient = auth.adminClient();
    const tenantId = auth.tenantId!;

    const { error } = await adminClient
      .from('exam_sessions')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Session deleted successfully.' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return apiError(message, 'INTERNAL_ERROR', 500);
  }
}
