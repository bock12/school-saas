# TASK-0007 Phase 3C-A — Database Security Boundary Design & `enroll_applicant` Remediation (Revised)

**Task:** TASK-0007 Phase 3C-A  
**Stage:** Architecture & Specification Only  
**Status:** ARCHITECTURE READY — AWAITING SUPERVISORY APPROVAL  
**Branch:** `ai-eos/task-0007-phase-3c-a-permission-architecture`  
**Base Commit:** `e4d673e`  
**Supervisory Authority:** ChatGPT (Chief Software Architect & Project Supervisor)  
**Final Authority:** Human Project Owner  

---

## 1. Executive Security Analysis

During the preflight discovery of TASK-0007 Phase 3C, an architectural vulnerability was identified in the database boundary:
`public.enroll_applicant` (defined in `supabase/migrations/017_enroll_applicant_rpc.sql`) was created as a `SECURITY DEFINER` function without revocation of public execution privileges, without caller identity verification, and with reliance on an untrusted, client-supplied administrator ID (`p_admin_id`).

This design defect allows any authenticated client session (including students, parents, or users from external tenants) to invoke `supabase.rpc('enroll_applicant', ...)` directly over the Supabase PostgREST API, bypassing:
1. The Next.js API layer.
2. The canonical RBAC authorization engine (`permissions-registry.ts`, `authorization-engine.ts`).
3. Tenant isolation boundaries.
4. Row-Level Security (RLS) policies on `students`, `parents`, and `applicants`.

This document delivers an **exhaustive 18-point architectural dissection** of `public.enroll_applicant`, specifies the **complete actor identity resolution chain for service-role execution**, and formulates a **remediation design** to establish a secure database boundary.

---

## 2. Reconciling Service-Role Execution with Human Actor Identity (Required Section 4)

A fundamental architectural question arises when using privileged database credentials:
> *If the database transaction executes using the privileged `service_role` connection, how does the database know which human actor caused the enrollment, and how is audit attribution preserved without treating `service_role` itself as the actor?*

### 2.1 The Complete Identity & Authorization Chain

The architecture resolves this by enforcing a strictly ordered, server-mediated identity chain:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                         COMPLETE ACTOR IDENTITY RESOLUTION CHAIN                       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  1. Authenticated Human Session (Browser Client)                                       │
│     - Authenticated administrator triggers enrollment in web UI.                       │
│     - Sends HTTPS POST /api/admissions/:id/enroll with cryptographic session cookie.   │
│                                                                                        │
│  2. Session Authentication (auth.uid())                                                │
│     - Next.js Server boundary invokes createClient() -> supabase.auth.getUser().       │
│     - Supabase Auth validates JWT signature and extracts caller identity:              │
│       trustedHumanActorId = user.id (UUID).                                            │
│     - If invalid or expired, execution halts immediately with HTTP 401.                │
│                                                                                        │
│  3. Canonical Authorization Engine Evaluation                                          │
│     - Context Resolver hydrates caller profile (roles, schoolId, assignments).         │
│     - Resource Resolver loads authoritative applicant target from DB.                  │
│     - Canonical Engine evaluates:                                                      │
│       evaluatePermission('admissions.applicants.enroll', applicantTarget, authContext) │
│     - If caller lacks permission or cross-tenant reach, execution halts with HTTP 403. │
│                                                                                        │
│  4. Business Precondition Verification (Server Command Boundary)                       │
│     - Checks applicant.stage === 'Offer', status === 'active', docs_verified === true. │
│     - If preconditions fail, execution halts with HTTP 422.                            │
│                                                                                        │
│  5. Privileged Internal Database Invocation (service_role)                             │
│     - The server instantiates the privileged Supabase Admin Client (service_role key). │
│     - The server invokes the database function, passing the verified human identity:   │
│       adminClient.rpc('enroll_applicant', {                                            │
│         p_applicant_id: applicantTarget.id,                                            │
│         p_actor_id: trustedHumanActorId                                                │
│       })                                                                               │
│                                                                                        │
│  6. Database Transaction & Execution Verification (PostgreSQL)                         │
│     - Database verifies connection role is service_role or postgres.                   │
│     - Database verifies p_actor_id is non-null and corresponds to an active profile.   │
│     - Database locks applicant row: SELECT ... FOR UPDATE.                             │
│     - Database records p_actor_id directly into admission_history.created_by.          │
│     - Transaction commits. Returns permanent student ID.                               │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Why `service_role` Does NOT Represent the Human Actor
- `service_role` is a **transport and privilege-escalation mechanism**, not an identity. It is used strictly because PostgreSQL table-level RLS restricts direct multi-table insertions across `students`, `parents`, and `student_parents`.
- The human actor identity is established by cryptographic JWT authentication at the server boundary (`auth.uid()`) and passed as an explicit, tamper-proof parameter `p_actor_id` to the stored procedure.
- The stored procedure records `p_actor_id` in `admission_history.created_by`, guaranteeing 100% human audit attribution.

