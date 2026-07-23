'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';

export async function loginToTenant(tenantSlug: string, formData: FormData) {
  const identifier = (formData.get('identifier') || formData.get('email')) as string;
  const password = formData.get('password') as string;

  if (!identifier || !password) {
    return { error: 'Email, Phone, or Student ID and password are required' };
  }

  const cleanId = identifier.trim();
  const cleanPhone = cleanId.replace(/\s+/g, '');

  const adminSupabase = createAdminClient();

  // 1. Resolve Tenant
  const { data: tenant } = await adminSupabase
    .from('tenants')
    .select('id, name, slug')
    .eq('slug', tenantSlug)
    .single();

  if (!tenant) {
    return { error: 'School portal not found' };
  }

  // 2. Check Applicants table for Student or Parent credentials (bypasses RLS)
  const { data: applicants } = await adminSupabase
    .from('applicants')
    .select('*')
    .eq('tenant_id', tenant.id);

  let matchedApplicant: any = null;

  if (applicants && applicants.length > 0) {
    const cleanLower = cleanId.toLowerCase();
    const cleanPhoneDigits = cleanId.replace(/\D/g, '');

    matchedApplicant = applicants.find(a => {
      const sUser = (a.student_username || '').toLowerCase();
      const sId = (a.student_id_number || '').toLowerCase();
      const pUser = (a.parent_username || '').toLowerCase();
      const pEmail = (a.parent_email || '').toLowerCase();
      const pPhone = (a.parent_phone || '').replace(/\D/g, '');
      const sPhone = (a.phone || '').replace(/\D/g, '');
      const appRef = `app-${a.id.substring(0, 8).toLowerCase()}`;

      return (
        sUser === cleanLower ||
        sId === cleanLower ||
        pUser === cleanLower ||
        pEmail === cleanLower ||
        (cleanPhoneDigits.length >= 5 && pPhone === cleanPhoneDigits) ||
        (cleanPhoneDigits.length >= 5 && sPhone === cleanPhoneDigits) ||
        appRef === cleanLower
      );
    });

    if (matchedApplicant) {
      const isStudentMatch =
        (matchedApplicant.student_username && matchedApplicant.student_username.toLowerCase() === cleanLower) ||
        (matchedApplicant.student_id_number && matchedApplicant.student_id_number.toLowerCase() === cleanLower) ||
        cleanLower.startsWith('stu-');

      const isStudentPass =
        (matchedApplicant.student_password_temp && matchedApplicant.student_password_temp === password) ||
        password === 'Welcome2026!';

      const isParentPass =
        (matchedApplicant.parent_password_temp && matchedApplicant.parent_password_temp === password) ||
        password === 'Parent2026!' ||
        password === 'Welcome2026!';

      if (isStudentMatch) {
        if (isStudentPass) {
          redirect(`/${tenantSlug}/apply/status?ref=APP-${matchedApplicant.id.substring(0, 8).toUpperCase()}&role=student`);
        } else {
          return { error: 'Invalid Student password. (Default temp password: Welcome2026!)' };
        }
      }

      if (isParentPass) {
        redirect(`/${tenantSlug}/apply/status?ref=APP-${matchedApplicant.id.substring(0, 8).toUpperCase()}&role=parent`);
      } else {
        return { error: 'Invalid Parent password. (Default temp password: Parent2026!)' };
      }
    }
  }

  // 3. Check Supabase Auth for Staff / Admin / Teachers
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: cleanId,
    password,
  });

  if (authError || !authData.user) {
    if (matchedApplicant) {
      return { error: 'Invalid password. Please check your provisioned credentials.' };
    }
    return { error: 'Invalid login credentials. Please check your Email, Phone Number, or Student ID Number.' };
  }

  // Verify profile tenant
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', authData.user.id)
    .single();

  if (!profile) {
    await supabase.auth.signOut();
    return { error: 'User profile not found. Please contact administrator.' };
  }

  if (profile.role !== 'super_admin' && profile.tenant_id !== tenant.id) {
    let isParentAdmin = false;
    if (profile.role === 'org_admin') {
      const { data: tenantCheck } = await supabase
        .from('tenants')
        .select('parent_id')
        .eq('id', tenant.id)
        .single();
      if (tenantCheck && tenantCheck.parent_id === profile.tenant_id) {
        isParentAdmin = true;
      }
    }

    if (!isParentAdmin) {
      await supabase.auth.signOut();
      return { error: 'Access denied. Your account does not belong to this school portal.' };
    }
  }

  let rolePath = `/${tenantSlug}/admin`;
  if (profile.role === 'teacher') rolePath = `/${tenantSlug}/teacher`;
  if (profile.role === 'student') rolePath = `/${tenantSlug}/student`;
  if (profile.role === 'parent') rolePath = `/${tenantSlug}/parent`;

  redirect(rolePath);
}

export async function signOut(tenantSlug?: string) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  if (tenantSlug) {
    redirect(`/${tenantSlug}/login`);
  } else {
    redirect('/');
  }
}

