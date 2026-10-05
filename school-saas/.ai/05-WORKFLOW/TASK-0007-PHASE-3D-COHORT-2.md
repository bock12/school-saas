# TASK-0007 Phase 3D Cohort 3D-2 — Server Actions Security & Authorization Boundary

**Status:** AUTHORIZED  
**Priority:** CRITICAL  
**Supervisor:** ChatGPT  
**Implementation:** Gemini / Antigravity  
**Parent:** TASK-0007  
**Depends on:** Phase 3D Cohort 3D-1 merged on main; canonical 46-permission registry; Phase 3A authorization engine  
**Implementation branch:** `ai-eos/task-0007-phase-3d-cohort-2-server-actions`

## Objective

Establish a single request-safe authorization boundary for Next.js Server Actions and remove the remaining unauthenticated, unauthorized, arbitrarily tenant-resolved, and direct privileged database mutation paths identified by Phase 3D discovery.

## Scope

1. Implement reusable `authorizeServerAction({ permission, scope, requestedTenantSlug, resolveResource })` integrated with `evaluateAuthorization()` and trusted security context.
2. Secure:
   - `src/app/[tenant]/admin/students/actions.ts` — `students.records.manage`
   - `src/app/[tenant]/admin/teachers/actions.ts` — `staff.accounts.manage`
   - `src/app/[tenant]/admin/parents/actions.ts` — `students.records.manage`
   - `src/app/[tenant]/admin/classes/actions.ts` — canonical school-administration permission appropriate to each mutation
   - `src/app/[tenant]/admin/bursary/actions.ts` — `finance.invoices.manage`
3. Remediate `src/app/actions/academic-calendar.ts`: remove arbitrary `LIMIT 1` tenant fallback, module-level privileged client, and fail-open tenant resolution.
4. Secure `src/app/actions/subjects.ts`, `curriculum.ts`, and `offerings.ts` against unauthenticated direct `getPgPool()`/privileged-client mutation.
5. Inspect adjacent security-critical actions such as `src/app/actions/approvals.ts`; remediate only when clearly within this boundary, otherwise record a follow-up.

## Security requirements

- Zero unauthenticated mutations in scope.
- Zero arbitrary tenant fallback or client-controlled tenant rebinding.
- Zero privilege escalation through direct Server Action invocation.
- Canonical permissions only; no ad-hoc role strings.
- Server-side tenant isolation must remain compatible with RLS.
- Privileged clients/raw PostgreSQL are reachable only after successful authorization.
- Never trust `user_metadata`, form fields, URL parameters, or hidden UI state as authoritative authorization data.
- Fail closed on absent, inactive, ambiguous, or mismatched security context.

## Required tests

Prove: unauthenticated denial; authenticated-but-unauthorized denial; authorized success; foreign-tenant denial; forged tenant cannot rebind; missing tenant fails closed; privileged DB access is not reached on denied paths; bursary clearing is protected; academic calendar never selects an arbitrary tenant; existing authorization/tenant-isolation suites remain green.

Run the full repository test suite, TypeScript check, and production build.

## Acceptance criteria

- Every in-scope Server Action has explicit authentication and canonical authorization.
- `authorizeServerAction()` is reusable and uses the canonical engine.
- No arbitrary `LIMIT 1` tenant fallback remains in targeted paths.
- No unauthenticated direct `getPgPool()` mutation remains in targeted actions.
- No privileged client is created before authorization succeeds.
- Cross-tenant and privilege-escalation negative tests pass.
- Existing tests, typecheck, and build pass.
- No unrelated feature changes.
- Implementation report records exact files, permissions, evidence, commands/results, residual risks, and deferred findings.

**Deferred:** Frontend capability hooks/component gates belong to Phase 3D Cohort 3D-4 and are not part of this task.
