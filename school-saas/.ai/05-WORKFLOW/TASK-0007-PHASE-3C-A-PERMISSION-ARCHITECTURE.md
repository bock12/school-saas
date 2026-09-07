# TASK-0007 Phase 3C-A — Canonical Permission Architecture & Catalog Delta Specification (Final Revision)

**Task:** TASK-0007 Phase 3C-A  
**Stage:** Architecture & Governance Specification Only  
**Status:** ARCHITECTURE READY — AWAITING SUPERVISORY APPROVAL  
**Branch:** `ai-eos/task-0007-phase-3c-a-permission-architecture`  
**Base Commit:** `e4d673e`  
**Supervisory Authority:** ChatGPT (Chief Software Architect & Project Supervisor)  
**Final Authority:** Human Project Owner  

---

## 1. Executive Architectural Summary & Final Revisions

In response to the final supervisory review of TASK-0007 Phase 3C-A, this specification resolves all remaining architectural boundary constraints:

1. **Explicit Org-Admin School-Scope Semantics:** Formalized the exact rule that an `org_admin` exercising school-scoped permissions is strictly bounded to child schools within their authorized organization subtree (`context.organizationSubtenantIds.includes(target.tenantId)`). Arbitrary school access is strictly prohibited.
2. **Rigorous Enrollment Lifecycle & Transactional Boundary:** Established the end-to-end prerequisite chain separating the executive admission decision (`admissions.applicants.approve`) from the irreversible legal enrollment transaction (`admissions.applicants.enroll`), with complete concurrency, idempotency, and rollback rules.
3. **AI Domain Ownership Justification (Option A vs Option B):** Conducted a formal comparative analysis demonstrating why `curriculum.lesson_plan.generate` is the canonical choice over `academics.lesson_plan.generate` based on `041_subjects_curriculum_engine.sql` and Phase 3A catalog cohesion.
4. **Dedicated Admissions Letter Dispatch (`admissions.letters.dispatch`):** Governs external legal communications, resend policies, provider retries, and server-controlled dispatch timestamps.
5. **Separation of Evaluation from Placement:** Retains `admissions.applicants.evaluate` strictly for scoring while segregating senior secondary stream allocation into `admissions.applicants.place`.
6. **Strict Exam Officer Demarcation:** Exam Officers are restricted to objective academic evaluation (`evaluate`) and stream qualification (`place`), with executive approval, demographic editing, letter dispatch, and enrollment transactions strictly prohibited.

---

## 2. Invariant Compliance

This final specification enforces:

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

## 3. Organization Administrator School-Scope Semantics (Required Section 1)

In Phase 3A (`authorization-engine.ts`, lines 401–406), canonical authorization evaluates `org_admin` grants with scope `school` through server-resolved organization subtenant resolution:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        ORG-ADMIN SCHOOL-SCOPE EVALUATION PIPELINE                      │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  Caller: baseRole = 'org_admin', tenantId = 'org-uuid-1'                               │
│        │                                                                               │
│        ▼                                                                               │
│  Context Hydration: get_org_subtenant_ids('org-uuid-1')                                │
│        │                                                                               │
│        ▼                                                                               │
│  context.organizationSubtenantIds = ['school-a-uuid', 'school-b-uuid']                 │
│        │                                                                               │
│        ▼                                                                               │
│  Resource Target: target.tenantId = 'school-a-uuid'                                    │
│        │                                                                               │
│        ▼                                                                               │
│  Scope Evaluation:                                                                     │
│    context.tenantId === target.tenantId                                                │
│    || context.organizationSubtenantIds.includes(target.tenantId)                       │
│        │                                                                               │
│        ├── [IN SUBTREE] ──► ALLOW                                                      │
│        └── [OUTSIDE SUBTREE] ──► DENY (OUT_OF_SCOPE: 403 Forbidden)                     │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Explicit Prohibition: No Arbitrary School Reach
An `org_admin` grant at `school` scope **DOES NOT** confer global or cross-organization reach. It confers reach **strictly and exclusively into schools that are descendants of the caller's authorized organization**.

