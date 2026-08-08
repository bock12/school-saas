const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.yhrvmppfwjxninvbblrt:vV648%40a56R8S%25%232@aws-0-eu-west-1.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('Connected to DB successfully!');

  const sqlPath = path.join(__dirname, 'supabase', 'migrations', '029_exam_communication_center.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  await client.query(sql);
  console.log('Migration 029 executed successfully! Created Exam Communication Center tables.');

  await client.end();
}

run().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
