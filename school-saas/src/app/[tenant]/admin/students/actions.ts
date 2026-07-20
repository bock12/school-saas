'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addStudent(formData: FormData) {
  const supabase = await createClient();

  const tenant = formData.get('tenant') as string;
  const sectionId = formData.get('section_id') as string | null;

  // 1. Resolve tenant_id from slug
  const { data: tenantData, error: tenantError } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', tenant)
    .single();

  if (tenantError || !tenantData) {
    return { success: false, error: 'Tenant not found.' };
  }
  const tenantId = tenantData.id;

  // 2. Insert the student
  const { data: student, error: studentError } = await supabase
    .from('students')
    .insert({
      tenant_id: tenantId,
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      email: (formData.get('email') as string) || null,
      gender: (formData.get('gender') as string) || null,
      guardian_name: (formData.get('guardian_name') as string) || null,
      guardian_phone: (formData.get('guardian_phone') as string) || null,
      is_active: true,
      admitted_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (studentError || !student) {
    console.error('Error adding student:', studentError);
    return { success: false, error: studentError?.message || 'Failed to add student.' };
  }

  // 3. If a section was selected, find the current academic year and enroll
  if (sectionId) {
    const { data: yearData } = await supabase
      .from('academic_years')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('is_current', true)
      .single();

    if (yearData) {
      await supabase.from('class_enrollments').insert({
        tenant_id: tenantId,
        student_id: student.id,
        section_id: sectionId,
        academic_year_id: yearData.id,
      });
    }
  }

  revalidatePath(`/admin/students`);
  return { success: true };
}
