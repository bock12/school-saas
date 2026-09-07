# TASK-0007 Phase 3C — Architectural Discovery Report

**Phase:** TASK-0007 Phase 3C  
**Stage:** Architectural Discovery & Discovery Analysis  
**Status:** DISCOVERY COMPLETE — PENDING SUPERVISORY REVIEW  
**Baseline Commit:** `e4d673e`  
**Active Branch:** `ai-eos/task-0007-phase-3c-discovery`  
**Supervisory Authority:** ChatGPT (Chief Software Architect) / Human Project Owner  
**Implementation Engineer:** Gemini / Antigravity  

---

## 1. Executive Discovery Summary

This document establishes the comprehensive architectural and security discovery across the entire SchoolSaaS repository following the successful merge of Phase 3B Cohort 1 (`fa16b8a`, governance `e4d673e`).

In accordance with TASK-0007 Phase 3C instructions, this discovery was executed **without modifying any application code, database schemas, RLS policies, migrations, dependencies, or frozen Phase 3A canonical authorization engine files**.

### Key Architectural Findings:

1. **API Surface Isolation:**
   - There are exactly **16 `route.ts` files** in the application.
   - **3 routes (7 endpoints)** were canonicalized in Phase 3B Cohort 1 (`/api/admin/exams`, `/api/exam-office/dashboard` [GET, POST, PATCH], `/api/cass-export`).
   - **1 endpoint** remains deferred in exam dashboard: `DELETE /api/exam-office/dashboard` due to the lack of an atomic `exams.sessions.delete` permission.
   - **1 route (`/api/academics/ai/lesson-plan`)** contains a **critical IDOR and cross-tenant vulnerability**: it queries `subject_offerings` directly via raw `pg.Pool` without filtering by caller tenant ID or offering assignment, allowing any authenticated user to read topics and consume LLM tokens across tenants.
   - **2 routes (`/api/exam-office/communication-rules`, `/api/exam-office/communication-templates`)** contain **severe security bypasses**: they rely on untrusted `user.user_metadata?.tenant_id`, fall back to cross-tenant database leaks if metadata is missing, invoke `createAdminClient()` directly, and perform zero role checks.
   - **1 route (`/api/admissions`)** handles admissions lifecycle (GET, POST, PATCH, DELETE). GET, POST, and PATCH map directly to existing canonical permissions (`admissions.applicants.view`, `admissions.applicants.create`, `admissions.applicants.approve`), while DELETE constitutes a permission gap.
   - **5 routes** are public onboarding/marketing entry points (`/api/public/*`), requiring rate-limiting rather than canonical user RBAC.
   - **1 route (`/api/auth/callback`)** is an OAuth/session exchange endpoint belonging to the authentication infrastructure layer.
   - **1 route (`/api/notifications`)** is a self-scoped recipient inbox endpoint.

2. **Server Action Landscape:**
   - Exactly **22 Server Action files** (`'use server'`) exist across `src/app/`.
   - Most server actions either rely on raw `createClient()` with PostgreSQL RLS or execute raw SQL via `getPgPool()`, bypassing RLS completely.
   - Critical Server Actions like `src/app/actions/curriculum.ts` and `src/app/actions/approvals.ts` bypass canonical authorization, role checks, and Separation of Duties (SoD).

3. **Database and RLS Invariants:**
   - Migration `046` established strong tenant boundaries and protected profile mutations via `protect_profile_fields()`.
   - Migration `047` established the canonical 33-permission catalog in PostgreSQL (`permissions_catalog`) and staff assignment enums.
   - A critical security finding was discovered in `017_enroll_applicant_rpc.sql`: the RPC function `public.enroll_applicant(p_applicant_id, p_admin_id)` is declared as `SECURITY DEFINER` without caller verification or execution revocation, allowing any authenticated user to execute student enrollments.

