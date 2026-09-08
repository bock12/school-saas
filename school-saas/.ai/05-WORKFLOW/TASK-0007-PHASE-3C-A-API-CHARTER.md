# TASK-0007 Phase 3C-A — Operation-Oriented API Charter & Security Specification (Final Security Revision)

**Task:** TASK-0007 Phase 3C-A  
**Stage:** Architecture & Specification Only  
**Status:** ARCHITECTURE READY — AWAITING SUPERVISORY APPROVAL  
**Branch:** `ai-eos/task-0007-phase-3c-a-permission-architecture`  
**Base Commit:** `e4d673e`  
**Supervisory Authority:** ChatGPT (Chief Software Architect & Project Supervisor)  
**Final Authority:** Human Project Owner  

---

## 1. Executive Architectural Rationale & Final Security Corrections

In response to the final supervisory review, this specification formalizes the **command-oriented API architecture**, the **unidirectional trust boundary**, the **master enrollment idempotency pipeline**, the **AI zero side-effect guarantee**, and the **admission-letter dispatch mechanics**:

1. **Unidirectional Trust Boundary:** Explicitly documents the 8-stage trust chain from client session to audit persistence. Prohibits any client transmission of `p_actor_id`, `service_role`, direct RPC, or arbitrary actor UUIDs.
2. **Service Role as Transport Privilege Only:** Formally decouples `service_role` (database transport privilege) from `admissions.applicants.enroll` (business authorization) and `auth.uid()` (human actor identity).
3. **Enrollment Idempotency & Schema Prerequisite:** Details the full transaction flow with row locking (`FOR UPDATE`), re-reading state, deterministic return for already enrolled applicants, and identifies the missing schema constraint (`students.applicant_id UUID UNIQUE`) as a mandatory implementation prerequisite for defense-in-depth.
4. **Direct RPC Threat Model as Multi-Layer Defense:** Documents that revoking PostgREST `EXECUTE` privileges is merely one defense layer; full security requires authentication, canonical authorization, trusted resource resolution, and server-only privileged execution.
5. **Organization-Admin Subtree Boundedness:** For all school-scoped admissions endpoints, `org_admin` authority is strictly bounded to child schools within the caller's server-resolved organization subtree (`context.organizationSubtenantIds`).
6. **AI Zero Side-Effect Guarantee:** Formulates the authorization semantics for `curriculum.lesson_plan.generate`. Unauthorized requests, cross-tenant offerings, unassigned teachers, and draft syllabus versions result in **zero external AI calls, zero token quota consumption, and zero database usage logs**.

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

### 3.9 `POST /api/admissions/:id/enroll` — Master Student Enrollment Transaction (Detailed Section 6)

#### A. Complete Trust Boundary & Actor Attribution:
```text
Browser/client
    ↓ [1. HTTPS POST /api/admissions/:id/enroll with session cookie]
Authenticated session
    ↓ [2. Cryptographic JWT verification via Supabase Auth]
Server endpoint / command
    ↓ [3. Next.js extracts user.id: trustedActorId = auth.uid()]
auth.uid()
    ↓ [4. Pure Phase 3A RBAC engine: evaluatePermission()]
Canonical authorization
    ↓ [5. Authoritative DB lookup: resolveApplicantTarget()]
Trusted applicant resolution
    ↓ [6. Server-derived, non-forgeable actor UUID]
Server-derived actor identity
    ↓ [7. Server-only private connection via SUPABASE_SERVICE_ROLE_KEY]
Privileged database transaction
    ↓ [8. Immutable write to admission_history.created_by]
Audit attribution
```

#### B. Server Command Trust Invariant:
The server command request schema **accepts NO actor ID parameter**.
```text
actor identity is derived strictly from the authenticated request context,
never accepted as an authorization input from the client.
```
Any client-supplied `p_actor_id`, `actorId`, or `adminId` is discarded. An ordinary client cannot invoke the privileged path because the server endpoint rejects unauthorized callers with HTTP 403.

