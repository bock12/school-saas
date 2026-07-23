import { createAdminClient } from '@/lib/supabase/admin';

export async function provisionApplicantAuth(
  adminSupabase: ReturnType<typeof createAdminClient>,
  applicant: any,
  role: 'student' | 'parent',
  passwordUsed: string
) {
  let email = '';
  if (role === 'student') {
    email = `${applicant.student_id_number?.toLowerCase() || applicant.id.substring(0,8)}@student.schoolsaas.com`;
  } else {
    const pPhone = applicant.parent_phone ? applicant.parent_phone.replace(/\D/g, '') : `parent_${applicant.id.substring(0,8)}`;
    email = applicant.parent_email || `${pPhone}@parent.schoolsaas.com`;
  }

  // 1. Try to create the user in auth.users
  let authUserId = '';
  const { data: authData, error: authErr } = await adminSupabase.auth.admin.createUser({
    email,
    password: passwordUsed,
    email_confirm: true,
  });

  if (authErr) {
    if (authErr.status === 422 || (authErr.message && authErr.message.toLowerCase().includes('already registered'))) {
      // User already exists — look them up and ensure their password matches the temp password
      // This handles the case where they were pre-seeded or provisioned before with the same email
      const { data: existingUsers } = await adminSupabase.auth.admin.listUsers({ perPage: 1000 });
      const existingUser = existingUsers?.users?.find((u: any) => u.email === email);
      if (existingUser) {
        // Update their password to the temp password so they can sign in
        await adminSupabase.auth.admin.updateUserById(existingUser.id, { password: passwordUsed });
      }
      return { email }; 
    } else {
      console.error('Failed to provision auth user:', authErr);
      return { email };
    }
  }

  if (authData?.user) {
    authUserId = authData.user.id;
    
    // 2. Insert into public.profiles
    const fullName = role === 'student' 
      ? `${applicant.first_name || ''} ${applicant.last_name || ''}`.trim() || 'Student'
      : applicant.parent_name || 'Parent Guardian';

    await adminSupabase.from('profiles').insert({
      id: authUserId,
      tenant_id: applicant.tenant_id,
      role: role,
      full_name: fullName,
      email: email,
      phone: role === 'student' ? applicant.phone : applicant.parent_phone,
      requires_password_change: true
    });
    // 3. Insert into public.students or public.parents
    if (role === 'student') {
        if (applicant.is_direct_student) {
            await adminSupabase.from('students')
                .update({ profile_id: authUserId, email })
                .eq('id', applicant.id);
        } else {
            await adminSupabase.from('students').insert({
                tenant_id: applicant.tenant_id,
                profile_id: authUserId,
                admission_number: applicant.student_id_number,
                first_name: applicant.first_name || 'Student',
                last_name: applicant.last_name || 'Name',
                date_of_birth: applicant.dob,
                email: email,
                phone: applicant.phone,
                address: applicant.address,
                guardian_name: applicant.parent_name,
                guardian_phone: applicant.parent_phone,
                guardian_email: applicant.parent_email,
                is_active: true
            });
        }
    } else {
        await adminSupabase.from('parents').insert({
            tenant_id: applicant.tenant_id,
            profile_id: authUserId,
            first_name: fullName.split(' ')[0] || 'Parent',
            last_name: fullName.split(' ').slice(1).join(' ') || 'Guardian',
            email: email,
            phone: applicant.parent_phone,
            address: applicant.address,
            is_active: true
        });
    }
  }

  return { email };
}
