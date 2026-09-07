# TASK-0007 Phase 3C-A — Operation-Oriented API Charter & Security Specification

**Task:** TASK-0007 Phase 3C-A  
**Stage:** Architecture & Specification Only  
**Status:** ARCHITECTURE READY — AWAITING SUPERVISORY APPROVAL  
**Branch:** `ai-eos/task-0007-phase-3c-a-permission-architecture`  
**Base Commit:** `e4d673e`  
**Supervisory Authority:** ChatGPT (Chief Software Architect & Project Supervisor)  
**Final Authority:** Human Project Owner  

---

## 1. Executive Architectural Rationale

The preflight discovery of TASK-0007 Phase 3C revealed a fundamental tension in the legacy API design:
1. **The Monolithic PATCH Anti-Pattern:** A single endpoint (`PATCH /api/admissions`) ingested 24 disparate fields, ranging from benign phone number corrections to irreversible executive admission approvals and state machine transitions. Attempting to attach a single coarse permission (`admissions.applicants.approve`) to this monolithic route created severe privilege over-granting and forced clerical demographic edits to require executive headmaster authority.
2. **AI Boundary Inversion:** The Academic AI route (`POST /api/academics/ai/lesson-plan`) invoked an external LLM API without verifying tenant tenancy, offering assignment, or role permissions, creating high-risk token-drain and cross-tenant data leakage vulnerabilities.

This API Charter establishes an **Operation-Oriented API Architecture** that maps each distinct business capability to a dedicated, bounded API endpoint guarded by trusted resource resolution, pure canonical authorization, and strict side-effect sequencing.

---

## 2. API Architecture Decision: Command-Oriented Admissions Endpoints

### 2.1 Monolithic vs. Command-Oriented Analysis

```text
┌────────────────────────────────────────┬────────────────────────────────────────┐
│ Monolithic PATCH Model                 │ Command-Oriented Model (RECOMMENDED)   │
├────────────────────────────────────────┼────────────────────────────────────────┤
│ ❌ Single giant payload (24 fields)    │ ✅ Granular, type-safe command payloads│
│ ❌ Privilege collapse: clerical updates│ ✅ Clean privilege segregation:        │
│    require executive approve rights    │    clerical (manage) vs scoring (eval) │
│ ❌ State machine transitions triggered │ ✅ State machine transitions explicit  │
│    by side effects of field presence   │    and validated against valid states  │
│ ❌ Audit logging cannot distinguish    │ ✅ Precise, auditable command records  │
│    data correction from decision       │    with dedicated reason tracking      │
│ ❌ Exam Officers over-granted or blocked│ ✅ Exam Officers granted strictly to   │
│                                        │    scoring & streaming endpoints       │
└────────────────────────────────────────┴────────────────────────────────────────┘
```

### 2.2 Endpoint Decomposition Strategy

To maintain backward compatibility during the transitional migration while establishing strict canonical security, the architecture establishes:

1. **`PATCH /api/admissions/:id` (Demographic Maintenance):** Bounded strictly to clerical, demographic, and contact fields. Forbidden from modifying scores, streams, stages, or statuses.
2. **`POST /api/admissions/:id/evaluate` (Academic Assessment):** Dedicated command for entrance exam scores, interview notes, and national test aggregates (NPSE/BECE).
3. **`POST /api/admissions/:id/stream` (Stream Track Placement):** Dedicated command for WAEC senior secondary track allocation (Science, Arts, Commercial, Technical).
4. **`POST /api/admissions/:id/approve` (Executive Adjudication — Offer):** Dedicated executive command to advance applicant to `Offer` stage with formal admission offer.
5. **`POST /api/admissions/:id/reject` (Executive Adjudication — Rejection):** Dedicated executive command to advance applicant to `Rejected` status with mandatory rejection reason.
6. **`POST /api/admissions/:id/letter` (Document Dispatch):** Dedicated command to record formal admission letter generation and dispatch.

---

## 3. Comprehensive Endpoint Specifications

