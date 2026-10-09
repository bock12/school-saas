# Security Audit Register

## Scope

**Baseline date:** 2026-09-01

**Method:** Read-only documentation and architecture review.

**Not performed:** Runtime penetration testing, production access, credential inspection, RLS execution testing, dependency scan, or migration execution.

This operationalizes the 2026-08-31 enterprise-readiness audit. Findings require verification; they are not claims of confirmed exploitation.

## Findings

### SEC-001 - Privileged Supabase use requires call-site verification

**Severity:** High | **Status:** Open

`src/lib/supabase/admin.ts` is server-only and fails fast for invalid service keys, but the service role bypasses RLS. Inventory every call for trusted actor authorization, tenant/object scope, validation, and RLS-bypass justification through TASK-0001.

### SEC-002 - Tenant/role test coverage is not evidenced

**Severity:** High | **Status:** Open

The audit reports no visible automated suite for tenant isolation, roles, onboarding, or critical workflows. Prove denied cross-tenant and disallowed-role operations with distinct tenant principals.

### SEC-003 - API handler controls require inventory

**Severity:** Medium | **Status:** Open

API routes are excluded by `src/middleware.ts`; each handler must establish auth, authorization, tenant scope, validation, output exposure, and abuse controls. Inventory via TASK-0001.

### SEC-004 - Sensitive-data operational controls are incomplete

**Severity:** Medium | **Status:** Open

Audit identifies retention/privacy, export/backup, delivery reliability, and observability as future work. Design approved controls before enterprise-readiness claims.

## Positive controls observed

- Layered tenant routing, guard functions, and Supabase RLS foundation.
- Server-only admin client rejects missing/placeholder/anon-equivalent keys.
- Audit records hardening of selected privileged routes and a development-only diagnostic endpoint.

Append sanitized evidence only: no secrets, personal data, or exploit instructions.

---

## TASK-0001 - Security Boundary Inventory and Verification

**Investigation date:** 2026-09-01

**Status:** Complete - static/read-only review; runtime verification remains required.

**Scope:** `src/app/api`, `src/app/actions`, tenant/auth flows, privileged Supabase and PostgreSQL access, relevant migrations, and tracked operational scripts.

**Evidence standard:** `CONFIRMED` means the stated control or absence is directly observable in repository source. `POTENTIAL` means the security impact depends on runtime configuration, caller reachability, or database grants that were not exercised. `NOT VERIFIED` means static review cannot establish the property.

### Executive summary

- `CONFIRMED`: eleven tracked migration-runner scripts embed a database connection credential. This is a credential-exposure incident, not merely a hygiene issue.
- `CONFIRMED`: unauthenticated routes use service-role clients or direct PostgreSQL for sensitive admissions, exam, CASS-export, and super-admin lead operations.
- `CONFIRMED`: several `use server` action modules mutate data using direct PostgreSQL/service-role access with no operation-boundary authentication, role, or tenant-authorization check.
- `CONFIRMED`: `academic-sessions.ts` and `academic-calendar.ts` contain `SELECT id FROM tenants LIMIT 1` fallbacks; the resulting arbitrary tenant can be read or mutated by unguarded actions.
- `CONFIRMED`: exam RLS policies use `FOR ALL USING (true)` and do not scope tenant or role. Notification tables enable RLS without defining policies in the migration; service-role routes bypass it.
- `POTENTIAL`: callback and communications code trusts `user_metadata.tenant_id`/`role` or a caller-supplied tenant slug without consistently resolving authorization from the trusted `profiles` record.

### Service-role and privileged-access inventory

All `createAdminClient()` uses bypass RLS. Direct PostgreSQL access does not establish the Supabase request identity and its effective database role/RLS behavior was **NOT VERIFIED**; every such caller therefore needs explicit application authorization.