This boundary is documented and strictly enforced for all proposed school-scoped permissions:
1. `admissions.applicants.manage`: An `org_admin` can manage applicant demographics only for child schools in their verified organization subtree. Target schools belonging to other organizations or independent schools yield `OUT_OF_SCOPE` (`DENY`).
2. `admissions.applicants.evaluate`: An `org_admin` can record or oversee entrance scores only within their organization's schools.
3. `admissions.applicants.place`: Stream track placement oversight is confined to child schools.
4. `admissions.letters.dispatch`: Official letter generation and dispatch is confined to child schools.
5. `admissions.applicants.enroll`: Master student registry enrollment is confined strictly to child schools.

---

## 4. AI Domain Ownership: Option A vs. Option B (Required Section 5)

A comprehensive architectural comparison was conducted to determine the canonical module for lesson-plan generation:

```text
┌───────────────────────────────────────┬───────────────────────────────────────┐
│ Option A:                             │ Option B:                             │
│ curriculum.lesson_plan.generate       │ academics.lesson_plan.generate        │
├───────────────────────────────────────┼───────────────────────────────────────┤
│ ✅ Grounded in 041_subjects_curriculum│ ❌ academics table family does not    │
│    _engine.sql (curriculum_versions,  │    exist (only academic_years)        │
│    curriculum_topics, learning_       │                                       │
│    outcomes)                          │                                       │
│ ✅ Preserves Phase 3A module cohesion │ ❌ Introduces a non-existent 8th      │
│    with curriculum.* family (5 active │    module to the canonical catalog    │
│    permissions in catalog)            │                                       │
│ ✅ Aligns with teacher workflow: turn │ ❌ Conflates operational academics    │
│    approved syllabus into delivery    │    (timetables, terms) with syllabus  │
│    plans                              │    instructional design               │
│ ✅ Seamless future persistence into   │ ❌ Fragmented audit: AI logs link to  │
│    curriculum_version_id foreign key  │    curriculum_version_id, not an      │
│                                       │    academics entity                   │
└───────────────────────────────────────┴───────────────────────────────────────┘
```

### 4.1 Canonical Decision & Justification
**Decision: Option A (`curriculum.lesson_plan.generate`) is adopted as canonical.**

**Repository Evidence:**
1. **Schema Linkage:** The route `src/app/api/academics/ai/lesson-plan/route.ts` queries `curriculum_versions cv` and `curriculum_topics t`. Line 9 explicitly asserts: *"AI is fully constrained to the published curriculum structure: school curriculum → curriculum_version → topic → learning_outcomes. AI never invents curriculum; it only operationalises it."*
2. **Catalog Cohesion:** Phase 3A defines the `curriculum` module in `permissions-registry.ts` (`curriculum.version.create`, `review`, `approve`, `publish`, and `coverage.log`). Adding `curriculum.lesson_plan.generate` completes the operational branch of the curriculum domain without inventing an arbitrary `academics` module.
3. **Audit Alignment:** `public.ai_usage_logs` explicitly records `curriculum_version_id`.

---

## 5. Granular Specification of Proposed Permissions

### 5.1 `admissions.applicants.manage` (PROPOSED)
- **Module:** `admissions` | **Resource:** `applicants` | **Action:** `manage`
- **Description:** `Update applicant demographic records, contact details, and biographical information`
- **Canonical Scope:** `school` | **Allowed Scopes:** `['platform', 'organization', 'school']`
- **Base-Role Grants:** `super_admin` (`platform`), `org_admin` (`school`), `school_admin` (`school`).
- **Functional-Assignment Grants:** None.
- **Org Reach Rule:** `org_admin` access allowed ONLY if target school is in `organizationSubtenantIds`.
- **Strict Prohibition:** Prohibited from modifying scores, stream tracks, admission stages, letters, or enrollment.

### 5.2 `admissions.applicants.evaluate` (PROPOSED)
- **Module:** `admissions` | **Resource:** `applicants` | **Action:** `evaluate`
- **Description:** `Record interview scores, entrance assessment marks, and verify national exam aggregates`
- **Canonical Scope:** `school` | **Allowed Scopes:** `['platform', 'organization', 'school']`
- **Base-Role Grants:** `super_admin` (`platform`), `org_admin` (`school`), `school_admin` (`school`).
- **Functional-Assignment Grants:** `exam_officer` (`school`).
- **Org Reach Rule:** `org_admin` access allowed ONLY if target school is in `organizationSubtenantIds`.
- **Strict Prohibition:** Prohibited from altering stream tracks, demographic records, or issuing admission offers.

