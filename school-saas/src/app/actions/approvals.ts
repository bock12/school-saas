'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export type ApprovalType = 'admission' | 'leave' | 'grade_change' | 'purchase' | 'fee_waiver' | 'custom';
export type ApprovalPriority = 'low' | 'medium' | 'high' | 'urgent';

export async function getApprovalRequests(tenantId: string, schoolIds: string[]) {
  const supabase = await createClient();

  const allTenantIds = [tenantId, ...schoolIds];

  const { data, error } = await supabase
    .from('approval_requests')
    .select('*')
    .in('tenant_id', allTenantIds)
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function createApprovalRequest(
  tenantId: string,
  payload: {
    title: string;
    description?: string;
    type: ApprovalType;
    priority?: ApprovalPriority;
    requester_name?: string;
    current_stage?: string;
    due_at?: string;
    notes?: string;
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('approval_requests')
    .insert({
      tenant_id: tenantId,
      title: payload.title,
      description: payload.description ?? null,
      type: payload.type,
      priority: payload.priority ?? 'medium',
      status: 'pending',
      requester_id: user?.id ?? null,
      requester_name: payload.requester_name ?? user?.user_metadata?.full_name ?? 'Unknown',
      current_stage: payload.current_stage ?? 'Stage 1: Initial Review',
      notes: payload.notes ?? null,
      due_at: payload.due_at ?? null,
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function resolveApprovalRequest(
  requestId: string,
  resolution: 'approved' | 'rejected',
  notes?: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('approval_requests')
    .update({
      status: resolution,
      resolved_at: new Date().toISOString(),
      resolved_by: user?.id ?? null,
      notes: notes ?? null,
    })
    .eq('id', requestId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteApprovalRequest(requestId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('approval_requests')
    .delete()
    .eq('id', requestId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
