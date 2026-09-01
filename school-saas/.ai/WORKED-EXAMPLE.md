# Worked Example — Attendance Feature

## Step 1 — Request

Human asks:

> Add an attendance check-in feature for teachers.

## Step 2 — Codex analysis

Codex inspects:
- Existing attendance module
- User roles
- Student model
- Class/enrollment relationships
- Authentication
- Tenant isolation
- Existing UI patterns
- Testing setup

Codex creates `TASK-0001`.

## Step 3 — Task

Acceptance criteria might include:
- Teacher can select a class.
- Teacher can identify a student.
- Check-in records correct student/class/date/time.
- Duplicate check-ins are handled safely.
- Unauthorized users cannot record attendance.
- UI has loading/error/success states.
- Tests cover important business rules.

## Step 4 — Gemini implementation

Gemini reads the task and repository, implements the feature, and runs checks.

## Step 5 — Report

Gemini records exact files changed and actual test results.

## Step 6 — Codex review

Codex checks:
- Acceptance criteria
- Authorization
- Tenant isolation
- Data integrity
- UI behavior
- Tests
- Code quality

If problems exist, Codex adds review findings.

## Step 7 — Revision

Gemini addresses each finding and updates the report.

## Step 8 — Approval

Codex marks the task approved for merge. Human reviews the final diff and merges it.

This same workflow can be reused for students, teachers, exams, fees, timetable, parent portals, communication, reports, and other modules.
