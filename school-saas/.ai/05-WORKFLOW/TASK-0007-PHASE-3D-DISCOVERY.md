# TASK-0007 Phase 3D: Architecture & Security Discovery Report and Proposed Charter

**Task:** `TASK-0007-PHASE-3D`  
**Status:** DISCOVERY COMPLETE · AWAITING SUPERVISORY REVIEW & CHARTER APPROVAL  
**Author:** Gemini / Antigravity (Implementation Engineer)  
**Supervisory Authority:** ChatGPT (Chief Software Architect) / Human Project Owner  
**Date:** 2026-09-09  

---

## 1. Context & Authority Boundary

Following the successful merge and verification of **TASK-0007 Phase 3C Cohort 4** on `main` (commit `2727b38`, PR #19), the supervisory directive authorized a **read-only discovery and architecture assessment for Phase 3D**.

No product code or migration changes are authorized under this milestone. This document reports the complete repository audit across all seven supervisory focus areas and proposes a structured 5-cohort charter for Phase 3D implementation.

---

## 2. Exhaustive Discovery Findings

### 2.1 Remaining API Authorization Gaps
The repository contains 23 Next.js Route Handlers (`route.ts`). Their current security classification:

| Route | Methods | Current Guarding | Vulnerability / Gap Classification |
|---|---|---|---|
| `/api/admissions` | GET, POST, PATCH | Canonical Guard (`admissions.applicants.*`) | Remediated in Phase 3C Cohort 2 |
| `/api/admissions/[id]` | GET, PATCH | Canonical Guard (`admissions.applicants.*`) | Remediated in Phase 3C Cohort 2 |
| `/api/admissions/[id]/approve` | POST | Canonical Guard (`admissions.applicants.approve`) | Remediated in Phase 3C Cohort 2 |
| `/api/admissions/[id]/enroll` | POST | Canonical Guard + Service-role RPC | Remediated in Phase 3C Cohorts 2 & 4 |
| `/api/admissions/[id]/evaluate` | POST | Canonical Guard (`admissions.applicants.evaluate`) | Remediated in Phase 3C Cohort 2 |
| `/api/admissions/[id]/letter` | POST | Canonical Guard (`admissions.letters.dispatch`) | Remediated in Phase 3C Cohort 2 |
| `/api/admissions/[id]/place` | POST | Canonical Guard (`admissions.applicants.place`) | Remediated in Phase 3C Cohort 2 |
| `/api/admissions/[id]/reject` | POST | Canonical Guard (`admissions.applicants.manage`) | Remediated in Phase 3C Cohort 2 |
| `/api/admin/exams` | GET, PATCH | Canonical Guard (`exams.sessions.manage`) | Protected in Phase 3B |
| `/api/cass-export` | GET | Canonical Guard (`exams.cass.export`) | Guarded, but suffers from REC-0010 data fabrication |
| `/api/exam-office/dashboard` | GET, POST, PATCH, DELETE | Legacy Role Array (`school_admin`, `exam_officer`, `super_admin`) | GAP: Does not use canonical permissions |
| `/api/exam-office/communications` | GET, POST | Legacy Role Array (`roles: [...]`) | GAP-3B-01: Deferred to dedicated charter |
| `/api/super-admin/leads` | GET, PATCH, POST | Legacy Role Array (`roles: ['super_admin']`) | GAP: Does not use `platform.tenants.manage`, uses raw `getPgPool()` |
| `/api/academics/ai/lesson-plan` | POST | `supabase.auth.getUser()` only | **CRITICAL:** No tenant check, no role check, queries `getPgPool()`. Bypasses `curriculum.lesson_plan.generate`. |
| `/api/notifications` | GET, POST | `supabase.auth.getUser()` only | **VULNERABLE:** Direct `createAdminClient()` self-service, no guard. |
| `/api/exam-office/communication-rules` | GET, POST | `supabase.auth.getUser()` only | **CRITICAL:** Trusts `user_metadata.tenant_id`. Cross-tenant rule leakage. Direct `createAdminClient()`. |
| `/api/exam-office/communication-templates` | GET, POST | `supabase.auth.getUser()` only | **CRITICAL:** Trusts `user_metadata.tenant_id`. Cross-tenant template leakage. Direct `createAdminClient()`. |
| `/api/public/check-slug` | GET | Public Endpoint | Legitimate public endpoint |
| `/api/public/demo-requests` | POST | Public Endpoint | Legitimate public endpoint |
| `/api/public/landing-sections` | GET | Public Endpoint | Legitimate public endpoint |
| `/api/public/register-tenant` | POST | Public Endpoint | Legitimate public tenant self-registration |
| `/api/public/tenants` | GET | Public Endpoint | Legitimate public tenant directory |
| `/api/auth/callback` | GET | OAuth Callback | Legitimate Supabase Auth callback handler |

### 2.2 Server Actions Security & Privilege Boundary
There are **22 Server Action files** across `src/app/`. Key vulnerabilities identified:
1. **Zero Canonical Engine Usage:** Not a single Server Action currently calls `evaluateAuthorization()` or resolves `TrustedSecurityContext`.
2. **Missing Authentication (`getUser()`):**
   - `src/app/[tenant]/admin/students/actions.ts` (`addStudent`): Creates standard Supabase client, extracts `tenant` from FormData, but **never checks session authentication**. Unauthenticated callers can insert student records into any tenant.
   - `src/app/[tenant]/admin/teachers/actions.ts` (`addTeacher`): Never checks `getUser()`. Unauthenticated insertion.
   - `src/app/[tenant]/admin/parents/actions.ts` (`createParent`): Never checks `getUser()`. Unauthenticated insertion and student linkage.
   - `src/app/[tenant]/admin/classes/actions.ts` (`addClass`, `addSection`): Never checks `getUser()`. Unauthenticated mutation.
   - `src/app/actions/subjects.ts`: Has zero references to `auth` or `user`. Mutations execute via raw `getPgPool()` or `createAdminClient()`.
   - `src/app/actions/curriculum.ts`: Has zero references to `auth` or `user`. Executes raw SQL via `getPgPool()`.
   - `src/app/actions/offerings.ts`: Has zero references to `auth` or `user`. Executes raw SQL via `getPgPool()`.
3. **Missing Authorization / Privilege Escalation:**
   - `src/app/[tenant]/admin/bursary/actions.ts` (`bursaryVerifyAndClearPayment`): Calls `getUser()`, but does not verify that the user exists or is an authorized bursar/admin. Any authenticated user (including an applicant or student) can clear fees and generate receipts.
   - `src/app/actions/approvals.ts` (`resolveApprovalRequest`, `deleteApprovalRequest`): Calls `getUser()`, but does not verify roles or permissions.
4. **Arbitrary Fallback Tenant Selection (`R-004`):**
   - `src/app/actions/academic-calendar.ts`: Module-level `const supabaseAdmin = createAdminClient()`. In `resolveTenantId()`, lines 66–72 and 118 fall back to `SELECT id FROM tenants LIMIT 1` (arbitrary first tenant), risking cross-tenant corruption when slug is omitted.

### 2.3 Frontend Authorization Migration
1. **Primitive String Checks:** The frontend exclusively relies on checking string literals: `profile.role === 'admin'`, `role === 'teacher'`, or checking role arrays.
2. **Missing Capability Derivation:** The UI does not derive visibility from canonical permissions. There is no server-component helper `can(permission, target)` or client-side hook `useCan(permission)`.
3. **Simulated Mock Workflows:**
   - Marks Entry: `src/app/[tenant]/admin/academics/examinations/marks/page.tsx` uses hardcoded `mockStudentsMarks`.
   - Approvals: `src/app/[tenant]/admin/academics/examinations/approval/page.tsx` uses hardcoded `mockApprovals`.
   - Publish: `src/app/[tenant]/admin/academics/examinations/publish/page.tsx` uses hardcoded `mockPubs`.
4. **Conflation of UI Gating with Security:** Because buttons were hidden based on role, developers omitted backend authorization guards on Server Actions, leaving them vulnerable to direct invocation over the network.

### 2.4 Database Row Level Security (RLS) Convergence
1. **Permissive Institutional Policies:**
   - `approval_requests`: Policy `school_members_see_own_requests` grants `FOR ALL` to any user in the tenant. Students and parents can insert, update, or delete approval requests.
   - `applicants`: Policies for `[DELETE]` and `[INSERT]` are granted to `public`, permitting any tenant user to delete applicants.
2. **Disabled RLS:**
   - `cms_media`, `cms_pages`, `cms_plugins`, `cms_settings`, and `landing_page_sections` have RLS completely disabled (`rowsecurity: false`).
3. **Dead Policy:**
   - `040_academic_calendar_events.sql` references non-existent tables `public.user_roles` and `public.roles` (`REC-0015`).

### 2.5 Segregation of Duties (SoD) Operationalization
1. **Engine Level:** The Phase 3A Canonical Authorization Engine (`authorization-engine.ts:457-513`) fully implements:
   - `SOD_SELF_MODERATION_BLOCKED`: Prohibits an actor from moderating results they submitted (`target.submitterId === context.actorId`).
   - `SOD_SELF_APPROVAL_BLOCKED`: Prohibits an actor from approving results they submitted.
   - `SOD_STAGE_RESTRICTION`: Restricts assistant teachers to draft stage.
2. **Operational Reality:** Because examination pages are client-side mockups with no backend API routes or Server Actions for marks entry and moderation, these SoD protections are currently dormant in the engine.

### 2.6 Open Data Integrity Issues (REC-0010) & Direct Database Paths
1. **REC-0010 (CASS Synthetic Mark Generation):**
   `/api/cass-export/route.ts` lines 58–74 fabricates candidate continuous assessment marks mathematically:
   ```ts
   const ca1 = 8.5 + (i % 2);
   const ca2 = 9.0 - (i % 1.5);
   const ca3 = 8.8 + (i % 1.2);
   const exam = 52.0 + ((i * 3) % 25);
   ```
   This synthetic generation was written as a prototype for the MBSSE 30/70 formula and CSV formatting. It must be replaced with queries against real continuous assessment mark records in `exam_subject_results`.
2. **Un-Scoped `getPgPool()` Usage:** Direct pool queries run in 8 Server Action files and 4 API routes, bypassing all RLS and tenant scoping.

### 2.7 Permission Architecture Stability
1. The 39 canonical permissions from Phase 3A / 3C Cohort 1 remain frozen.
2. **Architectural Gap:** Communications and Notifications have **zero permissions** in the 39-permission registry.
   - `GAP-3B-01` deferred `/api/exam-office/communications`.
   - To maintain strict registry discipline without ad-hoc permissions, Phase 3D must author **ADR-0004** to formally define canonical communications permissions under supervisory review, OR map communications to platform/school administration.

---

## 3. Proposed Phase 3D Implementation Charter

To manage complexity and ensure zero regressions across the 283-test baseline, Phase 3D is structured into five sequential cohorts:

```text
Phase 3D Discovery (Complete)
        │
        ▼
Cohort 3D-1: API Route Authorization Completion & Leakage Containment
        │
        ▼
Cohort 3D-2: Server Actions Security & Authorization Boundary
        │
        ▼
Cohort 3D-3: Examination Workflow & SoD Pipeline (Resolving REC-0010)
        │
        ▼
Cohort 3D-4: Frontend Authorization Framework & UI Capability Derivation
        │
        ▼
Cohort 3D-5: Database RLS Convergence & Table Hardening
```

### Cohort 3D-1: API Route Authorization Completion & Leakage Containment
- **Scope:**
  1. Secure `/api/academics/ai/lesson-plan`: Guard with canonical permission `curriculum.lesson_plan.generate`, enforce offering tenant resolution, remove raw `getPgPool()` bypass.
  2. Secure `/api/super-admin/leads`: Guard with canonical permission `platform.tenants.manage`.
  3. Secure `/api/exam-office/dashboard`: Align with canonical exam permissions (`exams.sessions.manage`, `exams.results.view`).
  4. Author **ADR-0004** (Communications & Notifications Authorization) to formally extend the canonical registry with supervisory approval (`communications.broadcast.manage`, `communications.templates.manage`, `notifications.self.view`), remediating `/api/exam-office/communications`, `/api/exam-office/communication-rules`, `/api/exam-office/communication-templates`, and `/api/notifications`.

### Cohort 3D-2: Server Actions Security & Authorization Boundary
- **Scope:**
  1. Create a unified, request-safe Server Action guard: `authorizeServerAction({ permission, scope, requestedTenantSlug, resolveResource })` integrating directly with `evaluateAuthorization()`.
  2. Secure core mutations:
     - `students/actions.ts`: Enforce `students.records.manage`.
     - `teachers/actions.ts`: Enforce `staff.accounts.manage`.
     - `parents/actions.ts`: Enforce `students.records.manage`.
     - `classes/actions.ts`: Enforce school admin.
     - `bursary/actions.ts`: Enforce `finance.invoices.manage` (preventing unauthorized self-clearance).
  3. Fix `academic-calendar.ts`: Eliminate arbitrary `LIMIT 1` tenant fallback, remove module-level `createAdminClient()`, enforce fail-closed tenant resolution.
  4. Secure `subjects.ts`, `curriculum.ts`, and `offerings.ts` against unauthenticated direct `getPgPool()` access.

### Cohort 3D-3: Examination Workflow & SoD Pipeline (Resolving REC-0010)
- **Scope:**
  1. Author dedicated API route/actions for marks entry (`exams.results.enter`) and marks moderation (`exams.results.moderate`) backed by `exam_subject_results`.
  2. Wire runtime SoD enforcement: Verify `SOD_SELF_MODERATION_BLOCKED` and `SOD_SELF_APPROVAL_BLOCKED` prevent self-moderation and self-approval on live marks submissions.
  3. Resolve **REC-0010**: Connect `/api/cass-export/route.ts` to real marks in `exam_subject_results`, computing authentic 30% CA + 70% Final Exam aggregates and eliminating synthetic mathematical score generation.

### Cohort 3D-4: Frontend Authorization Framework & UI Capability Derivation
- **Scope:**
  1. Implement Server Component helper: `can(permission, resourceTarget)` returning boolean.
  2. Implement Client Context & Hook: `<AuthorizationProvider capabilities={...}>` and `useCan(permission)`.
  3. Replace raw role string comparisons (`profile.role === 'admin'`) across navigation menus and action buttons with capability-driven rendering.
  4. Connect live data hooks to `marks/page.tsx`, `approval/page.tsx`, and `publish/page.tsx`, eliminating mock client state.

### Cohort 3D-5: Database RLS Convergence & Table Hardening
- **Scope:**
  1. Migration authoring: Remediate permissive `approval_requests` policy (`FOR ALL` -> role-specific operations).
  2. Tighten `applicants` DELETE/INSERT policies.
  3. Enable RLS and author tenant policies for `cms_*` tables.
  4. Clean up dead policy referencing non-existent `user_roles` in `040_academic_calendar_events.sql` (`REC-0015`).
  5. Author dedicated non-service-role PostgreSQL RLS regression tests.

---

## 4. Acceptance Gates for Phase 3D

1. **Zero Unauthenticated Endpoints:** Every non-public Route Handler and Server Action requires verified authentication.
2. **Zero Arbitrary Fallbacks:** Every tenant lookup fails closed without arbitrary `LIMIT 1` selection.
3. **Zero Ad-Hoc Permissions:** Every operation evaluates a permission registered in the canonical catalog.
4. **Real CASS Data:** No synthetic mathematical formulas generate continuous assessment marks.
5. **Verified SoD:** Negative tests prove teachers cannot moderate or approve their own submitted marks.
6. **Full Regression:** 100% pass across all existing 283 regression tests and new security suites.
