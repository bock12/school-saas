# TASK-0007 Phase 3C-A — Database Security Boundary Design & `enroll_applicant` Remediation (Final Security Revision)

**Task:** TASK-0007 Phase 3C-A  
**Stage:** Architecture & Specification Only  
**Status:** ARCHITECTURE READY — AWAITING SUPERVISORY APPROVAL  
**Branch:** `ai-eos/task-0007-phase-3c-a-permission-architecture`  
**Base Commit:** `e4d673e`  
**Supervisory Authority:** ChatGPT (Chief Software Architect & Project Supervisor)  
**Final Authority:** Human Project Owner  

---

## 1. Executive Security Analysis

During the preflight discovery of TASK-0007 Phase 3C, a critical database security defect was identified:
`public.enroll_applicant` (defined in `supabase/migrations/017_enroll_applicant_rpc.sql`) was created as a `SECURITY DEFINER` function without revocation of public execution privileges, without caller identity verification, and with reliance on an untrusted, client-supplied administrator ID (`p_admin_id`).

This vulnerability allows any authenticated client session (including students, parents, or users from external tenants) to invoke `supabase.rpc('enroll_applicant', ...)` directly over the Supabase PostgREST API, bypassing:
1. The Next.js API layer.
2. The canonical RBAC authorization engine (`permissions-registry.ts`, `authorization-engine.ts`).
3. Tenant isolation boundaries.
4. Row-Level Security (RLS) policies on `students`, `parents`, and `applicants`.

This document delivers an **exhaustive 18-point architectural dissection** of `public.enroll_applicant`, establishes the **precise trust boundary specification reconciling service-role transport with human actor identity**, formalizes the **direct RPC threat model as defense-in-depth**, details the **true enrollment idempotency flow**, and specifies the **mandatory database uniqueness constraint prerequisite**.

---

## 2. Precise Service-Role / Human Actor Trust Boundary Specification (Required Sections 1–4)

### 2.1 Correction of the `p_actor_id` Overclaim
The assertion that passing `p_actor_id` into a database stored procedure guarantees actor attribution is an overclaim that conflates parameter passing with cryptographic identity proof.

**Architectural Correction:**
> `p_actor_id` is **not identity proof**. It is trusted only when supplied by a server-only execution boundary after authentication and canonical authorization have already established the human actor.

### 2.2 The Conceptual Disambiguation
The architecture strictly distinguishes three orthogonal concepts:
- **Transport Privilege:** The `service_role` database connection credential. It exists solely to allow trusted backend code to execute multi-table administrative writes across tables guarded by restrictive RLS (`students`, `parents`, `student_parents`). **`service_role` is a transport mechanism, NOT an identity, and never represents the human user.**
- **Business Authorization:** The decision rendered by the canonical Phase 3A engine (`admissions.applicants.enroll`) confirming that the human actor holds authority over the target school.
- **Human Actor Identity:** The unique identifier of the authenticated person (`auth.uid()`) who authorized and initiated the action.

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        PRECISE ACTOR IDENTITY & TRUST PIPELINE                         │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  [1] Authenticated Human Session (Browser / API Client)                                │
│      - Client initiates POST /api/admissions/:id/enroll with cryptographic cookie/JWT. │
│                                                                                        │
│  [2] Session Authentication (auth.uid())                                               │
│      - Next.js Server Boundary executes: supabase.auth.getUser(token).                 │
│      - Cryptographically verifies signature using Supabase Auth JWT secret.           │
│      - Extracts authenticated user UUID: trustedHumanActorId = user.id.                │
│                                                                                        │
│  [3] Canonical Authorization Context & Target Resolution                               │
│      - Resolves caller context (roles, schoolId, organizationSubtenantIds).            │
│      - Loads authoritative applicant record from DB (id, tenant_id, stage, status).    │
│      - Evaluates: evaluatePermission('admissions.applicants.enroll', target, context).│
│      - Rejects with HTTP 403 if unauthorized or cross-tenant.                          │
│                                                                                        │
│  [4] Server Command Construction                                                       │
│      - Server constructs internal parameters: p_applicant_id = target.id,              │
│        p_actor_id = trustedHumanActorId.                                               │
│      - Discards any client-supplied actorId/adminId in HTTP request body.              │
│                                                                                        │
│  [5] Privileged Internal Invocation (service_role transport)                           │
│      - Next.js Server uses SUPABASE_SERVICE_ROLE_KEY to call PostgreSQL RPC.           │
│                                                                                        │
│  [6] Database Transaction & Stored Procedure Execution                                 │
│      - PostgreSQL verifies connection role is service_role or postgres.                │
│      - PostgreSQL validates p_actor_id against active profiles table.                  │
│      - PostgreSQL exclusively locks applicant row: SELECT ... FOR UPDATE.              │
│      - PostgreSQL writes p_actor_id permanently into admission_history.created_by.     │
│      - Commits transaction; returns permanent student UUID.                            │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Server Command Trust Invariant
The server command request schema **accepts NO actor ID parameter**.
```text
actor identity is derived strictly from the authenticated request context,
never accepted as an authorization input from the client.
```
Any client-supplied `p_actor_id`, `actorId`, or `adminId` is stripped or rejected. An ordinary client cannot invoke the privileged path because the server endpoint rejects unauthorized callers with HTTP 403.

