'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

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

  const rawDocs = formData.get('documents') as string;
  let parsedDocs = [];
  try {
    parsedDocs = JSON.parse(rawDocs || '[]');
  } catch (e) {
    parsedDocs = [];
  }

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
      documents: parsedDocs,
      stage: 'Application',
      status: 'active',
      source: 'online',
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
    .select('id, bursary_settings')
    .eq('slug', tenantSlug)
    .single();

  if (!tenantData) {
    return { success: false, error: 'School not found.' };
  }

  // If query starts with APP-, extract the prefix UUID part
  let rawIdPrefix = cleanQuery.toUpperCase().replace(/^APP-/, '').toLowerCase();

  // Fetch applicants matching tenant_id
  // Fetch applicants matching tenant_id
  const { data: applicants, error } = await supabaseAdmin
    .from('applicants')
    .select('id, first_name, last_name, target_grade, stage, created_at, docs_verified, interview_score, assessment_score, parent_name, parent_email, parent_phone, phone, email, status, rejection_reason, documents, interview_date, interview_location, assessment_date, assessment_location, assessment_details, offer_accepted, accepted_at, parent_signature, offer_expiration_date, fee_breakdown, policy_agreements, payment_cleared, receipt_number, payment_method, payment_receipt_url, payment_phone, transaction_id, class_arm, student_id_number, student_username, student_password_temp, parent_username, parent_password_temp, account_provisioned, student_password_changed, parent_password_changed')
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

  // Check password reset status in profiles
  let isStudentPasswordChanged = Boolean(match.student_password_changed);
  let isParentPasswordChanged = Boolean(match.parent_password_changed);

  const stuUser = match.student_username || match.student_id_number;
  const parUser = match.parent_username || match.parent_email || match.parent_phone;

  if (stuUser) {
    const { data: stuProf } = await supabaseAdmin
      .from('profiles')
      .select('requires_password_change')
      .eq('tenant_id', tenantData.id)
      .or(`id.eq.${stuUser},email.ilike.${stuUser}`)
      .maybeSingle();
    if (stuProf && stuProf.requires_password_change === false) {
      isStudentPasswordChanged = true;
    }
  }

  if (parUser) {
    const { data: parProf } = await supabaseAdmin
      .from('profiles')
      .select('requires_password_change')
      .eq('tenant_id', tenantData.id)
      .or(`email.ilike.${parUser},phone.ilike.${parUser}`)
      .maybeSingle();
    if (parProf && parProf.requires_password_change === false) {
      isParentPasswordChanged = true;
    }
  }

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
      status: match.status || 'active',
      rejectionReason: match.rejection_reason || null,
      documents: match.documents || [],
      interviewDate: match.interview_date || null,
      interviewLocation: match.interview_location || null,
      assessmentDate: match.assessment_date || null,
      assessmentLocation: match.assessment_location || null,
      assessmentDetails: match.assessment_details || null,
      offerAccepted: match.offer_accepted || false,
      acceptedAt: match.accepted_at || null,
      parentSignature: match.parent_signature || null,
      offerExpirationDate: match.offer_expiration_date || null,
      feeBreakdown: match.fee_breakdown || {
        tuitionFee: 4500,
        registrationFee: 500,
        learningMaterials: 800,
        total: 5800,
        currency: 'SLE'
      },
      policyAgreements: match.policy_agreements || null,
      paymentCleared: match.payment_cleared || false,
      receiptNumber: match.receipt_number || null,
      paymentMethod: match.payment_method || null,
      paymentReceiptUrl: match.payment_receipt_url || null,
      paymentPhone: match.payment_phone || null,
      transactionId: match.transaction_id || null,
      classArm: match.class_arm || null,
      studentIdNumber: match.student_id_number || null,
      studentUsername: match.student_username || match.student_id_number || `STU-${match.id.substring(0, 8).toUpperCase()}`,
      studentPasswordTemp: isStudentPasswordChanged ? null : (match.student_password_temp || `Welcome${new Date(match.created_at || new Date()).getFullYear()}!`),
      studentPasswordChanged: isStudentPasswordChanged,
      parentUsername: match.parent_username || match.parent_email || match.parent_phone || match.parent_name,
      parentPasswordTemp: isParentPasswordChanged ? null : (match.parent_password_temp || `Parent${new Date(match.created_at || new Date()).getFullYear()}!`),
      parentPasswordChanged: isParentPasswordChanged,
      accountProvisioned: match.account_provisioned || false,
    },
    history: history || [],
    bursarySettings: tenantData.bursary_settings || null,
  };
}

