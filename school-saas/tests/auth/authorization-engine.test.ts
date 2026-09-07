/**
 * ============================================================================
 * AUTHORIZATION ENGINE TESTS
 * Architecture: TASK-0007 Phase 3A — Canonical Authorization Engine
 * Comprehensive Unit Tests for Pure Evaluator, Enforcer, and Lifecycle Rules
 * ============================================================================
 */

import test, { describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  evaluateAuthorization,
  authorize,
  can,
  hasCapability,
  createTestSecurityContext,
  AuthorizationError,
  type ResourceTarget,
  type ResolvedStaffAssignment,
} from '@/lib/auth/authorization-engine';

describe('Canonical Authorization Engine — Core Unit Tests', () => {

  // --------------------------------------------------------------------------
  // 1. IDENTITY & AUTHENTICATION
  // --------------------------------------------------------------------------
  describe('Group 1 — Identity & Authentication', () => {
    test('unauthenticated actor (empty actorId) is denied with UNAUTHENTICATED', () => {
      const ctx = createTestSecurityContext({ actorId: '', isActive: true });
      const target: ResourceTarget = { tenantId: 'ten-school-1' };
      const decision = evaluateAuthorization(ctx, 'staff.directory.view', target);

      assert.equal(decision.allowed, false);
      assert.equal(decision.decision, 'DENY');
      assert.equal(decision.code, 'UNAUTHENTICATED');
    });

    test('deactivated actor (isActive: false) is denied with ACCOUNT_INACTIVE', () => {
      const ctx = createTestSecurityContext({ actorId: 'usr-1', isActive: false });
      const target: ResourceTarget = { tenantId: 'ten-school-1' };
      const decision = evaluateAuthorization(ctx, 'staff.directory.view', target);

      assert.equal(decision.allowed, false);
      assert.equal(decision.decision, 'DENY');
      assert.equal(decision.code, 'ACCOUNT_INACTIVE');
    });

    test('active authenticated actor proceeds to authorization evaluation', () => {
      const ctx = createTestSecurityContext({
        actorId: 'usr-1',
        tenantId: 'ten-school-1',
        baseRole: 'teacher',
        isActive: true,
      });
      const target: ResourceTarget = { tenantId: 'ten-school-1' };
      const decision = evaluateAuthorization(ctx, 'staff.directory.view', target);

      assert.equal(decision.allowed, true);
      assert.equal(decision.decision, 'ALLOW');
      assert.equal(decision.code, 'AUTHORIZED');
    });
  });

  // --------------------------------------------------------------------------
  // 2. PERMISSION REGISTRY INTEGRITY
  // --------------------------------------------------------------------------
  describe('Group 2 — Permission Registry Integrity', () => {
    test('unknown permission key is denied with UNKNOWN_PERMISSION', () => {
      const ctx = createTestSecurityContext({ baseRole: 'school_admin' });
      const target: ResourceTarget = { tenantId: 'ten-school-1' };
      const decision = evaluateAuthorization(ctx, 'invalid.permission.key', target);

      assert.equal(decision.allowed, false);
      assert.equal(decision.decision, 'DENY');
      assert.equal(decision.code, 'UNKNOWN_PERMISSION');
    });

    test('valid permission key not held by actor is denied with PERMISSION_NOT_GRANTED', () => {
      const ctx = createTestSecurityContext({
        baseRole: 'teacher',
        tenantId: 'ten-school-1',
        activeAssignments: [],
      });
      const target: ResourceTarget = { tenantId: 'ten-school-1' };
      // Base teacher does not hold curriculum.version.publish
      const decision = evaluateAuthorization(ctx, 'curriculum.version.publish', target);

      assert.equal(decision.allowed, false);
      assert.equal(decision.decision, 'DENY');
      assert.equal(decision.code, 'PERMISSION_NOT_GRANTED');
    });
  });

  // --------------------------------------------------------------------------
  // 3. TENANT ISOLATION
  // --------------------------------------------------------------------------
  describe('Group 3 — Tenant Isolation', () => {
    test('cross-tenant access is denied with CROSS_TENANT_DENIED for same base role', () => {
      const ctx = createTestSecurityContext({
        baseRole: 'school_admin',
        tenantId: 'ten-school-A',
      });
      const target: ResourceTarget = { tenantId: 'ten-school-B' };
      const decision = evaluateAuthorization(ctx, 'staff.directory.view', target);

      assert.equal(decision.allowed, false);
      assert.equal(decision.decision, 'DENY');
      assert.equal(decision.code, 'CROSS_TENANT_DENIED');
    });

    test('missing resource tenantId is denied with TENANT_CONTEXT_MISSING', () => {
      const ctx = createTestSecurityContext({
        baseRole: 'school_admin',
        tenantId: 'ten-school-A',
      });
      const target = { tenantId: '' } as ResourceTarget;
      const decision = evaluateAuthorization(ctx, 'staff.directory.view', target);

      assert.equal(decision.allowed, false);
      assert.equal(decision.decision, 'DENY');
      assert.equal(decision.code, 'TENANT_CONTEXT_MISSING');
    });

    test('actor with missing tenantId cannot access tenant-scoped resources', () => {
      const ctx = createTestSecurityContext({
        baseRole: 'teacher',
        tenantId: null,
      });
      const target: ResourceTarget = { tenantId: 'ten-school-A' };
      const decision = evaluateAuthorization(ctx, 'staff.directory.view', target);

      assert.equal(decision.allowed, false);
      assert.equal(decision.decision, 'DENY');
      assert.equal(decision.code, 'TENANT_CONTEXT_MISSING');
    });

    test('super_admin can operate across different school tenants when explicitly specified', () => {
      const ctx = createTestSecurityContext({
        baseRole: 'super_admin',
        tenantId: 'ten-platform',
        isSuperAdmin: true,
      });
      const target: ResourceTarget = { tenantId: 'ten-school-X' };
      const decision = evaluateAuthorization(ctx, 'staff.directory.view', target);

      assert.equal(decision.allowed, true);
      assert.equal(decision.decision, 'ALLOW');
    });

    test('org_admin can access owned child schools via organizationSubtenantIds', () => {
      const ctx = createTestSecurityContext({
        baseRole: 'org_admin',
        tenantId: 'ten-org-1',
        organizationSubtenantIds: ['ten-school-child-1', 'ten-school-child-2'],
      });
      const targetChild: ResourceTarget = { tenantId: 'ten-school-child-1' };
      const decisionChild = evaluateAuthorization(ctx, 'staff.directory.view', targetChild);

      assert.equal(decisionChild.allowed, true);
      assert.equal(decisionChild.decision, 'ALLOW');

      // Unrelated school outside org subtree is denied
      const targetExternal: ResourceTarget = { tenantId: 'ten-school-unrelated' };
      const decisionExternal = evaluateAuthorization(ctx, 'staff.directory.view', targetExternal);

      assert.equal(decisionExternal.allowed, false);
      assert.equal(decisionExternal.code, 'CROSS_TENANT_DENIED');
    });
  });

  // --------------------------------------------------------------------------
  // 4. FUNCTIONAL ASSIGNMENT LIFECYCLE & TEMPORAL VALIDITY
  // --------------------------------------------------------------------------
  describe('Group 4 — Assignment Lifecycle & Temporal Validity', () => {
    const validAssignment: ResolvedStaffAssignment = {
      id: 'assign-hod-1',
      assignmentType: 'hod',
      tenantId: 'ten-school-1',
      academicYearId: 'ay-2026',
      departmentId: 'dept-sciences',
      status: 'active',
      isActive: true,
      effectiveFrom: '2026-09-01',
      effectiveUntil: '2027-06-30',
    };

    test('active assignment within effective dates grants department permission', () => {
      const ctx = createTestSecurityContext({
        baseRole: 'teacher',
        tenantId: 'ten-school-1',
        evaluationDate: '2026-10-15',
        activeAssignments: [validAssignment],
      });
      const target: ResourceTarget = {
        tenantId: 'ten-school-1',
        departmentId: 'dept-sciences',
      };
      const decision = evaluateAuthorization(ctx, 'curriculum.version.create', target);

      assert.equal(decision.allowed, true);
      assert.equal(decision.decision, 'ALLOW');
    });

    test('future-dated assignment (effectiveFrom > evalDate) fails closed with PERMISSION_NOT_GRANTED', () => {
      const futureAssignment: ResolvedStaffAssignment = {
        ...validAssignment,
        effectiveFrom: '2026-11-01',
      };
      const ctx = createTestSecurityContext({
        baseRole: 'teacher',
        tenantId: 'ten-school-1',
        evaluationDate: '2026-10-15', // Evaluation is BEFORE effectiveFrom
        activeAssignments: [futureAssignment],
      });
      const target: ResourceTarget = {
        tenantId: 'ten-school-1',
        departmentId: 'dept-sciences',
      };
      const decision = evaluateAuthorization(ctx, 'curriculum.version.create', target);

      assert.equal(decision.allowed, false);
      assert.equal(decision.code, 'PERMISSION_NOT_GRANTED');
    });

    test('expired assignment (effectiveUntil < evalDate) fails closed with PERMISSION_NOT_GRANTED', () => {
      const expiredAssignment: ResolvedStaffAssignment = {
        ...validAssignment,
        effectiveUntil: '2026-09-30',
      };
      const ctx = createTestSecurityContext({
        baseRole: 'teacher',
        tenantId: 'ten-school-1',
        evaluationDate: '2026-10-15', // Evaluation is AFTER effectiveUntil
        activeAssignments: [expiredAssignment],
      });
      const target: ResourceTarget = {
        tenantId: 'ten-school-1',
        departmentId: 'dept-sciences',
      };
      const decision = evaluateAuthorization(ctx, 'curriculum.version.create', target);

      assert.equal(decision.allowed, false);
      assert.equal(decision.code, 'PERMISSION_NOT_GRANTED');
    });

    test('revoked assignment (status: "revoked") fails closed with PERMISSION_NOT_GRANTED', () => {
      const revokedAssignment: ResolvedStaffAssignment = {
        ...validAssignment,
        status: 'revoked',
        isActive: false,
      };
      const ctx = createTestSecurityContext({
        baseRole: 'teacher',
        tenantId: 'ten-school-1',
        evaluationDate: '2026-10-15',
        activeAssignments: [revokedAssignment],
      });
      const target: ResourceTarget = {
        tenantId: 'ten-school-1',
        departmentId: 'dept-sciences',
      };
      const decision = evaluateAuthorization(ctx, 'curriculum.version.create', target);

      assert.equal(decision.allowed, false);
      assert.equal(decision.code, 'PERMISSION_NOT_GRANTED');
    });

    test('suspended assignment (status: "suspended") fails closed with PERMISSION_NOT_GRANTED', () => {
      const suspendedAssignment: ResolvedStaffAssignment = {
        ...validAssignment,
        status: 'suspended',
        isActive: false,
      };
      const ctx = createTestSecurityContext({
        baseRole: 'teacher',
        tenantId: 'ten-school-1',
        evaluationDate: '2026-10-15',
        activeAssignments: [suspendedAssignment],
      });
      const target: ResourceTarget = {
        tenantId: 'ten-school-1',
        departmentId: 'dept-sciences',
      };
      const decision = evaluateAuthorization(ctx, 'curriculum.version.create', target);

      assert.equal(decision.allowed, false);
      assert.equal(decision.code, 'PERMISSION_NOT_GRANTED');
    });
  });

  // --------------------------------------------------------------------------
  // 5. CANONICAL SCOPES EVALUATION (ALL 7 SCOPES)
  // --------------------------------------------------------------------------
  describe('Group 5 — Canonical Scope Evaluation', () => {
    test('Scope 1: platform — super_admin permitted, school_admin denied', () => {
      const superCtx = createTestSecurityContext({ baseRole: 'super_admin' });
      assert.equal(can(superCtx, 'platform.tenants.manage'), true);

      const adminCtx = createTestSecurityContext({ baseRole: 'school_admin' });
      assert.equal(can(adminCtx, 'platform.tenants.manage'), false);
    });

    test('Scope 2: organization — org_admin permitted across child schools', () => {
      const orgCtx = createTestSecurityContext({
        baseRole: 'org_admin',
        tenantId: 'ten-org-1',
        organizationSubtenantIds: ['ten-school-child'],
      });
      const target: ResourceTarget = { tenantId: 'ten-school-child' };
      assert.equal(can(orgCtx, 'staff.directory.view', target), true);
    });

    test('Scope 3: school — school_admin permitted within own school', () => {
      const adminCtx = createTestSecurityContext({
        baseRole: 'school_admin',
        tenantId: 'ten-school-1',
      });
      const target: ResourceTarget = { tenantId: 'ten-school-1' };
      assert.equal(can(adminCtx, 'students.records.manage', target), true);
    });

    test('Scope 4: department — HOD permitted for assigned department, denied for others', () => {
      const hodCtx = createTestSecurityContext({
        baseRole: 'teacher',
        tenantId: 'ten-school-1',
        activeAssignments: [
          {
            id: 'assign-hod-math',
            assignmentType: 'hod',
            tenantId: 'ten-school-1',
            academicYearId: 'ay-1',
            departmentId: 'dept-math',
            status: 'active',
            isActive: true,
            effectiveFrom: '2026-09-01',
          },
        ],
      });

      const mathTarget: ResourceTarget = {
        tenantId: 'ten-school-1',
        departmentId: 'dept-math',
      };
      assert.equal(can(hodCtx, 'curriculum.version.review', mathTarget), true);

      const scienceTarget: ResourceTarget = {
        tenantId: 'ten-school-1',
        departmentId: 'dept-science',
      };
      assert.equal(can(hodCtx, 'curriculum.version.review', scienceTarget), false);
    });

    test('Scope 5: class — Form Master permitted for assigned class section, denied for others', () => {
      const fmCtx = createTestSecurityContext({
        baseRole: 'teacher',
        tenantId: 'ten-school-1',
        activeAssignments: [
          {
            id: 'assign-fm-jss1a',
            assignmentType: 'form_master',
            tenantId: 'ten-school-1',
            academicYearId: 'ay-1',
            sectionId: 'sec-jss1a',
            status: 'active',
            isActive: true,
            effectiveFrom: '2026-09-01',
          },
        ],
      });

      const jss1aTarget: ResourceTarget = {
        tenantId: 'ten-school-1',
        sectionId: 'sec-jss1a',
      };
      assert.equal(can(fmCtx, 'attendance.sessions.approve', jss1aTarget), true);

      const jss1bTarget: ResourceTarget = {
        tenantId: 'ten-school-1',
        sectionId: 'sec-jss1b',
      };
      assert.equal(can(fmCtx, 'attendance.sessions.approve', jss1bTarget), false);
    });

    test('Scope 6: offering — Subject Teacher permitted for assigned offering, denied for others', () => {
      const stCtx = createTestSecurityContext({
        baseRole: 'teacher',
        tenantId: 'ten-school-1',
        activeAssignments: [
          {
            id: 'assign-st-physics',
            assignmentType: 'subject_teacher',
            tenantId: 'ten-school-1',
            academicYearId: 'ay-1',
            subjectOfferingId: 'off-physics-ss1',
            status: 'active',
            isActive: true,
            effectiveFrom: '2026-09-01',
          },
        ],
      });

      const physicsTarget: ResourceTarget = {
        tenantId: 'ten-school-1',
        subjectOfferingId: 'off-physics-ss1',
      };
      assert.equal(can(stCtx, 'exams.results.enter', physicsTarget), true);

      const bioTarget: ResourceTarget = {
        tenantId: 'ten-school-1',
        subjectOfferingId: 'off-biology-ss1',
      };
      assert.equal(can(stCtx, 'exams.results.enter', bioTarget), false);
    });

    test('Scope 7: self (student) — student permitted for own records, denied for other students', () => {
      const studentCtx = createTestSecurityContext({
        actorId: 'usr-student-1',
        baseRole: 'student',
        tenantId: 'ten-school-1',
      });

      const ownTarget: ResourceTarget = {
        tenantId: 'ten-school-1',
        ownerId: 'usr-student-1',
      };
      assert.equal(can(studentCtx, 'exams.results.view', ownTarget), true);

      const otherTarget: ResourceTarget = {
        tenantId: 'ten-school-1',
        ownerId: 'usr-student-2',
      };
      assert.equal(can(studentCtx, 'exams.results.view', otherTarget), false);
    });

    test('Scope 7: self (parent) — parent permitted for verified child, denied for unlinked student', () => {
      const parentCtx = createTestSecurityContext({
        actorId: 'usr-parent-1',
        baseRole: 'parent',
        tenantId: 'ten-school-1',
        verifiedChildStudentIds: ['stu-child-1'], // Linked via student_parents
      });

      const childTarget: ResourceTarget = {
        tenantId: 'ten-school-1',
        ownerId: 'stu-child-1',
      };
      assert.equal(can(parentCtx, 'students.records.view', childTarget), true);

      const unlinkedTarget: ResourceTarget = {
        tenantId: 'ten-school-1',
        ownerId: 'stu-child-99', // Not in verified children
      };
      const decision = evaluateAuthorization(parentCtx, 'students.records.view', unlinkedTarget);
      assert.equal(decision.allowed, false);
      assert.equal(decision.code, 'OUT_OF_SCOPE');
    });
  });

  // --------------------------------------------------------------------------
  // 6. MULTI-ASSIGNMENT USERS & SCOPE CONTAINMENT
  // --------------------------------------------------------------------------
  describe('Group 6 — Multi-Assignment Users & Scope Containment', () => {
    /**
     * Staff member with multiple assignments:
     * - HOD of Physics (dept-physics)
     * - Form Master of JSS 2A (sec-jss2a)
     * - Subject Teacher of Math SS1 (off-math-ss1)
     */
    const multiCtx = createTestSecurityContext({
      actorId: 'usr-teacher-polymath',
      baseRole: 'teacher',
      tenantId: 'ten-school-1',
      activeAssignments: [
        {
          id: 'asg-hod',
          assignmentType: 'hod',
          tenantId: 'ten-school-1',
          academicYearId: 'ay-1',
          departmentId: 'dept-physics',
          status: 'active',
          isActive: true,
          effectiveFrom: '2026-09-01',
        },
        {
          id: 'asg-fm',
          assignmentType: 'form_master',
          tenantId: 'ten-school-1',
          academicYearId: 'ay-1',
          sectionId: 'sec-jss2a',
          status: 'active',
          isActive: true,
          effectiveFrom: '2026-09-01',
        },
        {
          id: 'asg-st',
          assignmentType: 'subject_teacher',
          tenantId: 'ten-school-1',
          academicYearId: 'ay-1',
          subjectOfferingId: 'off-math-ss1',
          status: 'active',
          isActive: true,
          effectiveFrom: '2026-09-01',
        },
      ],
    });

    test('HOD authority grants moderation in Physics Dept, but NOT in Chemistry Dept', () => {
      assert.equal(
        can(multiCtx, 'exams.results.moderate', {
          tenantId: 'ten-school-1',
          departmentId: 'dept-physics',
        }),
        true
      );

      assert.equal(
        can(multiCtx, 'exams.results.moderate', {
          tenantId: 'ten-school-1',
          departmentId: 'dept-chemistry',
        }),
        false
      );
    });

    test('Form Master authority grants attendance approval in JSS 2A, but NOT in JSS 2B', () => {
      assert.equal(
        can(multiCtx, 'attendance.sessions.approve', {
          tenantId: 'ten-school-1',
          sectionId: 'sec-jss2a',
        }),
        true
      );

      assert.equal(
        can(multiCtx, 'attendance.sessions.approve', {
          tenantId: 'ten-school-1',
          sectionId: 'sec-jss2b',
        }),
        false
      );
    });

    test('Subject Teacher authority grants mark entry in Math SS1, but NOT in Math SS2', () => {
      assert.equal(
        can(multiCtx, 'exams.results.enter', {
          tenantId: 'ten-school-1',
          subjectOfferingId: 'off-math-ss1',
        }),
        true
      );

      assert.equal(
        can(multiCtx, 'exams.results.enter', {
          tenantId: 'ten-school-1',
          subjectOfferingId: 'off-math-ss2',
        }),
        false
      );
    });

    test('HOD role cannot mark attendance for an unrelated class section', () => {
      assert.equal(
        can(multiCtx, 'attendance.sessions.approve', {
          tenantId: 'ten-school-1',
          sectionId: 'sec-ss3a',
        }),
        false
      );
    });
  });

  // --------------------------------------------------------------------------
  // 7. SEPARATION OF DUTIES (SoD) & EXAMINATION WORKFLOW
  // --------------------------------------------------------------------------
  describe('Group 7 — Separation of Duties (SoD)', () => {
    test('exams.results.moderate: self-moderation is blocked when submitterId === actorId', () => {
      const hodCtx = createTestSecurityContext({
        actorId: 'usr-teacher-hod',
        baseRole: 'teacher',
        tenantId: 'ten-school-1',
        activeAssignments: [
          {
            id: 'asg-hod',
            assignmentType: 'hod',
            tenantId: 'ten-school-1',
            academicYearId: 'ay-1',
            departmentId: 'dept-science',
            status: 'active',
            isActive: true,
            effectiveFrom: '2026-09-01',
          },
        ],
      });

      // Target submitted by another teacher: ALLOW
      const legitimateTarget: ResourceTarget = {
        tenantId: 'ten-school-1',
        departmentId: 'dept-science',
        submitterId: 'usr-colleague-2',
      };
      const allowDec = evaluateAuthorization(hodCtx, 'exams.results.moderate', legitimateTarget);
      assert.equal(allowDec.allowed, true);

      // Target submitted by the HOD themselves: DENY
      const selfModerationTarget: ResourceTarget = {
        tenantId: 'ten-school-1',
        departmentId: 'dept-science',
        submitterId: 'usr-teacher-hod', // Same as actorId!
      };
      const denyDec = evaluateAuthorization(hodCtx, 'exams.results.moderate', selfModerationTarget);
      assert.equal(denyDec.allowed, false);
      assert.equal(denyDec.code, 'SOD_SELF_MODERATION_BLOCKED');
    });

    test('exams.results.approve: self-approval is blocked when submitterId === actorId', () => {
      const principalCtx = createTestSecurityContext({
        actorId: 'usr-principal',
        baseRole: 'school_admin',
        tenantId: 'ten-school-1',
      });

      const legitimateTarget: ResourceTarget = {
        tenantId: 'ten-school-1',
        submitterId: 'usr-teacher-sub',
      };
      assert.equal(can(principalCtx, 'exams.results.approve', legitimateTarget), true);

      const selfApprovalTarget: ResourceTarget = {
        tenantId: 'ten-school-1',
        submitterId: 'usr-principal', // Principal submitted marks!
      };
      const dec = evaluateAuthorization(principalCtx, 'exams.results.approve', selfApprovalTarget);
      assert.equal(dec.allowed, false);
      assert.equal(dec.code, 'SOD_SELF_APPROVAL_BLOCKED');
    });

    test('exams.results.approve & publish: permitted for administrative executives (super_admin, org_admin, school_admin); strictly denied to teaching staff & functional assignments', () => {
      // 1. super_admin: Platform-wide authority to approve and publish
      const superCtx = createTestSecurityContext({
        baseRole: 'super_admin',
        isSuperAdmin: true,
      });
      assert.equal(can(superCtx, 'exams.results.approve', { tenantId: 'ten-school-1' }), true);
      assert.equal(can(superCtx, 'exams.results.publish', { tenantId: 'ten-school-1' }), true);

      // 2. org_admin: Organization-wide authority across owned child schools
      const orgCtx = createTestSecurityContext({
        baseRole: 'org_admin',
        tenantId: 'ten-org-parent',
        organizationSubtenantIds: ['ten-school-child-1', 'ten-school-child-2'],
      });
      // Permitted on child schools within organization subtree
      assert.equal(can(orgCtx, 'exams.results.approve', { tenantId: 'ten-school-child-1' }), true);
      assert.equal(can(orgCtx, 'exams.results.publish', { tenantId: 'ten-school-child-2' }), true);
      // Denied on foreign school outside organization subtree
      assert.equal(can(orgCtx, 'exams.results.approve', { tenantId: 'ten-school-foreign' }), false);
      assert.equal(can(orgCtx, 'exams.results.publish', { tenantId: 'ten-school-foreign' }), false);

      // 3. school_admin: Institutional authority within own school tenant
      const adminCtx = createTestSecurityContext({
        baseRole: 'school_admin',
        tenantId: 'ten-school-1',
      });
      assert.equal(can(adminCtx, 'exams.results.approve', { tenantId: 'ten-school-1' }), true);
      assert.equal(can(adminCtx, 'exams.results.publish', { tenantId: 'ten-school-1' }), true);
      // Denied on foreign school tenant
      assert.equal(can(adminCtx, 'exams.results.approve', { tenantId: 'ten-school-foreign' }), false);
      assert.equal(can(adminCtx, 'exams.results.publish', { tenantId: 'ten-school-foreign' }), false);

      // 4. Teaching staff & functional assignments: ALL strictly denied
      const functionalAssignments: Array<
        'vice_principal' | 'exam_officer' | 'hod' | 'form_master' | 'subject_teacher' | 'assistant_teacher'
      > = [
        'vice_principal',
        'exam_officer',
        'hod',
        'form_master',
        'subject_teacher',
        'assistant_teacher',
      ];

      for (const fa of functionalAssignments) {
        const staffCtx = createTestSecurityContext({
          baseRole: 'teacher',
          tenantId: 'ten-school-1',
          activeAssignments: [
            {
              id: `asg-${fa}`,
              assignmentType: fa,
              tenantId: 'ten-school-1',
              academicYearId: 'ay-1',
              departmentId: 'dept-sci',
              sectionId: 'sec-jss1',
              subjectOfferingId: 'off-math',
              status: 'active',
              isActive: true,
              effectiveFrom: '2026-09-01',
            },
          ],
        });
        assert.equal(
          can(staffCtx, 'exams.results.approve', { tenantId: 'ten-school-1' }),
          false,
          `Functional assignment [${fa}] must NOT be permitted to approve results`
        );
        assert.equal(
          can(staffCtx, 'exams.results.publish', { tenantId: 'ten-school-1' }),
          false,
          `Functional assignment [${fa}] must NOT be permitted to publish results`
        );
      }

      // 5. Students and Parents: Strictly denied
      const studentCtx = createTestSecurityContext({ baseRole: 'student', tenantId: 'ten-school-1' });
      assert.equal(can(studentCtx, 'exams.results.approve', { tenantId: 'ten-school-1' }), false);
      assert.equal(can(studentCtx, 'exams.results.publish', { tenantId: 'ten-school-1' }), false);

      const parentCtx = createTestSecurityContext({ baseRole: 'parent', tenantId: 'ten-school-1' });
      assert.equal(can(parentCtx, 'exams.results.approve', { tenantId: 'ten-school-1' }), false);
      assert.equal(can(parentCtx, 'exams.results.publish', { tenantId: 'ten-school-1' }), false);
    });

    test('Assistant Teacher: mark entry permitted in draft stage, denied in non-draft stages', () => {
      const asstCtx = createTestSecurityContext({
        baseRole: 'teacher',
        tenantId: 'ten-school-1',
        activeAssignments: [
          {
            id: 'asg-asst',
            assignmentType: 'assistant_teacher',
            tenantId: 'ten-school-1',
            academicYearId: 'ay-1',
            subjectOfferingId: 'off-bio-1',
            status: 'active',
            isActive: true,
            effectiveFrom: '2026-09-01',
          },
        ],
      });

      // Draft stage: ALLOW
      const draftTarget: ResourceTarget = {
        tenantId: 'ten-school-1',
        subjectOfferingId: 'off-bio-1',
        stage: 'draft',
      };
      assert.equal(can(asstCtx, 'exams.results.enter', draftTarget), true);

      // Finalized / non-draft stage: DENY with SOD_STAGE_RESTRICTION
      const finalTarget: ResourceTarget = {
        tenantId: 'ten-school-1',
        subjectOfferingId: 'off-bio-1',
        stage: 'finalized',
      };
      const dec = evaluateAuthorization(asstCtx, 'exams.results.enter', finalTarget);
      assert.equal(dec.allowed, false);
      assert.equal(dec.code, 'SOD_STAGE_RESTRICTION');
    });
  });

  // --------------------------------------------------------------------------
  // 8. ENFORCEMENT & API HELPERS
  // --------------------------------------------------------------------------
  describe('Group 8 — Enforcement & API Helpers', () => {
    test('authorize() throws AuthorizationError on denial', () => {
      const ctx = createTestSecurityContext({
        baseRole: 'teacher',
        tenantId: 'ten-school-1',
      });
      const target: ResourceTarget = { tenantId: 'ten-school-1' };

      assert.throws(
        () => authorize(ctx, 'exams.results.publish', target),
        (err: any) => {
          assert.ok(err instanceof AuthorizationError);
          assert.equal(err.code, 'PERMISSION_NOT_GRANTED');
          return true;
        }
      );
    });

    test('authorize() returns decision on allow without throwing', () => {
      const ctx = createTestSecurityContext({
        baseRole: 'school_admin',
        tenantId: 'ten-school-1',
      });
      const target: ResourceTarget = { tenantId: 'ten-school-1' };
      const res = authorize(ctx, 'staff.directory.view', target);

      assert.equal(res.allowed, true);
      assert.equal(res.code, 'AUTHORIZED');
    });

    test('can() returns boolean safely', () => {
      const ctx = createTestSecurityContext({
        baseRole: 'teacher',
        tenantId: 'ten-school-1',
      });
      assert.equal(can(ctx, 'staff.directory.view', { tenantId: 'ten-school-1' }), true);
      assert.equal(can(ctx, 'platform.billing.manage'), false);
    });

    test('hasCapability() checks abstract capability without resource scoping', () => {
      const teacherCtx = createTestSecurityContext({
        baseRole: 'teacher',
        tenantId: 'ten-school-1',
        activeAssignments: [
          {
            id: 'asg-hod',
            assignmentType: 'hod',
            tenantId: 'ten-school-1',
            academicYearId: 'ay-1',
            departmentId: 'dept-sci',
            status: 'active',
            isActive: true,
            effectiveFrom: '2026-09-01',
          },
        ],
      });

      // Teacher with HOD assignment has capability to review curriculum
      assert.equal(hasCapability(teacherCtx, 'curriculum.version.review'), true);

      // Teacher does NOT have capability to manage platform tenants
      assert.equal(hasCapability(teacherCtx, 'platform.tenants.manage'), false);
    });

    test('SECURITY CRITICAL: hasCapability() NEVER substitutes for can() or authorize() (Scope, Tenant, and SoD bypass prevention)', () => {
      const hodActorId = 'usr-hod-math';
      const hodCtx = createTestSecurityContext({
        actorId: hodActorId,
        baseRole: 'teacher',
        tenantId: 'ten-school-1',
        activeAssignments: [
          {
            id: 'asg-hod-math',
            assignmentType: 'hod',
            tenantId: 'ten-school-1',
            academicYearId: 'ay-2026',
            departmentId: 'dept-math',
            status: 'active',
            isActive: true,
            effectiveFrom: '2026-09-01',
          },
        ],
      });

      // 1. ABSTRACT CAPABILITY IS TRUE:
      // HOD holds the abstract entitlement to moderate examination results
      assert.equal(hasCapability(hodCtx, 'exams.results.moderate'), true);

      // 2. RESOURCE CANNOT BE ACCESSED IF OUT OF DEPARTMENT SCOPE:
      // Even though hasCapability is TRUE, can() is FALSE and authorize() THROWS
      const foreignDeptTarget: ResourceTarget = {
        tenantId: 'ten-school-1',
        departmentId: 'dept-humanities', // Different department!
        submitterId: 'other-teacher',
      };
      assert.equal(can(hodCtx, 'exams.results.moderate', foreignDeptTarget), false);
      assert.throws(
        () => authorize(hodCtx, 'exams.results.moderate', foreignDeptTarget),
        (err: any) => {
          assert.equal(err.name, 'AuthorizationError');
          assert.equal(err.code, 'OUT_OF_SCOPE');
          return true;
        }
      );

      // 3. RESOURCE CANNOT BE ACCESSED IF CROSS-TENANT:
      // Even though hasCapability is TRUE, can() is FALSE and authorize() THROWS
      const crossTenantTarget: ResourceTarget = {
        tenantId: 'ten-school-foreign', // Foreign tenant!
        departmentId: 'dept-math',
        submitterId: 'other-teacher',
      };
      assert.equal(can(hodCtx, 'exams.results.moderate', crossTenantTarget), false);
      assert.throws(
        () => authorize(hodCtx, 'exams.results.moderate', crossTenantTarget),
        (err: any) => {
          assert.equal(err.name, 'AuthorizationError');
          assert.equal(err.code, 'CROSS_TENANT_DENIED');
          return true;
        }
      );

      // 4. RESOURCE CANNOT BE ACCESSED IF SEPARATION OF DUTIES (SoD) VIOLATED:
      // Even though hasCapability is TRUE and department matches, self-moderation MUST BLOCK!
      const selfModerationTarget: ResourceTarget = {
        tenantId: 'ten-school-1',
        departmentId: 'dept-math',
        submitterId: hodActorId, // Actor submitted these marks!
      };
      assert.equal(can(hodCtx, 'exams.results.moderate', selfModerationTarget), false);
      assert.throws(
        () => authorize(hodCtx, 'exams.results.moderate', selfModerationTarget),
        (err: any) => {
          assert.equal(err.name, 'AuthorizationError');
          assert.equal(err.code, 'SOD_SELF_MODERATION_BLOCKED');
          return true;
        }
      );

      // 5. STAGE CONSTRAINTS CANNOT BE BYPASSED:
      // Assistant teacher hasCapability('exams.results.enter') === true, but CANNOT enter non-draft
      const asstCtx = createTestSecurityContext({
        actorId: 'usr-asst',
        baseRole: 'teacher',
        tenantId: 'ten-school-1',
        activeAssignments: [
          {
            id: 'asg-asst-1',
            assignmentType: 'assistant_teacher',
            tenantId: 'ten-school-1',
            academicYearId: 'ay-2026',
            subjectOfferingId: 'off-bio-1',
            status: 'active',
            isActive: true,
            effectiveFrom: '2026-09-01',
          },
        ],
      });
      assert.equal(hasCapability(asstCtx, 'exams.results.enter'), true);
      const submittedStageTarget: ResourceTarget = {
        tenantId: 'ten-school-1',
        subjectOfferingId: 'off-bio-1',
        stage: 'submitted', // Non-draft!
      };
      assert.equal(can(asstCtx, 'exams.results.enter', submittedStageTarget), false);
      assert.throws(
        () => authorize(asstCtx, 'exams.results.enter', submittedStageTarget),
        (err: any) => {
          assert.equal(err.name, 'AuthorizationError');
          assert.equal(err.code, 'SOD_STAGE_RESTRICTION');
          return true;
        }
      );
    });
  });
});