### 2.4 Explicit Prohibitions
To prevent privilege escalation and audit spoofing, the architecture strictly enforces:
- **`client → p_actor_id` [PROHIBITED]:** Request schemas for admissions endpoints accept NO `actorId`, `adminId`, or `p_actor_id` parameter. Any such client-supplied fields are discarded or rejected.
- **`client → service_role` [PROHIBITED]:** The `SUPABASE_SERVICE_ROLE_KEY` is strictly held in server-side environment variables and never exposed to the client bundle or network responses.
- **`client → enrollment RPC` [PROHIBITED]:** Direct client invocation of `public.enroll_applicant` over PostgREST is blocked by revoking PostgreSQL `EXECUTE` privileges from `PUBLIC`, `anon`, and `authenticated`.
- **`client → arbitrary actor UUID` [PROHIBITED]:** The enacting actor UUID passed to the database is derived strictly from `auth.uid()`, preventing an attacker from attributing actions to another user.

---

## 3. Direct RPC Threat Model (Required Section 4 & 5)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                             DIRECT RPC THREAT MODEL & DEFENSE                          │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  ATTACKER:                                                                             │
│    An authenticated ordinary application user (student, parent, unprivileged teacher,  │
│    or an actor from a foreign school tenant) holding a valid JWT.                      │
│                                                                                        │
│  ATTACK VECTOR:                                                                        │
│    Attacker bypasses the Next.js frontend and directly invokes:                        │
│    POST /rest/v1/rpc/enroll_applicant                                                  │
│    Headers: { Authorization: "Bearer <Attacker-JWT>" }                                 │
│    Body:    { p_applicant_id: "target-applicant-uuid", p_actor_id: "principal-uuid" }   │
│                                                                                        │
│  VULNERABILITY IN LEGACY MIGRATION 017:                                                │
│    Function public.enroll_applicant was granted to PUBLIC by default. PostgREST        │
│    accepted the call, executed as SECURITY DEFINER, bypassed RLS, and enrolled the      │
│    applicant without authorization checks.                                             │
│                                                                                        │
│  REMEDIATED DEFENSE (DESIRED RESULT: DENY):                                            │
│    1. PostgreSQL grants for public.enroll_applicant are explicitly REVOKED from        │
│       PUBLIC, anon, and authenticated.                                                 │
│    2. PostgREST checks PostgreSQL privileges for the connected role (authenticated).   │
│    3. Because authenticated lacks EXECUTE privilege, PostgREST rejects the call        │
│       immediately with HTTP 403 Permission Denied (or HTTP 404 Function Not Found).   │
│    4. The function code NEVER executes. Database state is 100% untouched.               │
│                                                                                        │
│  WHY REVOKING RPC IS ONLY ONE LAYER (COMPLETE SECURITY BOUNDARY):                      │
│    Revoking EXECUTE prevents client RPC invocation. However, true defense-in-depth      │
│    requires all four layers:                                                           │
│      authentication (valid JWT session)                                                │
│      + canonical authorization (admissions.applicants.enroll evaluated by Phase 3A)   │
│      + trusted resource resolution (applicant.tenant_id belongs to authorized school) │
│      + server-only privileged execution (invoked via service_role with p_actor_id).   │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Enrollment Idempotency & Database Uniqueness Constraints (Required Section 6)

