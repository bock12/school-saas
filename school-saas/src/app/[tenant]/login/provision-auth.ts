import { createAdminClient } from '@/lib/supabase/admin';
import { Pool } from 'pg';

let pgPool: Pool | null = null;
function getPool() {
  if (!pgPool && process.env.DATABASE_URL) {
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pgPool;
}

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

  const fullName = role === 'student'
    ? `${applicant.first_name || ''} ${applicant.last_name || ''}`.trim() || 'Student'
    : applicant.parent_name || 'Parent Guardian';

  // 1. Try Supabase Auth Admin API
  let authUserId = '';
  const { data: authData, error: authErr } = await adminSupabase.auth.admin.createUser({
    email,
    password: passwordUsed,
    email_confirm: true,
  });

  if (authErr) {
    if (authErr.status === 422 || (authErr.message && authErr.message.toLowerCase().includes('already registered'))) {
      // User already exists — update password if possible
      const { data: existingUsers } = await adminSupabase.auth.admin.listUsers({ perPage: 1000 }).catch(() => ({ data: null }));
      const existingUser = existingUsers?.users?.find((u: any) => u.email === email);
      if (existingUser) {
        await adminSupabase.auth.admin.updateUserById(existingUser.id, { password: passwordUsed }).catch(() => {});
        return { email };
      }
    }

    // Postgres Direct Fallback if Service Key is unregistered / 401 or listUsers failed
    const pool = getPool();
    if (pool) {
      try {
        const { rows: existingRows } = await pool.query(
          'SELECT id FROM auth.users WHERE email = $1 LIMIT 1',
          [email]
        );

        if (existingRows.length > 0) {
          authUserId = existingRows[0].id;
          // Update password hash directly via pgcrypto
          await pool.query(
            `UPDATE auth.users
             SET encrypted_password = crypt($1, gen_salt('bf')),
                 email_confirmed_at = NOW(),
                 updated_at = NOW()
             WHERE id = $2`,
            [passwordUsed, authUserId]
          );
        } else {
          authUserId = require('crypto').randomUUID();
          await pool.query(
            `INSERT INTO auth.users (
              id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
              raw_app_meta_data, raw_user_meta_data, created_at, updated_at
            ) VALUES (
              $1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', $2,
              crypt($3, gen_salt('bf')), NOW(),
              '{"provider":"email","providers":["email"]}'::jsonb,
              jsonb_build_object('full_name', $4::text, 'role', $5::text, 'tenant_id', $6::text, 'requires_password_change', true),
              NOW(), NOW()
            )`,
            [authUserId, email, passwordUsed, fullName, role, applicant.tenant_id]
          );
        }

        // Upsert into profiles
        await pool.query(
          `INSERT INTO profiles (
            id, tenant_id, role, full_name, email, phone, requires_password_change
          ) VALUES ($1, $2, $3, $4, $5, $6, true)
          ON CONFLICT (id) DO UPDATE SET
            tenant_id = EXCLUDED.tenant_id,
            role = EXCLUDED.role,
            full_name = EXCLUDED.full_name,
            email = EXCLUDED.email,
            phone = EXCLUDED.phone`,
          [authUserId, applicant.tenant_id, role, fullName, email, role === 'student' ? applicant.phone : applicant.parent_phone]
        );

        // Ensure student / parent record exists
        if (role === 'student') {
          if (applicant.is_direct_student) {
            await pool.query('UPDATE students SET profile_id = $1, email = $2 WHERE id = $3', [authUserId, email, applicant.id]).catch(() => {});
          } else {
            await pool.query(
              `INSERT INTO students (
                tenant_id, profile_id, admission_number, first_name, last_name, date_of_birth, email, phone, address, guardian_name, guardian_phone, guardian_email, is_active
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true)
              ON CONFLICT (id) DO UPDATE SET profile_id = EXCLUDED.profile_id`,
              [
                applicant.tenant_id, authUserId, applicant.student_id_number,
                applicant.first_name || 'Student', applicant.last_name || 'Name', applicant.dob,
                email, applicant.phone, applicant.address, applicant.parent_name,
                applicant.parent_phone, applicant.parent_email
              ]
            ).catch(() => {});
          }
        } else {
          await pool.query(
            `INSERT INTO parents (
              tenant_id, profile_id, first_name, last_name, email, phone, address, is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, true)
            ON CONFLICT (id) DO UPDATE SET profile_id = EXCLUDED.profile_id`,
            [
              applicant.tenant_id, authUserId,
              fullName.split(' ')[0] || 'Parent', fullName.split(' ').slice(1).join(' ') || 'Guardian',
              email, applicant.parent_phone, applicant.address
            ]
          ).catch(() => {});
        }

        return { email };
      } catch (dbErr) {
        console.error('Postgres fallback provisioning error:', dbErr);
      }
    }

    return { email };
  }

  if (authData?.user) {
    authUserId = authData.user.id;

    await adminSupabase.from('profiles').insert({
      id: authUserId,
      tenant_id: applicant.tenant_id,
      role: role,
      full_name: fullName,
      email: email,
      phone: role === 'student' ? applicant.phone : applicant.parent_phone,
      requires_password_change: true
    }).catch(() => {});

    if (role === 'student') {
      if (applicant.is_direct_student) {
        await adminSupabase.from('students')
          .update({ profile_id: authUserId, email })
          .eq('id', applicant.id).catch(() => {});
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
        }).catch(() => {});
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
      }).catch(() => {});
    }
  }

  return { email };
}
