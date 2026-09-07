# TASK-0007 Phase 3C-A — Operation-Oriented API Charter & Security Specification (Revised)

**Task:** TASK-0007 Phase 3C-A  
**Stage:** Architecture & Specification Only  
**Status:** ARCHITECTURE READY — AWAITING SUPERVISORY APPROVAL  
**Branch:** `ai-eos/task-0007-phase-3c-a-permission-architecture`  
**Base Commit:** `e4d673e`  
**Supervisory Authority:** ChatGPT (Chief Software Architect & Project Supervisor)  
**Final Authority:** Human Project Owner  

---

## 1. Executive Architectural Rationale & Supervisory Corrections

In response to the supervisory correction, this revised API Charter establishes a **pure command-oriented architecture** that decomposes admissions and academic AI operations into atomic, dedicated endpoints.

Key architectural boundaries enforced:
1. **Admissions Letter Dispatch (`admissions.letters.dispatch`):** Separated from demographic maintenance into a dedicated endpoint (`POST /api/admissions/:id/letter`) with complete lifecycle, retry, idempotency, and asynchronous delivery specifications.
2. **Stream Track Placement (`admissions.applicants.place`):** Separated from evaluation scoring into a dedicated endpoint (`POST /api/admissions/:id/stream`).
3. **Student Enrollment Transaction (`admissions.applicants.enroll`):** Separated from executive admission approval into a dedicated command endpoint (`POST /api/admissions/:id/enroll`) that invokes the database transaction via the server-mediated `service_role` boundary.
4. **Academic AI Ephemeral Generation (`curriculum.lesson_plan.generate`):** Formally defined as an ephemeral pedagogical computation with zero database persistence, preceded by strict prerequisite and quota validation.

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
- **Resource Resolution:** Authoritative school ID resolved from authenticated caller context.
- **State Transition:** None (Read-only).
- **SoD & Audit:** Read access logged in standard telemetry.

---

### 3.2 `POST /api/admissions` — Initial Applicant Registration
- **Business Operation:** Create initial candidate record in `Application` stage.
- **Permission:** `admissions.applicants.create` | **Scope:** `school`
- **Allowed Actors:** `super_admin`, `org_admin`, `school_admin`. (`exam_officer`, `teacher`, `student`, `parent` DENIED).
- **Resource Resolution:** Target `tenant_id` resolved authoritatively from caller context; client claims ignored.
- **State Transition:** Deterministically sets `stage = 'Application'`, `status = 'active'`.
- **Side Effects:** Auto-stream evaluation if valid BECE subjects are provided at intake.
- **Audit Requirement:** Creation record appended to `admission_history`.

---

### 3.3 `PATCH /api/admissions/:id` — Applicant Demographic Maintenance
- **Business Operation:** Clerical maintenance of candidate biographical details and parent contact data.
- **Permission:** `admissions.applicants.manage` | **Scope:** `school`
- **Allowed Actors:** `super_admin`, `org_admin`, `school_admin`. (`exam_officer` STRICTLY DENIED).
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
- **Permitted Fields:** `targetStream`, `manualOverrideReason`.
- **Resource Resolution:** Target applicant loaded from DB. Verifies `school_level === 'SSS'`.
- **Lifecycle Preconditions:** Must be in `stage IN ('Application', 'Assessment', 'Interview', 'Offer')`.
- **State Transition:** Sets `target_stream`, updates `stream_auto_placed = false`, `stream_placed_at = NOW()`.
- **SoD:** Stream placement qualifies candidate for a track but DOES NOT issue an admission offer or enroll the student.
- **Audit Requirement:** Stream allocation event logged in `admission_history`.

---

### 3.6 `POST /api/admissions/:id/approve` — Executive Admission Offer Adjudication
- **Business Operation:** Issue a formal admission offer extending an invitation to join the institution.
- **Permission:** `admissions.applicants.approve` | **Scope:** `school`
- **Allowed Actors:** `super_admin`, `org_admin`, `school_admin`. (`exam_officer` STRICTLY DENIED).
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
- **Permitted Fields:** `rejectionReason` (Mandatory, non-empty string).
- **Lifecycle Preconditions:** Must not already be enrolled (`stage != 'Allocation'`).
- **State Transition:** Sets `status = 'rejected'`, `rejection_reason = rejectionReason`.
- **Audit Requirement:** Rejection reason and executive author logged in `admission_history`.

---

