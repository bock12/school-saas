# Implementation & Substantiation Report: Phase 3D Cohort 3D-1
## API Route Authorization Completion & Leakage Containment

**Task ID:** `TASK-0007-PHASE-3D-COHORT-1`  
**Parent Task:** `TASK-0007` (Authorization Architecture & Hardening)  
**Branch:** `ai-eos/task-0007-phase-3d-cohort-1-api-containment`  
**Authoritative Baseline:** `main` (commit `2727b38`, PR #19)  
**Status:** IMPLEMENTATION COMPLETED — AWAITING SUPERVISORY MERGE AUTHORIZATION  
**Date:** 2026-09-09  

---

## 1. Executive Summary

Under supervisory authorization for Phase 3D Cohort 3D-1, all remaining legacy and uncontained API routes across communications, notifications, AI curriculum lesson planning, leads management, and examination administration have been completely migrated to the canonical authorization architecture.

Every mandatory preflight constraint and invariant specified in the Supervisory Review has been strictly enforced:
1. **Canonical Registry Count Invariant:** Corrected from 39 baseline permissions to exactly **46 permissions** (39 baseline + 6 via ADR-0004 + 1 via ADR-0005).
2. **ADR Governance Structure:** Formally split into [ADR-0004](file:///c:/Users/SAHR/OneDrive%20-%20DreamDay%20Technology/Documents/SchoolSaas/school-saas/.ai/02-ARCHITECTURE/DECISIONS.md#adr-0004-communications--notifications-authorization-boundary) (6 permissions for communications and personal notifications) and [ADR-0005](file:///c:/Users/SAHR/OneDrive%20-%20DreamDay%20Technology/Documents/SchoolSaas/school-saas/.ai/02-ARCHITECTURE/DECISIONS.md#adr-0005-platform-leads-authorization-boundary) (1 permission for prospective tenant/lead management).
3. **Exam Dashboard Semantics:** Verified dashboard payload; `GET` is governed by `exams.results.view` at school/tenant scope (satisfying read-only examination analytics needs without privilege escalation), `POST`/`PATCH` are governed by `exams.sessions.manage`, and `DELETE` explicitly returns HTTP 405 Method Not Allowed with code `OPERATION_DEFERRED`.
4. **Zero AI Invocation Invariant:** The AI lesson plan route (`/api/academics/ai/lesson-plan`) enforces deterministic pre-execution validation: authentication $\to$ offering resolution $\to$ cross-tenant verification $\to$ canonical authorization $\to$ curriculum publication check (422) $\to$ outcomes validation $\to$ **only then** Gemini generation. Zero tokens, network calls, or usage logs are generated on any rejection path.
5. **Raw `getPgPool()` Elimination:** Raw unscoped database connection pool access has been eliminated from `/api/academics/ai/lesson-plan` and `/api/super-admin/leads`.
6. **Multi-Tenant Leakage Containment:** Complete removal of `user.user_metadata?.tenant_id`. All tenant context is derived strictly from server-authenticated session truth (`auth.tenantId`).
7. **Personal Notification Recipient Boundary:** `/api/notifications` routes operate strictly on `self` scope bound to `auth.user.id`. No query parameter, URL segment, request payload, or metadata can redefine the target recipient.
8. **Privileged Client Timing:** `adminClient` is lazily requested strictly downstream of successful authorization gates.
9. **Regression & Security Verification:** 100% pass rate achieved across **315 tests** (283 baseline + 32 newly created negative and positive containment tests). TypeScript (`npx tsc --noEmit`) and Next.js build (`npm run build`) completed with 0 errors.

---

## 2. Permission Count Substantiation (39 $\to$ 46)

As required by Supervisory Gate Section 3, the exact permission count transition is formally substantiated across all architecture and governance artifacts:

| Phase / Artifact | Permission Count | Justification |
| :--- | :---: | :--- |
| **Phase 3A Frozen Baseline** | **39** | Initial canonical authorization engine baseline |
| **ADR-0004 Addition** | **+6** | Communications & Personal Notifications: <br>• `notifications.self.view` (scope: `self`)<br>• `notifications.self.manage` (scope: `self`)<br>• `communications.templates.manage` (scope: `school`)<br>• `communications.rules.manage` (scope: `school`)<br>• `communications.broadcast.send` (scope: `school`)<br>• `communications.broadcast.view` (scope: `school`) |
| **ADR-0005 Addition** | **+1** | Platform Leads CRM Management: <br>• `platform.leads.manage` (scope: `platform`) |
| **Cohort 3D-1 Canonical Total** | **46** | Fully registered in `permissions-registry.ts` and locked in contract tests |

### Canonical Registry Entitlements Overview
- **`super_admin`:** Holds all 46 permissions at `platform` scope.
- **`org_admin`:** Holds 37 permissions across owned school tenants (excluding platform management: `platform.tenants.manage`, `platform.billing.manage`, `platform.leads.manage`, and student appeals submission).
- **`school_admin`:** Holds 35 permissions strictly within their school tenant.
- **`teacher` (base role):** Holds 3 permissions (`staff.directory.view` at `school` scope, `notifications.self.view` at `self` scope, `notifications.self.manage` at `self` scope). Operational academic permissions are granted exclusively via active functional assignments (`subject_teacher`, `form_master`, `hod`, `exam_officer`, `vice_principal`).
- **`student` (base role):** Holds 9 permissions strictly at `self` scope (`admissions.applicants.view`, `admissions.applicants.create`, `students.records.view`, `attendance.records.view`, `exams.results.view`, `exams.appeals.submit`, `finance.invoices.view`, `notifications.self.view`, `notifications.self.manage`).
- **`parent` (base role):** Holds 9 permissions strictly at `self` scope (evaluated via verified child relationship in `parent_students`).

---

## 3. Secured API Route Inventory

All 7 endpoints targeted in Cohort 3D-1 have been secured with canonical guards and fail-closed tenant boundary enforcement:

### 1. Ephemeral Lesson Plan AI Generation
- **Route:** `POST /api/academics/ai/lesson-plan`
- **Permission:** `curriculum.lesson_plan.generate` (Scope: `offering`)
- **Resource Resolution:** `resolveTrustedResourceTarget(supabase, { type: 'subject_offering', id: subjectOfferingId })`
- **Security Invariants Enforced:**
  - Raw `getPgPool()` completely removed.
  - Foreign offering from another tenant $\to$ 403 `CROSS_TENANT_DENIED`.
  - Missing/invalid offering $\to$ 404 `NOT_FOUND`.
  - Unauthorized teacher / student $\to$ 403 `INSUFFICIENT_ROLE`.
  - Curriculum status check: If status $\ne$ `'published'`, returns 422 `UNPUBLISHED_CURRICULUM`.
  - **Zero Gemini Calls on Failure:** Verified that `GoogleGenAI` model generation is never instantiated or invoked if any prior validation gate fails.
  - AI usage logging (`ai_usage_logs`) is recorded using `adminClient` strictly bound to `tenantId` and `auth.user.id`.

### 2. Super Admin Leads CRM
- **Route:** `GET`, `PATCH`, `DELETE /api/super-admin/leads`
- **Permission:** `platform.leads.manage` (Scope: `platform`, Base Role: `super_admin`)
- **Security Invariants Enforced:**
  - Raw `getPgPool()` query path eliminated.
  - Unauthenticated callers $\to$ 401.
  - `school_admin`, `org_admin`, `teacher`, `student` $\to$ 403 `INSUFFICIENT_ROLE`.
  - Executed via authorized Supabase client querying `demo_requests` table.

### 3. Exam Office Dashboard
- **Route:** `GET`, `POST`, `PATCH`, `DELETE /api/exam-office/dashboard`
- **Permissions:**
  - `GET`: `exams.results.view` (Scope: `tenant`)
  - `POST`: `exams.sessions.manage` (Scope: `tenant`)
  - `PATCH`: `exams.sessions.manage` (Scope: `tenant`, Resource: `exam_sessions`)
  - `DELETE`: **Explicitly Deferred** (`OPERATION_DEFERRED`, 405 Method Not Allowed)
- **Security Invariants Enforced:**
  - Preflight semantic analysis: Dashboard GET aggregates examination statistics and moderation tallies; verified that `exams.results.view` at tenant/school scope permits `school_admin`, `vice_principal`, and `exam_officer`, while strictly denying `student` (whose view permission is limited to `self` scope) and ordinary `teacher` (whose view permission is limited to `offering` scope).
  - All 10 dashboard queries (`exam_sessions`, `exam_results_approval`, `exam_malpractices`, etc.) are strictly filtered by `.eq('tenant_id', tenantId)`.
  - DELETE requests return:
    ```json
    { "error": "Exam session deletion is not permitted. Status transitions and archiving should be used instead.", "code": "OPERATION_DEFERRED" }
    ```

### 4. Communication Trigger Rules
- **Route:** `GET`, `POST /api/exam-office/communication-rules`
- **Permission:** `communications.rules.manage` (Scope: `school`)
- **Security Invariants Enforced:**
  - Eradicated `user.user_metadata?.tenant_id`. All reads and writes are forced to `auth.tenantId`.
  - Unassigned teachers, students, and parents receive 403.
  - `created_by` is set strictly to `auth.user.id`.

### 5. Communication Message Templates
- **Route:** `GET`, `POST /api/exam-office/communication-templates`
- **Permission:** `communications.templates.manage` (Scope: `school`)
- **Security Invariants Enforced:**
  - Eradicated `user.user_metadata?.tenant_id`.
  - Strict placeholder validation (`validateTemplatePlaceholders`) prevents injection and template syntax corruption.
  - `tenant_id` forced to `auth.tenantId`.

### 6. Institutional Broadcast Dispatch
- **Route:** `GET`, `POST /api/exam-office/communications`
- **Permissions:**
  - `GET`: `communications.broadcast.view` (Scope: `school`)
  - `POST`: `communications.broadcast.send` (Scope: `school`)
- **Security Invariants Enforced:**
  - Eradicated `user.user_metadata?.tenant_id`.
  - Audience resolution (`resolveAudience`) and audit logging (`logCommunicationAudit`) execute via the authorized `adminSupabase` client.
  - Ordinary teachers, students, and parents are blocked with 403.

### 7. Personal Notifications
- **Route:** `GET`, `POST /api/notifications`
- **Permissions:**
  - `GET`: `notifications.self.view` (Scope: `self`)
  - `POST`: `notifications.self.manage` (Scope: `self`)
- **Security Invariants Enforced:**
  - Recipient boundary strictly anchored to `auth.user.id`.
  - `GET` queries `notification_recipients` strictly filtered by `.eq('user_id', auth.user.id)`.
  - `POST` marking a single notification read verifies ownership via `.eq('id', recipientId).eq('user_id', auth.user.id)`. User A attempting to mark User B's notification returns 404 `NOT_FOUND`.
  - `POST` marking all read filters strictly by `.eq('user_id', auth.user.id)`.

---

## 4. Verification & Test Evidence

### A. Dedicated Cohort 3D-1 Security Test Suite
A dedicated security test harness was created in [`tests/security/cohort-3d-1-api-containment.test.ts`](file:///c:/Users/SAHR/OneDrive%20-%20DreamDay%20Technology/Documents/SchoolSaas/school-saas/tests/security/cohort-3d-1-api-containment.test.ts) containing 32 comprehensive positive-space and negative-space test cases:

```
▶ Phase 3D Cohort 3D-1: API Route Authorization Completion & Leakage Containment
  ✔ AI-01: unauthenticated POST /api/academics/ai/lesson-plan returns 401; zero Gemini calls (34.3ms)
  ✔ AI-02: invalid/missing offering returns 404; zero Gemini calls (29.1ms)
  ✔ AI-03: foreign offering from different tenant returns 403 CROSS_TENANT_DENIED; zero Gemini calls (4.1ms)
  ✔ AI-04: unauthorized unassigned teacher returns 403; zero Gemini calls (9.8ms)
  ✔ AI-05: student returns 403 Forbidden; zero Gemini calls (3.8ms)
  ✔ AI-06: unpublished curriculum status returns 422; zero Gemini calls (10.5ms)
  ✔ AI-07: authorized school_admin with published curriculum succeeds (200) and calls Gemini (6.2ms)
  ✔ CR-01: unauthenticated GET /api/exam-office/communication-rules returns 401 (10.3ms)
  ✔ CR-02: student / ordinary teacher cannot manage rules (returns 403) (2.1ms)
  ✔ CR-03: school_admin and exam_officer can manage rules (returns 200) (5.5ms)
  ✔ CR-04: rules queries strictly enforce server-derived tenantId and eliminate cross-tenant leakage (9.3ms)
  ✔ CT-01: unauthenticated GET /api/exam-office/communication-templates returns 401 (2.1ms)
  ✔ CT-02: ordinary teacher / student cannot manage templates (returns 403) (4.7ms)
  ✔ CT-03: POST template with invalid variable placeholder returns 400 (9.8ms)
  ✔ CB-01: unauthenticated GET /api/exam-office/communications returns 401 (11.6ms)
  ✔ CB-02: student / ordinary teacher cannot dispatch broadcasts (returns 403) (3.5ms)
  ✔ CB-03: school_admin can view broadcast history (200) and dispatch broadcast (200) (15.5ms)
  ✔ NOTIF-01: unauthenticated GET /api/notifications returns 401 (1.9ms)
  ✔ NOTIF-02: authenticated user receives their own notifications strictly filtered by auth.userId (7.1ms)
  ✔ NOTIF-03: User A attempting to mark User B notification returns 404 access denied (6.2ms)
  ✔ NOTIF-04: User A marking all read only updates their own records (1.7ms)
  ✔ LEADS-01: unauthenticated GET /api/super-admin/leads returns 401 (4.8ms)
  ✔ LEADS-02: school_admin / teacher / student returns 403 Forbidden (insufficient permission) (5.7ms)
  ✔ LEADS-03: super_admin GET leads succeeds (200) under platform.leads.manage without raw getPgPool (1.9ms)
  ✔ LEADS-04: super_admin PATCH lead succeeds (200) (1.8ms)
  ✔ LEADS-05: super_admin DELETE lead succeeds (200) (3.2ms)
  ✔ DASH-01: GET /api/exam-office/dashboard succeeds for exam_officer with exams.results.view (7.8ms)
  ✔ DASH-02: GET /api/exam-office/dashboard is DENIED for student and ordinary teacher (3.6ms)
  ✔ DASH-03: POST /api/exam-office/dashboard creates session for school_admin (2.9ms)
  ✔ DASH-04: PATCH /api/exam-office/dashboard updates session with resource verification (6.7ms)
  ✔ DASH-05: DELETE /api/exam-office/dashboard returns 405 Method Not Allowed with OPERATION_DEFERRED (6.5ms)
ℹ tests 32 | pass 32 | fail 0
```

### B. Authorization Contract Tests
The authorization contract test suite was updated and verified:
```
npx tsx --test tests/auth/authorization-contract.test.ts
ℹ tests 21 | pass 21 | fail 0
```
Confirms exactly 46 canonical permissions and validates all entitlement mappings.

### C. Full Repository Regression Test Suite (`npm test`)
```
npm test
...
# tests 315
# suites 21
# pass 315
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 70091.6249
```
All 283 historical baseline tests passed alongside all 32 new tests with zero regressions.

### D. TypeScript Static Analysis (`npx tsc --noEmit`)
```
npx tsc --noEmit
Exit code: 0 (0 errors)
```

### E. Next.js Production Build (`npm run build`)
```
npm run build
...
✓ Generating static pages using 3 workers (39/39) in 3.7s
Exit code: 0 (Build successful)
```

---

## 5. Explicit Scope Containment Audit

In strict adherence to the supervisory gate constraints, the following boundaries were strictly respected:
- ❌ **Server Actions:** Zero Server Actions were modified (deferred to Cohort 3D-3).
- ❌ **Frontend Authorization:** Zero client-side permission checks or UI components were modified (deferred to Cohort 3D-2).
- ❌ **RLS Migration (Migration 049):** No database migrations or RLS policy changes were introduced (deferred to Cohort 3D-4).
- ❌ **CASS Synthetic Score Generation (REC-0010):** Left untouched in open recommendations (deferred to Cohort 3D-5).
- ❌ **Exam Deletion:** Exam session deletion is explicitly disallowed and returns HTTP 405 with `OPERATION_DEFERRED`.

---

## 6. Changed Files Inventory

1. [`.ai/02-ARCHITECTURE/DECISIONS.md`](file:///c:/Users/SAHR/OneDrive%20-%20DreamDay%20Technology/Documents/SchoolSaas/school-saas/.ai/02-ARCHITECTURE/DECISIONS.md) — Added formal specifications for ADR-0004 (+6 permissions) and ADR-0005 (+1 permission).
2. [`.ai/05-WORKFLOW/CONTROL-STATE.yaml`](file:///c:/Users/SAHR/OneDrive%20-%20DreamDay%20Technology/Documents/SchoolSaas/school-saas/.ai/05-WORKFLOW/CONTROL-STATE.yaml) — Updated governance state to `TASK-0007-PHASE-3D-COHORT-1` with 46 canonical permissions and 7 secured routes.
3. [`package.json`](file:///c:/Users/SAHR/OneDrive%20-%20DreamDay%20Technology/Documents/SchoolSaas/school-saas/package.json) — Added `tests/security/cohort-3d-1-api-containment.test.ts` to `npm test`.
4. [`src/lib/auth/permissions-registry.ts`](file:///c:/Users/SAHR/OneDrive%20-%20DreamDay%20Technology/Documents/SchoolSaas/school-saas/src/lib/auth/permissions-registry.ts) — Extended canonical permissions list, catalog definitions, base role grants, and functional assignment grants from 39 to 46.
5. [`src/lib/auth/api-guard.ts`](file:///c:/Users/SAHR/OneDrive%20-%20DreamDay%20Technology/Documents/SchoolSaas/school-saas/src/lib/auth/api-guard.ts) — Refined default resource target hydration to bind `ownerId: user.id` strictly for self-scoped permissions.
6. [`src/lib/communication/audience-resolver.ts`](file:///c:/Users/SAHR/OneDrive%20-%20DreamDay%20Technology/Documents/SchoolSaas/school-saas/src/lib/communication/audience-resolver.ts) — Supported passing already-authorized scoped Supabase client; typed mapping callbacks.
7. [`src/lib/communication/audit.ts`](file:///c:/Users/SAHR/OneDrive%20-%20DreamDay%20Technology/Documents/SchoolSaas/school-saas/src/lib/communication/audit.ts) — Supported passing already-authorized scoped Supabase client.
8. [`src/app/api/academics/ai/lesson-plan/route.ts`](file:///c:/Users/SAHR/OneDrive%20-%20DreamDay%20Technology/Documents/SchoolSaas/school-saas/src/app/api/academics/ai/lesson-plan/route.ts) — Migrated to `curriculum.lesson_plan.generate`, offering resource resolver, cross-tenant check, 422 unpublished check, raw `getPgPool()` removal, zero Gemini calls before auth.
9. [`src/app/api/super-admin/leads/route.ts`](file:///c:/Users/SAHR/OneDrive%20-%20DreamDay%20Technology/Documents/SchoolSaas/school-saas/src/app/api/super-admin/leads/route.ts) — Migrated to `platform.leads.manage`, raw `getPgPool()` removed.
10. [`src/app/api/exam-office/dashboard/route.ts`](file:///c:/Users/SAHR/OneDrive%20-%20DreamDay%20Technology/Documents/SchoolSaas/school-saas/src/app/api/exam-office/dashboard/route.ts) — Migrated GET to `exams.results.view` at tenant scope; POST/PATCH to `exams.sessions.manage`; DELETE returns 405 `OPERATION_DEFERRED`.
11. [`src/app/api/exam-office/communication-rules/route.ts`](file:///c:/Users/SAHR/OneDrive%20-%20DreamDay%20Technology/Documents/SchoolSaas/school-saas/src/app/api/exam-office/communication-rules/route.ts) — Migrated to `communications.rules.manage`, removed `user_metadata.tenant_id` leakage.
12. [`src/app/api/exam-office/communication-templates/route.ts`](file:///c:/Users/SAHR/OneDrive%20-%20DreamDay%20Technology/Documents/SchoolSaas/school-saas/src/app/api/exam-office/communication-templates/route.ts) — Migrated to `communications.templates.manage`, removed `user_metadata.tenant_id` leakage.
13. [`src/app/api/exam-office/communications/route.ts`](file:///c:/Users/SAHR/OneDrive%20-%20DreamDay%20Technology/Documents/SchoolSaas/school-saas/src/app/api/exam-office/communications/route.ts) — Migrated GET to `communications.broadcast.view`, POST to `communications.broadcast.send`.
14. [`src/app/api/notifications/route.ts`](file:///c:/Users/SAHR/OneDrive%20-%20DreamDay%20Technology/Documents/SchoolSaas/school-saas/src/app/api/notifications/route.ts) — Migrated GET to `notifications.self.view`, POST to `notifications.self.manage`. Bounded strictly to `auth.user.id`.
15. [`tests/auth/authorization-contract.test.ts`](file:///c:/Users/SAHR/OneDrive%20-%20DreamDay%20Technology/Documents/SchoolSaas/school-saas/tests/auth/authorization-contract.test.ts) — Updated assertions to assert exactly 46 canonical permissions and validate new grants.
16. [`tests/security/cohort-3d-1-api-containment.test.ts`](file:///c:/Users/SAHR/OneDrive%20-%20DreamDay%20Technology/Documents/SchoolSaas/school-saas/tests/security/cohort-3d-1-api-containment.test.ts) — [NEW] 32 comprehensive containment tests covering all 7 endpoints.

---

## 7. Submission for Supervisory Review

All criteria for Cohort 3D-1 have been fulfilled without out-of-scope alterations. The branch `ai-eos/task-0007-phase-3d-cohort-1-api-containment` is ready for supervisory inspection and merge authorization.
