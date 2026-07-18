const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envFile.match(/^NEXT_PUBLIC_SUPABASE_URL=(.*)$/m);
const keyMatch = envFile.match(/^SUPABASE_SERVICE_ROLE_KEY=(.*)$/m);
const url = urlMatch ? urlMatch[1].trim() : 'http://127.0.0.1:54321';
const key = keyMatch ? keyMatch[1].trim() : '';

async function fix() {
  const orgId = '8229f3e8-6cd9-441e-9905-2d3dd23211ac'; // Albert Academy
  const res = await fetch(`${url}/rest/v1/tenants?id=eq.${orgId}`, {
    method: 'PATCH',
    headers: { 
      'apikey': key, 
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ slug: 'albert-academy' })
  });
  console.log('Update Result:', await res.json());
}
fix().catch(console.error);
