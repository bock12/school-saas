const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
require('dotenv').config({ path: '../.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { realtime: { transport: ws } }
);

async function diagnose() {
  console.log('=== FULL LOGIN DIAGNOSTIC ===\n');

  // 1. Check tenants
  const { data: tenants } = await supabase.from('tenants').select('id, name, slug').limit(10);
  console.log('TENANTS:');
  tenants?.forEach(t => console.log(`  [${t.slug}] id=${t.id} name=${t.name}`));

  const tenant = tenants?.[0];
  if (!tenant) { console.log('No tenant found!'); return; }

  console.log(`\nUsing tenant: ${tenant.slug} (${tenant.id})\n`);

  // 2. Check students table for STU-46A377
  const { data: students, error: studErr } = await supabase
    .from('students')
    .select('id, admission_number, first_name, last_name, profile_id, email, guardian_phone, guardian_email, tenant_id, admitted_at, created_at')
    .ilike('admission_number', '%46A377%');
  
  console.log('STUDENTS matching STU-46A377:');
  console.log(JSON.stringify(students, null, 2));
  if (studErr) console.log('Error:', studErr.message);

  // 3. Check applicants table for this tenant
  const { data: allApplicants } = await supabase
    .from('applicants')
    .select('id, tenant_id, stage, account_provisioned, student_username, student_id_number, student_password_temp, parent_username, parent_password_temp, parent_email, parent_phone, phone, first_name, last_name, created_at')
    .eq('tenant_id', tenant.id)
    .limit(20);
  
  console.log(`\nAPPLICANTS in tenant (${allApplicants?.length || 0} total):`);
  allApplicants?.forEach(a => {
    console.log(`  id=${a.id.substring(0,8)} stage=${a.stage} provisioned=${a.account_provisioned} student_id=${a.student_id_number} student_user=${a.student_username} parent_email=${a.parent_email}`);
  });

  // 4. Check profiles for students/parents in this tenant
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, role, email, requires_password_change, tenant_id')
    .eq('tenant_id', tenant.id)
    .in('role', ['student', 'parent'])
    .limit(20);
  
  console.log(`\nPROFILES (student/parent) in tenant (${profiles?.length || 0} total):`);
  profiles?.forEach(p => {
    console.log(`  id=${p.id.substring(0,8)} role=${p.role} name=${p.full_name} email=${p.email} requires_reset=${p.requires_password_change}`);
  });

  // 5. Check auth.users for the expected email
  const expectedEmail = 'stu-46a377@student.schoolsaas.com';
  const { data: authUsers } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const matchingAuthUsers = authUsers?.users?.filter(u => 
    u.email?.includes('46a377') || u.email?.includes('schoolsaas') || u.email?.includes('@student') || u.email?.includes('@parent')
  );
  console.log(`\nAUTH USERS matching schoolsaas emails:`);
  matchingAuthUsers?.forEach(u => console.log(`  email=${u.email} id=${u.id.substring(0,8)} created=${u.created_at}`));
  
  console.log(`\n  Looking for: ${expectedEmail}`);
  const found = authUsers?.users?.find(u => u.email === expectedEmail);
  console.log(`  Found? ${found ? 'YES - ' + found.id : 'NO'}`);

  // 6. Simulate exact login query
  console.log('\n=== SIMULATING LOGIN QUERY ===');
  const testInput = 'STU-46A377';
  const cleanLower = testInput.toLowerCase();
  
  let orQuery = `student_username.ilike.${testInput},student_id_number.ilike.${testInput},parent_username.ilike.${testInput},parent_email.ilike.${testInput}`;
  if (cleanLower.startsWith('stu-')) {
    console.log('Also adding student fallback query for students table');
  }
  
  console.log(`orQuery for applicants: ${orQuery}`);
  const { data: loginApplicants, error: loginErr } = await supabase
    .from('applicants')
    .select('id, stage, account_provisioned, student_username, student_id_number')
    .eq('tenant_id', tenant.id)
    .or(orQuery)
    .limit(10);
  
  console.log(`Applicants matched: ${loginApplicants?.length || 0}`);
  if (loginErr) console.log('Error:', loginErr.message);
  loginApplicants?.forEach(a => console.log(`  ${JSON.stringify(a)}`));

  // 7. Also check if students table has this with different tenant_id
  const { data: allStudents } = await supabase
    .from('students')
    .select('id, admission_number, tenant_id, profile_id, email')
    .ilike('admission_number', '%46%');
  console.log('\nALL students with 46 in admission number:');
  allStudents?.forEach(s => console.log(`  ${JSON.stringify(s)}`));
}

diagnose().catch(console.error);
