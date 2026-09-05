const { Pool } = require('pg');
try { require('dotenv').config({ path: '.env.local' }); } catch (e) {}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not configured.');
  process.exit(1);
}

const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
const pool = new Pool({
  connectionString,
  ssl: isLocal ? undefined : { rejectUnauthorized: true }
});

pool.query('SELECT id, name, slug, logo_url, address, city, country, contact_email, primary_color FROM tenants WHERE parent_id = $1', ['8229f3e8-6cd9-441e-9905-2d3dd23211ac'])
  .then(r => {
    console.log('Child schools:', r.rows);
    pool.end();
  }).catch(e => { console.error(e); pool.end(); });