4. **Permission Catalog Completeness:**
   - The Phase 3A canonical catalog defines exactly **33 atomic permissions**.
   - No permissions exist for:
     - Examination session deletion (`exams.sessions.delete`)
     - Applicant deletion (`admissions.applicants.delete`)
     - Communications dispatch / management (`communications.*`)
     - Platform lead management (`platform.leads.manage`)
   - Candidate operations in Cohort 2 can be fully executed using existing permissions without modifying Phase 3A.

5. **Resource Resolution Boundaries:**
   - `resource-resolver.ts` currently supports `tenant`, `exam_session`, `exam_approval`, and `subject_offering`.
   - Admissions migration requires adding an authoritative `applicant` resolver (`resolveTrustedApplicantTarget`).
   - Academic AI Lesson Plan can consume the existing `subject_offering` resolver immediately.

---

## 2. Exhaustive API Route Inventory

The repository contains exactly 16 API `route.ts` endpoints. The table below catalogs every endpoint, its current state, canonical mapping, and architectural classification.

| # | Route Path | Method | Current Auth Mechanism | Current Authorization | Tenant Context | Service-Role / DB Usage | RLS Dep | Canonical Permission Candidate | Scope Candidate | Resource Target Required | Migration Complexity | Classification |
|---|------------|--------|------------------------|-----------------------|----------------|-------------------------|---------|--------------------------------|-----------------|--------------------------|----------------------|----------------|
| 1 | `/api/admin/exams` | GET | `api-guard.ts` (Phase 3B) | Canonical (`exams.sessions.manage`) | Authoritative | `adminClient` post-auth | RLS Indep | `exams.sessions.manage` | `school` | `tenant` | Complete | CANONICAL |
| 2 | `/api/admin/exams` | PATCH | `api-guard.ts` (Phase 3B) | Canonical (`exams.sessions.manage`) | Authoritative | `adminClient` post-auth | RLS Indep | `exams.sessions.manage` | `school` | `exam_session` | Complete | CANONICAL |
| 3 | `/api/exam-office/dashboard` | GET | `api-guard.ts` (Phase 3B) | Canonical (`exams.sessions.manage`) | Authoritative | `adminClient` post-auth | RLS Indep | `exams.sessions.manage` | `school` | `tenant` | Complete | CANONICAL |
| 4 | `/api/exam-office/dashboard` | POST | `api-guard.ts` (Phase 3B) | Canonical (`exams.sessions.manage`) | Authoritative | `adminClient` post-auth | RLS Indep | `exams.sessions.manage` | `school` | `tenant` | Complete | CANONICAL |
| 5 | `/api/exam-office/dashboard` | PATCH | `api-guard.ts` (Phase 3B) | Canonical (`exams.sessions.manage`) | Authoritative | `adminClient` post-auth | RLS Indep | `exams.sessions.manage` | `school` | `exam_session` | Complete | CANONICAL |
| 6 | `/api/exam-office/dashboard` | DELETE | `api-guard.ts` (Legacy) | Coarse roles (`school_admin`, `org_admin`, `super_admin`) | Authoritative | `adminClient` post-auth | RLS Partial | `exams.sessions.delete` (GAP) | `school` | `exam_session` | High | DEFERRED (GAP) |
| 7 | `/api/cass-export` | GET | `api-guard.ts` (Phase 3B) | Canonical (`exams.cass.export`) | Authoritative | `adminClient` post-auth | RLS Indep | `exams.cass.export` | `school` | `tenant` | Complete | CANONICAL |
| 8 | `/api/cass-export` | POST | `api-guard.ts` (Phase 3B) | Canonical (`exams.cass.export`) | Authoritative | `adminClient` post-auth | RLS Indep | `exams.cass.export` | `school` | `tenant` | Complete | CANONICAL |
| 9 | `/api/admissions` | GET | `api-guard.ts` (Legacy) | Coarse roles (`school_admin`, `exam_officer`, `org_admin`, `super_admin`) | Authoritative | `adminClient` post-auth | RLS Partial | `admissions.applicants.view` | `school` | `tenant` | Low | LEGACY-BUT-CONTAINED |
| 10 | `/api/admissions` | POST | `api-guard.ts` (Legacy) | Coarse roles (Includes `exam_officer`) | Authoritative | `adminClient` post-auth | RLS Partial | `admissions.applicants.create` | `school` | `tenant` | Medium | LEGACY-BUT-CONTAINED |
| 11 | `/api/admissions` | PATCH | `api-guard.ts` (Legacy) | Coarse roles (`school_admin`, `exam_officer`, etc.) | Authoritative | `adminClient` post-auth | RLS Partial | `admissions.applicants.approve` | `school` | `applicant` | Medium | LEGACY-BUT-CONTAINED |
| 12 | `/api/admissions` | DELETE | `api-guard.ts` (Legacy) | Coarse roles (`school_admin`, `org_admin`, `super_admin`) | Authoritative | `adminClient` post-auth | RLS Partial | `admissions.applicants.delete` (GAP) | `school` | `applicant` | High | DEFERRED (GAP) |
| 13 | `/api/academics/ai/lesson-plan` | POST | None (`supabase.auth.getUser()`) | None (Any logged-in user) | Unchecked / IDOR | Direct `pg.Pool` (bypasses RLS) | Bypassed | `curriculum.version.create` | `offering` | `subject_offering` | Medium | INSECURE |
| 14 | `/api/exam-office/communication-rules` | GET | Untrusted `user_metadata` | None | Client metadata / Leaks all | `createAdminClient()` directly | Bypassed | `communications.rules.manage` (GAP) | `school` | `tenant` | High | INSECURE / DEFERRED |
| 15 | `/api/exam-office/communication-rules` | POST | Untrusted `user_metadata` | None | Client metadata | `createAdminClient()` directly | Bypassed | `communications.rules.manage` (GAP) | `school` | `tenant` | High | INSECURE / DEFERRED |
| 16 | `/api/exam-office/communication-templates` | GET | Untrusted `user_metadata` | None | Client metadata / Leaks all | `createAdminClient()` directly | Bypassed | `communications.templates.manage` (GAP) | `school` | `tenant` | High | INSECURE / DEFERRED |
| 17 | `/api/exam-office/communication-templates` | POST | Untrusted `user_metadata` | None | Client metadata | `createAdminClient()` directly | Bypassed | `communications.templates.manage` (GAP) | `school` | `tenant` | High | INSECURE / DEFERRED |
| 18 | `/api/exam-office/communications` | GET | `api-guard.ts` (Legacy) | Coarse roles (`school_admin`, `exam_officer`, `super_admin`) | Authoritative | `adminClient` post-auth | RLS Partial | `communications.notices.send` (GAP) | `school` | `tenant` | High | DEFERRED (GAP-3B-01) |
| 19 | `/api/exam-office/communications` | POST | `api-guard.ts` (Legacy) | Coarse roles (`school_admin`, `exam_officer`, `super_admin`) | Authoritative | `adminClient` post-auth | RLS Partial | `communications.broadcast.manage` (GAP) | `school` | `tenant` | High | DEFERRED (GAP-3B-01) |
| 20 | `/api/notifications` | GET | `supabase.auth.getUser()` | Self-scoped user query | Self (`user_id = user.id`) | `createAdminClient()` directly | RLS Bypassed | Implicit Self Capability | `self` | `self` | Low | LEGACY-BUT-CONTAINED |
| 21 | `/api/notifications` | POST | `supabase.auth.getUser()` | Self-scoped mark-read | Self (`user_id = user.id`) | `createAdminClient()` directly | RLS Bypassed | Implicit Self Capability | `self` | `self` | Low | LEGACY-BUT-CONTAINED |
| 22 | `/api/super-admin/leads` | GET | `api-guard.ts` (Legacy) | Coarse role (`super_admin`) | Platform | Direct `pg.Pool` | RLS Bypassed | `platform.leads.manage` (GAP) | `platform` | None | Medium | LEGACY-BUT-CONTAINED |
| 23 | `/api/super-admin/leads` | PATCH | `api-guard.ts` (Legacy) | Coarse role (`super_admin`) | Platform | Direct `pg.Pool` | RLS Bypassed | `platform.leads.manage` (GAP) | `platform` | None | Medium | LEGACY-BUT-CONTAINED |
| 24 | `/api/super-admin/leads` | DELETE | `api-guard.ts` (Legacy) | Coarse role (`super_admin`) | Platform | Direct `pg.Pool` | RLS Bypassed | `platform.leads.manage` (GAP) | `platform` | None | Medium | LEGACY-BUT-CONTAINED |
| 25 | `/api/auth/callback` | GET | None (OAuth Code Exchange) | Authentication Flow | Target path parsed | `createAdminClient()` for sync | Layer 1 | None (Auth Layer) | N/A | None | Low | AUTH-INFRASTRUCTURE |
| 26 | `/api/public/check-slug` | GET | Public (Anonymous) | None | Untrusted query param | Direct `pg.Pool` | Public | None (Public API) | N/A | None | Low | PUBLIC-UNAUTHENTICATED |
| 27 | `/api/public/demo-requests` | POST | Public (Anonymous) | None | Untrusted body | Anon Supabase REST / pg.Pool | Public | None (Public API) | N/A | None | Low | PUBLIC-UNAUTHENTICATED |
| 28 | `/api/public/landing-sections` | GET | Public (Anonymous) | None | Platform | Server actions | Public | None (Public API) | N/A | None | Low | PUBLIC-UNAUTHENTICATED |
| 29 | `/api/public/register-tenant` | POST | Public (Anonymous) | None | Self-service creation | Admin client + pg.Pool tx | Public | None (Public API) | N/A | None | High | PUBLIC-UNAUTHENTICATED |
| 30 | `/api/public/tenants` | GET | Public (Anonymous) | None | Directory query | Direct `pg.Pool` / Anon REST | Public | None (Public API) | N/A | None | Low | PUBLIC-UNAUTHENTICATED |

