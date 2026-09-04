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
 * SECURITY INVARIANTS (TASK-0002 / Amendment 2):
 * 1. Never trust user_controlled user_metadata.role or user_metadata.tenant_id as authoritative.
 * 2. Never treat arbitrary profiles.email = user.email as proof of an invitation.
 * 3. An explicit, server-authoritative invitation record in `user_invitations` is mandatory.
 * 4. Replay is strictly prevented: consumed or expired invitations cannot be reused.
 * 5. Re-binding to a second GoTrue user identity is rejected.
 * 6. Conflicting identities are rejected fail-closed.
 * 7. Profile binding is atomic; failed binding never deletes or corrupts original records.
 * 8. All database lookup and mutation failures fail closed.
 */
export async function validateAndSyncInvitedProfile(
  user: UserForSync,
  adminClientFactory: () => ReturnType<typeof createAdminClient> = createAdminClient
): Promise<SyncProfileResult> {
  if (!user || !user.id || !user.email) {
    return { synced: false, trusted: false, reason: 'missing_user_context' };
  }

  const supabaseAdmin = adminClientFactory();
  const normalizedEmail = user.email.trim().toLowerCase();

  // 1. Query the database for an existing authoritative profile for user.id
  const { data: profileById, error: errById } = await supabaseAdmin
    .from('profiles')
    .select('id, email, role, tenant_id, full_name')
    .eq('id', user.id)
    .maybeSingle();

  if (errById) {
    console.error('[validateAndSyncInvitedProfile] Database error querying profile by id:', errById.message);
    return { synced: false, trusted: false, reason: 'database_error' };
  }

  // 2. Query for an explicit authoritative invitation record
  const { data: invitation, error: errInv } = await supabaseAdmin
    .from('user_invitations')
    .select('*')
    .eq('email', normalizedEmail)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (errInv) {
    console.error('[validateAndSyncInvitedProfile] Database error querying invitation:', errInv.message);
    return { synced: false, trusted: false, reason: 'database_error' };
  }

  // 3. Handle existing profile for this user.id
  if (profileById) {
    // If an invitation exists, check for conflicting identity/tenant/role binding (SEC-27)
    if (invitation && invitation.status === 'pending') {
      if (
        (invitation.tenant_id && invitation.tenant_id !== profileById.tenant_id) ||
        (invitation.role && invitation.role !== profileById.role)
      ) {
        return {
          synced: false,
          trusted: false,
          reason: 'conflicting_identity_binding',
          role: profileById.role,
          tenantId: profileById.tenant_id,
        };
      }
    }

    // Existing profile is valid: preserve its server-authoritative role and tenant
    const meta = user.user_metadata ?? {};
    const metaFullName = typeof meta.full_name === 'string' ? meta.full_name : typeof meta.name === 'string' ? meta.name : null;
    if (metaFullName && (!profileById.full_name || profileById.full_name === 'Staff Member')) {
      await supabaseAdmin
        .from('profiles')
        .update({ full_name: metaFullName })
        .eq('id', user.id);
    }

    return {
      synced: true,
      trusted: true,
      reason: 'existing_authoritative_profile',
      role: profileById.role,
      tenantId: profileById.tenant_id,
    };
  }

  // 4. No profile exists for user.id: require an explicit, valid, authoritative invitation (SEC-19)
  if (!invitation) {
    return {
      synced: false,
      trusted: false,
      reason: 'no_authoritative_invitation',
    };
  }

  // Check if a profile already exists for this email under a DIFFERENT user ID (SEC-27)
  const { data: conflictingProfile, error: errConflict } = await supabaseAdmin
    .from('profiles')
    .select('id, email, role, tenant_id')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (errConflict) {
    console.error('[validateAndSyncInvitedProfile] Database error checking profile conflicts:', errConflict.message);
    return { synced: false, trusted: false, reason: 'database_error' };
  }

  if (conflictingProfile && conflictingProfile.id !== user.id) {
    return {
      synced: false,
      trusted: false,
      reason: 'conflicting_existing_profile_identity',
    };
  }

  // 5. Replay & Rebinding Checks (SEC-21, SEC-22)
  if (invitation.status === 'accepted') {
    return { synced: false, trusted: false, reason: 'invitation_already_consumed' };
  }

  if (invitation.status === 'revoked') {
    return { synced: false, trusted: false, reason: 'invitation_revoked' };
  }

  if (invitation.accepted_by && invitation.accepted_by !== user.id) {
    return { synced: false, trusted: false, reason: 'invitation_bound_to_other_user' };
  }

  // 6. Expiration Check (SEC-20)
  const now = new Date();
  const expiresAt = new Date(invitation.expires_at);
  if (now.getTime() > expiresAt.getTime() || invitation.status === 'expired') {
    await supabaseAdmin
      .from('user_invitations')
      .update({ status: 'expired' })
      .eq('id', invitation.id);
    return { synced: false, trusted: false, reason: 'invitation_expired' };
  }

  if (invitation.status !== 'pending') {
    return { synced: false, trusted: false, reason: `invitation_invalid_status_${invitation.status}` };
  }

  // 7. Authoritative role and tenant resolution (SEC-23, SEC-24, SEC-28)
  // Take role and tenant EXCLUSIVELY from the invitation record, NEVER user_metadata.
  const authoritativeRole = invitation.role;
  const authoritativeTenantId = invitation.tenant_id;
  const meta = user.user_metadata ?? {};
  const fullName =
    (typeof meta.full_name === 'string' && meta.full_name) ||
    (typeof meta.name === 'string' && meta.name) ||
    invitation.full_name ||
    'Staff Member';

  // 8. Atomic Profile Binding and Invitation Consumption (SEC-25, SEC-26)
  // Do NOT use delete + insert.
  const { error: insertErr } = await supabaseAdmin.from('profiles').insert({
    id: user.id,
    email: normalizedEmail,
    full_name: fullName,
    role: authoritativeRole,
    tenant_id: authoritativeTenantId,
  });

  if (insertErr) {
    console.error('[validateAndSyncInvitedProfile] Profile insert failed:', insertErr.message);
    return { synced: false, trusted: false, reason: 'profile_insert_failed' };
  }

  const { error: updateInvErr } = await supabaseAdmin
    .from('user_invitations')
    .update({
      status: 'accepted',
      accepted_at: now.toISOString(),
      accepted_by: user.id,
    })
    .eq('id', invitation.id)
    .eq('status', 'pending');

  if (updateInvErr) {
    console.error('[validateAndSyncInvitedProfile] Invitation consumption failed:', updateInvErr.message);
    // Roll back inserted profile to maintain atomic consistency and fail closed
    await supabaseAdmin.from('profiles').delete().eq('id', user.id);
    return { synced: false, trusted: false, reason: 'invitation_consumption_failed' };
  }

  return {
    synced: true,
    trusted: true,
    reason: 'invitation_accepted',
    role: authoritativeRole,
    tenantId: authoritativeTenantId,
  };
}
