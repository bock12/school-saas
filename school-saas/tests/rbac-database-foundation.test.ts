import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

// Read connection string from .env.local
const envContent = fs.readFileSync(path.resolve('.env.local'), 'utf8');
let dbUrl = '';
for (const line of envContent.split(/\r?\n/)) {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.substring('DATABASE_URL='.length).trim().replace(/^['"]|['"]$/g, '');
  }
}

import { resolveTestSslConfig } from './security/rls-database-boundary.test';

const defaultCaPath = path.join(process.cwd(), 'supabase', 'certs', 'prod-ca-2021.crt');
if (!process.env.DATABASE_SSL_CA && fs.existsSync(defaultCaPath)) {
  process.env.DATABASE_SSL_CA = defaultCaPath;
}

async function getClient() {
  const client = new Client({
    connectionString: dbUrl,
    ssl: resolveTestSslConfig(process.env)
  });
  await client.connect();
  return client;
}

// ---------------------------------------------------------------------------
// GROUP 1: Schema & Permission Catalog
// ---------------------------------------------------------------------------
describe('Group 1 — Schema & Permission Catalog', () => {

  test('permissions_catalog contains exactly 33 rows', async () => {
    const client = await getClient();
    try {
      const res = await client.query('SELECT count(*)::int AS count FROM public.permissions_catalog');
      assert.equal(res.rows[0].count, 33, 'permissions_catalog must contain exactly 33 rows');
    } finally {
      await client.end();
    }
  });

  test('all permission_keys adhere to <module>.<resource>.<action> grammar', async () => {
    const client = await getClient();
    try {
      const res = await client.query('SELECT permission_key FROM public.permissions_catalog');
      const grammar = /^[a-z_]+(\.[a-z_]+){2}$/;
      for (const row of res.rows) {
        assert.ok(grammar.test(row.permission_key), `Permission key ${row.permission_key} must match <module>.<resource>.<action>`);
      }
    } finally {
      await client.end();
    }
  });

  test('all 7 canonical scopes are represented in canonical_scope enum without "own" alias', async () => {
    const client = await getClient();
    try {
      const res = await client.query(`
        SELECT e.enumlabel
        FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'canonical_scope'
        ORDER BY e.enumsortorder
      `);
      const labels = res.rows.map((r: any) => r.enumlabel);
      const expected = ['platform', 'org', 'school', 'department', 'class', 'offering', 'self'];
      assert.deepEqual(labels, expected, 'canonical_scope enum must match canonical scopes');
      assert.ok(!labels.includes('own'), 'Enum must not contain "own" alias');
    } finally {
      await client.end();
    }
  });

  test('curriculum.version.publish has canonical scope "school"', async () => {
    const client = await getClient();
    try {
      const res = await client.query(`
        SELECT scope FROM public.permissions_catalog WHERE permission_key = 'curriculum.version.publish'
      `);
      assert.equal(res.rows[0]?.scope, 'school', 'curriculum.version.publish must have scope "school"');
    } finally {
      await client.end();
    }
  });

  test('duplicate permission_key insert is rejected by UNIQUE constraint', async () => {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      let failed = false;
      try {
        await client.query(`
          INSERT INTO public.permissions_catalog (permission_key, module, resource, action, description, scope)
          VALUES ('admissions.applicants.view', 'admissions', 'applicants', 'view', 'Duplicate', 'school')
        `);
      } catch (e: any) {
        failed = true;
        assert.ok(e.message.includes('unique') || e.code === '23505', 'Must reject with unique constraint violation');
      } finally {
        await client.query('ROLLBACK');
      }
      assert.ok(failed, 'Should have failed on duplicate key');
    } finally {
      await client.end();
    }
  });

  test('permissions_catalog has RLS enabled', async () => {
    const client = await getClient();
    try {
      const res = await client.query(`
        SELECT rowsecurity FROM pg_tables
        WHERE schemaname = 'public' AND tablename = 'permissions_catalog'
      `);
      assert.equal(res.rows[0].rowsecurity, true, 'permissions_catalog must have rowsecurity = true');
    } finally {
      await client.end();
    }
  });

  test('school_staff_assignments has NO school_id column', async () => {
    const client = await getClient();
    try {
      const res = await client.query(`
        SELECT column_name FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'school_staff_assignments'
      `);
      const cols = res.rows.map((r: any) => r.column_name);
      assert.ok(!cols.includes('school_id'), 'school_id must NOT exist in school_staff_assignments');
      assert.ok(cols.includes('tenant_id'), 'tenant_id must exist in school_staff_assignments');
    } finally {
      await client.end();
    }
  });

  test('school_staff_assignments foreign keys use ON DELETE RESTRICT for historical preservation', async () => {
    const client = await getClient();
    try {
      const res = await client.query(`
        SELECT tc.constraint_name, kcu.column_name, rc.delete_rule
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
        JOIN information_schema.referential_constraints rc
          ON tc.constraint_name = rc.constraint_name AND tc.table_schema = rc.constraint_schema
        WHERE tc.table_schema = 'public' AND tc.table_name = 'school_staff_assignments'
          AND kcu.column_name IN ('teacher_id', 'academic_year_id', 'department_id', 'section_id', 'subject_offering_id')
      `);
      for (const row of res.rows) {
        assert.equal(row.delete_rule, 'RESTRICT', `Foreign key on ${row.column_name} must use ON DELETE RESTRICT`);
      }
    } finally {
      await client.end();
    }
  });

});

