'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

// Reusing AdminRole type pattern
export type AppRole = 'super_admin' | 'org_admin' | 'school_admin' | 'teacher' | 'student' | 'parent' | 'exam_officer';

type ActorRole = AppRole;

type ProfileRecord = {
  id: string;
  tenant_id: string | null;
  role: ActorRole;
  email: string | null;
  full_name?: string | null;
  is_active?: boolean | null;
};

type TenantRecord = {
  id: string;
  slug: string;
  parent_id: string | null;
  type: string | null;
};

type ActionResult = { success: true } | { success: false; error: string };

const SCHOOL_ADMIN_MANAGEABLE_ROLES = new Set<ActorRole>(['teacher', 'student', 'parent', 'exam_officer']);
const ORG_ADMIN_ASSIGNABLE_ROLES = new Set<ActorRole>(['org_admin', 'school_admin', 'teacher', 'student', 'parent', 'exam_officer']);

async function getActorProfile(): Promise<ProfileRecord | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, tenant_id, role, email, full_name, is_active')
    .eq('id', user.id)
    .single();

  if (!profile?.is_active) return null;

  return profile as ProfileRecord;
}

async function getTargetProfile(
  supabaseAdmin: ReturnType<typeof createAdminClient>,
  userId: string
): Promise<ProfileRecord | null> {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, tenant_id, role, email, full_name, is_active')
    .eq('id', userId)
    .single();

  return (profile as ProfileRecord | null) ?? null;
}

async function getTenant(
  supabaseAdmin: ReturnType<typeof createAdminClient>,
  tenantId: string | null
): Promise<TenantRecord | null> {
  if (!tenantId) return null;

  const { data: tenant } = await supabaseAdmin
    .from('tenants')
    .select('id, slug, parent_id, type')
    .eq('id', tenantId)
    .single();

  return (tenant as TenantRecord | null) ?? null;
}

async function getTenantBySlug(
  supabaseAdmin: ReturnType<typeof createAdminClient>,
  tenantSlug: string
): Promise<TenantRecord | null> {
  const { data: tenant } = await supabaseAdmin
    .from('tenants')
    .select('id, slug, parent_id, type')
    .eq('slug', tenantSlug)
    .single();

  return (tenant as TenantRecord | null) ?? null;
}

async function canManageTarget(
  supabaseAdmin: ReturnType<typeof createAdminClient>,
  actor: ProfileRecord,
  target: ProfileRecord
) {
  if (actor.id === target.id) {
    return { allowed: false, error: 'You cannot perform this action on your own account.' };
  }

  if (actor.role === 'super_admin') {
    return { allowed: true };
  }

  if (target.role === 'super_admin') {
    return { allowed: false, error: 'Only super admins can manage super admin accounts.' };
  }

  if (!actor.tenant_id || !target.tenant_id) {
    return { allowed: false, error: 'User tenant scope could not be verified.' };
  }

  if (actor.role === 'org_admin') {
    if (target.tenant_id === actor.tenant_id) {
      return { allowed: true };
    }

    const targetTenant = await getTenant(supabaseAdmin, target.tenant_id);
    if (targetTenant?.parent_id === actor.tenant_id) {
      return { allowed: true };
    }

    return { allowed: false, error: 'Target user is outside your organization.' };
  }

  if (actor.role === 'school_admin') {
    if (target.tenant_id !== actor.tenant_id) {
      return { allowed: false, error: 'Target user is outside your school.' };
    }

    if (!SCHOOL_ADMIN_MANAGEABLE_ROLES.has(target.role)) {
      return { allowed: false, error: 'School admins cannot manage admin accounts.' };
    }

    return { allowed: true };
  }

  return { allowed: false, error: 'You do not have permission to manage users.' };
}

async function authorizeUserAction(userId: string) {
  const supabaseAdmin = createAdminClient();
  const actor = await getActorProfile();

  if (!actor) {
    return { success: false as const, error: 'Authentication required.' };
  }

  const target = await getTargetProfile(supabaseAdmin, userId);
  if (!target) {
    return { success: false as const, error: 'Target user was not found.' };
  }

  const access = await canManageTarget(supabaseAdmin, actor, target);
  if (!access.allowed) {
    return { success: false as const, error: access.error ?? 'User action is not allowed.' };
  }

  return { success: true as const, supabaseAdmin, actor, target };
}

