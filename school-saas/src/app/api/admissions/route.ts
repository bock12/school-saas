import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const supabase = createAdminClient();

type BeceSubjectResult = { subject: string; grade: string; points: number };

const CREDIT_GRADES = new Set(['A1', 'B2', 'B3', 'C4', 'C5', 'C6']);
const PASS_GRADES   = new Set(['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8']);

function allocateStream(beceSubjects: BeceSubjectResult[]): string | null {
  if (!beceSubjects || beceSubjects.length === 0) return null;
  const gradeMap: Record<string, string> = {};
  for (const s of beceSubjects) {
    gradeMap[s.subject] = s.grade;
  }
  const hasCredit = (subject: string) => CREDIT_GRADES.has(gradeMap[subject] ?? 'F9');
  const hasPass   = (subject: string) => PASS_GRADES.has(gradeMap[subject] ?? 'F9');
  if (hasCredit('Mathematics') && hasCredit('Integrated Science')) return 'Science';
  if (hasCredit('English Language') && hasCredit('Social Studies'))  return 'Arts';
  if (hasCredit('Mathematics') && hasCredit('English Language'))     return 'Commercial';
  if (hasPass('Mathematics'))                                         return 'Technical';
  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantSlug  = searchParams.get('tenantSlug');
  const schoolLevel = searchParams.get('schoolLevel');
  const stream      = searchParams.get('stream');
  const stage       = searchParams.get('stage');
  const search      = searchParams.get('search');
  const page        = parseInt(searchParams.get('page') ?? '1', 10);
  const limit       = parseInt(searchParams.get('limit') ?? '20', 10);
  const offset      = (page - 1) * limit;

  try {
    let tenantId: string | undefined;
    if (tenantSlug) {
      const { data: tenant } = await supabase
        .from('tenants').select('id').eq('slug', tenantSlug).single();
      tenantId = tenant?.id;
    }

    let query = supabase
      .from('applicants')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (tenantId)    query = query.eq('tenant_id', tenantId);
    if (schoolLevel) query = query.eq('school_level', schoolLevel);
    if (stream)      query = query.eq('target_stream', stream);
    if (stage)       query = query.eq('stage', stage);
    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,national_index_no.ilike.%${search}%`
      );
    }

    const { data: applicants, count, error } = await query;
    if (error) throw error;

    const { data: gradeScale } = await supabase.from('sl_waec_grade_scale').select('*').order('sort_order');
    const { data: schoolLevels } = await supabase.from('sl_school_levels').select('*').order('sort_order');
    const { data: nationalExams } = await supabase.from('sl_national_exams').select('*');
    const { data: streamRules } = await supabase.from('sl_stream_rules').select('*');
    const { data: cassConfig } = await supabase.from('sl_cass_config').select('*').is('tenant_id', null);

    const { data: stageStats } = await supabase.from('applicants').select('stage').eq('tenant_id', tenantId ?? '');
    const statsByStage = (stageStats ?? []).reduce<Record<string, number>>((acc, r) => {
      acc[r.stage] = (acc[r.stage] ?? 0) + 1;
      return acc;
    }, {});

    const { data: streamStats } = await supabase.from('applicants').select('target_stream').eq('tenant_id', tenantId ?? '').eq('school_level', 'SSS');
    const statsByStream = (streamStats ?? []).reduce<Record<string, number>>((acc, r) => {
      const s = r.target_stream ?? 'Unassigned';
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    }, {});

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
  } catch (err) {
    console.error('[Admissions GET]', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch admissions data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tenantSlug, firstName, lastName, dob, gender, email, phone, address, city,
      schoolLevel, targetGrade, previousSchool, nationalIndexNo,
      parentName, parentPhone, parentEmail, parentRelation,
      npseAggregate, beceAggregate, beceSubjects, wassceCredits, wassceSubjects, preferredStream,
    } = body;

    if (!tenantSlug || !firstName || !lastName || !dob || !schoolLevel) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: tenantSlug, firstName, lastName, dob, schoolLevel' },
        { status: 400 }
      );
    }

    const { data: tenant, error: tenantErr } = await supabase.from('tenants').select('id').eq('slug', tenantSlug).single();
    if (tenantErr || !tenant) {
      return NextResponse.json({ success: false, error: 'Tenant not found' }, { status: 404 });
    }

    let targetStream: string | null = preferredStream ?? null;
    let streamAutoPlaced = false;

    if (schoolLevel === 'SSS' && beceSubjects && beceSubjects.length > 0 && !preferredStream) {
      const autoStream = allocateStream(beceSubjects as BeceSubjectResult[]);
      if (autoStream) {
        targetStream = autoStream;
        streamAutoPlaced = true;
      }
    }

    const { data: applicant, error } = await supabase
      .from('applicants')
      .insert({
        tenant_id: tenant.id,
        first_name: firstName, last_name: lastName, dob, gender: gender ?? null,
        email: email ?? null, phone: phone ?? null,
        address: address ?? '', city: city ?? '',
        target_grade: targetGrade ?? schoolLevel,
        previous_school: previousSchool ?? null,
        national_index_no: nationalIndexNo ?? null,
        parent_name: parentName ?? '', parent_phone: parentPhone ?? '',
        parent_email: parentEmail ?? '', parent_relation: parentRelation ?? '',
        school_level: schoolLevel, target_stream: targetStream,
        npse_aggregate: npseAggregate ?? null, bece_aggregate: beceAggregate ?? null,
        bece_subjects: beceSubjects ? JSON.stringify(beceSubjects) : null,
        wassce_credits: wassceCredits ?? null,
        wassce_subjects: wassceSubjects ? JSON.stringify(wassceSubjects) : null,
        stream_auto_placed: streamAutoPlaced,
        stream_placed_at: streamAutoPlaced ? new Date().toISOString() : null,
        stage: 'Application',
      })
      .select().single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: { applicant, streamAutoPlaced, allocatedStream: targetStream },
      message: streamAutoPlaced
        ? `Applicant created and automatically placed into the ${targetStream} stream based on BECE results.`
        : 'Applicant created successfully.',
    });
  } catch (err) {
    console.error('[Admissions POST]', err);
    return NextResponse.json({ success: false, error: 'Failed to create applicant' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Applicant id is required' }, { status: 400 });
    }

    const dbFields: Record<string, unknown> = {};
    const fieldMap: Record<string, string> = {
      firstName: 'first_name', lastName: 'last_name', dob: 'dob', gender: 'gender',
      email: 'email', phone: 'phone', address: 'address', city: 'city',
      schoolLevel: 'school_level', targetGrade: 'target_grade', stage: 'stage',
      targetStream: 'target_stream', npseAggregate: 'npse_aggregate',
      beceAggregate: 'bece_aggregate', beceSubjects: 'bece_subjects',
      wassceCredits: 'wassce_credits', wassceSubjects: 'wassce_subjects',
      streamAutoPlaced: 'stream_auto_placed', streamPlacedAt: 'stream_placed_at',
      admissionLetterSent: 'admission_letter_sent', admissionLetterSentAt: 'admission_letter_sent_at',
    };

    for (const [k, v] of Object.entries(updates)) {
      const dbKey = fieldMap[k] ?? k;
      dbFields[dbKey] = v;
    }

    if (dbFields['target_stream'] !== undefined) {
      dbFields['stream_auto_placed'] = false;
      dbFields['stream_placed_at']   = new Date().toISOString();
    }

    const { data: applicant, error } = await supabase.from('applicants').update(dbFields).eq('id', id).select().single();
    if (error) throw error;

    return NextResponse.json({ success: true, data: { applicant } });
  } catch (err) {
    console.error('[Admissions PATCH]', err);
    return NextResponse.json({ success: false, error: 'Failed to update applicant' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ success: false, error: 'Applicant id is required' }, { status: 400 });
  }
  try {
    const { error } = await supabase.from('applicants').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true, message: 'Applicant deleted.' });
  } catch (err) {
    console.error('[Admissions DELETE]', err);
    return NextResponse.json({ success: false, error: 'Failed to delete applicant' }, { status: 500 });
  }
}
