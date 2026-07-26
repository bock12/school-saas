import { createClient } from '@/lib/supabase/server';
import { ApplicationsClient } from './_components/applications-client';
import type { Applicant } from '../admissions/types';

export default async function ApplicationsPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const supabase = await createClient();

  const { data: tenantData } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', tenant)
    .single();

  let dbApplicants: any[] = [];
  if (tenantData) {
    // Only fetch online-submitted applications (source = 'online')
    const { data } = await supabase
      .from('applicants')
      .select('*')
      .eq('tenant_id', tenantData.id)
      .eq('source', 'online')
      .order('created_at', { ascending: false });
    dbApplicants = data || [];
  }

  const mappedApplicants: Applicant[] = dbApplicants.map(a => ({
    id: a.id,
    name: `${a.first_name} ${a.last_name}`,
    grade: a.target_grade,
    parentName: a.parent_name,
    appliedDate: new Date(a.created_at).toISOString().split('T')[0],
    dob: a.dob,
    stage: a.stage as Applicant['stage'],
    docsVerified: a.docs_verified,
    interviewScore: a.interview_score,
    assessmentScore: a.assessment_score,
    comment: 'Online application submitted',
    photoUrl: a.avatar_url || undefined,
    gender: a.gender || undefined,
    email: a.email || undefined,
    phone: a.phone || undefined,
    address: a.address || undefined,
    prevSchool: a.previous_school || undefined,
    documents: a.documents || [],
    status: a.status || 'active',
    rejectionReason: a.rejection_reason || undefined,
    interviewDate: a.interview_date || undefined,
    interviewLocation: a.interview_location || undefined,
    assessmentDate: a.assessment_date || undefined,
    assessmentLocation: a.assessment_location || undefined,
    assessmentDetails: a.assessment_details || undefined,
    offerAccepted: a.offer_accepted || false,
    acceptedAt: a.accepted_at || undefined,
    parentSignature: a.parent_signature || undefined,
    paymentCleared: a.payment_cleared || false,
    receiptNumber: a.receipt_number || undefined,
    paymentMethod: a.payment_method || undefined,
    paymentReceiptUrl: a.payment_receipt_url || undefined,
    paymentPhone: a.payment_phone || undefined,
    transactionId: a.transaction_id || undefined,
  }));

  // Enrich with latest audit comment
  for (const app of mappedApplicants) {
    const { data: history } = await supabase
      .from('admission_history')
      .select('comment')
      .eq('applicant_id', app.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (history?.comment) app.comment = history.comment;
  }

  return <ApplicationsClient serverApplicants={mappedApplicants} tenantSlug={tenant} />;
}
