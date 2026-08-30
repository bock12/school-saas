const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
pool.query('SELECT * FROM tenants WHERE slug = $1', ['albert-academy'])
  .then(r => {
    console.log('Albert Academy row:', r.rows[0]);
    pool.end();
  })
  .catch(e => { console.error('PG Error:', e); pool.end(); });
