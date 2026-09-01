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
  console.log('Connected to PG');

  // Test tables
  const tables = ['landing_page_sections', 'cms_pages', 'cms_plugins', 'cms_media', 'cms_settings'];
  for (const t of tables) {
    try {
      const res = await client.query(`SELECT COUNT(*) FROM ${t}`);
      console.log(`Table ${t}: ${res.rows[0].count} rows`);
    } catch (e) {
      console.error(`Error querying ${t}:`, e.message);
    }
  }

  await client.end();
}

main().catch(console.error);
