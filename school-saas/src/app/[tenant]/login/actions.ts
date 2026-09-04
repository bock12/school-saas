'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPgPool } from '@/lib/db/pg-fallback';
import { redirect } from 'next/navigation';

export async function loginToTenant(tenantSlug: string, formData: FormData) {
  const identifier = (formData.get('identifier') || formData.get('email')) as string;
  const password = formData.get('password') as string;

  if (!identifier || !password) {
    return { error: 'Email, Phone, or Student ID and password are required' };
  }

  const cleanId = identifier.trim();
  const cleanLower = cleanId.toLowerCase();

  // Helper to normalize phone numbers (strips non-digits and removes country code 232 or leading 0)
  const getPhoneDigits = (ph: string) => (ph || '').replace(/\D/g, '');
  const normalizePhone = (ph: string) => {
    const d = getPhoneDigits(ph);
    if (!d) return '';
    if (d.startsWith('232') && d.length > 3) return d.slice(3);
    if (d.startsWith('0') && d.length > 1) return d.slice(1);
    return d;
  };

  const inputPhoneNorm = normalizePhone(cleanId);
  const adminSupabase = createAdminClient();
  const pool = getPgPool();

  // 1. Resolve Super Admin authentication
  const isSuperAdminPortal = tenantSlug === 'admin' || tenantSlug === 'super-admin';
  const supabase = await createClient();

  let emailToAuth = cleanLower;
  if (emailToAuth === 'superadmin' || emailToAuth === 'super_admin' || emailToAuth === 'admin') {
    emailToAuth = 'superadmin@schoolsaas.com';
  }

  // If signing into super admin portal or if identifier belongs to superadmin
  if (isSuperAdminPortal || emailToAuth.includes('superadmin')) {
    const { data: saAuthData, error: saAuthErr } = await supabase.auth.signInWithPassword({
      email: emailToAuth,
      password,
    });

    if (saAuthErr) {
      return { error: saAuthErr.message };
    }

    if (saAuthData?.user) {
      const { data: saProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', saAuthData.user.id)
        .single();

      if (saProfile?.role === 'super_admin') {
        redirect('/super-admin');
      } else {
        await supabase.auth.signOut();
        return { error: 'Access denied. Account is not a Super Administrator.' };
      }
    }
  }

  // 1b. Resolve Tenant via PG Pool first, then fallback to Supabase
  let tenant: { id: string; name: string; slug: string; parent_id: string | null } | null = null;
  if (pool) {
    try {
      const res = await pool.query(
        `SELECT id, name, slug, parent_id
         FROM tenants
         WHERE slug = $1
         LIMIT 1`,
        [tenantSlug]
      );
      if (res.rows.length > 0) {
        tenant = res.rows[0];
      }
    } catch (pgErr) {
      console.warn('[loginToTenant] Direct PG lookup error:', pgErr);
    }
  }

  if (!tenant) {
    const { data: tenantData } = await adminSupabase
      .from('tenants')
      .select('id, name, slug, parent_id')
      .eq('slug', tenantSlug)
      .maybeSingle();

    if (tenantData) {
      tenant = tenantData;
    }
  }

  if (!tenant) {
    return { error: 'School portal not found' };
  }

  // 2. Targeted fetch of Applicant records
  let searchToken = cleanId;
  if (cleanLower.includes('@student.schoolsaas.com')) {
    searchToken = cleanLower.split('@')[0];
  }

  let orQuery = `student_username.ilike.${searchToken},student_id_number.ilike.${searchToken},parent_username.ilike.${cleanId},parent_email.ilike.${cleanId}`;
  if (inputPhoneNorm.length >= 6) {
    orQuery += `,parent_phone.ilike.%${inputPhoneNorm}%,phone.ilike.%${inputPhoneNorm}%`;
  }
  if (cleanLower.startsWith('app-') && cleanLower.length >= 12) {
    const idSub = cleanLower.replace('app-', '');
    orQuery += `,id.ilike.${idSub}%`;
  }

  const { data: applicantsResData } = await adminSupabase
    .from('applicants')
    .select('id, tenant_id, stage, account_provisioned, student_username, student_id_number, student_password_temp, parent_username, parent_password_temp, parent_email, parent_phone, phone, first_name, last_name, dob, address, created_at')
    .eq('tenant_id', tenant.id)
    .or(orQuery)
    .limit(10);

  const applicants = applicantsResData || [];
  let matchedApplicant: any = null;

  if (applicants.length > 0) {
    const matchApplicant = (a: any) => {
      const sUser = (a.student_username || '').toLowerCase();
      const sId = (a.student_id_number || '').toLowerCase();
      const pUser = (a.parent_username || '').toLowerCase();
      const pEmail = (a.parent_email || '').toLowerCase();
      const pPhoneNorm = normalizePhone(a.parent_phone || '');
      const sPhoneNorm = normalizePhone(a.phone || '');
      const appRef = `app-${a.id.substring(0, 8).toLowerCase()}`;

      const phoneMatched =
        (inputPhoneNorm.length >= 6 && pPhoneNorm.length >= 6 && (pPhoneNorm === inputPhoneNorm || pPhoneNorm.endsWith(inputPhoneNorm) || inputPhoneNorm.endsWith(pPhoneNorm))) ||
        (inputPhoneNorm.length >= 6 && sPhoneNorm.length >= 6 && (sPhoneNorm === inputPhoneNorm || sPhoneNorm.endsWith(inputPhoneNorm) || inputPhoneNorm.endsWith(sPhoneNorm)));

      return (
        sUser === cleanLower ||
        sUser === searchToken.toLowerCase() ||
        sId === cleanLower ||
        sId === searchToken.toLowerCase() ||
        pUser === cleanLower ||
        pEmail === cleanLower ||
        phoneMatched ||
        appRef === cleanLower
      );
    };

    // Prioritize provisioned / allocated applicants first
    matchedApplicant =
      applicants.find(a => (a.account_provisioned || a.stage === 'Allocation') && matchApplicant(a)) ||
      applicants.find(a => matchApplicant(a));
  }

  // Fallback for directly-created students (bypassing applicants table)
  if (!matchedApplicant) {
    const { data: directStudents } = await adminSupabase
      .from('students')
      .select('*')
      .eq('tenant_id', tenant.id)
      .or(`admission_number.ilike.%${searchToken}%,email.ilike.${cleanId},phone.ilike.%${inputPhoneNorm || cleanId}%`)
      .limit(1);

    const directStudent = directStudents?.[0];

    if (directStudent) {
      const admYear = new Date(directStudent.admitted_at || directStudent.created_at || new Date()).getFullYear();
      matchedApplicant = {
        id: directStudent.id,
        tenant_id: directStudent.tenant_id,
        stage: 'Allocation',
        account_provisioned: true,
        student_username: directStudent.admission_number,
        student_id_number: directStudent.admission_number,
        student_password_temp: `Welcome${admYear}!`,
        first_name: directStudent.first_name,
        last_name: directStudent.last_name,
        dob: directStudent.date_of_birth,
        phone: directStudent.phone,
        address: directStudent.address,
        parent_name: directStudent.guardian_name,
        parent_phone: directStudent.guardian_phone,
        parent_email: directStudent.guardian_email,
        is_direct_student: true,
        created_at: directStudent.admitted_at || directStudent.created_at,
      };
    }
  }

  // 3. Handle Student / Parent login
  if (matchedApplicant) {
    const isStudentMatch =
      (matchedApplicant.student_username && matchedApplicant.student_username.toLowerCase() === searchToken.toLowerCase()) ||
      (matchedApplicant.student_id_number && matchedApplicant.student_id_number.toLowerCase() === searchToken.toLowerCase()) ||
      cleanLower.includes('@student.schoolsaas.com') ||
      cleanLower.startsWith('stu-');

    const admissionYear = new Date(matchedApplicant.created_at || new Date()).getFullYear();
    const dynamicStudentPass = `Welcome${admissionYear}!`;
    const dynamicParentPass = `Parent${admissionYear}!`;

    const isStudentTempPass =
      (matchedApplicant.student_password_temp && matchedApplicant.student_password_temp === password) ||
      password === dynamicStudentPass ||
      password === 'Welcome2026!'; // legacy fallback

    const isParentTempPass =
      (matchedApplicant.parent_password_temp && matchedApplicant.parent_password_temp === password) ||
      password === dynamicParentPass ||
      password === 'Parent2026!' ||
      password === 'Welcome2026!';

    const isProvisioned = matchedApplicant.account_provisioned || matchedApplicant.stage === 'Allocation';

    const intendedRole: 'student' | 'parent' = isStudentMatch ? 'student' : 'parent';
    const supabase = await createClient();

    if (intendedRole === 'student') {
      if (!isProvisioned) {
        if (isStudentTempPass) {
          redirect(`/apply/status?ref=APP-${matchedApplicant.id.substring(0, 8).toUpperCase()}&role=student`);
        } else {
          return { error: 'Invalid Student password. (Default temp password: Welcome<year>!)' };
        }
      }

      const studentEmail = `${matchedApplicant.student_id_number?.toLowerCase() || matchedApplicant.id.substring(0, 8)}@student.schoolsaas.com`;

      // Provision or sync password
      const { provisionApplicantAuth } = await import('./provision-auth');
      const provisionRes = await provisionApplicantAuth(adminSupabase, matchedApplicant, 'student', password);
      const emailToUse = provisionRes.email || studentEmail;

      const { error: signInErr } = await supabase.auth.signInWithPassword({ email: emailToUse, password });
      if (!signInErr) {
        redirect(`/student`);
      } else {
        // If first sign-in failed, try provisioning again with postgres fallback and retry
        await provisionApplicantAuth(adminSupabase, matchedApplicant, 'student', password);
        const { error: retryErr } = await supabase.auth.signInWithPassword({ email: emailToUse, password });
        if (!retryErr) {
          redirect(`/student`);
        }
        return { error: 'Could not sign in. Please verify your password or contact your school.' };
      }
    } else {
      // PARENT flow
      if (!isProvisioned) {
        if (isParentTempPass) {
          redirect(`/apply/status?ref=APP-${matchedApplicant.id.substring(0, 8).toUpperCase()}&role=parent`);
        } else {
          return { error: 'Invalid Parent password. (Default temp password: Parent<year>!)' };
        }
      }

      const pPhone = matchedApplicant.parent_phone
        ? matchedApplicant.parent_phone.replace(/\D/g, '')
        : `parent_${matchedApplicant.id.substring(0, 8)}`;
      const parentEmail = matchedApplicant.parent_email || `${pPhone}@parent.schoolsaas.com`;

      // Provision or sync password
      const { provisionApplicantAuth } = await import('./provision-auth');
      const provisionRes = await provisionApplicantAuth(adminSupabase, matchedApplicant, 'parent', password);
      const emailToUse = provisionRes.email || parentEmail;

      const { error: signInErr } = await supabase.auth.signInWithPassword({ email: emailToUse, password });
      if (!signInErr) {
        redirect(`/parent`);
      } else {
        return { error: 'Could not sign in. Please verify your password or contact your school.' };
      }
    }
  }

  // 4. Staff / Admin / Teacher login via Supabase Auth email (or staff_id / phone resolution)
  let emailToSignIn = cleanId.toLowerCase();
  let matchedStaffProfile: any = null;

  if (pool) {
    try {
      const pRes = await pool.query(
        `SELECT id, email, role, tenant_id, full_name, requires_password_change
         FROM profiles
         WHERE LOWER(email) = $1 OR staff_id = $2 OR phone = $2
         LIMIT 5`,
        [cleanLower, cleanId]
      );
      if (pRes.rows.length > 0) {
        matchedStaffProfile =
          pRes.rows.find((p: any) => p.tenant_id === tenant.id) ||
          pRes.rows.find((p: any) => p.tenant_id === tenant.parent_id) ||
          pRes.rows[0];
        if (matchedStaffProfile?.email) {
          emailToSignIn = matchedStaffProfile.email.toLowerCase();
        }
      }
    } catch (pgStaffErr) {
      console.warn('[loginToTenant] PG staff profile lookup error:', pgStaffErr);
    }
  }

  if (!matchedStaffProfile) {
    let staffOrQuery = `email.ilike.${cleanLower}`;
    if (cleanId) {
      staffOrQuery += `,staff_id.ilike.${cleanId}`;
    }
    if (inputPhoneNorm.length >= 6) {
      staffOrQuery += `,phone.ilike.%${inputPhoneNorm}%`;
    }

    const { data: staffProfiles } = await adminSupabase
      .from('profiles')
      .select('id, email, role, tenant_id, full_name, requires_password_change')
      .or(staffOrQuery)
      .limit(5);

    if (staffProfiles && staffProfiles.length > 0) {
      matchedStaffProfile =
        staffProfiles.find(p => p.tenant_id === tenant.id) ||
        staffProfiles.find(p => p.tenant_id === tenant.parent_id) ||
        staffProfiles[0];

      if (matchedStaffProfile?.email) {
        emailToSignIn = matchedStaffProfile.email.toLowerCase();
      }
    }
  }

  let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: emailToSignIn,
    password,
  });


  if (authError || !authData?.user) {
    if (matchedStaffProfile) {
      return { error: 'Invalid password. If you received an invite email, please check your inbox or set your password.' };
    }
    return { error: 'Invalid login credentials. Please check your Email, Phone Number, or Staff/Student ID.' };
  }

  // Verify profile belongs to this tenant or organization
  let profile: any = null;
  if (pool) {
    try {
      const pRes = await pool.query(
        `SELECT role, tenant_id, requires_password_change
         FROM profiles
         WHERE id = $1
         LIMIT 1`,
        [authData.user.id]
      );
      if (pRes.rows.length > 0) {
        profile = pRes.rows[0];
      }
    } catch (e) {
      console.warn('[loginToTenant] PG post-auth profile lookup error:', e);
    }
  }

  if (!profile) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role, tenant_id, requires_password_change')
      .eq('id', authData.user.id)
      .single();
    profile = profileData;
  }

  if (!profile) {
    await supabase.auth.signOut();
    return { error: 'User profile not found. Please contact administrator.' };
  }

  // Force password change pipeline for first-time logins
  if (profile.requires_password_change) {
    redirect(`/set-password`);
  }

  if (profile.role !== 'super_admin' && profile.tenant_id !== tenant.id) {
    let isOrgAdminAccess = false;
    let targetTenantSlug: string | null = null;

    if (profile.role === 'org_admin' && tenant.parent_id === profile.tenant_id) {
      isOrgAdminAccess = true;
    }

    if (!isOrgAdminAccess && profile.tenant_id) {
      const { data: userTenant } = await adminSupabase
        .from('tenants')
        .select('slug, parent_id')
        .eq('id', profile.tenant_id)
        .single();

      if (userTenant && userTenant.parent_id === tenant.id) {
        targetTenantSlug = userTenant.slug;
      }
    }

    if (!isOrgAdminAccess && !targetTenantSlug) {
      await supabase.auth.signOut();
      return { error: 'Access denied. Your account does not belong to this school portal.' };
    }

    if (targetTenantSlug) {
      let rolePath = `/${targetTenantSlug}/admin`;
      if (profile.role === 'teacher') rolePath = `/${targetTenantSlug}/teacher`;
      if (profile.role === 'student') rolePath = `/${targetTenantSlug}/student`;
      if (profile.role === 'parent') rolePath = `/${targetTenantSlug}/parent`;
      redirect(rolePath);
    }
  }

  let rolePath = `/admin`;
  if (profile.role === 'super_admin') rolePath = `/super-admin`;
  if (profile.role === 'teacher') rolePath = `/teacher`;
  if (profile.role === 'student') rolePath = `/student`;
  if (profile.role === 'parent') rolePath = `/parent`;

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
