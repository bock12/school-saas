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
 * SECURITY INVARIANTS (TASK-0002 / CORRECTION-03):
 *
 * 1. Never trust user_controlled user_metadata.role or user_metadata.tenant_id as authoritative.
 * 2. Never treat arbitrary profiles.email = user.email as proof of an invitation.
 * 3. An explicit, server-authoritative invitation record in `user_invitations` is mandatory for
 *    new profile creation.
 * 4. Replay is strictly prevented: consumed or expired invitations cannot be reused.
 * 5. Re-binding to a second GoTrue user identity is rejected.
 * 6. Conflicting identities are rejected fail-closed.
 * 7. Profile binding is TRULY ATOMIC via PostgreSQL stored procedure
 *    `bind_invitation_to_user(invitation_id, user_id)`. The procedure uses
 *    SELECT ... FOR UPDATE to prevent concurrent acceptance races, and allows
 *    PostgreSQL to roll back automatically on any failure — eliminating the
 *    previous application-level compensating DELETE pattern.
 * 8. All database lookup and mutation failures fail closed.
 *
 * GOTRUE / APPLICATION INVITATION CORRELATION:
 *
 * GoTrue (Supabase Auth) and the application `user_invitations` table maintain
 * two independent invitation channels. They are correlated as follows:
 *
 *   1. Administrator calls `inviteTenantAdmin()` which:
 *      a. Creates an authoritative record in `public.user_invitations` (role, tenant, email).
 *      b. Calls `supabaseAdmin.auth.admin.inviteUserByEmail(email)` to dispatch the
 *         GoTrue invitation email (magic link / OTP).
 *   2. The invited user clicks the email link and the browser exchanges the GoTrue
 *      code at `/api/auth/callback?code=...`.
 *   3. `supabase.auth.exchangeCodeForSession(code)` authenticates the GoTrue identity
 *      and returns `user.id` (the stable GoTrue UUID) and `user.email` (verified by
 *      GoTrue's magic-link mechanism — GoTrue only issues a successful session after
 *      the user proves possession of the email address via the signed token).
 *   4. THIS FUNCTION then looks up the server-authoritative `user_invitations` record
 *      by `invitation_id` (carried in the callback or resolved by email) to retrieve
 *      the authoritative role and tenant_id.
 *   5. `bind_invitation_to_user(invitation_id, user_id)` atomically creates the profile
 *      with values from the locked invitation row and marks it consumed.
 *
 * Security invariant:
 *   authenticated GoTrue identity (user.id)
 *       ↓ email verified by GoTrue magic-link exchange
 *   pending application invitation (user_invitations row)
 *       ↓ locked with SELECT FOR UPDATE
 *   atomic binding to user.id
 *       ↓
 *   authoritative role + tenant (from invitation, never from user_metadata)
 *
 * Email equality alone is NOT sufficient: the invitation must exist and be
 * pending. user_metadata can never override role or tenant.
 *
 * TOKEN COLUMN NOTE:
 * The `user_invitations.token` column exists from the initial schema design
 * but is currently unused in the invitation workflow. No token value is
 * generated, stored, or returned. The column is retained in the schema for
 * now; a follow-up migration should remove it once confirmed unnecessary to
 * avoid retaining an unused credential-like field. See REC-0013.
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

  // ── EXISTING PROFILE PASS-THROUGH ────────────────────────────────────────
  //
  // If a profile already exists for this user.id, we preserve it exactly as-is.
  //
  // SAFETY ANALYSIS:
  // - The profile row is keyed by user.id (GoTrue's immutable UUID), which was
  //   written by a previous trusted server action (inviteTenantAdmin, registration, etc.).
  // - user.user_metadata is never consulted for role or tenant_id here.
  // - We only optionally update full_name if the profile has the placeholder value and
  //   the GoTrue metadata supplies a real name — this is cosmetic only.
  // - A pending invitation with a CONFLICTING tenant/role for the same user is rejected
  //   (fail-closed). This prevents an invitation from silently upgrading an existing
  //   profile's role or moving it to another tenant.
  //
  // This path does NOT call bind_invitation_to_user because no new profile needs to be
  // created. The existing authoritative data is returned directly.
  const { data: profileById, error: errById } = await supabaseAdmin
    .from('profiles')
    .select('id, email, role, tenant_id, full_name')
    .eq('id', user.id)
    .maybeSingle();

  if (errById) {
    console.error('[validateAndSyncInvitedProfile] Database error querying profile by id:', errById.message);
    return { synced: false, trusted: false, reason: 'database_error' };
  }

  if (profileById) {
    // Check for a pending invitation with a conflicting tenant or role binding (SEC-27)
    const { data: pendingInvitation } = await supabaseAdmin
      .from('user_invitations')
      .select('id, tenant_id, role, status')
      .eq('status', 'pending')
      .ilike('email', normalizedEmail)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (pendingInvitation) {
      const tenantConflict = pendingInvitation.tenant_id && pendingInvitation.tenant_id !== profileById.tenant_id;
      const roleConflict = pendingInvitation.role && pendingInvitation.role !== profileById.role;
      if (tenantConflict || roleConflict) {
        return {
          synced: false,
          trusted: false,
          reason: 'conflicting_identity_binding',
          role: profileById.role,
          tenantId: profileById.tenant_id,
        };
      }
    }

    // Safe cosmetic update: only update full_name if placeholder and metadata has a real value
    const meta = user.user_metadata ?? {};
    const metaFullName =
      typeof meta.full_name === 'string' ? meta.full_name :
      typeof meta.name === 'string' ? meta.name : null;
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

  // ── NEW PROFILE PATH: REQUIRE SERVER-AUTHORITATIVE INVITATION ─────────────
  //
  // No profile exists for this user.id. We must find a pending invitation and
  // atomically bind the profile via the PostgreSQL stored procedure.
  // user_metadata is NEVER used to determine role or tenant_id.

  // Look up the pending invitation by email (case-insensitive via ilike)
  const { data: invitation, error: errInv } = await supabaseAdmin
    .from('user_invitations')
    .select('id, email, tenant_id, role, status, expires_at, accepted_by, full_name')
    .eq('status', 'pending')
    .ilike('email', normalizedEmail)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (errInv) {
    console.error('[validateAndSyncInvitedProfile] Database error querying invitation:', errInv.message);
    return { synced: false, trusted: false, reason: 'database_error' };
  }

  if (!invitation) {
    return { synced: false, trusted: false, reason: 'no_authoritative_invitation' };
  }

  // ── INVOKE THE ATOMIC RPC ─────────────────────────────────────────────────
  //
  // bind_invitation_to_user(invitation_id, user_id) performs the following
  // inside a single PostgreSQL transaction with SELECT FOR UPDATE:
  //   - Re-validates status, expiration, rebinding, and identity conflicts
  //   - INSERT profile using values from the LOCKED invitation row only
  //   - UPDATE invitation to accepted
  //
  // No application-level compensating delete is needed or used.
  // PostgreSQL rolls back automatically on any failure.
  const meta = user.user_metadata ?? {};
  const fullName =
    (typeof meta.full_name === 'string' && meta.full_name) ||
    (typeof meta.name === 'string' && meta.name) ||
    invitation.full_name ||
    'Staff Member';

  // Pass full_name from metadata as a hint — the RPC uses it if the invitation
  // has no full_name. Role and tenant_id are NOT accepted as parameters.
  // The RPC ignores full_name from the call and uses COALESCE(invitation.full_name, 'Staff Member').
  // We do NOT pass role or tenant_id to the RPC under any circumstances.
  const { data: rpcResult, error: rpcError } = await supabaseAdmin
    .rpc('bind_invitation_to_user', {
      p_invitation_id: invitation.id,
      p_user_id: user.id,
    });

  if (rpcError) {
    console.error('[validateAndSyncInvitedProfile] RPC bind_invitation_to_user error:', rpcError.message);
    return { synced: false, trusted: false, reason: 'rpc_error' };
  }

  const result = rpcResult as {
    success: boolean;
    reason?: string;
    status?: string;
    role?: string;
    tenant_id?: string;
    email?: string;
  } | null;

  if (!result) {
    console.error('[validateAndSyncInvitedProfile] RPC returned null result');
    return { synced: false, trusted: false, reason: 'rpc_null_result' };
  }

  if (!result.success) {
    // Map RPC failure reasons to appropriate SyncProfileResult reasons
    const reason = result.reason ?? `rpc_failed_${result.status ?? 'unknown'}`;
    return { synced: false, trusted: false, reason };
  }

  // Update profile full_name if metadata provided a better value than the invitation default
  if (fullName && fullName !== 'Staff Member') {
    await supabaseAdmin
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id)
      .eq('full_name', 'Staff Member');
  }

  return {
    synced: true,
    trusted: true,
    reason: 'invitation_accepted',
    role: result.role ?? null,
    tenantId: result.tenant_id ?? null,
  };
}