| Location | Purpose / privileged operation | Auth and tenant check before operation | Classification |
|---|---|---|---|
| `src/lib/supabase/admin.ts` | Constructs server-only service-role client; rejects missing/placeholder/anon-equivalent key. | Helper has no actor context; caller controls authorization. | Control present; RLS bypass by design. |
| `src/app/(super-admin)/super-admin/tenants/directory/actions.ts` | Reads tenant profiles and generates admin magic links. | `getImpersonationLink` checks session and `super_admin`; target is selected by tenant ID. | Low, boundary check present. |
| `src/app/[tenant]/layout.tsx`, `login/page.tsx`, `set-password/page.tsx` | Tenant display/resolution fallbacks. | Layout protection may apply; page-level direct admin reads are not independently role-scoped. | Potential; read-only usage must be rechecked in route context. |
| `src/app/[tenant]/login/actions.ts`, `login/provision-auth.ts` | Login/provisioning; can create/update `auth.users`, profiles, students, and parents through admin/direct PG fallbacks. | Login flow verifies a profile/tenant after sign-in; helper itself has no independent guard. | High potential; privileged helper must be caller-restricted. |
| `src/app/[tenant]/admin/communication/internal/_components/actions.ts` | Updates chat channel/member records after user actions. | User authenticated; direct-message/group creation accepts tenant/member identifiers and service-role inserts do not independently verify target membership/tenant. | High potential cross-tenant membership issue. |
| `src/app/actions/academic-calendar.ts`, `academic-sessions.ts`, `subjects.ts` | Reads/mutates academic records through service role/direct PG. | No auth/role/tenant membership check in action boundary. | High confirmed missing boundary. |
| `src/app/actions/tenant.ts` | Creates/invites/deletes auth users; reassigns profiles; creates schools/staff; updates tenant/org settings. | No auth/role/tenant authorization in any exported operation. | Critical confirmed missing boundary. |
| `src/app/actions/users.ts` | Changes account status/roles/passwords and deletes users. | `getActorProfile`, `canManageTarget`, and role/tenant hierarchy checks run before admin operations. | Positive control; validate with tests. |
| API routes listed below | Service-role use for exams, admissions, CASS, communications, notifications, and test DB. | Varies by route; critical gaps are enumerated below. | See API inventory. |
| `src/lib/communication/audience-resolver.ts`, `audit.ts`, `event-engine.ts` | Resolves recipient PII and writes notifications/deliveries/events. | Library functions have no actor checks and rely entirely on caller-supplied tenant/actor. | Boundary delegated; callers require review. |
| `src/app/api/auth/callback/route.ts` | Creates a direct service-role client to upsert profiles from invite metadata. | Session code is exchanged first, but metadata role/tenant values are trusted without re-reading a trusted invitation/profile source. | High potential privilege escalation. |
| `src/lib/db/pg-fallback.ts` | Opens `DATABASE_URL` pool and directly inserts/updates `auth.users` and profiles. | No actor or tenant authorization; caller supplied values are written. | Critical privileged primitive; caller restrictions absent. |
| `src/scripts/*`, root `run_migration_*.js`, `scratch/run_migration_018.js` | CLI diagnostics, user-admin work, seeds, and migration execution. | Human/CLI execution only; no in-app session boundary. | Critical credential exposure; operational governance required. |

### Direct PostgreSQL and `auth.users` analysis

`pg-fallback.ts` is called by academic actions, curriculum/offerings/subjects/landing CMS actions, tenant actions, tenant/login code, and several public/super-admin API routes. It directly writes `auth.users` (password hashes and metadata) and `profiles`; it does not authenticate or authorize callers. `public/register-tenant` and tenant login provisioning also directly manipulate `auth.users` through locally created pools.

Eleven **tracked** files contain hard-coded PostgreSQL connection strings: root `run_migration_022.js`, `029.js` through `036.js`, `043.js`, and `scratch/run_migration_018.js`. The secret value is intentionally not reproduced here. This is `SEC-005`, confirmed Critical.

### API authorization inventory

