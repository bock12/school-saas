# Architecture Baseline

## Observed shape

SchoolSaaS is a Next.js App Router system using Supabase Auth/PostgreSQL/RLS. `src/middleware.ts` refreshes sessions and maps tenant subdomains into `src/app/[tenant]`. Layouts/server code use `src/lib/auth/guards.ts`; RLS is the database tenant-isolation layer. `src/lib/supabase/admin.ts` is a server-only service-role client that intentionally bypasses RLS and therefore requires local trusted authorization at every call site.

The main surfaces are public platform routes, super-admin routes, tenant administrative/operational modules, and teacher/student/parent/applicant/exam-office portals. API routes are excluded from the middleware matcher, so each handler independently owns authentication, authorization, tenant scope, validation, and safe errors.

## Architectural invariants
1. Tenant identity is established only on a trusted server/data path.
2. Tenant operations enforce application authorization and applicable RLS; service-role access is a reviewed exception, not a replacement for authorization.
3. Privileged actions are server-only, validated, least-privilege, and auditable where material.
4. Business rules have one authoritative home; UI/route code does not create divergent rules.
5. Public endpoints disclose only intentionally public data and receive abuse review.
6. Schema, policies, authorization, indexes/constraints, and rollback planning are one design unit.

## Preferred boundaries
- Pages/layouts: compose guards, trusted reads, rendering and user states.
- Server actions/API handlers: validated command boundary with explicit auth and tenant scope.
- `src/lib/auth`: reusable trusted authorization/tenant resolution.
- `src/lib/supabase`: client/session construction; admin client remains server-only.
- `src/lib/db`: scoped database helpers; no unreviewed RLS/tenant bypass.
- `src/features`: cohesive feature-local code; `src/components`: reusable presentation.
- `supabase/migrations`: append-only history, planned/reviewed before execution.

## Decision protocol
Create an ADR before implementation for material boundary, schema/RLS, authorization, dependency, integration, persistence, shared abstraction or compatibility decisions. **ChatGPT** prepares architectural options and consequences; the human accepts/rejects. Include context, evidence, alternatives, decision, security/data impact, rollout/rollback, authority, and linked tasks/risks.

## Observed constraints
- Audit/page inventory: 108 of 170 pages contain mock, placeholder, demo, or coming-soon signals.
- Migration inventory: 45 files with duplicate numeric prefixes, including 018, 022, and 024; ordering must be explicitly verified before future workflow changes.
- Audit records a prior `ENOSPC` production-build failure; build evidence must state environment constraints.