// ---------------------------------------------------------------------------
// GROUP 2: Staff Assignment Lifecycle & Constraint Integrity
// ---------------------------------------------------------------------------
describe('Group 2 — Staff Assignment Lifecycle & Integrity', () => {

  test('check_date_range rejects effective_until < effective_from', async () => {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      let rejected = false;
      try {
        const tId = (await client.query(`INSERT INTO public.tenants (name, slug, type) VALUES ('T1', 't1-' || gen_random_uuid(), 'school') RETURNING id`)).rows[0].id;
        const ayId = (await client.query(`INSERT INTO public.academic_years (tenant_id, name, start_date, end_date, is_current) VALUES ($1, '2026/2027', '2026-09-01', '2027-06-30', true) RETURNING id`, [tId])).rows[0].id;
        const uId = (await client.query(`INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'u1-' || gen_random_uuid() || '@test.com') RETURNING id`)).rows[0].id;
        await client.query(`INSERT INTO public.profiles (id, tenant_id, role, full_name, is_active) VALUES ($1, $2, 'teacher', 'Teach', true)`, [uId, tId]);
        const teachId = (await client.query(`INSERT INTO public.teachers (tenant_id, profile_id, first_name, last_name, employee_id) VALUES ($1, $2, 'T', '1', 'EMP-' || gen_random_uuid()) RETURNING id`, [tId, uId])).rows[0].id;

        await client.query(`
          INSERT INTO public.school_staff_assignments (
            tenant_id, teacher_id, assignment_type, academic_year_id,
            effective_from, effective_until
          ) VALUES ($1, $2, 'exam_officer', $3, '2026-09-01', '2026-08-01')
        `, [tId, teachId, ayId]);
      } catch (e: any) {
        rejected = true;
        assert.ok(e.message.includes('check_date_range') || e.code === '23514');
      } finally {
        await client.query('ROLLBACK');
      }
      assert.ok(rejected, 'Should have rejected invalid date range');
    } finally {
      await client.end();
    }
  });

  test('check_lifecycle_consistency rejects revoked with is_active = true', async () => {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      let rejected = false;
      try {
        const tId = (await client.query(`INSERT INTO public.tenants (name, slug, type) VALUES ('T2', 't2-' || gen_random_uuid(), 'school') RETURNING id`)).rows[0].id;
        const ayId = (await client.query(`INSERT INTO public.academic_years (tenant_id, name, start_date, end_date, is_current) VALUES ($1, '2026/2027', '2026-09-01', '2027-06-30', true) RETURNING id`, [tId])).rows[0].id;
        const uId = (await client.query(`INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'u2-' || gen_random_uuid() || '@test.com') RETURNING id`)).rows[0].id;
        await client.query(`INSERT INTO public.profiles (id, tenant_id, role, full_name, is_active) VALUES ($1, $2, 'teacher', 'Teach', true)`, [uId, tId]);
        const teachId = (await client.query(`INSERT INTO public.teachers (tenant_id, profile_id, first_name, last_name, employee_id) VALUES ($1, $2, 'T', '2', 'EMP-' || gen_random_uuid()) RETURNING id`, [tId, uId])).rows[0].id;

        await client.query(`
          INSERT INTO public.school_staff_assignments (
            tenant_id, teacher_id, assignment_type, academic_year_id,
            status, is_active
          ) VALUES ($1, $2, 'exam_officer', $3, 'revoked', true)
        `, [tId, teachId, ayId]);
      } catch (e: any) {
        rejected = true;
        assert.ok(e.message.includes('check_lifecycle_consistency') || e.code === '23514');
      } finally {
        await client.query('ROLLBACK');
      }
      assert.ok(rejected, 'Should have rejected revoked with is_active = true');
    } finally {
      await client.end();
    }
  });

  test('check_revocation_consistency rejects revoked with revoked_at IS NULL', async () => {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      let rejected = false;
      try {
        const tId = (await client.query(`INSERT INTO public.tenants (name, slug, type) VALUES ('T3', 't3-' || gen_random_uuid(), 'school') RETURNING id`)).rows[0].id;
        const ayId = (await client.query(`INSERT INTO public.academic_years (tenant_id, name, start_date, end_date, is_current) VALUES ($1, '2026/2027', '2026-09-01', '2027-06-30', true) RETURNING id`, [tId])).rows[0].id;
        const uId = (await client.query(`INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'u3-' || gen_random_uuid() || '@test.com') RETURNING id`)).rows[0].id;
        await client.query(`INSERT INTO public.profiles (id, tenant_id, role, full_name, is_active) VALUES ($1, $2, 'teacher', 'Teach', true)`, [uId, tId]);
        const teachId = (await client.query(`INSERT INTO public.teachers (tenant_id, profile_id, first_name, last_name, employee_id) VALUES ($1, $2, 'T', '3', 'EMP-' || gen_random_uuid()) RETURNING id`, [tId, uId])).rows[0].id;

        await client.query(`
          INSERT INTO public.school_staff_assignments (
            tenant_id, teacher_id, assignment_type, academic_year_id,
            status, is_active, revoked_at
          ) VALUES ($1, $2, 'exam_officer', $3, 'revoked', false, NULL)
        `, [tId, teachId, ayId]);
      } catch (e: any) {
        rejected = true;
        assert.ok(e.message.includes('check_revocation_consistency') || e.code === '23514');
      } finally {
        await client.query('ROLLBACK');
      }
      assert.ok(rejected, 'Should have rejected revoked without revoked_at');
    } finally {
      await client.end();
    }
  });

  test('check_hod_dept rejects HOD without department_id', async () => {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      let rejected = false;
      try {
        const tId = (await client.query(`INSERT INTO public.tenants (name, slug, type) VALUES ('T4', 't4-' || gen_random_uuid(), 'school') RETURNING id`)).rows[0].id;
        const ayId = (await client.query(`INSERT INTO public.academic_years (tenant_id, name, start_date, end_date, is_current) VALUES ($1, '2026/2027', '2026-09-01', '2027-06-30', true) RETURNING id`, [tId])).rows[0].id;
        const uId = (await client.query(`INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'u4-' || gen_random_uuid() || '@test.com') RETURNING id`)).rows[0].id;
        await client.query(`INSERT INTO public.profiles (id, tenant_id, role, full_name, is_active) VALUES ($1, $2, 'teacher', 'Teach', true)`, [uId, tId]);
        const teachId = (await client.query(`INSERT INTO public.teachers (tenant_id, profile_id, first_name, last_name, employee_id) VALUES ($1, $2, 'T', '4', 'EMP-' || gen_random_uuid()) RETURNING id`, [tId, uId])).rows[0].id;

        await client.query(`
          INSERT INTO public.school_staff_assignments (
            tenant_id, teacher_id, assignment_type, academic_year_id, department_id
          ) VALUES ($1, $2, 'hod', $3, NULL)
        `, [tId, teachId, ayId]);
      } catch (e: any) {
        rejected = true;
        assert.ok(e.message.includes('check_hod_dept') || e.code === '23514');
      } finally {
        await client.query('ROLLBACK');
      }
      assert.ok(rejected, 'Should have rejected HOD without department_id');
    } finally {
      await client.end();
    }
  });

  test('check_form_master_section rejects form_master without section_id', async () => {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      let rejected = false;
      try {
        const tId = (await client.query(`INSERT INTO public.tenants (name, slug, type) VALUES ('T5', 't5-' || gen_random_uuid(), 'school') RETURNING id`)).rows[0].id;
        const ayId = (await client.query(`INSERT INTO public.academic_years (tenant_id, name, start_date, end_date, is_current) VALUES ($1, '2026/2027', '2026-09-01', '2027-06-30', true) RETURNING id`, [tId])).rows[0].id;
        const uId = (await client.query(`INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'u5-' || gen_random_uuid() || '@test.com') RETURNING id`)).rows[0].id;
        await client.query(`INSERT INTO public.profiles (id, tenant_id, role, full_name, is_active) VALUES ($1, $2, 'teacher', 'Teach', true)`, [uId, tId]);
        const teachId = (await client.query(`INSERT INTO public.teachers (tenant_id, profile_id, first_name, last_name, employee_id) VALUES ($1, $2, 'T', '5', 'EMP-' || gen_random_uuid()) RETURNING id`, [tId, uId])).rows[0].id;

        await client.query(`
          INSERT INTO public.school_staff_assignments (
            tenant_id, teacher_id, assignment_type, academic_year_id, section_id
          ) VALUES ($1, $2, 'form_master', $3, NULL)
        `, [tId, teachId, ayId]);
      } catch (e: any) {
        rejected = true;
        assert.ok(e.message.includes('check_form_master_section') || e.code === '23514');
      } finally {
        await client.query('ROLLBACK');
      }
      assert.ok(rejected, 'Should have rejected form_master without section_id');
    } finally {
      await client.end();
    }
  });

  test('check_school_scope_assignment rejects vice_principal with department_id', async () => {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      let rejected = false;
      try {
        const tId = (await client.query(`INSERT INTO public.tenants (name, slug, type) VALUES ('T6', 't6-' || gen_random_uuid(), 'school') RETURNING id`)).rows[0].id;
        const ayId = (await client.query(`INSERT INTO public.academic_years (tenant_id, name, start_date, end_date, is_current) VALUES ($1, '2026/2027', '2026-09-01', '2027-06-30', true) RETURNING id`, [tId])).rows[0].id;
        const uId = (await client.query(`INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'u6-' || gen_random_uuid() || '@test.com') RETURNING id`)).rows[0].id;
        await client.query(`INSERT INTO public.profiles (id, tenant_id, role, full_name, is_active) VALUES ($1, $2, 'teacher', 'Teach', true)`, [uId, tId]);
        const teachId = (await client.query(`INSERT INTO public.teachers (tenant_id, profile_id, first_name, last_name, employee_id) VALUES ($1, $2, 'T', '6', 'EMP-' || gen_random_uuid()) RETURNING id`, [tId, uId])).rows[0].id;
        const deptId = (await client.query(`INSERT INTO public.departments (tenant_id, name) VALUES ($1, 'Science') RETURNING id`, [tId])).rows[0].id;

        await client.query(`
          INSERT INTO public.school_staff_assignments (
            tenant_id, teacher_id, assignment_type, academic_year_id, department_id
          ) VALUES ($1, $2, 'vice_principal', $3, $4)
        `, [tId, teachId, ayId, deptId]);
      } catch (e: any) {
        rejected = true;
        assert.ok(e.message.includes('check_school_scope_assignment') || e.code === '23514');
      } finally {
        await client.query('ROLLBACK');
      }
      assert.ok(rejected, 'Should have rejected vice_principal with department_id');
    } finally {
      await client.end();
    }
  });

  test('Future-dated assignment (effective_from > CURRENT_DATE) is ALLOWED in database but evaluates as inactive', async () => {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      try {
        const tId = (await client.query(`INSERT INTO public.tenants (name, slug, type) VALUES ('T7', 't7-' || gen_random_uuid(), 'school') RETURNING id`)).rows[0].id;
        const ayId = (await client.query(`INSERT INTO public.academic_years (tenant_id, name, start_date, end_date, is_current) VALUES ($1, '2026/2027', '2026-09-01', '2027-06-30', true) RETURNING id`, [tId])).rows[0].id;
        const uId = (await client.query(`INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'u7-' || gen_random_uuid() || '@test.com') RETURNING id`)).rows[0].id;
        await client.query(`INSERT INTO public.profiles (id, tenant_id, role, full_name, is_active) VALUES ($1, $2, 'teacher', 'Teach', true)`, [uId, tId]);
        const teachId = (await client.query(`INSERT INTO public.teachers (tenant_id, profile_id, first_name, last_name, employee_id) VALUES ($1, $2, 'T', '7', 'EMP-' || gen_random_uuid()) RETURNING id`, [tId, uId])).rows[0].id;

        // Future-dated assignment (e.g. starting next month)
        const res = await client.query(`
          INSERT INTO public.school_staff_assignments (
            tenant_id, teacher_id, assignment_type, academic_year_id,
            status, is_active, effective_from
          ) VALUES ($1, $2, 'exam_officer', $3, 'active', true, CURRENT_DATE + INTERVAL '30 days')
          RETURNING id
        `, [tId, teachId, ayId]);
        const assignId = res.rows[0].id;

        // Row exists in DB
        assert.ok(assignId, 'Future-dated assignment should insert successfully');

        // is_staff_assignment_active must return false because effective_from > CURRENT_DATE
        const activeRes = await client.query(`SELECT public.is_staff_assignment_active($1) AS is_act`, [assignId]);
        assert.equal(activeRes.rows[0].is_act, false, 'Future-dated assignment must evaluate as inactive');
      } finally {
        await client.query('ROLLBACK');
      }
    } finally {
      await client.end();
    }
  });

});

