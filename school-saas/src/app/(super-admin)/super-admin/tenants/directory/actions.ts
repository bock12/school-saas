'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createTenantAdmin } from '@/app/actions/tenant';

export async function getImpersonationLink(tenantId: string, accessToken?: string) {
  const supabase = await createClient();
  
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  console.log("DEBUG: getImpersonationLink Cookies =>", cookieStore.getAll());

  // If we receive an explicit accessToken, use it. Otherwise rely on cookies.
  let user = null;
  let authError = null;

  try {
    if (accessToken) {
      const res = await supabase.auth.getUser(accessToken);
      user = res.data.user;
      authError = res.error;
    } else {
      const res = await supabase.auth.getUser();
      user = res.data.user;
      authError = res.error;
    }
  } catch (e: any) {
    authError = e;
  }

  if (authError || !user) {
    console.error("DEBUG Impersonate Auth Error:", authError);
    console.error("DEBUG accessToken passed:", accessToken ? "YES" : "NO");
    throw new Error(`Your session is out of sync or expired. Please sign out and sign back in. (Internal: ${authError?.message || 'No user found'})`);
  }

  // Check if current user is super_admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'super_admin') {
    throw new Error('Forbidden');
  }

  const supabaseAdmin = createAdminClient();

  let targetUser: { email: string; role: string; id?: string } | null = null;

  // Find a school_admin or org_admin for this tenant
  const { data: adminUser } = await supabaseAdmin
    .from('profiles')
    .select('email, role, id')
    .eq('tenant_id', tenantId)
    .in('role', ['school_admin', 'super_admin', 'org_admin'])
    .not('email', 'is', null)
    .limit(1)
    .maybeSingle();

  if (adminUser) {
    targetUser = adminUser;
  } else {
    // Try to find ANY profile for this tenant as fallback
    const { data: fallbackUser } = await supabaseAdmin
      .from('profiles')
      .select('email, role, id')
      .eq('tenant_id', tenantId)
      .not('email', 'is', null)
      .limit(1)
      .maybeSingle();

    if (fallbackUser) {
      targetUser = fallbackUser;
    } else {
      // Get tenant details
      const { data: tenant } = await supabaseAdmin
        .from('tenants')
        .select('slug, name')
        .eq('id', tenantId)
        .single();

      if (!tenant) {
        throw new Error('Tenant not found.');
      }

      const defaultEmail = `admin@${tenant.slug || 'tenant'}.schoolsaas.com`;
      const defaultName = `Administrator for ${tenant.name}`;
      
      // Auto-create default admin
      const { success, userId } = await createTenantAdmin(defaultEmail, defaultName, 'Admin1234!', tenantId);
      
      if (success && userId) {
        targetUser = {
          email: defaultEmail,
          role: 'school_admin',
          id: userId
        };
      } else {
        throw new Error('No administrator found for this tenant and failed to auto-create one.');
      }
    }
  }

  // Generate Magic Link
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: targetUser.email,
  });

  if (linkError) {
    throw new Error(linkError.message);
  }

  return linkData.properties.action_link;
}
