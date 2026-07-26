import { createClient } from '@/lib/supabase/server';
import { DirectAdmissionsClient } from './admissions-client';

export default async function AdminAdmissionsPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const supabase = await createClient();

  const { data: tenantData } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', tenant)
    .single();

  const tenantId = tenantData?.id;

  // Fetch class options for the dropdown
  const { data: classData } = await supabase
    .from('classes')
    .select('id, name, sections(id, name)')
    .eq('tenant_id', tenantId)
    .order('name');

  const classOptions = (classData || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    sections: (c.sections || []).map((s: any) => ({ id: s.id, name: s.name })),
  }));

  // Fetch recently admitted students (last 30, ordered by newest)
  const { data: recentData } = await supabase
    .from('students')
    .select(`
      id, first_name, last_name, admission_number, gender, avatar_url, admitted_at, is_active,
      class_enrollments(
        sections(name, classes(name))
      )
    `)
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .order('admitted_at', { ascending: false })
    .limit(20);

  const recentStudents = (recentData || []).map((s: any) => {
    const enrollment = s.class_enrollments?.[0];
    const section = enrollment?.sections;
    const cls = section?.classes;
    return {
      id: s.id,
      first_name: s.first_name,
      last_name: s.last_name,
      admission_number: s.admission_number || '—',
      gender: s.gender,
      className: cls?.name || 'Unassigned',
      sectionName: section?.name || '',
      guardian_name: null,
      admitted_at: s.admitted_at,
      avatar_url: s.avatar_url,
    };
  });

  return (
    <DirectAdmissionsClient
      tenant={tenant}
      classOptions={classOptions}
      recentStudents={recentStudents}
    />
  );
}