#### C. Full Idempotency & Database Transaction Flow:
```text
BEGIN
  ↓
1. Lock applicant row exclusively:
   SELECT * FROM public.applicants WHERE id = p_applicant_id FOR UPDATE;
  ↓
2. Re-read applicant state inside the lock:
   IF v_applicant.stage = 'Allocation' THEN
     -- Idempotent return: find existing student ID and return deterministically
     SELECT id INTO v_existing_student_id FROM public.students 
     WHERE applicant_id = p_applicant_id OR (tenant_id = v_applicant.tenant_id AND admission_number = ...);
     RETURN v_existing_student_id;
   END IF;
  ↓
3. Validate lifecycle prerequisites:
   IF v_applicant.stage != 'Offer' OR v_applicant.status != 'active' OR v_applicant.docs_verified != true THEN
     RAISE EXCEPTION 'LIFECYCLE_PRECONDITION_FAILED';
   END IF;
  ↓
4. Validate tenant/resource relationship:
   Ensure v_applicant.tenant_id matches authorized target school.
  ↓
5. Create student record:
   INSERT INTO public.students (tenant_id, applicant_id, admission_number, first_name, last_name, ...)
   VALUES (v_applicant.tenant_id, p_applicant_id, v_admission_number, ...)
   RETURNING id INTO v_student_id;
  ↓
6. Insert / Link parent record & student_parents junction.
  ↓
7. Transition applicant state:
   UPDATE public.applicants SET stage = 'Allocation', status = 'enrolled', updated_at = NOW()
   WHERE id = p_applicant_id;
  ↓
8. Record immutable audit history:
   INSERT INTO public.admission_history (tenant_id, applicant_id, from_stage, to_stage, comment, created_by)
   VALUES (v_applicant.tenant_id, p_applicant_id, 'Offer', 'Allocation', 'Enrolled', p_actor_id);
  ↓
COMMIT
```

#### D. Schema Uniqueness Constraint Implementation Prerequisite:
`public.students` currently contains `UNIQUE(tenant_id, admission_number)`. It does NOT contain a unique constraint on `applicant_id`.
**Architectural Prerequisite for Implementation:**
```sql
ALTER TABLE public.students ADD COLUMN applicant_id UUID UNIQUE REFERENCES public.applicants(id);
```
This guarantees defense-in-depth: runtime row locking (`FOR UPDATE`) serializes parallel transactions, while the database engine uniqueness constraint (`UNIQUE(applicant_id)`) guarantees at the storage engine level that duplicate student records can never be created for the same applicant.

#### E. Minimum Enrollment Audit Record:
Every enrollment execution records:
- `actor_id`: Server-verified `auth.uid()` (never chosen by client).
- `tenant_id / school_id`: Authoritative `applicant.tenant_id`.
- `applicant_id`: Target applicant UUID.
- `result`: Resulting student UUID.
- `timestamp`: Server `NOW()`.

---

### 3.10 `POST /api/academics/ai/lesson-plan` — AI Lesson Plan Generation (Detailed Section 6)

#### Strict AI Authorization & Side-Effect Sequence:
```text
Step 1: Authenticate Caller (auth.uid())
        Reject unauthenticated (HTTP 401). External AI calls = 0. Quota = 0. Usage logs = 0.
           ↓
Step 2: Resolve Target Offering & Context
        Load offering, subject, teacher assignment, curriculum version from DB.
        Reject non-existent resources (HTTP 404). External AI calls = 0.
           ↓
Step 3: Evaluate Canonical Permission (curriculum.lesson_plan.generate)
        - Scope: 'offering'
        - Org Reach: offering.tenant_id in organizationSubtenantIds
        - Teacher Assignment: if caller is teacher, actorId === offering.teacher_id
        - Department: if caller is HOD, offering.department_id === HOD department
        Reject unauthorized (HTTP 403). External AI calls = 0. Quota = 0. Usage logs = 0.
           ↓
Step 4: Validate Curriculum & Topic Prerequisites
        - offering.curriculum_status === 'published' (AI never runs on draft syllabus)
        - topic belongs to offering's published curriculum version
        - academic year is active
        Reject invalid state (HTTP 422). External AI calls = 0. Quota = 0. Usage logs = 0.
           ↓
Step 5: Enforce Tenant AI Token Quota
        Sum billing period usage from ai_usage_logs for offering.tenant_id.
        Reject quota exhaustion (HTTP 429). External AI calls = 0.
           ↓
Step 6: Invoke Google Gemini API
        Execute HTTP POST using server-held GEMINI_API_KEY.
           ↓
Step 7: Persist Audit & Token Attribution
        Insert usage log into public.ai_usage_logs (offering.tenant_id, auth.uid(),
        feature='lesson_plan', input_tokens, output_tokens, status='success').
           ↓
Step 8: Return Ephemeral JSON to Client Session
```

#### The Zero Side-Effect Guarantee:
Under invariant `INV-3C-A-09`:
- Any failure at Steps 1, 2, 3, 4, or 5 **halts execution immediately**.
- **Zero calls are made to Google Gemini**.
- **Zero tokens are consumed**.
- **Zero records are inserted into `public.ai_usage_logs`**.
- Rejected requests are recorded exclusively in standard server access telemetry.

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
5. **`TEST-ENR-05` (Duplicate Concurrent Enrollment Serialization):** Two parallel requests execute `POST /api/admissions/:id/enroll` for same applicant UUID simultaneously. Expected: Exactly **one enrollment transaction executes**; both return the identical student UUID idempotently. Exactly **one student record** exists in `public.students`.
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