---

## 3. Server Actions and Server-Side Entry Points Inventory

A systematic audit across `src/app/` identified exactly **22 files containing Server Actions (`'use server'`)**.

| File Path | Functional Domain | Primary Operations | Authorization Pattern | Classification | Target Canonical Permission |
|-----------|-------------------|--------------------|-----------------------|----------------|-----------------------------|
| `src/app/[tenant]/admin/students/admissions/actions.ts` | Admissions Lifecycle | `createApplicant`, `progressApplicantStage`, `scheduleApplicantInterview` | Authenticated client + RLS, invokes `enroll_applicant` RPC | LEGACY-BUT-CONTAINED | `admissions.applicants.create`, `admissions.applicants.approve` |
| `src/app/[tenant]/admin/students/actions.ts` | Student Management | Student status update, archive, profile edit | Authenticated client + RLS | LEGACY-BUT-CONTAINED | `students.records.manage` |
| `src/app/[tenant]/admin/teachers/actions.ts` | Staff Management | Teacher profile update, status change | Authenticated client + RLS | LEGACY-BUT-CONTAINED | `staff.accounts.manage` |
| `src/app/[tenant]/admin/classes/actions.ts` | Academic Structure | Create class, update section, assign teacher | Authenticated client + RLS | LEGACY-BUT-CONTAINED | `staff.allocations.manage` |
| `src/app/[tenant]/admin/parents/actions.ts` | Parent Directory | Parent profile update, student link | Authenticated client + RLS | LEGACY-BUT-CONTAINED | `students.records.manage` |
| `src/app/[tenant]/admin/bursary/actions.ts` | Finance & Fee Invoicing | Fee waiver creation, invoice adjustments | Authenticated client + RLS | LEGACY-BUT-CONTAINED | `finance.invoices.manage`, `finance.waivers.approve` |
| `src/app/[tenant]/admin/communication/internal/_components/actions.ts` | Staff Chat/Chatrooms | Post message, create channel | Authenticated client + RLS | LEGACY-BUT-CONTAINED | Chat domain |
| `src/app/[tenant]/apply/actions.ts` | Public Admissions Portal | Self-service applicant submission | Anonymous Supabase insert | LEGACY-BUT-CONTAINED | `admissions.applicants.create` (self) |
| `src/app/[tenant]/login/actions.ts` | Authentication & Password Reset | Tenant login, password reset | Supabase Auth API | LEGACY-BUT-CONTAINED | Authentication Layer |
| `src/app/actions/curriculum.ts` | Curriculum & Syllabus | Create version, submit, review, approve, publish | Direct `pg.Pool` (NO AUTH CHECK, bypasses RLS) | INSECURE | `curriculum.version.create`, `review`, `approve`, `publish` |
| `src/app/actions/curriculum-coverage.ts` | Topic Coverage Logging | Log topic completion, teaching periods | Direct `pg.Pool` | INSECURE | `curriculum.coverage.log` |
| `src/app/actions/approvals.ts` | Institutional Approvals | Create request, resolve request, delete | Supabase client, NO SoD check on self-approval | INSECURE | Domain Approval Permissions |
| `src/app/actions/offerings.ts` | Subject Offerings | Create offering, assign teacher, allocate periods | Direct `pg.Pool` | INSECURE | `staff.allocations.manage` |
| `src/app/actions/subjects.ts` | Subject Catalog | Create subject, update syllabus code | Direct `pg.Pool` | INSECURE | `curriculum.version.publish` |
| `src/app/actions/stream-assignments.ts` | WAEC Stream Placement | Bulk assign streams, override stream | Direct `pg.Pool` | INSECURE | `admissions.applicants.approve` |
| `src/app/actions/elective-selections.ts` | Student Electives | Student elective subject choices | Direct `pg.Pool` | INSECURE | `students.records.manage` |
| `src/app/actions/academic-sessions.ts` | Academic Sessions | Create term, set active session | Direct `pg.Pool` | INSECURE | `exams.sessions.manage` |
| `src/app/actions/academic-calendar.ts` | Calendar Events | Create term event, exam dates | Direct `pg.Pool` | INSECURE | `exams.schedules.manage` |
| `src/app/actions/users.ts` | User Provisioning | Role assignment, password reset, deactivation | Custom ad-hoc role check (`canManageTarget`), admin client | DUPLICATED | `staff.accounts.manage` |
| `src/app/actions/tenant.ts` | Tenant Settings | Update school branding, timezone, contact | Custom ad-hoc role check, admin client | DUPLICATED | `platform.tenants.manage` / School Admin |
| `src/app/actions/landing-cms.ts` | Marketing CMS | Update landing page sections, hero copy | Custom `is_super_admin` check | DUPLICATED | `platform.tenants.manage` |
| `src/app/(super-admin)/super-admin/tenants/directory/actions.ts` | Platform Tenant Ops | Suspend tenant, change plan tier | Custom `is_super_admin` check | DUPLICATED | `platform.tenants.manage`, `platform.billing.manage` |

