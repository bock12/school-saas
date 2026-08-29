import { Pool } from 'pg';
import crypto from 'crypto';

let pool: Pool | null = null;

export function getPgPool() {
  if (!pool && process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

export async function createAuthUserAndProfileDirectly(opts: {
  email: string;
  name: string;
  role: string;
  tenantId: string;
  tempPassword?: string;
  department?: string;
  office?: string;
  jobTitle?: string;
  staffId?: string;
  phone?: string;
  avatarUrl?: string;
}) {
  const dbPool = getPgPool();
  if (!dbPool) {
    throw new Error('DATABASE_URL is not configured');
  }

  const userId = crypto.randomUUID();

  // Check if profile or auth user with this email already exists
  const existingRes = await dbPool.query(
    'SELECT id FROM profiles WHERE email = $1 LIMIT 1',
    [opts.email]
  );

  let targetId = userId;

  if (existingRes.rows.length > 0) {
    targetId = existingRes.rows[0].id;
    if (opts.tempPassword) {
      await dbPool.query(
        `UPDATE auth.users
         SET encrypted_password = crypt($1, gen_salt('bf')),
             confirmation_token = '',
             recovery_token = '',
             email_change_token_new = '',
             email_change = '',
             email_change_token_current = '',
             reauthentication_token = '',
             phone_change = '',
             phone_change_token = '',
             email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
             updated_at = NOW()
         WHERE id = $2`,
        [opts.tempPassword, targetId]
      );
    }
  } else {
    // Insert into auth.users (Supabase Auth schema)
    if (opts.tempPassword) {
      await dbPool.query(
        `INSERT INTO auth.users (
          id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
          confirmation_token, recovery_token, email_change_token_new, email_change,
          email_change_token_current, reauthentication_token, phone_change, phone_change_token,
          raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        ) VALUES (
          $1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', $2,
          crypt($3, gen_salt('bf')), NOW(),
          '', '', '', '', '', '', '', '',
          '{"provider":"email","providers":["email"]}'::jsonb,
          jsonb_build_object('full_name', $4::text, 'role', $5::text, 'tenant_id', $6::text, 'requires_password_change', true),
          NOW(), NOW()
        ) ON CONFLICT (id) DO UPDATE SET
          encrypted_password = crypt($3, gen_salt('bf')),
          updated_at = NOW()`,
        [targetId, opts.email, opts.tempPassword, opts.name, opts.role, opts.tenantId]
      );
    } else {
      const dummyPasswordHash = '$2a$10$abcdefghijklmnopqrstuvwxyz012345';
      await dbPool.query(
        `INSERT INTO auth.users (
          id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
          confirmation_token, recovery_token, email_change_token_new, email_change,
          email_change_token_current, reauthentication_token, phone_change, phone_change_token,
          raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        ) VALUES (
          $1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', $2,
          $3, NOW(),
          '', '', '', '', '', '', '', '',
          '{"provider":"email","providers":["email"]}'::jsonb,
          jsonb_build_object('full_name', $4::text, 'role', $5::text, 'tenant_id', $6::text, 'requires_password_change', true),
          NOW(), NOW()
        ) ON CONFLICT (id) DO NOTHING`,
        [targetId, opts.email, dummyPasswordHash, opts.name, opts.role, opts.tenantId]
      );
    }
  }

  // Insert or Update public.profiles
  await dbPool.query(
    `INSERT INTO profiles (
      id, email, full_name, role, tenant_id, department, office, job_title, staff_id, phone, avatar_url, requires_password_change
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role,
      tenant_id = EXCLUDED.tenant_id,
      department = COALESCE(EXCLUDED.department, profiles.department),
      office = COALESCE(EXCLUDED.office, profiles.office),
      job_title = COALESCE(EXCLUDED.job_title, profiles.job_title),
      staff_id = COALESCE(EXCLUDED.staff_id, profiles.staff_id),
      phone = COALESCE(EXCLUDED.phone, profiles.phone),
      avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url)`,
    [
      targetId,
      opts.email,
      opts.name,
      opts.role,
      opts.tenantId,
      opts.department || null,
      opts.office || null,
      opts.jobTitle || null,
      opts.staffId || null,
      opts.phone || null,
      opts.avatarUrl || null,
    ]
  );

  return { success: true, userId: targetId };
}