| Route / methods | Authentication and role | Tenant source / authorization | Access method and RLS | Cross-tenant or data risk |
|---|---|---|---|---|
| `academics/ai/lesson-plan` POST | Session required; no role check. | `offering_id` drives direct PG lookup; no ownership check against caller profile tenant. | Direct PG; RLS not relied on. | High potential: authenticated user may request another tenant's curriculum/lesson context. |
| `admin/exams` GET, PATCH | None. | None; no tenant filter. | Service role; RLS bypassed. | Critical confirmed: public read and mutation of all exam sessions/approvals/malpractices. |
| `admissions` GET, POST, PATCH, DELETE | None. | GET/POST accepts `tenantSlug`; PATCH/DELETE use record ID only. No actor check. | Service role; RLS bypassed. | Critical confirmed: applicant/guardian PII read, created, changed, or deleted. |
| `auth/callback` GET | Auth exchange code required. | Parses `next`; tenant check handles direct/profile and org-parent relationships except `set-password` special route. | User client plus direct service-role profile upsert. | High potential: user metadata is trusted for role/tenant profile upsert. |
| `cass-export` GET, POST | None. | Optional caller `tenantSlug`; no authorization. | Service role; RLS bypassed. | Critical confirmed: export of applicant identity/results and batch creation. |
| `exam-office/communication-rules` GET, POST | Session only; no role check. | `user_metadata.tenant_id`; no trusted profile membership resolution. | Service role; RLS bypassed. | High confirmed role-boundary gap; cross-tenant impact potential if metadata is absent/tampered. |
| `exam-office/communication-templates` GET, POST | Session only; no role check. | Same metadata pattern. | Service role; RLS bypassed. | High confirmed role-boundary gap. |
| `exam-office/communications` GET, POST | Session only; no role check. | Metadata tenant or caller `tenantSlug`/header fallback; no membership check for fallback. | Service role; RLS bypassed. | Critical potential: an authenticated actor without tenant metadata could read/send another tenant's communications. |
| `exam-office/dashboard` GET, POST, PATCH, DELETE | None. | None; no tenant filter. | Service role; RLS bypassed. | Critical confirmed: public exam/student analytics read and exam-session mutation/deletion. |
| `notifications` GET, POST | Session required. | Bound to `user.id`; supplied recipient ID is additionally filtered by `user_id`. | Service role; RLS bypassed, predicates are explicit. | No confirmed cross-tenant issue in this route; test ownership predicates. |
| `public/check-slug` GET | Intentionally public. | Public slug only. | Direct PG. | Low: expected tenant-name/slug enumeration; no rate limit observed. |
| `public/demo-requests` POST | Intentionally public. | No tenant context. | Anon REST fallback then direct PG. | Medium: collects/returns lead PII; no rate limiting/anti-abuse control observed. |
| `public/landing-sections` GET | Intentionally public. | N/A. | Calls CMS actions using direct PG. | Low potential: public CMS/configuration exposure needs data-minimization review. |
| `public/register-tenant` POST | Intentionally public self-service provisioner. | Creates new tenant IDs from request. | Direct PG, direct `auth.users` insert; RLS not used. | High: public account/tenant provisioning with no rate/abuse control and only basic validation. |
| `public/tenants` GET | Intentionally public. | Returns all non-suspended tenants. | Direct PG / anon REST fallback. | Medium: exposes tenant contact/address data; verify product disclosure intent. |
| `super-admin/leads` GET, PATCH, DELETE | None. | None. | Direct PG; RLS not used. | Critical confirmed: public lead PII retrieval, modification, and deletion. |
| `test-db` GET | Development only; authenticated `super_admin` required. | Query lookup only; returned records are diagnostic. | Service role after checks. | Positive control; add regression test. |

### Server-action inventory (`src/app/actions`)

