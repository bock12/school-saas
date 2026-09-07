# TASK-0007 Phase 3C-A — Canonical Permission Architecture & Catalog Delta Specification (Revised)

**Task:** TASK-0007 Phase 3C-A  
**Stage:** Architecture & Governance Specification Only  
**Status:** ARCHITECTURE READY — AWAITING SUPERVISORY APPROVAL  
**Branch:** `ai-eos/task-0007-phase-3c-a-permission-architecture`  
**Base Commit:** `e4d673e`  
**Supervisory Authority:** ChatGPT (Chief Software Architect & Project Supervisor)  
**Final Authority:** Human Project Owner  

---

## 1. Executive Architectural Rationale & Supervisory Corrections

In response to the supervisory review of TASK-0007 Phase 3C-A, this revised architecture specification resolves five critical permission boundary ambiguities:

1. **Separation of Document Dispatch from Demographic Maintenance:** The prior proposal conflated official admission-letter dispatch with clerical applicant maintenance under `admissions.applicants.manage`. Official document dispatch creates external communication side effects and legal commitments, requiring a dedicated permission: `admissions.letters.dispatch`.
2. **Separation of Academic Evaluation from Stream Placement:** Placing both assessment scoring and WAEC stream allocation under `admissions.applicants.evaluate` created privilege creep. Stream placement in Senior Secondary Schools determines academic specialization (Science, Arts, Commercial, Technical) and consumes institutional stream caps. This capability is segregated into `admissions.applicants.place`.
3. **Separation of Admission Adjudication from Enrollment Transaction:** An executive admission offer (`admissions.applicants.approve`) is legally and operationally distinct from the irreversible database transaction of provisioning permanent student identities, matriculation numbers, and parent accounts in the institutional registry (`admissions.applicants.enroll`).
4. **Refinement of Lesson-Plan Semantics (`generate` vs `create`):** Because lesson plans in the current codebase are not persisted in PostgreSQL (no `lesson_plans` table exists) and are returned ephemerally to client sessions with token accounting in `ai_usage_logs`, the operation is specified as `curriculum.lesson_plan.generate`.
5. **Rigorous Exam Officer Demarcation:** The Examination Officer is granted authority strictly for technical applicant evaluation and stream placement, with executive admission decisions, demographic changes, document dispatch, and student enrollment strictly prohibited.

---

## 2. Invariant Compliance

This revised architecture enforces:

- **`INV-3C-A-01`:** The Phase 3A canonical authorization engine mechanics remain 100% frozen.
- **`INV-3C-A-02`:** No existing permission is repurposed or semantically distorted.
- **`INV-3C-A-03`:** Authorization decisions are evaluated strictly against server-resolved trusted context.
- **`INV-3C-A-04`:** Client-controlled attributes (`role`, `tenantId`, `actorId`, `stage`) are treated as untrusted.
- **`INV-3C-A-05`:** Organization administrator reach into child schools does not expand permission resource scopes beyond `school`.
- **`INV-3C-A-06`:** Functional staff assignments do not grant executive administrative privileges.
- **`INV-3C-A-07`:** Business operations with materially different security consequences receive distinct, dedicated permissions.
- **`INV-3C-A-08`:** Security-sensitive database functions cannot bypass the application authorization model.
- **`INV-3C-A-09`:** External AI side effects occur only after authentication, resource resolution, and authorization succeed.
- **`INV-3C-A-10`:** No code implementation begins until this charter receives formal supervisory approval.

---

## 3. GAP-A: Academic AI Lesson Planning Semantics (`generate` vs `create`)

### 3.1 Domain Disambiguation & Lifecycle Analysis

