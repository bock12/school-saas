const { Client } = require('pg');
try { require('dotenv').config({ path: '.env.local' }); } catch (e) {}

async function check() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not configured.');
    process.exit(1);
  }

  const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
  const client = new Client({
    connectionString,
    ssl: isLocal ? undefined : { rejectUnauthorized: true }
  });

  await client.connect();
  console.log('Connected!');

  const tenantRes = await client.query(`SELECT id, slug, name FROM tenants WHERE slug = 'albert-academy'`);
  console.log('Tenant:', tenantRes.rows[0]);
  const tenantId = tenantRes.rows[0].id;

  const studentsRes = await client.query(`SELECT COUNT(*) FROM students WHERE tenant_id = $1`, [tenantId]);
  console.log('Total students in tenant:', studentsRes.rows[0].count);

  const sampleStudents = await client.query(
    `SELECT s.id, s.first_name, s.last_name, s.admission_number, ce.section_id, sec.name as section_name, cl.name as class_name
     FROM students s
     LEFT JOIN class_enrollments ce ON ce.student_id = s.id
     LEFT JOIN sections sec ON sec.id = ce.section_id
     LEFT JOIN classes cl ON cl.id = sec.class_id
     WHERE s.tenant_id = $1
     LIMIT 5`,
    [tenantId]
  );
  console.log('Sample students:', sampleStudents.rows);

  const streamsRes = await client.query(`SELECT id, code, name, level FROM curriculum_streams WHERE tenant_id = $1`, [tenantId]);
  console.log('Curriculum streams:', streamsRes.rows);

  const streamRules = await client.query(
    `SELECT ssr.id, cs.name as stream_name, s.name as subject_name, ssr.rule_type, ssr.elective_group
     FROM stream_subject_rules ssr
     JOIN curriculum_streams cs ON cs.id = ssr.stream_id
     JOIN subjects s ON s.id = ssr.subject_id
     WHERE ssr.tenant_id = $1`,
    [tenantId]
  );
  console.log('Stream rules count:', streamRules.rows.length, streamRules.rows.slice(0, 5));

  const assignmentsRes = await client.query(`SELECT COUNT(*) FROM student_stream_assignments WHERE tenant_id = $1`, [tenantId]);
  console.log('Current stream assignments:', assignmentsRes.rows[0].count);

  const enrollmentsRes = await client.query(`SELECT COUNT(*) FROM student_subject_enrollments WHERE tenant_id = $1`, [tenantId]);
  console.log('Current subject enrollments:', enrollmentsRes.rows[0].count);

  await client.end();
}

check().catch(console.error);
