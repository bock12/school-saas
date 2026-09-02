# Development Roadmap

This roadmap is not implementation authorization; every item requires a scoped task and required human approval.

## Milestone G — Governance baseline
- [x] Canonical governance, authority, task/report/review, ADR, risk, module and security records.
- [ ] Human accepts ADR-0001 and operating model.

## Milestone 1 — Security and tenant boundaries
- [ ] Inventory service-role calls and protected APIs.
- [ ] Prove role authorization and cross-tenant RLS denial.
- [ ] Review public exposure and abuse controls.
- [ ] Remediate verified high/critical findings by separate approved tasks.

## Milestone 2 — Priority real-data binding
- [ ] Triage prototype modules.
- [ ] Bind students, staff, parents, admissions, classes/subjects, attendance, billing and audit logs to trusted data paths.
- [ ] Add usable empty/create flows and replace demo actions with validated server operations.

## Milestone 3 — Operational hardening
- [ ] Standardize migration execution and compensation/rollback procedure.
- [ ] Resolve build capacity and establish type/lint/test/migration/build gates.
- [ ] Add material privileged-action audit events and safe test-environment rules.

## Milestone 4 — Enterprise readiness
- [ ] Verify plan/feature quotas and storage/user/student limits.
- [ ] Design backup/export, retention/privacy, notification reliability and observability controls.

Security and tenant isolation outrank feature breadth.
