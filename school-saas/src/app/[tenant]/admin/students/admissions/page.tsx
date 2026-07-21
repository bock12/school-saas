import { createClient } from '@/lib/supabase/server';
import { AdmissionsClient, Applicant } from './admissions-client';

export default async function AdmissionsPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const supabase = await createClient();
  
  const { data: tenantData } = await supabase.from('tenants').select('id').eq('slug', tenant).single();
  
  let dbApplicants: any[] = [];
  if (tenantData) {
     const { data } = await supabase.from('applicants').select('*').eq('tenant_id', tenantData.id).order('created_at', { ascending: false });
     dbApplicants = data || [];
  }
  
  // map dbApplicants to the Applicant interface used by the client
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
    comment: 'Application registered',
    photoUrl: a.avatar_url || undefined,
    gender: a.gender || undefined,
    email: a.email || undefined,
    phone: a.phone || undefined,
    address: a.address || undefined,
    prevSchool: a.previous_school || undefined,
  }));

  // Fetch latest history comment for each applicant to show in the UI
  for (const app of mappedApplicants) {
    const { data: history } = await supabase
      .from('admission_history')
      .select('comment')
      .eq('applicant_id', app.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (history && history.comment) {
      app.comment = history.comment;
    }
  }

  return <AdmissionsClient serverApplicants={mappedApplicants} tenantSlug={tenant} />;
}
