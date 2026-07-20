'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addTeacher(formData: FormData) {
  const supabase = await createClient();

  const tenant = formData.get('tenant') as string;

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

  // 2. Resolve department_id if provided
  const departmentId = (formData.get('department_id') as string) || null;

  // 3. Insert the teacher
  const { error: teacherError } = await supabase.from('teachers').insert({
    tenant_id: tenantId,
    first_name: formData.get('first_name') as string,
    last_name: formData.get('last_name') as string,
    email: (formData.get('email') as string) || null,
    phone: (formData.get('phone') as string) || null,
    department_id: departmentId,
    qualification: (formData.get('qualification') as string) || null,
    is_active: true,
    date_of_joining: new Date().toISOString().split('T')[0],
  });

  if (teacherError) {
    console.error('Error adding teacher:', teacherError);
    return { success: false, error: teacherError.message };
  }

  revalidatePath(`/admin/teachers`);
  return { success: true };
}
