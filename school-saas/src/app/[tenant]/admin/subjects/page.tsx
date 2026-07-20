import { createClient } from '@/lib/supabase/server';
import { SubjectsClient, SubjectData } from './_components/subjects-client';

export default async function SubjectsPage({ params }: { params: Promise<{ tenant: string }> }) {
  const resolvedParams = await params;
  const tenant = resolvedParams.tenant;
  
  const supabase = await createClient();

  // 1. Get tenant details
  const { data: tenantData } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', tenant)
    .single();

  const tenantId = tenantData?.id;

  // 2. Fetch subjects with department name and teacher_assignments for counts
  const { data: subjectsData, error } = await supabase
    .from('subjects')
    .select(`
      id,
      name,
      code,
      is_elective,
      departments (
        name
      ),
      teacher_assignments (
        teacher_id,
        section_id
      )
    `)
    .eq('tenant_id', tenantId)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching subjects:', error);
  }

  // 3. Format the data for the client component
  const subjects: SubjectData[] = (subjectsData || []).map((s: any) => {
    const departmentName = s.departments?.name || 'Unassigned';

    // Count unique teachers assigned to this subject
    const assignments = Array.isArray(s.teacher_assignments) ? s.teacher_assignments : [];
    const uniqueTeachers = new Set(assignments.map((a: any) => a.teacher_id));
    const uniqueSections = new Set(assignments.map((a: any) => a.section_id));

    return {
      id: s.id,
      name: s.name,
      code: s.code,
      department: departmentName,
      is_elective: s.is_elective || false,
      teachers: uniqueTeachers.size,
      classes: uniqueSections.size,
    };
  });

  return <SubjectsClient initialSubjects={subjects} />;
}



