'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function loginToTenant(tenantSlug: string, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  const supabase = await createClient();

  // 1. Verify tenant exists
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('id, name')
    .eq('slug', tenantSlug)
    .single();

  if (tenantError || !tenant) {
    return { error: 'School portal not found' };
  }

  // 2. Sign in the user
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    return { error: 'Invalid email or password' };
  }

  // 3. Verify user belongs to this tenant (Check profiles)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, tenant_id')
    .eq('id', authData.user.id)
    .eq('tenant_id', tenant.id)
    .single();

  if (profileError || !profile) {
    // User signed in but doesn't belong to this tenant! Sign them out immediately.
    await supabase.auth.signOut();
    return { error: 'You do not have access to this school portal' };
  }

  // Auth successful, user belongs to tenant. Redirect to tenant dashboard.
  redirect(`/${tenantSlug}`);
}

export async function signOut(tenantSlug?: string) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  if (tenantSlug) {
    redirect(`/${tenantSlug}/login`);
  } else {
    redirect('/login');
  }
}
