import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

export interface UserInvitation {
  id: string;
  email: string;
  tenant_id: string;
  role: string;
  full_name?: string | null;
  created_by?: string | null;
  created_at?: string;
  expires_at: string;
  accepted_at?: string | null;
  accepted_by?: string | null;
  token?: string | null;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
}

export interface ActorContext {
  id: string;
  role: string;
  tenant_id: string | null;
}

export interface CreateInvitationParams {
  email: string;
  tenantId: string;
  role: string;
  fullName?: string;
  expiresInDays?: number;
}

export interface InvitationResult {
  success: boolean;
  invitation?: UserInvitation;
  error?: string;
}

/**
 * Validates whether an actor has authorization to issue an invitation for the requested tenant and role.
 */
export async function canActorIssueInvitation(
  actor: ActorContext,
  targetTenantId: string,
  targetRole: string,
  adminClient: ReturnType<typeof createAdminClient>
): Promise<{ allowed: boolean; error?: string }> {
  if (!actor || !actor.role) {
    return { allowed: false, error: 'Authentication required to issue invitations.' };
  }

  // Super admin can invite to any tenant and any role
  if (actor.role === 'super_admin') {
    return { allowed: true };
  }

  // Non-super-admins cannot invite super_admins
  if (targetRole === 'super_admin') {
    return { allowed: false, error: 'Only platform super admins can invite super admin users.' };
  }

  if (!actor.tenant_id) {
    return { allowed: false, error: 'Actor tenant scope is not defined.' };
  }

  // Org admin can invite to own org or any child school of that org
  if (actor.role === 'org_admin') {
    if (targetTenantId === actor.tenant_id) {
      return { allowed: true };
    }

    const { data: tenant } = await adminClient
      .from('tenants')
      .select('id, parent_id')
      .eq('id', targetTenantId)
      .maybeSingle();

    if (tenant?.parent_id === actor.tenant_id) {
      return { allowed: true };
    }

    return { allowed: false, error: 'Target tenant is outside your organization hierarchy.' };
  }

  // School admin can invite only within their own school
  if (actor.role === 'school_admin') {
    if (targetTenantId !== actor.tenant_id) {
      return { allowed: false, error: 'School admins can only invite users to their own school.' };
    }

    if (targetRole === 'org_admin') {
      return { allowed: false, error: 'School admins cannot invite organization administrators.' };
    }

    return { allowed: true };
  }

  return { allowed: false, error: 'You do not have permission to issue user invitations.' };
}

/**
 * Creates an authoritative invitation record in the `user_invitations` table.
 * Fails closed on database failure or authorization violation.
 */
export async function createAuthoritativeInvitation(
  params: CreateInvitationParams,
  actor?: ActorContext,
  adminClientFactory: () => ReturnType<typeof createAdminClient> = createAdminClient
): Promise<InvitationResult> {
  const { email, tenantId, role, fullName, expiresInDays = 7 } = params;

  if (!email || !email.includes('@')) {
    return { success: false, error: 'A valid email address is required.' };
  }
  if (!tenantId) {
    return { success: false, error: 'Tenant ID is required.' };
  }
  if (!role) {
    return { success: false, error: 'Role is required.' };
  }

  const supabaseAdmin = adminClientFactory();
  const normalizedEmail = email.trim().toLowerCase();

  // If actor is provided, enforce authorization hierarchy
  if (actor) {
    const authCheck = await canActorIssueInvitation(actor, tenantId, role, supabaseAdmin);
    if (!authCheck.allowed) {
      return { success: false, error: authCheck.error ?? 'Unauthorized to issue invitation.' };
    }
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  // Expire/revoke any prior pending invitations for this email + tenant
  const { error: revokeError } = await supabaseAdmin
    .from('user_invitations')
    .update({ status: 'revoked' })
    .eq('email', normalizedEmail)
    .eq('tenant_id', tenantId)
    .eq('status', 'pending');

  if (revokeError) {
    console.error('[createAuthoritativeInvitation] Failed to revoke prior invitations:', revokeError.message);
    return { success: false, error: `Failed to prepare invitation: ${revokeError.message}` };
  }

  // Insert the new authoritative invitation
  const newInvitation = {
    email: normalizedEmail,
    tenant_id: tenantId,
    role,
    full_name: fullName?.trim() || null,
    created_by: actor?.id ?? null,
    expires_at: expiresAt.toISOString(),
    status: 'pending' as const,
  };

  const { data, error: insertError } = await supabaseAdmin
    .from('user_invitations')
    .insert(newInvitation)
    .select()
    .single();

  if (insertError) {
    console.error('[createAuthoritativeInvitation] Insert error:', insertError.message);
    return { success: false, error: `Failed to record invitation: ${insertError.message}` };
  }

  return { success: true, invitation: data as UserInvitation };
}