// ---------------------------------------------------------------------------
// GROUP 3: Cross-Tenant & Contextual Resource Integrity
// ---------------------------------------------------------------------------
describe('Group 3 — Cross-Tenant & Contextual Resource Integrity', () => {

  test('Cross-tenant teacher mismatch is rejected by trigger', async () => {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      try {
        const tA = (await client.query(`INSERT INTO public.tenants (name, slug, type) VALUES ('TA', 'ta-' || gen_random_uuid(), 'school') RETURNING id`)).rows[0].id;
        const tB = (await client.query(`INSERT INTO public.tenants (name, slug, type) VALUES ('TB', 'tb-' || gen_random_uuid(), 'school') RETURNING id`)).rows[0].id;
        const ayA = (await client.query(`INSERT INTO public.academic_years (tenant_id, name, start_date, end_date, is_current) VALUES ($1, '2026/2027', '2026-09-01', '2027-06-30', true) RETURNING id`, [tA])).rows[0].id;
        const uB = (await client.query(`INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'ub-' || gen_random_uuid() || '@test.com') RETURNING id`)).rows[0].id;
        await client.query(`INSERT INTO public.profiles (id, tenant_id, role, full_name, is_active) VALUES ($1, $2, 'teacher', 'TB', true)`, [uB, tB]);
        const teachB = (await client.query(`INSERT INTO public.teachers (tenant_id, profile_id, first_name, last_name, employee_id) VALUES ($1, $2, 'T', 'B', 'EMP-' || gen_random_uuid()) RETURNING id`, [tB, uB])).rows[0].id;

        await client.query('SAVEPOINT sp_test');
        let rejected = false;
        try {
          await client.query(`
            INSERT INTO public.school_staff_assignments (tenant_id, teacher_id, assignment_type, academic_year_id)
            VALUES ($1, $2, 'exam_officer', $3)
          `, [tA, teachB, ayA]);
        } catch (e: any) {
          await client.query('ROLLBACK TO SAVEPOINT sp_test');
          rejected = true;
          assert.ok(e.message.includes('Cross-tenant violation: teacher'));
        }
        assert.ok(rejected, 'Should reject teacher from different tenant');
      } finally {
        await client.query('ROLLBACK');
      }
    } finally {
      await client.end();
    }
  });

  test('Cross-tenant academic year mismatch is rejected by trigger', async () => {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      try {
        const tA = (await client.query(`INSERT INTO public.tenants (name, slug, type) VALUES ('TA', 'ta-' || gen_random_uuid(), 'school') RETURNING id`)).rows[0].id;
        const tB = (await client.query(`INSERT INTO public.tenants (name, slug, type) VALUES ('TB', 'tb-' || gen_random_uuid(), 'school') RETURNING id`)).rows[0].id;
        const ayB = (await client.query(`INSERT INTO public.academic_years (tenant_id, name, start_date, end_date, is_current) VALUES ($1, '2026/2027', '2026-09-01', '2027-06-30', true) RETURNING id`, [tB])).rows[0].id;
        const uA = (await client.query(`INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'ua-' || gen_random_uuid() || '@test.com') RETURNING id`)).rows[0].id;
        await client.query(`INSERT INTO public.profiles (id, tenant_id, role, full_name, is_active) VALUES ($1, $2, 'teacher', 'TA', true)`, [uA, tA]);
        const teachA = (await client.query(`INSERT INTO public.teachers (tenant_id, profile_id, first_name, last_name, employee_id) VALUES ($1, $2, 'T', 'A', 'EMP-' || gen_random_uuid()) RETURNING id`, [tA, uA])).rows[0].id;

        await client.query('SAVEPOINT sp_test');
        let rejected = false;
        try {
          await client.query(`
            INSERT INTO public.school_staff_assignments (tenant_id, teacher_id, assignment_type, academic_year_id)
            VALUES ($1, $2, 'exam_officer', $3)
          `, [tA, teachA, ayB]);
        } catch (e: any) {
          await client.query('ROLLBACK TO SAVEPOINT sp_test');
          rejected = true;
          assert.ok(e.message.includes('Cross-tenant violation: academic_year'));
        }
        assert.ok(rejected, 'Should reject academic year from different tenant');
      } finally {
        await client.query('ROLLBACK');
      }
    } finally {
      await client.end();
    }
  });

  test('Cross-tenant department mismatch is rejected by trigger', async () => {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      try {
        const tA = (await client.query(`INSERT INTO public.tenants (name, slug, type) VALUES ('TA', 'ta-' || gen_random_uuid(), 'school') RETURNING id`)).rows[0].id;
        const tB = (await client.query(`INSERT INTO public.tenants (name, slug, type) VALUES ('TB', 'tb-' || gen_random_uuid(), 'school') RETURNING id`)).rows[0].id;
        const ayA = (await client.query(`INSERT INTO public.academic_years (tenant_id, name, start_date, end_date, is_current) VALUES ($1, '2026/2027', '2026-09-01', '2027-06-30', true) RETURNING id`, [tA])).rows[0].id;
        const deptB = (await client.query(`INSERT INTO public.departments (tenant_id, name) VALUES ($1, 'Dept B') RETURNING id`, [tB])).rows[0].id;
        const uA = (await client.query(`INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'ua-' || gen_random_uuid() || '@test.com') RETURNING id`)).rows[0].id;
        await client.query(`INSERT INTO public.profiles (id, tenant_id, role, full_name, is_active) VALUES ($1, $2, 'teacher', 'TA', true)`, [uA, tA]);
        const teachA = (await client.query(`INSERT INTO public.teachers (tenant_id, profile_id, first_name, last_name, employee_id) VALUES ($1, $2, 'T', 'A', 'EMP-' || gen_random_uuid()) RETURNING id`, [tA, uA])).rows[0].id;

        await client.query('SAVEPOINT sp_test');
        let rejected = false;
        try {
          await client.query(`
            INSERT INTO public.school_staff_assignments (tenant_id, teacher_id, assignment_type, academic_year_id, department_id)
            VALUES ($1, $2, 'hod', $3, $4)
          `, [tA, teachA, ayA, deptB]);
        } catch (e: any) {
          await client.query('ROLLBACK TO SAVEPOINT sp_test');
          rejected = true;
          assert.ok(e.message.includes('Cross-tenant violation: department'));
        }
        assert.ok(rejected, 'Should reject department from different tenant');
      } finally {
        await client.query('ROLLBACK');
      }
    } finally {
      await client.end();
    }
  });

  test('Cross-tenant section mismatch is rejected by trigger', async () => {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      try {
        const tA = (await client.query(`INSERT INTO public.tenants (name, slug, type) VALUES ('TA', 'ta-' || gen_random_uuid(), 'school') RETURNING id`)).rows[0].id;
        const tB = (await client.query(`INSERT INTO public.tenants (name, slug, type) VALUES ('TB', 'tb-' || gen_random_uuid(), 'school') RETURNING id`)).rows[0].id;
        const ayA = (await client.query(`INSERT INTO public.academic_years (tenant_id, name, start_date, end_date, is_current) VALUES ($1, '2026/2027', '2026-09-01', '2027-06-30', true) RETURNING id`, [tA])).rows[0].id;
        const classB = (await client.query(`INSERT INTO public.classes (tenant_id, name) VALUES ($1, 'Class B') RETURNING id`, [tB])).rows[0].id;
        const secB = (await client.query(`INSERT INTO public.sections (tenant_id, class_id, name) VALUES ($1, $2, 'Sec B') RETURNING id`, [tB, classB])).rows[0].id;

        const uA = (await client.query(`INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'ua-' || gen_random_uuid() || '@test.com') RETURNING id`)).rows[0].id;
        await client.query(`INSERT INTO public.profiles (id, tenant_id, role, full_name, is_active) VALUES ($1, $2, 'teacher', 'TA', true)`, [uA, tA]);
        const teachA = (await client.query(`INSERT INTO public.teachers (tenant_id, profile_id, first_name, last_name, employee_id) VALUES ($1, $2, 'T', 'A', 'EMP-' || gen_random_uuid()) RETURNING id`, [tA, uA])).rows[0].id;

        await client.query('SAVEPOINT sp_test');
        let rejected = false;
        try {
          await client.query(`
            INSERT INTO public.school_staff_assignments (tenant_id, teacher_id, assignment_type, academic_year_id, section_id)
            VALUES ($1, $2, 'form_master', $3, $4)
          `, [tA, teachA, ayA, secB]);
        } catch (e: any) {
          await client.query('ROLLBACK TO SAVEPOINT sp_test');
          rejected = true;
          assert.ok(e.message.includes('Cross-tenant violation: section'));
        }
        assert.ok(rejected, 'Should reject section from different tenant');
      } finally {
        await client.query('ROLLBACK');
      }
    } finally {
      await client.end();
    }
  });

  test('Cross-tenant offering and academic-year mismatch are rejected by trigger', async () => {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      try {
        const tA = (await client.query(`INSERT INTO public.tenants (name, slug, type) VALUES ('TA', 'ta-' || gen_random_uuid(), 'school') RETURNING id`)).rows[0].id;
        const tB = (await client.query(`INSERT INTO public.tenants (name, slug, type) VALUES ('TB', 'tb-' || gen_random_uuid(), 'school') RETURNING id`)).rows[0].id;
        const ayA = (await client.query(`INSERT INTO public.academic_years (tenant_id, name, start_date, end_date, is_current) VALUES ($1, '2026/2027', '2026-09-01', '2027-06-30', true) RETURNING id`, [tA])).rows[0].id;
        const ayA_past = (await client.query(`INSERT INTO public.academic_years (tenant_id, name, start_date, end_date, is_current) VALUES ($1, '2025/2026', '2025-09-01', '2026-06-30', false) RETURNING id`, [tA])).rows[0].id;
        const ayB = (await client.query(`INSERT INTO public.academic_years (tenant_id, name, start_date, end_date, is_current) VALUES ($1, '2026/2027', '2026-09-01', '2027-06-30', true) RETURNING id`, [tB])).rows[0].id;

        const uA = (await client.query(`INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'ua-' || gen_random_uuid() || '@test.com') RETURNING id`)).rows[0].id;
        await client.query(`INSERT INTO public.profiles (id, tenant_id, role, full_name, is_active) VALUES ($1, $2, 'teacher', 'TA', true)`, [uA, tA]);
        const teachA = (await client.query(`INSERT INTO public.teachers (tenant_id, profile_id, first_name, last_name, employee_id) VALUES ($1, $2, 'T', 'A', 'EMP-' || gen_random_uuid()) RETURNING id`, [tA, uA])).rows[0].id;

        const classA = (await client.query(`INSERT INTO public.classes (tenant_id, name) VALUES ($1, 'Class A') RETURNING id`, [tA])).rows[0].id;
        const secA = (await client.query(`INSERT INTO public.sections (tenant_id, class_id, name) VALUES ($1, $2, 'Sec A') RETURNING id`, [tA, classA])).rows[0].id;
        const subjA = (await client.query(`INSERT INTO public.subjects (tenant_id, name, code) VALUES ($1, 'Math', 'MTH-' || gen_random_uuid()) RETURNING id`, [tA])).rows[0].id;
        const offA_past = (await client.query(`INSERT INTO public.subject_offerings (tenant_id, academic_year_id, subject_id, section_id, teacher_id) VALUES ($1, $2, $3, $4, $5) RETURNING id`, [tA, ayA_past, subjA, secA, teachA])).rows[0].id;

        const classB = (await client.query(`INSERT INTO public.classes (tenant_id, name) VALUES ($1, 'Class B') RETURNING id`, [tB])).rows[0].id;
        const secB = (await client.query(`INSERT INTO public.sections (tenant_id, class_id, name) VALUES ($1, $2, 'Sec B') RETURNING id`, [tB, classB])).rows[0].id;
        const subjB = (await client.query(`INSERT INTO public.subjects (tenant_id, name, code) VALUES ($1, 'Math B', 'MTHB-' || gen_random_uuid()) RETURNING id`, [tB])).rows[0].id;
        const uB = (await client.query(`INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'ub-' || gen_random_uuid() || '@test.com') RETURNING id`)).rows[0].id;
        await client.query(`INSERT INTO public.profiles (id, tenant_id, role, full_name, is_active) VALUES ($1, $2, 'teacher', 'TB', true)`, [uB, tB]);
        const teachB = (await client.query(`INSERT INTO public.teachers (tenant_id, profile_id, first_name, last_name, employee_id) VALUES ($1, $2, 'T', 'B', 'EMP-' || gen_random_uuid()) RETURNING id`, [tB, uB])).rows[0].id;
        const offB = (await client.query(`INSERT INTO public.subject_offerings (tenant_id, academic_year_id, subject_id, section_id, teacher_id) VALUES ($1, $2, $3, $4, $5) RETURNING id`, [tB, ayB, subjB, secB, teachB])).rows[0].id;

        // Subtest A: Cross-tenant offering mismatch
        await client.query('SAVEPOINT sp_test');
        let rejCross = false;
        try {
          await client.query(`
            INSERT INTO public.school_staff_assignments (tenant_id, teacher_id, assignment_type, academic_year_id, subject_offering_id)
            VALUES ($1, $2, 'subject_teacher', $3, $4)
          `, [tA, teachA, ayA, offB]);
        } catch (e: any) {
          await client.query('ROLLBACK TO SAVEPOINT sp_test');
          rejCross = true;
          assert.ok(e.message.includes('Cross-tenant violation: subject_offering'));
        }
        assert.ok(rejCross, 'Should reject offering from different tenant');

        // Subtest B: Offering academic-year mismatch
        await client.query('SAVEPOINT sp_test');
        let rejYear = false;
        try {
          await client.query(`
            INSERT INTO public.school_staff_assignments (tenant_id, teacher_id, assignment_type, academic_year_id, subject_offering_id)
            VALUES ($1, $2, 'subject_teacher', $3, $4)
          `, [tA, teachA, ayA, offA_past]);
        } catch (e: any) {
          await client.query('ROLLBACK TO SAVEPOINT sp_test');
          rejYear = true;
          assert.ok(e.message.includes('Academic-year mismatch: subject_offering'));
        }
        assert.ok(rejYear, 'Should reject offering with mismatched academic year');
      } finally {
        await client.query('ROLLBACK');
      }
    } finally {
      await client.end();
    }
  });

  test('Historical preservation: deleting teacher, department, or academic year is RESTRICTED', async () => {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      try {
        const tId = (await client.query(`INSERT INTO public.tenants (name, slug, type) VALUES ('T_Hist', 't-hist-' || gen_random_uuid(), 'school') RETURNING id`)).rows[0].id;
        const ayId = (await client.query(`INSERT INTO public.academic_years (tenant_id, name, start_date, end_date, is_current) VALUES ($1, '2026/2027', '2026-09-01', '2027-06-30', true) RETURNING id`, [tId])).rows[0].id;
        const uId = (await client.query(`INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'u-hist-' || gen_random_uuid() || '@test.com') RETURNING id`)).rows[0].id;
        await client.query(`INSERT INTO public.profiles (id, tenant_id, role, full_name, is_active) VALUES ($1, $2, 'teacher', 'Teach Hist', true)`, [uId, tId]);
        const teachId = (await client.query(`INSERT INTO public.teachers (tenant_id, profile_id, first_name, last_name, employee_id) VALUES ($1, $2, 'T', 'H', 'EMP-' || gen_random_uuid()) RETURNING id`, [tId, uId])).rows[0].id;
        const deptId = (await client.query(`INSERT INTO public.departments (tenant_id, name) VALUES ($1, 'Dept Hist') RETURNING id`, [tId])).rows[0].id;

        // Insert valid assignment
        await client.query(`
          INSERT INTO public.school_staff_assignments (tenant_id, teacher_id, assignment_type, academic_year_id, department_id)
          VALUES ($1, $2, 'hod', $3, $4)
        `, [tId, teachId, ayId, deptId]);

        // Attempt delete teacher -> MUST FAIL with foreign key violation
        await client.query('SAVEPOINT sp_del_teach');
        let teachDelFailed = false;
        try {
          await client.query(`DELETE FROM public.teachers WHERE id = $1`, [teachId]);
        } catch (e: any) {
          await client.query('ROLLBACK TO SAVEPOINT sp_del_teach');
          teachDelFailed = true;
          assert.ok(e.message.includes('violates foreign key constraint') || e.code === '23503');
        }
        assert.ok(teachDelFailed, 'Must prevent teacher deletion when referenced by assignments');

        // Attempt delete department -> MUST FAIL with foreign key violation
        await client.query('SAVEPOINT sp_del_dept');
        let deptDelFailed = false;
        try {
          await client.query(`DELETE FROM public.departments WHERE id = $1`, [deptId]);
        } catch (e: any) {
          await client.query('ROLLBACK TO SAVEPOINT sp_del_dept');
          deptDelFailed = true;
          assert.ok(e.message.includes('violates foreign key constraint') || e.code === '23503');
        }
        assert.ok(deptDelFailed, 'Must prevent department deletion when referenced by assignments');

        // Attempt delete academic year -> MUST FAIL with foreign key violation
        await client.query('SAVEPOINT sp_del_ay');
        let ayDelFailed = false;
        try {
          await client.query(`DELETE FROM public.academic_years WHERE id = $1`, [ayId]);
        } catch (e: any) {
          await client.query('ROLLBACK TO SAVEPOINT sp_del_ay');
          ayDelFailed = true;
          assert.ok(e.message.includes('violates foreign key constraint') || e.code === '23503');
        }
        assert.ok(ayDelFailed, 'Must prevent academic year deletion when referenced by assignments');
      } finally {
        await client.query('ROLLBACK');
      }
    } finally {
      await client.end();
    }
  });

});

