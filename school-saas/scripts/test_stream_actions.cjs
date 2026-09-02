const { Client } = require('pg');

async function testTrigger() {
  const client = new Client({
    connectionString: 'postgresql://postgres.yhrvmppfwjxninvbblrt:vV648%40a56R8S%25%232@aws-0-eu-west-1.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  const tenantRes = await client.query(`SELECT id FROM tenants WHERE slug = 'albert-academy'`);
  const tenantId = tenantRes.rows[0].id;
  console.log('Testing tenant:', tenantId);

  // Check trigger definition
  const trgRes = await client.query(
    `SELECT trigger_name, event_manipulation, event_object_table, action_statement
     FROM information_schema.triggers
     WHERE trigger_name = 'trg_auto_core_enrollments'`
  );
  console.log('Trigger definition:', trgRes.rows);

  await client.end();
}

testTrigger().catch(console.error);
