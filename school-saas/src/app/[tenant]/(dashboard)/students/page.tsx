import { createClient } from '@/lib/supabase/server';
import { StudentsClient, Student } from './_components/students-client';

export default async function StudentsPage({ params }: { params: Promise<{ tenant: string }> }) {
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

  // 2. Fetch Students with their class and section via enrollments
  // We use a left join to sections and classes through class_enrollments
  const { data: studentsData, error } = await supabase
    .from('students')
    .select(`
      id,
      first_name,
      last_name,
      admission_number,
      email,
      gender,
      guardian_name,
      guardian_phone,
      is_active,
      admitted_at,
      class_enrollments (
        sections (
          name,
          classes (
            name
          )
        )
      )
    `)
    .eq('tenant_id', tenantId)
    .order('first_name', { ascending: true });

  if (error) {
    console.error('Error fetching students:', error);
  }

  // 3. Format the data for the client component
  const students: Student[] = (studentsData || []).map((s: any) => {
    // Get the first enrollment (ideally we would filter by current academic year)
    const enrollment = s.class_enrollments?.[0];
    const sectionName = enrollment?.sections?.name || '';
    // Handle either an array or object return type from Supabase depending on relationship
    const classesData = enrollment?.sections?.classes;
    const className = Array.isArray(classesData) ? classesData[0]?.name : classesData?.name || '';

    return {
      id: s.id,
      first_name: s.first_name,
      last_name: s.last_name,
      admission_number: s.admission_number,
      email: s.email,
      gender: s.gender,
      className,
      sectionName,
      guardian_name: s.guardian_name,
      guardian_phone: s.guardian_phone,
      is_active: s.is_active,
      admitted_at: s.admitted_at,
    };
  });

  return <StudentsClient initialStudents={students} />;
}
