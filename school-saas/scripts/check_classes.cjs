const { Client } = require('pg');

async function checkClasses() {
  const client = new Client({
    connectionString: 'postgresql://postgres.yhrvmppfwjxninvbblrt:vV648%40a56R8S%25%232@aws-0-eu-west-1.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  const tenantRes = await client.query(`SELECT id FROM tenants WHERE slug = 'albert-academy'`);
  const tenantId = tenantRes.rows[0].id;

  const classes = await client.query(
    `SELECT cl.id, cl.name, sec.id as section_id, sec.name as section_name
     FROM classes cl
     LEFT JOIN sections sec ON sec.class_id = cl.id
     WHERE cl.tenant_id = $1
     ORDER BY cl.sort_order, sec.name`,
    [tenantId]
  );
  console.log('Classes and sections count:', classes.rows.length);
  console.log('Sample classes/sections:', classes.rows.slice(0, 10));

  const years = await client.query(
    `SELECT id, name, is_current FROM academic_years WHERE tenant_id = $1 ORDER BY start_date DESC`,
    [tenantId]
  );
  console.log('Academic years:', years.rows);

  await client.end();
}

checkClasses().catch(console.error);
