const WebSocket = require('ws');
global.WebSocket = WebSocket;

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setPasswordChanged() {
  const { data, error } = await supabase
    .from('applicants')
    .update({
      student_password_changed: true,
      parent_password_changed: true,
    })
    .eq('id', '17cd951d-2fef-4378-9389-5b76247fefeb');

  console.log('Update Error:', error);
  console.log('Password flags set to changed = true.');
}

setPasswordChanged();
