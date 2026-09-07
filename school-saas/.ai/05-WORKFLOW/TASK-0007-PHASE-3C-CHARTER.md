# TASK-0007 Phase 3C — Architectural Charter (Proposed)

**Phase:** TASK-0007 Phase 3C  
**Title:** Canonical API Authorization Integration (Cohort 2: Admissions & Academic AI) & Authoritative Resource Resolution  
**Status:** PROPOSED CHARTER — IMPLEMENTATION NOT AUTHORIZED  
**Base Commit:** `e4d673e`  
**Supervisory Authority:** ChatGPT (Chief Software Architect) / Human Project Owner  
**Implementation Engineer:** Gemini / Antigravity  

---

## 1. Problem Statement

Following the successful deployment of Phase 3B Cohort 1 (which canonicalized the Examination Office administrative endpoints and CASS export), critical operational endpoints in the application remain governed by legacy coarse-role strings or lack server-side authorization entirely:

1. **Admissions Management (`/api/admissions`):**
   - The admissions endpoint processes sensitive student Personally Identifiable Information (PII), parent contacts, and official WAEC/BECE placement records.
   - It currently relies on legacy role lists (`roles: ['school_admin', 'exam_officer', 'org_admin', 'super_admin']`).
   - This legacy role check leaks write and approval authority to `exam_officer`, even though the canonical Phase 3A catalog strictly restricts `exam_officer` to `admissions.applicants.view` and excludes them from application creation and approval.

2. **Academic AI Lesson Planning (`/api/academics/ai/lesson-plan`):**
   - The AI lesson plan generator queries PostgreSQL directly via raw `pg.Pool` with only `WHERE so.id = $1` (the untrusted client-supplied `offering_id`).
   - It performs **no tenant check, no teacher assignment check, and no department check**.
   - Any authenticated user across any tenant can provide an arbitrary `offering_id` from another institution, extract that institution's published curriculum topics and learning outcomes, and consume costly Google Gemini LLM tokens.

Phase 3C resolves these vulnerabilities by integrating the frozen Phase 3A canonical authorization engine and authoritative resource resolution into **Cohort 2 (Admissions & Academic AI)**.

---

## 2. Proposed Phase 3C Scope

Phase 3C is strictly limited to **Cohort 2 API Canonicalization**:

1. **Admissions Management API (`/api/admissions`):**
   - **GET:** Migrate to canonical permission `admissions.applicants.view` at `school` scope. Validated against authoritative tenant boundary.
   - **POST:** Migrate to canonical permission `admissions.applicants.create` at `school` scope. Bounded strictly to authoritative tenant. Coarse `exam_officer` write access is eliminated.
   - **PATCH:** Migrate to canonical permission `admissions.applicants.approve` at `school` scope, requiring authoritative applicant resource resolution. Reconciles stage progression and WAEC stream placement under authoritative executive governance.

2. **Academic AI Lesson Planning API (`/api/academics/ai/lesson-plan`):**
   - **POST:** Migrate to canonical permission `curriculum.version.create` at `offering` scope.
   - Enforce declarative resource resolution using the existing `subject_offering` resolver in `resource-resolver.ts`.
   - Restrict lesson planning generation strictly to:
     - The assigned `subject_teacher` of that offering;
     - The Head of Department (`hod`) governing that offering's subject;
     - Institutional administrators (`school_admin`, `org_admin`, `super_admin`).
   - Eliminate cross-tenant IDOR and unauthorized LLM token consumption before any external Google Gemini API call occurs.

3. **Resource Resolver Extension (`src/lib/auth/resource-resolver.ts`):**
   - Implement `resolveTrustedApplicantTarget(supabase, applicantId)` to extract authoritative `tenantId` and `stage` from `public.applicants`.
   - Register `'applicant'` in `SupportedResourceType` and `resolveTrustedResourceTarget`.

4. **Integration & Negative-Space Test Suite:**
   - Implement comprehensive unit and API integration tests in `tests/auth/api-admissions-canonical.test.ts` and `tests/auth/api-academic-ai-canonical.test.ts`.

---

## 3. Explicitly Out of Scope (Deferred)

The following items are strictly **OUT OF SCOPE** for Phase 3C and remain deferred:

1. **Applicant Deletion (`DELETE /api/admissions`):**
   - `admissions.applicants.delete` does not exist in the 33-permission catalog.
   - Deletion permanently destroys student applicant records.
   - Remains DEFERRED pending institutional lifecycle governance (archival/rejection vs hard deletion).

2. **Institutional Communications (`/api/exam-office/communications*`):**
   - Retained under deferral `GAP-3B-01`.
   - Zero communications permissions exist in the catalog.
   - Must be governed under a dedicated communications charter (`TASK-0007-PHASE-3E` or `TASK-0008`).

