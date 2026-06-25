import { createClient } from '@/lib/supabase/server';
import { ClassesClient, ClassData } from './_components/classes-client';

export default async function ClassesPage({ params }: { params: Promise<{ tenant: string }> }) {
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

  // 2. Fetch classes with their sections and the class teacher
  // Use FK hint for class_teacher_id → teachers
  const { data: classesData, error } = await supabase
    .from('classes')
    .select(`
      id,
      name,
      short_name,
      sort_order,
      sections (
        id,
        name,
        capacity,
        teachers!sections_class_teacher_id_fkey (
          first_name,
          last_name
        ),
        class_enrollments (
          id
        )
      )
    `)
    .eq('tenant_id', tenantId)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching classes:', error);
  }

  // 3. Format the data for the client component
  const classes: ClassData[] = (classesData || []).map((c: any) => {
    const sections = (c.sections || []).map((sec: any) => {
      // Get teacher name from the FK-hinted relationship
      const teacherData = sec.teachers;
      const teacher = teacherData
        ? `${teacherData.first_name} ${teacherData.last_name}`
        : null;

      // Count enrollments by array length
      const studentCount = Array.isArray(sec.class_enrollments)
        ? sec.class_enrollments.length
        : 0;

      return {
        id: sec.id,
        name: sec.name,
        capacity: sec.capacity || 40,
        teacher,
        students: studentCount
      };
    });

    // Sort sections by name
    sections.sort((a: any, b: any) => a.name.localeCompare(b.name));

    return {
      id: c.id,
      name: c.name,
      short_name: c.short_name,
      sections
    };
  });

  return <ClassesClient initialClasses={classes} />;
}

