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

pool.query('SELECT * FROM tenants WHERE slug = $1', ['albert-academy'])
  .then(r => {
    console.log('Albert Academy row:', r.rows[0]);
    pool.end();
  })
  .catch(e => { console.error('PG Error:', e); pool.end(); });
