# TASK-0007 Phase 3C-A — Operation-Oriented API Charter & Security Specification (Final Revision)

**Task:** TASK-0007 Phase 3C-A  
**Stage:** Architecture & Specification Only  
**Status:** ARCHITECTURE READY — AWAITING SUPERVISORY APPROVAL  
**Branch:** `ai-eos/task-0007-phase-3c-a-permission-architecture`  
**Base Commit:** `e4d673e`  
**Supervisory Authority:** ChatGPT (Chief Software Architect & Project Supervisor)  
**Final Authority:** Human Project Owner  

---

## 1. Executive Architectural Rationale & Final Revisions

In response to the final supervisory review, this specification formalizes the **command-oriented API architecture**, end-to-end enrollment lifecycle, AI authorization pipeline, and admission-letter dispatch mechanics:

1. **Organization-Admin School-Scope Semantics:** For all school-scoped admissions endpoints, `org_admin` authority is strictly bounded to child schools within the caller's server-resolved organization subtree (`context.organizationSubtenantIds`). Reaching into unrelated schools is rejected with HTTP 403.
2. **Complete Enrollment Lifecycle Chain:** Formally specifies the 9-stage prerequisite pipeline from executive admission offer to permanent student registration, guaranteeing idempotency, concurrency serialization via row-level locks, and atomic rollback on partial failure.
3. **Strict AI Authorization & Zero Side-Effect Guarantee:** Formulates the authorization semantics for `curriculum.lesson_plan.generate`. Unauthorized requests, cross-tenant offerings, unassigned teachers, and draft syllabus versions result in **zero external AI calls, zero token quota consumption, and zero database usage logs**.
4. **Admission Letter Dispatch Rules:** Establishes server-controlled dispatch state, resend policies, provider retry mechanics, and idempotency guarantees for `admissions.letters.dispatch`.
5. **Comprehensive Security Test Contract:** Expands test specifications covering organization isolation, enrollment boundaries, AI side effects, and letter dispatch idempotency.

---

## 2. Operation-Oriented Endpoint Inventory

```text
┌──────────────────────────────────────────────┬────────────────────────────────┬───────────────────────────────┐
│ Endpoint                                     │ Business Operation             │ Canonical Permission          │
├──────────────────────────────────────────────┼────────────────────────────────┼───────────────────────────────┤
│ GET /api/admissions                          │ List & Aggregate Applicants    │ admissions.applicants.view    │
│ POST /api/admissions                         │ Register Initial Applicant     │ admissions.applicants.create  │
│ PATCH /api/admissions/:id                    │ Demographic Maintenance        │ admissions.applicants.manage  │
│ POST /api/admissions/:id/evaluate            │ Entrance Scoring & Assessment  │ admissions.applicants.evaluate│
│ POST /api/admissions/:id/stream              │ WAEC Stream Track Allocation   │ admissions.applicants.place   │
│ POST /api/admissions/:id/approve             │ Executive Admission Offer      │ admissions.applicants.approve │
│ POST /api/admissions/:id/reject              │ Executive Rejection Decision   │ admissions.applicants.approve │
│ POST /api/admissions/:id/letter              │ Official Letter Dispatch       │ admissions.letters.dispatch   │
│ POST /api/admissions/:id/enroll              │ Master Student Enrollment      │ admissions.applicants.enroll  │
│ POST /api/academics/ai/lesson-plan           │ Ephemeral Lesson Generation    │ curriculum.lesson_plan.       │
│                                              │                                │ generate                      │
└──────────────────────────────────────────────┴────────────────────────────────┴───────────────────────────────┘
```

---

## 3. Comprehensive Endpoint Specifications

### 3.1 `GET /api/admissions` — Applicant Registry Listing & Statistics
- **Business Operation:** Query applicant records and stage/stream metrics.
- **Permission:** `admissions.applicants.view` | **Scope:** `school`
- **Allowed Actors:** `super_admin`, `org_admin`, `school_admin`, `exam_officer`.
- **Org Reach Rule:** `org_admin` access allowed ONLY if target school is in `organizationSubtenantIds`.
- **Resource Resolution:** Authoritative school ID resolved from authenticated caller context.
- **State Transition:** None (Read-only).
- **SoD & Audit:** Read access logged in standard telemetry.

