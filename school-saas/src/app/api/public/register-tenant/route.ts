import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import crypto from 'crypto';

let pgPool: Pool | null = null;
function getPgPool() {
  if (!pgPool && process.env.DATABASE_URL) {
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pgPool;
}

const RESERVED_SLUGS = new Set([
  'admin',
  'super-admin',
  'api',
  'auth',
  'login',
  'www',
  'app',
  'platform',
  'register',
  'onboarding',
  'portal',
  'dashboard',
  'system',
  'test',
  'demo',
  'status',
  'help',
  'support',
  'terms',
  'privacy',
]);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      orgName,
      orgSlug,
      orgMode = 'standalone',
      region = 'Western Area (Freetown)',
      schoolLevels = ['JSS', 'SSS'],
      schoolShifts = ['Morning Shift'],
      schools = [],
      plan = 'starter',
      modules = ['core', 'ai_lesson_planner', 'waec_cass_engine'],
      adminName,
      adminEmail,
      password,
    } = body;

    // ── 1. Validation ──────────────────────────────────────────────
    if (!orgName || !orgName.trim()) {
      return NextResponse.json({ error: 'Institution Name is required.' }, { status: 400 });
    }

    const cleanSlug = (orgSlug || '').trim().toLowerCase();
    if (!cleanSlug) {
      return NextResponse.json({ error: 'Subdomain slug is required.' }, { status: 400 });
    }

    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(cleanSlug) || cleanSlug.length < 2) {
      return NextResponse.json(
        { error: 'Subdomain must be lowercase letters, numbers, or hyphens only (min 2 characters).' },
        { status: 400 }
      );
    }

    if (RESERVED_SLUGS.has(cleanSlug)) {
      return NextResponse.json(
        { error: `"${cleanSlug}" is a reserved system domain. Please choose another.` },
        { status: 400 }
      );
    }

    if (!adminName || !adminName.trim()) {
      return NextResponse.json({ error: 'Administrator Full Name is required.' }, { status: 400 });
    }

    const cleanEmail = (adminEmail || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return NextResponse.json({ error: 'A valid work email address is required.' }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const dbPool = getPgPool();
    if (!dbPool) {
      return NextResponse.json({ error: 'Database service is currently unavailable.' }, { status: 500 });
    }

    // ── 2. Check for duplicate slug and email ────────────────────────
    const slugCheck = await dbPool.query(
      'SELECT id FROM tenants WHERE LOWER(slug) = $1 LIMIT 1',
      [cleanSlug]
    );
    if (slugCheck.rows.length > 0) {
      return NextResponse.json(
        { error: `The subdomain "${cleanSlug}" is already claimed by another school.` },
        { status: 409 }
      );
    }

    const emailCheck = await dbPool.query(
      'SELECT id FROM auth.users WHERE LOWER(email) = $1 LIMIT 1',
      [cleanEmail]
    );
    if (emailCheck.rows.length > 0) {
      return NextResponse.json(
        { error: `An account with email "${cleanEmail}" already exists. Please log in or use another email.` },
        { status: 409 }
      );
    }

    // ── 3. Resolve Subscription Plan ───────────────────────────────
    let planId: string | null = null;
    const dbPlanName = plan === 'pro' ? 'Professional' : plan === 'enterprise' ? 'Enterprise' : 'Starter';
    const planRes = await dbPool.query(
      'SELECT id FROM subscription_plans WHERE name ILIKE $1 LIMIT 1',
      [dbPlanName]
    );
    if (planRes.rows.length > 0) {
      planId = planRes.rows[0].id;
    }

    const finalStatus = plan === 'starter' ? 'trial' : 'active';
    const isStandalone = orgMode === 'standalone';

    // ── 4. Atomic Database Provisioning ────────────────────────────
    const client = await dbPool.connect();
    try {
      await client.query('BEGIN');

      // 4a. Insert Organization Node
      const orgInsertRes = await client.query(
        `INSERT INTO tenants (
          name, type, slug, is_standalone_school, status, region, parent_id, plan_id, school_levels, school_shifts
        ) VALUES ($1, 'organization', $2, $3, $4, $5, NULL, $6, $7, $8)
        RETURNING id`,
        [
          orgName.trim(),
          isStandalone ? null : cleanSlug,
          isStandalone,
          finalStatus,
          region,
          planId,
          isStandalone ? schoolLevels : [],
          isStandalone ? schoolShifts : [],
        ]
      );
      const orgId: string = orgInsertRes.rows[0].id;
      let primaryTenantId: string = orgId;

      // 4b. Insert Child School(s)
      if (isStandalone) {
        const schoolInsertRes = await client.query(
          `INSERT INTO tenants (
            name, type, slug, parent_id, status, region, school_levels, school_shifts, plan_id
          ) VALUES ($1, 'school', $2, $3, $4, $5, $6, $7, $8)
          RETURNING id`,
          [
            orgName.trim(),
            cleanSlug,
            orgId,
            finalStatus,
            region,
            schoolLevels,
            schoolShifts,
            planId,
          ]
        );
        primaryTenantId = schoolInsertRes.rows[0].id;
      } else if (Array.isArray(schools) && schools.length > 0) {
        for (const s of schools) {
          if (s.name && s.slug) {
            await client.query(
              `INSERT INTO tenants (
                name, type, slug, parent_id, status, school_type, school_levels, school_shifts, region, plan_id
              ) VALUES ($1, 'school', $2, $3, $4, $5, $6, $7, $8, $9)`,
              [
                s.name.trim(),
                s.slug.trim().toLowerCase(),
                orgId,
                finalStatus,
                s.schoolType || 'Primary',
                s.schoolLevels || [],
                s.schoolShifts || [],
                region,
                planId,
              ]
            );
          }
        }
      }

      // 4c. Create Administrator User in auth.users
      const userId = crypto.randomUUID();
      const adminRole = isStandalone ? 'school_admin' : 'org_admin';

      await client.query(
        `INSERT INTO auth.users (
          id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
          confirmation_token, recovery_token, email_change_token_new, email_change,
          email_change_token_current, reauthentication_token, phone_change, phone_change_token,
          raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        ) VALUES (
          $1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', $2,
          crypt($3, gen_salt('bf')), NOW(),
          '', '', '', '', '', '', '', '',
          '{"provider":"email","providers":["email"]}'::jsonb,
          jsonb_build_object('full_name', $4::text, 'role', $5::text, 'tenant_id', $6::text, 'requires_password_change', false),
          NOW(), NOW()
        )`,
        [userId, cleanEmail, password, adminName.trim(), adminRole, primaryTenantId]
      );

      // 4d. Create / Update Profile in profiles table
      await client.query(
        `INSERT INTO profiles (
          id, email, full_name, role, tenant_id, requires_password_change, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, false, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          role = EXCLUDED.role,
          tenant_id = EXCLUDED.tenant_id,
          requires_password_change = false,
          updated_at = NOW()`,
        [userId, cleanEmail, adminName.trim(), adminRole, primaryTenantId]
      );

      // 4e. Link any existing demo request for this email
      await client.query(
        `UPDATE demo_requests
         SET status = 'provisioned', provisioned_tenant_id = $1, updated_at = NOW()
         WHERE LOWER(email) = $2`,
        [primaryTenantId, cleanEmail]
      );

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'Your school portal has been successfully provisioned and launched!',
        tenant: {
          id: primaryTenantId,
          orgId,
          name: orgName.trim(),
          slug: cleanSlug,
          role: adminRole,
          adminEmail: cleanEmail,
        },
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Self-service registration API error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to register school portal. Please try again.' },
      { status: 500 }
    );
  }
}
