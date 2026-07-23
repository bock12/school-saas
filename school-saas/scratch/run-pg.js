const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '../.env.local' });

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const sql = fs.readFileSync('../supabase/migrations/024_force_password_reset.sql', 'utf8');
  await client.query(sql);
  console.log('Migration complete');
  await client.end();
}
run();
