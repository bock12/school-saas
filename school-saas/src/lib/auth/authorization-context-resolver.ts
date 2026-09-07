/**
 * ============================================================================
 * AUTHORIZATION CONTEXT RESOLVER
 * Architecture: TASK-0007 Phase 3A — Canonical Authorization Engine
 * Server-Side Trusted Context Resolution Boundary
 * ============================================================================
 */

import { createClient } from '@/lib/supabase/server';
import {
  type BaseRole,
  type StaffAssignmentType,
  isBaseRole,
  isStaffAssignmentType,
} from './permissions-registry';
import {
  type TrustedSecurityContext,
  type ResolvedStaffAssignment,
} from './authorization-engine';

export interface ResolveContextOptions {
  /** Optional Supabase client instance (server or test client) */
  supabaseClient?: any;
  /** Optional user ID override for server-side trusted execution */
  userId?: string;
  /** Optional evaluation date in YYYY-MM-DD format (defaults to current UTC date) */
  evaluationDate?: string;
}

/**
 * Server-side trusted context resolver.
 * Enforces:
 *  1. Supabase authenticated identity verification
 *  2. Profile retrieval & active status validation
 *  3. Academic-year 0/1/>1 invariant (fails closed without arbitrary LIMIT 1)
 *  4. Canonical org hierarchy resolution via get_org_subtenant_ids()
 *  5. Relational staff assignment retrieval from school_staff_assignments
 *  6. Verified parent-student linkage retrieval from student_parents
 */
