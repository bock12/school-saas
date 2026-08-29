import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function TenantDashboardRedirectPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch tenant info
  const { data: tenantData } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', tenant)
    .single();

  if (!tenantData) {
    redirect('/login');
  }

  // Fetch profile role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .eq('tenant_id', tenantData.id)
    .single();

  const role = profile?.role || user.user_metadata?.role;

  if (role === 'teacher') {
    redirect(`/${tenant}/teacher`);
  } else if (role === 'student') {
    redirect(`/${tenant}/student`);
  } else if (role === 'parent') {
    redirect(`/${tenant}/parent`);
  } else if (role === 'super_admin') {
    redirect(`/${tenant}/super-admin`);
  } else {
    // Default to tenant admin dashboard
    redirect(`/${tenant}/admin`);
  }
}
