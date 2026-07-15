import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

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

/**
 * Ensures the current user is authorized to access the specified tenant.
 * If not authenticated, redirects to the tenant login page.
 * If authenticated but not authorized for the tenant, signs out and redirects to the tenant login page.
 * 
 * @param tenantSlug The URL slug of the tenant
 */
export async function requireTenantUser(tenantSlug: string) {
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

  if (!school || (profile.role !== 'super_admin' && profile.tenant_id !== school.id)) {
    await supabase.auth.signOut();
    redirect(`/${tenantSlug}/login`);
  }

  return { user, profile, school };
}
