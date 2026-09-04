# Engineering Recommendations

This is the canonical index for substantive recommendations raised by Gemini/Antigravity or other authorized contributors.

## Recommendation contract
Each recommendation uses `REC-####` and records:
- related task
- author
- category
- severity
- problem
- repository evidence
- impact
- alternatives considered
- recommendation
- risk if ignored
- decision required
- status
- ChatGPT disposition
- human decision when required

## Statuses
`PROPOSED`, `UNDER_REVIEW`, `ACCEPTED`, `ACCEPTED_WITH_CHANGES`, `REJECTED`, `DEFERRED`, `ESCALATED_TO_HUMAN`, `IMPLEMENTED`.

Recommendations do not authorize implementation. An accepted recommendation that changes approved scope must be converted into an authorized task or amendment.

## Current recommendations

### REC-0001 — Establish a request-scoped authorized privileged-access pattern

- **Task:** TASK-0004 / TASK-0003
- **Author:** Gemini / Antigravity (Implementation Engineer)
- **Category:** Security & Architectural Hardening / Reliability
- **Severity:** High
- **Status:** ACCEPTED_WITH_CHANGES
- **ChatGPT Disposition:** ACCEPTED_WITH_CHANGES

#### Problem
`createAdminClient()` is instantiated at top-level module scope in server action and API route files, and privileged database access may occur without a clearly enforced request-level authorization boundary.

#### Repository Evidence
1. `src/app/actions/academic-calendar.ts` line 8 contains top-level module instantiation of `createAdminClient()`. Additionally, lines 66–73, 118–119, and 125–133 in `resolveTenantId()` fall back to `SELECT id FROM tenants LIMIT 1` (arbitrary first tenant), directly violating `.ai/AGENTS.md` ("Tenant resolution must fail closed; never select an arbitrary fallback tenant") and risk `R-004`.
2. `src/app/api/admin/exams/route.ts` line 4 instantiates `createAdminClient()` at module level, and lines 7–25 expose a `GET` handler that queries `exam_sessions`, `exam_results_approval`, and `exam_malpractices` across all tenants without request authentication, session verification, role checks, or tenant scoping (violating risk `R-002`).
3. `src/lib/supabase/admin.ts` requires `SUPABASE_SERVICE_ROLE_KEY` during privileged-client creation.
4. `.ai/02-ARCHITECTURE/ARCHITECTURE.md` and `.ai/04-SECURITY/PRIVILEGED-ACCESS.md` require application authorization and treat service-role access as a reviewed exception rather than a replacement for authorization.

#### Impact
- Module-level privileged client creation encourages handlers to use elevated access without a visible request authorization boundary.
- Missing request-level authorization or tenant scoping in `src/app/api/admin/exams/route.ts` exposes confidential examination records across tenants.
- Arbitrary fallback to `LIMIT 1` tenant in `resolveTenantId()` risks cross-tenant data leakage and mutation whenever a caller provides an invalid or missing tenant slug.
- Import-time environment requirements create build/CI fragility where privileged credentials are intentionally unavailable.

#### Alternatives Considered
1. *Lazy module-level singleton:* Rejected because lazy initialization does not establish request authentication or authorization.
2. *Request-scoped privileged client after guards:* Retained as a possible implementation pattern, but only as one component of a multi-layered security boundary.
3. *Centralized authorized privileged-client factory:* Recommended for evaluation if it can enforce or require explicit authenticated actor, tenant, permission, and resource context.

#### ChatGPT Review Correction
Moving `createAdminClient()` into a handler is **not itself an authorization control**. Any remediation must explicitly separate:

1. **Authentication / session verification** (verifying the caller identity via Supabase auth);
2. **Tenant resolution and tenant authorization** (fail-closed resolution without arbitrary tenant fallback);
3. **Role / permission authorization** (validating role membership against operation matrix);
4. **Resource-level scope checks** (ensuring the target object belongs to the verified tenant/actor);
5. **Privileged client creation/use** (instantiated strictly after the authorization gate passes).

The examination API authorization concern is a distinct security issue (`R-002`) and should not be reduced to client-instantiation scope.

