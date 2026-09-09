import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const { Client } = pg;

// Read DATABASE_URL from .env.local
const envContent = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
let dbUrl = '';
for (const line of envContent.split(/\r?\n/)) {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.substring('DATABASE_URL='.length).trim().replace(/^['"]|['"]$/g, '');
  }
}

export function resolveTestSslConfig(env: Partial<NodeJS.ProcessEnv> | Record<string, string | undefined> = process.env): pg.ConnectionConfig['ssl'] {
  let customCa = env.DATABASE_SSL_CA;
  if (customCa && fs.existsSync(customCa)) {
    customCa = fs.readFileSync(customCa, 'utf8');
  }

  const strictTls =
    env.DATABASE_SSL_STRICT === undefined ||
    env.DATABASE_SSL_STRICT === 'true';

  return customCa
    ? {
        rejectUnauthorized: true,
        ca: customCa,
      }
    : {
        rejectUnauthorized: strictTls,
      };
}

test('TASK-0007 Phase 3C Cohort 4: Admissions Enrollment RPC Database Security & Boundaries', async (t) => {
  const defaultCaPath = path.join(process.cwd(), 'supabase', 'certs', 'prod-ca-2021.crt');
  if (!process.env.DATABASE_SSL_CA && fs.existsSync(defaultCaPath)) {
    process.env.DATABASE_SSL_CA = defaultCaPath;
  }

  const sslConfig = resolveTestSslConfig(process.env);
  const client = new Client({
    connectionString: dbUrl,
    ssl: sslConfig,
  });

  await client.connect();

  const prefix = `sec_enr_${Date.now()}_`;
  const orgTenantId = '11111111-4444-4000-8000-000000000001';
  const schoolTenantAId = '11111111-4444-4000-8000-000000000002';
  const schoolTenantBId = '11111111-4444-4000-8000-000000000003';

  const superAdminId = '22222222-4444-4000-8000-000000000001';
  const orgAdminId = '22222222-4444-4000-8000-000000000002';
  const schoolAdminAId = '22222222-4444-4000-8000-000000000003';
  const schoolAdminBId = '22222222-4444-4000-8000-000000000004';
  const teacherAId = '22222222-4444-4000-8000-000000000005';
  const inactiveAdminAId = '22222222-4444-4000-8000-000000000006';

  const appAOfferId = '33333333-4444-4000-8000-000000000001';
  const appAUnverifiedId = '33333333-4444-4000-8000-000000000002';
  const appAStageAppId = '33333333-4444-4000-8000-000000000003';
  const appARejectedId = '33333333-4444-4000-8000-000000000004';
  const appBOfferId = '33333333-4444-4000-8000-000000000005';

  // Helper functions
  async function callRpc(appId: string, actorId: string | null) {
    const res = await client.query(
      `SELECT public.enroll_applicant($1, $2) as student_id;`,
      [appId, actorId]
    );
    return res.rows[0].student_id as string;
  }

  async function expectError(action: () => Promise<any>, expectedSnippet: string) {
    await client.query('SAVEPOINT sp_test');
    try {
      await action();
      await client.query('RELEASE SAVEPOINT sp_test');
      assert.fail(`Expected error containing "${expectedSnippet}" but operation succeeded.`);
    } catch (err: any) {
      await client.query('ROLLBACK TO SAVEPOINT sp_test');
      assert.ok(
        err.message.includes(expectedSnippet),
        `Expected error containing "${expectedSnippet}", got: "${err.message}"`
      );
    }
  }

  // Setup global test transaction
  await client.query('BEGIN');

  try {
    // 1. Insert test tenants (hierarchy: Org -> School A, School B independent)
    await client.query(`
      INSERT INTO public.tenants (id, name, slug, type)
      VALUES 
        ($1::uuid, 'Test Org Tenant', '${prefix}org', 'organization'),
        ($2::uuid, 'Test School Tenant B', '${prefix}sch_b', 'school')
      ON CONFLICT (id) DO NOTHING;
    `, [orgTenantId, schoolTenantBId]);

    await client.query(`
      INSERT INTO public.tenants (id, name, slug, type, parent_id)
      VALUES ($1::uuid, 'Test School Tenant A (subtenant)', '${prefix}sch_a', 'school', $2::uuid)
      ON CONFLICT (id) DO NOTHING;
    `, [schoolTenantAId, orgTenantId]);

    // 2. Insert test auth users & profiles
    const users = [
      { id: superAdminId, tenant: orgTenantId, role: 'super_admin', active: true, email: `${prefix}super@test.com` },
      { id: orgAdminId, tenant: orgTenantId, role: 'org_admin', active: true, email: `${prefix}orgadmin@test.com` },
      { id: schoolAdminAId, tenant: schoolTenantAId, role: 'school_admin', active: true, email: `${prefix}admina@test.com` },
      { id: schoolAdminBId, tenant: schoolTenantBId, role: 'school_admin', active: true, email: `${prefix}adminb@test.com` },
      { id: teacherAId, tenant: schoolTenantAId, role: 'teacher', active: true, email: `${prefix}teachera@test.com` },
      { id: inactiveAdminAId, tenant: schoolTenantAId, role: 'school_admin', active: false, email: `${prefix}inactive@test.com` },
    ];

    for (const u of users) {
      await client.query(`
        INSERT INTO auth.users (id, email, role, aud)
        VALUES ($1, $2, 'authenticated', 'authenticated')
        ON CONFLICT (id) DO NOTHING;
      `, [u.id, u.email]);

      await client.query(`
        INSERT INTO public.profiles (id, tenant_id, full_name, email, role, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE 
          SET tenant_id = EXCLUDED.tenant_id, role = EXCLUDED.role, is_active = EXCLUDED.is_active;
      `, [u.id, u.tenant, `Name ${u.role}`, u.email, u.role, u.active]);
    }

    // 3. Insert test applicants
    const applicants = [
      { id: appAOfferId, tenant: schoolTenantAId, stage: 'Offer', status: 'active', verified: true, first: 'John', last: 'Doe' },
      { id: appAUnverifiedId, tenant: schoolTenantAId, stage: 'Offer', status: 'active', verified: false, first: 'Unverified', last: 'User' },
      { id: appAStageAppId, tenant: schoolTenantAId, stage: 'Application', status: 'active', verified: true, first: 'Early', last: 'Stage' },
      { id: appARejectedId, tenant: schoolTenantAId, stage: 'Offer', status: 'rejected', verified: true, first: 'Rejected', last: 'Candidate' },
      { id: appBOfferId, tenant: schoolTenantBId, stage: 'Offer', status: 'active', verified: true, first: 'TenantB', last: 'Student' },
    ];

    for (const a of applicants) {
      await client.query(`
        INSERT INTO public.applicants (
          id, tenant_id, first_name, last_name, email, phone, stage, status, docs_verified,
          parent_name, parent_phone, parent_email, parent_relation, dob, gender, address, city, target_grade
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        ON CONFLICT (id) DO UPDATE SET 
          stage = EXCLUDED.stage, status = EXCLUDED.status, docs_verified = EXCLUDED.docs_verified;
      `, [
        a.id, a.tenant, a.first, a.last, `${a.first.toLowerCase()}@test.com`, '+23276000001',
        a.stage, a.status, a.verified, 'Jane Parent', '+23276000002', 'parent@test.com', 'Mother',
        '2010-01-01', 'male', '123 Main Street', 'Freetown', 'Grade 1'
      ]);
    }

    // -------------------------------------------------------------------------
    // Test 1: Direct anon execution revoked (42501)
    // -------------------------------------------------------------------------
    await t.test('SEC-RPC-01: Direct anon PostgreSQL execution denied (42501)', async () => {
      await client.query('SAVEPOINT sp_anon');
      try {
        await client.query(`SET LOCAL role = 'anon';`);
        await client.query(`SELECT public.enroll_applicant($1, $2);`, [appAOfferId, schoolAdminAId]);
        assert.fail('Anon execution should have failed with 42501');
      } catch (err: any) {
        await client.query('ROLLBACK TO SAVEPOINT sp_anon');
        assert.equal(err.code, '42501', `Expected SQLSTATE 42501, got ${err.code}`);
        assert.ok(err.message.includes('permission denied'), 'Message should indicate permission denied');
      }
    });

    // -------------------------------------------------------------------------
    // Test 2: Direct authenticated execution revoked (42501)
    // -------------------------------------------------------------------------
    await t.test('SEC-RPC-02: Direct authenticated PostgreSQL execution denied (42501)', async () => {
      await client.query('SAVEPOINT sp_auth');
      try {
        await client.query(`SET LOCAL role = 'authenticated';`);
        await client.query(`SELECT public.enroll_applicant($1, $2);`, [appAOfferId, schoolAdminAId]);
        assert.fail('Authenticated execution should have failed with 42501');
      } catch (err: any) {
        await client.query('ROLLBACK TO SAVEPOINT sp_auth');
        assert.equal(err.code, '42501', `Expected SQLSTATE 42501, got ${err.code}`);
        assert.ok(err.message.includes('permission denied'), 'Message should indicate permission denied');
      }
    });

    // -------------------------------------------------------------------------
    // Test 3: Null actor parameter rejected
    // -------------------------------------------------------------------------
    await t.test('SEC-RPC-03: Invocation without enacting actor rejected (Audit Failure)', async () => {
      await expectError(() => callRpc(appAOfferId, null), 'Enacting administrator ID');
    });

    // -------------------------------------------------------------------------
    // Test 4: Inactive actor rejected
    // -------------------------------------------------------------------------
    await t.test('SEC-RPC-04: Inactive profile rejected (Audit Failure)', async () => {
      await expectError(() => callRpc(appAOfferId, inactiveAdminAId), 'not a valid active profile');
    });

    // -------------------------------------------------------------------------
    // Test 5: Non-existent actor rejected
    // -------------------------------------------------------------------------
    await t.test('SEC-RPC-05: Non-existent actor ID rejected (Audit Failure)', async () => {
      await expectError(
        () => callRpc(appAOfferId, '00000000-0000-0000-0000-000000000099'),
        'not a valid active profile'
      );
    });

    // -------------------------------------------------------------------------
    // Test 6: Unauthorized role (teacher/student) rejected
    // -------------------------------------------------------------------------
    await t.test('SEC-RPC-06: Non-administrative role (teacher) rejected', async () => {
      await expectError(
        () => callRpc(appAOfferId, teacherAId),
        'is not authorized to enroll applicants'
      );
    });

    // -------------------------------------------------------------------------
    // Test 7: Cross-tenant violation: School Admin A on Tenant B
    // -------------------------------------------------------------------------
    await t.test('SEC-RPC-07: Cross-tenant invocation by school_admin rejected', async () => {
      await expectError(
        () => callRpc(appBOfferId, schoolAdminAId),
        'Cross-Tenant Violation: School admin'
      );
    });

    // -------------------------------------------------------------------------
    // Test 8: Cross-tenant violation: Org Admin on unrelated Tenant B
    // -------------------------------------------------------------------------
    await t.test('SEC-RPC-08: Cross-tenant invocation by org_admin rejected for unrelated tenant', async () => {
      await expectError(
        () => callRpc(appBOfferId, orgAdminId),
        'Cross-Tenant Violation: Organization admin'
      );
    });

    // -------------------------------------------------------------------------
    // Test 9: Lifecycle invariant: Stage != 'Offer' rejected
    // -------------------------------------------------------------------------
    await t.test('SEC-RPC-09: Premature stage (Application) enrollment rejected (Lifecycle Violation)', async () => {
      await expectError(
        () => callRpc(appAStageAppId, schoolAdminAId),
        'Lifecycle Violation'
      );
    });

    // -------------------------------------------------------------------------
    // Test 10: Lifecycle invariant: docs_verified != true rejected
    // -------------------------------------------------------------------------
    await t.test('SEC-RPC-10: Unverified documents enrollment rejected (Lifecycle Violation)', async () => {
      await expectError(
        () => callRpc(appAUnverifiedId, schoolAdminAId),
        'Lifecycle Violation'
      );
    });

    // -------------------------------------------------------------------------
    // Test 11: Lifecycle invariant: Rejected applicant cannot be enrolled
    // -------------------------------------------------------------------------
    await t.test('SEC-RPC-11: Rejected applicant enrollment rejected (Lifecycle Violation)', async () => {
      await expectError(
        () => callRpc(appARejectedId, schoolAdminAId),
        'Lifecycle Violation'
      );
    });

    // -------------------------------------------------------------------------
    // Test 12: Subordinate reach: Org Admin enrolling subordinate School A applicant
    // -------------------------------------------------------------------------
    let createdStudentId: string;
    await t.test('SEC-RPC-12: Org admin successfully enrolls subordinate school applicant', async () => {
      createdStudentId = await callRpc(appAOfferId, orgAdminId);
      assert.ok(createdStudentId, 'Must return generated student ID');

      // Verify student row in public.students
      const studentRes = await client.query(
        `SELECT * FROM public.students WHERE id = $1`,
        [createdStudentId]
      );
      assert.equal(studentRes.rows.length, 1);
      const student = studentRes.rows[0];
      assert.equal(student.applicant_id, appAOfferId);
      assert.equal(student.tenant_id, schoolTenantAId);
      assert.equal(student.first_name, 'John');
      assert.equal(student.last_name, 'Doe');
      assert.ok(student.admission_number.startsWith('STU-'), 'Must have STU- admission number');

      // Verify parent record created / linked
      const parentRes = await client.query(
        `SELECT * FROM public.parents WHERE tenant_id = $1 AND phone = $2`,
        [schoolTenantAId, '+23276000002']
      );
      assert.equal(parentRes.rows.length, 1);

      // Verify applicant stage advanced to Allocation
      const applicantRes = await client.query(
        `SELECT stage, status FROM public.applicants WHERE id = $1`,
        [appAOfferId]
      );
      assert.equal(applicantRes.rows[0].stage, 'Allocation');
      assert.equal(applicantRes.rows[0].status, 'enrolled');

      // Verify audit history record with enacting actor attribution
      const auditRes = await client.query(
        `SELECT * FROM public.admission_history WHERE applicant_id = $1 AND to_stage = 'Allocation'`,
        [appAOfferId]
      );
      assert.equal(auditRes.rows.length, 1);
      assert.equal(auditRes.rows[0].created_by, orgAdminId);
      assert.equal(auditRes.rows[0].from_stage, 'Offer');
    });

    // -------------------------------------------------------------------------
    // Test 13: Idempotency: Second call on enrolled applicant returns existing student ID
    // -------------------------------------------------------------------------
    await t.test('SEC-RPC-13: Idempotent invocation returns existing student ID without mutation', async () => {
      const secondStudentId = await callRpc(appAOfferId, schoolAdminAId);
      assert.equal(secondStudentId, createdStudentId, 'Must return original student ID');

      // Verify no duplicate students created
      const countRes = await client.query(
        `SELECT COUNT(*) FROM public.students WHERE applicant_id = $1`,
        [appAOfferId]
      );
      assert.equal(countRes.rows[0].count, '1');
    });

    // -------------------------------------------------------------------------
    // Test 14: Database schema uniqueness constraint on students.applicant_id (23505)
    // -------------------------------------------------------------------------
    await t.test('SEC-RPC-14: Schema uniqueness constraint prevents duplicate student applicant_id (23505)', async () => {
      await client.query('SAVEPOINT sp_uniq');
      try {
        await client.query(`
          INSERT INTO public.students (tenant_id, applicant_id, first_name, last_name)
          VALUES ($1, $2, 'Duplicate', 'Student');
        `, [schoolTenantAId, appAOfferId]);
        assert.fail('Duplicate applicant_id insert should have failed');
      } catch (err: any) {
        await client.query('ROLLBACK TO SAVEPOINT sp_uniq');
        assert.equal(err.code, '23505', `Expected SQLSTATE 23505, got ${err.code}`);
        assert.ok(err.constraint.includes('applicant_id'), 'Should violate applicant_id constraint');
      }
    });

    // -------------------------------------------------------------------------
    // Test 15: Canonical function signature strictly enforces (p_applicant_id, p_actor_id)
    // -------------------------------------------------------------------------
    await t.test('SEC-RPC-15: Function signature strictly requires p_actor_id and rejects legacy p_admin_id', async () => {
      // Named call with p_actor_id succeeds
      const bStudentId = await client.query(`
        SELECT public.enroll_applicant(p_applicant_id := $1, p_actor_id := $2) as student_id;
      `, [appBOfferId, schoolAdminBId]);
      assert.ok(bStudentId.rows[0].student_id);

      // Verify applicant B is enrolled
      const appBRes = await client.query(`SELECT stage FROM public.applicants WHERE id = $1`, [appBOfferId]);
      assert.equal(appBRes.rows[0].stage, 'Allocation');

      // Attempt to call with legacy p_admin_id parameter name fails because parameter is deprecated/removed
      await client.query('SAVEPOINT sp_named_admin');
      try {
        await client.query(`
          SELECT public.enroll_applicant(p_applicant_id := $1, p_admin_id := $2);
        `, [appBOfferId, schoolAdminBId]);
        assert.fail('Call with non-existent parameter p_admin_id should fail');
      } catch (err: any) {
        await client.query('ROLLBACK TO SAVEPOINT sp_named_admin');
        assert.ok(
          err.message.includes('function public.enroll_applicant') || err.message.includes('p_admin_id') || err.code === '42883',
          `Expected missing function or parameter error, got: "${err.message}"`
        );
      }
    });

    // -------------------------------------------------------------------------
    // Test 16: Migration Safety & Option A Fail-Closed Diagnostics
    // -------------------------------------------------------------------------
    await t.test('SEC-RPC-16: Migration 048 Option A fails closed with diagnostic counts if legacy nonconforming data exists', async () => {
      await client.query('SAVEPOINT sp_migration_safety');
      try {
        // Drop unique and FK constraints temporarily inside savepoint to simulate legacy pre-048 state
        await client.query(`ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_applicant_id_key;`);
        await client.query(`ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_applicant_id_fkey;`);

        // SQL block matching Migration 048 Section 1.2
        const failClosedCheckSql = `
          DO $$
          DECLARE
              v_orphan_count INT := 0;
              v_duplicate_group_count INT := 0;
              v_duplicate_row_count INT := 0;
          BEGIN
              SELECT COUNT(*) INTO v_orphan_count
              FROM public.students s
              WHERE s.applicant_id IS NOT NULL
                AND NOT EXISTS (
                  SELECT 1 FROM public.applicants a WHERE a.id = s.applicant_id
                );

              SELECT COUNT(*), COALESCE(SUM(cnt), 0)
              INTO v_duplicate_group_count, v_duplicate_row_count
              FROM (
                  SELECT applicant_id, COUNT(*) AS cnt
                  FROM public.students
                  WHERE applicant_id IS NOT NULL
                  GROUP BY applicant_id
                  HAVING COUNT(*) > 1
              ) dupes;

              IF v_orphan_count > 0 OR v_duplicate_group_count > 0 THEN
                  RAISE EXCEPTION 'MIGRATION 048 ABORTED (Fail-Closed Safety Gate): Pre-existing nonconforming student enrollment data detected. Diagnostic: orphan_count=%, duplicate_group_count=%, duplicate_row_count=%. Automatic silent data truncation is prohibited to preserve enrollment relational provenance. Please review and remediate legacy data with an auditable plan prior to applying foreign key and unique constraints.',
                      v_orphan_count, v_duplicate_group_count, v_duplicate_row_count;
              END IF;
          END $$;
        `;

        // 1. Verify clean data passes without throwing
        await client.query(failClosedCheckSql);

        // 2. Insert legacy orphaned applicant_id (non-existent applicant)
        const orphanAppId = '99999999-0000-0000-0000-000000000099';
        await client.query(`
          INSERT INTO public.students (tenant_id, applicant_id, first_name, last_name)
          VALUES ($1, $2, 'Orphaned', 'Student');
        `, [schoolTenantAId, orphanAppId]);

        // Verify fail-closed detection catches the orphan with diagnostic count
        await expectError(
          () => client.query(failClosedCheckSql),
          'orphan_count=1, duplicate_group_count=0, duplicate_row_count=0'
        );

        // 3. Insert duplicate students for an existing applicant
        const dupAppId = '33333333-4444-4000-8000-000000000088';
        await client.query(`
          INSERT INTO public.applicants (
            id, tenant_id, first_name, last_name, email, phone, stage, status, docs_verified,
            parent_name, parent_phone, parent_email, parent_relation, dob, gender, address, city, target_grade
          ) VALUES ($1, $2, 'DupApp', 'Test', 'dup@test.com', '+23276000099', 'Offer', 'active', true,
            'Parent Dup', '+23276000098', 'pdup@test.com', 'Father', '2011-01-01', 'female', 'Street', 'City', 'Grade 2');
        `, [dupAppId, schoolTenantAId]);

        await client.query(`
          INSERT INTO public.students (tenant_id, applicant_id, first_name, last_name)
          VALUES ($1, $2, 'First', 'Student');
        `, [schoolTenantAId, dupAppId]);

        await client.query(`
          INSERT INTO public.students (tenant_id, applicant_id, first_name, last_name)
          VALUES ($1, $2, 'Second', 'Student');
        `, [schoolTenantAId, dupAppId]);

        // Verify fail-closed detection catches both orphan and duplicates with exact diagnostics
        await expectError(
          () => client.query(failClosedCheckSql),
          'orphan_count=1, duplicate_group_count=1, duplicate_row_count=2'
        );
      } finally {
        await client.query('ROLLBACK TO SAVEPOINT sp_migration_safety');
      }
    });

    // -------------------------------------------------------------------------
    // Test 17: ON DELETE RESTRICT Provenance Preservation
    // -------------------------------------------------------------------------
    await t.test('SEC-RPC-17: ON DELETE RESTRICT prevents deleting an enrolled applicant and preserves provenance', async () => {
      await client.query('SAVEPOINT sp_fk_restrict');
      try {
        // Ensure student exists referencing appAOfferId
        const enrolledStudentId = await callRpc(appAOfferId, schoolAdminAId);
        assert.ok(enrolledStudentId, 'Student must be enrolled');

        // Attempt to delete applicant record while student reference exists
        await expectError(
          () => client.query(`DELETE FROM public.applicants WHERE id = $1;`, [appAOfferId]),
          'update or delete on table "applicants" violates foreign key constraint "students_applicant_id_fkey"'
        );

        // Verify that student and applicant link remained completely intact
        const studentRes = await client.query(
          `SELECT applicant_id FROM public.students WHERE id = $1;`,
          [enrolledStudentId]
        );
        assert.equal(studentRes.rows[0].applicant_id, appAOfferId, 'Student applicant_id must remain preserved');
      } finally {
        await client.query('ROLLBACK TO SAVEPOINT sp_fk_restrict');
      }
    });

  } finally {
    // Clean rollback ensures no test contamination
    await client.query('ROLLBACK');
    await client.end();
  }
});
