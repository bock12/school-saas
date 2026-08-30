const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
pool.query('SELECT id, name, slug, logo_url, address, city, country, contact_email, primary_color FROM tenants WHERE parent_id = $1', ['8229f3e8-6cd9-441e-9905-2d3dd23211ac'])
  .then(r => {
    console.log('Child schools:', r.rows);
    pool.end();
  }).catch(e => { console.error(e); pool.end(); });