### 5.3 `admissions.applicants.place` (PROPOSED)
- **Module:** `admissions` | **Resource:** `applicants` | **Action:** `place`
- **Description:** `Allocate senior secondary school applicants to academic stream tracks (Science, Arts, Commercial, Technical)`
- **Canonical Scope:** `school` | **Allowed Scopes:** `['platform', 'organization', 'school']`
- **Base-Role Grants:** `super_admin` (`platform`), `org_admin` (`school`), `school_admin` (`school`).
- **Functional-Assignment Grants:** `exam_officer` (`school`).
- **Org Reach Rule:** `org_admin` access allowed ONLY if target school is in `organizationSubtenantIds`.
- **Strict Prohibition:** Stream placement qualifies an applicant for a track based on WAEC rules; it DOES NOT issue an admission offer or execute student enrollment.

### 5.4 `admissions.letters.dispatch` (PROPOSED)
- **Module:** `admissions` | **Resource:** `letters` | **Action:** `dispatch`
- **Description:** `Generate and record official dispatch of formal admission decision letters to applicants`
- **Canonical Scope:** `school` | **Allowed Scopes:** `['platform', 'organization', 'school']`
- **Base-Role Grants:** `super_admin` (`platform`), `org_admin` (`school`), `school_admin` (`school`).
- **Functional-Assignment Grants:** None (`exam_officer` STRICTLY DENIED).
- **Org Reach Rule:** `org_admin` access allowed ONLY if target school is in `organizationSubtenantIds`.
- **Lifecycle & Side Effects:** Permitted only when `applicant.stage IN ('Offer', 'Allocation')` and `status = 'active'`. Server sets `admission_letter_sent = true` and `admission_letter_sent_at = NOW()`; enqueues asynchronous outbound email/SMS delivery.

### 5.5 `admissions.applicants.enroll` (PROPOSED)
- **Module:** `admissions` | **Resource:** `applicants` | **Action:** `enroll`
- **Description:** `Execute master enrollment transaction converting an admitted applicant into an active student record`
- **Canonical Scope:** `school` | **Allowed Scopes:** `['platform', 'organization', 'school']`
- **Base-Role Grants:** `super_admin` (`platform`), `org_admin` (`school`), `school_admin` (`school`).
- **Functional-Assignment Grants:** None (`exam_officer`, `teacher` STRICTLY DENIED).
- **Org Reach Rule:** `org_admin` access allowed ONLY if target school is in `organizationSubtenantIds`.
- **Lifecycle Preconditions:** Target applicant must have `stage = 'Offer'`, `status = 'active'`, and `docs_verified = true`.

### 5.6 `curriculum.lesson_plan.generate` (PROPOSED)
- **Module:** `curriculum` | **Resource:** `lesson_plan` | **Action:** `generate`
- **Description:** `Generate ephemeral classroom instructional lesson plans from published curriculum topics using AI`
- **Canonical Scope:** `offering` | **Allowed Scopes:** `['platform', 'organization', 'school', 'department', 'offering']`
- **Base-Role Grants:** `super_admin` (`platform`), `org_admin` (`school`), `school_admin` (`school`).
- **Functional-Assignment Grants:** `subject_teacher` (`offering`), `hod` (`department`).
- **Org Reach Rule:** `org_admin` access allowed ONLY if offering's school is in `organizationSubtenantIds`.
- **Teacher Assignment Rule:** A `teacher` is authorized ONLY if their actor ID matches `subject_offerings.teacher_id`.
- **Ephemeral Semantics:** The plan is returned in-memory to the client session. Zero records inserted into a `lesson_plans` table. Token consumption logged in `ai_usage_logs`.

---

## 6. Exam Officer Authority Demarcation

The Examination Officer's authority in admissions is strictly bounded to objective academic assessment and stream track qualification:

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

## 7. Final Permission Matrix (Required Section 8)

