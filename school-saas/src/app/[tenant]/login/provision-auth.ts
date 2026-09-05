import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

export async function provisionApplicantAuth(
  adminSupabase: ReturnType<typeof createAdminClient>,
  applicant: any,
  role: 'student' | 'parent',
  passwordUsed: string
) {
  let email = '';
  if (role === 'student') {
    email = `${applicant.student_id_number?.toLowerCase() || applicant.id.substring(0, 8)}@student.schoolsaas.com`;
  } else {
    const pPhone = applicant.parent_phone ? applicant.parent_phone.replace(/\D/g, '') : `parent_${applicant.id.substring(0, 8)}`;
    email = applicant.parent_email || `${pPhone}@parent.schoolsaas.com`;
  }

  const fullName = role === 'student'
    ? `${applicant.first_name || ''} ${applicant.last_name || ''}`.trim() || 'Student'
    : applicant.parent_name || 'Parent Guardian';

  // 1. Authoritative Supabase Auth Admin API
  let authUserId = '';
  const { data: authData, error: authErr } = await adminSupabase.auth.admin.createUser({
    email,
    password: passwordUsed,
    email_confirm: true,
  });

  if (authErr) {
    if (authErr.status === 422 || (authErr.message && authErr.message.toLowerCase().includes('already registered'))) {
      // User already exists — update password via official Auth Admin API
      const { data: existingUsers } = await adminSupabase.auth.admin.listUsers({ perPage: 1000 }).catch(() => ({ data: null }));
      const existingUser = existingUsers?.users?.find((u: any) => u.email === email);
      if (existingUser) {
        await adminSupabase.auth.admin.updateUserById(existingUser.id, { password: passwordUsed }).catch(() => {});
        return { email };
      }
    }

    console.error('[provisionApplicantAuth] Auth Admin API user creation failed:', authErr.message);
    return { email };
  }

  if (authData?.user) {
    authUserId = authData.user.id;

    try {
      await adminSupabase.from('profiles').insert({
        id: authUserId,
        tenant_id: applicant.tenant_id,
        role: role,
        full_name: fullName,
        email: email,
        phone: role === 'student' ? applicant.phone : applicant.parent_phone,
        requires_password_change: true
      });
    } catch (_) {}

    if (role === 'student') {
      if (applicant.is_direct_student) {
        try {
          await adminSupabase.from('students')
            .update({ profile_id: authUserId, email })
            .eq('id', applicant.id);
        } catch (_) {}
      } else {
        try {
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
        } catch (_) {}
      }
    } else {
      try {
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
      } catch (_) {}
    }
  }

  return { email };
}