---

### 3.2 `POST /api/admissions` — Initial Applicant Registration
- **Business Operation:** Create initial candidate record in `Application` stage.
- **Permission:** `admissions.applicants.create` | **Scope:** `school`
- **Allowed Actors:** `super_admin`, `org_admin`, `school_admin`. (`exam_officer`, `teacher`, `student`, `parent` DENIED).
- **Org Reach Rule:** `org_admin` access allowed ONLY if target school is in `organizationSubtenantIds`.
- **Resource Resolution:** Target `tenant_id` resolved authoritatively from caller context; client claims ignored.
- **State Transition:** Deterministically sets `stage = 'Application'`, `status = 'active'`.
- **Side Effects:** Auto-stream evaluation if valid BECE subjects are provided at intake.
- **Audit Requirement:** Creation record appended to `admission_history`.

---

### 3.3 `PATCH /api/admissions/:id` — Applicant Demographic Maintenance
- **Business Operation:** Clerical maintenance of candidate biographical details and parent contact data.
- **Permission:** `admissions.applicants.manage` | **Scope:** `school`
- **Allowed Actors:** `super_admin`, `org_admin`, `school_admin`. (`exam_officer` STRICTLY DENIED).
- **Org Reach Rule:** `org_admin` access allowed ONLY if target school is in `organizationSubtenantIds`.
- **Permitted Fields:** `firstName`, `lastName`, `dob`, `gender`, `email`, `phone`, `address`, `city`, `parentName`, `parentPhone`, `parentEmail`, `parentRelation`, `previousSchool`, `targetGrade`.
- **Forbidden Fields (Rejected with 400 Bad Request):** `stage`, `status`, `rejectionReason`, `interviewScore`, `assessmentScore`, `targetStream`, `streamAutoPlaced`, `admissionLetterSent`, `docsVerified`.
- **Resource Resolution:** Target applicant resolved from database; tenant match enforced.
- **State Transition:** None. `stage` and `status` remain unaltered.
- **Audit Requirement:** Delta log of updated fields recorded in audit trail.

---

### 3.4 `POST /api/admissions/:id/evaluate` — Entrance Evaluation & Scoring
- **Business Operation:** Record entrance exam marks, interview results, and verify external national aggregates (NPSE/BECE).
- **Permission:** `admissions.applicants.evaluate` | **Scope:** `school`
- **Allowed Actors:** `super_admin`, `org_admin`, `school_admin`, `exam_officer`.
- **Org Reach Rule:** `org_admin` access allowed ONLY if target school is in `organizationSubtenantIds`.
- **Permitted Fields:** `interviewScore`, `assessmentScore`, `docsVerified`, `npseAggregate`, `beceAggregate`, `beceSubjects`, `wassceCredits`, `wassceSubjects`, `nationalIndexNo`.
- **Resource Resolution:** Target applicant loaded from DB; caller's school authority verified.
- **Lifecycle Preconditions:** Must be in `stage IN ('Application', 'Assessment', 'Interview')` and `status = 'active'`.
- **State Transition:** If currently `Application`, automatically advances `stage = 'Assessment'` or `'Interview'`.
- **SoD:** Evaluator/Exam Officer cannot approve admission or allocate stream.
- **Audit Requirement:** Score modification audit recorded in `admission_history`.

---

