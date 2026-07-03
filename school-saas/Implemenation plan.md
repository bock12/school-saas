# Phase 3: Real Data Binding

This phase replaces all static mock data (e.g., `demoStudents`) with real server-side queries from Supabase, protected by Row Level Security (RLS) to enforce tenant isolation.

## User Review Required

> [!WARNING]
> Because the database is currently completely empty, the pages will show "Empty States" (e.g., "No students found") once we wire up the real data. Are you okay with me building some basic generic Add/Create modals to allow us to insert data from the UI, or would you prefer I just write a seeder script to populate some dummy data into your Supabase database first so the UI isn't empty?

## Open Questions

None at this time.

## Proposed Changes

### Dashboard and Modules Data Fetching

#### [MODIFY] [page.tsx](file:///c:/Users/SAHR/OneDrive%20-%20DreamDay%20Technology/Documents/SchoolSaas/school-saas/src/app/%5Btenant%5D/(dashboard)/page.tsx)
- Remove `demoStats` and `demoActivities`.
- Initialize `const supabase = await createClient()`.
- Run parallel counts for `students`, `teachers`, `classes`, and `revenue` where `tenant_id` matches the current tenant.
- Fetch the latest 5 rows from `audit_logs` for the Recent Activity feed.

#### [MODIFY] [page.tsx](file:///c:/Users/SAHR/OneDrive%20-%20DreamDay%20Technology/Documents/SchoolSaas/school-saas/src/app/%5Btenant%5D/(dashboard)/students/page.tsx)
- Remove `demoStudents`.
- Fetch `students` joined with `classes` (if enrolled) and `profiles` (for email/user data).
- Update the Data Table to map the database row structure.

#### [MODIFY] [page.tsx](file:///c:/Users/SAHR/OneDrive%20-%20DreamDay%20Technology/Documents/SchoolSaas/school-saas/src/app/%5Btenant%5D/(dashboard)/teachers/page.tsx)
- Remove `demoTeachers`.
- Fetch `teachers` joined with `profiles` (for name, email, status).
- Update the UI to map the database row structure.

#### [MODIFY] [page.tsx](file:///c:/Users/SAHR/OneDrive%20-%20DreamDay%20Technology/Documents/SchoolSaas/school-saas/src/app/%5Btenant%5D/(dashboard)/classes/page.tsx)
- Remove `demoClasses`.
- Fetch `classes` joined with `teachers` (for the class teacher's name) and count of `class_enrollments`.

#### [MODIFY] [page.tsx](file:///c:/Users/SAHR/OneDrive%20-%20DreamDay%20Technology/Documents/SchoolSaas/school-saas/src/app/%5Btenant%5D/(dashboard)/subjects/page.tsx)
- Remove `demoSubjects`.
- Fetch `subjects` and the count of teachers assigned to teach them.

### Data Seeding / Creation (Pending Review)
- Depending on user feedback, either create a `seed.ts` script to generate a fake school, fake teachers, and fake students in the DB, OR implement the Server Actions and Form components for the "Add New" buttons across the application.

## Verification Plan

### Automated Tests
- Run `npm run build` to ensure no TypeScript type mismatches exist between the Supabase responses and the React components.

### Manual Verification
- Start the dev server.
- Verify the pages load without crashing (they should show empty states or seeded data).