function canAssignRole(actor: ProfileRecord, target: ProfileRecord, nextRole: ActorRole) {
  if (actor.role === 'super_admin') return { allowed: true };

  if (nextRole === 'super_admin') {
    return { allowed: false, error: 'Only super admins can assign the super admin role.' };
  }

  if (actor.role === 'org_admin') {
    if (!ORG_ADMIN_ASSIGNABLE_ROLES.has(nextRole)) {
      return { allowed: false, error: 'This role cannot be assigned by an org admin.' };
    }
    return { allowed: true };
  }

  if (actor.role === 'school_admin') {
    if (!SCHOOL_ADMIN_MANAGEABLE_ROLES.has(target.role) || !SCHOOL_ADMIN_MANAGEABLE_ROLES.has(nextRole)) {
      return { allowed: false, error: 'School admins can assign only teacher, student, parent, or exam officer roles.' };
    }
    return { allowed: true };
  }

  return { allowed: false, error: 'You do not have permission to assign roles.' };
}

export async function toggleUserStatus(userId: string, currentStatus: boolean): Promise<ActionResult> {
  const auth = await authorizeUserAction(userId);
  if (!auth.success) return auth;

  const { supabaseAdmin } = auth;
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ is_active: !currentStatus })
    .eq('id', userId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function updateUserRole(
  userId: string,
  role: AppRole,
  jobTitle?: string
): Promise<ActionResult> {
  const auth = await authorizeUserAction(userId);
  if (!auth.success) return auth;

  const { supabaseAdmin, actor, target } = auth;
  const assignment = canAssignRole(actor, target, role);
  if (!assignment.allowed) {
    return { success: false, error: assignment.error ?? 'Role assignment is not allowed.' };
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ role, job_title: jobTitle ?? null })
    .eq('id', userId);

  if (error) return { success: false, error: error.message };
  
  // Update the auth user's metadata as well so it's in sync
  const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (user?.user?.user_metadata) {
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...user.user.user_metadata,
        role,
        job_title: jobTitle ?? null
      }
    });
  }

  return { success: true };
}

export async function deleteUserAccount(userId: string) {
  const auth = await authorizeUserAction(userId);
  if (!auth.success) return auth;

  const { supabaseAdmin } = auth;
  
  // Deleting from auth.users cascades to profiles automatically
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function sendPasswordReset(email: string, tenantSlug: string) {
  const supabaseAdmin = createAdminClient();
  const actor = await getActorProfile();
  if (!actor) {
    return { success: false, error: 'Authentication required.' };
  }

  const tenant = await getTenantBySlug(supabaseAdmin, tenantSlug);
  if (!tenant) {
    return { success: false, error: 'Tenant was not found.' };
  }

  const { data: target } = await supabaseAdmin
    .from('profiles')
    .select('id, tenant_id, role, email, full_name, is_active')
    .eq('email', email)
    .maybeSingle();

  if (!target) {
    return { success: false, error: 'Target user was not found.' };
  }

  const targetProfile = target as ProfileRecord;
  if (targetProfile.tenant_id !== tenant.id) {
    return { success: false, error: 'Target user does not belong to this tenant.' };
  }

  const access = await canManageTarget(supabaseAdmin, actor, targetProfile);
  if (!access.allowed) {
    return { success: false, error: access.error ?? 'Password reset is not allowed.' };
  }

  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'localhost:3000';
  const protocol = appDomain.includes('localhost') ? 'http' : 'https';
  
  // Redirect to the tenant's password reset page
  const redirectTo = `${protocol}://${tenantSlug}.${appDomain}/api/auth/callback?next=/set-password`;

  const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
    redirectTo
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function resetUserPasswordManually(userId: string, newPassword: string) {
  const auth = await authorizeUserAction(userId);
  if (!auth.success) return auth;

  const { supabaseAdmin } = auth;
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}
