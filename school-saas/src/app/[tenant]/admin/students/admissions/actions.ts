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
  comment: string
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
    const { error: updateError } = await supabase
      .from('applicants')
      .update({ stage: toStage })
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