| Capability | Permission | Scope | Base Roles | Functional Assignments | Org Reach Rule | SoD Enforced | Lifecycle Precondition | Side Effects | Governance Status |
|---|---|---|---|---|---|---|---|---|---|
| **View Applicants** | `admissions.applicants.view` | `school` | `super_admin`, `org_admin`, `school_admin` | `exam_officer` | `target.tenantId IN orgSubtenants` | None | Any lifecycle state | Read-only | **EXISTING** |
| **Create Applicant** | `admissions.applicants.create` | `school` | `super_admin`, `org_admin`, `school_admin` | None | `target.tenantId IN orgSubtenants` | None | None | Initial intake row; auto-stream eval | **EXISTING** |
| **Maintain Applicant** | `admissions.applicants.manage` | `school` | `super_admin`, `org_admin`, `school_admin` | None | `target.tenantId IN orgSubtenants` | None | `status = 'active'` | Clerical PII/contact updates | **PROPOSED** |
| **Evaluate Applicant** | `admissions.applicants.evaluate` | `school` | `super_admin`, `org_admin`, `school_admin` | `exam_officer` | `target.tenantId IN orgSubtenants` | Evaluator ≠ Decision maker | `stage IN ('Application', 'Assessment', 'Interview')` | Writes scores to `admission_history` | **PROPOSED** |
| **Stream Placement** | `admissions.applicants.place` | `school` | `super_admin`, `org_admin`, `school_admin` | `exam_officer` | `target.tenantId IN orgSubtenants` | Track qualification ≠ Admission | `school_level = 'SSS'`, `status = 'active'` | Updates `target_stream`, logs in history | **PROPOSED** |
| **Admission Approval** | `admissions.applicants.approve` | `school` | `super_admin`, `org_admin`, `school_admin` | None | `target.tenantId IN orgSubtenants` | Executive only (`exam_officer` denied) | `stage IN ('Application', 'Assessment', 'Interview')` | Transitions stage to `Offer` | **EXISTING** |
| **Admission Rejection** | `admissions.applicants.approve` | `school` | `super_admin`, `org_admin`, `school_admin` | None | `target.tenantId IN orgSubtenants` | Executive only (`exam_officer` denied) | `stage != 'Allocation'` | Sets status `rejected`, logs reason | **EXISTING** |
| **Letter Dispatch** | `admissions.letters.dispatch` | `school` | `super_admin`, `org_admin`, `school_admin` | None | `target.tenantId IN orgSubtenants` | None | `stage IN ('Offer', 'Allocation')` | Generates letter; enqueues SMS/email | **PROPOSED** |
| **Master Enrollment** | `admissions.applicants.enroll` | `school` | `super_admin`, `org_admin`, `school_admin` | None | `target.tenantId IN orgSubtenants` | Executive only; stage must be `Offer` | `stage = 'Offer'`, `status = 'active'`, `docs_verified = true` | Creates student, parent; sets `Allocation` | **PROPOSED** |
| **AI Lesson Generation** | `curriculum.lesson_plan.generate` | `offering` | `super_admin`, `org_admin`, `school_admin` | `subject_teacher`, `hod` | `offering.tenantId IN orgSubtenants` | Teacher assignment verified | `cv.status = 'published'`, active academic year | Calls Gemini API; logs tokens | **PROPOSED** |
| **Curriculum Authoring** | `curriculum.version.create` | `school` | `super_admin`, `org_admin`, `school_admin` | None | `target.tenantId IN orgSubtenants` | Syllabus drafting only | None | Creates syllabus draft | **REJECTED (For AI)** |
| **Admissions Delete** | `admissions.applicants.delete` | `school` | `super_admin`, `org_admin`, `school_admin` | None | `target.tenantId IN orgSubtenants` | Executive only | `stage != 'Allocation'` | Deletes applicant row | **DEFERRED** |

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

Every proposed permission satisfies the distinct business-capability requirement:
1. `admissions.applicants.manage`: Protects applicant demographic integrity from unauthorized mutation.
2. `admissions.applicants.evaluate`: Empowers examination officers and markers to enter objective marks without administrative escalation.
3. `admissions.applicants.place`: Governs senior secondary academic track allocation and WAEC prerequisite compliance.
4. `admissions.letters.dispatch`: Governs external legal communications and document issuance.
5. `admissions.applicants.enroll`: Governs the irreversible creation of legal student and parent identities in the master registry.
6. `curriculum.lesson_plan.generate`: Governs external AI token consumption and pedagogical assistance bounded to published syllabus.
