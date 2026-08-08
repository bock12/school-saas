/**
 * Exam Communication Center — Audience Resolver Service
 * Queries recipient user IDs efficiently using indexed database queries.
 */

import { createAdminClient } from '@/lib/supabase/admin';

export type AudienceType =
  | 'all_teachers'
  | 'subject_teachers'
  | 'form_masters'
  | 'teachers_pending_marks'
  | 'all_hods'
  | 'hods_pending_moderation'
  | 'principal_admins'
  | 'all_students'
  | 'students_by_class'
  | 'students_exam_candidates'
  | 'all_parents'
  | 'parents_by_class'
  | 'parents_exam_candidates'
  | 'custom';

export interface AudienceDefinition {
  type: AudienceType;
  tenantId: string;
  classId?: string;
  subjectId?: string;
  examId?: string;
  customUserIds?: string[];
}

export interface ResolvedRecipient {
  userId: string;
  email?: string;
  phone?: string;
  fullName: string;
  role: string;
}

/**
 * Resolves audience user profiles for a notification.
 */
export async function resolveAudience(def: AudienceDefinition): Promise<ResolvedRecipient[]> {
  const supabase = createAdminClient();
  const { tenantId, type, customUserIds } = def;

  // Custom static user list
  if (type === 'custom' && customUserIds && customUserIds.length > 0) {
    const { data } = await supabase
      .from('profiles')
      .select('id, email, phone, full_name, role')
      .in('id', customUserIds)
      .eq('tenant_id', tenantId);

    return (data || []).map((p) => ({
      userId: p.id,
      email: p.email || undefined,
      phone: p.phone || undefined,
      fullName: p.full_name || 'User',
      role: p.role,
    }));
  }

  // Teachers
  if (type === 'all_teachers' || type === 'subject_teachers' || type === 'form_masters' || type === 'teachers_pending_marks') {
    const { data } = await supabase
      .from('profiles')
      .select('id, email, phone, full_name, role')
      .eq('tenant_id', tenantId)
      .in('role', ['teacher', 'school_admin']);

    return (data || []).map((p) => ({
      userId: p.id,
      email: p.email || undefined,
      phone: p.phone || undefined,
      fullName: p.full_name || 'Teacher',
      role: p.role,
    }));
  }

  // HODs
  if (type === 'all_hods' || type === 'hods_pending_moderation') {
    const { data } = await supabase
      .from('profiles')
      .select('id, email, phone, full_name, role')
      .eq('tenant_id', tenantId)
      .in('role', ['teacher', 'school_admin']);

    return (data || []).map((p) => ({
      userId: p.id,
      email: p.email || undefined,
      phone: p.phone || undefined,
      fullName: p.full_name || 'HOD',
      role: p.role,
    }));
  }

  // Principal / Admins
  if (type === 'principal_admins') {
    const { data } = await supabase
      .from('profiles')
      .select('id, email, phone, full_name, role')
      .eq('tenant_id', tenantId)
      .in('role', ['school_admin', 'org_admin', 'super_admin']);

    return (data || []).map((p) => ({
      userId: p.id,
      email: p.email || undefined,
      phone: p.phone || undefined,
      fullName: p.full_name || 'Administrator',
      role: p.role,
    }));
  }

  // Students
  if (type === 'all_students' || type === 'students_by_class' || type === 'students_exam_candidates') {
    const { data } = await supabase
      .from('profiles')
      .select('id, email, phone, full_name, role')
      .eq('tenant_id', tenantId)
      .eq('role', 'student');

    return (data || []).map((p) => ({
      userId: p.id,
      email: p.email || undefined,
      phone: p.phone || undefined,
      fullName: p.full_name || 'Student',
      role: p.role,
    }));
  }

  // Parents
  if (type === 'all_parents' || type === 'parents_by_class' || type === 'parents_exam_candidates') {
    const { data } = await supabase
      .from('profiles')
      .select('id, email, phone, full_name, role')
      .eq('tenant_id', tenantId)
      .eq('role', 'parent');

    return (data || []).map((p) => ({
      userId: p.id,
      email: p.email || undefined,
      phone: p.phone || undefined,
      fullName: p.full_name || 'Parent',
      role: p.role,
    }));
  }

  // Fallback: Return all users in tenant
  const { data } = await supabase
    .from('profiles')
    .select('id, email, phone, full_name, role')
    .eq('tenant_id', tenantId);

  return (data || []).map((p) => ({
    userId: p.id,
    email: p.email || undefined,
    phone: p.phone || undefined,
    fullName: p.full_name || 'User',
    role: p.role,
  }));
}