---

## 3. Exhaustive 18-Point Dissection of `public.enroll_applicant`

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
The function executes:
```sql
SELECT * INTO v_applicant FROM public.applicants WHERE id = p_applicant_id;
IF v_applicant.stage = 'Allocation' THEN RAISE EXCEPTION ...; END IF;
```
It does **NOT** issue `SELECT ... FOR UPDATE`. If two concurrent requests execute with the same `p_applicant_id`, both read `stage != 'Allocation'` simultaneously, proceed through insertion, and create **duplicate student records** with different admission numbers for the same applicant.

### 12. Direct Supabase RPC Exploit Path
An ordinary authenticated user (e.g., student or parent) holding a valid JWT can execute in the browser console or via curl:
```javascript
const { data, error } = await supabase.rpc('enroll_applicant', {
  p_applicant_id: 'target-applicant-uuid',
  p_admin_id: 'forged-principal-uuid'
});
```
PostgREST dispatches this to PostgreSQL. Because the function is `SECURITY DEFINER` and granted to `PUBLIC`, it executes successfully without touching application guards.

### 13. Client-Callable Evaluation
**Verdict: ABSOLUTELY NO.** Client-side callable execution of `enroll_applicant` represents an unacceptable security liability. Admissions enrollment is an irreversible, high-consequence administrative action that creates legal student records. It must never be exposed to direct client RPC invocation.

### 14. Server-Only Execution Requirement
**Verdict: YES.** The function must become strictly server-only. It must be executable exclusively by the trusted backend environment via the `service_role` connection.

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
By restricting execution to `service_role`, the API server invokes the RPC using the privileged Supabase admin client. The function retains `SECURITY DEFINER` with an explicit `search_path = public, auth, extensions` to guarantee deterministic resolution of objects. Table-level RLS policies on `students`, `parents`, and `applicants` remain active for all client-facing queries.

### 18. Required Regression Tests
The test suite must verify:
1. Direct RPC execution by `anon` role yields `403 Permission Denied`.
2. Direct RPC execution by `authenticated` role (student/parent/teacher) yields `403 Permission Denied`.
3. Server-side invocation via `service_role` succeeds for valid, authorized applicants.
4. Concurrent invocations on the same applicant serialize cleanly with exactly one student created.

---

## 4. Comprehensive Database Security Model for `enroll_applicant` (Required Section 5)

