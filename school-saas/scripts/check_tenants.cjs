const { Client } = require('pg');
try { require('dotenv').config({ path: '.env.local' }); } catch (e) {}

async function checkTenants() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not configured.');
    process.exit(1);
  }

  const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
  const client = new Client({
    connectionString,
    ssl: isLocal ? undefined : { rejectUnauthorized: true }
  });
  await client.connect();

  const tenants = await client.query(`SELECT id, slug, name FROM tenants`);
  console.log('All tenants:', tenants.rows);

  for (const t of tenants.rows) {
    const s = await client.query('SELECT COUNT(*) FROM students WHERE tenant_id = $1', [t.id]);
    const c = await client.query('SELECT COUNT(*) FROM classes WHERE tenant_id = $1', [t.id]);
    const sec = await client.query('SELECT COUNT(*) FROM sections WHERE tenant_id = $1', [t.id]);
    const so = await client.query('SELECT COUNT(*) FROM subject_offerings WHERE tenant_id = $1', [t.id]);
    console.log(`Tenant ${t.slug}: ${s.rows[0].count} students, ${c.rows[0].count} classes, ${sec.rows[0].count} sections, ${so.rows[0].count} offerings`);
  }

  await client.end();
}

checkTenants().catch(console.error);
