import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  // Fetch profile to get role and tenant
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return { user, profile };
}

export async function requireAuth(tenantSlug?: string) {
  const data = await getCurrentUser();
  if (!data?.user) {
    if (tenantSlug) {
      redirect(`/${tenantSlug}/login`);
    } else {
      redirect('/login');
    }
  }
  return data;
}

export async function requireRole(allowedRoles: string[], tenantSlug?: string) {
  const data = await requireAuth(tenantSlug);
  
  if (!data.profile || !allowedRoles.includes(data.profile.role)) {
    if (tenantSlug) {
      redirect(`/${tenantSlug}`);
    } else {
      redirect('/super-admin');
    }
  }

  return data;
}