---

## 4. Database and RLS Security Discovery

### 4.1 Row Level Security (RLS) State by Entity

1. **`public.applicants` (Migration 015 & 046):**
   - RLS is ENABLED.
   - Policies enforce tenant isolation:
     `USING (tenant_id = public.get_user_tenant_id() OR (public.is_org_admin() AND tenant_id IN (SELECT id FROM public.tenants WHERE parent_id = public.get_user_tenant_id())))`
   - *Limitation:* The policy checks tenant containment but does NOT check user business roles at the SQL layer. Any authenticated user within Tenant A can insert/update/delete records if connecting directly to Supabase with an authenticated token.
   - *Conclusion:* RLS acts as a robust second line of defense for tenant isolation, but cannot replace application-layer canonical authorization.

2. **`public.subject_offerings` & Curriculum Tables (Migration 041, 043):**
   - Tables: `subject_offerings`, `curriculum_versions`, `curriculum_topics`, `learning_outcomes`.
   - RLS is enabled on these tables, but Server Actions in `src/app/actions/curriculum.ts` and `/api/academics/ai/lesson-plan` utilize `getPgPool()`, connecting as the database superuser and completely bypassing all RLS policies!

3. **`public.notification_*` Tables (Migration 029 & 046):**
   - RLS was comprehensively remediated in migration `046` with recipient ownership:
     - `notifications` can only be viewed by administrators or recipients who have records in `notification_recipients`.
     - `notification_recipients` can only be viewed or updated by the recipient (`user_id = auth.uid()`) or school/org administrators.
   - *Vulnerability:* The route handlers in `/api/exam-office/communication-*` call `createAdminClient()` (service_role), which nullifies these hardened RLS policies.