The `academic-calendar.ts` tenant-resolution fallback behavior must also be reviewed separately so a privileged operation can never silently select an unrelated/default tenant when the caller tenant cannot be established (`R-004`).

#### Decision Required
Create a dedicated authorized task for the application security remediation after the relevant code paths are fully audited. This recommendation does **not** authorize application changes under TASK-TEST-001.

#### Verification
Second ChatGPT supervisory review required before TASK-TEST-001 can be approved. Application remediation requires a separate authorized task and appropriate cross-tenant/role regression tests.

---

### REC-0002 — Implement Unified API Route Authorization Guard (`authorizeApiRequest`)

- **Task:** TASK-0003 / Proposed TASK-0004
- **Author:** Gemini / Antigravity (Implementation Engineer)
- **Category:** Architecture / Authentication & RBAC
- **Severity:** Critical
- **Status:** PROPOSED
- **ChatGPT Disposition:** PENDING_SUPERVISORY_REVIEW

#### Problem
Next.js edge middleware (`src/middleware.ts`) explicitly excludes `/api/*` routes. Existing authorization helpers in `src/lib/auth/guards.ts` invoke `redirect(...)` (from `next/navigation`), which is suitable only for React Server Component page rendering and causes failures/improper behavior in Next.js Route Handlers. Consequently, API route developers omitted authentication and authorization or wrote brittle, ad-hoc checks.

#### Repository Evidence
1. `src/middleware.ts:113` matcher: `'/((?!api|_next/static...))'`.
2. `src/lib/auth/guards.ts:24, 34, 83, 107` rely on `redirect('/login')` or `redirect('/')`.
3. `/api/admin/exams`, `/api/admissions`, `/api/cass-export`, `/api/exam-office/dashboard`, and `/api/super-admin/leads` lack all authentication and authorization checks.

#### Impact
Anonymous attackers can invoke backend route handlers to exfiltrate cross-tenant data, tamper with applicant and examination data, and perform BOLA/IDOR mutations without detection.

#### Alternatives Considered
1. *Rely solely on Next.js edge middleware:* Excluded because edge middleware runs in the Edge runtime where database calls for profile/role resolution are restricted or add latency.
2. *Ad-hoc checks in every route handler:* Rejected as error-prone, inconsistent, and difficult to audit.
3. *Unified `authorizeApiRequest` helper:* Recommended. A centralized function returning either `{ success: true, user, profile, tenantId }` or `{ success: false, response: NextResponse.json({ error }, { status }) }`.

#### Recommendation
Create `src/lib/auth/api-guard.ts` providing `authorizeApiRequest(req, options)`:
- Authenticates caller using `createClient()` from `@/lib/supabase/server`.
- Resolves caller profile and active status from `profiles`.
- Validates tenant membership against requested tenant slug or ID.
- Enforces role requirements (e.g. `allowedRoles: ['school_admin', 'exam_officer']`).
- Handles `super_admin` platform-wide bypass and `org_admin` parent-child tenant hierarchy.
- Returns standardized JSON 401/403 responses on failure.

#### Risk If Ignored
API routes remain unprotected and vulnerable to unauthorized access and tenant spoofing.

#### Decision Required
Authorization of proposed TASK-0004 to create the API guard module.

---

### REC-0003 — Remediate Unauthenticated Privileged API Routes & Deprecate Module-Level Admin Clients

- **Task:** TASK-0003 / Proposed TASK-0005
- **Author:** Gemini / Antigravity (Implementation Engineer)
- **Category:** Security Remediation
- **Severity:** Critical
- **Status:** PROPOSED
- **ChatGPT Disposition:** PENDING_SUPERVISORY_REVIEW

#### Problem
High-privilege API routes (`/api/admin/exams`, `/api/admissions`, `/api/cass-export`, `/api/exam-office/dashboard`, `/api/super-admin/leads`) instantiate privileged clients (`createAdminClient()` or raw PostgreSQL pools) at module level and expose full cross-tenant data and mutation capabilities to unauthenticated callers.