| Action module | Authentication / role / tenant authorization | Database access and mutation behavior | Finding |
|---|---|---|---|
| `academic-calendar.ts` | None. `tenantSlug`/UUID is resolved without actor validation. | Direct PG/service role; calendar read/create/update/delete. | High confirmed missing boundary; includes arbitrary-tenant fallback. |
| `academic-sessions.ts` | None. | Direct PG/service role; academic years/terms CRUD and current flags. | High confirmed missing boundary; `LIMIT 1` fallback and partial-name matching. |
| `approvals.ts` | Some functions obtain user but do not require it or check role; Supabase RLS is relied on. | User-scoped Supabase client; approval CRUD. | Medium: `getApprovalRequests` accepts tenant arrays, and create/resolve/delete lack operation-level role check. |
| `curriculum.ts` | Resolves user ID for audit fields but does not authorize role/tenant before direct PG work. | Direct PG; curriculum/version/topic/outcome/progress CRUD and approval/publication state. | High confirmed missing boundary. |
| `landing-cms.ts` | None. | Direct PG; can create tables and mutate/delete public CMS pages/plugins/media/settings. | High confirmed missing boundary. |
| `offerings.ts` | Resolves user ID but does not authorize it for tenant/action. | Direct PG; subject offering/allocation/qualification CRUD. | High confirmed missing boundary. |
| `subjects.ts` | None. | Direct PG/service-role fallback; subject/archive/stream CRUD and bulk imports. | High confirmed missing boundary. |
| `tenant.ts` | None. | Service role/direct `auth.users`; tenant deletion, school/staff creation, profile reassignment, settings updates. | Critical confirmed missing boundary. |
| `users.ts` | Session/profile required; hierarchy and allowed-role checks precede mutations. | Service role for profile/auth administration. | Positive control; test all hierarchy cases and password policy. |

### Tenant-resolution analysis

- `src/middleware.ts` derives a subdomain and rewrites tenant paths. It forces login for protected tenant paths, but APIs are excluded; APIs must protect themselves.
- `requireTenantRole` resolves the profile and target tenant through the user client and permits direct membership, super admin, or org admin of a parent tenant. This is a positive control for layouts/pages that call it; it is not invoked by the flagged action/API operation boundaries.
- `academic-sessions.resolveTenantId` returns a UUID argument directly, performs partial slug/name matching, and returns the first tenant if input is absent. `academic-calendar.resolveTenantId` has the same first-tenant fallback and even falls back after a non-match. Both are callable from actions with no auth check.
- The exact `SELECT id FROM tenants LIMIT 1` pattern occurs only in `src/app/actions/academic-sessions.ts:70` and `src/app/actions/academic-calendar.ts:118`. It exists as a fallback for absent/unmatched tenant input; an unordered tenant is selected. `CONFIRMED`: source behavior. `POTENTIAL`: external exploitability depends on each server action's caller reachability, which requires runtime validation, but no action-boundary guard is present.
- `curriculum.ts` and `offerings.ts` accept UUID tenant input directly and resolve slugs through direct PG without membership checks. `tenant.ts` settings and staff actions accept client-provided tenant IDs/slugs without authorization.

### RLS policy inventory

| Data area | RLS and policy basis | Operation coverage | Gap / status |
|---|---|---|---|
| `tenants`, `profiles` | RLS enabled. Uses `get_user_tenant_id`, `is_super_admin`, `is_school_admin`, and later `is_org_admin` security-definer helpers. | Tenant/profile select; own profile update; super-admin all; admin profile policies. | Foundation present. Direct PG/service role bypasses. Runtime policy/grant behavior not verified. |
| `students`, `teachers`, `classes`, `class_enrollments` | RLS enabled; tenant select for authenticated users, super-admin all, school-admin policies; students/enrollments also permit teachers. | SELECT plus `FOR ALL` management policies. | Tenant/role functions are clear; RLS bypassed by privileged paths. |
| `attendance`, `grades` | RLS enabled; tenant select, teacher/school-admin management, super-admin all. | SELECT and `FOR ALL`. | Test teacher scope and cross-tenant denial. |
| `fee_types`, `fee_invoices`, `fee_payments` | RLS enabled; tenant select, school-admin management, super-admin all. | SELECT and `FOR ALL`. | Test finance role restrictions and service-role callers. |
| `applicants`, admission history | RLS enabled; direct tenant or org-admin child-school predicate. | Applicants have SELECT/INSERT/UPDATE/DELETE; history has SELECT/INSERT in migration. | Policies do not distinguish operational roles; unauthenticated service-role API bypass is critical. |
| examination core/analytics | RLS enabled in migrations 030/031/035, but every listed policy is `FOR ALL USING (true)`, without tenant or role condition. | ALL operations. | High confirmed policy gap. Anonymous exploitability is **NOT VERIFIED** because table grants were not executed, but the RLS predicate is non-protective. |
| notifications/communications | Notification tables enable RLS in migration 029; no notification-table policy declarations were found in migration inventory. Chat tables have membership-based policies. | Notification policy coverage not present in migration 029; chat select/insert/update policies exist. | Notifications depend on service role routes; normal-user policy behavior and any later policy source are not verified. |
| staff records | Profiles are RLS controlled; `staff_attendance` has RLS but allows all tenant users `FOR ALL`. | Staff attendance SELECT/INSERT/UPDATE/DELETE through broad tenant policy. | Medium confirmed excessive write scope; dedicated staff/health record policy coverage not verified. |