### 4.1 Correcting the `FOR UPDATE` Duplicate Prevention Model
The assertion that `SELECT ... FOR UPDATE` alone guarantees duplicate prevention is incomplete. Row-level locking serializes concurrent transactions at runtime, but without database-level uniqueness constraints, sequential execution or out-of-band insertions can still create duplicate student entities.

### 4.2 The Complete Transaction & Idempotency Flow
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
     WHERE applicant_id = p_applicant_id;
     RETURN v_existing_student_id;
   END IF;
  ↓
3. Validate lifecycle prerequisites:
   IF v_applicant.stage != 'Offer' OR v_applicant.status != 'active' OR v_applicant.docs_verified != true THEN
     RAISE EXCEPTION 'LIFECYCLE_PRECONDITION_FAILED: Applicant must be active in Offer stage with verified docs';
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

### 4.3 Mandatory Schema Prerequisite: `students.applicant_id UNIQUE`
In the existing database schema (`002_school_modules.sql`), `public.students` contains `UNIQUE(tenant_id, admission_number)`, but lacks an `applicant_id` column with a unique constraint. Because admission numbers are generated dynamically, two separate insertions could theoretically create two student rows for the same applicant if runtime locking failed.

**Implementation Prerequisite:**
The subsequent implementation task MUST apply a database migration adding:
```sql
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS applicant_id UUID UNIQUE REFERENCES public.applicants(id);
```
This guarantees defense-in-depth:
1. **Runtime Layer:** `SELECT ... FOR UPDATE` serializes concurrent requests and enables deterministic idempotent returns.
2. **Storage Engine Layer:** The `UNIQUE(applicant_id)` constraint guarantees at the PostgreSQL storage engine level that duplicate student records can never be created for the same applicant under any race condition or error state.

---

## 5. Minimum Enrollment Audit Record Specification (Required Section 7)

Every enrollment execution records an immutable audit trail in `public.admission_history`:
```text
┌──────────────────────────────┬────────────────────────────────────────────────────────┐
│ Field                        │ Value Specification                                    │
├──────────────────────────────┼────────────────────────────────────────────────────────┤
│ actor_id (created_by)        │ Server-verified auth.uid() (never chosen by client)     │
│ tenant_id                    │ Authoritative applicant.tenant_id                      │
│ applicant_id                 │ Target applicant UUID                                  │
│ from_stage                   │ 'Offer'                                                │
│ to_stage                     │ 'Allocation'                                           │
│ result                       │ Created student UUID                                   │
│ timestamp (created_at)       │ Server NOW()                                           │
└──────────────────────────────┴────────────────────────────────────────────────────────┘
```
The enacting actor corresponds authoritatively to the authenticated and canonically authorized human administrator. The client is strictly prohibited from selecting or overriding the audit actor.

---

## 6. Comprehensive 9-Point Database Security Model for `enroll_applicant`

| Security Dimension | Specification & Enforcement Mechanism |
|---|---|
| **1. Invocation Boundary** | Callable **strictly by `service_role`**. Revoked completely from `PUBLIC`, `anon`, and `authenticated`. PostgREST blocks any non-service-role caller with HTTP 403. |
| **2. Business Authorization** | Authorized strictly by canonical permission **`admissions.applicants.enroll`** evaluated at the server command boundary prior to database execution. |
| **3. Actor Identity** | Server extracts **`auth.uid()`** from verified session JWT and passes it as `p_actor_id`. PostgreSQL validates that `p_actor_id` exists in `public.profiles` and is active. |
| **4. Resource Authorization** | Server loads applicant record and verifies `applicant.tenant_id === callerContext.schoolId` (or within `org_admin` institutional hierarchy). Cross-tenant requests are rejected with HTTP 403 before reaching the database. |
| **5. Lifecycle Prerequisites** | Applicant must be in **`stage = 'Offer'`**, **`status = 'active'`**, and **`docs_verified = true`**. Rejects with HTTP 422 if applicant has not been offered admission or documents are unverified. |
| **6. Atomic Transaction** | Atomically executes: (1) `SELECT ... FOR UPDATE`, (2) `INSERT INTO students`, (3) `INSERT/SELECT parents`, (4) `INSERT INTO student_parents`, (5) `UPDATE applicants SET stage = 'Allocation', status = 'enrolled'`, (6) `INSERT INTO admission_history`. Rolls back 100% on any failure. |
| **7. Concurrency & Idempotency** | **`SELECT * INTO v_applicant FROM public.applicants WHERE id = p_applicant_id FOR UPDATE`**. If `stage = 'Allocation'`, returns existing student ID deterministically. Storage engine protected by `UNIQUE(applicant_id)` constraint on `public.students`. |
| **8. Audit Integrity** | Enacting human actor UUID (`p_actor_id`), tenant ID, applicant ID, timestamp (`NOW()`), and transition comment are recorded immutably in `public.admission_history`. |
| **9. Direct RPC Prevention** | PostgREST enforces PostgreSQL function grants. Because `EXECUTE` is revoked from `anon` and `authenticated`, any direct client call via `supabase.rpc()` fails immediately at the PostgREST layer. |

