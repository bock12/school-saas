const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envFile.match(/^NEXT_PUBLIC_SUPABASE_URL=(.*)$/m);
const keyMatch = envFile.match(/^SUPABASE_SERVICE_ROLE_KEY=(.*)$/m);
const url = urlMatch ? urlMatch[1].trim() : 'http://127.0.0.1:54321';
const key = keyMatch ? keyMatch[1].trim() : '';

async function check() {
  const rProfile = await fetch(`${url}/rest/v1/profiles?select=*&order=created_at.desc&limit=5`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  console.log('RECENT PROFILES:', await rProfile.json());

  const rTenants = await fetch(`${url}/rest/v1/tenants?select=id,name,slug,type,parent_id&order=created_at.desc&limit=5`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  console.log('RECENT TENANTS:', await rTenants.json());
}
check().catch(console.error);