### Authentication and RBAC trace

Session refresh occurs in middleware, followed by tenant layout/guard checks for routed UI. `requireTenantRole` recognizes `super_admin`, `org_admin`, `school_admin`, `exam_officer`, `teacher`, `student`, and `parent`, including organization-parent access. At the database layer, RLS helper functions read `profiles` using security-definer functions to avoid recursion.

This chain is not consistent at all operation boundaries: APIs are middleware-excluded, many APIs do not authenticate, and the flagged server actions use privileged DB access without calling the guard or an equivalent operation-boundary authorization helper. `users.ts` demonstrates the required pattern; its hierarchy logic is not reused by `tenant.ts`.

### Sensitive educational-data exposure

Applicants contain identity, date of birth, contact, guardian, prior-school, national-exam, and stream data. The admissions and CASS routes expose or mutate this data without request authentication. Exam dashboard routes return student names, marks, attendance, GPA/rank, malpractice, appeals, and approval records without authentication. Lead routes expose prospective institution/contact data without authentication. Direct PostgreSQL provisioning and login helpers can alter passwords and profiles. Health/clinic records appear as a product module, but their schema/policy coverage was **NOT VERIFIED** in the reviewed migration inventory.

### Security test-gap matrix (do not install a framework in this task)

| Test area | Minimum cases | Expected evidence |
|---|---|---|
| Tenant isolation | Two tenants; every tenant-scoped read/write rejects the other tenant. | API/action response plus database row count. |
| Role authorization | Super admin, org admin (own/child/other org), school admin, exam officer, teacher, student, parent. | Allowed/denied matrix per operation. |
| Unauthenticated APIs | Each non-public API method returns 401/403 before DB access. | Route tests with no session. |
| Public APIs | Slug/demo/registration allow only intended fields and enforce abuse controls. | Schema, rate-limit, and response-minimization tests. |
| Server actions | Direct action invocation rejects unauthenticated, wrong-role, wrong-tenant, malformed tenant ID, and target-object ID. | Tests at action boundary, not merely page rendering. |
| RLS | Distinct authenticated principals use normal Supabase clients for SELECT/INSERT/UPDATE/DELETE. | Cross-tenant and role denials; no service-role client used as proof. |
| Service-role boundaries | Privileged route/action verifies actor and object tenant before client creation/use. | Spy/contract tests and denied-request proof. |
| Student/parent/exam data | Applicant, parent, grades, attendance, exam details/exports, staff data. | Data-minimization and forbidden-object tests. |
| Auth callback/invite | Tampered/absent metadata, cross-tenant redirect, expired code, org-child access. | Profile/role cannot be escalated. |

### Critical and high finding matrix