#### Repository Evidence
1. `src/app/api/admin/exams/route.ts:4` (`const supabase = createAdminClient()`).
2. `src/app/api/admissions/route.ts:4` (`const supabase = createAdminClient()`).
3. `src/app/api/cass-export/route.ts:4` (`const supabase = createAdminClient()`).
4. `src/app/api/exam-office/dashboard/route.ts:4` (`const supabase = createAdminClient()`).
5. `src/app/api/super-admin/leads/route.ts:7` (`new Pool(...)`).

#### Impact
Critical exposure of student records, national exam scores, WAEC Continuous Assessment data, applicant PII, and customer leads.

#### Recommendation
1. Remove all module-level `createAdminClient()` instantiations.
2. Protect all five routes using `authorizeApiRequest`.
3. Restructure `/api/admissions` to separate unauthenticated public applications (`/api/admissions/apply`) with rate limiting and schema validation from administrative applicant management (`/api/admin/admissions`).
4. Enforce strict `WHERE tenant_id = :tenantId` scoping on all queries and mutations.

#### Risk If Ignored
Severe compliance violations (FERPA, GDPR, national data protection laws) and total compromise of student data privacy.

#### Decision Required
Authorization of proposed TASK-0005.

---

### REC-0004 — Enforce Fail-Closed Tenant Resolution & Purge `LIMIT 1` Fallbacks

- **Task:** TASK-0003 / Proposed TASK-0007
- **Author:** Gemini / Antigravity (Implementation Engineer)
- **Category:** Multi-Tenant Isolation
- **Severity:** High
- **Status:** PROPOSED
- **ChatGPT Disposition:** PENDING_SUPERVISORY_REVIEW

#### Problem
In `src/app/actions/academic-calendar.ts` and `src/app/actions/academic-sessions.ts`, helper `resolveTenantId()` executes `SELECT id FROM tenants LIMIT 1` when given undefined, null, or unrecognized tenant identifiers. This silently binds queries and mutations to an arbitrary school.

#### Repository Evidence
1. `src/app/actions/academic-calendar.ts:66–73, 118–119, 125–133`.
2. `src/app/actions/academic-sessions.ts:66–80`.
3. `.ai/AGENTS.md` Line 49: *"Tenant resolution must fail closed; never select an arbitrary fallback tenant"*.

#### Impact
Cross-tenant contamination, data corruption, and unauthorized state mutation when tenant context is missing.

#### Recommendation
1. Remove all `SELECT id FROM tenants LIMIT 1` queries from tenant resolution routines.
2. Return `null` immediately if a tenant slug or ID cannot be verified.
3. Require mutating Server Actions in `academic-calendar.ts` and `subjects.ts` to verify caller authentication and role before executing changes.

#### Risk If Ignored
Violation of core multi-tenant security architecture principles and risk of silent cross-school data corruption.

#### Decision Required
Authorization of proposed TASK-0007.

---

### REC-0005 — Replace Permissive `FOR ALL USING (true)` RLS Policies

- **Task:** TASK-0003 / Proposed TASK-0006
- **Author:** Gemini / Antigravity (Implementation Engineer)
- **Category:** Database Security / RLS
- **Severity:** Critical
- **Status:** PROPOSED
- **ChatGPT Disposition:** PENDING_SUPERVISORY_REVIEW

#### Problem
Migrations `030_exam_core_system.sql` and `031_exam_analytics_dashboard.sql` enable Row Level Security on 10 examination tables but attach policies defined as `FOR ALL USING (true)`.

#### Repository Evidence
1. `supabase/migrations/030_exam_core_system.sql:91–95` (`exam_sessions`, `exam_schedules`, `exam_results_approval`, `exam_malpractices`, `exam_appeals`).
2. `supabase/migrations/031_exam_analytics_dashboard.sql:79–83` (`exam_student_spotlights`, `exam_grade_distributions`, `exam_student_details`, `exam_subject_results`, `exam_subject_averages`).

#### Impact
Any authenticated user connecting directly to the Supabase client with an anon key can read, insert, update, and delete examination records for all schools without going through the Next.js API layer.

#### Recommendation
Author migration `044_fix_exam_rls_policies.sql` to drop the permissive policies and install strict tenant-scoped policies using `tenant_id = public.get_user_tenant_id()`.

