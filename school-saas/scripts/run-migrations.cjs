const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function runMigrations() {
  console.log('Connecting to database...');
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected successfully.\n');

    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    for (const file of files) {
      console.log(`Running migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      // Execute the SQL file
      await client.query(sql);
      console.log(`✅ ${file} applied successfully.\n`);
    }

    console.log('🎉 All migrations applied successfully!');
  } catch (err) {
    console.error('\n❌ Migration failed:');
    console.error(err.message);
  } finally {
    await client.end();
  }
}

runMigrations();
