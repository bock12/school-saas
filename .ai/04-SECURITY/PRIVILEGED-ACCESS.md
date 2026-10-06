# Privileged Access Policy & Super Admin Model

**Document Status:** PROPOSED — PENDING SUPERVISORY APPROVAL (TASK-0007 PHASE 1 CORRECTION)  
**Parent Program:** AI-EOS Security & Architecture Hardening  
**Authority:** ChatGPT (Chief Software Architect) / Human Project Owner  

---

## 1. Privileged Boundaries Overview

Privileged boundaries in SchoolSaaS represent operations capable of bypassing standard multi-tenant Row Level Security, altering account identities, mutating database schemas, or executing across tenant isolation boundaries.

The platform recognizes three tiers of privileged execution:

```text
┌─────────────────────────────────────────────────────────────┐
│ Tier 1: Platform Super Admin (`super_admin`)                │
│   - Global cross-tenant governance                          │
│   - Tenant provisioning, subscription plan management       │
│   - Platform audit log inspection                           │
│   - Emergency incident containment                          │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│ Tier 2: Institutional Executive (`school_admin`, `org_admin`)│
│   - Whole-school executive authority within verified tenant │
│   - Represents Principal / Headmaster executive level       │
│   - Staff role assignments, class & curriculum publishing   │
│   - Examination result final approval & publication         │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────┴──────────────────────────────┐
│ Tier 3: Service-Role Infrastructure Execution               │
│   - Database migrations and schema maintenance              │
│   - Asynchronous queue workers & scheduled cron triggers    │
│   - Server-authoritative RPCs (e.g. bind_invitation_to_user)│
└─────────────────────────────────────────────────────────────┘
```

### Institutional Executive Model & Authority Boundaries (BLOCKER 1, BLOCKER 2)
1. **`school_admin` Authority Definition:**
   `school_admin` represents institutional executive authority (Principal / Headmaster level). It is an administrative security role, not a human job-title taxonomy.
   Human titles such as "Principal", "Headmaster", "Bursar", and "Registrar" do NOT themselves grant security authority (`job_title` NEVER grants security authority).
   Bursars, registrars, and clerical staff do NOT automatically receive `school_admin`.
2. **Vice Principal & Exam Officer Distinction:**
   Vice Principals and Exam Officers have base role `teacher` with specialized functional assignments.
   Functional assignments are strictly additive and can NEVER remove permissions granted by a base role.
   Therefore, Vice Principals and Exam Officers CANNOT be assigned `school_admin` base role (which intrinsically includes `exams.results.approve` and `exams.results.publish`).
   Neither Vice Principals nor Exam Officers possess unilateral result publication or approval authority.


---

## 2. Platform Super Admin Model

### Scope & Invariants
1. **Platform Scope Requirement:**
   Routes and actions operating at platform scope must explicitly declare `scope: 'platform'` in `authorizeApiRequest()` or server-action guards.
2. **Explicit Targeting Invariant:**
   A `super_admin` accessing a specific tenant resource must provide explicit targeting (e.g. `tenant_id` parameter). Implicit or default tenant fallback is prohibited.
3. **No Blind Service Role Substitution:**
   `super_admin` operations must NOT blindly substitute `createAdminClient()`. Wherever an operation targets a tenant resource, tenant boundary validation applies.
4. **Authentic Database Provenance:**
   `super_admin` status is derived strictly from PostgreSQL state (`profiles.role = 'super_admin' AND profiles.is_active = true`).
   The following sources are **UNTRUSTED** and must NEVER be used for super admin authorization:
   - `auth.user_metadata.role`
   - Hardcoded email lists (`admin@example.com`)
   - `localStorage` or browser cookies
   - Unsigned client request headers

---

## 3. Service-Role Containment Protocol

`createAdminClient()` instantiates a Supabase client using `SUPABASE_SERVICE_ROLE_KEY`, which completely bypasses PostgreSQL Row Level Security.

### Mandatory Preconditions Before Any Service-Role Call
Every route handler or server action invoking `createAdminClient()` or direct PostgreSQL pool queries must establish:
1. **Authenticated Actor:** Validated via `supabase.auth.getUser()`.
2. **Authoritative Role & Membership:** Loaded from `public.profiles` (not user metadata).
3. **Active Status Verification:** Fail-closed if `is_active !== true`.
4. **Tenant Scope Verification:** Verified against `tenants.id` and `tenants.parent_id`.
5. **Separation of Duties:** Actor possesses the explicit permission for the specific action.
6. **Audit Event Logging:** Emitted to `public.audit_logs` or `public.academic_audit_logs`.

---

## 4. Impersonation & Support Access Controls

1. **No Silent Impersonation:** Administrative support personnel may not impersonate tenant users without:
   - Explicit tenant administrator support authorization ticket.
   - Immutable audit logging recording the actor, target user, timestamp, session ID, and justification.
2. **No Role Escalation via Impersonation:** An impersonated session cannot execute actions exceeding the target user's canonical permissions.

---

## 5. Audit Logging Requirements for RBAC Events

The following privileged events MUST emit an immutable record to `public.audit_logs`:
- Role assignment or role change (`rbac.role.assigned`, `rbac.role.revoked`).
- Functional assignment appointment (`rbac.assignment.appointed`, `rbac.assignment.revoked`).
- User account status change (`rbac.user.activated`, `rbac.user.deactivated`).
- Tenant creation, suspension, or modification (`tenant.provisioned`, `tenant.suspended`).
- Final examination result approval or publication (`exams.results.approved`, `exams.results.published`).
- Curriculum version publication (`curriculum.version.published`).