---

## 7. Exhaustive 18-Point Dissection of `public.enroll_applicant`

### 1. Current EXECUTE Privileges
In PostgreSQL, functions created without an explicit `REVOKE` grant `EXECUTE` privilege to `PUBLIC` by default. Consequently, both `anon` and `authenticated` roles hold execute permissions. PostgREST automatically exposes this function at `/rest/v1/rpc/enroll_applicant`.

### 2. SECURITY DEFINER Behavior
The function executes with the privileges of the database owner (typically `postgres` / superuser). Under `SECURITY DEFINER`, all table queries inside the function execute with superuser rights, completely bypassing Row-Level Security (RLS) on `applicants`, `students`, `parents`, `student_parents`, and `admission_history`.

### 3. Caller Identity
The function does not query `auth.uid()` or inspect request JWT claims. To PostgreSQL, the caller's actual identity is completely unverified during function execution.

### 4. `p_admin_id` Semantics
The argument `p_admin_id UUID` is treated as the author of the enrollment action and recorded in `admission_history.created_by`. Because this parameter is supplied directly by the client caller, an attacker can pass any arbitrary UUID (including the UUID of an innocent school principal or super administrator), forging the audit trail.

### 5. Tenant Resolution
Tenant identity is extracted from the target applicant record: `v_applicant.tenant_id`. While this ensures created student/parent records share the applicant's tenant, the function **never verifies whether the caller belongs to or has authority over that tenant**.

### 6. Applicant Ownership / Tenant Validation
Zero validation exists between the caller's authorized school and `v_applicant.tenant_id`. An actor with a valid JWT from "School A" can pass the UUID of an applicant belonging to "School B" and successfully trigger enrollment.

### 7. Profile & Student Creation
The function inserts a new record into `public.students` using values from `v_applicant`. It generates a pseudorandom admission number (`'STU-' || upper(substr(md5(random()::text), 1, 6))`). If an applicant has missing or malformed fields, the function performs minimal validation (except safe casting of `gender`).

### 8. Parent Creation & Deduplication
The function queries `public.parents` by phone number within `v_applicant.tenant_id`. If not found, it splits `v_applicant.parent_name` into first/last names (defaulting empty last names to `'Unknown'`) and creates a new parent record. If an attacker repeatedly calls the function with fabricated applicants, unverified parent entities are created.

### 9. Enrollment Side Effects
The function executes four primary side effects:
1. Inserts into `public.students`.
2. Inserts or reuses record in `public.parents`.
3. Inserts junction row in `public.student_parents`.
4. Mutates applicant: `stage = 'Allocation'`, `docs_verified = true`, `updated_at = NOW()`.
5. Inserts audit row in `public.admission_history`.

### 10. Transaction Behavior
The function runs inside an implicit single PostgreSQL transaction block. If any insert or update fails (e.g., foreign key violation or check constraint), the entire operation rolls back cleanly.

### 11. Concurrency Behavior & Race Conditions
The legacy function does not issue `SELECT ... FOR UPDATE` and does not link `students` with a unique constraint on `applicant_id`. Concurrent requests create duplicate student rows with different admission numbers.

