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

  // Test landing_page_sections query
  const secRes = await client.query(`SELECT * FROM landing_page_sections WHERE page_slug = $1 OR page_slug IS NULL ORDER BY sort_order ASC`, ['home']);
  console.log('Sections rows:', secRes.rows.length);

  // Test cms_plugins query
  const plugRes = await client.query(`SELECT * FROM cms_plugins ORDER BY name ASC`);
  console.log('Plugins rows:', plugRes.rows.length);

  // Test cms_settings query
  const setRes = await client.query(`SELECT * FROM cms_settings WHERE id = 'global_settings' LIMIT 1`);
  console.log('Settings row:', setRes.rows[0]);

  // Test cms_pages query
  const pageRes = await client.query(`SELECT * FROM cms_pages ORDER BY nav_order ASC`);
  console.log('Pages rows:', pageRes.rows.length);

  await client.end();
}

main().catch(console.error);
