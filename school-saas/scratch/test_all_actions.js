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
  console.log('PG connected');

  // Insert default settings row if not present
  await client.query(`
    INSERT INTO cms_settings (id, site_name, site_tagline, logo_url, primary_color, accent_color, font_family, custom_css, custom_head_scripts, custom_body_scripts)
    VALUES ('global_settings', 'SchoolSaaS', 'Multi-Tenant School Operating System', '', '#4f46e5', '#3b82f6', 'Plus Jakarta Sans', '', '', '')
    ON CONFLICT (id) DO NOTHING;
  `);

  console.log('Settings seeded');
  await client.end();
}

main().catch(console.error);