export async function resolveAuthorizationContext(
  options: ResolveContextOptions = {}
): Promise<TrustedSecurityContext> {
  const evalDate = options.evaluationDate || new Date().toISOString().slice(0, 10);
  const supabase = options.supabaseClient || (await createClient());

  // ── 1. Authenticated Identity Verification ─────────────────────────────────
  let targetUserId = options.userId;

  if (!targetUserId) {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return createUnauthenticatedContext(evalDate);
    }
    targetUserId = user.id;
  }

  // ── 2. Profile Resolution & Active Status Check ────────────────────────────
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('id, tenant_id, role, is_active')
    .eq('id', targetUserId)
    .maybeSingle();

  if (profileErr || !profile) {
    return createUnauthenticatedContext(evalDate);
  }

  const rawRole = String(profile.role);
  const baseRole: BaseRole = isBaseRole(rawRole) ? rawRole : 'teacher';
  const isActive = Boolean(profile.is_active);
  const isSuperAdmin = baseRole === 'super_admin';
  const tenantId = profile.tenant_id ? String(profile.tenant_id) : null;

  // Deactivated accounts return immediately with isActive = false (fails closed)
  if (!isActive) {
    return {
      _brand: 'TrustedSecurityContext',
      actorId: profile.id,
      tenantId,
      baseRole,
      isActive: false,
      isSuperAdmin,
      organizationSubtenantIds: [],
      activeAssignments: [],
      verifiedChildStudentIds: [],
      evaluationDate: evalDate,
    };
  }

  // Super admins have global platform authority
  if (isSuperAdmin) {
    return {
      _brand: 'TrustedSecurityContext',
      actorId: profile.id,
      tenantId,
      baseRole: 'super_admin',
      isActive: true,
      isSuperAdmin: true,
      organizationSubtenantIds: [],
      activeAssignments: [],
      verifiedChildStudentIds: [],
      evaluationDate: evalDate,
    };
  }

  // ── 3. Organization Subtenant Resolution (org_admin) ──────────────────────
  let organizationSubtenantIds: string[] = [];

  if (baseRole === 'org_admin' && tenantId) {
    // Reuse canonical PostgreSQL helper: get_org_subtenant_ids(UUID) (Guardrail 4)
    const { data: subtenants, error: rpcErr } = await supabase.rpc('get_org_subtenant_ids', {
      p_org_tenant_id: tenantId,
    });

    if (!rpcErr && Array.isArray(subtenants)) {
      organizationSubtenantIds = subtenants.map((row: any) =>
        typeof row === 'string' ? row : row.id
      );
    } else {
      // Fallback: direct query on tenants with matching parent_id if RPC not available in context
      const { data: childTenants } = await supabase
        .from('tenants')
        .select('id')
        .eq('parent_id', tenantId)
        .eq('type', 'school');

      if (childTenants && Array.isArray(childTenants)) {
        organizationSubtenantIds = childTenants.map((t: any) => t.id);
      }
    }
  }

  // ── 4. Academic-Year Invariant Resolution (0 / 1 / >1) ─────────────────────
  // Guardrail 6: Exactly 0 rows -> fail closed; >1 rows -> fail closed; 1 row -> valid
  let activeAssignments: ResolvedStaffAssignment[] = [];

  if (tenantId && (baseRole === 'teacher' || baseRole === 'school_admin')) {
    const { data: academicYears, error: ayErr } = await supabase
      .from('academic_years')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('is_current', true);

    const currentYearCount = Array.isArray(academicYears) ? academicYears.length : 0;

    if (!ayErr && currentYearCount === 1) {
      const currentYearId = academicYears[0].id;

      // Find teacher record corresponding to this user profile
      const { data: teacherRecord } = await supabase
        .from('teachers')
        .select('id')
        .eq('profile_id', profile.id)
        .eq('tenant_id', tenantId)
        .maybeSingle();

      if (teacherRecord) {
        // Query active staff assignments for the current academic year
        const { data: assignments, error: assignErr } = await supabase
          .from('school_staff_assignments')
          .select(
            'id, tenant_id, academic_year_id, assignment_type, department_id, section_id, subject_offering_id, status, is_active, effective_from, effective_until'
          )
          .eq('tenant_id', tenantId)
          .eq('teacher_id', teacherRecord.id)
          .eq('academic_year_id', currentYearId)
          .eq('status', 'active')
          .eq('is_active', true);

        if (!assignErr && Array.isArray(assignments)) {
          activeAssignments = assignments
            .filter((a: any) => isStaffAssignmentType(a.assignment_type))
            .map((a: any) => ({
              id: a.id,
              assignmentType: a.assignment_type as StaffAssignmentType,
              tenantId: a.tenant_id,
              academicYearId: a.academic_year_id,
              departmentId: a.department_id || null,
              sectionId: a.section_id || null,
              subjectOfferingId: a.subject_offering_id || null,
              status: a.status,
              isActive: a.is_active,
              effectiveFrom: a.effective_from,
              effectiveUntil: a.effective_until || null,
            }));
        }
      }
    } else if (currentYearCount > 1) {
      // Data integrity violation: multiple current academic years. Fails closed (empty assignments)
      console.warn(
        `[AuthorizationContextResolver] Multiple current academic years (${currentYearCount}) in tenant ${tenantId}. Failing closed.`
      );
    }
    // Note: If currentYearCount === 0, activeAssignments remains [] (fails closed safely)
  }

  // ── 5. Parent Child Linkage Resolution (parent_students) ───────────────────
  let verifiedChildStudentIds: string[] = [];

  if (baseRole === 'parent' && tenantId) {
    // Find parent record linked to this profile
    const { data: parentRecord } = await supabase
      .from('parents')
      .select('id')
      .eq('profile_id', profile.id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (parentRecord) {
      // Query student_parents junction table for linked child student IDs
      const { data: links } = await supabase
        .from('student_parents')
        .select('student_id')
        .eq('parent_id', parentRecord.id)
        .eq('tenant_id', tenantId);

      if (links && Array.isArray(links)) {
        verifiedChildStudentIds = links.map((l: any) => l.student_id);
      }
    }
  }

  // ── 6. Return Trusted Security Context ─────────────────────────────────────
  return {
    _brand: 'TrustedSecurityContext',
    actorId: profile.id,
    tenantId,
    baseRole,
    isActive: true,
    isSuperAdmin: false,
    organizationSubtenantIds,
    activeAssignments,
    verifiedChildStudentIds,
    evaluationDate: evalDate,
  };
}

function createUnauthenticatedContext(evalDate: string): TrustedSecurityContext {
  return {
    _brand: 'TrustedSecurityContext',
    actorId: '',
    tenantId: null,
    baseRole: 'student',
    isActive: false,
    isSuperAdmin: false,
    organizationSubtenantIds: [],
    activeAssignments: [],
    verifiedChildStudentIds: [],
    evaluationDate: evalDate,
  };
}
