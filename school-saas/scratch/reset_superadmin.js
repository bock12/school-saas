const { Client } = require('pg');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length > 0) {
    env[key.trim()] = val.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const client = new Client({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected to PostgreSQL.');

  const newPassword = process.argv[2] || 'SuperAdmin2026!';
  const superAdminEmail = 'superadmin@schoolsaas.com';
  const superAdminId = 'b6696f8d-3c4e-4526-9269-c9d23e01279f';

  // 1. Ensure pgcrypto extension exists
  await client.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;`);

  // 2. Update auth.users password using bcrypt hash
  const updateAuthRes = await client.query(`
    UPDATE auth.users
    SET encrypted_password = extensions.crypt($1, extensions.gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
        updated_at = NOW(),
        raw_user_meta_data = jsonb_set(
          COALESCE(raw_user_meta_data, '{}'::jsonb),
          '{role}',
          '"super_admin"'
        )
    WHERE id = $2 OR email = $3
    RETURNING id, email, email_confirmed_at, updated_at;
  `, [newPassword, superAdminId, superAdminEmail]);

  console.log('Updated Auth User:', updateAuthRes.rows);

  // 3. Ensure profile exists and has role 'super_admin'
  const updateProfileRes = await client.query(`
    INSERT INTO public.profiles (id, email, full_name, role, tenant_id, created_at, updated_at)
    VALUES ($1, $2, 'Platform Super Admin', 'super_admin', NULL, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE
    SET role = 'super_admin',
        email = $2,
        full_name = 'Platform Super Admin',
        updated_at = NOW()
    RETURNING id, email, full_name, role;
  `, [superAdminId, superAdminEmail]);

  console.log('Updated Profile:', updateProfileRes.rows);

  // 4. Also update admin@schoolsaas.com if it exists
  await client.query(`
    UPDATE auth.users
    SET encrypted_password = extensions.crypt($1, extensions.gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
        updated_at = NOW(),
        raw_user_meta_data = jsonb_set(
          COALESCE(raw_user_meta_data, '{}'::jsonb),
          '{role}',
          '"super_admin"'
        )
    WHERE email = 'admin@schoolsaas.com';
  `, [newPassword]);

  console.log(`\n==============================================`);
  console.log(` Super Admin Credentials Reset Successfully:`);
  console.log(` Email / Username: superadmin@schoolsaas.com (or 'superadmin')`);
  console.log(` Password:         ${newPassword}`);
  console.log(`==============================================\n`);

  await client.end();
}

main().catch(err => {
  console.error('Error resetting superadmin password:', err);
  process.exit(1);
});
