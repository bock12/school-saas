import { createClient } from '@/lib/supabase/server';
import { TeachersClient, Teacher, Department } from './_components/teachers-client';

export default async function TeachersPage({ params }: { params: Promise<{ tenant: string }> }) {
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

  // 2. Fetch Teachers with their department and assigned subjects
  const { data: teachersData, error } = await supabase
    .from('teachers')
    .select(`
      id,
      first_name,
      last_name,
      employee_id,
      email,
      phone,
      qualification,
      is_active,
      date_of_joining,
      departments!teachers_department_id_fkey (
        name
      ),
      teacher_assignments (
        subjects (
          name
        )
      )
    `)
    .eq('tenant_id', tenantId)
    .order('first_name', { ascending: true });

  if (error) {
    console.error('Error fetching teachers:', error);
  }

  // 3. Fetch departments for the Add Teacher dropdown
  const { data: departmentsRaw } = await supabase
    .from('departments')
    .select('id, name')
    .eq('tenant_id', tenantId)
    .order('name', { ascending: true });

  const departments: Department[] = (departmentsRaw || []).map((d: any) => ({
    id: d.id,
    name: d.name,
  }));

  // 4. Format the data for the client component
  const teachers: Teacher[] = (teachersData || []).map((t: any) => {
    const departmentName = t.departments?.name || 'Unassigned';
    
    // Extract unique subjects assigned to the teacher
    const assignments = Array.isArray(t.teacher_assignments) ? t.teacher_assignments : [];
    const rawSubjects = assignments
      .map((a: any) => Array.isArray(a.subjects) ? a.subjects[0]?.name : a.subjects?.name)
      .filter(Boolean);
    const subjects = [...new Set(rawSubjects)] as string[];

    return {
      id: t.id,
      first_name: t.first_name,
      last_name: t.last_name,
      employee_id: t.employee_id,
      email: t.email,
      phone: t.phone,
      department: departmentName,
      subjects,
      qualification: t.qualification,
      is_active: t.is_active,
      date_of_joining: t.date_of_joining,
    };
  });

  return <TeachersClient initialTeachers={teachers} departments={departments} tenant={tenant} />;
}
