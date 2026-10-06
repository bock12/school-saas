# Module Status

## Classification model
- `FOUNDATION`: shared infrastructure exists; production verification incomplete.
- `OPERATIONAL_CANDIDATE`: implementation/data path exists but requires verification.
- `PARTIALLY_BOUND`: real-data/workflow evidence exists; incomplete paths remain.
- `PROTOTYPE`: route/UI exists with material mock, placeholder, demo, or coming-soon behavior.
- `UNASSESSED`: present but insufficiently inspected.
- `BLOCKED`: dependency/risk prevents safe progress.

These are evidence labels, not release approval.

| Module / boundary | Status | Evidence | Next action |
|---|---|---|---|
| Tenant routing, auth, guards, RLS foundation | FOUNDATION | Middleware, guards, clients, migrations; audit calls isolation a strength. | TASK-0001 verification. |
| Platform / tenant provisioning | OPERATIONAL_CANDIDATE | Public and super-admin routes/migrations present. | Review privileged provisioning and public exposure. |
| Admissions / applicants | PARTIALLY_BOUND | Routes/migrations; audit notes hardening work. | Verify auth, documents/files, real-data workflow. |
| Students, staff, parents, classes, subjects | PARTIALLY_BOUND | Routes/migrations; prior plan targets mock replacement. | Data bind after security baseline. |
| Academics / examinations | PARTIALLY_BOUND | Large route tree/migrations through engine phase 1. | Verify approval, grading integrity, roles. |
| Attendance | PARTIALLY_BOUND | Student/staff attendance route/migration evidence. | Verify write authority and duplication scope. |
| Billing / finance / bursary | UNASSESSED | Routes/migrations present; no end-to-end audit evidence. | Security/integrity assessment first. |
| Communications / notifications | PARTIALLY_BOUND | Routes and chat/communication migrations. | Review recipient scope, disclosure, abuse. |
| Transport / hostel / library / inventory / welfare / health | PROTOTYPE | Operational surfaces plus 108 prototype-signal pages. | Triage individually. |
| Analytics / reports / exports | PARTIALLY_BOUND | Analytics and CASS/export surfaces. | Review minimization, auth, audit, correctness. |
| Automated tests / CI / release verification | BLOCKED | No visible suite/CI; prior build `ENOSPC`. | Operational hardening. |