3. **Examination Session Deletion (`DELETE /api/exam-office/dashboard`):**
   - `exams.sessions.delete` does not exist in the catalog.
   - Hard deletion cascades to marks, schedules, and WAEC returns.
   - Remains DEFERRED pending soft-delete / archival architecture.

4. **Super Admin Leads API (`/api/super-admin/leads`):**
   - Platform marketing leads do not have a dedicated `platform.leads.manage` permission.
   - Protected by legacy platform checks; deferred to platform administration cohort.

5. **Server Actions Migration (`src/app/actions/*`):**
   - The 22 Server Action files remain governed under their existing boundaries.
   - Server Actions will be addressed in a subsequent dedicated server action authorization task.

6. **Frontend Authorization (`usePermissions()`):**
   - UI display gating will be addressed in **Phase 3D**.

7. **CASS Score Recalculation (`REC-0010`):**
   - Domain data integrity issue remains decoupled from authorization.

8. **Database Schema & RLS Policy Changes:**
   - No migrations or RLS modifications are permitted during Phase 3C.

---

## 4. Candidate Route Ranking & Selection Rationale

| Candidate Endpoint | Security Risk | Business Criticality | Architectural Readiness | Tenant Sensitivity | Selection Status |
|--------------------|---------------|----------------------|-------------------------|--------------------|------------------|
| `/api/academics/ai/lesson-plan` (POST) | **CRITICAL** | HIGH | **READY** (Resolver exists) | HIGH | **INCLUDED (Cohort 2)** |
| `/api/admissions` (GET) | MEDIUM | HIGH | **READY** (Catalog matches) | HIGH | **INCLUDED (Cohort 2)** |
| `/api/admissions` (POST) | HIGH | HIGH | **READY** (Catalog matches) | HIGH | **INCLUDED (Cohort 2)** |
| `/api/admissions` (PATCH) | HIGH | HIGH | **READY** (Requires applicant resolver) | HIGH | **INCLUDED (Cohort 2)** |
| `/api/admissions` (DELETE) | HIGH | LOW | **BLOCKED** (Permission gap) | HIGH | **EXCLUDED (Deferred)** |
| `/api/exam-office/communications*` | CRITICAL | HIGH | **BLOCKED** (GAP-3B-01) | HIGH | **EXCLUDED (Deferred)** |
| `/api/exam-office/dashboard` (DELETE) | CRITICAL | LOW | **BLOCKED** (Permission gap) | HIGH | **EXCLUDED (Deferred)** |
| `/api/super-admin/leads` | MEDIUM | MEDIUM | **BLOCKED** (Permission gap) | LOW | **EXCLUDED (Deferred)** |

**Rationale:** Including `/api/admissions` (GET, POST, PATCH) and `/api/academics/ai/lesson-plan` directly eliminates the highest active security vulnerability in the repository (the cross-tenant AI IDOR leak) and closes coarse-role privilege leakage in admissions, while requiring zero amendments to the frozen Phase 3A engine.

---

## 5. Permission Mapping & Canonical Matrix

| Route & Method | Business Operation | Canonical Permission | Valid Scope | Authorized Base Roles | Authorized Functional Roles | Denied Roles (Negative Space) |
|----------------|--------------------|----------------------|-------------|-----------------------|-----------------------------|-------------------------------|
| `GET /api/admissions` | View admissions registry | `admissions.applicants.view` | `school` | `school_admin`, `org_admin`, `super_admin` | `exam_officer`, `vice_principal` | `teacher`, `student`, `parent` (at school scope) |
| `POST /api/admissions` | Create admission application | `admissions.applicants.create` | `school` | `school_admin`, `org_admin`, `super_admin` | None | `exam_officer`, `teacher`, `student`, `parent` (at school scope) |
| `PATCH /api/admissions` | Approve/advance applicant stage | `admissions.applicants.approve` | `school` | `school_admin`, `org_admin`, `super_admin` | None | `exam_officer`, `vice_principal`, `teacher`, `student`, `parent` |
| `POST /api/academics/ai/lesson-plan` | Operationalize curriculum via AI | `curriculum.version.create` | `offering` | `school_admin`, `org_admin`, `super_admin` | `subject_teacher` (assigned), `hod` (department) | Unassigned teachers, other HODs, `exam_officer`, students, parents |

---

## 6. Authoritative Resource Resolution Model

In accordance with Phase 3B architectural patterns, untrusted identifiers submitted in request headers, URL queries, or request bodies are NEVER trusted for authorization.

