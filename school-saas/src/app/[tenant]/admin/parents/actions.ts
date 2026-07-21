'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createParent(tenantSlug: string, formData: FormData) {
  const supabase = await createClient();
  
  // Get tenant ID
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', tenantSlug)
    .single();

  if (!tenant) throw new Error('Tenant not found');

  const parentData = {
    tenant_id: tenant.id,
    first_name: formData.get('firstName') as string,
    last_name: formData.get('lastName') as string,
    email: formData.get('email') as string || null,
    phone: formData.get('phone') as string,
    occupation: formData.get('occupation') as string || null,
    address: formData.get('address') as string || null,
  };

  // 1. Insert Parent
  const { data: parent, error: parentError } = await supabase
    .from('parents')
    .insert([parentData])
    .select('id')
    .single();

  if (parentError) throw parentError;

  // 2. Link Students
  // Expecting studentIds to be a JSON string array or comma separated
  const studentIdsStr = formData.get('studentIds') as string;
  const relationshipsStr = formData.get('relationships') as string; // Optional: JSON map of studentId -> relationship

  if (studentIdsStr) {
    let studentIds: string[] = [];
    try {
      studentIds = JSON.parse(studentIdsStr);
    } catch {
      studentIds = studentIdsStr.split(',').map(id => id.trim()).filter(Boolean);
    }

    let relationships: Record<string, string> = {};
    if (relationshipsStr) {
      try {
        relationships = JSON.parse(relationshipsStr);
      } catch {
        // Fallback or empty
      }
    }

    if (studentIds.length > 0) {
      const studentParentsData = studentIds.map(studentId => ({
        tenant_id: tenant.id,
        student_id: studentId,
        parent_id: parent.id,
        relationship: relationships[studentId] || 'Guardian',
        is_primary: true
      }));

      const { error: spError } = await supabase
        .from('student_parents')
        .insert(studentParentsData);

      if (spError) throw spError;
    }
  }

  revalidatePath(`/${tenantSlug}/admin/parents`);
  return parent;
}

export async function linkStudentToParent(tenantSlug: string, parentId: string, studentId: string, relationship: string) {
  const supabase = await createClient();
  
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', tenantSlug)
    .single();

  if (!tenant) throw new Error('Tenant not found');

  const { data, error } = await supabase
    .from('student_parents')
    .insert([{
      tenant_id: tenant.id,
      parent_id: parentId,
      student_id: studentId,
      relationship,
    }]);

  if (error) throw error;
  
  revalidatePath(`/${tenantSlug}/admin/parents`);
  return data;
}

export async function deleteParent(tenantSlug: string, parentId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('parents')
    .delete()
    .eq('id', parentId);

  if (error) throw error;

  revalidatePath(`/${tenantSlug}/admin/parents`);
}
