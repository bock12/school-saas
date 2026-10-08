# Level 1 — Platform Foundation Implementation Plan

**Status:** DRAFT — supervisory planning artifact
**Roadmap:** ROADMAP-0001

## Objective

Make the SchoolSaaS platform foundation trustworthy and simple enough that every ERP domain can use the same security, tenancy, authorization, data-access and application conventions.

## Execution model

Implement controlled vertical slices. No broad rewrite is authorized.

DISCOVER → APPROVE → STABILIZE → IMPLEMENT → TEST → SECURITY REVIEW → VERIFY → CLOSE

## Epic L1-01 — Governance and architecture baseline

- Reconcile root/nested AI-EOS governance records and establish one canonical source.
- Confirm canonical application root and dependency baseline.
- Synchronize stack versions, permission count, module status, security posture and known technical debt.
- Resolve or explicitly record documentation conflicts.
- Create/approve the required architecture ADRs before material architecture changes.

## Epic L1-02 — Tenant and authorization foundation

- Initial tenant model: School = tenant.
- Explicit tenant membership and trusted server-side tenant context.
- Caller-supplied tenant identifiers never override trusted context.
- Canonical authorization: Actor → Membership → Role/Assignment → Permission → Scope → Resource → Operation → RLS.
- Reconcile the current 46-permission registry with stale documentation.
- Verify cross-tenant denial, missing-tenant fail-closed behavior and privileged-access containment.

## Epic L1-03 — Application platform conventions

Standard server pipeline:

Authentication → Tenant Resolution → Authorization → Validation → Domain Operation → Data Access → Audit/Error Handling

Standardize validation, 401/403/400/404/409/500 handling where applicable, safe error messages and the separation between middleware session refresh and API/Server Action authorization.

## Epic L1-04 — Database foundation

- Review duplicate migration numbering.
- Establish deterministic migration discipline.
- Review tenant ownership, foreign keys, uniqueness, status constraints and indexes together with RLS.
- Define separate security audit, business audit and operational/system logging categories.

## Epic L1-05 — Platform settings

Minimal school configuration: identity, timezone, locale, date format, currency and notification preferences.

Avoid speculative settings frameworks.

## Epic L1-06 — Known security/operational hardening

Prioritize existing findings:

- Public demo-request endpoint: validation, rate limiting/abuse controls, safe database access and error handling.
- CASS synthetic score/data-integrity issue: remove or isolate before authoritative production use.
- Deferred frontend authorization: presentation-layer enforcement only; backend remains authoritative.
- Minimum production observability: structured errors, security events, request correlation and privileged-operation visibility.

## Level 1 acceptance criteria

1. One canonical governance source is identified and reconciled.
2. Application root and dependency baseline are unambiguous.
3. School tenant model is explicit.
4. Authorization model is canonical and documented.
5. API and Server Action boundaries are protected.
6. RLS cross-tenant tests pass.
7. Privileged access is contained server-side.
8. Database migration/constraint/index discipline is documented.
9. Known high-risk public endpoint concerns have defined remediation.
10. Known synthetic/high-integrity data issue is resolved or explicitly isolated.
11. Documentation matches repository evidence.
12. Relevant typecheck, security tests, regression tests and production build pass before closure.

## Execution order

L1-01 → L1-02 → L1-03 → L1-04 → L1-05 → L1-06 → Level 1 Gate

## Explicitly deferred

Microservices, mobile, AI, biometric attendance, SaaS billing, multi-organization hierarchy, advanced analytics and speculative integrations are not Level 1 blockers unless a specific security requirement makes them so.

## Governance

This plan defines Level 1 scope. Individual implementation tasks still require task-level acceptance criteria, security analysis and supervisory authorization before coding.