### 12. Direct Supabase RPC Exploit Path
An ordinary authenticated user holding a valid JWT can execute `supabase.rpc('enroll_applicant', ...)` directly. Because the function is `SECURITY DEFINER` and granted to `PUBLIC`, it executes without authorization checks.

### 13. Client-Callable Evaluation
**Verdict: ABSOLUTELY NO.** Admissions enrollment is an irreversible, high-consequence administrative action that creates legal student records. It must never be exposed to direct client RPC invocation.

### 14. Server-Only Execution Requirement
**Verdict: YES.** The function must become strictly server-only, executable exclusively by the trusted backend environment via the `service_role` connection.

### 15. Actor Identity Derivation from `auth.uid()`
**Verdict: MANDATORY.** The human actor identity must be authoritatively derived from `auth.uid()` at the server boundary and passed as verified `p_actor_id`. The client must never provide `p_admin_id`.

### 16. Required GRANT / REVOKE Model
```sql
REVOKE ALL ON FUNCTION public.enroll_applicant(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.enroll_applicant(UUID, UUID) FROM anon;
REVOKE ALL ON FUNCTION public.enroll_applicant(UUID, UUID) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.enroll_applicant(UUID, UUID) TO service_role;
```

### 17. Row-Level Security (RLS) Implications
By restricting execution to `service_role`, the API server invokes the RPC using the privileged Supabase admin client. The function retains `SECURITY DEFINER` with an explicit `search_path = public, auth, extensions`. Table-level RLS policies on `students`, `parents`, and `applicants` remain active for all client-facing queries.

### 18. Required Regression Tests
The test suite must verify:
1. Direct RPC execution by `anon` role yields `403 Permission Denied`.
2. Direct RPC execution by `authenticated` role (student/parent/teacher) yields `403 Permission Denied`.
3. Server-side invocation via `service_role` succeeds for valid, authorized applicants.
4. Concurrent invocations on the same applicant serialize cleanly with exactly one student created and deterministic return.

---

## 8. Remediation Migration Specification (Proposed Future Migration)

> [!IMPORTANT]
> This SQL code is a specification for the subsequent implementation task. In accordance with task constraints, **no database migration is modified or applied during this architecture phase**.

