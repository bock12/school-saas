const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function run() {
  const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
  const dbUrlMatch = envFile.match(/^DATABASE_URL=(.*)$/m);
  if (!dbUrlMatch) {
    console.error('DATABASE_URL not found in .env.local');
    process.exit(1);
  }
  const connectionString = dbUrlMatch[1].trim();

  console.log('Connecting to database...');
  const client = new Client({ connectionString });
  await client.connect();
  console.log('Connected.');

  try {
    const migrationFile = path.join(__dirname, '..', 'supabase', 'migrations', '027_fix_chat_rls_recursion.sql');
    console.log(`Reading migration SQL from ${migrationFile}...`);
    const fixSql = fs.readFileSync(migrationFile, 'utf8');

    console.log('Executing RLS recursion & creator policies fix...');
    await client.query(fixSql);
    console.log('✅ RLS migration 027 applied successfully.');
  } catch (err) {
    console.error('❌ Fix failed:', err.message);
  } finally {
    await client.end();
  }
}

run();
