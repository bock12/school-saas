const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envFile.match(/^NEXT_PUBLIC_SUPABASE_URL=(.*)$/m);
const keyMatch = envFile.match(/^SUPABASE_SERVICE_ROLE_KEY=(.*)$/m);
const url = urlMatch ? urlMatch[1].trim() : 'http://127.0.0.1:54321';
const key = keyMatch ? keyMatch[1].trim() : '';

async function cleanup() {
  console.log("Fetching profiles and users...");
  const rProfile = await fetch(`${url}/rest/v1/profiles?select=id`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  const profiles = await rProfile.json();
  const profileIds = new Set(profiles.map(p => p.id));

  const rAuth = await fetch(`${url}/auth/v1/admin/users`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  const authData = await rAuth.json();
  const users = authData.users || [];

  for (const user of users) {
    if (!profileIds.has(user.id)) {
      console.log(`Deleting orphaned user: ${user.email} (${user.id})`);
      const res = await fetch(`${url}/auth/v1/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      });
      if (!res.ok) console.error("Failed to delete", user.email);
    }
  }
  console.log("Cleanup complete!");
}
cleanup().catch(console.error);
