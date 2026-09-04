import { NextRequest, NextResponse } from 'next/server';
import { authorizeApiRequest, apiError } from '@/lib/auth/api-guard';

type BeceSubjectResult = { subject: string; grade: string; points: number };

const CREDIT_GRADES = new Set(['A1', 'B2', 'B3', 'C4', 'C5', 'C6']);
const PASS_GRADES = new Set(['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8']);

function allocateStream(beceSubjects: BeceSubjectResult[]): string | null {
  if (!beceSubjects || beceSubjects.length === 0) return null;
  const gradeMap: Record<string, string> = {};
  for (const s of beceSubjects) {
    gradeMap[s.subject] = s.grade;
  }
  const hasCredit = (subject: string) => CREDIT_GRADES.has(gradeMap[subject] ?? 'F9');
  const hasPass = (subject: string) => PASS_GRADES.has(gradeMap[subject] ?? 'F9');
  if (hasCredit('Mathematics') && hasCredit('Integrated Science')) return 'Science';
  if (hasCredit('English Language') && hasCredit('Social Studies')) return 'Arts';
  if (hasCredit('Mathematics') && hasCredit('English Language')) return 'Commercial';
  if (hasPass('Mathematics')) return 'Technical';
  return null;
}

// GET: List applicants and admission statistics for authorized tenant
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedTenantSlug =
      searchParams.get('tenantSlug') || searchParams.get('tenant') || undefined;
    const schoolLevel = searchParams.get('schoolLevel');
    const stream = searchParams.get('stream');
    const stage = searchParams.get('stage');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = parseInt(searchParams.get('limit') ?? '20', 10);
    const offset = (page - 1) * limit;

    const auth = await authorizeApiRequest(req, {
      roles: ['school_admin', 'exam_officer', 'org_admin', 'super_admin'],
      scope: 'tenant',
      requestedTenantSlug,
    });

    if (!auth.ok) {
      return auth.response;
    }

    const adminClient = auth.adminClient();
    const tenantId = auth.tenantId!;

    let query = adminClient
      .from('applicants')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (schoolLevel) query = query.eq('school_level', schoolLevel);
    if (stream) query = query.eq('target_stream', stream);
    if (stage) query = query.eq('stage', stage);
    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,national_index_no.ilike.%${search}%`
      );
    }

    const { data: applicants, count, error } = await query;
    if (error) throw error;

    const { data: gradeScale } = await adminClient
      .from('sl_waec_grade_scale')
      .select('*')
      .order('sort_order');
    const { data: schoolLevels } = await adminClient
      .from('sl_school_levels')
      .select('*')
      .order('sort_order');
    const { data: nationalExams } = await adminClient
      .from('sl_national_exams')
      .select('*');
    const { data: streamRules } = await adminClient
      .from('sl_stream_rules')
      .select('*');
    const { data: cassConfig } = await adminClient
      .from('sl_cass_config')
      .select('*')
      .is('tenant_id', null);

    const { data: stageStats } = await adminClient
      .from('applicants')
      .select('stage')
      .eq('tenant_id', tenantId);

    const statsByStage = ((stageStats as any[]) ?? []).reduce((acc: Record<string, number>, r: any) => {
      acc[r.stage] = (acc[r.stage] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const { data: streamStats } = await adminClient
      .from('applicants')
      .select('target_stream')
      .eq('tenant_id', tenantId)
      .eq('school_level', 'SSS');

    const statsByStream = ((streamStats as any[]) ?? []).reduce((acc: Record<string, number>, r: any) => {
      const s = r.target_stream ?? 'Unassigned';
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      success: true,
      data: {
        applicants: applicants ?? [],
        total: count ?? 0,
        page,
        limit,
        referenceData: {
          gradeScale: gradeScale ?? [],
          schoolLevels: schoolLevels ?? [],
          nationalExams: nationalExams ?? [],
          streamRules: streamRules ?? [],
          cassConfig: cassConfig ?? [],
        },
        stats: { byStage: statsByStage, byStream: statsByStream },
      },
    });
  } catch (err: any) {
    console.error('[Admissions GET]', err);
    return apiError(err.message || 'Failed to fetch admissions data', 'INTERNAL_ERROR', 500);
  }
}

// POST: Create a new applicant record bound strictly to authorized tenant
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      tenantSlug,
      firstName,
      lastName,
      dob,
      gender,
      email,
      phone,
      address,
      city,
      schoolLevel,
      targetGrade,
      previousSchool,
      nationalIndexNo,
      parentName,
      parentPhone,
      parentEmail,
      parentRelation,
      npseAggregate,
      beceAggregate,
      beceSubjects,
      wassceCredits,
      wassceSubjects,
      preferredStream,
    } = body;

    if (!firstName || !lastName || !dob || !schoolLevel) {
      return apiError(
        'Missing required fields: firstName, lastName, dob, schoolLevel',
        'INVALID_REQUEST',
        400
      );
    }

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

    let targetStream: string | null = preferredStream ?? null;
    let streamAutoPlaced = false;

    if (schoolLevel === 'SSS' && beceSubjects && beceSubjects.length > 0 && !preferredStream) {
      const autoStream = allocateStream(beceSubjects as BeceSubjectResult[]);
      if (autoStream) {
        targetStream = autoStream;
        streamAutoPlaced = true;
      }
    }

    // Force tenant_id to authorized tenant (untrusted body.tenant_id is ignored)
    const { data: applicant, error } = await adminClient
      .from('applicants')
      .insert({
        tenant_id: tenantId,
        first_name: firstName,
        last_name: lastName,
        dob,
        gender: gender ?? null,
        email: email ?? null,
        phone: phone ?? null,
        address: address ?? '',
        city: city ?? '',
        target_grade: targetGrade ?? schoolLevel,
        previous_school: previousSchool ?? null,
        national_index_no: nationalIndexNo ?? null,
        parent_name: parentName ?? '',
        parent_phone: parentPhone ?? '',
        parent_email: parentEmail ?? '',
        parent_relation: parentRelation ?? '',
        school_level: schoolLevel,
        target_stream: targetStream,
        npse_aggregate: npseAggregate ?? null,
        bece_aggregate: beceAggregate ?? null,
        bece_subjects: beceSubjects ? JSON.stringify(beceSubjects) : null,
        wassce_credits: wassceCredits ?? null,
        wassce_subjects: wassceSubjects ? JSON.stringify(wassceSubjects) : null,
        stream_auto_placed: streamAutoPlaced,
        stream_placed_at: streamAutoPlaced ? new Date().toISOString() : null,
        stage: 'Application',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: { applicant, streamAutoPlaced, allocatedStream: targetStream },
      message: streamAutoPlaced
        ? `Applicant created and automatically placed into the ${targetStream} stream based on BECE results.`
        : 'Applicant created successfully.',
    });
  } catch (err: any) {
    console.error('[Admissions POST]', err);
    return apiError(err.message || 'Failed to create applicant', 'INTERNAL_ERROR', 500);
  }
}

// PATCH: Update applicant status, stream, or details with resource-level IDOR check
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id, ...updates } = body;

    if (!id || typeof id !== 'string') {
      return apiError('Applicant ID is required', 'INVALID_REQUEST', 400);
    }

    const { searchParams } = new URL(req.url);
    const requestedTenantSlug =
      searchParams.get('tenantSlug') || searchParams.get('tenant') || body.tenantSlug || undefined;

    const auth = await authorizeApiRequest(req, {
      roles: ['school_admin', 'exam_officer', 'org_admin', 'super_admin'],
      scope: 'tenant',
      requestedTenantSlug,
      resource: {
        table: 'applicants',
        id,
        tenantColumn: 'tenant_id',
      },
    });

    if (!auth.ok) {
      return auth.response;
    }

    const adminClient = auth.adminClient();
    const tenantId = auth.tenantId!;

    // Sanitize updates: strictly disallow modifying tenant_id or id
    delete updates.tenant_id;
    delete updates.tenantId;
    delete updates.tenantSlug;
    delete updates.id;

    const dbFields: Record<string, unknown> = {};
    const fieldMap: Record<string, string> = {
      firstName: 'first_name',
      lastName: 'last_name',
      dob: 'dob',
      gender: 'gender',
      email: 'email',
      phone: 'phone',
      address: 'address',
      city: 'city',
      schoolLevel: 'school_level',
      targetGrade: 'target_grade',
      stage: 'stage',
      targetStream: 'target_stream',
      npseAggregate: 'npse_aggregate',
      beceAggregate: 'bece_aggregate',
      beceSubjects: 'bece_subjects',
      wassceCredits: 'wassce_credits',
      wassceSubjects: 'wassce_subjects',
      streamAutoPlaced: 'stream_auto_placed',
      streamPlacedAt: 'stream_placed_at',
      admissionLetterSent: 'admission_letter_sent',
      admissionLetterSentAt: 'admission_letter_sent_at',
    };

    for (const [k, v] of Object.entries(updates)) {
      const dbKey = fieldMap[k] ?? k;
      dbFields[dbKey] = v;
    }

    if (dbFields['target_stream'] !== undefined) {
      dbFields['stream_auto_placed'] = false;
      dbFields['stream_placed_at'] = new Date().toISOString();
    }

    const { data: applicant, error } = await adminClient
      .from('applicants')
      .update(dbFields)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: { applicant } });
  } catch (err: any) {
    console.error('[Admissions PATCH]', err);
    return apiError(err.message || 'Failed to update applicant', 'INTERNAL_ERROR', 500);
  }
}

// DELETE: Delete applicant record (restricted strictly to administrators; exam officers excluded)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || typeof id !== 'string') {
      return apiError('Applicant ID is required', 'INVALID_REQUEST', 400);
    }

    const requestedTenantSlug =
      searchParams.get('tenantSlug') || searchParams.get('tenant') || undefined;

    const auth = await authorizeApiRequest(req, {
      roles: ['school_admin', 'org_admin', 'super_admin'],
      scope: 'tenant',
      requestedTenantSlug,
      resource: {
        table: 'applicants',
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
      .from('applicants')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Applicant deleted successfully.' });
  } catch (err: any) {
    console.error('[Admissions DELETE]', err);
    return apiError(err.message || 'Failed to delete applicant', 'INTERNAL_ERROR', 500);
  }
}