### 3.5 `POST /api/admissions/:id/stream` — WAEC Stream Track Allocation
- **Business Operation:** Assign Senior Secondary School applicant to a specific academic track (Science, Arts, Commercial, Technical).
- **Permission:** `admissions.applicants.place` | **Scope:** `school`
- **Allowed Actors:** `super_admin`, `org_admin`, `school_admin`, `exam_officer`.
- **Org Reach Rule:** `org_admin` access allowed ONLY if target school is in `organizationSubtenantIds`.
- **Permitted Fields:** `targetStream`, `manualOverrideReason`.
- **Resource Resolution:** Target applicant loaded from DB. Verifies `school_level === 'SSS'`.
- **Lifecycle Preconditions:** Must be in `stage IN ('Application', 'Assessment', 'Interview', 'Offer')` and `status = 'active'`.
- **State Transition:** Sets `target_stream`, updates `stream_auto_placed = false`, `stream_placed_at = NOW()`.
- **SoD:** Stream placement qualifies candidate for a track but DOES NOT issue an admission offer or enroll the student.
- **Audit Requirement:** Stream allocation event logged in `admission_history`.

---

### 3.6 `POST /api/admissions/:id/approve` — Executive Admission Offer Adjudication
- **Business Operation:** Issue a formal admission offer extending an invitation to join the institution.
- **Permission:** `admissions.applicants.approve` | **Scope:** `school`
- **Allowed Actors:** `super_admin`, `org_admin`, `school_admin`. (`exam_officer` STRICTLY DENIED).
- **Org Reach Rule:** `org_admin` access allowed ONLY if target school is in `organizationSubtenantIds`.
- **Permitted Fields:** `acceptanceDeadline`, `adjudicationNotes`.
- **Lifecycle Preconditions:** Must be in `stage IN ('Application', 'Assessment', 'Interview')` and `status = 'active'`. Cannot approve already `Offer`, `Allocation`, or `Rejected` applicants.
- **State Transition:** Sets `stage = 'Offer'`, `status = 'active'`, `docs_verified = true`.
- **SoD:** Approval extends an offer; it DOES NOT execute student enrollment.
- **Audit Requirement:** Formal adjudication record logged in `admission_history`.

---

### 3.7 `POST /api/admissions/:id/reject` — Executive Admission Rejection Adjudication
- **Business Operation:** Formally decline or disqualify an admission application.
- **Permission:** `admissions.applicants.approve` | **Scope:** `school`
- **Allowed Actors:** `super_admin`, `org_admin`, `school_admin`. (`exam_officer` STRICTLY DENIED).
- **Org Reach Rule:** `org_admin` access allowed ONLY if target school is in `organizationSubtenantIds`.
- **Permitted Fields:** `rejectionReason` (Mandatory, non-empty string).
- **Lifecycle Preconditions:** Must not already be enrolled (`stage != 'Allocation'`).
- **State Transition:** Sets `status = 'rejected'`, `rejection_reason = rejectionReason`.
- **Audit Requirement:** Rejection reason and executive author logged in `admission_history`.

---

### 3.8 `POST /api/admissions/:id/letter` — Official Admission Letter Dispatch (Detailed Section 7)
- **Business Operation:** Generate and dispatch official institutional admission offer letter.
- **Permission:** `admissions.letters.dispatch` | **Scope:** `school`
- **Allowed Actors:** `super_admin`, `org_admin`, `school_admin`. (`exam_officer`, `teacher`, `student`, `parent` STRICTLY DENIED).
- **Org Reach Rule:** `org_admin` access allowed ONLY if target school is in `organizationSubtenantIds`.
- **Eligible Applicant State:** Applicant must be in `stage IN ('Offer', 'Allocation')` and `status = 'active'`. Letters CANNOT be dispatched to applicants in `Application`, `Assessment`, `Interview`, or `Rejected` states (returns HTTP 422).
- **Resending Permitted:** YES. Families may request duplicate copies or updated letters. Resending is permitted for authorized actors.
- **Who Can Resend:** Authorized administrators holding `admissions.letters.dispatch`.
- **Dispatch Mode:**
  - **Synchronous:** Renders PDF document content / template preview and returns to client.
  - **Asynchronous:** Enqueues background notification job for outbound email/SMS delivery.