```text
Untrusted Request
      ↓
Authentication (`api-guard.ts` via Supabase Auth Cookie / Header)
      ↓
Authoritative Profile Fetch (`profiles` table via Server Client)
      ↓
Canonical Authorization Context (`resolveAuthorizationContext`)
      ↓
Authoritative Resource Lookup (`resource-resolver.ts` via Server Admin Client)
      ↓
Branded TrustedResourceTarget (`[TRUSTED_TARGET_BRAND]: true`)
      ↓
Pure Engine Authorization (`evaluateAuthorization`)
      ↓
Business Logic & Post-Auth Database Operation
      ↓
PostgreSQL Row Level Security (RLS)
```

### Resource Facts Required:
1. **Applicant Resource Target (`applicant`):**
   - `tenantId`: string (authoritative school UUID from `applicants.tenant_id`)
   - `stage`: string (authoritative lifecycle status from `applicants.stage`)
2. **Subject Offering Resource Target (`subject_offering`):**
   - `tenantId`: string (authoritative school UUID from `subject_offerings.tenant_id`)
   - `departmentId`: string (authoritative department UUID from `subject_offerings.department_id`)
   - `sectionId`: string (authoritative section UUID from `subject_offerings.section_id`)
   - `subjectOfferingId`: string (authoritative offering UUID from `subject_offerings.id`)

---

## 7. PostgreSQL RLS Relationship & Defense-in-Depth

The two layers remain completely decoupled and mutually reinforcing:

1. **Layer 1: Canonical Application Authorization (`api-guard.ts` + `authorization-engine.ts`)**
   - Evaluates fine-grained business logic: permissions, functional staff assignments (`subject_teacher`, `hod`), structural scopes (`offering`, `department`, `school`), and role entitlements.
   - Enforces Separation of Duties (SoD) and lifecycle stage constraints.
   - Operates before any privileged database call or external AI service execution.

2. **Layer 2: PostgreSQL Row Level Security (RLS)**
   - Protects database tables at the SQL layer.
   - Enforces strict tenant containment (`tenant_id = public.get_user_tenant_id()`).
   - Prevents cross-tenant data leaks even if an application bug occurs.

---

## 8. Separation of Duties (SoD) & Lifecycle Constraints

1. **Admissions Lifecycle:**
   - `exam_officer` may VIEW applicant records (`admissions.applicants.view`) to prepare examination candidate lists and verify BECE/NPSE aggregates.
   - `exam_officer` CANNOT CREATE (`admissions.applicants.create`) or APPROVE (`admissions.applicants.approve`) applications.
   - Stage transitions (e.g. advancing from `Interview` to `Allocation`) require `admissions.applicants.approve`.
2. **Academic Curriculum & AI Generation:**
   - A teacher can only generate AI lesson plans for offerings to which they are officially assigned as `subject_teacher`.
   - An HOD can generate lesson plans for any offering within their assigned `department_id`.
   - Generating lesson plans requires the curriculum version to be in `published` status (enforced by business logic).

---

## 9. Comprehensive Testing Strategy

Phase 3C will require a rigorous, zero-mock (or verified-mock transport) automated test suite:

1. **Resolver Unit Suite (`tests/auth/resource-resolver-applicant.test.ts`):**
   - Authoritative lookup returns branded `TrustedResourceTarget`.
   - Throws `ResourceNotFoundError` for missing applicants.
   - Throws `ResourceResolutionError` for invalid or empty IDs.

2. **Admissions Integration Suite (`tests/auth/api-admissions-canonical.test.ts`):**
   - **GET:** Verified for `school_admin`, `org_admin`, `super_admin`, `exam_officer`.
   - **GET Negative Space:** Verified 403 Forbidden for `teacher`, `student`, `parent`.
   - **POST:** Verified for `school_admin`, `org_admin`, `super_admin`.
   - **POST Negative Space:** Verified 403 Forbidden for `exam_officer`, `teacher`, `student`.
   - **PATCH:** Verified for `school_admin` updating stream or stage.
   - **PATCH Negative Space:** Verified 403 Forbidden for `exam_officer` attempting stage approval.
   - **Cross-Tenant IDOR:** Verified that a school admin of Tenant A cannot view, mutate, or approve an applicant of Tenant B.
   - **Tenant Spoofing:** Verified that client-supplied `tenant_id` in request body is strictly ignored.

3. **Academic AI Integration Suite (`tests/auth/api-academic-ai-canonical.test.ts`):**
   - **Assigned Teacher:** Verified 200 OK for teacher assigned to offering.
   - **Unassigned Teacher:** Verified 403 Forbidden for teacher not assigned to offering.
   - **Department HOD:** Verified 200 OK for HOD of offering's department.
   - **Foreign HOD:** Verified 403 Forbidden for HOD of a different department.
   - **Cross-Tenant IDOR:** Verified 403/404 when attempting to access an offering belonging to another school.
   - **Pre-Service Halt:** Verified that Google Gemini API is NEVER called when authorization fails.

