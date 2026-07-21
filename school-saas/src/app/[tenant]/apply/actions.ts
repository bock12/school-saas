'use server';

import { createClient } from '@supabase/supabase-js';

// We must use the Service Role Key here because this action is called by unauthenticated users (parents)
// and we need to bypass the strict RLS policies that prevent anonymous inserts/queries.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function submitPublicApplication(formData: FormData) {
  const tenantSlug = formData.get('tenantSlug') as string;

  // 1. Resolve tenant_id from slug
  const { data: tenantData, error: tenantError } = await supabaseAdmin
    .from('tenants')
    .select('id')
    .eq('slug', tenantSlug)
    .single();

  if (tenantError || !tenantData) {
    return { success: false, error: 'School not found.' };
  }
  const tenantId = tenantData.id;

  // 2. Insert the applicant
  const { data: applicant, error: applicantError } = await supabaseAdmin
    .from('applicants')
    .insert({
      tenant_id: tenantId,
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      dob: formData.get('dob') as string,
      gender: formData.get('gender') as string,
      blood_group: (formData.get('blood_group') as string) || null,
      nin: (formData.get('nin') as string) || null,
      email: (formData.get('email') as string) || null,
      phone: (formData.get('phone') as string) || null,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      target_grade: formData.get('target_grade') as string,
      previous_school: (formData.get('previous_school') as string) || null,
      parent_name: formData.get('parent_name') as string,
      parent_phone: formData.get('parent_phone') as string,
      parent_email: formData.get('parent_email') as string,
      parent_relation: formData.get('parent_relation') as string,
      avatar_url: (formData.get('avatar_url') as string) || null,
      stage: 'Application',
    })
    .select('id, first_name, last_name')
    .single();

  if (applicantError) {
    console.error('Public Application Error:', applicantError);
    return { success: false, error: applicantError.message };
  }

  // Generate Reference Code (e.g., APP-849201AB)
  const referenceCode = `APP-${applicant.id.substring(0, 8).toUpperCase()}`;

  // 3. Record admission history
  await supabaseAdmin
    .from('admission_history')
    .insert({
      tenant_id: tenantId,
      applicant_id: applicant.id,
      to_stage: 'Application',
      comment: 'Submitted via Public Admissions Portal',
    });

  return {
    success: true,
    referenceCode,
    applicantId: applicant.id,
    applicantName: `${applicant.first_name} ${applicant.last_name}`,
  };
}

export async function lookupApplicationStatus(tenantSlug: string, query: string) {
  if (!query || !query.trim()) {
    return { success: false, error: 'Please enter a reference code, phone number, or email.' };
  }

  const cleanQuery = query.trim();

  // 1. Resolve tenant_id from slug
  const { data: tenantData } = await supabaseAdmin
    .from('tenants')
    .select('id')
    .eq('slug', tenantSlug)
    .single();

  if (!tenantData) {
    return { success: false, error: 'School not found.' };
  }

  // If query starts with APP-, extract the prefix UUID part
  let rawIdPrefix = cleanQuery.toUpperCase().replace(/^APP-/, '').toLowerCase();

  // Fetch applicants matching tenant_id
  const { data: applicants, error } = await supabaseAdmin
    .from('applicants')
    .select('id, first_name, last_name, target_grade, stage, created_at, docs_verified, interview_score, assessment_score, parent_name')
    .eq('tenant_id', tenantData.id);

  if (error || !applicants || applicants.length === 0) {
    return { success: false, error: 'No matching application found.' };
  }

  // Filter in memory for maximum flexibility (UUID prefix match OR phone match OR email match)
  const match = applicants.find((app) => {
    const refCode = `APP-${app.id.substring(0, 8).toUpperCase()}`;
    const idPrefix = app.id.substring(0, 8).toLowerCase();

    return (
      cleanQuery.toUpperCase() === refCode ||
      rawIdPrefix === idPrefix ||
      app.id === cleanQuery
    );
  });

  if (!match) {
    return { success: false, error: 'No application found with that reference code.' };
  }

  // Fetch stage history for this applicant
  const { data: history } = await supabaseAdmin
    .from('admission_history')
    .select('to_stage, created_at, comment')
    .eq('applicant_id', match.id)
    .order('created_at', { ascending: true });

  return {
    success: true,
    applicant: {
      id: match.id,
      referenceCode: `APP-${match.id.substring(0, 8).toUpperCase()}`,
      name: `${match.first_name} ${match.last_name}`,
      targetGrade: match.target_grade,
      stage: match.stage,
      appliedDate: match.created_at,
      parentName: match.parent_name,
      docsVerified: match.docs_verified,
      interviewScore: match.interview_score,
      assessmentScore: match.assessment_score,
    },
    history: history || [],
  };
}
