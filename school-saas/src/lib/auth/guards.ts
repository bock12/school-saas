import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type TenantRole = 'super_admin' | 'school_admin' | 'teacher' | 'student' | 'parent';

// ---------------------------------------------------------------------------
// Super Admin Guard
// ---------------------------------------------------------------------------

/**
 * Ensures the current user is a super admin.
 * If not authenticated, redirects to the admin login page.
 * If authenticated but not a super admin, signs out and redirects to the admin login page.
 */
export async function requireSuperAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'super_admin') {
    await supabase.auth.signOut();
    redirect('/login');
  }

  return { user, profile };
}

// ---------------------------------------------------------------------------
// Tenant Guards
// ---------------------------------------------------------------------------

/**
 * Ensures the current user is authorized to access the specified tenant,
 * and optionally that their role matches one of the allowed roles.
 *
 * @param tenantSlug  The URL slug of the tenant
 * @param allowedRoles  Optional list of roles permitted. If omitted, any role belonging to this tenant is allowed.
 */
export async function requireTenantRole(tenantSlug: string, allowedRoles?: TenantRole[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${tenantSlug}/login`);
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, role, tenant_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    redirect(`/${tenantSlug}/login`);
  }

  const { data: school } = await supabase
    .from('tenants')
    .select('id, name, primary_color, logo_url')
    .eq('slug', tenantSlug)
    .single();

  // Tenant isolation: super_admin can access any tenant; others must belong to this school
  if (!school || (profile.role !== 'super_admin' && profile.tenant_id !== school.id)) {
    await supabase.auth.signOut();
    redirect(`/${tenantSlug}/login`);
  }

  // Role-specific check: if allowedRoles is provided, enforce it
  // (super_admin bypasses role check — they can see everything)
  if (allowedRoles && profile.role !== 'super_admin' && !allowedRoles.includes(profile.role as TenantRole)) {
    // User belongs to the tenant but doesn't have the required role
    // Redirect to their tenant home rather than signing them out
    redirect(`/${tenantSlug}`);
  }

  return { user, profile, school };
}

/**
 * Allows any authenticated user who belongs to this tenant.
 * Convenience alias for requireTenantRole without role restriction.
 */
export async function requireTenantUser(tenantSlug: string) {
  return requireTenantRole(tenantSlug);
}

/**
 * Restricts access to school admins (and super admins) only.
 * Regular teachers, students, and parents will be redirected to the tenant home.
 */
export async function requireSchoolAdmin(tenantSlug: string) {
  return requireTenantRole(tenantSlug, ['school_admin']);
}

/**
 * Restricts access to teachers and school admins (and super admins).
 * Students and parents will be redirected to the tenant home.
 */
export async function requireTeacher(tenantSlug: string) {
  return requireTenantRole(tenantSlug, ['school_admin', 'teacher']);
}