#### Risk If Ignored
Defense-in-depth is completely absent at the database layer for the entire examination subsystem.

#### Decision Required
Authorization of proposed TASK-0006.

---

### REC-0006 — Establish Automated Security & Authorization Regression Test Suite

- **Task:** TASK-0003 / Proposed TASK-0008
- **Author:** Gemini / Antigravity (Implementation Engineer)
- **Category:** Quality Assurance & Testing
- **Severity:** High
- **Status:** PROPOSED
- **ChatGPT Disposition:** PENDING_SUPERVISORY_REVIEW

#### Problem
The repository has zero testing frameworks installed (0 unit, integration, or E2E tests). Security fixes cannot be automatically validated or protected against future regressions.

#### Repository Evidence
`package.json` contains no test dependencies or test scripts. No test files exist in `src/`.

#### Impact
High risk of regression as code changes occur across routes, actions, and migrations.

#### Recommendation
Install Vitest and construct an automated security regression test suite covering:
1. 401 Unauthorized for unauthenticated calls to all private API routes.
2. 403 Forbidden for authenticated users attempting cross-tenant access.
3. 403 Forbidden for users attempting unauthorized actions (e.g. students creating exam sessions).
4. IDOR / BOLA attack payload validation.
5. Verification that tenant resolution fails closed.

#### Risk If Ignored
Security posture remains unverified and susceptible to silent regressions.

#### Decision Required
Authorization of proposed TASK-0008.

---

### REC-0007 — Decommission and Remove Unauthenticated Test DB Endpoint (`/api/test-db`)

- **Task:** TASK-0005
- **Author:** Gemini / Antigravity (Implementation Engineer)
- **Category:** Security / Attack Surface Reduction
- **Severity:** High
- **Status:** IMPLEMENTED
- **ChatGPT Disposition:** ACCEPTED (Incorporated in TASK-0005)

#### Problem
`src/app/api/test-db/route.ts` exposed an unauthenticated GET endpoint that executed arbitrary database probes (`SELECT NOW()`) using a direct `pg.Pool` connection, bypassing all authentication, authorization, and tenant isolation layers.

#### Repository Evidence
`src/app/api/test-db/route.ts:1-29` connected directly via `pg.Pool` without middleware or guards.

#### Impact
Information leakage and unnecessary exposure of database infrastructure to anonymous internet traffic.

#### Recommendation
Decommission and completely remove `src/app/api/test-db/route.ts`.

#### Implementation
Executed as part of TASK-0005. File and directory removed. Next.js build output confirms endpoint is no longer present.

---

### REC-0008 — Defer Exam Office Communication Rules and Templates to Dedicated Containment Task

- **Task:** TASK-0005
- **Author:** Gemini / Antigravity (Implementation Engineer)
- **Category:** Security / Scope Management
- **Severity:** Medium
- **Status:** PROPOSED
- **ChatGPT Disposition:** PENDING_SUPERVISORY_REVIEW

#### Problem
Endpoints `src/app/api/exam-office/communication-rules/route.ts` and `src/app/api/exam-office/communication-templates/route.ts` contain unauthenticated handlers and privileged client usage. However, bundling them into TASK-0005 risks scope creep away from the core privileged API containment targets (`admissions`, `cass-export`, `exam-office/dashboard`).

#### Recommendation
Address communication-rules and communication-templates in a dedicated subsequent exam communication security task.

---

### REC-0009 — Defer Notifications API to Dedicated Notification System Review

- **Task:** TASK-0005
- **Author:** Gemini / Antigravity (Implementation Engineer)
- **Category:** Security / Architecture
- **Severity:** Medium
- **Status:** PROPOSED
- **ChatGPT Disposition:** PENDING_SUPERVISORY_REVIEW

#### Problem
`src/app/api/notifications/route.ts` serves both internal system notifications and external alert dispatch. Containing it requires architectural decisions on server-sent events, notification dispatch permissions, and recipient user filtering.

#### Recommendation
Review and harden `/api/notifications` in a dedicated task following the completion of privileged API containment.

