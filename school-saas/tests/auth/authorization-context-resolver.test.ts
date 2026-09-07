/**
 * ============================================================================
 * AUTHORIZATION CONTEXT RESOLVER TESTS
 * Architecture: TASK-0007 Phase 3A — Canonical Authorization Engine
 * Tests for Server-Side Context Resolver, 0/1/>1 Invariants, and Hierarchy
 * ============================================================================
 */

import test, { describe } from 'node:test';
import assert from 'node:assert/strict';

import { resolveAuthorizationContext } from '@/lib/auth/authorization-context-resolver';

describe('Authorization Context Resolver — Tests', () => {

  // --------------------------------------------------------------------------
  // 1. UNAUTHENTICATED & INACTIVE ACCOUNTS
  // --------------------------------------------------------------------------
  describe('Group 1 — Unauthenticated & Inactive Profiles', () => {
    test('missing auth user resolves to unauthenticated context (isActive: false, empty actorId)', async () => {
      const mockSupabase = {
        auth: {
          getUser: async () => ({ data: { user: null }, error: new Error('No session') }),
        },
      };

      const ctx = await resolveAuthorizationContext({ supabaseClient: mockSupabase });
      assert.equal(ctx.actorId, '');
      assert.equal(ctx.isActive, false);
      assert.equal(ctx.isSuperAdmin, false);
      assert.deepEqual(ctx.activeAssignments, []);
    });

    test('deactivated profile (is_active: false) resolves with isActive: false (fails closed)', async () => {
      const mockSupabase = {
        auth: {
          getUser: async () => ({
            data: { user: { id: 'usr-inactive-1' } },
            error: null,
          }),
        },
        from: (table: string) => {
          if (table === 'profiles') {
            return {
              select: () => ({
                eq: () => ({
                  maybeSingle: async () => ({
                    data: {
                      id: 'usr-inactive-1',
                      tenant_id: 'ten-school-1',
                      role: 'teacher',
                      is_active: false,
                    },
                    error: null,
                  }),
                }),
              }),
            };
          }
          throw new Error(`Unexpected table query: ${table}`);
        },
      };

      const ctx = await resolveAuthorizationContext({ supabaseClient: mockSupabase });
      assert.equal(ctx.actorId, 'usr-inactive-1');
      assert.equal(ctx.isActive, false);
      assert.deepEqual(ctx.activeAssignments, []);
    });
  });

  // --------------------------------------------------------------------------
  // 2. SUPER ADMIN CONTEXT
  // --------------------------------------------------------------------------
  describe('Group 2 — Super Admin Context', () => {
    test('super_admin profile resolves with isSuperAdmin: true', async () => {
      const mockSupabase = {
        auth: {
          getUser: async () => ({
            data: { user: { id: 'usr-super-1' } },
            error: null,
          }),
        },
        from: (table: string) => ({
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: {
                  id: 'usr-super-1',
                  tenant_id: 'ten-platform',
                  role: 'super_admin',
                  is_active: true,
                },
                error: null,
              }),
            }),
          }),
        }),
      };

      const ctx = await resolveAuthorizationContext({ supabaseClient: mockSupabase });
      assert.equal(ctx.actorId, 'usr-super-1');
      assert.equal(ctx.isSuperAdmin, true);
      assert.equal(ctx.baseRole, 'super_admin');
      assert.equal(ctx.isActive, true);
    });
  });

  // --------------------------------------------------------------------------
  // 3. ORG ADMIN HIERARCHY RESOLUTION
  // --------------------------------------------------------------------------
  describe('Group 3 — Org Admin Hierarchy Resolution', () => {
    test('org_admin invokes get_org_subtenant_ids and populates organizationSubtenantIds', async () => {
      let rpcCalled = false;
      const mockSupabase = {
        auth: {
          getUser: async () => ({
            data: { user: { id: 'usr-orgadmin-1' } },
            error: null,
          }),
        },
        from: (table: string) => ({
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: {
                  id: 'usr-orgadmin-1',
                  tenant_id: 'ten-org-parent',
                  role: 'org_admin',
                  is_active: true,
                },
                error: null,
              }),
            }),
          }),
        }),
        rpc: async (fnName: string, args: any) => {
          if (fnName === 'get_org_subtenant_ids') {
            rpcCalled = true;
            assert.equal(args.p_org_tenant_id, 'ten-org-parent');
            return {
              data: [{ id: 'child-school-1' }, { id: 'child-school-2' }],
              error: null,
            };
          }
          return { data: null, error: new Error('Unknown RPC') };
        },
      };

      const ctx = await resolveAuthorizationContext({ supabaseClient: mockSupabase });
      assert.equal(rpcCalled, true, 'get_org_subtenant_ids must be called');
      assert.equal(ctx.baseRole, 'org_admin');
      assert.deepEqual(ctx.organizationSubtenantIds, ['child-school-1', 'child-school-2']);
    });
  });

  // --------------------------------------------------------------------------
  // 4. ACADEMIC-YEAR 0 / 1 / >1 FAIL-CLOSED INVARIANT
  // --------------------------------------------------------------------------
  describe('Group 4 — Academic-Year 0/1/>1 Invariant Enforcement', () => {
    test('0 current academic years: fails closed (returns empty activeAssignments)', async () => {
      const mockSupabase = {
        auth: {
          getUser: async () => ({
            data: { user: { id: 'usr-teacher-1' } },
            error: null,
          }),
        },
        from: (table: string) => {
          if (table === 'profiles') {
            return {
              select: () => ({
                eq: () => ({
                  maybeSingle: async () => ({
                    data: {
                      id: 'usr-teacher-1',
                      tenant_id: 'ten-school-1',
                      role: 'teacher',
                      is_active: true,
                    },
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === 'academic_years') {
            return {
              select: () => ({
                eq: () => ({
                  // 0 current academic years found in tenant
                  eq: async () => ({ data: [], error: null }),
                }),
              }),
            };
          }
          throw new Error(`Unexpected table query: ${table}`);
        },
      };

      const ctx = await resolveAuthorizationContext({ supabaseClient: mockSupabase });
      assert.equal(ctx.baseRole, 'teacher');
      assert.deepEqual(ctx.activeAssignments, [], 'Assignments must fail closed when 0 current academic years');
    });

    test('>1 current academic years: data integrity violation detected; fails closed without guessing (zero LIMIT 1)', async () => {
      const mockSupabase = {
        auth: {
          getUser: async () => ({
            data: { user: { id: 'usr-teacher-1' } },
            error: null,
          }),
        },
        from: (table: string) => {
          if (table === 'profiles') {
            return {
              select: () => ({
                eq: () => ({
                  maybeSingle: async () => ({
                    data: {
                      id: 'usr-teacher-1',
                      tenant_id: 'ten-school-1',
                      role: 'teacher',
                      is_active: true,
                    },
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === 'academic_years') {
            return {
              select: () => ({
                eq: () => ({
                  // Data integrity error: 2 rows with is_current = true
                  eq: async () => ({
                    data: [{ id: 'ay-duplicate-1' }, { id: 'ay-duplicate-2' }],
                    error: null,
                  }),
                }),
              }),
            };
          }
          throw new Error(`Unexpected table query: ${table}`);
        },
      };

      const ctx = await resolveAuthorizationContext({ supabaseClient: mockSupabase });
      assert.deepEqual(
        ctx.activeAssignments,
        [],
        'Assignments must fail closed when multiple current academic years exist'
      );
    });

    test('exactly 1 current academic year: resolves valid staff assignments from school_staff_assignments', async () => {
      const mockSupabase = {
        auth: {
          getUser: async () => ({
            data: { user: { id: 'usr-teacher-1' } },
            error: null,
          }),
        },
        from: (table: string) => {
          if (table === 'profiles') {
            return {
              select: () => ({
                eq: () => ({
                  maybeSingle: async () => ({
                    data: {
                      id: 'usr-teacher-1',
                      tenant_id: 'ten-school-1',
                      role: 'teacher',
                      is_active: true,
                    },
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === 'academic_years') {
            return {
              select: () => ({
                eq: () => ({
                  // Exactly 1 current academic year
                  eq: async () => ({
                    data: [{ id: 'ay-2026-current' }],
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === 'teachers') {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    maybeSingle: async () => ({
                      data: { id: 'tch-internal-1' },
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === 'school_staff_assignments') {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    eq: () => ({
                      eq: () => ({
                        eq: async () => ({
                          data: [
                            {
                              id: 'asg-hod-resolved',
                              tenant_id: 'ten-school-1',
                              academic_year_id: 'ay-2026-current',
                              assignment_type: 'hod',
                              departmentId: 'dept-sciences',
                              sectionId: null,
                              subjectOfferingId: null,
                              status: 'active',
                              is_active: true,
                              effective_from: '2026-09-01',
                              effective_until: '2027-06-30',
                            },
                          ],
                          error: null,
                        }),
                      }),
                    }),
                  }),
                }),
              }),
            };
          }
          throw new Error(`Unexpected table query: ${table}`);
        },
      };

      const ctx = await resolveAuthorizationContext({ supabaseClient: mockSupabase });
      assert.equal(ctx.activeAssignments.length, 1);
      assert.equal(ctx.activeAssignments[0].assignmentType, 'hod');
      assert.equal(ctx.activeAssignments[0].academicYearId, 'ay-2026-current');
    });
  });

  // --------------------------------------------------------------------------
  // 5. PARENT VERIFIED CHILD RESOLUTION
  // --------------------------------------------------------------------------
  describe('Group 5 — Parent-Student Linkage Resolution', () => {
    test('parent profile populates verifiedChildStudentIds via student_parents', async () => {
      const mockSupabase = {
        auth: {
          getUser: async () => ({
            data: { user: { id: 'usr-parent-1' } },
            error: null,
          }),
        },
        from: (table: string) => {
          if (table === 'profiles') {
            return {
              select: () => ({
                eq: () => ({
                  maybeSingle: async () => ({
                    data: {
                      id: 'usr-parent-1',
                      tenant_id: 'ten-school-1',
                      role: 'parent',
                      is_active: true,
                    },
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === 'parents') {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    maybeSingle: async () => ({
                      data: { id: 'parent-rec-1' },
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === 'student_parents') {
            return {
              select: () => ({
                eq: () => ({
                  eq: async () => ({
                    data: [
                      { student_id: 'student-child-alpha' },
                      { student_id: 'student-child-beta' },
                    ],
                    error: null,
                  }),
                }),
              }),
            };
          }
          throw new Error(`Unexpected table query: ${table}`);
        },
      };

      const ctx = await resolveAuthorizationContext({ supabaseClient: mockSupabase });
      assert.equal(ctx.baseRole, 'parent');
      assert.deepEqual(ctx.verifiedChildStudentIds, [
        'student-child-alpha',
        'student-child-beta',
      ]);
    });
  });
});
