# Worked Example — Attendance Feature

## 1. Request
Human asks: add an attendance check-in feature for teachers.

## 2. ChatGPT architecture/supervision
ChatGPT inspects the attendance module, roles, student/class relationships, authentication, tenant isolation, UI patterns and testing setup, then creates an approved task contract.

## 3. Task
Acceptance criteria cover correct class/student/date/time recording, duplicate handling, authorization, tenant isolation, validation and required UI states.

## 4. Gemini/Antigravity implementation
Gemini reads the approved task and repository, implements only the approved scope, and runs proportionate checks.

## 5. Report
Gemini records exact files changed, tests/checks and limitations in `05-WORKFLOW/IMPLEMENTATION-REPORT.md`.

## 6. ChatGPT review
ChatGPT reviews the actual diff against acceptance criteria, architecture, authorization, tenant isolation, data integrity, UI behavior and tests.

## 7. Revision
Gemini addresses review findings and updates the report.

## 8. Human approval
ChatGPT records the review verdict. The human reviews the final diff and makes the merge/release decision.

This workflow applies to students, teachers, exams, fees, timetable, parent portals, communications, reports and other modules.