### 3.1 `GET /api/admissions` — Applicant Registry Listing & Statistics
- **Business Operation:** List applicant records and aggregate admission stage/stream statistics for an institution.
- **Permission:** `admissions.applicants.view`
- **Canonical Scope:** `school`
- **Allowed Actors:** `super_admin` (platform reach), `org_admin` (org reach), `school_admin` (school scope), `exam_officer` (school scope).
- **Resource Resolution:**
  - Untrusted inputs: `tenantSlug` (query), `schoolLevel`, `stream`, `stage`, `search`, `page`, `limit`.
  - Authoritative target: Resolved via `resolveSchoolResource(callerContext, requestedTenantSlug)`.
  - Isolation guarantee: Query is hard-filtered by `tenant_id = trustedSchool.id`.
- **State Transition:** None (Read-only).
- **Separation of Duties (SoD):** None.
- **Side Effects:** None.
- **Audit Requirement:** Standard API access telemetry.

---

### 3.2 `POST /api/admissions` — Applicant Registration
- **Business Operation:** Create a new candidate admission application record.
- **Permission:** `admissions.applicants.create`
- **Canonical Scope:** `school`
- **Allowed Actors:** `super_admin`, `org_admin`, `school_admin`. (`exam_officer`, `teacher`, `student`, `parent` DENIED).
- **Resource Resolution:**
  - Untrusted inputs: Request body (`firstName`, `lastName`, `dob`, `schoolLevel`, etc.). Any body-supplied `tenant_id` or `stage` is discarded.
  - Authoritative target: `trustedSchool.id` derived strictly from authenticated context.
- **State Transition:** Initial state set deterministically to `stage = 'Application'`, `status = 'active'`.
- **Separation of Duties (SoD):** None.
- **Side Effects:**
  - Automatic stream placement evaluation if BECE subject results are provided at registration for SSS applicants (`stream_auto_placed = true`).
- **Audit Requirement:** Creation logged in `audit_logs` or `admission_history`.

---

### 3.3 `PATCH /api/admissions/:id` — Applicant Demographic Maintenance
- **Business Operation:** Correct or update clerical contact details, parent information, or biographical data.
- **Permission:** `admissions.applicants.manage` (PROPOSED)
- **Canonical Scope:** `school`
- **Allowed Actors:** `super_admin`, `org_admin`, `school_admin`. (`exam_officer` STRICTLY DENIED).
- **Permitted Fields:** `firstName`, `lastName`, `dob`, `gender`, `email`, `phone`, `address`, `city`, `parentName`, `parentPhone`, `parentEmail`, `parentRelation`, `previousSchool`, `targetGrade`.
- **Forbidden Fields (Rejected with 400 Bad Request if present):** `stage`, `status`, `rejectionReason`, `interviewScore`, `assessmentScore`, `targetStream`, `streamAutoPlaced`, `admissionLetterSent`, `docsVerified`.
- **Resource Resolution:**
  - Authoritative target: `resolveApplicantTarget(id)` loads `{ id, tenant_id, organization_id, stage, status }`.
  - Tenant validation: `applicant.tenant_id` must match `callerContext.schoolId` (or within `org_admin` network).
- **State Transition:** None. `stage` and `status` remain unaltered.
- **Separation of Duties (SoD):** None.
- **Side Effects:** Updates `updated_at`.
- **Audit Requirement:** Audit trail recording modified fields and actor identity.

---

### 3.4 `POST /api/admissions/:id/evaluate` — Entrance Evaluation & Scoring
- **Business Operation:** Record entrance exam marks, interview results, and verify prerequisite examination results (NPSE/BECE).
- **Permission:** `admissions.applicants.evaluate` (PROPOSED)
- **Canonical Scope:** `school`
- **Allowed Actors:** `super_admin`, `org_admin`, `school_admin`, `exam_officer` (functional assignment).
- **Permitted Fields:** `interviewScore`, `assessmentScore`, `docsVerified`, `npseAggregate`, `beceAggregate`, `beceSubjects`, `wassceCredits`, `wassceSubjects`, `nationalIndexNo`.
- **Resource Resolution:**
  - Authoritative target: `resolveApplicantTarget(id)`.
  - Lifecycle validation: Applicant must be in `stage IN ('Application', 'Assessment', 'Interview')` and `status = 'active'`.
