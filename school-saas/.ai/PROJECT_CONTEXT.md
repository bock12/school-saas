# Project Context

## Product

SchoolSaaS is a multi-tenant school-management platform for public visitors, super administrators, organization/school administrators, teachers, students, parents, applicants, and exam-office users.

## Verified baseline

| Area | Observed baseline |
|---|---|
| Application | Next.js 16.2.9 App Router, React 19, strict TypeScript |
| UI | Tailwind CSS 4 and shared React components |
| Data/auth | Supabase Auth/PostgreSQL/Storage, Supabase SSR clients, RLS |
| Additional data access | `pg` helpers under `src/lib/db` |
| Tenant model | Subdomain routing to `src/app/[tenant]`, organization/school hierarchy |
| Package manager | npm (`package-lock.json`) |
| Testing/CI | No visible automated suite or CI configuration in audited material |

Observed product domains include tenant/platform administration, admissions, students, parents, staff/HR, academics/curriculum, examinations, attendance, finance/billing/bursary, communications, transport, hostel, library, inventory, analytics, branding, and portals.

## Delivery posture

The enterprise audit identifies a sound multi-tenant foundation but substantial prototype/UI-only coverage. Route or navigation presence is not proof of real data binding, authorization coverage, or production readiness. Tenant-security evidence takes priority over feature breadth.

## Sources and conflicts

- `docs/enterprise-readiness-audit.md` is the audit evidence baseline.
- Root `AGENTS.md` and `CLAUDE.md` remain implementation instructions.
- `Implemenation plan.md` is a prior proposed data-binding plan; its spelling is preserved.
- Root `README.md` is still the default create-next-app README and does not describe the observed product. It is preserved; update it only in a separate approved documentation task.
- The prior plan says the database is empty while the audit describes an extensive migration foundation. Those can both be true if schema exists without tenant data; actual database occupancy remains unverified.
- Legacy hyphen-named `.ai` records overlap this requested underscore naming. ADR-0001 preserves them as reference while these underscore-named records are canonical.