4. **Critical SECURITY DEFINER Finding — `enroll_applicant` RPC (Migration 017):**
   - Function definition in `017_enroll_applicant_rpc.sql`:
     ```sql
     CREATE OR REPLACE FUNCTION public.enroll_applicant(
       p_applicant_id UUID,
       p_admin_id UUID
     ) RETURNS UUID SECURITY DEFINER ...
     ```
   - **Vulnerability:** The function runs as superuser, does not verify that `p_admin_id == auth.uid()`, does not verify that the caller holds `admissions.applicants.approve`, and permissions were never revoked from `authenticated`. Any authenticated user can execute this RPC directly to enroll applicants and generate student records.

---

## 5. Permission Gap Analysis against the 33 Canonical Permissions

The frozen Phase 3A canonical permission catalog defines exactly 33 atomic permissions. Below is the evaluation of remaining product operations against this catalog:

| Operation Key | Description | Corresponding Canonical Permission | Catalog Status | Action Required |
|---------------|-------------|-----------------------------------|----------------|-----------------|
| `admissions.get` | List applicants & stats | `admissions.applicants.view` | ALREADY EXISTS | Consume existing permission |
| `admissions.post` | Create applicant record | `admissions.applicants.create` | ALREADY EXISTS | Consume existing permission |
| `admissions.patch` | Update stage/stream/scores | `admissions.applicants.approve` | ALREADY EXISTS | Consume existing permission |
| `admissions.delete` | Hard delete applicant | `admissions.applicants.delete` | **GAP: DOES NOT EXIST** | Governance request required; DEFER |
| `academic_ai.lesson_plan` | Generate AI lesson plan | `curriculum.version.create` | ALREADY EXISTS | Consume existing permission |
| `curriculum.create` | Draft new syllabus version | `curriculum.version.create` | ALREADY EXISTS | Consume existing permission |
| `curriculum.submit` | Submit draft for review | `curriculum.version.review` | ALREADY EXISTS | Consume existing permission |
| `curriculum.approve` | Approve departmental version | `curriculum.version.approve` | ALREADY EXISTS | Consume existing permission |
| `curriculum.publish` | Publish institutional catalog | `curriculum.version.publish` | ALREADY EXISTS | Consume existing permission |
| `curriculum.coverage` | Log instructional progress | `curriculum.coverage.log` | ALREADY EXISTS | Consume existing permission |
| `exams.dashboard.delete` | Delete exam session | `exams.sessions.delete` | **GAP: DOES NOT EXIST** | Governance request required; DEFER |
| `communications.send` | Dispatch notification | `communications.notices.send` | **GAP: DOES NOT EXIST** | Dedicated charter required; DEFER |
| `communications.broadcast` | Institutional broadcast | `communications.broadcast.manage` | **GAP: DOES NOT EXIST** | Dedicated charter required; DEFER |
| `communications.templates` | Manage message templates | `communications.templates.manage` | **GAP: DOES NOT EXIST** | Dedicated charter required; DEFER |
| `communications.rules` | Manage trigger rules | `communications.rules.manage` | **GAP: DOES NOT EXIST** | Dedicated charter required; DEFER |
| `super_admin.leads.manage` | View/update demo leads | `platform.leads.manage` | **GAP: DOES NOT EXIST** | Governance proposal; DEFER |

