const { Client } = require('pg');

async function checkTenants() {
  const client = new Client({
    connectionString: 'postgresql://postgres.yhrvmppfwjxninvbblrt:vV648%40a56R8S%25%232@aws-0-eu-west-1.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
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
