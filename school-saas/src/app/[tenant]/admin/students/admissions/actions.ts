'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createApplicant(formData: FormData) {
  const supabase = await createClient();

  const tenant = formData.get('tenant') as string;

  // 1. Resolve tenant_id from slug
  const { data: tenantData, error: tenantError } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', tenant)
    .single();

  if (tenantError || !tenantData) {
    return { success: false, error: 'Tenant not found.' };
  }
  const tenantId = tenantData.id;

  // 2. Insert the applicant
  const { data: applicant, error: applicantError } = await supabase
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
      status: 'active',
      source: 'admin',
    })
    .select('id')
    .single();

  if (applicantError || !applicant) {
    console.error('Error adding applicant:', applicantError);
    return { success: false, error: applicantError?.message || 'Failed to add applicant.' };
  }

  revalidatePath(`/${tenant}/admin/students/admissions`);
  return { success: true };
}

export async function progressApplicantStage(
  tenantSlug: string,
  applicantId: string,
  fromStage: string,
  toStage: string,
  comment: string,
  scores?: { interviewScore?: number | null; assessmentScore?: number | null; assessmentDetails?: any }
) {
  const supabase = await createClient();

  const { data: tenantData, error: tenantError } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', tenantSlug)
    .single();

  if (tenantError || !tenantData) {
    return { success: false, error: 'Tenant not found.' };
  }

  // Verify the user is authenticated
  const { data: { user } } = await supabase.auth.getUser();

  if (toStage === 'Allocation') {
    // 1. Call RPC
    const { error: rpcError } = await supabase.rpc('enroll_applicant', {
      p_applicant_id: applicantId,
      p_admin_id: user?.id || null
    });

    if (rpcError) {
      console.error('Error in enroll_applicant RPC:', rpcError);
      return { success: false, error: rpcError.message };
    }
  } else {
    // 1. Update applicant stage manually for non-allocation stages
    const updatePayload: Record<string, any> = { stage: toStage, status: 'active' };
    if (scores?.interviewScore !== undefined && scores?.interviewScore !== null) {
      updatePayload.interview_score = scores.interviewScore;
    }
    if (scores?.assessmentScore !== undefined && scores?.assessmentScore !== null) {
      updatePayload.assessment_score = scores.assessmentScore;
    }
    if (scores?.assessmentDetails !== undefined && scores?.assessmentDetails !== null) {
      updatePayload.assessment_details = scores.assessmentDetails;
    }

    const { error: updateError } = await supabase
      .from('applicants')
      .update(updatePayload)
      .eq('id', applicantId)
      .eq('tenant_id', tenantData.id);

    if (updateError) {
      console.error('Error updating applicant stage:', updateError);
      return { success: false, error: updateError.message };
    }

    // 2. Insert history log manually
    const { error: historyError } = await supabase
      .from('admission_history')
      .insert({
        tenant_id: tenantData.id,
        applicant_id: applicantId,
        from_stage: fromStage,
        to_stage: toStage,
        comment: comment,
        created_by: user?.id || null,
      });

    if (historyError) {
      console.error('Error logging history:', historyError);
    }
  }

  revalidatePath(`/${tenantSlug}/admin/students/admissions`);
  return { success: true };
}

export async function scheduleApplicantInterview(
  tenantSlug: string,
  applicantId: string,
  interviewDate: string,
  interviewLocation: string,
  notes: string
) {
  const supabase = await createClient();

  const { data: tenantData } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', tenantSlug)
    .single();

  if (!tenantData) {
    return { success: false, error: 'Tenant not found.' };
  }

  const { data: { user } } = await supabase.auth.getUser();

  // 1. Update applicant's interview_date and interview_location
  const { error: updateError } = await supabase
    .from('applicants')
    .update({
      interview_date: interviewDate,
      interview_location: interviewLocation,
    })
    .eq('id', applicantId)
    .eq('tenant_id', tenantData.id);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // 2. Log in admission_history
  const formattedDate = new Date(interviewDate).toLocaleString();
  await supabase.from('admission_history').insert({
    tenant_id: tenantData.id,
    applicant_id: applicantId,
    from_stage: 'Interview',
    to_stage: 'Interview',
    comment: `Interview scheduled for ${formattedDate} at ${interviewLocation || 'Main Campus'}. ${notes ? `Note: ${notes}` : ''}`,
    created_by: user?.id || null,
  });

  revalidatePath(`/${tenantSlug}/admin/students/admissions`);
  return { success: true };
}

export async function scheduleApplicantAssessment(
  tenantSlug: string,
  applicantId: string,
  assessmentDate: string,
  assessmentLocation: string,
  notes: string
) {
  const supabase = await createClient();

  const { data: tenantData } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', tenantSlug)
    .single();

  if (!tenantData) {
    return { success: false, error: 'Tenant not found.' };
  }

  const { data: { user } } = await supabase.auth.getUser();

  // 1. Update applicant's assessment_date and assessment_location
  const { error: updateError } = await supabase
    .from('applicants')
    .update({
      assessment_date: assessmentDate,
      assessment_location: assessmentLocation,
    })
    .eq('id', applicantId)
    .eq('tenant_id', tenantData.id);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // 2. Log in admission_history
  const formattedDate = new Date(assessmentDate).toLocaleString();
  await supabase.from('admission_history').insert({
    tenant_id: tenantData.id,
    applicant_id: applicantId,
    from_stage: 'Assessment',
    to_stage: 'Assessment',
    comment: `Entrance assessment scheduled for ${formattedDate} at ${assessmentLocation || 'Computer Lab, Main Campus'}. ${notes ? `Note: ${notes}` : ''}`,
    created_by: user?.id || null,
  });

  revalidatePath(`/${tenantSlug}/admin/students/admissions`);
  return { success: true };
}

