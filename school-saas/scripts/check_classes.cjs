const { Client } = require('pg');
try { require('dotenv').config({ path: '.env.local' }); } catch (e) {}

async function checkClasses() {
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

  const tenantRes = await client.query(`SELECT id FROM tenants WHERE slug = 'albert-academy'`);
  const tenantId = tenantRes.rows[0]?.id;

  if (tenantId) {
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
  }

  await client.end();
}

checkClasses().catch(console.error);
