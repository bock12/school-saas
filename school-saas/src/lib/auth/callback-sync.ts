import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

export interface SyncProfileResult {
  synced: boolean;
  trusted: boolean;
  reason?: string;
  role?: string | null;
  tenantId?: string | null;
}

export interface UserForSync {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
}

/**
 * Validates the trusted invitation/provisioning source and safely synchronizes the user profile.
 *
 * SECURITY INVARIANT (TASK-0002 / Supervisory Amendment):
 * Service-role profile synchronization must NEVER trust user-controlled `user_metadata.role`
 * or `user_metadata.tenant_id` as authoritative authorization data.
 * Authoritative role and tenant_id are established strictly from pre-provisioned records
 * in the `profiles` table created by an authorized administrator at invite/provisioning time.
 */
export async function validateAndSyncInvitedProfile(
  user: UserForSync,
  adminClientFactory: () => ReturnType<typeof createAdminClient> = createAdminClient
): Promise<SyncProfileResult> {
  if (!user || !user.id) {
    return { synced: false, trusted: false, reason: 'Missing user context' };
  }

  const supabaseAdmin = adminClientFactory();

  // 1. Query the database for an existing authoritative profile by user.id
  const { data: profileById, error: errById } = await supabaseAdmin
    .from('profiles')
    .select('id, email, role, tenant_id, full_name')
    .eq('id', user.id)
    .maybeSingle();

  if (errById) {
    console.error('[validateAndSyncInvitedProfile] Error querying profile by id:', errById.message);
  }

  let trustedProfile = profileById;

  // 2. If not found by user.id, check if an authoritative profile was pre-provisioned by email
  //    (e.g., created by inviteTenantAdmin before the user accepted the invite)
  if (!trustedProfile && user.email) {
    const { data: profileByEmail, error: errByEmail } = await supabaseAdmin
      .from('profiles')
      .select('id, email, role, tenant_id, full_name')
      .eq('email', user.email)
      .maybeSingle();

    if (errByEmail) {
      console.error('[validateAndSyncInvitedProfile] Error querying profile by email:', errByEmail.message);
    }

    if (profileByEmail) {
      // Authoritative invitation record found in database!
      trustedProfile = profileByEmail;

      // Re-link pre-provisioned profile to user.id if different, strictly preserving
      // the server-authoritative role and tenant_id from the database record.
      if (profileByEmail.id !== user.id) {
        await supabaseAdmin
          .from('profiles')
          .delete()
          .eq('id', profileByEmail.id);

        const meta = user.user_metadata ?? {};
        const fullName = profileByEmail.full_name || meta.full_name || meta.name || '';

        await supabaseAdmin.from('profiles').insert({
          id: user.id,
          email: user.email,
          full_name: fullName,
          role: profileByEmail.role, // Authoritative role from trusted database row, NEVER user_metadata
          tenant_id: profileByEmail.tenant_id, // Authoritative tenant from trusted database row, NEVER user_metadata
        });

        return {
          synced: true,
          trusted: true,
          reason: 'relinked_preprovisioned_invitation',
          role: profileByEmail.role,
          tenantId: profileByEmail.tenant_id,
        };
      }
    }
  }

  // 3. If a trusted profile exists for user.id:
  if (trustedProfile) {
    // Optionally update non-authorization display fields if empty,
    // but NEVER update or overwrite role or tenant_id from user_metadata.
    const meta = user.user_metadata ?? {};
    const metaFullName = meta.full_name ?? meta.name;
    if (metaFullName && (!trustedProfile.full_name || trustedProfile.full_name === 'Staff Member')) {
      await supabaseAdmin
        .from('profiles')
        .update({ full_name: metaFullName })
        .eq('id', user.id);
    }

    return {
      synced: true,
      trusted: true,
      reason: 'existing_authoritative_profile',
      role: trustedProfile.role,
      tenantId: trustedProfile.tenant_id,
    };
  }

  // 4. No trusted invitation/provisioning record found in database.
  //    Reject unverified metadata — do NOT create or elevate a profile.
  return {
    synced: false,
    trusted: false,
    reason: 'untrusted_unprovisioned_user',
    role: null,
    tenantId: null,
  };
}