| Security Dimension | Specification & Enforcement Mechanism |
|---|---|
| **1. Invocation Boundary** | Callable **strictly by `service_role`**. Revoked completely from `PUBLIC`, `anon`, and `authenticated`. PostgREST blocks any non-service-role caller with HTTP 403. |
| **2. Business Authorization** | Authorized strictly by canonical permission **`admissions.applicants.enroll`** evaluated at the server command boundary prior to database execution. |
| **3. Actor Identity** | Server extracts **`auth.uid()`** from verified session JWT and passes it as `p_actor_id`. PostgreSQL verifies that `p_actor_id` exists in `public.profiles` and is active. |
| **4. Resource Authorization** | Server loads applicant record and verifies `applicant.tenant_id === callerContext.schoolId` (or within `org_admin` institutional hierarchy). Cross-tenant requests are rejected with HTTP 403 before reaching the database. |
| **5. Lifecycle Prerequisites** | Applicant must be in **`stage = 'Offer'`**, **`status = 'active'`**, and **`docs_verified = true`**. Rejects with HTTP 422 if applicant has not been offered admission or documents are unverified. |
| **6. Atomic Transaction** | Atomically executes: (1) `SELECT ... FOR UPDATE`, (2) `INSERT INTO students`, (3) `INSERT/SELECT parents`, (4) `INSERT INTO student_parents`, (5) `UPDATE applicants SET stage = 'Allocation', status = 'enrolled'`, (6) `INSERT INTO admission_history`. Rolls back 100% on any failure. |
| **7. Concurrency & Race Prevention** | **`SELECT * INTO v_applicant FROM public.applicants WHERE id = p_applicant_id FOR UPDATE`**. The row lock serializes concurrent enrollment requests. The second transaction observes `stage = 'Allocation'` and aborts with an exception. |
| **8. Audit Integrity** | Enacting human actor UUID (`p_actor_id`), tenant ID, applicant ID, timestamp (`NOW()`), and transition comment are recorded immutably in `public.admission_history`. |
| **9. Direct RPC Prevention** | PostgREST enforces PostgreSQL function grants. Because `EXECUTE` is revoked from `anon` and `authenticated`, any direct client call via `supabase.rpc()` fails immediately at the PostgREST layer. |

---

## 5. Remediation Migration Specification (Proposed Future Migration)

> [!IMPORTANT]
> This SQL code is a specification for the subsequent implementation task. In accordance with task constraints, **no database migration is modified or applied during this architecture phase**.

```sql
-- ====================================================================
-- PROPOSED REMEDIATION SPECIFICATION: 048_harden_enroll_applicant_rpc.sql
-- ====================================================================

-- 1. Drop existing vulnerable function signature to clear public execute grants
DROP FUNCTION IF EXISTS public.enroll_applicant(UUID, UUID);

-- 2. Create hardened function with explicit actor parameter
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

  -- 4. Lifecycle Validation: Must be in 'Offer' stage to enroll
  IF v_applicant.stage = 'Allocation' THEN
    RAISE EXCEPTION 'Applicant % has already been enrolled and allocated', p_applicant_id;
  END IF;

  IF v_applicant.stage != 'Offer' THEN
    RAISE EXCEPTION 'Lifecycle Violation: Applicant must be in Offer stage to enroll. Current stage: %', v_applicant.stage;
  END IF;

  -- 5. Generate Deterministic Admission Number (STU- + 6 random hex)
  v_admission_number := 'STU-' || upper(substr(md5(random()::text), 1, 6));

  -- Cast gender safely
  BEGIN
    v_gender := v_applicant.gender::gender_type;
  EXCEPTION WHEN OTHERS THEN
    v_gender := NULL;
  END;

  -- 6. Insert Student Record
  INSERT INTO public.students (
    tenant_id,
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

  -- 7. Insert or Link Parent Record
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

  -- 8. Insert Student-Parent Junction
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

  -- 9. Advance Applicant State Machine
  UPDATE public.applicants 
  SET 
    stage = 'Allocation',
    status = 'enrolled',
    docs_verified = true,
    updated_at = NOW()
  WHERE id = p_applicant_id;

  -- 10. Record Immutable Audit History with Human Actor Attribution
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

-- 3. Strict Permission Revocation & Grant Model
REVOKE ALL ON FUNCTION public.enroll_applicant(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.enroll_applicant(UUID, UUID) FROM anon;
REVOKE ALL ON FUNCTION public.enroll_applicant(UUID, UUID) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.enroll_applicant(UUID, UUID) TO service_role;
```
