'use server';

import { requireServerActionAuthorization } from '@/lib/auth/server-action-guard';
import { revalidatePath } from 'next/cache';

export async function createParent(tenantSlug: string, formData: FormData) {
  const authorization = await requireServerActionAuthorization({ permission: 'students.records.manage', requestedTenantSlug: tenantSlug });
  const supabase = authorization.supabase;
  const tenantId = authorization.target.tenantId;

  const parentData = {
    tenant_id: tenantId,
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
        tenant_id: tenantId,
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
  const authorization = await requireServerActionAuthorization({ permission: 'students.records.manage', requestedTenantSlug: tenantSlug });
  const supabase = authorization.supabase;
  const tenantId = authorization.target.tenantId;

  const { data, error } = await supabase
    .from('student_parents')
    .insert([{
      tenant_id: tenantId,
      parent_id: parentId,
      student_id: studentId,
      relationship,
    }]);

  if (error) throw error;
  
  revalidatePath(`/${tenantSlug}/admin/parents`);
  return data;
}

export async function deleteParent(tenantSlug: string, parentId: string) {
  const authorization = await requireServerActionAuthorization({ permission: 'students.records.manage', requestedTenantSlug: tenantSlug });
  const supabase = authorization.supabase;
  const tenantId = authorization.target.tenantId;

  const { error } = await supabase
    .from('parents')
    .delete()
    .eq('id', parentId)
    .eq('tenant_id', tenantId);

  if (error) throw error;

  revalidatePath(`/${tenantSlug}/admin/parents`);
}
