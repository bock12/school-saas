'use server';

import { createAdminClient } from '@/lib/supabase/admin';

// Reusing AdminRole type pattern
export type AppRole = 'super_admin' | 'org_admin' | 'school_admin' | 'teacher' | 'student' | 'parent';

export async function toggleUserStatus(userId: string, currentStatus: boolean) {
  const supabaseAdmin = createAdminClient();
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
) {
  const supabaseAdmin = createAdminClient();
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
  const supabaseAdmin = createAdminClient();
  
  // Deleting from auth.users cascades to profiles automatically
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function sendPasswordReset(email: string, tenantSlug: string) {
  const supabaseAdmin = createAdminClient();
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
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}