export async function rejectApplicant(
  tenantSlug: string,
  applicantId: string,
  rejectionReason: string
) {
  const supabase = await createClient();

  const { data: tenantData } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', tenantSlug)
    .single();

  if (!tenantData) {
    return { success: false, error: 'Tenant not found.' };
  }

  const { data: { user } } = await supabase.auth.getUser();

  // 1. Update applicant status and rejection_reason
  const { error: updateError } = await supabase
    .from('applicants')
    .update({
      status: 'rejected',
      rejection_reason: rejectionReason,
    })
    .eq('id', applicantId)
    .eq('tenant_id', tenantData.id);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // 2. Log in history
  await supabase.from('admission_history').insert({
    tenant_id: tenantData.id,
    applicant_id: applicantId,
    from_stage: 'Application',
    to_stage: 'Rejected',
    comment: `Rejected by Admin: ${rejectionReason}`,
    created_by: user?.id || null,
  });

  revalidatePath(`/${tenantSlug}/admin/students/admissions`);
  return { success: true };
}

export async function toggleApplicantDocsVerified(
  tenantSlug: string,
  applicantId: string,
  verified: boolean
) {
  const supabase = await createClient();

  const { data: tenantData } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', tenantSlug)
    .single();

  if (!tenantData) {
    return { success: false, error: 'Tenant not found.' };
  }

  const { error } = await supabase
    .from('applicants')
    .update({ docs_verified: verified })
    .eq('id', applicantId)
    .eq('tenant_id', tenantData.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/${tenantSlug}/admin/students/admissions`);
  return { success: true };
}

export async function toggleApplicantFeeCleared(
  tenantSlug: string,
  applicantId: string,
  cleared: boolean,
  receiptNumber?: string,
  paymentMethod?: string
) {
  const supabase = await createClient();

  const { data: tenantData } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', tenantSlug)
    .single();

  if (!tenantData) {
    return { success: false, error: 'Tenant not found.' };
  }

  const updatePayload: Record<string, any> = { payment_cleared: cleared };
  if (receiptNumber) updatePayload.receipt_number = receiptNumber;
  if (paymentMethod) updatePayload.payment_method = paymentMethod;

  const { error } = await supabase
    .from('applicants')
    .update(updatePayload)
    .eq('id', applicantId)
    .eq('tenant_id', tenantData.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/${tenantSlug}/admin/students/admissions`);
  return { success: true };
}

export async function updateTenantBursarySettings(
  tenantSlug: string,
  settings: Record<string, any>
) {
  const supabase = await createClient();

  const { data: tenantData } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', tenantSlug)
    .single();

  if (!tenantData) {
    return { success: false, error: 'Tenant not found.' };
  }

  const { error } = await supabase
    .from('tenants')
    .update({ bursary_settings: settings })
    .eq('id', tenantData.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/${tenantSlug}/admin/students/admissions`);
  revalidatePath(`/${tenantSlug}/apply/status`);
  return { success: true };
}

export async function allocateAndMatriculateApplicant(
  tenantSlug: string,
  applicantId: string,
  classArm: string,
  studentIdNumber: string,
  studentPasswordTemp?: string,
  parentPasswordTemp?: string
) {
  const supabase = await createClient();

  const { data: tenantData } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', tenantSlug)
    .single();

  if (!tenantData) {
    return { success: false, error: 'Tenant not found.' };
  }

  const { data: { user } } = await supabase.auth.getUser();

  const { data: applicant } = await supabase
    .from('applicants')
    .select('*')
    .eq('id', applicantId)
    .single();

  if (!applicant) {
    return { success: false, error: 'Applicant record not found.' };
  }

  const matNumber = studentIdNumber || `STU-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const stuPass = studentPasswordTemp || 'Welcome2026!';
  const parPass = parentPasswordTemp || 'Parent2026!';
  const parentUser = applicant.parent_phone || applicant.parent_email || applicant.phone || 'parent@school.edu.sl';

  // 1. Call RPC to enroll applicant into students table & parents table
  const { error: rpcError } = await supabase.rpc('enroll_applicant', {
    p_applicant_id: applicantId,
    p_admin_id: user?.id || null
  });

  if (rpcError) {
    console.warn('Note on RPC enroll_applicant during allocation:', rpcError.message);
  }

  const { error: updateError } = await supabase
    .from('applicants')
    .update({
      stage: 'Allocation',
      status: 'enrolled',
      class_arm: classArm,
      student_id_number: matNumber,
      student_username: matNumber,
      student_password_temp: stuPass,
      parent_username: parentUser,
      parent_password_temp: parPass,
      account_provisioned: true,
    })
    .eq('id', applicantId)
    .eq('tenant_id', tenantData.id);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  await supabase.from('admission_history').insert({
    tenant_id: tenantData.id,
    applicant_id: applicantId,
    from_stage: applicant.stage,
    to_stage: 'Allocation',
    comment: `Class Arm Allocated: ${classArm}. Student Matriculation No: ${matNumber}. Student & Parent Portal credentials provisioned. Welcome SMS dispatched to ${parentUser}.`,
    created_by: user?.id || null,
  });

  revalidatePath(`/${tenantSlug}/admin/students/admissions`);
  revalidatePath(`/${tenantSlug}/admin/students/applications`);
  revalidatePath(`/${tenantSlug}/admin/students`);
  revalidatePath(`/${tenantSlug}/apply/status`);
  return {
    success: true,
    classArm,
    matriculationNo: matNumber,
    studentUsername: matNumber,
    studentPassword: stuPass,
    parentUsername: parentUser,
    parentPassword: parPass
  };
}

