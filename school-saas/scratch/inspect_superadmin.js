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
  console.log('Connected to PostgreSQL database.');

  const profilesRes = await client.query(`
    SELECT id, email, full_name, role, tenant_id
    FROM profiles
    WHERE role = 'super_admin' OR email ILIKE '%admin%' OR email ILIKE '%superadmin%'
  `);
  console.log('--- Matching Profiles ---');
  console.table(profilesRes.rows);

  const authUsersRes = await client.query(`
    SELECT id, email, encrypted_password, raw_user_meta_data
    FROM auth.users
    WHERE email ILIKE '%admin%' OR email ILIKE '%superadmin%' OR id IN (SELECT id FROM profiles WHERE role = 'super_admin')
  `);
  console.log('--- Matching Auth Users ---');
  console.table(authUsersRes.rows.map(u => ({
    id: u.id,
    email: u.email,
    raw_user_meta_data: u.raw_user_meta_data
  })));

  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
