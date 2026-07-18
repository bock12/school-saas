import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type TenantRole = 'super_admin' | 'org_admin' | 'school_admin' | 'teacher' | 'student' | 'parent';

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
 * Access matrix:
 *   - super_admin    → any tenant, any role
 *   - org_admin      → their own org + any child schools of that org
 *   - school_admin   → their exact school only
 *   - teacher/student/parent → their exact school only
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
    .select('id, name, type, primary_color, logo_url, parent_id')
    .eq('slug', tenantSlug)
    .single();

  // ── Tenant isolation ─────────────────────────────────────────────────────
  // Access is allowed if:
  //   a) super_admin — platform-wide access
  //   b) user's tenant_id matches this tenant directly
  //   c) org_admin — their org (tenant_id) is the parent of this school
  const isSuperAdmin = profile.role === 'super_admin';
  const isDirectMember = profile.tenant_id === school?.id;
  const isOrgAdminOfParent =
    profile.role === 'org_admin' &&
    school?.parent_id != null &&
    profile.tenant_id === school.parent_id;

  if (!school || (!isSuperAdmin && !isDirectMember && !isOrgAdminOfParent)) {
    await supabase.auth.signOut();
    redirect(`/${tenantSlug}/login`);
  }

  // ── Role check ────────────────────────────────────────────────────────────
  // super_admin and org_admin bypass role checks — they can see everything
  const bypassRoleCheck = isSuperAdmin || profile.role === 'org_admin';
  if (allowedRoles && !bypassRoleCheck && !allowedRoles.includes(profile.role as TenantRole)) {
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
 * Restricts access to school admins and org admins (and super admins) only.
 * Regular teachers, students, and parents will be redirected to the tenant home.
 */
export async function requireSchoolAdmin(tenantSlug: string) {
  return requireTenantRole(tenantSlug, ['school_admin']);
}

/**
 * Restricts access to org admins (and super admins) only.
 */
export async function requireOrgAdmin(tenantSlug: string) {
  return requireTenantRole(tenantSlug, ['org_admin']);
}

/**
 * Restricts access to teachers and school admins (and super admins).
 * Students and parents will be redirected to the tenant home.
 */
export async function requireTeacher(tenantSlug: string) {
  return requireTenantRole(tenantSlug, ['school_admin', 'teacher']);
}