- **State Transition:** If in `Application`, automatically advances `stage = 'Assessment'` or `stage = 'Interview'`.
- **Separation of Duties (SoD):** Exam Officer can evaluate scores, but cannot approve admission offer.
- **Side Effects:** Appends record to `admission_history`.
- **Audit Requirement:** High-priority score audit recording evaluator ID, timestamp, and score delta.

---

### 3.5 `POST /api/admissions/:id/stream` — WAEC Stream Track Placement
- **Business Operation:** Assign a Senior Secondary School applicant to a specialised academic stream track (Science, Arts, Commercial, Technical).
- **Permission:** `admissions.applicants.evaluate` (PROPOSED)
- **Canonical Scope:** `school`
- **Allowed Actors:** `super_admin`, `org_admin`, `school_admin`, `exam_officer`.
- **Permitted Fields:** `targetStream`, `manualOverrideReason`.
- **Resource Resolution:**
  - Authoritative target: `resolveApplicantTarget(id)`.
  - Validation: Applicant `school_level` must equal `'SSS'`.
- **State Transition:** Sets `target_stream`, updates `stream_auto_placed = false`, `stream_placed_at = NOW()`.
- **Separation of Duties (SoD):** Technical stream qualification does not constitute an offer of admission.
- **Side Effects:** Appends stream change to `admission_history`.
- **Audit Requirement:** Mandatory audit record of stream allocation.

---

### 3.6 `POST /api/admissions/:id/approve` — Admission Offer Adjudication
- **Business Operation:** Issue a formal admission offer to an applicant.
- **Permission:** `admissions.applicants.approve` (EXISTING)
- **Canonical Scope:** `school`
- **Allowed Actors:** `super_admin`, `org_admin`, `school_admin`. (`exam_officer`, `teacher`, `student`, `parent` STRICTLY DENIED).
- **Permitted Fields:** `acceptanceDeadline`, `adjudicationNotes`.
- **Resource Resolution:**
  - Authoritative target: `resolveApplicantTarget(id)`.
  - Lifecycle validation: Must be in `stage IN ('Assessment', 'Interview', 'Application')` and `status = 'active'`. Cannot approve already `Enrolled`, `Rejected`, or `Withdrawn` applicants.
- **State Transition:** Updates `stage = 'Offer'`, `status = 'active'`, `docs_verified = true`.
- **Separation of Duties (SoD):** Executive Headmaster / Administrator authority strictly enforced. Evaluators/Exam Officers are blocked from unilateral admission grants.
- **Side Effects:** Inserts formal state transition log in `admission_history`.
- **Audit Requirement:** Compliance-level audit log recording executive approver ID and timestamp.

---

### 3.7 `POST /api/admissions/:id/reject` — Admission Rejection Adjudication
- **Business Operation:** Formally decline or reject an admission application.
- **Permission:** `admissions.applicants.approve` (EXISTING)
- **Canonical Scope:** `school`
- **Allowed Actors:** `super_admin`, `org_admin`, `school_admin`. (`exam_officer` STRICTLY DENIED).
- **Permitted Fields:** `rejectionReason` (Mandatory, non-empty string).
- **Resource Resolution:**
  - Authoritative target: `resolveApplicantTarget(id)`.
  - Lifecycle validation: Applicant must not already be in `stage = 'Allocation'` (Enrolled).
- **State Transition:** Sets `status = 'rejected'`, `rejection_reason = rejectionReason`.
- **Separation of Duties (SoD):** Only authorized administrators can formally reject applicants.
- **Side Effects:** Records rejection event in `admission_history`.
- **Audit Requirement:** Compliance-level rejection audit log.

