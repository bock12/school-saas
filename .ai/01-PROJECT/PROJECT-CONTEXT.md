# SchoolSaaS Project Context

## Product
Multi-tenant school-management platform serving public visitors, super administrators, school/organization administrators, teachers, students, parents, applicants and exam-office users.

## Verified stack
- Next.js 16.4.0 App Router
- React 19.2.4
- strict TypeScript (`tsconfig.json` `strict: true`)
- Tailwind CSS 4
- Supabase Auth/PostgreSQL/Storage/RLS
- Supabase SSR clients
- `pg` helpers under `src/lib/db` (strict TLS configured)
- npm/package-lock (`package-lock.json` committed)
- Canonical Permission Registry: 46 atomic permissions (`permissions-registry.ts`)
- Database Migrations: 51 SQL files (`supabase/migrations/`)
- Automated Test Suite: 13 test files, 261 test cases (`tests/`) running via native Node test runner

## Domains
Tenant/platform administration, admissions, students, parents, staff/HR, academics/curriculum, examinations, attendance, finance/billing/bursary, communications, transport, hostel, library, inventory, analytics, branding and portals.

## Delivery posture
The enterprise audit reports a sound multi-tenant foundation but substantial prototype/UI-only coverage. Route/navigation presence is not proof of data binding, authorization coverage or production readiness. Tenant-security evidence takes priority over feature breadth.

## Source conflicts
`docs/enterprise-readiness-audit.md` is the audit evidence baseline. The root README remains create-next-app documentation. Prior planning documents may describe a database as empty while migrations establish schema; actual production occupancy is unverified.

The old Codex Collaboration Playbook and duplicate top-level `.ai` records have been consolidated into the numbered AI-EOS structure. Historical material is retained only where it adds useful evidence/context and is explicitly marked as legacy/reference.
