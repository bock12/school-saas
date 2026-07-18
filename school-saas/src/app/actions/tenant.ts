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
  tempPassword?: string,
  redirectTo?: string
) {
  if (!email) throw new Error('Email is required');
  if (!tenantId) throw new Error('Tenant ID is required');

  const supabaseAdmin = createAdminClient();

  let userId: string | undefined;

  if (tempPassword) {
    // Direct creation with password
    const { data: user, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: name, role, tenant_id: tenantId },
    });

    if (authErr) {
      if (authErr.message.includes('already registered')) {
        throw new Error(`A user with email "${email}" already exists.`);
      }
      throw new Error(`Failed to create admin user: ${authErr.message}`);
    }
    userId = user.user?.id;
  } else {
    // Invite flow
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: name,
        role,
        tenant_id: tenantId,
      },
      redirectTo: redirectTo ?? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback?next=/set-password`,
    });

    if (error) {
      if (error.message.toLowerCase().includes('already registered') ||
          error.message.toLowerCase().includes('already been invited')) {
        throw new Error(`A user with email "${email}" already exists or has a pending invite.`);
      }
      throw new Error(`Failed to send invite to ${email}: ${error.message}`);
    }
    userId = data.user?.id;
  }

  // Pre-create the profile row so tenant isolation checks work immediately.
  // If the user already exists in profiles (from a prior invite), this is a no-op.
  if (userId) {
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
      id: userId,
      email,
      full_name: name || 'Admin',
      role,
      tenant_id: tenantId,
    }, { onConflict: 'id', ignoreDuplicates: false });

    if (profileError) {
      console.error("[inviteTenantAdmin] Profile upsert failed:", profileError);
      
      // Rollback the created Auth user to prevent an orphaned account without a profile
      await supabaseAdmin.auth.admin.deleteUser(userId);
      
      throw new Error(`Failed to initialize user profile: ${profileError.message}`);
    }
  }

  return { success: true, userId };
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

/**
 * Completely deletes a tenant (and its child schools) from the system.
 * Crucially, it finds all users associated with these tenants and deletes
 * their actual Supabase Auth accounts before deleting the tenant rows.
 */
export async function deleteTenantCompletely(tenantId: string) {
  if (!tenantId) throw new Error('Tenant ID is required');

  const supabaseAdmin = createAdminClient();

  // 1. Get all child tenants (if any)
  const { data: children } = await supabaseAdmin
    .from('tenants')
    .select('id')
    .eq('parent_id', tenantId);
  
  const tenantIds = [tenantId, ...(children?.map(c => c.id) || [])];

  // 2. Find all profiles belonging to these tenants
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .in('tenant_id', tenantIds);

  // 3. Delete all auth users using Supabase Auth Admin API
  // We do this BEFORE deleting the tenant so that we have the profile records to loop through.
  // Deleting the auth user automatically cascades and deletes the profile row anyway.
  if (profiles && profiles.length > 0) {
    for (const profile of profiles) {
      const { error: deleteAuthErr } = await supabaseAdmin.auth.admin.deleteUser(profile.id);
      if (deleteAuthErr) {
        console.error(`Failed to delete auth user ${profile.id}:`, deleteAuthErr.message);
      }
    }
  }

  // 4. Delete the child tenants
  if (children && children.length > 0) {
    const { error: childError } = await supabaseAdmin
      .from('tenants')
      .delete()
      .eq('parent_id', tenantId);
    
    if (childError) throw new Error(`Failed to delete children: ${childError.message}`);
  }

  // 5. Delete the parent tenant
  const { error } = await supabaseAdmin
    .from('tenants')
    .delete()
    .eq('id', tenantId);

  if (error) throw new Error(`Failed to delete tenant: ${error.message}`);

  return { success: true };
}

export async function addSchoolToOrg(
  orgId: string,
  opts: {
    name: string;
    slug: string;
    schoolType: string;
    schoolLevels?: string[];
    schoolShifts?: string[];
    adminEmail?: string;
    adminName?: string;
    adminPassword?: string;
  }
) {
  const { hierarchyApi } = await import('@/features/tenant-management/api/hierarchy.api');
  try {
    const result = await hierarchyApi.addSchoolToOrganization(orgId, opts);

    // Optionally create a school admin for the new school
    if (opts.adminEmail) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
      // next param points the callback to the new school's set-password page
      const redirectTo = `${appUrl}/api/auth/callback?next=/${opts.slug}/set-password`;
      await inviteTenantAdmin(
        opts.adminEmail,
        opts.adminName ?? 'School Admin',
        result.id,
        'school_admin',
        opts.adminPassword,
        redirectTo
      );
    }

    return { success: true, schoolId: result.id };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to add school.' };
  }
}

/**
 * Assigns an admin to a school.
 * Can re-assign an existing profile (by profileId) or create/invite a new user (by email).
 */
export async function assignSchoolAdmin(
  schoolId: string,
  schoolSlug: string,
  opts: {
    profileId?: string;        // existing user — just re-assign their tenant
    email?: string;            // new user
    name?: string;
    tempPassword?: string;     // if provided, use password mode; otherwise invite
  }
) {
  if (!schoolId) return { success: false, error: 'School ID is required.' };
  if (!opts.profileId && !opts.email) return { success: false, error: 'Either a staff profile or email is required.' };

  const supabaseAdmin = createAdminClient();

  try {
    if (opts.profileId) {
      // Re-assign existing profile to this school
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ tenant_id: schoolId, role: 'school_admin' })
        .eq('id', opts.profileId);
      if (error) throw new Error(error.message);
    } else if (opts.email) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
      const redirectTo = `${appUrl}/api/auth/callback?next=/${schoolSlug}/set-password`;
      await inviteTenantAdmin(opts.email, opts.name ?? 'School Admin', schoolId, 'school_admin', opts.tempPassword, redirectTo);
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to assign admin.' };
  }
}

/**
 * Adds a new staff member to an org or one of its schools.
 */
export async function addStaffMember(
  orgId: string,
  opts: {
    email: string;
    name: string;
    role: string;
    tenantId: string;   // could be orgId or a school's id
    tenantSlug: string;
    department?: string;
    office?: string;
    jobTitle?: string;
    staffId?: string;
    phone?: string;
    tempPassword?: string;
  }
) {
  if (!opts.email) return { success: false, error: 'Email is required.' };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const redirectTo = `${appUrl}/api/auth/callback?next=/${opts.tenantSlug}/set-password`;

  try {
    const result = await inviteTenantAdmin(
      opts.email,
      opts.name,
      opts.tenantId,
      opts.role as AdminRole,
      opts.tempPassword,
      redirectTo
    );

    // Patch extra profile fields
    if (result.userId) {
      const supabaseAdmin = createAdminClient();
      await supabaseAdmin.from('profiles').update({
        department: opts.department ?? null,
        office: opts.office ?? null,
        job_title: opts.jobTitle ?? null,
        staff_id: opts.staffId ?? null,
        phone: opts.phone ?? null,
      }).eq('id', result.userId);
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to add staff member.' };
  }
}

/**
 * Bulk-imports staff members from a CSV-parsed array.
 * Returns a per-row result array for error reporting.
 */
export async function bulkImportStaff(
  rows: {
    email: string;
    name: string;
    role: string;
    tenantId: string;
    tenantSlug: string;
    department?: string;
  }[]
) {
  const results: { email: string; success: boolean; error?: string }[] = [];

  for (const row of rows) {
    const res = await addStaffMember(row.tenantId, {
      email: row.email,
      name: row.name,
      role: row.role,
      tenantId: row.tenantId,
      tenantSlug: row.tenantSlug,
      department: row.department,
    });
    results.push({ email: row.email, ...res });
  }

  return results;
}

/**
 * Saves branding settings for a tenant.
 */
export async function saveBrandingSettings(
  tenantId: string,
  data: {
    name?: string;
    primary_color?: string;
    secondary_color?: string;
    logo_url?: string;
    favicon_url?: string;
    custom_font?: string;
    custom_domain?: string;
    email_sender_name?: string;
    email_reply_to?: string;
    hide_platform_branding?: boolean;
    login_bg_url?: string;
  }
) {
  if (!tenantId) return { success: false, error: 'Tenant ID required.' };
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin
    .from('tenants')
    .update(data)
    .eq('id', tenantId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Saves org-level general/security settings.
 */
export async function saveOrgSettings(
  tenantId: string,
  data: Record<string, unknown>
) {
  if (!tenantId) return { success: false, error: 'Tenant ID required.' };
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin
    .from('org_settings')
    .upsert({ tenant_id: tenantId, ...data, updated_at: new Date().toISOString() }, { onConflict: 'tenant_id' });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