// ---------------------------------------------------------------------------
// GROUP 4: Current-Year Invariants & Academic Year Scoping
// ---------------------------------------------------------------------------
describe('Group 4 — Current-Year Invariants & Academic Year Scoping', () => {

  test('0 current academic years fails closed (is_hod returns false)', async () => {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      try {
        const tId = (await client.query(`INSERT INTO public.tenants (name, slug, type) VALUES ('T_Zero', 't-zero-' || gen_random_uuid(), 'school') RETURNING id`)).rows[0].id;
        const uId = (await client.query(`INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'u-zero-' || gen_random_uuid() || '@test.com') RETURNING id`)).rows[0].id;
        await client.query(`INSERT INTO public.profiles (id, tenant_id, role, full_name, is_active) VALUES ($1, $2, 'teacher', 'Teach Zero', true)`, [uId, tId]);
        const teachId = (await client.query(`INSERT INTO public.teachers (tenant_id, profile_id, first_name, last_name, employee_id) VALUES ($1, $2, 'T', 'Z', 'EMP-' || gen_random_uuid()) RETURNING id`, [tId, uId])).rows[0].id;
        const deptId = (await client.query(`INSERT INTO public.departments (tenant_id, name) VALUES ($1, 'Dept Zero') RETURNING id`, [tId])).rows[0].id;

        // Academic year with is_current = false
        const ayId = (await client.query(`INSERT INTO public.academic_years (tenant_id, name, start_date, end_date, is_current) VALUES ($1, 'Past Year', '2025-09-01', '2026-06-30', false) RETURNING id`, [tId])).rows[0].id;

        await client.query(`
          INSERT INTO public.school_staff_assignments (tenant_id, teacher_id, assignment_type, academic_year_id, department_id, status, is_active, effective_from)
          VALUES ($1, $2, 'hod', $3, $4, 'active', true, CURRENT_DATE)
        `, [tId, teachId, ayId, deptId]);

        await client.query(`SET LOCAL "request.jwt.claim.sub" = '${uId}'`);
        await client.query(`SET LOCAL "request.jwt.claims" = '{"sub":"${uId}"}'`);

        const res = await client.query(`SELECT public.is_hod($1) AS ok`, [deptId]);
        assert.equal(res.rows[0].ok, false, 'is_hod must return false when 0 current academic years exist');
      } finally {
        await client.query('ROLLBACK');
      }
    } finally {
      await client.end();
    }
  });

  test('Exactly 1 current academic year is valid (is_hod returns true)', async () => {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      try {
        const tId = (await client.query(`INSERT INTO public.tenants (name, slug, type) VALUES ('T_One', 't-one-' || gen_random_uuid(), 'school') RETURNING id`)).rows[0].id;
        const uId = (await client.query(`INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'u-one-' || gen_random_uuid() || '@test.com') RETURNING id`)).rows[0].id;
        await client.query(`INSERT INTO public.profiles (id, tenant_id, role, full_name, is_active) VALUES ($1, $2, 'teacher', 'Teach One', true)`, [uId, tId]);
        const teachId = (await client.query(`INSERT INTO public.teachers (tenant_id, profile_id, first_name, last_name, employee_id) VALUES ($1, $2, 'T', 'O', 'EMP-' || gen_random_uuid()) RETURNING id`, [tId, uId])).rows[0].id;
        const deptId = (await client.query(`INSERT INTO public.departments (tenant_id, name) VALUES ($1, 'Dept One') RETURNING id`, [tId])).rows[0].id;

        const ayId = (await client.query(`INSERT INTO public.academic_years (tenant_id, name, start_date, end_date, is_current) VALUES ($1, 'Current Year', '2026-09-01', '2027-06-30', true) RETURNING id`, [tId])).rows[0].id;

        await client.query(`
          INSERT INTO public.school_staff_assignments (tenant_id, teacher_id, assignment_type, academic_year_id, department_id, status, is_active, effective_from)
          VALUES ($1, $2, 'hod', $3, $4, 'active', true, CURRENT_DATE)
        `, [tId, teachId, ayId, deptId]);

        await client.query(`SET LOCAL "request.jwt.claim.sub" = '${uId}'`);
        await client.query(`SET LOCAL "request.jwt.claims" = '{"sub":"${uId}"}'`);

        const res = await client.query(`SELECT public.is_hod($1) AS ok`, [deptId]);
        assert.equal(res.rows[0].ok, true, 'is_hod must return true for assignment in current academic year');
      } finally {
        await client.query('ROLLBACK');
      }
    } finally {
      await client.end();
    }
  });

  test('>1 current academic years fails closed (is_hod returns false)', async () => {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      try {
        const tId = (await client.query(`INSERT INTO public.tenants (name, slug, type) VALUES ('T_Multi', 't-multi-' || gen_random_uuid(), 'school') RETURNING id`)).rows[0].id;
        const uId = (await client.query(`INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'u-multi-' || gen_random_uuid() || '@test.com') RETURNING id`)).rows[0].id;
        await client.query(`INSERT INTO public.profiles (id, tenant_id, role, full_name, is_active) VALUES ($1, $2, 'teacher', 'Teach Multi', true)`, [uId, tId]);
        const teachId = (await client.query(`INSERT INTO public.teachers (tenant_id, profile_id, first_name, last_name, employee_id) VALUES ($1, $2, 'T', 'M', 'EMP-' || gen_random_uuid()) RETURNING id`, [tId, uId])).rows[0].id;
        const deptId = (await client.query(`INSERT INTO public.departments (tenant_id, name) VALUES ($1, 'Dept Multi') RETURNING id`, [tId])).rows[0].id;

        const ay1 = (await client.query(`INSERT INTO public.academic_years (tenant_id, name, start_date, end_date, is_current) VALUES ($1, 'Year 1', '2026-09-01', '2027-06-30', true) RETURNING id`, [tId])).rows[0].id;

        await client.query(`
          INSERT INTO public.school_staff_assignments (tenant_id, teacher_id, assignment_type, academic_year_id, department_id, status, is_active, effective_from)
          VALUES ($1, $2, 'hod', $3, $4, 'active', true, CURRENT_DATE)
        `, [tId, teachId, ay1, deptId]);

        // Temporarily drop partial unique index to simulate corrupted data state
        await client.query('DROP INDEX IF EXISTS public.uniq_current_academic_year_per_tenant');
        await client.query(`INSERT INTO public.academic_years (tenant_id, name, start_date, end_date, is_current) VALUES ($1, 'Year 2 Duplicate', '2026-09-01', '2027-06-30', true)`, [tId]);

        await client.query(`SET LOCAL "request.jwt.claim.sub" = '${uId}'`);
        await client.query(`SET LOCAL "request.jwt.claims" = '{"sub":"${uId}"}'`);

        const res = await client.query(`SELECT public.is_hod($1) AS ok`, [deptId]);
        assert.equal(res.rows[0].ok, false, 'is_hod must fail closed (return false) if multiple current academic years exist');
      } finally {
        await client.query('ROLLBACK');
      }
    } finally {
      await client.end();
    }
  });

  test('uniq_current_academic_year_per_tenant database constraint rejects multiple is_current = true rows per tenant', async () => {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      try {
        const tId = (await client.query(`INSERT INTO public.tenants (name, slug, type) VALUES ('T_Uniq', 't-uniq-' || gen_random_uuid(), 'school') RETURNING id`)).rows[0].id;
        await client.query(`INSERT INTO public.academic_years (tenant_id, name, start_date, end_date, is_current) VALUES ($1, 'Year 1', '2026-09-01', '2027-06-30', true)`, [tId]);

        await client.query('SAVEPOINT sp_dup_year');
        let rejected = false;
        try {
          await client.query(`INSERT INTO public.academic_years (tenant_id, name, start_date, end_date, is_current) VALUES ($1, 'Year 2', '2026-09-01', '2027-06-30', true)`, [tId]);
        } catch (e: any) {
          await client.query('ROLLBACK TO SAVEPOINT sp_dup_year');
          rejected = true;
          assert.ok(e.message.includes('unique') || e.code === '23505');
        }
        assert.ok(rejected, 'Must reject multiple current academic years for the same tenant');
      } finally {
        await client.query('ROLLBACK');
      }
    } finally {
      await client.end();
    }
  });

  test('Cross-tenant isolation: assignment in Tenant A does not grant authority in Tenant B', async () => {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      try {
        const tA = (await client.query(`INSERT INTO public.tenants (name, slug, type) VALUES ('T_IsoA', 't-iso-a-' || gen_random_uuid(), 'school') RETURNING id`)).rows[0].id;
        const tB = (await client.query(`INSERT INTO public.tenants (name, slug, type) VALUES ('T_IsoB', 't-iso-b-' || gen_random_uuid(), 'school') RETURNING id`)).rows[0].id;
        const ayA = (await client.query(`INSERT INTO public.academic_years (tenant_id, name, start_date, end_date, is_current) VALUES ($1, '2026/2027', '2026-09-01', '2027-06-30', true) RETURNING id`, [tA])).rows[0].id;
        const uA = (await client.query(`INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'u-iso-' || gen_random_uuid() || '@test.com') RETURNING id`)).rows[0].id;
        await client.query(`INSERT INTO public.profiles (id, tenant_id, role, full_name, is_active) VALUES ($1, $2, 'teacher', 'Teach Iso', true)`, [uA, tA]);
        const teachA = (await client.query(`INSERT INTO public.teachers (tenant_id, profile_id, first_name, last_name, employee_id) VALUES ($1, $2, 'T', 'I', 'EMP-' || gen_random_uuid()) RETURNING id`, [tA, uA])).rows[0].id;
        const deptB = (await client.query(`INSERT INTO public.departments (tenant_id, name) VALUES ($1, 'Dept B') RETURNING id`, [tB])).rows[0].id;

        await client.query(`SET LOCAL "request.jwt.claim.sub" = '${uA}'`);
        await client.query(`SET LOCAL "request.jwt.claims" = '{"sub":"${uA}"}'`);

        const res = await client.query(`SELECT public.is_hod($1) AS ok`, [deptB]);
        assert.equal(res.rows[0].ok, false, 'is_hod must return false for department in different tenant');
      } finally {
        await client.query('ROLLBACK');
      }
    } finally {
      await client.end();
    }
  });

  test('Fails closed if profile is deactivated', async () => {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      try {
        const tId = (await client.query(`INSERT INTO public.tenants (name, slug, type) VALUES ('T_Deact', 't-deact-' || gen_random_uuid(), 'school') RETURNING id`)).rows[0].id;
        const ayId = (await client.query(`INSERT INTO public.academic_years (tenant_id, name, start_date, end_date, is_current) VALUES ($1, '2026/2027', '2026-09-01', '2027-06-30', true) RETURNING id`, [tId])).rows[0].id;
        const uId = (await client.query(`INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'u-deact-' || gen_random_uuid() || '@test.com') RETURNING id`)).rows[0].id;
        await client.query(`INSERT INTO public.profiles (id, tenant_id, role, full_name, is_active) VALUES ($1, $2, 'teacher', 'Teach Deact', false)`, [uId, tId]);
        const teachId = (await client.query(`INSERT INTO public.teachers (tenant_id, profile_id, first_name, last_name, employee_id) VALUES ($1, $2, 'T', 'D', 'EMP-' || gen_random_uuid()) RETURNING id`, [tId, uId])).rows[0].id;
        const deptId = (await client.query(`INSERT INTO public.departments (tenant_id, name) VALUES ($1, 'Dept Deact') RETURNING id`, [tId])).rows[0].id;

        await client.query(`
          INSERT INTO public.school_staff_assignments (tenant_id, teacher_id, assignment_type, academic_year_id, department_id, status, is_active, effective_from)
          VALUES ($1, $2, 'hod', $3, $4, 'active', true, CURRENT_DATE)
        `, [tId, teachId, ayId, deptId]);

        await client.query(`SET LOCAL "request.jwt.claim.sub" = '${uId}'`);
        await client.query(`SET LOCAL "request.jwt.claims" = '{"sub":"${uId}"}'`);

        const res = await client.query(`SELECT public.is_hod($1) AS ok`, [deptId]);
        assert.equal(res.rows[0].ok, false, 'is_hod must fail closed if profile is deactivated');
      } finally {
        await client.query('ROLLBACK');
      }
    } finally {
      await client.end();
    }
  });

});