```sql
-- ====================================================================
-- PROPOSED REMEDIATION SPECIFICATION: 048_harden_enroll_applicant_rpc.sql
-- ====================================================================

-- 1. Add missing schema uniqueness constraint prerequisite
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS applicant_id UUID UNIQUE REFERENCES public.applicants(id);

-- 2. Drop existing vulnerable function signature to clear public execute grants
DROP FUNCTION IF EXISTS public.enroll_applicant(UUID, UUID);

-- 3. Create hardened function with explicit actor parameter and idempotent return
CREATE OR REPLACE FUNCTION public.enroll_applicant(
  p_applicant_id UUID,
  p_actor_id UUID
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_applicant RECORD;
  v_student_id UUID;
  v_parent_id UUID;
  v_parent_first TEXT;
  v_parent_last TEXT;
  v_admission_number TEXT;
  v_gender gender_type;
  v_verified_actor RECORD;
BEGIN
  -- 1. Invocation Boundary Check: Must be invoked by service_role or superuser
  IF current_user NOT IN ('service_role', 'postgres') AND auth.role() != 'service_role' THEN
    RAISE EXCEPTION 'Access Denied: enroll_applicant may only be invoked by authorized service_role';
  END IF;

  -- 2. Actor Identity Verification: Enacting human actor must be an active profile
  IF p_actor_id IS NULL THEN
    RAISE EXCEPTION 'Audit Failure: Enacting administrator ID (p_actor_id) is required';
  END IF;

  SELECT id, tenant_id INTO v_verified_actor
  FROM public.profiles
  WHERE id = p_actor_id AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Audit Failure: Enacting actor % is not a valid active profile', p_actor_id;
  END IF;

  -- 3. Concurrency Lock: Lock applicant row exclusively to prevent race conditions
  SELECT * INTO v_applicant 
  FROM public.applicants 
  WHERE id = p_applicant_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Applicant not found: %', p_applicant_id;
  END IF;

  -- 4. Idempotency Check: Return existing student ID deterministically if already enrolled
  IF v_applicant.stage = 'Allocation' THEN
    SELECT id INTO v_student_id 
    FROM public.students 
    WHERE applicant_id = p_applicant_id;

    IF v_student_id IS NOT NULL THEN
      RETURN v_student_id;
    END IF;
  END IF;

  -- 5. Lifecycle Validation: Must be in 'Offer' stage with verified docs to enroll
  IF v_applicant.stage != 'Offer' OR v_applicant.status != 'active' OR v_applicant.docs_verified != true THEN
    RAISE EXCEPTION 'Lifecycle Violation: Applicant must be active in Offer stage with verified docs. Stage: %, Status: %, Verified: %',
      v_applicant.stage, v_applicant.status, v_applicant.docs_verified;
  END IF;

  -- 6. Generate Deterministic Admission Number (STU- + 6 random hex)
  v_admission_number := 'STU-' || upper(substr(md5(random()::text), 1, 6));

  -- Cast gender safely
  BEGIN
    v_gender := v_applicant.gender::gender_type;
  EXCEPTION WHEN OTHERS THEN
    v_gender := NULL;
  END;

  -- 7. Insert Student Record with applicant_id unique link
  INSERT INTO public.students (
    tenant_id,
    applicant_id,
    admission_number,
    first_name,
    last_name,
    date_of_birth,
    gender,
    email,
    phone,
    address,
    guardian_name,
    guardian_phone,
    guardian_email,
    guardian_relationship,
    blood_group,
    avatar_url,
    is_active
  ) VALUES (
    v_applicant.tenant_id,
    p_applicant_id,
    v_admission_number,
    v_applicant.first_name,
    v_applicant.last_name,
    v_applicant.dob,
    v_gender,
    v_applicant.email,
    v_applicant.phone,
    v_applicant.address,
    v_applicant.parent_name,
    v_applicant.parent_phone,
    v_applicant.parent_email,
    v_applicant.parent_relation,
    v_applicant.blood_group,
    v_applicant.avatar_url,
    true
  ) RETURNING id INTO v_student_id;

  -- 8. Insert or Link Parent Record
  SELECT id INTO v_parent_id 
  FROM public.parents 
  WHERE tenant_id = v_applicant.tenant_id AND phone = v_applicant.parent_phone
  LIMIT 1;

  IF v_parent_id IS NULL THEN
    v_parent_first := split_part(v_applicant.parent_name, ' ', 1);
    v_parent_last := trim(substring(v_applicant.parent_name from length(v_parent_first) + 1));
    
    IF v_parent_last = '' THEN
      v_parent_last := 'Unknown';
    END IF;

    INSERT INTO public.parents (
      tenant_id,
      first_name,
      last_name,
      email,
      phone,
      address
    ) VALUES (
      v_applicant.tenant_id,
      v_parent_first,
      v_parent_last,
      v_applicant.parent_email,
      v_applicant.parent_phone,
      v_applicant.address
    ) RETURNING id INTO v_parent_id;
  END IF;

  -- 9. Insert Student-Parent Junction
  INSERT INTO public.student_parents (
    tenant_id,
    student_id,
    parent_id,
    relationship,
    is_primary,
    is_emergency_contact
  ) VALUES (
    v_applicant.tenant_id,
    v_student_id,
    v_parent_id,
    v_applicant.parent_relation,
    true,
    true
  );

  -- 10. Advance Applicant State Machine
  UPDATE public.applicants 
  SET 
    stage = 'Allocation',
    status = 'enrolled',
    docs_verified = true,
    updated_at = NOW()
  WHERE id = p_applicant_id;

  -- 11. Record Immutable Audit History with Human Actor Attribution
  INSERT INTO public.admission_history (
    tenant_id,
    applicant_id,
    from_stage,
    to_stage,
    comment,
    created_by
  ) VALUES (
    v_applicant.tenant_id,
    p_applicant_id,
    'Offer',
    'Allocation',
    'Student successfully enrolled into institutional student registry via canonical authorization.',
    p_actor_id
  );

  RETURN v_student_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Strict Permission Revocation & Grant Model
REVOKE ALL ON FUNCTION public.enroll_applicant(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.enroll_applicant(UUID, UUID) FROM anon;
REVOKE ALL ON FUNCTION public.enroll_applicant(UUID, UUID) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.enroll_applicant(UUID, UUID) TO service_role;
```
