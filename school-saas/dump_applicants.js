const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase
    .from('applicants')
    .select('id, student_id_number, student_username, student_password_temp, parent_phone, parent_email, parent_password_temp, tenant_id')
    .eq('account_provisioned', true)
    .limit(5);

  if (error) {
    console.error('Error fetching applicants:', error);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

main();