### Governance Analysis of Permission Gaps:

1. **`admissions.applicants.delete`:**
   - *Impact:* Deletion of an applicant permanently destroys admissions records, interview notes, and parent correspondence.
   - *Recommendation:* Do not invent this permission in Phase 3C. In educational administration, applications should transition to `rejected` or `withdrawn` rather than being hard deleted. Hard delete should remain deferred.

2. **`exams.sessions.delete`:**
   - *Impact:* Hard deleting an examination session cascades to schedules, marks, student transcripts, and WAEC returns.
   - *Recommendation:* Prohibit hard deletion of exam sessions that have associated schedules or results. Introduce archival/voiding semantics before considering this permission.

3. **`communications.*` (`GAP-3B-01`):**
   - *Impact:* Multi-channel broadcast (SMS, Email) incurs financial cost, external provider rate-limits, and spam risks.
   - *Recommendation:* Dedicate a standalone domain charter to Communications.

---

## 6. Resource Resolution Architecture

The authoritative resource resolution layer (`src/lib/auth/resource-resolver.ts`) enforces the principle:
> **Resource resolution determines facts. Authorization determines authority.**

### Current Resolver Capabilities:
- `tenant`: Resolves `tenantId`, `organizationId`.
- `exam_session`: Resolves `tenantId`, `stage`.
- `exam_approval`: Resolves `tenantId`, `submitterId`, `stage`.
- `subject_offering`: Resolves `tenantId`, `departmentId`, `sectionId`, `subjectOfferingId`.