export async function resubmitApplication(
  applicantId: string,
  updatedDocuments: Array<{ type: string; name: string; url: string }>,
  parentNotes: string
) {
  const { data: applicant, error: fetchErr } = await supabaseAdmin
    .from('applicants')
    .select('id, tenant_id, stage, documents')
    .eq('id', applicantId)
    .single();

  if (fetchErr || !applicant) {
    return { success: false, error: 'Applicant record not found.' };
  }

  // Merge existing documents with updated documents
  const currentDocs = applicant.documents || [];
  const mergedDocs = [...currentDocs];

  for (const newDoc of updatedDocuments) {
    const existingIdx = mergedDocs.findIndex(d => d.type === newDoc.type);
    if (existingIdx >= 0) {
      mergedDocs[existingIdx] = newDoc;
    } else {
      mergedDocs.push(newDoc);
    }
  }

  // Update applicant: set status = 'active', clear rejection_reason, set docs_verified = false
  const { error: updateError } = await supabaseAdmin
    .from('applicants')
    .update({
      documents: mergedDocs,
      status: 'active',
      rejection_reason: null,
      docs_verified: false,
    })
    .eq('id', applicantId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Log in admission_history
  await supabaseAdmin.from('admission_history').insert({
    tenant_id: applicant.tenant_id,
    applicant_id: applicantId,
    from_stage: 'Rejected',
    to_stage: applicant.stage,
    comment: parentNotes ? `Resubmitted by parent: ${parentNotes}` : 'Resubmitted with updated documents by parent.',
  });

  revalidatePath('/[tenant]/apply/status', 'page');
  return { success: true };
}

export async function acceptAdmissionOffer(
  applicantId: string,
  parentSignature: string,
  policyAgreements?: { codeOfConduct: boolean; medicalConsent: boolean; mediaRelease: boolean }
) {
  const { data: applicant, error: fetchErr } = await supabaseAdmin
    .from('applicants')
    .select('id, tenant_id, parent_name')
    .eq('id', applicantId)
    .single();

  if (fetchErr || !applicant) {
    return { success: false, error: 'Applicant record not found.' };
  }

  const acceptedAt = new Date().toISOString();

  // Update applicant record
  const { error: updateErr } = await supabaseAdmin
    .from('applicants')
    .update({
      offer_accepted: true,
      accepted_at: acceptedAt,
      parent_signature: parentSignature,
      policy_agreements: policyAgreements || { codeOfConduct: true, medicalConsent: true, mediaRelease: true },
    })
    .eq('id', applicantId);

  if (updateErr) {
    return { success: false, error: updateErr.message };
  }

  // Insert history log
  await supabaseAdmin.from('admission_history').insert({
    tenant_id: applicant.tenant_id,
    applicant_id: applicantId,
    from_stage: 'Acceptance',
    to_stage: 'Acceptance',
    comment: `Provisional Admission Offer formally accepted by parent (${applicant.parent_name}). Signed: "${parentSignature}".`,
  });

  revalidatePath('/[tenant]/apply/status', 'page');
  return { success: true };
}

export async function uploadPaymentReceipt(
  applicantId: string,
  receiptUrl: string,
  method: string,
  paymentPhone?: string,
  transactionId?: string
) {
  const { data: applicant, error: fetchErr } = await supabaseAdmin
    .from('applicants')
    .select('id, tenant_id, parent_name')
    .eq('id', applicantId)
    .single();

  if (fetchErr || !applicant) {
    return { success: false, error: 'Applicant record not found.' };
  }

  const { error: updateErr } = await supabaseAdmin
    .from('applicants')
    .update({
      payment_receipt_url: receiptUrl,
      payment_method: method || 'Bank Transfer',
      payment_phone: paymentPhone || null,
      transaction_id: transactionId || null,
    })
    .eq('id', applicantId);

  if (updateErr) {
    return { success: false, error: updateErr.message };
  }

  // Insert history log
  await supabaseAdmin.from('admission_history').insert({
    tenant_id: applicant.tenant_id,
    applicant_id: applicantId,
    from_stage: 'Enrollment',
    to_stage: 'Enrollment',
    comment: `Proof of payment receipt uploaded by parent (${applicant.parent_name}). Method: ${method || 'Bank Transfer'}. ${paymentPhone ? `Phone: ${paymentPhone}. ` : ''}${transactionId ? `TxID: ${transactionId}. ` : ''}Awaiting Bursary Clearance.`,
  });

  revalidatePath('/[tenant]/apply/status', 'page');
  return { success: true };
}
