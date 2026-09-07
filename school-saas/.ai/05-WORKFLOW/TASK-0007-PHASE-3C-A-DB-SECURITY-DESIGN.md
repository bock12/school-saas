# TASK-0007 Phase 3C-A — Database Security Boundary Design & `enroll_applicant` Remediation (Final Revision)

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

This document delivers an **exhaustive 18-point architectural dissection** of `public.enroll_applicant`, establishes the **precise 10-point trust boundary specification reconciling service-role transport with human actor identity**, formalizes the **direct RPC threat model**, and specifies the **comprehensive 9-point database security model**.

---

## 2. Precise Service-Role / Human Actor Trust Boundary Specification (Required Section 3)

### 2.1 The Conceptual Disambiguation
To prevent architectural confusion, the system strictly distinguishes three orthogonal concepts:
- **Transport Privilege:** The `service_role` database connection credential. It exists solely to allow trusted backend code to execute multi-table administrative writes across tables protected by restrictive RLS (`students`, `parents`, `student_parents`). **`service_role` is a transport mechanism, NOT an identity.**
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
│      - Commits transaction; returns new student UUID.                                  │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Exhaustive 10-Point Trust Boundary Specification
1. **Where `auth.uid()` is obtained:** Extracted on the server by Next.js Server Actions / route handlers via `createClient()` / `supabase.auth.getUser()`, which validates the cryptographic JWT signature.
2. **Where authentication occurs:** At the Next.js API/Server boundary. If the JWT is missing, expired, or invalid, execution halts immediately with HTTP 401 Unauthorized.
3. **Where canonical authorization occurs:** At the server boundary prior to any database mutation via `evaluateAuthorization()` or `can(authContext, 'admissions.applicants.enroll', applicantTarget)`. If unauthorized, returns HTTP 403 Forbidden.
4. **Where `p_actor_id` is constructed:** In the server route handler from `user.id` (`auth.uid()`).
5. **How the server prevents client-controlled `p_actor_id`:** The server ignores or strips any client-supplied `actorId`, `adminId`, or `userId` in the HTTP payload. It exclusively binds `p_actor_id = auth.uid()`.
6. **Why an ordinary client cannot invoke the same server command:** The server endpoint checks `can(authContext, 'admissions.applicants.enroll', target)`. An ordinary client (student, parent, unassigned teacher, exam officer) lacks this permission and is rejected with HTTP 403.
7. **How the database knows the invocation is from the trusted server boundary:** The PostgreSQL function `enroll_applicant` is REVOKED from `PUBLIC`, `anon`, and `authenticated`. It is granted EXCLUSIVELY to `service_role`. When the server calls the RPC using the `SUPABASE_SERVICE_ROLE_KEY`, PostgreSQL verifies `current_user = 'service_role'` or `auth.role() = 'service_role'`.
8. **How audit attribution is preserved:** The server passes the verified human actor UUID as `p_actor_id`. The database function verifies `p_actor_id` against `public.profiles` (`is_active = true`) and inserts it into `admission_history.created_by`.
9. **How a malicious server caller cannot impersonate another actor through an arbitrary UUID:** The server application code binds `p_actor_id` directly from `auth.uid()` of the cryptographic JWT. Since the secret `SUPABASE_SERVICE_ROLE_KEY` is held only on the trusted server and never exposed to clients, clients cannot execute arbitrary RPC calls or fabricate `p_actor_id`.
10. **Whether the RPC should receive `p_actor_id` at all:** Yes, receiving `p_actor_id UUID` as an explicit parameter in a function restricted to `service_role` is the standard, secure, and robust PostgreSQL pattern in Supabase when executing server-mediated administrative transactions.

---

## 3. Direct RPC Threat Model (Required Section 4)

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
│  WHY ATTACKER CANNOT REPRODUCE SERVER-MEDIATED PATH:                                   │
│    1. The attacker does not possess the SUPABASE_SERVICE_ROLE_KEY (held strictly       │
│       in secure server environment variables).                                         │
│    2. The only way to trigger enrollment is via POST /api/admissions/:id/enroll.       │
│    3. The server endpoint enforces createClient() authentication and canonical         │
│       evaluatePermission('admissions.applicants.enroll').                             │
│    4. The attacker's credentials lack this permission, yielding HTTP 403 at server.    │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

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

## 5. Exhaustive 18-Point Dissection of `public.enroll_applicant`

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

## 6. Remediation Migration Specification (Proposed Future Migration)

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
