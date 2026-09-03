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
1. `src/app/actions/academic-calendar.ts` contains top-level `createAdminClient()` usage.
2. `src/app/api/admin/exams/route.ts` contains top-level `createAdminClient()` usage and its handlers require dedicated review for authentication, tenant authorization, role/permission authorization, and resource scope.
3. `src/lib/supabase/admin.ts` requires `SUPABASE_SERVICE_ROLE_KEY` during privileged-client creation.
4. `.ai/02-ARCHITECTURE/ARCHITECTURE.md` and `.ai/04-SECURITY/PRIVILEGED-ACCESS.md` require application authorization and treat service-role access as a reviewed exception rather than a replacement for authorization.

#### Impact
- Module-level privileged client creation can encourage handlers to use elevated access without a visible request authorization boundary.
- Missing request-level authorization or tenant scoping can expose privileged examination data.
- Import-time environment requirements can create build/CI fragility where privileged credentials are intentionally unavailable.

#### Alternatives Considered
1. *Lazy module-level singleton:* Rejected because lazy initialization does not establish request authentication or authorization.
2. *Request-scoped privileged client after guards:* Retained as a possible implementation pattern, but only as one part of the security boundary.
3. *Centralized authorized privileged-client factory:* Recommended for evaluation if it can enforce or require explicit authenticated actor, tenant, permission, and resource context.

#### ChatGPT Review Correction
Moving `createAdminClient()` into a handler is **not itself an authorization control**. Any remediation must explicitly separate:

1. authentication/session verification;
2. tenant resolution and tenant authorization;
3. role/permission authorization;
4. resource-level scope checks where applicable;
5. privileged client creation/use only after the required authorization boundary.

The examination API authorization concern is a distinct security issue and should not be reduced to client-instantiation scope.

The `academic-calendar.ts` tenant-resolution fallback behavior must also be reviewed separately so a privileged operation can never silently select an unrelated/default tenant when the caller tenant cannot be established.

#### Decision Required
Create a dedicated authorized task for the application security remediation after the relevant code paths are fully audited. This recommendation does **not** authorize application changes under TASK-TEST-001.

#### Verification
Second ChatGPT supervisory review required before TASK-TEST-001 can be approved. Application remediation requires a separate authorized task and appropriate cross-tenant/role regression tests.
