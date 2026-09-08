import { SupabaseClient } from '@supabase/supabase-js';

export interface AdmissionHistoryEntry {
  tenantId: string;
  applicantId: string;
  fromStage: string | null;
  toStage: string;
  comment: string;
  createdBy: string;
}

/**
 * Authoritatively records an admission lifecycle transition or command execution
 * into public.admission_history using an authorized privileged/admin client.
 */
export async function recordAdmissionHistory(
  client: SupabaseClient | any,
  entry: AdmissionHistoryEntry
): Promise<void> {
  const { error } = await client.from('admission_history').insert({
    tenant_id: entry.tenantId,
    applicant_id: entry.applicantId,
    from_stage: entry.fromStage,
    to_stage: entry.toStage,
    comment: entry.comment,
    created_by: entry.createdBy,
  });

  if (error) {
    console.error('[AdmissionHistory] Failed to record audit log:', error.message);
    throw new Error(`Failed to record admission audit history: ${error.message}`);
  }
}