// ---------------------------------------------------------------------------
// GROUP 5: Authorization Helper Functions & Org Subtenant Resolver
// ---------------------------------------------------------------------------
describe('Group 5 — Authorization Helper Functions & Org Subtenant Resolver', () => {

  test('is_form_master returns true for active Form Master in current year', async () => {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      try {
        const tId = (await client.query(`INSERT INTO public.tenants (name, slug, type) VALUES ('T_FM', 't-fm-' || gen_random_uuid(), 'school') RETURNING id`)).rows[0].id;
        const ayId = (await client.query(`INSERT INTO public.academic_years (tenant_id, name, start_date, end_date, is_current) VALUES ($1, '2026/2027', '2026-09-01', '2027-06-30', true) RETURNING id`, [tId])).rows[0].id;
        const uId = (await client.query(`INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'u-fm-' || gen_random_uuid() || '@test.com') RETURNING id`)).rows[0].id;
        await client.query(`INSERT INTO public.profiles (id, tenant_id, role, full_name, is_active) VALUES ($1, $2, 'teacher', 'Teach FM', true)`, [uId, tId]);
        const teachId = (await client.query(`INSERT INTO public.teachers (tenant_id, profile_id, first_name, last_name, employee_id) VALUES ($1, $2, 'T', 'FM', 'EMP-' || gen_random_uuid()) RETURNING id`, [tId, uId])).rows[0].id;
        const classId = (await client.query(`INSERT INTO public.classes (tenant_id, name) VALUES ($1, 'Class FM') RETURNING id`, [tId])).rows[0].id;
        const secId = (await client.query(`INSERT INTO public.sections (tenant_id, class_id, name) VALUES ($1, $2, 'Sec FM') RETURNING id`, [tId, classId])).rows[0].id;

        await client.query(`
          INSERT INTO public.school_staff_assignments (tenant_id, teacher_id, assignment_type, academic_year_id, section_id, status, is_active, effective_from)
          VALUES ($1, $2, 'form_master', $3, $4, 'active', true, CURRENT_DATE)
        `, [tId, teachId, ayId, secId]);

        await client.query(`SET LOCAL "request.jwt.claim.sub" = '${uId}'`);
        await client.query(`SET LOCAL "request.jwt.claims" = '{"sub":"${uId}"}'`);

        const res = await client.query(`SELECT public.is_form_master($1) AS ok`, [secId]);
        assert.equal(res.rows[0].ok, true, 'is_form_master must return true for active form master');
      } finally {
        await client.query('ROLLBACK');
      }
    } finally {
      await client.end();
    }
  });

  test('is_vice_principal returns true for active VP in current year', async () => {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      try {
        const tId = (await client.query(`INSERT INTO public.tenants (name, slug, type) VALUES ('T_VP', 't-vp-' || gen_random_uuid(), 'school') RETURNING id`)).rows[0].id;
        const ayId = (await client.query(`INSERT INTO public.academic_years (tenant_id, name, start_date, end_date, is_current) VALUES ($1, '2026/2027', '2026-09-01', '2027-06-30', true) RETURNING id`, [tId])).rows[0].id;
        const uId = (await client.query(`INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'u-vp-' || gen_random_uuid() || '@test.com') RETURNING id`)).rows[0].id;
        await client.query(`INSERT INTO public.profiles (id, tenant_id, role, full_name, is_active) VALUES ($1, $2, 'teacher', 'Teach VP', true)`, [uId, tId]);
        const teachId = (await client.query(`INSERT INTO public.teachers (tenant_id, profile_id, first_name, last_name, employee_id) VALUES ($1, $2, 'T', 'VP', 'EMP-' || gen_random_uuid()) RETURNING id`, [tId, uId])).rows[0].id;

        await client.query(`
          INSERT INTO public.school_staff_assignments (tenant_id, teacher_id, assignment_type, academic_year_id, status, is_active, effective_from)
          VALUES ($1, $2, 'vice_principal', $3, 'active', true, CURRENT_DATE)
        `, [tId, teachId, ayId]);

        await client.query(`SET LOCAL "request.jwt.claim.sub" = '${uId}'`);
        await client.query(`SET LOCAL "request.jwt.claims" = '{"sub":"${uId}"}'`);

        const res = await client.query(`SELECT public.is_vice_principal($1) AS ok`, [tId]);
        assert.equal(res.rows[0].ok, true, 'is_vice_principal must return true for active VP');
      } finally {
        await client.query('ROLLBACK');
      }
    } finally {
      await client.end();
    }
  });

  test('is_exam_officer returns true for active Exam Officer in current year', async () => {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      try {
        const tId = (await client.query(`INSERT INTO public.tenants (name, slug, type) VALUES ('T_EO', 't-eo-' || gen_random_uuid(), 'school') RETURNING id`)).rows[0].id;
        const ayId = (await client.query(`INSERT INTO public.academic_years (tenant_id, name, start_date, end_date, is_current) VALUES ($1, '2026/2027', '2026-09-01', '2027-06-30', true) RETURNING id`, [tId])).rows[0].id;
        const uId = (await client.query(`INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'u-eo-' || gen_random_uuid() || '@test.com') RETURNING id`)).rows[0].id;
        await client.query(`INSERT INTO public.profiles (id, tenant_id, role, full_name, is_active) VALUES ($1, $2, 'teacher', 'Teach EO', true)`, [uId, tId]);
        const teachId = (await client.query(`INSERT INTO public.teachers (tenant_id, profile_id, first_name, last_name, employee_id) VALUES ($1, $2, 'T', 'EO', 'EMP-' || gen_random_uuid()) RETURNING id`, [tId, uId])).rows[0].id;

        await client.query(`
          INSERT INTO public.school_staff_assignments (tenant_id, teacher_id, assignment_type, academic_year_id, status, is_active, effective_from)
          VALUES ($1, $2, 'exam_officer', $3, 'active', true, CURRENT_DATE)
        `, [tId, teachId, ayId]);

        await client.query(`SET LOCAL "request.jwt.claim.sub" = '${uId}'`);
        await client.query(`SET LOCAL "request.jwt.claims" = '{"sub":"${uId}"}'`);

        const res = await client.query(`SELECT public.is_exam_officer($1) AS ok`, [tId]);
        assert.equal(res.rows[0].ok, true, 'is_exam_officer must return true for active exam officer');
      } finally {
        await client.query('ROLLBACK');
      }
    } finally {
      await client.end();
    }
  });

  test('get_org_subtenant_ids context validation: authorized vs unauthorized vs anonymous', async () => {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      try {
        const orgA = (await client.query(`INSERT INTO public.tenants (name, slug, type) VALUES ('Org A', 'org-a-' || gen_random_uuid(), 'organization') RETURNING id`)).rows[0].id;
        await client.query(`INSERT INTO public.tenants (name, slug, type, parent_id) VALUES ('School 1', 'sch-1-' || gen_random_uuid(), 'school', $1)`, [orgA]);
        await client.query(`INSERT INTO public.tenants (name, slug, type, parent_id) VALUES ('School 2', 'sch-2-' || gen_random_uuid(), 'school', $1)`, [orgA]);

        const orgB = (await client.query(`INSERT INTO public.tenants (name, slug, type) VALUES ('Org B', 'org-b-' || gen_random_uuid(), 'organization') RETURNING id`)).rows[0].id;

        // User in Org A
        const uOrgA = (await client.query(`INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'org-a-' || gen_random_uuid() || '@test.com') RETURNING id`)).rows[0].id;
        await client.query(`INSERT INTO public.profiles (id, tenant_id, role, full_name, is_active) VALUES ($1, $2, 'org_admin', 'Admin Org A', true)`, [uOrgA, orgA]);

        // User in Org B
        const uOrgB = (await client.query(`INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'org-b-' || gen_random_uuid() || '@test.com') RETURNING id`)).rows[0].id;
        await client.query(`INSERT INTO public.profiles (id, tenant_id, role, full_name, is_active) VALUES ($1, $2, 'org_admin', 'Admin Org B', true)`, [uOrgB, orgB]);

        // Case 1: Authorized org caller gets child schools
        await client.query(`SET LOCAL "request.jwt.claim.sub" = '${uOrgA}'`);
        await client.query(`SET LOCAL "request.jwt.claims" = '{"sub":"${uOrgA}"}'`);
        const resAuth = await client.query(`SELECT * FROM public.get_org_subtenant_ids($1)`, [orgA]);
        assert.equal(resAuth.rows.length, 2, 'Authorized user must receive child schools');

        // Case 2: Unauthorized caller (from Org B) gets empty set
        await client.query(`SET LOCAL "request.jwt.claim.sub" = '${uOrgB}'`);
        await client.query(`SET LOCAL "request.jwt.claims" = '{"sub":"${uOrgB}"}'`);
        const resUnauth = await client.query(`SELECT * FROM public.get_org_subtenant_ids($1)`, [orgA]);
        assert.equal(resUnauth.rows.length, 0, 'Unauthorized user must receive 0 rows');

        // Case 3: Anonymous caller gets empty set
        await client.query(`SET LOCAL "request.jwt.claim.sub" = ''`);
        await client.query(`SET LOCAL "request.jwt.claims" = '{}'`);
        const resAnon = await client.query(`SELECT * FROM public.get_org_subtenant_ids($1)`, [orgA]);
        assert.equal(resAnon.rows.length, 0, 'Anonymous caller must receive 0 rows');
      } finally {
        await client.query('ROLLBACK');
      }
    } finally {
      await client.end();
    }
  });

  test('all 6 authorization helper functions are SECURITY DEFINER', async () => {
    const client = await getClient();
    try {
      const res = await client.query(`
        SELECT proname, prosecdef FROM pg_proc
        WHERE proname IN (
          'is_staff_assignment_active',
          'is_hod',
          'is_form_master',
          'is_exam_officer',
          'is_vice_principal',
          'get_org_subtenant_ids'
        ) AND pronamespace = 'public'::regnamespace
      `);
      const distinctNames = new Set(res.rows.map((r: any) => r.proname));
      assert.equal(distinctNames.size, 6, 'Must find all 6 function names');
      for (const row of res.rows) {
        assert.equal(row.prosecdef, true, `Function ${row.proname} must be SECURITY DEFINER`);
      }
    } finally {
      await client.end();
    }
  });

});