- **External Providers:** Outbound delivery dispatches to configured email gateway (SendGrid / Resend) or SMS provider (Twilio / Africa's Talking).
- **Provider Failure Handling:** If email/SMS gateway is unreachable (HTTP 502/503), the dispatch job retries up to 3 times with exponential backoff. The rendered document remains downloadable; failure is logged.
- **Dispatch Status Control:** Server-controlled. The server writes `admission_letter_sent = true` and `admission_letter_sent_at = NOW()`. Any client-supplied timestamps or flags in the request body are strictly ignored.
- **Immutability & History:** While `applicants.admission_letter_sent_at` reflects the latest dispatch timestamp, every dispatch event appends an immutable record into `public.admission_history` (`from_stage = stage`, `to_stage = stage`, `comment = 'Admission letter dispatched via ' || deliveryMethod`, `created_by = auth.uid()`).
- **Idempotency & Replay:** Client sends an optional `Idempotency-Key` header. Duplicate requests within a 60-second window return the existing dispatch result without re-enqueuing outbound messages.
- **Audit Requirements:** Full audit log recording template ID, recipient contact info, delivery channel, timestamp, and enacting administrator UUID.

---

### 3.9 `POST /api/admissions/:id/enroll` — Master Student Enrollment Transaction (Detailed Section 2)

#### Complete Prerequisite Chain:
```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        MASTER ENROLLMENT PREREQUISITE PIPELINE                         │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  1. Authenticated Actor: auth.uid() valid, active profile                              │
│        │                                                                               │
│        ▼                                                                               │
│  2. Target Resolution: Load applicant record from DB                                   │
│        │                                                                               │
│        ▼                                                                               │
│  3. Tenant Isolation & Org Subtree Check:                                              │
│     applicant.tenant_id === context.tenantId                                           │
│     || context.organizationSubtenantIds.includes(applicant.tenant_id)                   │
│     (Reject with 403 if foreign school)                                                │
│        │                                                                               │
│        ▼                                                                               │
│  4. Canonical Permission Check:                                                        │
│     evaluatePermission('admissions.applicants.enroll', target, context)                │
│     (Reject with 403 if unauthorized role)                                             │
│        │                                                                               │
│        ▼                                                                               │
│  5. Lifecycle State Prerequisites:                                                     │
│     - applicant.stage === 'Offer'                                                      │
│     - applicant.status === 'active'                                                    │
│     - applicant.docs_verified === true                                                 │
│     (Reject with 422 if in Application, Assessment, Interview, or Rejected)            │
│        │                                                                               │
│        ▼                                                                               │
│  6. Database Concurrency Lock:                                                         │
│     SELECT * FROM applicants WHERE id = p_applicant_id FOR UPDATE                      │
│     (Inside transaction, verify stage != 'Allocation')                                 │
│        │                                                                               │
│        ▼                                                                               │
│  7. Atomic Multi-Table Insertion:                                                      │
│     - INSERT INTO students (admission_number, tenant_id, ...) RETURNING id             │
│     - INSERT/SELECT INTO parents (tenant_id, phone, ...) RETURNING id                  │
│     - INSERT INTO student_parents (student_id, parent_id, ...)                         │
│     - UPDATE applicants SET stage = 'Allocation', status = 'enrolled'                  │
│        │                                                                               │
│        ▼                                                                               │
│  8. Immutable Audit Recording:                                                         │
│     INSERT INTO admission_history (tenant_id, applicant_id, from_stage, to_stage,      │
│                                    comment, created_by)                                │
│     VALUES (..., 'Offer', 'Allocation', 'Enrolled', p_actor_id)                        │
│        │                                                                               │
│        ▼                                                                               │
│  9. Commit & Return Permanent Student ID                                               │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Transaction & Concurrency Guarantees:
- **Idempotency & Duplicate Prevention:** If the applicant is already enrolled (`stage = 'Allocation'`), the lock reveals this immediately and raises an exception: `ALREADY_ENROLLED`. No duplicate student or parent rows are created.
- **Concurrency Behavior:** `SELECT ... FOR UPDATE` exclusively locks the applicant row for the duration of the transaction. Parallel requests queue on the row lock; the second transaction reads `stage = 'Allocation'` and fails safely.
- **Atomic Rollback:** If any insert fails (e.g. database constraint violation), the entire transaction rolls back cleanly. Zero partial records remain.
- **Audit Preservation:** The enacting administrator's `auth.uid()` is passed as `p_actor_id` and permanently written to `admission_history.created_by`.

---

### 3.10 `POST /api/academics/ai/lesson-plan` — AI Lesson Plan Generation (Detailed Section 6)

#### Authorization & Side-Effect Invariants:
```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        AI EXECUTION & SIDE-EFFECT SEQUENCE                             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  Step 1: Authenticate Caller (auth.uid())                                              │
│          Reject unauthenticated (HTTP 401). External AI calls = 0.                     │
│             ↓                                                                          │
│  Step 2: Resolve Target Offering & Context                                             │
│          Load offering, subject, teacher assignment, curriculum version from DB.       │
│          Reject non-existent resources (HTTP 404). External AI calls = 0.              │
│             ↓                                                                          │
│  Step 3: Evaluate Canonical Permission (curriculum.lesson_plan.generate)               │
│          - Scope: 'offering'                                                           │
│          - Org Reach: offering.tenant_id in organizationSubtenantIds                   │
│          - Teacher Assignment: if caller is teacher, actorId === offering.teacher_id   │
│          - Department: if caller is HOD, offering.department_id === HOD department     │
│          Reject unauthorized (HTTP 403). External AI calls = 0. Quota consumed = 0.   │
│             ↓                                                                          │
│  Step 4: Validate Curriculum & Topic Prerequisites                                     │
│          - offering.curriculum_status === 'published' (AI never runs on draft syllabus)│
│          - topic belongs to offering's published curriculum version                    │
│          - academic year is active                                                     │
│          Reject invalid state (HTTP 422). External AI calls = 0. Quota consumed = 0.   │
│             ↓                                                                          │
│  Step 5: Enforce Tenant AI Token Quota                                                 │
│          Sum billing period usage from ai_usage_logs for offering.tenant_id.           │
│          Reject quota exhaustion (HTTP 429). External AI calls = 0.                    │
│             ↓                                                                          │
│  Step 6: Invoke Google Gemini API                                                      │
│          Execute HTTP POST using server-held GEMINI_API_KEY.                           │
│             ↓                                                                          │
│  Step 7: Persist Audit & Token Attribution                                             │
│          Insert usage log into public.ai_usage_logs (offering.tenant_id, auth.uid(),   │
│          feature='lesson_plan', input_tokens, output_tokens, status='success').        │
│             ↓                                                                          │
│  Step 8: Return Ephemeral JSON to Client Session                                       │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

#### The Zero Side-Effect Guarantee:
Under invariant `INV-3C-A-09`:
- Any failure at Steps 1, 2, 3, 4, or 5 **halts execution immediately**.
- **Zero calls are made to Google Gemini**.
- **Zero tokens are consumed**.
- **Zero records are inserted into `public.ai_usage_logs`**.
- The existing system does NOT record rejected requests in `ai_usage_logs` (rejected requests are recorded exclusively in standard server access telemetry).

---

## 4. Comprehensive Security Test Contract (Required Section 10)

The subsequent implementation phase must satisfy this expanded test contract:

### 4.1 Organization Isolation Tests
1. **`TEST-ORG-01` (Org Admin Child School Access):** Org Admin of Org 1 attempts `PATCH /api/admissions/:id` on applicant in School A (child school of Org 1). Expected: **200 OK**.
2. **`TEST-ORG-02` (Org Admin Foreign School Access):** Org Admin of Org 1 attempts `PATCH /api/admissions/:id` on applicant in School C (child school of Org 2). Expected: **403 Forbidden** (`OUT_OF_SCOPE`).
3. **`TEST-ORG-03` (Org Admin Foreign AI Generation):** Org Admin of Org 1 requests lesson plan for offering in School C (Org 2). Expected: **403 Forbidden**. Gemini API calls = 0.

### 4.2 Enrollment Security Tests
1. **`TEST-ENR-01` (Unauthorized Direct RPC Denied):** Authenticated student or teacher calls `supabase.rpc('enroll_applicant')`. Expected: **403 Permission Denied** (PostgreSQL execute revoked).
2. **`TEST-ENR-02` (Authorized Server-Mediated Enrollment):** School Admin calls `POST /api/admissions/:id/enroll` on applicant with `stage = 'Offer'`. Expected: **200 OK**. Student record created.
3. **`TEST-ENR-03` (Spoofed Actor ID Prevented):** Caller sends `{ p_actor_id: 'fake-uuid' }` in body. Expected: Server ignores spoofed body field; audit record matches caller's real `auth.uid()`.
4. **`TEST-ENR-04` (Wrong Tenant Applicant Enrollment):** School A admin calls `POST /api/admissions/:id/enroll` for School B applicant. Expected: **403 Forbidden**. Target record untouched.
5. **`TEST-ENR-05` (Duplicate Concurrent Enrollment Serialization):** Two parallel requests execute `POST /api/admissions/:id/enroll` for same applicant UUID simultaneously. Expected: Exactly **one request succeeds (200 OK)**; the other fails with **422 Unprocessable Entity** (`ALREADY_ENROLLED`). Exactly **one student record** created in `public.students`.
6. **`TEST-ENR-06` (Unapproved Applicant Enrollment):** School Admin calls `POST /api/admissions/:id/enroll` on applicant in `stage = 'Application'`. Expected: **422 Unprocessable Entity**. Zero student records created.

### 4.3 Academic AI Security Tests
1. **`TEST-AI-01` (Unauthorized AI Call Containment):** Unauthenticated caller calls `POST /api/academics/ai/lesson-plan`. Expected: **401 Unauthorized**. Gemini API calls = **0**. `ai_usage_logs` inserts = **0**.
2. **`TEST-AI-02` (Cross-Tenant Offering Containment):** Teacher from School A requests lesson plan for offering in School B. Expected: **403 Forbidden**. Gemini API calls = **0**.
3. **`TEST-AI-03` (Unassigned Teacher Containment):** Teacher A requests lesson plan for offering assigned to Teacher B (same school, not HOD). Expected: **403 Forbidden**. Gemini API calls = **0**.
4. **`TEST-AI-04` (Draft Curriculum State Containment):** Assigned teacher requests lesson plan for offering with `curriculum_status = 'draft'`. Expected: **422 Unprocessable Entity**. Gemini API calls = **0**.
5. **`TEST-AI-05` (Authorized Teacher Generation & Accounting):** Assigned teacher requests lesson plan for published offering. Expected: **200 OK**. Gemini API calls = **1**. Exact token counts logged to `ai_usage_logs` under offering's `tenant_id`.

### 4.4 Admission Letter Dispatch Tests
1. **`TEST-LTR-01` (Wrong Lifecycle State Dispatch):** School Admin attempts `POST /api/admissions/:id/letter` on applicant in `stage = 'Application'`. Expected: **422 Unprocessable Entity**. Zero letters dispatched.
2. **`TEST-LTR-02` (Cross-Tenant Letter Dispatch):** School Admin from School A attempts letter dispatch for School B applicant. Expected: **403 Forbidden**. Target record untouched.
3. **`TEST-LTR-03` (Unauthorized Role Dispatch):** Exam Officer or Teacher attempts `POST /api/admissions/:id/letter`. Expected: **403 Forbidden**.
4. **`TEST-LTR-04` (Idempotent Dispatch Replay):** Two requests sent with same `Idempotency-Key` within 60 seconds. Expected: Exactly **one outbound communication enqueued**; second returns cached result deterministically.
5. **`TEST-LTR-05` (Server-Controlled Timestamp Integrity):** Client sends `{ admissionLetterSentAt: '2020-01-01' }` in body. Expected: Request timestamp ignored; database reflects authoritative server `NOW()`.
