'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function bursaryVerifyAndClearPayment(
  tenantSlug: string,
  applicantId: string,
  receiptNumber: string,
  paymentMethod?: string,
  notes?: string
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

  const generatedRef = receiptNumber || `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  // 1. Update applicant: set payment_cleared = true, set receipt_number
  const { error: updateError } = await supabase
    .from('applicants')
    .update({
      payment_cleared: true,
      receipt_number: generatedRef,
      payment_method: paymentMethod || 'Bank Transfer',
    })
    .eq('id', applicantId)
    .eq('tenant_id', tenantData.id);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // 2. Log in admission_history
  await supabase.from('admission_history').insert({
    tenant_id: tenantData.id,
    applicant_id: applicantId,
    from_stage: 'Enrollment',
    to_stage: 'Enrollment',
    comment: `Official Bursary Financial Clearance Approved. Receipt Ref: ${generatedRef} (${paymentMethod || 'Bank Transfer'}). ${notes ? `Note: ${notes}` : ''}`,
    created_by: user?.id || null,
  });

  revalidatePath(`/${tenantSlug}/admin/bursary`);
  revalidatePath(`/${tenantSlug}/admin/students/admissions`);
  revalidatePath(`/${tenantSlug}/apply/status`);
  return { success: true, receiptNumber: generatedRef };
}

export async function bursaryRejectPaymentReceipt(
  tenantSlug: string,
  applicantId: string,
  reason: string
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

  // Clear uploaded receipt details so parent can re-upload valid proof
  const { error: updateError } = await supabase
    .from('applicants')
    .update({
      payment_receipt_url: null,
      transaction_id: null,
      payment_cleared: false,
    })
    .eq('id', applicantId)
    .eq('tenant_id', tenantData.id);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Log in admission_history
  await supabase.from('admission_history').insert({
    tenant_id: tenantData.id,
    applicant_id: applicantId,
    from_stage: 'Enrollment',
    to_stage: 'Enrollment',
    comment: `Proof of payment receipt rejected by Bursary. Reason: ${reason}. Parent requested to re-submit valid receipt.`,
    created_by: user?.id || null,
  });

  revalidatePath(`/${tenantSlug}/admin/bursary`);
  revalidatePath(`/${tenantSlug}/admin/students/admissions`);
  revalidatePath(`/${tenantSlug}/apply/status`);
  return { success: true };
}

export async function updateBursarySettingsAction(
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

  revalidatePath(`/${tenantSlug}/admin/bursary`);
  revalidatePath(`/${tenantSlug}/admin/students/admissions`);
  revalidatePath(`/${tenantSlug}/apply/status`);
  return { success: true };
}