---

### 3.8 `POST /api/admissions/:id/letter` — Document Dispatch Recording
- **Business Operation:** Generate and record dispatch of formal admission letter to parent/guardian.
- **Permission:** `admissions.applicants.manage` (PROPOSED)
- **Canonical Scope:** `school`
- **Allowed Actors:** `super_admin`, `org_admin`, `school_admin`.
- **Permitted Fields:** `deliveryMethod` ('email' | 'sms' | 'in_person'), `letterTemplateId`.
- **Resource Resolution:**
  - Authoritative target: `resolveApplicantTarget(id)`.
  - Lifecycle validation: Applicant must be in `stage = 'Offer'` or `stage = 'Allocation'`.
- **State Transition:** Sets `admission_letter_sent = true`, `admission_letter_sent_at = NOW()`.
- **Separation of Duties (SoD):** None.
- **Side Effects:** Enqueues notification delivery job if email/SMS selected.
- **Audit Requirement:** Dispatch record logged in `admission_history`.

---

### 3.9 `POST /api/academics/ai/lesson-plan` — Academic AI Lesson Plan Generation
- **Business Operation:** Generate pedagogical classroom delivery outline for a published curriculum topic.
- **Permission:** `curriculum.lesson_plan.create` (PROPOSED)
- **Canonical Scope:** `offering`
- **Allowed Actors:** `super_admin`, `org_admin`, `school_admin`, `subject_teacher` (assigned to offering), `hod` (department head of offering's department).
- **Permitted Fields:** `offering_id` (UUID), `topic_id` (UUID), `duration_minutes` (number, 20-120), `style` ('standard' | 'inquiry' | 'project' | 'direct').
- **Resource Resolution:**
  - Authoritative target: `resolveSubjectOfferingTarget(offering_id)` loads:
    `{ offering_id, subject_id, school_id, organization_id, department_id, assigned_teacher_id, academic_year_id, curriculum_version_id, curriculum_status }`.
  - Teacher verification: If caller is a `teacher`, caller's actor ID must match `assigned_teacher_id`.
  - Department verification: If caller is an `hod`, offering's department must match HOD's department.
  - Lifecycle verification: `curriculum_status` must equal `'published'`.
  - Topic verification: `topic_id` must belong to `curriculum_version_id`.
- **State Transition:** None (Generative computation).
- **Separation of Duties (SoD):** None.
- **Side Effects:**
  - Writes token consumption log to `ai_usage_logs` (`tenant_id`, `user_id`, `offering_id`, `input_tokens`, `output_tokens`, `model = 'gemini-2.0-flash'`).
- **Audit Requirement:** Audit of token consumption against tenant quota.

---

## 4. Resource Authorization & Trusted Resolution Model

All endpoints MUST resolve authoritative context from trusted database state rather than client-supplied claims.

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              TRUSTED RESOURCE RESOLUTION FLOW                           │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  Client Request: { applicantId: "uuid-123", tenantSlug: "hastings" }                  │
│        │                                                                               │
│        ▼                                                                               │
│  1. Authenticate JWT Session ──► auth.uid()                                           │
│        │                                                                               │
│        ▼                                                                               │
│  2. Load Authoritative Target Record (Bypassing Untrusted Client Claims):              │
│     SELECT id, tenant_id, stage, status FROM applicants WHERE id = 'uuid-123'          │
│        │                                                                               │
│        ▼                                                                               │
│  3. Resolve Canonical Authorization Context for Caller:                                │
│     Caller: roles, schoolId, organizationId, functionalAssignments                     │
│        │                                                                               │
│        ▼                                                                               │
│  4. Construct TrustedResourceTarget:                                                   │
│     Target: { resourceType: 'applicant', schoolId: applicant.tenant_id, ... }          │
│        │                                                                               │
│        ▼                                                                               │
│  5. Pure Engine Evaluation:                                                            │
│     evaluatePermission('admissions.applicants.evaluate', target, context)              │
│        │                                                                               │
│        ▼                                                                               │
│     [ ALLOW ] ──► Execute Command Logic                                                │
│     [ DENY  ] ──► Return 403 Forbidden                                                 │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Authoritative Facts Required for Admissions Target
To evaluate permissions against an applicant, the resolver must construct a `TrustedResourceTarget` containing:
- `resourceType`: `'applicant'`
- `id`: Applicant UUID
- `schoolId`: `applicant.tenant_id` (The school owning the record)
- `organizationId`: School's parent organization UUID
- `stage`: Current admission lifecycle stage
- `status`: Current record status

### 4.2 Authoritative Facts Required for Academic AI Offering Target
To evaluate `curriculum.lesson_plan.create`, the resolver must construct a `TrustedResourceTarget` containing:
- `resourceType`: `'offering'`
- `id`: Subject Offering UUID
- `schoolId`: `offering.tenant_id`
- `organizationId`: School's parent organization UUID
- `departmentId`: Subject's department UUID
- `offeringId`: `offering.id`
- `assignedTeacherId`: `offering.teacher_id` (Linked teacher user profile)
- `curriculumVersionId`: `offering.curriculum_version_id`
- `curriculumStatus`: `cv.status` (Must be `'published'`)

---

## 5. AI Side-Effect Security & Execution Ordering

Under invariant `INV-3C-A-09`, external AI model invocations consume external institutional credits and must **never** be triggered speculatively or prior to authorization.

### 5.1 Mandatory Execution Pipeline

```text
Step 1: Authenticate Caller
        Verify valid Supabase session token. Reject unauthenticated (401).
           ↓
Step 2: Validate Schema & Input Parameters
        Verify offering_id, topic_id format. Reject malformed payloads (400).
           ↓
Step 3: Resolve Trusted Resource Target
        Fetch offering, subject, teacher assignment, curriculum version from DB.
        Reject non-existent resources (404).
           ↓
Step 4: Resolve Canonical Authorization Context
        Load caller's effective roles, assignments, and tenant boundaries.
           ↓
Step 5: Pure Engine Permission Evaluation
        evaluatePermission('curriculum.lesson_plan.create', offeringTarget, authContext).
        Reject unauthorized callers (403). Zero downstream calls occur.
           ↓
Step 6: Validate Institutional Business Preconditions
        Verify offering.curriculum_status === 'published'.
        Verify topic belongs to offering's curriculum version.
        Reject invalid curriculum state (422 Unprocessable Entity).
           ↓
Step 7: Enforce AI Quotas & Rate Limits
        Check tenant AI usage limit in ai_usage_logs for current billing period.
        Reject quota exhaustion (429 Too Many Requests).
           ↓
Step 8: Construct Bounded Grounding Prompt
        Assemble structured prompt using strictly DB-resolved topic & outcomes.
           ↓
Step 9: Invoke External AI Provider (Google Gemini API)
        Execute HTTP POST with server-held GEMINI_API_KEY.
        Handle provider timeout / 502 gracefully.
           ↓
Step 10: Persist Audit & Token Attribution
        Insert row into ai_usage_logs with exact token counts and tenant_id.
           ↓
Step 11: Return Formatted Result to Client
```

### 5.2 Failure & Security Invariants
1. **Zero-Token Unauthorized Requests:** If an attacker attempts to generate a lesson plan for an offering in another school, or if a student/parent attempts to invoke the endpoint, the pipeline aborts at Step 5. **Zero calls are made to Google Gemini**.
2. **Deterministic Attribution:** `tenant_id` in `ai_usage_logs` is derived from the **offering's authoritative school ID**, never from client-controlled headers.
3. **Draft Syllabus Protection:** If a teacher attempts to generate AI content for a curriculum that is still in draft or archive status, the pipeline aborts at Step 6 with HTTP 422.

---

## 6. Comprehensive Security Test Plan

The subsequent implementation phase must satisfy the following comprehensive test matrix:

### 6.1 Cross-Tenant Isolation Tests
1. **`TEST-SEC-XT-01` (Admissions View Cross-Tenant):** School A `school_admin` attempts `GET /api/admissions?tenantSlug=school-b`. Expected: 403 Forbidden (or filtered strictly to School A).
2. **`TEST-SEC-XT-02` (Admissions Mutation Cross-Tenant):** School A `school_admin` attempts `PATCH /api/admissions/uuid-of-school-b-applicant`. Expected: 403 Forbidden. Target record untouched.
3. **`TEST-SEC-XT-03` (Academic AI Cross-Tenant):** School A teacher attempts `POST /api/academics/ai/lesson-plan` with `offering_id` of School B. Expected: 403 Forbidden. External AI mock count = 0.
4. **`TEST-SEC-XT-04` (Org Admin Boundary):** Org 1 `org_admin` attempts command against School in Org 2. Expected: 403 Forbidden.

### 6.2 Role & Privilege Abuse Tests
1. **`TEST-SEC-RO-01` (Teacher Admissions Approval):** Teacher attempts `POST /api/admissions/:id/approve`. Expected: 403 Forbidden.
2. **`TEST-SEC-RO-02` (Exam Officer Demographic Mutation):** Exam Officer attempts `PATCH /api/admissions/:id` with new parent email. Expected: 403 Forbidden.
3. **`TEST-SEC-RO-03` (Exam Officer Executive Approval):** Exam Officer attempts `POST /api/admissions/:id/approve`. Expected: 403 Forbidden.
4. **`TEST-SEC-RO-04` (Student/Parent Admissions Mutation):** Student attempts `POST /api/admissions/:id/evaluate`. Expected: 403 Forbidden.
5. **`TEST-SEC-RO-05` (Unassigned Teacher AI Generation):** Teacher A attempts `POST /api/academics/ai/lesson-plan` for an offering assigned to Teacher B (in same school). Expected: 403 Forbidden (unless Teacher A is HOD of that department).

### 6.3 Scope Abuse Tests
1. **`TEST-SEC-SC-01` (Offering Scope Containment):** Teacher assigned to Offering 1 attempts to invoke offering-scoped action on Offering 2 in the same school. Expected: 403 Forbidden.
2. **`TEST-SEC-SC-02` (Department Scope Containment):** HOD of Science Department attempts to invoke departmental lesson planning on an Arts Department offering. Expected: 403 Forbidden.

### 6.4 Client Spoofing Tests
1. **`TEST-SEC-SP-01` (Client-Injected Role):** Client sends `{ role: 'super_admin' }` in JSON body to `/api/admissions/:id/approve`. Expected: Request evaluated strictly using JWT role; spoofed body field ignored; 403 Forbidden.
2. **`TEST-SEC-SP-02` (Client-Injected Tenant ID):** Client sends `{ tenant_id: 'foreign-uuid' }` in `POST /api/admissions`. Expected: Record created strictly under caller's authenticated tenant ID.
3. **`TEST-SEC-SP-03` (Client-Injected Stage):** Client sends `{ stage: 'Offer' }` to `PATCH /api/admissions/:id`. Expected: 400 Bad Request (Field forbidden in maintenance endpoint).

### 6.5 AI Side-Effect & Token Drain Tests
1. **`TEST-SEC-AI-01` (Auth Failure Mock Count):** Unauthenticated request to `/api/academics/ai/lesson-plan`. Expected: 401 Unauthorized. Gemini fetch spy called 0 times.
2. **`TEST-SEC-AI-02` (Draft Curriculum Rejection):** Valid teacher request for offering with `curriculum_status = 'draft'`. Expected: 422 Unprocessable Entity. Gemini fetch spy called 0 times.
3. **`TEST-SEC-AI-03` (Authorized Invocation):** Authorized teacher request for published offering. Expected: 200 OK. Gemini fetch spy called exactly 1 time with correct system grounding. Usage logged to `ai_usage_logs`.
