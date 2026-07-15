'use server';

import { createAdminClient } from '@/lib/supabase/admin';

export type AdminRole = 'school_admin' | 'org_admin' | 'super_admin';

/**
 * Invites a user to be an admin for a tenant using Supabase's invite flow.
 * Sends an email with a secure magic link. The invited user sets their own password.
 * Role and tenant_id are stored in user_metadata so they can be applied on first login.
 */
export async function inviteTenantAdmin(
  email: string,
  name: string,
  tenantId: string,
  role: AdminRole = 'school_admin',
  redirectTo?: string
) {
  if (!email) throw new Error('Email is required');
  if (!tenantId) throw new Error('Tenant ID is required');

  const supabaseAdmin = createAdminClient();

  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: {
      full_name: name,
      role,
      tenant_id: tenantId,
    },
    redirectTo: redirectTo ?? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
  });

  if (error) {
    if (error.message.toLowerCase().includes('already registered') ||
        error.message.toLowerCase().includes('already been invited')) {
      throw new Error(`A user with email "${email}" already exists or has a pending invite.`);
    }
    throw new Error(`Failed to send invite to ${email}: ${error.message}`);
  }

  // Pre-create the profile row so tenant isolation checks work immediately.
  // If the user already exists in profiles (from a prior invite), this is a no-op.
  if (data.user) {
    await supabaseAdmin.from('profiles').upsert({
      id: data.user.id,
      email,
      full_name: name || 'Admin',
      role,
      tenant_id: tenantId,
    }, { onConflict: 'id', ignoreDuplicates: false });
  }

  return { success: true, userId: data.user?.id };
}

/**
 * @deprecated Use inviteTenantAdmin instead.
 * Kept for backwards compatibility. Creates a user with a password directly.
 */
export async function createTenantAdmin(email: string, name: string, tempPassword?: string, tenantId?: string) {
  if (!email) throw new Error('Email is required');

  const supabaseAdmin = createAdminClient();
  const password = tempPassword || Math.random().toString(36).slice(-10) + 'A1!';

  const { data: user, error: authErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
  });

  if (authErr) {
    if (authErr.message.includes('already registered')) {
      throw new Error('A user with this email already exists.');
    }
    throw new Error(`Failed to create admin user: ${authErr.message}`);
  }

  if (user.user && tenantId) {
    await supabaseAdmin.from('profiles').upsert({
      id: user.user.id,
      email,
      full_name: name || 'Admin',
      role: 'school_admin',
      tenant_id: tenantId,
    }, { onConflict: 'id', ignoreDuplicates: false });
  }

  return { success: true, userId: user.user?.id };
}
