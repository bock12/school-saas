const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function check() {
  const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
  const dbUrl = envFile.match(/^DATABASE_URL=(.*)$/m)[1].trim();
  const c = new Client({ connectionString: dbUrl });
  await c.connect();
  const res = await c.query("SELECT tablename, policyname, cmd, qual, with_check FROM pg_policies WHERE tablename LIKE 'chat_%'");
  console.log('ACTIVE POLICIES:');
  res.rows.forEach(r => console.log(`- [${r.tablename}] ${r.policyname} (${r.cmd}): QUAL=${r.qual} | CHECK=${r.with_check}`));
  await c.end();
}
check();
