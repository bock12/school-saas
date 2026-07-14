'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function getImpersonationLink(tenantId: string, accessToken?: string) {
  const supabase = await createClient();
  
  // If we receive an explicit accessToken, use it. Otherwise rely on cookies.
  const { data: { user }, error: authError } = accessToken 
    ? await supabase.auth.getUser(accessToken)
    : await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(`Unauthorized. Error: ${authError?.message || 'No user found with provided token.'}`);
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

  // Find a school_admin or org_admin for this tenant
  const { data: targetUser, error: targetError } = await supabaseAdmin
    .from('profiles')
    .select('email, role')
    .eq('tenant_id', tenantId)
    .in('role', ['school_admin', 'super_admin', 'org_admin'])
    .not('email', 'is', null)
    .limit(1)
    .single();

  if (targetError || !targetUser || !targetUser.email) {
    throw new Error('No administrator found for this tenant.');
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
