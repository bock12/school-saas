'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addClass(formData: FormData) {
  const supabase = await createClient();

  const tenant = formData.get('tenant') as string;

  const { data: tenantData, error: tenantError } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', tenant)
    .single();

  if (tenantError || !tenantData) {
    return { success: false, error: 'Tenant not found.' };
  }
  const tenantId = tenantData.id;

  // Get the next sort_order
  const { count } = await supabase
    .from('classes')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId);

  const { error } = await supabase.from('classes').insert({
    tenant_id: tenantId,
    name: formData.get('name') as string,
    short_name: (formData.get('short_name') as string) || null,
    capacity: parseInt(formData.get('capacity') as string) || 40,
    sort_order: (count || 0) + 1,
  });

  if (error) {
    console.error('Error adding class:', error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/${tenant}/classes`);
  return { success: true };
}

export async function addSection(formData: FormData) {
  const supabase = await createClient();

  const tenant = formData.get('tenant') as string;
  const classId = formData.get('class_id') as string;
  const teacherId = (formData.get('teacher_id') as string) || null;

  const { data: tenantData, error: tenantError } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', tenant)
    .single();

  if (tenantError || !tenantData) {
    return { success: false, error: 'Tenant not found.' };
  }
  const tenantId = tenantData.id;

  const { error } = await supabase.from('sections').insert({
    tenant_id: tenantId,
    class_id: classId,
    name: formData.get('name') as string,
    capacity: parseInt(formData.get('capacity') as string) || 40,
    class_teacher_id: teacherId,
  });

  if (error) {
    console.error('Error adding section:', error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/${tenant}/classes`);
  return { success: true };
}
