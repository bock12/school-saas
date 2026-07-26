import { createClient } from '@/lib/supabase/server';
import { MergedStudentsClient } from './_components/merged-students-client';

export default async function StudentsPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const supabase = await createClient();

  const { data: tenantData } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', tenant)
    .single();

  const tenantId = tenantData?.id;
  if (!tenantId) return <div className="p-8 text-sm text-[hsl(var(--text-tertiary))]">Tenant not found.</div>;

  // Fetch all students with class enrollment info
  const { data: studentsData } = await supabase
    .from('students')
    .select(`
      id, first_name, last_name, admission_number, email, gender,
      guardian_name, guardian_phone, is_active, admitted_at, avatar_url,
      class_enrollments(
        id, academic_year_id,
        sections(id, name, classes(id, name)),
        academic_years(is_current, name)
      )
    `)
    .eq('tenant_id', tenantId)
    .order('admitted_at', { ascending: false });

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

  const students = (studentsData || []).map((s: any) => {
    const currentEnrollment = s.class_enrollments?.find((e: any) => e.academic_years?.is_current);
    const anyEnrollment = currentEnrollment || s.class_enrollments?.[0];
    const section = anyEnrollment?.sections;
    const cls = section?.classes;
    return {
      id: s.id,
      first_name: s.first_name,
      last_name: s.last_name,
      admission_number: s.admission_number || '—',
      email: s.email,
      gender: s.gender,
      guardian_name: s.guardian_name,
      guardian_phone: s.guardian_phone,
      is_active: s.is_active,
      admitted_at: s.admitted_at,
      avatar_url: s.avatar_url,
      className: cls?.name || '',
      sectionName: section?.name || '',
      isEnrolled: !!currentEnrollment,
    };
  });

  return (
    <MergedStudentsClient
      initialStudents={students}
      classOptions={classOptions}
      tenant={tenant}
    />
  );
}