### Required Resolver Additions for Phase 3C:

To migrate `/api/admissions`, `resource-resolver.ts` must be extended with an authoritative applicant resolver:

```typescript
export async function resolveTrustedApplicantTarget(
  supabase: SupabaseClient,
  applicantId: string
): Promise<TrustedResourceTarget> {
  if (!applicantId || typeof applicantId !== 'string') {
    throw new ResourceResolutionError('Applicant ID must be a non-empty string.');
  }

  const { data: applicant, error } = await supabase
    .from('applicants')
    .select('id, tenant_id, stage')
    .eq('id', applicantId)
    .maybeSingle();

  if (error) {
    throw new ResourceResolutionError(`Database error resolving applicant: ${error.message}`);
  }

  if (!applicant) {
    throw new ResourceNotFoundError('applicant', applicantId);
  }

  return createTrustedTarget({
    tenantId: applicant.tenant_id,
    stage: applicant.stage || undefined,
  });
}
```

For `/api/academics/ai/lesson-plan`, the existing `resolveTrustedSubjectOfferingTarget` function is **already sufficient** and provides `tenantId`, `departmentId`, and `sectionId`.

---

## 7. Analysis of Deferred Domains

### 7.1 Institutional Communications (GAP-3B-01)
- The Communications API was deferred in Phase 3B.
- Discovery confirms that Communications involves three distinct concerns:
  1. Template rendering and variable substitution (`notification_templates`).
  2. Automated rule evaluation (`notification_rules`).
  3. Multi-channel delivery to external providers (`CHANNELS` - Twilio/SendGrid/Termii).
- **Charter Recommendation:** Communications MUST NOT be absorbed into generic route migrations. It requires a dedicated domain task (`TASK-0007-PHASE-3E` or `TASK-0008`) establishing rate limiting, financial quota enforcement, recipient scoping, and 4 dedicated permissions.

### 7.2 Exam Session Deletion
- Deleting an exam session destroys assessment data and breaks auditability.
- Soft-delete (`status = 'archived'`) is architecturally required before any delete operation is permitted.
- Remains DEFERRED.

### 7.3 CASS Data Integrity (`REC-0010`)
- Synthetic mark generation in `/api/cass-export` (`8.5 + (i % 2)`) remains an open issue (`REC-0010`).
- Because `/api/cass-export` authorization was cleanly isolated and frozen in Phase 3B, `REC-0010` is an analytical/data-pipeline issue and does not block Phase 3C.

### 7.4 Frontend Authorization
- The frontend currently performs raw `profile.role` comparisons.
- No `usePermissions()` or `can()` hooks exist in the UI.
- Hardening UI components before backend APIs are fully secured is an anti-pattern.
- Frontend migration should be scheduled as **Phase 3D**.

---

