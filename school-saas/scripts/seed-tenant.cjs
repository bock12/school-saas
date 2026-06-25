const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function seed() {
  console.log('Connecting to database...');
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  
  try {
    await client.connect();
    
    // 1. Recreate the tenant
    console.log('Recreating demo tenant "School A"...');
    await client.query(`DELETE FROM public.tenants WHERE slug = 'school-a'`);
    
    const insertTenant = await client.query(`
      INSERT INTO public.tenants (name, slug, domain, status)
      VALUES ('Greenwood High', 'school-a', 'school-a.localhost:3000', 'active')
      RETURNING id
    `);
    const tenantId = insertTenant.rows[0].id;

    // 3. Create Academic Year
    console.log('Creating Academic Year & Terms...');
    const yearRes = await client.query(`
      INSERT INTO public.academic_years (tenant_id, name, start_date, end_date, is_current)
      VALUES ($1, '2025-2026', '2025-09-01', '2026-06-30', true)
      RETURNING id
    `, [tenantId]);
    const yearId = yearRes.rows[0].id;

    // 4. Create Terms
    await client.query(`
      INSERT INTO public.terms (tenant_id, academic_year_id, name, start_date, end_date, is_current, sort_order)
      VALUES 
      ($1, $2, 'Term 1', '2025-09-01', '2025-12-15', false, 1),
      ($1, $2, 'Term 2', '2026-01-05', '2026-03-30', true, 2),
      ($1, $2, 'Term 3', '2026-04-15', '2026-06-30', false, 3)
    `, [tenantId, yearId]);

    // 5. Create Departments
    console.log('Creating Departments & Subjects...');
    const deptRes = await client.query(`
      INSERT INTO public.departments (tenant_id, name, description)
      VALUES 
      ($1, 'Sciences', 'Science and Math department'),
      ($1, 'Humanities', 'Languages and Arts')
      RETURNING id, name
    `, [tenantId]);
    
    const scienceId = deptRes.rows.find(d => d.name === 'Sciences').id;
    const humanitiesId = deptRes.rows.find(d => d.name === 'Humanities').id;

    // 6. Create Subjects
    await client.query(`
      INSERT INTO public.subjects (tenant_id, department_id, name, code, is_elective)
      VALUES 
      ($1, $2, 'Mathematics', 'MATH101', false),
      ($1, $2, 'Physics', 'PHY101', false),
      ($1, $3, 'English Language', 'ENG101', false),
      ($1, $3, 'History', 'HIS101', true)
    `, [tenantId, scienceId, humanitiesId]);

    // 7. Create Classes & Sections
    console.log('Creating Classes & Sections...');
    const classRes = await client.query(`
      INSERT INTO public.classes (tenant_id, name, short_name, capacity)
      VALUES 
      ($1, 'Grade 10', 'G10', 80),
      ($1, 'Grade 11', 'G11', 80)
      RETURNING id, name
    `, [tenantId]);

    const grade10Id = classRes.rows.find(c => c.name === 'Grade 10').id;
    const grade11Id = classRes.rows.find(c => c.name === 'Grade 11').id;

    const sectionRes = await client.query(`
      INSERT INTO public.sections (tenant_id, class_id, name, capacity)
      VALUES 
      ($1, $2, 'A', 40),
      ($1, $2, 'B', 40),
      ($1, $3, 'A', 40)
      RETURNING id, name, class_id
    `, [tenantId, grade10Id, grade11Id]);

    const grade10AId = sectionRes.rows.find(s => s.class_id === grade10Id && s.name === 'A').id;
    const grade11AId = sectionRes.rows.find(s => s.class_id === grade11Id && s.name === 'A').id;

    // 8. Create Students
    console.log('Creating Students...');

    const studentRes = await client.query(`
      INSERT INTO public.students (tenant_id, first_name, last_name, admission_number, gender, guardian_name, guardian_phone, is_active)
      VALUES 
      ($1, 'Amara', 'Johnson', 'STU-001', 'female', 'Mrs. Johnson', '+1 555-0101', true),
      ($1, 'David', 'Okafor', 'STU-002', 'male', 'Mr. Okafor', '+1 555-0102', true)
      RETURNING id, first_name
    `, [tenantId]);

    const amaraId = studentRes.rows.find(s => s.first_name === 'Amara').id;
    const davidId = studentRes.rows.find(s => s.first_name === 'David').id;

    // 9. Enroll Students
    console.log('Enrolling Students...');
    await client.query(`
      INSERT INTO public.class_enrollments (tenant_id, student_id, section_id, academic_year_id)
      VALUES 
      ($1, $2, $4, $6),
      ($1, $3, $5, $6)
    `, [
      tenantId, 
      amaraId, davidId, 
      grade10AId, grade11AId,
      yearId
    ]);

    // 10. Create Teachers
    console.log('Creating Teachers...');

    await client.query(`
      INSERT INTO public.teachers (tenant_id, first_name, last_name, employee_id, phone, department_id, qualification, is_active)
      VALUES 
      ($1, 'John', 'Smith', 'TCH-001', '+1 555-1001', $2, 'M.Sc Mathematics', true)
    `, [tenantId, scienceId]);


    console.log('\n✅ Seeding complete! Database is populated with dummy data.');

  } catch (err) {
    console.error('\n❌ Seeding failed:');
    console.error(err.message);
  } finally {
    await client.end();
  }
}

seed();