| ID | Status / severity | Location | Vulnerability and evidence | Attack scenario / impact | Recommended remediation and test |
|---|---|---|---|---|---|
| SEC-005 | CONFIRMED / Critical | Eleven tracked root/scratch migration scripts | Hard-coded database connection credentials are directly present in tracked source. | Anyone with repository/history access can connect as the embedded database principal; potential full data/auth/schema compromise. | Human-led incident response: revoke/rotate, assess access, remove from history/worktree by approved procedure, move execution to secret-managed workflow. Test secret scanning/CI block. |
| SEC-006 | CONFIRMED / Critical | `api/admissions`, `api/cass-export` | No authentication/role check; service role resolves caller slug/ID and reads or mutates applicants/CASS data. | Unauthenticated caller can access or alter sensitive applicant/guardian/exam data. | Separate public application intake from admin CRUD/export; require trusted actor, role, tenant/object scope. Test every method unauthenticated and cross-tenant. |
| SEC-007 | CONFIRMED / Critical | `api/admin/exams`, `api/exam-office/dashboard` | No auth, no tenant filter, service-role client; supports read and mutation/deletion. | Public access to exam/student analytics and system-wide exam mutation. | Require exam-office/admin roles and tenant filter; move to normal client where possible. Test unauthenticated, wrong role, and second tenant. |
| SEC-008 | CONFIRMED / Critical | `api/super-admin/leads` | GET/PATCH/DELETE have no session or super-admin check and use direct PG. | Public lead PII exposure, alteration, and deletion. | Require trusted super-admin guard before any DB action; test all methods with no/incorrect session. |
| SEC-009 | CONFIRMED / Critical | `app/actions/tenant.ts`, `lib/db/pg-fallback.ts` | Exported server actions accept tenant/profile/role/password inputs and perform admin auth/direct `auth.users` operations without actor authorization. | If an action is reachable, caller can create/reassign/delete users/tenants or weaken tenant isolation. | Add a single trusted authorization layer to every exported privileged action; restrict fallback usage. Test direct action calls for unauthenticated and cross-tenant principals. |
| SEC-010 | CONFIRMED / High | `app/actions/academic-calendar.ts`, `academic-sessions.ts`, `curriculum.ts`, `offerings.ts`, `subjects.ts`, `landing-cms.ts` | Direct PG/service-role mutations lack operation-boundary actor/role/tenant checks. | A reachable action can read/mutate records outside the caller's authority. | Require actor + allowed role + object tenant before DB client/query; eliminate unrestricted privileged fallbacks. Test action boundaries directly. |
| SEC-011 | CONFIRMED / High | `academic-sessions.ts:70`, `academic-calendar.ts:118` | Exact `SELECT id FROM tenants LIMIT 1` fallback and loose resolver matching. | Missing/malformed tenant input can select an arbitrary tenant; combined with unguarded mutations causes cross-tenant impact. | Fail closed on missing/unmatched input; accept canonical slug only; authorize resolved tenant. Test absent/invalid/partial/foreign UUID inputs. |
| SEC-012 | CONFIRMED policy gap / High | migrations 030, 031, 035 | Exam policies are `FOR ALL USING (true)`. | RLS itself does not restrict exam data by tenant/role; exploitability through a normal external role depends on grants not verified here. | Replace with tenant/role predicates through approved migration; verify with normal-client RLS tests. |
| SEC-013 | POTENTIAL / High | `api/auth/callback`, exam communications routes | Code trusts mutable-looking user metadata or caller tenant slug without consistent trusted profile/role lookup. | Metadata tampering or missing metadata may cause profile role/tenant overwrite or another tenant's notification access/send. | Resolve actor/tenant/role from trusted server profile and verify membership before service role. Test metadata tampering and metadata-absent caller. |
| SEC-014 | CONFIRMED role gap / High | communication rule/template routes | Any authenticated session can create tenant-scoped notification rules/templates; no exam-office/admin role check. | Low-privilege user can configure broad communications. | Require explicit permitted role and tenant profile resolution; test teacher/student/parent denial. |

### Recommended remediation sequence

1. **Emergency human-owned incident task:** rotate/revoke exposed database credential(s), assess repository/history exposure, and block future secret commits.
2. **Public API containment:** secure `admin/exams`, `exam-office/dashboard`, `admissions` administrative methods, `cass-export`, and `super-admin/leads` before new feature work.
3. **Privileged server-action gate:** protect `tenant.ts`, `pg-fallback.ts` callers, academic/CMS actions, and enforce object tenant checks at the action boundary.
4. **Tenant resolver hardening:** remove first-tenant/partial-match fallbacks and reject foreign UUID/slugs without authorization.
5. **RLS remediation:** replace exam `USING (true)` policies; define/verify notification policies; review broad staff-attendance write policy.
6. **Auth/communications hardening:** stop trusting user metadata for authority; require profile-derived role and tenant checks for notification routes and callback profile sync.
7. **Automated verification:** implement the test matrix in a safe non-production environment; then close findings only with recorded proof.