## 8. Security Regression & Risk Register

| Risk ID | Severity | Category | Discovery Finding | Potential Impact | Recommended Phase 3C Mitigation |
|---------|----------|----------|-------------------|------------------|--------------------------------|
| `SEC-3C-01` | **CRITICAL** | IDOR / Tenant Leak | `/api/academics/ai/lesson-plan` queries `subject_offerings` via raw SQL with only `$1 = offering_id`, without tenant or user assignment checks. | Any authenticated user can read curriculum and generate lesson plans across all tenants, causing data leakage and token exhaustion. | Authorize with `api-guard.ts` using `curriculum.version.create`, `offering` scope, and `resolveTrustedSubjectOfferingTarget`. |
| `SEC-3C-02` | **CRITICAL** | Authorization Bypass | `/api/exam-office/communication-rules` and `communication-templates` trust client `user_metadata.tenant_id`, leak all tenant data if missing, and invoke `createAdminClient()`. | Unauthenticated or cross-tenant template tampering, message rule injection, and system spam. | Keep deferred under `GAP-3B-01` until dedicated communications charter. |
| `SEC-3C-03` | **HIGH** | Privilege Escalation | `public.enroll_applicant` RPC in `017` is `SECURITY DEFINER` without caller verification or execution revocation. | Any logged-in user can convert arbitrary applicants into enrolled students and generate parent accounts. | Document as database remediation task; gate calling Server Action with canonical authorization. |
| `SEC-3C-04` | **HIGH** | Unchecked LLM Abuse | `/api/academics/ai/lesson-plan` directly invokes Google Gemini API without rate-limiting or quota checking. | Denial of service, rapid API quota exhaustion, excessive SaaS operating expenses. | Enforce canonical authorization check to restrict invocation strictly to authorized subject teachers, HODs, and admins. |
| `SEC-3C-05` | **MEDIUM** | Coarse Role Leakage | `/api/admissions` currently allows `exam_officer` in POST and PATCH via legacy role list. | In the canonical catalog, `exam_officer` has `admissions.applicants.view`, but NOT `create` or `approve`. | Canonicalizing `/api/admissions` restores strict catalog compliance and prevents exam officers from creating or approving applications. |

---

## 9. Test Architecture & Coverage Gap Analysis

### Existing Test Assets (Phase 3A/3B):
- `tests/auth/authorization-engine.test.ts` (61 assertions)
- `tests/auth/authorization-context-resolver.test.ts` (39 assertions)
- `tests/auth/authorization-contract.test.ts` (22 assertions)
- `tests/auth/api-guard.test.ts` (15 assertions)
- `tests/auth/api-canonical-integration.test.ts` (28 assertions)
- `tests/auth/api-rls-containment.test.ts` (6 assertions)

### Required Test Suites for Next Phase:
1. **Resource Resolver Unit Tests:**
   - Test `resolveTrustedApplicantTarget` against existing records, missing records, and invalid IDs.
2. **Admissions API Canonical Integration Tests:**
   - Verify `admissions.applicants.view` grants GET access to `school_admin`, `org_admin`, `super_admin`, and `exam_officer`.
   - Verify `teacher`, `student`, and `parent` are denied GET access at school scope.
   - Verify `admissions.applicants.create` allows `school_admin`, but strictly denies `exam_officer`.
   - Verify `admissions.applicants.approve` allows `school_admin`, but strictly denies `exam_officer` and `teacher`.
   - Negative-space tests: cross-tenant access attempts return HTTP 403 / 404 without data leakage.
   - Resource spoofing: caller cannot provide untrusted `tenant_id` in request body.
3. **Academic AI Lesson Plan Integration Tests:**
   - Verify `curriculum.version.create` allows `subject_teacher` assigned to offering, HOD of offering department, and `school_admin`.
   - Verify unassigned teachers, teachers from different departments, and students are denied (HTTP 403).
   - Verify cross-tenant offering access is strictly denied (HTTP 403/404) BEFORE invoking the LLM API.
   - Verify unauthenticated requests return HTTP 401.
