# Enterprise Readiness Audit

Date: 2026-08-31

## Current Shape

This is a Next.js 16 App Router school SaaS using Supabase for auth, PostgreSQL data, and row-level security. The project is already organized around the core operating surfaces of a multi-tenant school platform:

- Public platform: landing, login, registration, onboarding, tenant discovery.
- Platform administration: super-admin tenant directory, hierarchy, plans, modules, audit logs, provisioning.
- Tenant portals: school/org admin, teacher, student, parent, and exam-office shells.
- School operations: students, staff, parents, admissions, academics, exams, attendance, finance, bursary, communication, transport, hostel, library, inventory, analytics.
- Database foundation: 45 SQL migrations with tenant tables, hierarchy support, quotas, applicant workflow, chat, exams, calendar, staff attendance, curriculum, and demo requests.

## Main Flow

1. `src/middleware.ts` handles subdomain routing and rewrites tenant subdomains into `src/app/[tenant]`.
2. `src/lib/supabase/middleware.ts` refreshes Supabase cookie sessions before protected routes load.
3. Tenant layouts call guards from `src/lib/auth/guards.ts` to resolve the current profile, tenant, and role.
4. Server pages, server actions, and route handlers fetch tenant-scoped data from Supabase or direct PostgreSQL helpers.
5. Supabase RLS policies provide the database-level isolation layer using profile tenant membership and role helper functions.

## Strengths

- The application already models a real multi-tenant product instead of a single-school portal.
- Tenant isolation exists in both application routing and database RLS.
- The role model covers super admin, organization admin, school admin, teacher, student, parent, and exam officer.
- There is a serious feature map for school operations, especially admissions, examinations, communication, academics, and staff attendance.
- Supabase migrations include many tenant indexes and unique constraints, which is a good foundation for scale.
- The subdomain-based tenant UX is appropriate for an enterprise SaaS school system.

## Weaknesses

- Many pages are still prototype surfaces: 106 of 168 `page.tsx` files contain mock, placeholder, or coming-soon signals.
- Only a small number of pages import guards directly; protection depends heavily on layouts and must be audited per route group.
- Several privileged operations use `createAdminClient()`. These should be reviewed one by one because service-role usage bypasses RLS.
- The landing page is very large and currently carries existing lint debt, including unused imports, `any` casts, unescaped text, and React hook lint errors.
- The previous recorded production build failed with `ENOSPC`, so the build environment needs cleanup or larger storage before reliable release checks.
- There are operational scripts in multiple root/scratch locations, which makes migration and maintenance workflows harder to trust.
- There is no visible automated test suite for tenant isolation, role authorization, onboarding, or critical school workflows.

## Fixes Applied

- Fixed public demo request submission in `src/app/(platform)/page.tsx` to post to `/api/public/demo-requests`.
- Normalized the homepage demo request payload to the API contract.
- Made `src/app/api/public/demo-requests/route.ts` accept both current and legacy field names.
- Replaced `catch (err: any)` in the demo request API with typed `unknown` error handling.
- Tightened `eslint.config.mjs` so lint ignores `scratch/**`, `directmessage/**`, and `build-output.txt`.
- Fixed the tenant admin layout guard in `src/app/[tenant]/admin/layout.tsx` from `requireTeacher()` to `requireSchoolAdmin()`, closing teacher access to admin routes.
- Hardened `src/lib/supabase/admin.ts` so privileged Supabase calls are server-only and fail fast when `SUPABASE_SERVICE_ROLE_KEY` is missing, a placeholder, or equal to the public anon key.
- Replaced direct service-role-or-anon fallback clients in admissions, CASS export, admin exams, and exam-office dashboard API routes with the shared hardened admin client.
- Locked down `src/app/api/test-db/route.ts` so the diagnostic endpoint is unavailable in production and requires an authenticated super admin in development.
- Added `.env.example` documenting the required Supabase, app domain, and database variables.

## Priority Roadmap

### Phase 1: Security And Tenant Boundaries

- Inventory every service-role call and require a local authorization check before privileged data access.
- Replace remaining direct service-key usage in tenant application pages with the shared hardened helper or a properly scoped server client.
- Add route-level tests for super admin, org admin, school admin, teacher, student, parent, and exam officer access.
- Add RLS tests that prove users cannot read or mutate another tenant's records.
- Confirm public API routes expose only intended public fields.

### Phase 2: Real Data Binding

- Convert the highest-value admin modules from mock arrays to Supabase-backed server data.
- Start with students, staff, parents, classes, subjects, attendance, admissions, billing, and audit logs.
- Replace demo UI actions with server actions or route handlers that validate tenant membership and role permissions.
- Add empty states and creation flows so real tenant databases can start from zero data.

### Phase 3: Operational Hardening

- Clean up root-level migration runners and move them into one documented `scripts/` workflow.
- Add CI checks for lint, TypeScript, migrations, and production build.
- Resolve the disk-space issue that caused the previous `next build` failure.
- Add structured audit logging for privileged changes, user invites, approvals, billing changes, and student record edits.

### Phase 4: Enterprise Features

- Add tenant-level feature flags and plan enforcement around modules, storage, users, and student limits.
- Add backup/export workflows for school-owned data.
- Add notification delivery status, retry handling, and provider configuration for email/SMS/push.
- Add observability for API errors, slow queries, auth failures, and cross-tenant access denials.
- Add data retention and privacy controls for student, parent, staff, health, and disciplinary records.

## Verification

- `npx eslint "src/app/api/public/demo-requests/route.ts" "src/app/[tenant]/admin/layout.tsx" eslint.config.mjs` passed.
- `npx tsc --noEmit --pretty false` passed.
- Full `npm run lint` previously timed out; targeted lint revealed pre-existing homepage lint debt outside the narrow route fix.
- Full production build was not rerun because the existing `build-output.txt` shows the last build failed from `ENOSPC: no space left on device`.
