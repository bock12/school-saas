const WebSocket = require('ws');
global.WebSocket = WebSocket;

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data: students } = await supabase.from('students').select('*').ilike('admission_number', '%46A377%');
  const { data: profiles } = await supabase.from('profiles').select('*').or('email.ilike.%esther@gmail.com%,id.ilike.%46A377%');
  const { data: allApplicants } = await supabase.from('applicants').select('id, first_name, last_name, student_username, student_id_number, student_password_temp, parent_username, parent_password_temp, parent_email');

  console.log('Students:', students);
  console.log('Profiles:', profiles);
  console.log('All Applicants:', allApplicants);
}

check();