// ---------------------------------------------------------------------------
// GROUP 6: Legacy Synchronization Boundaries
// ---------------------------------------------------------------------------
describe('Group 6 — Legacy Synchronization Boundaries', () => {

  test('Historical academic year isolation: 2025/2026 assignment is not revoked by 2026/2027 legacy update', async () => {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      try {
        const tA = (await client.query(`INSERT INTO public.tenants (name, slug, type) VALUES ('T_HistSync', 't-hist-sync-' || gen_random_uuid(), 'school') RETURNING id`)).rows[0].id;
        const ay25 = (await client.query(`INSERT INTO public.academic_years (tenant_id, name, start_date, end_date, is_current) VALUES ($1, '2025/2026', '2025-09-01', '2026-06-30', false) RETURNING id`, [tA])).rows[0].id;
        const ay26 = (await client.query(`INSERT INTO public.academic_years (tenant_id, name, start_date, end_date, is_current) VALUES ($1, '2026/2027', '2026-09-01', '2027-06-30', true) RETURNING id`, [tA])).rows[0].id;

        const u1 = (await client.query(`INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'u1-' || gen_random_uuid() || '@test.com') RETURNING id`)).rows[0].id;
        await client.query(`INSERT INTO public.profiles (id, tenant_id, role, full_name, is_active) VALUES ($1, $2, 'teacher', 'Teach 1', true)`, [u1, tA]);
        const teach1 = (await client.query(`INSERT INTO public.teachers (tenant_id, profile_id, first_name, last_name, employee_id) VALUES ($1, $2, 'T', '1', 'EMP-' || gen_random_uuid()) RETURNING id`, [tA, u1])).rows[0].id;

        const u2 = (await client.query(`INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'u2-' || gen_random_uuid() || '@test.com') RETURNING id`)).rows[0].id;
        await client.query(`INSERT INTO public.profiles (id, tenant_id, role, full_name, is_active) VALUES ($1, $2, 'teacher', 'Teach 2', true)`, [u2, tA]);
        const teach2 = (await client.query(`INSERT INTO public.teachers (tenant_id, profile_id, first_name, last_name, employee_id) VALUES ($1, $2, 'T', '2', 'EMP-' || gen_random_uuid()) RETURNING id`, [tA, u2])).rows[0].id;

        const dept1 = (await client.query(`INSERT INTO public.departments (tenant_id, name) VALUES ($1, 'Dept Hist') RETURNING id`, [tA])).rows[0].id;

        // Historical assignment in 2025/2026
        const pastSsaId = (await client.query(`
          INSERT INTO public.school_staff_assignments (tenant_id, teacher_id, assignment_type, academic_year_id, department_id, status, is_active, effective_from)
          VALUES ($1, $2, 'hod', $3, $4, 'active', true, '2025-09-01')
          RETURNING id
        `, [tA, teach1, ay25, dept1])).rows[0].id;

        // Reset dept head to NULL and clear current-year assignment
        await client.query(`UPDATE public.departments SET head_teacher_id = NULL WHERE id = $1`, [dept1]);
        await client.query(`DELETE FROM public.school_staff_assignments WHERE department_id = $1 AND academic_year_id = $2`, [dept1, ay26]);

        // Legacy update in current year 2026/2027: assign teach2 as HOD
        await client.query(`UPDATE public.departments SET head_teacher_id = $1 WHERE id = $2`, [teach2, dept1]);

        // Verify past assignment for teach1 is still active
        const pastCheck = (await client.query(`SELECT status, is_active FROM public.school_staff_assignments WHERE id = $1`, [pastSsaId])).rows[0];
        assert.equal(pastCheck.status, 'active', '2025/2026 assignment status must remain active');
        assert.equal(pastCheck.is_active, true, '2025/2026 assignment must remain is_active = true');

        // Verify new 2026/2027 assignment for teach2 was created
        const currentCheck = (await client.query(`
          SELECT teacher_id, status FROM public.school_staff_assignments
          WHERE department_id = $1 AND academic_year_id = $2 AND assignment_type = 'hod'
        `, [dept1, ay26])).rows[0];
        assert.equal(currentCheck.teacher_id, teach2, 'Current year assignment must be for teach2');
        assert.equal(currentCheck.status, 'active', 'Current year assignment must be active');
      } finally {
        await client.query('ROLLBACK');
      }
    } finally {
      await client.end();
    }
  });

  test('Resource and tenant isolation in legacy synchronization', async () => {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      try {
        const tA = (await client.query(`INSERT INTO public.tenants (name, slug, type) VALUES ('T_ResA', 't-res-a-' || gen_random_uuid(), 'school') RETURNING id`)).rows[0].id;
        const tB = (await client.query(`INSERT INTO public.tenants (name, slug, type) VALUES ('T_ResB', 't-res-b-' || gen_random_uuid(), 'school') RETURNING id`)).rows[0].id;
        const ayA = (await client.query(`INSERT INTO public.academic_years (tenant_id, name, start_date, end_date, is_current) VALUES ($1, '2026/2027', '2026-09-01', '2027-06-30', true) RETURNING id`, [tA])).rows[0].id;
        const ayB = (await client.query(`INSERT INTO public.academic_years (tenant_id, name, start_date, end_date, is_current) VALUES ($1, '2026/2027', '2026-09-01', '2027-06-30', true) RETURNING id`, [tB])).rows[0].id;

        const uA = (await client.query(`INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'ua-' || gen_random_uuid() || '@test.com') RETURNING id`)).rows[0].id;
        await client.query(`INSERT INTO public.profiles (id, tenant_id, role, full_name, is_active) VALUES ($1, $2, 'teacher', 'Teach A', true)`, [uA, tA]);
        const teachA = (await client.query(`INSERT INTO public.teachers (tenant_id, profile_id, first_name, last_name, employee_id) VALUES ($1, $2, 'T', 'A', 'EMP-' || gen_random_uuid()) RETURNING id`, [tA, uA])).rows[0].id;

        const dept1 = (await client.query(`INSERT INTO public.departments (tenant_id, name) VALUES ($1, 'Dept 1') RETURNING id`, [tA])).rows[0].id;
        const dept2 = (await client.query(`INSERT INTO public.departments (tenant_id, name) VALUES ($1, 'Dept 2') RETURNING id`, [tA])).rows[0].id;
        const deptB = (await client.query(`INSERT INTO public.departments (tenant_id, name) VALUES ($1, 'Dept B') RETURNING id`, [tB])).rows[0].id;

        // Assign teachA to dept1
        await client.query(`UPDATE public.departments SET head_teacher_id = $1 WHERE id = $2`, [teachA, dept1]);

        // Verify dept2 received 0 assignments
        const countDept2 = (await client.query(`SELECT count(*)::int FROM public.school_staff_assignments WHERE department_id = $1`, [dept2])).rows[0].count;
        assert.equal(countDept2, 0, 'Department 2 must receive zero assignments');

        // Verify Tenant B received 0 assignments
        const countTenantB = (await client.query(`SELECT count(*)::int FROM public.school_staff_assignments WHERE tenant_id = $1`, [tB])).rows[0].count;
        assert.equal(countTenantB, 0, 'Tenant B must receive zero assignments');
      } finally {
        await client.query('ROLLBACK');
      }
    } finally {
      await client.end();
    }
  });

  test('State transitions: NULL -> A, A -> B, A -> NULL, and canonical revoke', async () => {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      try {
        const tA = (await client.query(`INSERT INTO public.tenants (name, slug, type) VALUES ('T_Transitions', 't-trans-' || gen_random_uuid(), 'school') RETURNING id`)).rows[0].id;
        const ay = (await client.query(`INSERT INTO public.academic_years (tenant_id, name, start_date, end_date, is_current) VALUES ($1, '2026/2027', '2026-09-01', '2027-06-30', true) RETURNING id`, [tA])).rows[0].id;

        const u1 = (await client.query(`INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'u1-' || gen_random_uuid() || '@test.com') RETURNING id`)).rows[0].id;
        await client.query(`INSERT INTO public.profiles (id, tenant_id, role, full_name, is_active) VALUES ($1, $2, 'teacher', 'Teach 1', true)`, [u1, tA]);
        const teach1 = (await client.query(`INSERT INTO public.teachers (tenant_id, profile_id, first_name, last_name, employee_id) VALUES ($1, $2, 'T', '1', 'EMP-' || gen_random_uuid()) RETURNING id`, [tA, u1])).rows[0].id;

        const u2 = (await client.query(`INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'u2-' || gen_random_uuid() || '@test.com') RETURNING id`)).rows[0].id;
        await client.query(`INSERT INTO public.profiles (id, tenant_id, role, full_name, is_active) VALUES ($1, $2, 'teacher', 'Teach 2', true)`, [u2, tA]);
        const teach2 = (await client.query(`INSERT INTO public.teachers (tenant_id, profile_id, first_name, last_name, employee_id) VALUES ($1, $2, 'T', '2', 'EMP-' || gen_random_uuid()) RETURNING id`, [tA, u2])).rows[0].id;

        const dept = (await client.query(`INSERT INTO public.departments (tenant_id, name) VALUES ($1, 'Transitions Dept') RETURNING id`, [tA])).rows[0].id;

        // 1. NULL -> A
        await client.query(`UPDATE public.departments SET head_teacher_id = $1 WHERE id = $2`, [teach1, dept]);
        const ssa1 = (await client.query(`
          SELECT id, status, is_active FROM public.school_staff_assignments
          WHERE department_id = $1 AND teacher_id = $2 AND status = 'active'
        `, [dept, teach1])).rows[0];
        assert.ok(ssa1, 'NULL -> A must create active assignment');

        // 2. A -> B
        await client.query(`UPDATE public.departments SET head_teacher_id = $1 WHERE id = $2`, [teach2, dept]);
        const ssa1_after = (await client.query(`SELECT status, is_active, revoked_at FROM public.school_staff_assignments WHERE id = $1`, [ssa1.id])).rows[0];
        assert.equal(ssa1_after.status, 'revoked', 'A -> B must revoke assignment A');
        assert.equal(ssa1_after.is_active, false);
        assert.ok(ssa1_after.revoked_at);

        const ssa2 = (await client.query(`
          SELECT id, status, is_active FROM public.school_staff_assignments
          WHERE department_id = $1 AND teacher_id = $2 AND status = 'active'
        `, [dept, teach2])).rows[0];
        assert.ok(ssa2, 'A -> B must create active assignment B');

        // 3. A -> NULL
        await client.query(`UPDATE public.departments SET head_teacher_id = NULL WHERE id = $1`, [dept]);
        const ssa2_after = (await client.query(`SELECT status, is_active FROM public.school_staff_assignments WHERE id = $1`, [ssa2.id])).rows[0];
        assert.equal(ssa2_after.status, 'revoked', 'A -> NULL must revoke assignment B');
        assert.equal(ssa2_after.is_active, false);

        // 4. Canonical Revoke (forward sync: SSA -> departments)
        const ssaDirect = (await client.query(`
          INSERT INTO public.school_staff_assignments (tenant_id, teacher_id, assignment_type, academic_year_id, department_id, status, is_active, effective_from)
          VALUES ($1, $2, 'hod', $3, $4, 'active', true, CURRENT_DATE)
          RETURNING id
        `, [tA, teach1, ay, dept])).rows[0].id;
        const deptHead = (await client.query(`SELECT head_teacher_id FROM public.departments WHERE id = $1`, [dept])).rows[0].head_teacher_id;
        assert.equal(deptHead, teach1, 'SSA insert must forward-sync to departments.head_teacher_id');

        await client.query(`UPDATE public.school_staff_assignments SET status = 'revoked', is_active = false, revoked_at = now() WHERE id = $1`, [ssaDirect]);
        const deptHeadRevoked = (await client.query(`SELECT head_teacher_id FROM public.departments WHERE id = $1`, [dept])).rows[0].head_teacher_id;
        assert.equal(deptHeadRevoked, null, 'Revoking SSA must forward-sync clear departments.head_teacher_id');
      } finally {
        await client.query('ROLLBACK');
      }
    } finally {
      await client.end();
    }
  });

  test('Trigger functions contain pg_trigger_depth() recursion guards and NO LIMIT 1', async () => {
    const client = await getClient();
    try {
      const res = await client.query(`
        SELECT proname, pg_get_functiondef(oid) AS def
        FROM pg_proc
        WHERE proname IN (
          'sync_hod_to_departments',
          'sync_department_hod_to_assignments',
          'sync_form_master_to_sections',
          'sync_section_class_teacher_to_assignments'
        ) AND pronamespace = 'public'::regnamespace
      `);
      assert.equal(res.rows.length, 4, 'All 4 sync trigger functions must exist');
      for (const row of res.rows) {
        assert.ok(row.def.includes('pg_trigger_depth()'), `Function ${row.proname} must contain pg_trigger_depth() check`);
        assert.ok(!row.def.includes('LIMIT 1'), `Function ${row.proname} must NOT contain arbitrary LIMIT 1`);
      }
    } finally {
      await client.end();
    }
  });

});