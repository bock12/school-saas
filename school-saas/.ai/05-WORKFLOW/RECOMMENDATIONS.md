# Engineering Recommendations

This is the canonical index for substantive recommendations raised by Gemini/Antigravity or other authorized contributors.

## Recommendation contract
Each recommendation uses `REC-####` and records:
- related task
- author
- category
- severity
- problem
- repository evidence
- impact
- alternatives considered
- recommendation
- risk if ignored
- decision required
- status
- ChatGPT disposition
- human decision when required

## Statuses
`PROPOSED`, `UNDER_REVIEW`, `ACCEPTED`, `ACCEPTED_WITH_CHANGES`, `REJECTED`, `DEFERRED`, `ESCALATED_TO_HUMAN`, `IMPLEMENTED`.

Recommendations do not authorize implementation. An accepted recommendation that changes approved scope must be converted into an authorized task or amendment.

## Current recommendations

### REC-0001 — Establish a request-scoped authorized privileged-access pattern

- **Task:** TASK-0004 / TASK-0003
- **Author:** Gemini / Antigravity (Implementation Engineer)
- **Category:** Security & Architectural Hardening / Reliability
- **Severity:** High
- **Status:** ACCEPTED_WITH_CHANGES
- **ChatGPT Disposition:** ACCEPTED_WITH_CHANGES

#### Problem
`createAdminClient()` is instantiated at top-level module scope in server action and API route files, and privileged database access may occur without a clearly enforced request-level authorization boundary.

#### Repository Evidence
1. `src/app/actions/academic-calendar.ts` line 8 contains top-level module instantiation of `createAdminClient()`. Additionally, lines 66–73, 118–119, and 125–133 in `resolveTenantId()` fall back to `SELECT id FROM tenants LIMIT 1` (arbitrary first tenant), directly violating `.ai/AGENTS.md` ("Tenant resolution must fail closed; never select an arbitrary fallback tenant") and risk `R-004`.
2. `src/app/api/admin/exams/route.ts` line 4 instantiates `createAdminClient()` at module level, and lines 7–25 expose a `GET` handler that queries `exam_sessions`, `exam_results_approval`, and `exam_malpractices` across all tenants without request authentication, session verification, role checks, or tenant scoping (violating risk `R-002`).
3. `src/lib/supabase/admin.ts` requires `SUPABASE_SERVICE_ROLE_KEY` during privileged-client creation.
4. `.ai/02-ARCHITECTURE/ARCHITECTURE.md` and `.ai/04-SECURITY/PRIVILEGED-ACCESS.md` require application authorization and treat service-role access as a reviewed exception rather than a replacement for authorization.

#### Impact
- Module-level privileged client creation encourages handlers to use elevated access without a visible request authorization boundary.
- Missing request-level authorization or tenant scoping in `src/app/api/admin/exams/route.ts` exposes confidential examination records across tenants.
- Arbitrary fallback to `LIMIT 1` tenant in `resolveTenantId()` risks cross-tenant data leakage and mutation whenever a caller provides an invalid or missing tenant slug.
- Import-time environment requirements create build/CI fragility where privileged credentials are intentionally unavailable.

#### Alternatives Considered
1. *Lazy module-level singleton:* Rejected because lazy initialization does not establish request authentication or authorization.
2. *Request-scoped privileged client after guards:* Retained as a possible implementation pattern, but only as one component of a multi-layered security boundary.
3. *Centralized authorized privileged-client factory:* Recommended for evaluation if it can enforce or require explicit authenticated actor, tenant, permission, and resource context.

#### ChatGPT Review Correction
Moving `createAdminClient()` into a handler is **not itself an authorization control**. Any remediation must explicitly separate:

1. **Authentication / session verification** (verifying the caller identity via Supabase auth);
2. **Tenant resolution and tenant authorization** (fail-closed resolution without arbitrary tenant fallback);
3. **Role / permission authorization** (validating role membership against operation matrix);
4. **Resource-level scope checks** (ensuring the target object belongs to the verified tenant/actor);
5. **Privileged client creation/use** (instantiated strictly after the authorization gate passes).

The examination API authorization concern is a distinct security issue (`R-002`) and should not be reduced to client-instantiation scope.

The `academic-calendar.ts` tenant-resolution fallback behavior must also be reviewed separately so a privileged operation can never silently select an unrelated/default tenant when the caller tenant cannot be established (`R-004`).

#### Decision Required
Create a dedicated authorized task for the application security remediation after the relevant code paths are fully audited. This recommendation does **not** authorize application changes under TASK-TEST-001.

#### Verification
Second ChatGPT supervisory review required before TASK-TEST-001 can be approved. Application remediation requires a separate authorized task and appropriate cross-tenant/role regression tests.