### 3.8 `POST /api/admissions/:id/letter` — Official Admission Letter Dispatch (Detailed Section 7)
- **Business Operation:** Generate and dispatch official institutional admission offer letter.
- **Permission:** `admissions.letters.dispatch` | **Scope:** `school`
- **Allowed Actors:** `super_admin`, `org_admin`, `school_admin`. (`exam_officer`, `teacher`, `student`, `parent` STRICTLY DENIED).
- **Eligible Applicant State:** Applicant must be in `stage IN ('Offer', 'Allocation')` and `status = 'active'`. Letters CANNOT be dispatched to applicants in `Application`, `Assessment`, `Interview`, or `Rejected` states (returns HTTP 422).
- **Resending Permitted:** YES. Families may request duplicate copies or updated letters. Resending is permitted.
- **Who Can Resend:** Authorized administrators holding `admissions.letters.dispatch`.
- **Dispatch Mode:**
  - **Synchronous:** Renders PDF document content / template preview and returns to client.
  - **Asynchronous:** Enqueues background notification job for outbound email/SMS delivery.
- **External Providers:** Outbound delivery dispatches to configured email gateway (SendGrid / Resend) or SMS provider (Twilio / Africa's Talking).
- **Dispatch Status Control:** Server-controlled. The server writes `admission_letter_sent = true` and `admission_letter_sent_at = NOW()`. Any client-supplied timestamps or flags in the request body are strictly ignored.
- **Immutability & History:** While `applicants.admission_letter_sent_at` reflects the latest dispatch timestamp, every dispatch event appends an immutable record into `public.admission_history` (`from_stage = stage`, `to_stage = stage`, `comment = 'Admission letter dispatched via ' || deliveryMethod`, `created_by = auth.uid()`).
- **Idempotency & Retry:** Client sends an optional `idempotencyKey`. If a duplicate request arrives within 60 seconds with the same key, the server returns the previous dispatch result without enqueuing duplicate messages.
- **Audit Requirements:** Full audit log recording template ID, recipient contact info, delivery channel, timestamp, and enacting administrator UUID.

---

### 3.9 `POST /api/admissions/:id/enroll` — Master Student Enrollment Transaction
- **Business Operation:** Convert an admitted candidate into a permanent active student in the school registry.
- **Permission:** `admissions.applicants.enroll` | **Scope:** `school`
- **Allowed Actors:** `super_admin`, `org_admin`, `school_admin`. (`exam_officer`, `teacher`, `student`, `parent` STRICTLY DENIED).
- **Lifecycle Preconditions:**
  - `applicant.stage` must equal `'Offer'`.
  - `applicant.status` must equal `'active'`.
  - `applicant.docs_verified` must equal `true`.
  - Rejects with HTTP 422 if applicant has not been offered admission or documents are unverified.
- **Execution Model:**
  - Server extracts verified caller `auth.uid()`.
  - Evaluates `admissions.applicants.enroll`.
  - Executes database transaction via `service_role` calling hardened `enroll_applicant(p_applicant_id, p_actor_id)`.
- **State Transition:** Mutates applicant to `stage = 'Allocation'`, `status = 'enrolled'`.
- **Side Effects:**
  - Generates permanent matriculation number (`STU-XXXXXX`).
  - Inserts new row into `public.students`.
  - Inserts or reuses record in `public.parents`.
  - Inserts junction row in `public.student_parents`.
  - Appends audit row to `public.admission_history`.
- **Audit Requirement:** Compliance-level audit recording enacting administrator UUID, student ID, and timestamp.

---

### 3.10 `POST /api/academics/ai/lesson-plan` — Ephemeral AI Lesson Plan Generation
- **Business Operation:** Generate classroom instructional delivery outline for a published curriculum topic.
- **Permission:** `curriculum.lesson_plan.generate` | **Scope:** `offering`
- **Allowed Actors:** `super_admin`, `org_admin`, `school_admin`, `subject_teacher` (assigned to offering), `hod` (department head).
- **Ephemeral Semantics:**
  - Does NOT insert records into a `lesson_plans` table (no such table exists in the schema).
  - Returns structured JSON to client session for display, clipboard copying, or plain-text download.
  - Future persistence will be governed separately by `curriculum.lesson_plan.manage` without conflating syllabus drafting (`curriculum.version.create`).
- **Resource Resolution:** Resolves subject offering, teacher assignment, curriculum version status (`published`), and topic.
- **Strict Execution Pipeline:** Authenticate → Resolve trusted offering target → Evaluate permission → Validate published curriculum status → Check tenant AI token quota → Call Google Gemini API → Log token usage to `ai_usage_logs` → Return JSON.
- **Side Effects:** Consumes external AI tokens; writes audit row to `public.ai_usage_logs`.

---

## 4. Comprehensive Security Test Contract (Required Section 10)

The subsequent implementation phase must satisfy this expanded test contract:

### 4.1 Admissions Security Test Contract
1. **`TEST-ADM-01` (Teacher Maintenance Rejection):** Teacher attempts `PATCH /api/admissions/:id`. Expected: 403 Forbidden.
2. **`TEST-ADM-02` (Exam Officer Evaluation Authority):** Exam Officer submits entrance scores via `POST /api/admissions/:id/evaluate`. Expected: 200 OK. History updated.
3. **`TEST-ADM-03` (Exam Officer Approval Rejection):** Exam Officer attempts `POST /api/admissions/:id/approve`. Expected: 403 Forbidden.
4. **`TEST-ADM-04` (Exam Officer Demographic Rejection):** Exam Officer attempts `PATCH /api/admissions/:id`. Expected: 403 Forbidden.
5. **`TEST-ADM-05` (Stream Placement Authorization):** Unauthorized actor (e.g. Teacher) attempts `POST /api/admissions/:id/stream`. Expected: 403 Forbidden.
6. **`TEST-ADM-06` (Letter Dispatch Authorization):** Unauthorized actor (e.g. Exam Officer or Teacher) attempts `POST /api/admissions/:id/letter`. Expected: 403 Forbidden.
7. **`TEST-ADM-07` (Enrollment Authorization):** Unauthorized actor (e.g. Exam Officer or Teacher) attempts `POST /api/admissions/:id/enroll`. Expected: 403 Forbidden.
8. **`TEST-ADM-08` (Approval Does Not Imply Enrollment):** Calling `POST /api/admissions/:id/approve` updates `stage = 'Offer'`. Verifies zero student rows created in `public.students`.
9. **`TEST-ADM-09` (Enrollment Requires Offer Stage):** Attempting `POST /api/admissions/:id/enroll` on an applicant in `stage = 'Application'` or `'Assessment'`. Expected: 422 Unprocessable Entity.
10. **`TEST-ADM-10` (Cross-School Access Denied):** School A administrator attempts any mutation on an applicant belonging to School B. Expected: 403 Forbidden. Target record untouched.

### 4.2 Enrollment Database Security Test Contract
1. **`TEST-ENR-01` (Direct Client RPC Denied):** Ordinary authenticated user (student/teacher) calls `supabase.rpc('enroll_applicant')`. Expected: 403 Permission Denied (PostgreSQL function execution revoked).
2. **`TEST-ENR-02` (Anonymous RPC Denied):** Anonymous unauthenticated caller calls `supabase.rpc('enroll_applicant')`. Expected: 403 Permission Denied.
3. **`TEST-ENR-03` (Wrong Tenant Enrollment Denied):** Server command attempts enrollment where applicant `tenant_id` does not match caller's authorized reach. Expected: 403 Forbidden.
4. **`TEST-ENR-04` (Human Actor Identity Preserved):** Legitimate administrator enrolls applicant via command endpoint. Expected: 200 OK. Audit record in `admission_history.created_by` matches administrator's `auth.uid()`, NOT `service_role`.
5. **`TEST-ENR-05` (Concurrency & Duplicate Prevention):** Two concurrent enrollment requests executed simultaneously on the same applicant UUID. Expected: Exactly one request succeeds (HTTP 200); the other fails with 422 (already allocated). Exactly ONE row created in `public.students`.

### 4.3 Academic AI Security Test Contract
1. **`TEST-AI-01` (Unauthorized AI Call Containment):** Unauthenticated or unauthorized user calls `POST /api/academics/ai/lesson-plan`. Expected: 401/403. External Gemini API mock called **0 times**.
2. **`TEST-AI-02` (Cross-Tenant Offering Containment):** Teacher from School A requests lesson plan for offering in School B. Expected: 403 Forbidden. Gemini API mock called **0 times**.
3. **`TEST-AI-03` (Unassigned Teacher Containment):** Teacher A requests lesson plan for offering assigned to Teacher B (same school, not HOD). Expected: 403 Forbidden. Gemini API mock called **0 times**.
4. **`TEST-AI-04` (Draft Curriculum Containment):** Authorized teacher requests lesson plan for offering linked to `curriculum_status = 'draft'`. Expected: 422 Unprocessable Entity. Gemini API mock called **0 times**.
5. **`TEST-AI-05` (Authorized Generation & Accounting):** Assigned teacher requests lesson plan for published offering. Expected: 200 OK. Gemini mock called exactly 1 time. Exact token counts recorded in `ai_usage_logs` with offering's authoritative `tenant_id`.