---

## 10. Risk Register & Mitigation Strategy

| Risk ID | Level | Description | Mitigation |
|---------|-------|-------------|------------|
| `RSK-3C-01` | **HIGH** | Legacy UI expects `exam_officer` to create applicants in `/api/admissions`. | The canonical catalog explicitly omits `create` for exam officers. The backend must enforce catalog truth; UI adjustments will align in Phase 3D. |
| `RSK-3C-02` | **HIGH** | Academic AI route currently uses direct `pg.Pool` without Supabase client context. | Update `/api/academics/ai/lesson-plan` to authorize via `authorizeApiRequest(req, { permission: 'curriculum.version.create', resolveResource: { type: 'subject_offering', id: offering_id } })`. |
| `RSK-3C-03` | **MEDIUM** | Incomplete applicant data could cause resolver to fail. | Resolver selects only immutable `id, tenant_id, stage` and fails fast with 404 if missing. |
| `RSK-3C-04` | **LOW** | Performance latency in resource resolution lookup. | Resolvers query indexed primary keys (`applicants.id`, `subject_offerings.id`) using `maybeSingle()`. |

---

## 11. Dependencies

1. **Phase 3A Authorization Engine:** FROZEN (`d38490b`). No changes permitted.
2. **Phase 3B API Guard:** MERGED (`fa16b8a`). Ready to consume.
3. **Database Schema:** Tables `public.applicants` and `public.subject_offerings` are active with valid RLS policies. No new migrations needed.
4. **Environment:** Google Generative AI API key configured for AI testing.

---

## 12. Rollback Strategy

Phase 3C changes will be isolated to:
1. `src/lib/auth/resource-resolver.ts` (adding applicant target resolver).
2. `src/app/api/admissions/route.ts` (canonicalizing GET, POST, PATCH).
3. `src/app/api/academics/ai/lesson-plan/route.ts` (canonicalizing POST).
4. New test files in `tests/auth/`.

If a regression occurs:
- The implementation branch `ai-eos/task-0007-phase-3c-implementation` can be reverted cleanly to base commit `e4d673e`.
- No database migrations, schemas, or data records are modified, ensuring zero persistent rollback risk.

---

## 13. Proposed Acceptance Criteria

- **`3C-AC-001` (Admissions GET Canonicalization):** `GET /api/admissions` requires canonical permission `admissions.applicants.view` at `school` scope. Rejects unauthenticated callers (401) and callers without the permission (403). Allows `school_admin`, `org_admin`, `super_admin`, and `exam_officer`.
- **`3C-AC-002` (Admissions POST Canonicalization):** `POST /api/admissions` requires canonical permission `admissions.applicants.create` at `school` scope. Enforces tenant binding to authorized caller. Strictly rejects `exam_officer` (403), eliminating legacy role leakage.
- **`3C-AC-003` (Admissions PATCH Canonicalization):** `PATCH /api/admissions` requires canonical permission `admissions.applicants.approve` at `school` scope. Authoritatively resolves applicant target via `resolveTrustedApplicantTarget`. Rejects `exam_officer` (403).
- **`3C-AC-004` (Applicant Resource Resolver):** `resolveTrustedApplicantTarget` returns a branded `TrustedResourceTarget` with authoritative `tenantId` and `stage`. Throws `ResourceNotFoundError` for nonexistent applicant IDs.
- **`3C-AC-005` (Academic AI IDOR Remediation):** `POST /api/academics/ai/lesson-plan` requires canonical permission `curriculum.version.create` at `offering` scope with authoritative `subject_offering` resolution.
- **`3C-AC-006` (Offering Assignment Enforcement):** `POST /api/academics/ai/lesson-plan` allows assigned `subject_teacher`, departmental `hod`, and school administrators. Rejects unassigned teachers and students with 403 Forbidden.
- **`3C-AC-007` (Pre-Service Gate):** Under no circumstances is the external Google Gemini API invoked if authorization or resource resolution fails.
- **`3C-AC-008` (Cross-Tenant Containment):** Any attempt to view, mutate, or generate lesson plans for resources belonging to another tenant is rejected with 403 or 404 without data disclosure.
- **`3C-AC-009` (Phase 3A Invariant Preservation):** Phase 3A files (`permissions-registry.ts`, `authorization-engine.ts`, `authorization-context-resolver.ts`) remain 100% byte-for-byte unchanged (`git diff` clean).
- **`3C-AC-010` (Test Suite Pass):** All existing Phase 3A/3B tests and newly implemented Phase 3C tests pass with zero failures and zero skipped assertions.