A rigorous analysis of the curriculum engine (`041_subjects_curriculum_engine.sql` and `src/app/api/academics/ai/lesson-plan/route.ts`) reveals that lesson plans are **ephemeral instructional guides generated on-the-fly by an external LLM**, not persistent database records:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 ACADEMIC DOMAIN LIFECYCLE                               │
├───────────────────────────────┬────────────────────────────────────────────────────────┤
│ Operation                     │ Operational Definition & Entity                        │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ 1. Curriculum Authoring       │ Drafting an institutional syllabus outline version     │
│                               │ Entity: public.curriculum_versions (status: 'draft')   │
│                               │ Permission: curriculum.version.create                  │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ 2. Lesson-Plan Generation     │ Ephemeral LLM operationalisation of an approved topic  │
│                               │ into pedagogical delivery phases, activities, timings  │
│                               │ Entity: Ephemeral JSON response + ai_usage_logs        │
│                               │ Permission: curriculum.lesson_plan.generate (PROPOSED) │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ 3. Lesson-Plan Persistence &  │ Storing, editing, or versioning lesson notes in DB     │
│    Maintenance                │ Entity: Future public.lesson_plans table               │
│                               │ Permission: curriculum.lesson_plan.manage (FUTURE)     │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ 4. Lesson-Plan Publishing     │ Promoting a lesson plan to institutional repository   │
│                               │ Entity: Future institutional pedagogical library       │
│                               │ Permission: curriculum.lesson_plan.publish (FUTURE)    │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ 5. Curriculum Publishing      │ Promoting syllabus version to institutional catalog   │
│                               │ Entity: public.curriculum_versions (status: published) │
│                               │ Permission: curriculum.version.publish                 │
└───────────────────────────────┴────────────────────────────────────────────────────────┘
```

### 3.2 Detailed Specification of `curriculum.lesson_plan.generate`

- **Permission Key:** `curriculum.lesson_plan.generate`
- **Module:** `curriculum`
- **Resource:** `lesson_plan`
- **Action:** `generate`
- **Description:** `Generate ephemeral classroom instructional lesson plans from published curriculum topics using AI`
- **Canonical Scope:** `offering`
- **Allowed Scopes:** `['platform', 'organization', 'school', 'department', 'offering']`
- **Base-Role Grants:**
  - `super_admin`: `platform`
  - `org_admin`: `school`
  - `school_admin`: `school`
  - `teacher`: None (Teachers receive this capability strictly via functional assignment to subject offerings).
  - `student`, `parent`, `exam_officer`: None.
- **Functional-Assignment Grants:**
  - `subject_teacher`: `offering` (Assigned to the specific `subject_offering_id`).
  - `hod`: `department` (Governing the department of the offering).
- **Separation of Duties (SoD):** None for generation.
- **Preconditions:**
  - The subject offering must be linked to a curriculum version with `status = 'published'`.
  - The requested topic must exist within that published curriculum version.
- **Persistence & Audit:**
  - The generated lesson plan is returned in-memory to the client session.
  - Model metadata and token usage are logged to `public.ai_usage_logs` (`tenant_id`, `user_id`, `feature = 'lesson_plan'`, `input_tokens`, `output_tokens`, `model = 'gemini-2.0-flash'`).

---

## 4. GAP-B: Admissions Lifecycle & Granular Permission Architecture

### 4.1 Deconstructing Admissions Operations into Dedicated Capabilities

The monolithic 24-field `PATCH /api/admissions` endpoint is decomposed into five atomic operational capabilities:

```text
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                             ADMISSIONS OPERATIONS DECOMPOSITION                          │
├──────────────────────────────┬────────────────────────────────┬──────────────────────────┤
│ Business Operation           │ Fields Involved                │ Canonical Permission     │
├──────────────────────────────┼────────────────────────────────┼──────────────────────────┤
│ 1. Demographic Maintenance   │ firstName, lastName, dob,      │ admissions.applicants.   │
│                              │ gender, email, phone, address, │ manage                   │
│                              │ city, parentName, parentPhone, │ (PROPOSED)               │
│                              │ parentEmail, parentRelation,   │                          │
│                              │ previousSchool, targetGrade    │                          │
├──────────────────────────────┼────────────────────────────────┼──────────────────────────┤
│ 2. Entrance Evaluation       │ interviewScore, assessmentScore│ admissions.applicants.   │
│                              │ docsVerified, npseAggregate,   │ evaluate                 │
│                              │ beceAggregate, beceSubjects,   │ (PROPOSED)               │
│                              │ wassceCredits, wassceSubjects, │                          │
│                              │ nationalIndexNo                │                          │
├──────────────────────────────┼────────────────────────────────┼──────────────────────────┤
│ 3. Stream Track Placement    │ targetStream, streamAutoPlaced,│ admissions.applicants.   │
│                              │ streamPlacedAt                 │ place                    │
│                              │                                │ (PROPOSED)               │
├──────────────────────────────┼────────────────────────────────┼──────────────────────────┤
│ 4. Executive Adjudication    │ stage ('Offer', 'Rejected'),   │ admissions.applicants.   │
│                              │ status ('active', 'rejected'), │ approve                  │
│                              │ rejectionReason                │ (EXISTING)               │
├──────────────────────────────┼────────────────────────────────┼──────────────────────────┤
│ 5. Document Dispatch         │ admissionLetterSent,           │ admissions.letters.      │
│                              │ admissionLetterSentAt          │ dispatch                 │
│                              │                                │ (PROPOSED)               │
├──────────────────────────────┼────────────────────────────────┼──────────────────────────┤
│ 6. Student Enrollment        │ stage ('Allocation'),          │ admissions.applicants.   │
│                              │ status ('enrolled'),           │ enroll                   │
│                              │ student/parent records creation│ (PROPOSED)               │
└──────────────────────────────┴────────────────────────────────┴──────────────────────────┘
```

---

### 4.2 Detailed Analysis: Evaluating Evaluation vs. Placement

#### The Security Rationale for Separating `evaluate` and `place`
- **Assessment / Scoring (`admissions.applicants.evaluate`):** Recording facts about past performance (entrance test marks, interview rubrics, BECE aggregates). This is an evaluative, analytical function performed by exam markers and interviewers.
- **Stream Track Placement (`admissions.applicants.place`):** Allocating a student to a Senior Secondary School track (Science, Arts, Commercial, Technical). In Sierra Leone (MBSSE), streams have institutional seat capacities, strict subject combinations, and statutory prerequisite thresholds.
- **Security Consequences of Combining Them:** If both capabilities shared `evaluate`, an entrance exam scorer could unilaterally change a student's track, circumvent department capacity limits, or override senior management stream assignments.
- **Recommendation:** Establish `admissions.applicants.place` as a distinct permission.

---

### 4.3 Detailed Analysis: Evaluating Approval vs. Enrollment

#### The Business & Legal Rationale for Separating `approve` and `enroll`
- **Admission Decision (`admissions.applicants.approve`):** The executive decision to extend an offer of admission or issue a rejection. The applicant's stage transitions to `Offer`. The student is NOT yet enrolled; tuition fees are unpaid, parent contract is unexecuted, and physical verification may be pending.
- **Enrollment Transaction (`admissions.applicants.enroll`):** The administrative and legal execution that creates permanent institutional records:
  - Generates official matriculation number (`STU-XXXXXX`).
  - Inserts record into `public.students`.
  - Provisions or links `public.parents` record.
  - Inserts relational junction into `public.student_parents`.
  - Mutates applicant: `stage = 'Allocation'`, `status = 'enrolled'`.
- **Security Consequences of Combining Them:** If `approve` automatically triggered enrollment, applicants who were offered admission but never paid fees or accepted the offer would pollute the student registry, distort class rosters, and consume institutional student license seats.
- **Recommendation:** Establish `admissions.applicants.enroll` as a dedicated, high-consequence permission.

---

## 5. Granular Specification of Proposed Permissions

### 5.1 `admissions.applicants.manage` (PROPOSED)
- **Module:** `admissions` | **Resource:** `applicants` | **Action:** `manage`
- **Description:** `Update applicant demographic records, contact details, and biographical information`
- **Canonical Scope:** `school` | **Allowed Scopes:** `['platform', 'organization', 'school']`
- **Base-Role Grants:** `super_admin` (`platform`), `org_admin` (`school`), `school_admin` (`school`).
- **Functional-Assignment Grants:** None.
- **Strict Prohibition:** Prohibited from modifying scores, streams, admission decisions, letters, or enrollment.

### 5.2 `admissions.applicants.evaluate` (PROPOSED)
- **Module:** `admissions` | **Resource:** `applicants` | **Action:** `evaluate`
- **Description:** `Record interview scores, entrance assessment marks, and verify national exam aggregates`
- **Canonical Scope:** `school` | **Allowed Scopes:** `['platform', 'organization', 'school']`
- **Base-Role Grants:** `super_admin` (`platform`), `org_admin` (`school`), `school_admin` (`school`).
- **Functional-Assignment Grants:** `exam_officer` (`school`).
- **Strict Prohibition:** Prohibited from altering stream tracks, demographic records, or issuing admission offers.

### 5.3 `admissions.applicants.place` (PROPOSED)
- **Module:** `admissions` | **Resource:** `applicants` | **Action:** `place`
- **Description:** `Allocate applicants to senior secondary academic stream tracks (Science, Arts, Commercial, Technical)`
- **Canonical Scope:** `school` | **Allowed Scopes:** `['platform', 'organization', 'school']`
- **Base-Role Grants:** `super_admin` (`platform`), `org_admin` (`school`), `school_admin` (`school`).
- **Functional-Assignment Grants:** `exam_officer` (`school`).
- **Strict Prohibition:** Prohibited from making final admission offers or enrolling students into the registry.

### 5.4 `admissions.letters.dispatch` (PROPOSED)
- **Module:** `admissions` | **Resource:** `letters` | **Action:** `dispatch`
- **Description:** `Generate and record official dispatch of formal admission decision letters to applicants`
- **Canonical Scope:** `school` | **Allowed Scopes:** `['platform', 'organization', 'school']`
- **Base-Role Grants:** `super_admin` (`platform`), `org_admin` (`school`), `school_admin` (`school`).
- **Functional-Assignment Grants:** None (`exam_officer` STRICTLY DENIED).
- **Audit & Side Effects:** Captures delivery channel, template ID, and server dispatch timestamp; enqueues outbound communications.

### 5.5 `admissions.applicants.enroll` (PROPOSED)
- **Module:** `admissions` | **Resource:** `applicants` | **Action:** `enroll`
- **Description:** `Execute final enrollment transaction converting an admitted applicant into an active student record`
- **Canonical Scope:** `school` | **Allowed Scopes:** `['platform', 'organization', 'school']`
- **Base-Role Grants:** `super_admin` (`platform`), `org_admin` (`school`), `school_admin` (`school`).
- **Functional-Assignment Grants:** None (`exam_officer`, `teacher` STRICTLY DENIED).
- **Lifecycle Preconditions:** Applicant must be in `stage = 'Offer'`, `status = 'active'`, and `docs_verified = true`.

---

## 6. Exam Officer Authority Demarcation

The Examination Officer's authority is bounded strictly to objective academic assessment and stream track qualification:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                    EXAM OFFICER ADMISSIONS BOUNDARY                    │
├────────────────────────────────────────────────────────────────────────┤
│ PERMITTED (Technical Assessment & Stream Qualification):               │
│  - View applicant records (admissions.applicants.view)                 │
│  - Inspect BECE/NPSE subject grades and aggregates                     │
│  - Record entrance exam and interview scores                           │
│    (admissions.applicants.evaluate)                                    │
│  - Allocate students to SSS stream tracks based on WAEC rules          │
│    (admissions.applicants.place)                                       │
├────────────────────────────────────────────────────────────────────────┤
│ STRICTLY PROHIBITED (Executive Authority Preserved):                   │
│  ❌ Creating admission records (admissions.applicants.create)          │
│  ❌ Modifying applicant contact/parent info (admissions.applicants.manage)│
│  ❌ Issuing admission offers or rejections (admissions.applicants.approve)│
│  ❌ Dispatching official admission letters (admissions.letters.dispatch)│
│  ❌ Enrolling applicants into student registry (admissions.applicants.enroll)│
│  ❌ Hard deleting applicant records (admissions.applicants.delete)     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Revised Consolidated Decision Matrix (Required Section 8)

| Capability | Permission | Scope | Base Roles | Functional Assignments | SoD Enforced | Resource Target | Side Effects | Governance Status |
|---|---|---|---|---|---|---|---|---|
| **Admissions View** | `admissions.applicants.view` | `school` | `super_admin`, `org_admin`, `school_admin` | `exam_officer` | None | School applicant registry | Read-only | **EXISTING** |
| **Admissions Create** | `admissions.applicants.create` | `school` | `super_admin`, `org_admin`, `school_admin` | None | None | School applicant registry | Initial record creation | **EXISTING** |
| **Applicant Maintenance** | `admissions.applicants.manage` | `school` | `super_admin`, `org_admin`, `school_admin` | None | None | Target applicant record | PII/contact updates | **PROPOSED** |
| **Applicant Evaluation** | `admissions.applicants.evaluate` | `school` | `super_admin`, `org_admin`, `school_admin` | `exam_officer` | None | Target applicant record | Score records in history | **PROPOSED** |
| **Stream Placement** | `admissions.applicants.place` | `school` | `super_admin`, `org_admin`, `school_admin` | `exam_officer` | Stream qualification ≠ Admission | Target SSS applicant | Stream track allocation | **PROPOSED** |
| **Admission Approval** | `admissions.applicants.approve` | `school` | `super_admin`, `org_admin`, `school_admin` | None | Executive only (`exam_officer` denied) | Target applicant record | Transitions stage to `Offer` | **EXISTING** |
| **Admission Rejection** | `admissions.applicants.approve` | `school` | `super_admin`, `org_admin`, `school_admin` | None | Executive only (`exam_officer` denied) | Target applicant record | Sets status `rejected` | **EXISTING** |
| **Admission Letter Dispatch** | `admissions.letters.dispatch` | `school` | `super_admin`, `org_admin`, `school_admin` | None | Stage must be `Offer` or `Allocation` | Target applicant record | Generates letter; enqueues SMS/email | **PROPOSED** |
| **Student Enrollment** | `admissions.applicants.enroll` | `school` | `super_admin`, `org_admin`, `school_admin` | None | Executive only; stage must be `Offer` | Target applicant record | Creates student, parents; transitions to `Allocation` | **PROPOSED** |
| **AI Lesson-Plan Generation** | `curriculum.lesson_plan.generate` | `offering` | `super_admin`, `org_admin`, `school_admin` | `subject_teacher`, `hod` | Offering assignment verified | Target published offering | Calls Gemini API; logs tokens | **PROPOSED** |
| **Curriculum Version Authoring** | `curriculum.version.create` | `school` | `super_admin`, `org_admin`, `school_admin` | None | Syllabus drafting only | Curriculum version draft | Creates syllabus draft | **REJECTED (For AI)** |
| **Admissions Hard Delete** | `admissions.applicants.delete` | `school` | `super_admin`, `org_admin`, `school_admin` | None | Executive only | Target applicant record | Deletes applicant | **DEFERRED** |

---

## 8. Catalog Delta & Permission Count Summary (Required Section 9)

```text
Current Phase 3A Frozen Permissions:  33
Proposed Additions:                   6
  1. admissions.applicants.manage
  2. admissions.applicants.evaluate
  3. admissions.applicants.place
  4. admissions.letters.dispatch
  5. admissions.applicants.enroll
  6. curriculum.lesson_plan.generate
--------------------------------------------------
Resulting Canonical Catalog:          39 (33 + 6)
```

Each proposed permission satisfies the business-capability requirement:
1. `admissions.applicants.manage`: Protects applicant demographic integrity from unauthorized clerical mutation.
2. `admissions.applicants.evaluate`: Empowers examination officers and markers to enter objective scores without granting administrative powers.
3. `admissions.applicants.place`: Governs senior secondary academic track allocation and prerequisite enforcement.
4. `admissions.letters.dispatch`: Governs external legal communication and institutional document delivery.
5. `admissions.applicants.enroll`: Governs the irreversible creation of legal student and parent identities in the master registry.
6. `curriculum.lesson_plan.generate`: Governs external AI token consumption and pedagogical assistance bounded to published curriculum.
